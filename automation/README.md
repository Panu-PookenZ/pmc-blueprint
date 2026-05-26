# automation/ — code that moves bits between systems

Two parallel halves:

- **`apps-script/`** — `.gs` files that run inside Google Apps Script projects bound to (or standalone for) specific Google Sheets and Google Drive folders. These produce the **change feeds** and the **footage index** that downstream sync skills consume.
- **`python/`** — standalone Python skeleton showing how a sync runner can consume an Apps Script change feed and write to Airtable. The real production house uses a Claude Code skill plugin for this — the plugin source is private but the underlying pattern is the same and the skeleton is portable.
- **`line-bot/`** — pattern doc for a daily digest bot (the production house uses a Line bot named "Hedwig" to push twice-daily summaries to a small leadership group).

## What ships in this repo

| File | Role | Required? |
|---|---|---|
| [`apps-script/sheet-change-tracker.gs`](apps-script/sheet-change-tracker.gs) | Producer Dashboard onEdit feed + `markStatus` web app | ★ Core |
| [`apps-script/editor-change-tracker.gs`](apps-script/editor-change-tracker.gs) | Editor's Calendar onEdit feed (queue model) | ★ Core |
| [`apps-script/footage-log-crawler.gs`](apps-script/footage-log-crawler.gs) | Daily Shared-Drive crawl → Footage Log Sheet | Optional (footage projects only) |
| [`python/sync-runner-example.py`](python/sync-runner-example.py) | Drain change feed → write to Airtable (skeleton) | Adapt to your stack |
| [`line-bot/digest-bot-pattern.md`](line-bot/digest-bot-pattern.md) | Twice-daily digest bot architecture | Optional |

## What does NOT ship

- The Claude Code skill plugin that actually runs the sync in production (private — replace with your own runner)
- The phased migration scripts (`phase-0-1-bootstrap.gs` through `phase-9-stage-color-bar.gs`) — these were one-shot bootstrap scripts for the original schema build and not needed for fresh installs
- Production deployment URLs, secrets, OAuth credentials (Keychain + `ScriptProperties` only)

## High-level wiring

```
┌──────────────────────────┐                  ┌───────────────────────┐
│ Producer Dashboard Sheet │                  │ Editor's Calendar     │
│  (humans edit per-EP)    │                  │  (humans edit stages) │
└────────────┬─────────────┘                  └──────────┬────────────┘
             │ onEdit                                    │ onEdit
             ▼                                           ▼
   ┌─────────────────────┐                     ┌────────────────────┐
   │ _Update Log tab     │                     │ _Update Log tab    │
   │ (append-only feed)  │                     │ (append-only feed) │
   └──────────┬──────────┘                     └──────────┬─────────┘
              │ status='pending'                          │ status='pending'
              ▼                                           ▼
   ┌────────────────────────────────────────────────────────────┐
   │  Your sync runner (Python skeleton / Claude skill / cron)  │
   │  - reads pending rows                                      │
   │  - writes to Airtable PMC base                             │
   │  - POSTs row IDs → markStatus web app to flip pending→synced│
   └─────────────┬──────────────────────────────────────────────┘
                 ▼
        ┌────────────────────┐
        │ Airtable PMC base  │   ←─── Demo: appIYEG4tZHqUhupQ (see airtable/README.md)
        │ 21 tables          │
        └────────────────────┘
                 ▲
                 │ separate path
   ┌─────────────┴────────────┐
   │ Shared Drive             │  →  footage-log-crawler.gs  →  Footage Log Sheet  →  (skill matches → Service Job.Footage Link)
   │ (footage tree)           │
   └──────────────────────────┘
```

## Setup checklist (per Apps Script project)

1. Open the target Google Sheet → **Extensions → Apps Script** (for bound scripts) OR create a standalone project at script.google.com.
2. Paste the `.gs` source into the editor's `Code.gs` file.
3. **Update the constants at the top of each file** to point at your own Sheet/Drive IDs (search for `<PRODUCER_DASHBOARD_SHEET_ID>`, `<EDITOR_CALENDAR_SHEET_ID>`, `<SHARED_DRIVE_ID>`, `<FOOTAGE_LOG_SHEET_ID>`).
4. Save (Cmd+S / Ctrl+S).
5. Run the `bootstrap` function once (for the trackers) — authorize OAuth scopes when prompted.
6. For the trackers — verify `onEditHandler` trigger was installed: **Triggers** (clock icon in sidebar) → see one entry.
7. For the footage crawler — add a daily time-driven trigger via **Triggers → Add trigger → footageLogCrawl** every day 3-4am.
8. For the `markStatus` web app (in `sheet-change-tracker.gs`) — see [docs/05-design-patterns/markstatus-web-app-pattern.md](../docs/05-design-patterns/markstatus-web-app-pattern.md) for the deploy walkthrough.

## Why Apps Script instead of a cloud function

- **Zero infrastructure** — runs inside Google Workspace, no servers, no IAM setup
- **onEdit is free** — Sheets fires the trigger automatically, no polling
- **Auth lives where the data is** — the script executes as the script owner, with the same access the owner has to the Sheet/Drive
- **Low ceiling, high floor** — fine for 30-person production house; would need Cloud Run for bigger volumes

The trade-off: per-execution time limit (6 min), per-day URL Fetch quota (~20k), no real version control without [clasp](https://github.com/google/clasp) (which the public repo doesn't depend on). For our scale, all acceptable.
