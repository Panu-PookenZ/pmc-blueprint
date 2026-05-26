# Sync pipeline

How edits in Google Sheets end up in Airtable, without polling.

## The big idea in one sentence

**Apps Script `onEdit` writes every cell change to a `_Update Log` tab; a runner drains the queue, writes to Airtable, then POSTs back to a `markStatus` web app to flip the rows from `pending` → `synced`.**

That's it. Everything below is detail on the four words: feed, drain, sync, flip.

## End-to-end flow

```
1. Human edits cell                  Producer types "Final" in PD Producer B!F19
   ─────────────────────             ────────────────────────────────────────────

2. onEditHandler fires               appendRow to _Update Log:
   ─────────────────────             ┌──────────────────────────────────────────┐
                                     │ timestamp | tab | cell | row | col | …  │
                                     │ field_name | old_value | new_value      │
                                     │ editor | status='pending'                │
                                     └──────────────────────────────────────────┘

3. Runner reads change feed          SELECT * FROM _Update Log WHERE status IN
   ─────────────────────             ('pending', 'deferred') LIMIT 200

4. Runner routes each change         tab="PD Producer B" + field_name="Status" →
   ─────────────────────              Airtable.Deliverables.Stage

5. Runner applies mutation           PATCH airtable.com/v0/{base}/{Deliverables}/
   ─────────────────────              rec... with {"Stage": "Final"}

6. Runner POSTs status flip          POST {markStatus} {"rows":[{"row":19,
   ─────────────────────              "newStatus":"synced"}]}

7. markStatus updates _Update Log    setValue('synced') at _Update Log!J19
   ─────────────────────              (column J is status)

8. Next run sees nothing pending     Clean exit. No work. Cheap.
   ─────────────────────
```

## Why this shape

### Why not poll-and-diff?

The naive sync runs every morning:
- Download each Sheet (~50KB-2MB)
- Diff against last morning's snapshot
- Push the diff

This breaks at scale because:
- Downloads cost minutes (limited by Drive API quota)
- Diffs cost CPU (worse as Sheet grows)
- You lose **intra-day** changes (Producer's evening fix isn't visible until next morning)
- Stale snapshot management is its own bug surface

Change feeds invert the cost: **work is proportional to the change set, not the dataset.** A morning with 3 edits costs 3-row work; a morning with 300 edits costs 300-row work; an empty morning costs 1 query and exit.

### Why a single `_Update Log` tab and not per-tab logs?

One queue, one ordering, one drain loop. Per-tab feeds would require per-tab drainers (more code paths) and ordering across tabs would be nondeterministic. With one log, the runner can choose its own ordering policy (most-recent-per-cell wins, etc.) deterministically.

### Why `status` column instead of watermark?

If the runner used `max(timestamp seen)` as a watermark, any row tagged `deferred` (blocked by a Hard Rule — e.g. duplicate Episode ID waiting on Producer to fix) would be permanently stranded the moment the watermark advanced past it. The runner would never see it again.

Status column + filter `status ∈ {pending, deferred}` re-evaluates deferred rows every run until they resolve. See [`docs/05-design-patterns/status-based-gate-not-watermark.md`](05-design-patterns/status-based-gate-not-watermark.md).

### Why `markStatus` as a separate web app?

The runner doesn't have direct write access to the Sheet. It has Airtable API access and HTTPS. So we expose a tiny Apps Script web app whose job is to receive a batched POST `{rows: [{row, newStatus}, …]}` and flip the cells. The web app runs as the Sheet owner, so it has write access; the runner runs as itself, with the shared secret as auth.

Side benefit: the web app **enforces a state machine** — it only flips from `pending`/`deferred`, never clobbers `synced` or `failed`. So a stale runner re-POSTing the same rows is idempotent and safe.

See [`docs/05-design-patterns/markstatus-web-app-pattern.md`](05-design-patterns/markstatus-web-app-pattern.md) for the deploy walkthrough + the curl/Python trap (curl drops POST body on Apps Script's 302 redirect — use Python).

## What the runner actually does (per change row)

```
for row in pending_or_deferred:
    target = resolve_target(row)               # (table, recordId) or None
    if target is None:
        flip(row, "skipped")                   # unknown field/tab/header
        continue

    mutation = compose_mutation(row, target)   # field-level mapping
    if mutation.value == current(target).value:
        flip(row, "skipped")                   # no-op
        continue

    if blocked_by_hard_rule(row):
        flip(row, "deferred")                  # try again next run
        continue

    try:
        airtable.patch(target, mutation)
        flip(row, "synced")
    except AirtableError as e:
        flip(row, "failed")
        log_to_sync_jobs("failed", error=str(e))
```

**Five outcomes per row**, each with a meaning:

| Status | Meaning | Re-evaluate next run? |
|---|---|---|
| `synced` | Mutation applied, Airtable updated | No (terminal) |
| `skipped` | No-op (already at target value, header diff, unknown field) | No (terminal) |
| `deferred` | Hard Rule blocked this row; try again | Yes |
| `failed` | API error / schema mismatch / etc. | No (terminal — needs operator) |
| `pending` | (initial state from onEdit) | Yes |

## Hard Rules (per-row blocking conditions)

A change is `deferred` rather than `failed` when a transient condition makes the change unsafe right now. Examples:

| Hard Rule | Meaning | Resolves when… |
|---|---|---|
| Episode ID dup in PD tab | 2 rows have same Episode ID (Apps Script auto-gen race) | Producer fixes one of them |
| Episode ID blank | Producer hasn't picked Episode Type yet | Producer picks one |
| Project ID blank in All Projects | New project row not yet committed | Producer fills Project Name |
| Producer/Director nickname unknown | Sheet has a nickname not in Team table | Admin adds the nickname or fixes spelling |

Each rule has a corresponding `deferred` reason in the runner's logging so operators can see why a row didn't move.

## Footage sync — separate path

Footage doesn't flow through `_Update Log`. It has its own pipeline:

```
1. Footage Log Crawler (Apps Script, daily 03:00 BKK)
   - Reads Shared Drive folder tree
   - Detects new / changed shoot folders
   - Writes one row per shoot folder to "Footage Log 2026" Sheet

2. footage-sync skill (daily 06:30 BKK)
   - Reads Footage Log Sheet
   - Matches shoot folders to Service Job records by:
     - Date + Production ID (if present in folder name)
     - Date + Show name (fuzzy fallback)
   - Writes Service Job.Footage Link
```

Why separate? Because the **input shape is different** (Drive folder tree, not cell edits) and the **match logic is different** (fuzzy matching on folder names, not field-level routing). Forcing it through `_Update Log` would add complexity without benefit.

## Scheduled runs

The production house runs ~10 overnight routines between 00:00 and 09:00 BKK:

| Time (BKK) | Routine | Source | Target |
|---|---|---|---|
| 00:00 | meeting-report-generator | Airtable Meetings | Notion (team-shareable report) |
| 01:00 | notion-context-mirror | iCloud files | Notion mirror |
| 03:00 | sheet-sync (Producer Dashboard) | Sheet _Update Log | Airtable PP+Deliverables |
| 03:00 | footage-crawler | Shared Drive | Footage Log Sheet |
| 04:00 | sheet-sync (Editor's Calendar) | Sheet _Update Log | Airtable Post Production Service |
| 05:00 | brief-analysis | Airtable PP (with Brief Link, no Research Link) | Notion Strategic Research |
| 06:00 | forward-sync (Service Job 30-day) | Calendar | Airtable Service Job |
| 06:30 | footage-sync | Footage Log Sheet | Airtable Service Job.Footage Link |
| 07:30 | system-audit (neo) | Airtable (full base) | Slack / Line alert |
| 09:00 | trello-intelligence | Trello board | Airtable Deliverables enrichment |
| 12:00 + 19:00 | meeting-intelligence | Drive transcripts | Airtable Meetings + related |

Routine *time slots are designed for overnight execution* so they don't compete with humans editing. The morning report shows what changed.

These are scheduled in the production house's Claude Code instance via `mcp__scheduled-tasks__*`. For your own implementation: cron + Python is fine; GitHub Actions on a schedule trigger also works.
