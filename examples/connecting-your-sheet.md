# Connecting your own Google Sheet to the change-feed pipeline

The PMC pattern's leverage comes from the **change feed** — `onEdit` writes every Sheet edit to a `_Update Log` tab, and a sync runner drains it into Airtable. This doc walks through wiring up a fresh Sheet to that pattern.

## What you'll have at the end

- Your own Google Sheet with humans editing per-Producer tabs
- An Apps Script trigger that auto-logs every cell change to a `_Update Log` tab
- A `markStatus` web app deployed for the sync runner to flip statuses back
- A configured Keychain (or equivalent secret store) holding the web app URL + shared secret

You will NOT yet have:
- A sync runner that actually moves data from `_Update Log` to Airtable (build that next — start from [`automation/python/sync-runner-example.py`](../automation/python/sync-runner-example.py))

## Prerequisites

- A Google Workspace account (the script needs to run as someone with edit rights to the Sheet)
- A Google Sheet where humans will edit production data
- 30 minutes for the first-time setup

## Step 1 — Prepare the Sheet

Your Sheet should have **at least** these tabs (names matter — Apps Script source references them):

| Tab name | Role | Columns |
|---|---|---|
| `All Projects` | 1 row per Production Project | Project ID, Project Name, Client, Brief Link, Producer, Director, Video Type, Note, etc. |
| `PD [Producer A]`, `PD [Producer B]`, etc. | 1 row per Deliverable, grouped by Producer | Project ID, Episode Type, Episode ID, Project Name, Director, Product Code, EP. label, Status, Cost Sheet, Timeline, Footage, Publish, Note |
| `Dir. [Director A]`, etc. | 1 row per Deliverable, Director's slice | Episode ID, Episode Type, Project Name, Producer, EP. label, Status, Storyline, Shooting Script, Rough Cut, Final Video, Footage, Director Note |

Or adapt to your team's naming. The Apps Script source is generic — it logs every cell change on every non-helper tab.

## Step 2 — Open the Apps Script editor

In your Sheet: **Extensions → Apps Script**. This creates a container-bound script for the Sheet.

## Step 3 — Paste the change-tracker source

Replace the default `Code.gs` with the contents of [`automation/apps-script/sheet-change-tracker.gs`](../automation/apps-script/sheet-change-tracker.gs).

⚠️ **If the file has non-ASCII characters** (Thai tab names, em-dashes, etc.) and you're using "Claude in Chrome" or a similar paste tool, the Apps Script editor may mangle them on paste. Workaround:

```bash
# Run on your local machine to pre-escape non-ASCII as \uXXXX
python3 -c "
src = open('sheet-change-tracker.gs').read()
escaped = ''.join(c if ord(c) < 128 else '\\\\u{:04x}'.format(ord(c)) for c in src)
print(escaped, end='')
" | pbcopy
```

Then paste — the editor's JavaScript engine will interpret the `\u` escapes back to the right characters.

## Step 4 — Configure the SHEET_ID constant

Near the top of `Code.gs`:

```javascript
const SHEET_ID = '<PRODUCER_DASHBOARD_SHEET_ID>';
```

Replace with your Sheet's ID (from the URL — `docs.google.com/spreadsheets/d/{SHEET_ID}/edit`). For container-bound scripts (Extensions → Apps Script), this is a fallback; `SpreadsheetApp.getActive()` is preferred.

## Step 5 — Run `bootstrap` once

In the Apps Script editor:
1. Function picker dropdown (top): pick `bootstrap`
2. Click ▶ **Run**
3. **Authorize** when prompted — review scopes (spreadsheet + trigger), accept
4. Check the Execution log — should say "Bootstrap done. Edit any cell on a producer/director tab to test."

This creates:
- A `_Update Log` tab (hidden by default)
- An installable `onEdit` trigger bound to your Sheet

## Step 6 — Verify the trigger works

Go back to your Sheet → edit any cell on a tab that's NOT in `SKIP_TABS` (default: `['_Update Log', '_EPs', '_Users']`).

Then unhide the `_Update Log` tab (right-click any tab → Show all hidden sheets, or click the bottom-left menu → Hidden Sheets → `_Update Log`).

You should see one row appended:

| timestamp | tab | cell | row | col | field_name | old_value | new_value | editor | status |
|---|---|---|---|---|---|---|---|---|---|
| 2026-MM-DD HH:MM:SS | PD Producer A | F19 | 19 | 6 | Product Code |  | QU-1234 | you@example.com | pending |

If that's there → onEdit is wired correctly. 🎉

## Step 7 — Deploy the markStatus web app

Now for the second half: the sync runner needs to be able to flip `status='pending'` to `synced` / `deferred` / etc. The `markStatus` function in the same `sheet-change-tracker.gs` is a web app endpoint that does this.

1. In Apps Script editor: **Deploy → New deployment**
2. Type: **Web app**
3. Description: `markStatus endpoint v1`
4. Execute as: **Me** (the Sheet owner)
5. Who has access: **Anyone**

   The endpoint is gated by a shared secret in the POST body — see why "Anyone" is OK in [the pattern doc](../docs/05-design-patterns/markstatus-web-app-pattern.md#deploy-steps).

6. Click **Deploy**, approve OAuth scopes
7. **Copy the Web app URL** — looks like `https://script.google.com/macros/s/AKfycb.../exec`

## Step 8 — Set the shared secret

Generate a random 32-byte hex string:

```bash
openssl rand -hex 32
# → 40bf61c53f923b0d60d16258162058f79af2e75333d6aeb7839bc7edd35f7362
```

In Apps Script: **Project Settings (gear icon) → Script Properties → Add property**
- Property: `MARK_STATUS_SECRET`
- Value: (paste the hex string)
- **Save script properties**

## Step 9 — Store URL + secret in your runner's credential store

On the machine where the sync runner will run:

```bash
# macOS Keychain example
security add-generic-password -a "pmc-sheet-sync" -s "markstatus-url" \
  -w "<the-web-app-URL>" -U
security add-generic-password -a "pmc-sheet-sync" -s "markstatus-secret" \
  -w "<the-secret-hex>" -U
```

For Linux: use `pass` or environment-mounted secrets.
For containers / CI: use the platform's secret manager (Vault, AWS SM, etc.).

## Step 10 — Smoke test the endpoint (use Python, NOT curl)

```bash
URL="$(security find-generic-password -a 'pmc-sheet-sync' -s 'markstatus-url'    -w)"
SECRET="$(security find-generic-password -a 'pmc-sheet-sync' -s 'markstatus-secret' -w)"
export URL SECRET

python3 << 'EOF'
import urllib.request, json, os, ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(
    os.environ['URL'],
    data=json.dumps({"secret": os.environ['SECRET'], "rows": []}).encode('utf-8'),
    headers={"Content-Type": "application/json"},
    method='POST',
)
with urllib.request.urlopen(req, timeout=30, context=ctx) as resp:
    print(resp.status, resp.read().decode('utf-8'))
EOF
# Expected: 200 {"ok":false,"error":"rows[] required (non-empty)"}
```

If you see `unauthorized` instead — secret mismatch. Re-pull from Keychain and Script Properties; they have to match exactly.

If you see HTML 405 / 411 — you used curl instead of Python. [Don't do that](../docs/05-design-patterns/markstatus-web-app-pattern.md#smoke-test--use-python-not-curl).

## Step 11 — (Optional) Add the footage log crawler

If your business has a shoot footage pipeline that should populate `Deliverable.Footage Link`:

1. Open a separate Sheet that will be your **Footage Log** (or use a tab on the same Sheet)
2. Open Apps Script → paste [`automation/apps-script/footage-log-crawler.gs`](../automation/apps-script/footage-log-crawler.gs)
3. Edit the constants: `SHARED_DRIVE_ID`, `SHEET_ID`, `OUTLET_WHITELIST`
4. Add the Advanced Drive Service (Apps Script editor → Services → +Drive v3)
5. Run `footageLogCrawl` once to authorize + verify
6. Add a daily time-driven trigger: **Triggers → +Add trigger** → `footageLogCrawl` → daily 03:00-04:00

## What you have now

✅ Sheet edits write to `_Update Log` automatically
✅ `markStatus` endpoint deployed and authenticated
✅ Keychain populated with URL + secret
✅ (Optional) Footage Log Sheet crawling Shared Drive daily

## What's still missing

❌ **A sync runner that reads `_Update Log` and writes to Airtable** — that's your custom build.

Start from [`automation/python/sync-runner-example.py`](../automation/python/sync-runner-example.py). The skeleton has the right shape — read the change feed → route by `(tab, field_name)` → mutate Airtable → POST batched status flips to `markStatus`. You'll need to:

1. Implement `read_update_log()` to actually query the Sheet (use `gspread` or the Sheets API)
2. Implement `route_change()` with your field mapping (see [`docs/04-sync-pipeline.md`](../docs/04-sync-pipeline.md))
3. Implement `apply_mutation()` to PATCH Airtable (use `pyairtable` or raw requests)
4. Schedule it (cron / GitHub Actions / Cloud Run / Claude Code skill — your choice)

Once the runner runs and writes to Airtable + flips statuses, you have the full PMC pattern working end-to-end against your own Sheet + Airtable.

Welcome to PMC. Take it from here.
