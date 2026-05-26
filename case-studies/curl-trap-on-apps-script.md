# Case study — the curl trap on Apps Script web apps

> **TL;DR:** When the markStatus endpoint was first deployed, we burned 30 minutes debugging "405 Method Not Allowed" and "411 Length Required" before realizing the problem wasn't auth, wasn't the secret, wasn't the deployment — it was curl. Apps Script web apps return a 302 redirect that curl mishandles for POST in 3 distinct ways. Python `urllib.request` works clean. **Always use Python.**

## The setup

We had just deployed the `markStatus` web app (the endpoint that flips `_Update Log.status` from `pending` to `synced`). Deployment ID generated, Script Property set, Keychain populated.

First smoke test — the one any reasonable engineer would write:

```bash
URL="$(security find-generic-password -a 'pmc-sheet-sync' -s 'markstatus-url'    -w)"
SECRET="$(security find-generic-password -a 'pmc-sheet-sync' -s 'markstatus-secret' -w)"
curl -sS -X POST "$URL" \
  -H 'Content-Type: application/json' \
  --data "$(jq -n --arg s "$SECRET" '{secret:$s, rows:[]}')" \
  | jq
```

Expected: `{"ok": false, "error": "rows[] required (non-empty)"}` (because we sent empty rows array — the endpoint's own validation should kick in).

Got: `jq: parse error: Invalid numeric literal at line 1, column 10` — non-JSON response.

## What was actually happening

Apps Script web apps live on a CDN edge at `script.google.com/macros/s/.../exec`. When you POST, the edge returns a `302 Found` to the actual sandboxed execution URL at `script.googleusercontent.com/macros/echo?user_content_key=...`.

curl's default behavior on a 302 is **do not follow** unless you pass `-L`. So:

```
curl -X POST → 302 → curl exits, no body
```

Add `-L`:

```
curl -L -X POST → 302 → curl follows with GET → 405 Method Not Allowed
                  (the redirect target only accepts HEAD/GET)
```

Try `--post301 --post302` to preserve POST:

```
curl -L --post301 --post302 -X POST → 302 → curl re-POSTs → 411 Length Required
                  (curl didn't re-send Content-Length cleanly)
```

Try `--location-trusted --data-binary @-`:

```
Same 411.
```

After 30 minutes of flag-tweaking, switch to Python:

```python
import urllib.request, json, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
req = urllib.request.Request(
    URL,
    data=json.dumps({"secret": SECRET, "rows": []}).encode('utf-8'),
    headers={"Content-Type": "application/json"},
    method='POST',
)
with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
    print(resp.status, resp.read().decode('utf-8'))
```

Output: `200 {"ok":false,"error":"rows[] required (non-empty)"}` ✅ on the first try.

## Why Python works and curl doesn't

`urllib.request.urlopen` follows the 302 by constructing a fresh `Request` object for the redirected URL with the original method + headers + body intact. curl's redirect handling tries to be clever about preserving fewer pieces (especially Content-Length) and gets it wrong on multi-host redirects.

This isn't a curl bug exactly — it's an interaction between curl's defaults and Apps Script's redirect topology. Other clients (Python requests, Node fetch, Go net/http) all handle it correctly.

## The cost we paid

- 30 minutes debugging
- 30 minutes adding documentation so the next person doesn't waste 30 minutes
- 1 update to the SKILL.md prompt + 1 update to the reference doc + 1 case study (this file)

In hindsight: cheap. The right reaction to "this curl invocation is fighting me" is to switch HTTP clients, not flag-tweak. But absent prior knowledge, the curl flag rabbit hole is tempting.

## The fix in the repo

- [`automation/apps-script/sheet-change-tracker.gs`](../automation/apps-script/sheet-change-tracker.gs) `doPost` returns proper JSON via `ContentService.createTextOutput`. The 302 isn't from `doPost` itself — it's from the Apps Script runtime around it.
- [`docs/05-design-patterns/markstatus-web-app-pattern.md`](../docs/05-design-patterns/markstatus-web-app-pattern.md) → explicit warning + working Python snippet
- [`automation/python/sync-runner-example.py`](../automation/python/sync-runner-example.py) → `flip_statuses()` uses Python urllib
- [`examples/connecting-your-sheet.md`](../examples/connecting-your-sheet.md) → Step 10 smoke test uses Python

## The lesson, framed generally

**When integrating with a service that returns redirects, your HTTP client choice matters more than you think.** curl is the lingua franca of "is this endpoint reachable" but it's not the lingua franca of "is this endpoint correctly handling my POST." For anything beyond GET-and-assert, prefer a real HTTP library in a real programming language.

Corollary: **smoke tests should match what the production code does**. If your runner is Python, smoke-test in Python. If your runner is Node, smoke-test with `fetch`. Don't smoke-test in curl just because it's the muscle-memory default.

---

**Related:**
- [Pattern: markStatus web app](../docs/05-design-patterns/markstatus-web-app-pattern.md) — the design this incident validated
- [Pattern: status-based gate](../docs/05-design-patterns/status-based-gate-not-watermark.md) — why we need the endpoint in the first place
