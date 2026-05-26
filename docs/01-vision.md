# Why PMC exists

A video production house has a particular shape of problem. This doc walks through the shape and the choices PMC makes in response.

## The shape of the work

A production house ships **discrete projects** at high cadence to a **small number of recurring clients** (and a long tail of one-offs). Each project has:

- A **brief** (sometimes a deck, sometimes a meeting, sometimes a Line message)
- A **quote** (Cost Sheet) before work starts — itemized: video, photo, album, BTS, etc.
- A **timeline** (PPM date, shoot dates, edit milestones, publish date)
- **N deliverables** (episodes, cuts, shorts, album, BTS reel) — each with its own lifecycle
- A **shoot crew** (videographer, sound, lights, switcher) booked per shoot day
- An **edit queue** through 4-6 stages (rough cut → V1 → V2 → final → published)
- An **actual cost** (footage cards bought, freelancers paid, locations rented, food, transport) tracked by accounting separately from the original quote
- A **post-mortem** (sometimes) and a **published margin**

The same studio also runs **recurring shows** (weekly podcasts, daily news desks) that aren't projects in the discrete sense — they're production lines with fixed crews and rolling deliverables.

Across all of this, the staff is split into specialist roles — **Producer** (budget owner, client liaison), **Director** (creative owner per project), **Editor** (post-production owner per deliverable), **Cinematographer / Sound / Switcher / Lighting** (crew, booked per shoot), **Assistant Editor** (proxy generation, color round-trips), **Accountant** (the source of truth for actual spend) — and each role naturally wants to see a different slice of the same project.

## The natural failure modes

Without a system, you get all of:

1. **Spreadsheet sprawl.** Every Producer maintains their own Sheet. Every Director maintains their own. Editor has a separate calendar Sheet. Accountant has a separate spend file. Nobody has the full picture.
2. **Status amnesia.** "Where's that project?" requires 3 Slack messages and a glance at a Drive folder before anyone can answer.
3. **Cost surprise.** The quote was 800k. The accountant closes the books and discovers actual was 920k. Project posted a loss; nobody noticed for 3 months.
4. **Schema drift.** Someone renames a column in the Producer Sheet. Last week's report-generation script breaks silently. Next Monday's report has stale numbers; nobody catches it for two weeks.
5. **Stage confusion.** Director marks an EP as "V2 sent." Editor sees it as "still V1." Producer sees neither — she thinks it's done.
6. **Crew double-booking.** Two Producers each book the same Cinematographer for the same Saturday. The cinematographer finds out at 7am.
7. **Briefs ungrokked.** Brief arrives Friday evening. Director starts on it Monday — and discovers half the requirements were in the second deck which was sent in a separate email thread.

PMC is the design that minimizes each of these. Not by adding more spreadsheets — by **moving the truth out of spreadsheets into a structured store**, while keeping the spreadsheets as the **editing surface**.

## The five design tenets

PMC's design rests on five non-negotiable tenets. Every later trade-off references at least one of them.

### 1. Airtable holds the truth; Sheets stay as the workspace

The team has spent years editing Sheets. They are fast at it. They use keyboard shortcuts. They paste from email into them. **Moving the team off Sheets is a non-starter** — the cost of retraining and the resistance both make any "let's just use [tool X]" plan fail in week 2.

So: keep Sheets as the workspace surface. Make Airtable invisible to most of the team. Build the bridge.

### 2. One change feed, not N polls

The naive bridge is: every morning, the sync runner downloads each Sheet, diffs it against last morning's snapshot, and pushes the diff. This breaks the moment a Sheet grows past a few hundred rows (downloads cost minutes, diffs cost CPU, and quotas bite).

Instead, **Apps Script `onEdit` writes every cell change to a single `_Update Log` tab in the Sheet itself**. The sync runner reads only that one tab and drains rows tagged `pending`. Bandwidth is constant in the size of the change set, not the size of the Sheet.

See [`docs/04-sync-pipeline.md`](04-sync-pipeline.md) for the full architecture.

### 3. Money is its own gravity

Most production-management tools bolt cost tracking on as an afterthought. The result: cost data lives in finance and operational status lives in PM, and you can never join the two without exporting CSVs.

PMC puts money next to operations at the schema level. **Project Cost Sheets** and **Cost Sheet Items** are first-class tables, linked one-to-many to Production Projects and many-to-one to Deliverables. The Items table carries an `Item Type` discriminator (Video / Photo / Album / Spot) so margin can be sliced by deliverable type per project.

The **Cost Sheet-first principle** is enforced at the routing layer: a Producer cannot tag a PP record with a Product Code from a Sheet — only the budget-sync skill can populate it, and only after a matching Cost Sheet record is in Airtable. Placeholder codes used to cause real cross-client data errors; the principle eliminates that class.

See [`docs/05-design-patterns/cost-sheet-first-principle.md`](05-design-patterns/cost-sheet-first-principle.md).

### 4. Status is durable, watermarks lie

An obvious bug pattern: "we already processed up to timestamp T, so just re-scan from T forward." This loses work the moment a row was tagged `deferred` (blocked by a transient condition, e.g. a duplicate Episode ID waiting on the Producer to repick) — the deferred row never gets processed once the watermark advances past it.

PMC's `_Update Log` carries an explicit `status` column. The runner reads rows where `status ∈ {pending, deferred}` and re-evaluates them every run. A separate web app endpoint (`markStatus`) flips them to `synced` / `failed` / `deferred` / `skipped` after handling. Watermarks are nowhere in the design.

See [`docs/05-design-patterns/status-based-gate-not-watermark.md`](05-design-patterns/status-based-gate-not-watermark.md).

### 5. One QU = one PP (one quote = one project)

Cost Sheets carry a Quotation Number (QU-XXXX). Each Production Project record carries the same QU. **The QU is the join key between money and operations**, and the relationship is **strictly 1:1 at the project level**. A package of work (multiple deliverables under one quote) is one PP record. Each individual deliverable carries the same parent QU with a suffix.

This rule eliminated a class of bugs where producers tried to be clever and create multiple PP records under the same QU. It also makes the rollups (cost vs. actual, margin per project) trivially correct.

See [`docs/05-design-patterns/one-qu-one-pp-rule.md`](05-design-patterns/one-qu-one-pp-rule.md).

## What this design is NOT good at

Being honest:

- **Massive scale.** This is calibrated for 30 staff and ~50 active projects at any time. At 200 staff and 500 projects you'd want a proper PM platform (Wrike, Monday, etc. or roll your own on PostgreSQL).
- **Real-time multi-user editing on Airtable directly.** The team edits Sheets; only ops/leadership edits Airtable. Multi-Producer concurrent Airtable editing wasn't tested.
- **External client portals.** Clients never see Airtable. They see PDFs of Cost Sheets and Notion pages of strategic research. The internal/external boundary is firm.
- **Onboarding new staff in 1 day.** The system has shape; the shape takes a week to internalize. A new Producer can be productive in Sheets immediately but won't understand the full pipeline for ~2 weeks.

For a 30-person production house with 2-3 years of growth runway, those trade-offs are net favorable.
