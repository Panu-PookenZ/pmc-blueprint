# `markStatus` web app pattern

> **A tiny Apps Script web app endpoint that the sync runner POSTs to in order to flip `_Update Log.status` cells in the Sheet from `pending`/`deferred` to `synced`/`skipped`/`failed`/`deferred`. The runner can't write to the Sheet directly; the web app runs as the Sheet owner and is the bridge.**

## Why we need it

The sync runner has:
- Airtable API access (PAT) — full read+write on the base
- HTTPS to anywhere

The sync runner does NOT have:
- Direct write access to the Sheet (would require OAuth + service account permission grants, more setup than necessary)

After the runner reads the `_Update Log`, processes rows, and PATCHes Airtable, **it needs to flip the `_Update Log.status` cells** so the same rows aren't re-processed next run. Without that, the runner re-evaluates the same `pending` rows forever and the log grows unbounded.

Solution: a tiny Apps Script web app that:
- Runs as the Sheet owner (panu.w@example.com)
- Has full write access to the Sheet (inherited)
- Exposes a single `doPost` endpoint
- Authenticated via a shared secret in the POST body
- Idempotent — it's safe to re-POST the same rows

## The endpoint contract

```
POST <web-app-url>
Content-Type: application/json

{
  "secret": "<32-byte-hex>",
  "rows": [
    {"row": 19, "newStatus": "synced"},
    {"row": 20, "newStatus": "deferred"},
    {"row": 21, "newStatus": "skipped"},
    {"row": 22, "newStatus": "failed"}
  ]
}
```

- `row` = the **1-indexed Sheet row number** in the `_Update Log` tab (matches `range.getRow()` when the row was originally written by `onEdit`)
- `newStatus` ∈ `{synced, deferred, failed, skipped}`
- One batched POST per run, NOT one per row (Apps Script URL Fetch quota is ~20k/day)

Response:

```json
{ "ok": true, "flipped": 3, "skipped": 1 }
```

Or on error:

```json
{ "ok": false, "error": "unauthorized" }
```

## Idempotency / state machine

The web app enforces a small state machine on the Sheet side:

```
pending  ─POST(synced)──► synced (terminal)
pending  ─POST(skipped)─► skipped (terminal)
pending  ─POST(deferred)► deferred
deferred ─POST(synced)──► synced
deferred ─POST(skipped)─► skipped
deferred ─POST(deferred)► deferred  (no-op)
synced   ─POST(anything)► no-op (don't clobber terminal)
failed   ─POST(anything)► no-op (don't clobber terminal — operator must fix manually)
```

This means: **re-POSTing the same rows is safe.** If a stale runner sends `synced` again for an already-synced row, it's a no-op (counted as `skipped` in the response). If a runner crashes mid-batch and retries, only the unsynced subset gets flipped.

## Source ([`automation/apps-script/sheet-change-tracker.gs`](../../automation/apps-script/sheet-change-tracker.gs))

The `doPost` function is at the bottom of `sheet-change-tracker.gs`. It's ~80 lines and handles:
- Empty body check
- JSON parse
- Auth check (ScriptProperty `MARK_STATUS_SECRET` vs `body.secret`)
- Schema validation (rows is non-empty array, each row has integer `row >= 2`, each `newStatus` in allowed set)
- Reads current status of all targeted rows
- Applies the state machine
- Returns `{ok, flipped, skipped}` or `{ok: false, error}`

## Deploy steps

1. Open the Sheet → **Extensions → Apps Script** → paste `sheet-change-tracker.gs` source
2. **Deploy → New deployment → Type: Web app**
3. **Execute as:** Me (the Sheet owner)
4. **Who has access:** Anyone (yes, fully open — the secret in the body is the actual auth)
5. **Click Deploy**, approve OAuth scopes
6. Copy the deployment URL (looks like `https://script.google.com/macros/s/AKfycb.../exec`)
7. In Apps Script editor: **Project Settings → Script Properties → Add property**
   - Key: `MARK_STATUS_SECRET`
   - Value: a random 32-byte hex string (`openssl rand -hex 32`)
8. Save the URL + secret in macOS Keychain on the runner's host:

```bash
security add-generic-password -a "pmc-sheet-sync" -s "markstatus-url"    -w "<URL>"    -U
security add-generic-password -a "pmc-sheet-sync" -s "markstatus-secret" -w "<SECRET>" -U
```

## Smoke test — use Python, NOT curl

⚠️ **Apps Script web apps return a 302 redirect** to a `script.googleusercontent.com` URL where the actual execution happens. **curl mishandles this redirect for POST in 3 distinct ways** (verified live 2026-05-26):

| curl invocation | Failure |
|---|---|
| `curl -X POST` | 302 not followed |
| `curl -L -X POST` | follows with default GET → 405 Method Not Allowed |
| `curl -L --post301 --post302 --data ...` | re-POSTs but body lost → 411 Length Required |
| `curl --http1.1 -L --location-trusted --data-binary @-` | same 411 |

**Python `urllib.request.urlopen` follows the redirect correctly** with the body intact:

```bash
URL="$(security find-generic-password -a 'pmc-sheet-sync' -s 'markstatus-url'    -w)"
SECRET="$(security find-generic-password -a 'pmc-sheet-sync' -s 'markstatus-secret' -w)"
export URL SECRET

python3 << 'EOF'
import urllib.request, json, os, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE  # macOS Python often lacks CA bundle; disable for smoke test

req = urllib.request.Request(
    os.environ['URL'],
    data=json.dumps({"secret": os.environ['SECRET'], "rows": []}).encode('utf-8'),
    headers={"Content-Type": "application/json"},
    method='POST',
)
with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
    print(resp.status, resp.read().decode('utf-8'))
EOF
# expect: 200 {"ok":false,"error":"rows[] required (non-empty)"}
```

Then with a bad secret:

```python
data=json.dumps({"secret": "wrong", "rows": [{"row": 2, "newStatus": "synced"}]}).encode('utf-8')
# expect: 200 {"ok":false,"error":"unauthorized"}
```

## Failure modes + recovery

| Symptom | Cause | Fix |
|---|---|---|
| HTML page "ไม่พบเพจ" / "Page not found" | curl unwrapped 302 → GET → 405 | Switch to Python |
| `{"ok": false, "error": "unauthorized"}` | Secret mismatch | Re-pull secret from Keychain; verify ScriptProperty in editor |
| `{"ok": false, "error": "server not configured"}` | ScriptProperty missing | Add `MARK_STATUS_SECRET` via Project Settings UI |
| HTML 403 page | Deployment access too restrictive | Re-deploy with "Anyone" (not "Anyone with Google account") |
| 411 Length Required | curl dropped body on redirect | Switch to Python |
| `{"ok": true, "flipped": 0, "skipped": N}` | All rows already at target | Expected — idempotent re-run |
| Runner crashes mid-batch | Network glitch | Re-run; state machine makes it safe |

## Quota + cost

- 1 GET per targeted row (reads current status)
- 1 setValue per flipped row (writes new status)
- For typical run (≤50 rows) that's ~100 cell ops, well within Apps Script's free-tier
- If a run exceeds 200 rows in one POST, chunk into 200-row batches

The Apps Script URL Fetch quota is the bigger constraint: ~20k requests/day. As long as the runner POSTs **once per run** (not once per row), even hourly runs use < 100 POSTs/day. Fine.

## Why not OAuth on the runner instead of a web app

We considered OAuth on the runner with Google Sheets API write scope:
- Pros: no web app to deploy
- Cons: OAuth setup is involved, requires service account JSON, requires the runner host to maintain refresh tokens, gives the runner broader access than needed

The web app approach gives the runner exactly the access it needs (flip cells in one tab), nothing more. The shared secret + state machine make it safe. Simpler ops.

## Related patterns

- [`status-based-gate-not-watermark.md`](status-based-gate-not-watermark.md) — why we need to flip statuses at all
- [`automation/apps-script/sheet-change-tracker.gs`](../../automation/apps-script/sheet-change-tracker.gs) — full source including `doPost`, `setMarkStatusSecret`, `checkMarkStatusSecret`, `truncateLog_` (status-aware)
