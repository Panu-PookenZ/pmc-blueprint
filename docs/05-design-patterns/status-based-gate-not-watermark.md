# Status-based gate, not a watermark

> **The sync runner reads change-feed rows where `status ∈ {pending, deferred}`. It never uses a `max(timestamp)` watermark. Deferred rows are re-evaluated every run until they resolve.**

## The bug this prevents

Naive change-feed runners use a **watermark**:

```python
# DON'T DO THIS
last_seen_ts = read_state_file()
new_rows = read_log(where=lambda r: r.timestamp > last_seen_ts)
for row in new_rows:
    process(row)
update_state_file(new_max_ts)
```

This breaks the moment a row can't be processed *yet*. Suppose Producer types something half-finished into the Sheet — the `onEdit` writes the row with `status='pending'`, the runner sees it, but it's blocked by a Hard Rule (e.g. duplicate Episode ID, half-committed row, unknown Producer nickname). What should the runner do?

With a watermark:
- Option A: skip the row and advance watermark — **the deferred row is gone forever**, no future run will revisit it
- Option B: don't advance watermark — **the entire log past that row is now blocked** behind one bad row

Both options are wrong. Both happened in early versions of the runner.

## The fix: explicit `status` column

The `_Update Log` tab in the Sheet has a `status` column with five states:

| Status | Meaning | Runner re-evaluates? |
|---|---|---|
| `pending` | Just written by `onEdit`; not yet processed | Yes |
| `synced` | Mutation applied successfully | No (terminal) |
| `skipped` | No-op (already at target, header diff, unknown field) | No (terminal) |
| `deferred` | Blocked by a Hard Rule — try again | Yes |
| `failed` | API error / unrecoverable | No (terminal; operator must intervene) |

The runner filters `status ∈ {pending, deferred}` every run. Deferred rows get a fresh evaluation against current Sheet + Airtable state. Most resolve on the next run (the Producer fixed their dup Episode ID overnight; the Hard Rule no longer fires).

## The incident this fixed (real war story)

**2026-05-22 15:39 BKK** — Producer added 4 new EPs to PP-26-025 with a duplicate Episode ID across two of them. `onEdit` wrote 4 rows with `status='pending'`. The runner saw the dup-ID Hard Rule fire on 2 rows, deferred all 4 (to be safe), and advanced its watermark past them.

**2026-05-22 → 2026-05-25** — runner advanced watermark every morning. The 4 deferred rows were past it forever. The Producer didn't notice — Airtable looked stale but she trusted the system.

**2026-05-25** — discovered during a routine audit. **3 days of deferred work silently lost.** Manual cleanup required: backfilling Episode IDs in Airtable for the 4 EPs, re-syncing other Sheet edits that happened in the interim.

**The fix** — replaced watermark with status-based filter, deployed an Apps Script web app (`markStatus`) to let the runner flip statuses after processing. Now every deferred row is re-evaluated until it resolves.

## How the runner flips the status back

The runner reads Airtable + Google Sheets API. It has read+write to Airtable but **doesn't directly write to the Sheet** (separate permission scope, easier to keep contracts narrow). So after processing each row, the runner POSTs to an Apps Script web app called `markStatus`:

```python
# After mutations applied + outcomes determined for each row:
flips = [
    (row.sheet_row, "synced"),
    (row.sheet_row, "deferred"),  # didn't resolve this run; try next time
    (row.sheet_row, "skipped"),
    (row.sheet_row, "failed"),
]
result = post_to_markstatus(flips)  # batched, one POST per run
# Apps Script web app: setValue('synced') at _Update Log!J<row>
```

See [`markstatus-web-app-pattern.md`](markstatus-web-app-pattern.md) for the web app implementation.

## Why this isn't "just" a transactional queue

Looks similar to SQS / RabbitMQ / etc. But there are real differences:

- **No persistent message broker.** The "queue" is just a tab in a Google Sheet. Simpler ops; no infra to maintain.
- **No visibility timeout.** A "deferred" row is visible to every run — but the state machine in `markStatus` prevents a stale runner from clobbering a successfully-synced row.
- **No dead-letter queue.** Failed rows just sit at `failed` status until an operator intervenes (manual edit in the Sheet, or a one-shot recovery script).
- **No retries with backoff.** Every run re-evaluates every deferred row. For our volume (<200 deferred at any time) this is fine. At higher scale you'd add per-row retry metadata.

In short: a poor-man's queue that fits the production house's scale (~30 staff, ~50 active projects, <500 changes per day).

## Hard Rule conditions (what triggers `deferred`)

| Hard Rule | Resolves when… |
|---|---|
| Episode ID duplicate in a PD tab | Producer fixes one of the dup rows |
| Episode ID blank in PD col C | Producer picks the Episode Type (auto-gen runs) |
| Project ID blank in All Projects col A | Producer fills Project Name (auto-gen runs) |
| Producer nickname unknown | Admin adds the nickname to the Team table |
| Director nickname unknown | Admin adds the nickname or fixes spelling |
| Footage Folder URL is a Drive link but not a folder | Producer fixes the link (or accepts it as a file link) |

Each rule has a stable error code so the runner can log "row N is deferred because <rule>" and operators can see the backlog by reason.

## What's NOT a Hard Rule (would crash instead)

| Condition | Why crash instead of defer |
|---|---|
| Sheet PID conflicts with Airtable PID (different non-blank values) | Data integrity issue — abort and escalate, not retry |
| Sheet header row mutated (column moved/renamed) | Schema drift — must be fixed before continuing |
| Airtable API auth failure | Infra issue — runner stops the whole run |
| Markdown table can't be parsed | Bug in upstream — fail loudly |

Defer-vs-fail is a real design choice. Defer = "this might fix itself if I wait." Fail = "this needs a human now."

## Cost of this pattern

- **Web app deploy is one-time setup** — see [`markstatus-web-app-pattern.md`](markstatus-web-app-pattern.md). Pain on day 1, fine forever after.
- **Truncation has to be status-aware too** — when the Sheet's `_Update Log` tab approaches its row cap (we use 500), the truncator must NOT delete deferred/failed rows. See [Defect 1C in the runbook](status-based-gate-not-watermark.md#defect-1c-status-aware-truncation).
- **No automatic cleanup of stale `failed` rows** — operator has to triage. Acceptable for our volume.

## Defect 1C — status-aware truncation

Once you have status-based gates, the Sheet's `_Update Log` tab still has a row cap (500 rows in our case, to keep it scannable). When new edits push the count past 500, the Apps Script truncator deletes oldest rows.

**Naive truncation:** `deleteRows(2, overflow)` — delete oldest N body rows. This is fine for `synced`/`skipped` rows (they're done; no need to keep history) but **silently drops `deferred`/`failed` rows** that haven't been processed yet.

**Status-aware truncation:**

```javascript
function truncateLog_(tab) {
  const overflow = tab.getLastRow() - 1 - MAX_LOG_ROWS;
  if (overflow <= 0) return;

  const statusCol = HEADER_ROW.indexOf('status') + 1;
  const statuses = tab.getRange(2, statusCol, tab.getLastRow() - 1, 1).getValues();
  const REMOVABLE = { synced: 1, skipped: 1 };  // only delete terminal-success rows

  const toDelete = [];
  for (let i = 0; i < statuses.length && toDelete.length < overflow; i += 1) {
    if (REMOVABLE[statuses[i][0]]) toDelete.push(i + 2);
  }
  toDelete.reverse();  // bottom-up so row numbers stay valid
  toDelete.forEach(r => tab.deleteRows(r, 1));

  if (toDelete.length < overflow) {
    Logger.log('⚠️ _Update Log over cap by ' + (overflow - toDelete.length) +
               ' rows, no more synced/skipped rows to remove. Triage deferred/failed.');
  }
}
```

If the log fills up with deferred/failed rows (operator hasn't been triaging), it just grows past `MAX_LOG_ROWS` and logs a warning. **Better to grow past cap than to silently drop work.**
