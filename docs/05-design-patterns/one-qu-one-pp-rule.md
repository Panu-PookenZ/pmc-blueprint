# One QU = One PP

> **A single Quotation Number (QU-XXXX) maps to exactly one Production Project record. A package of work with multiple deliverables under one quote is one PP with N Deliverables — not N PPs.**

## The bug this prevents

In an early version of the schema, Producers could create multiple PP records under the same QU because they each represented "different chunks of work" — a video EP series, a photo album, a BTS reel — under the same client quote.

This broke margin reporting:
- A Cost Sheet had a Grand Total of 800k for QU-9001
- The Cost Sheet linked to PP record A (the video series)
- 50% of the External Costs were associated with PP record B (the photo album)
- PP-A showed unhealthy 30% margin
- PP-B showed unhealthy 30% margin
- The actual QU-9001 was 65% margin overall — but no view showed that

Fragmented quotes = fragmented economics = wrong decisions.

## The rule

| Tier | Format | Cardinality | Example |
|---|---|---|---|
| Package | `QU-XXXX` (plain) | 1 Cost Sheet record × 1..N PPs | `QU-9001` (annual contract with Client X) |
| Project | `QU-XXXX/N` | 1 PP record × 1..N Deliverables | `QU-9001/2` (Q2 video series) |
| Item | `QU-XXXX-V1`, `-A2`, etc. | 1 Deliverable × 1 Cost Sheet Item | `QU-9001/2-V1` (EP.1) |

So:
- **1 Cost Sheet record** at the **Project tier** (`QU-9001/2`)
- **1 PP record** at the same **Project tier** (`QU-9001/2`)
- **N Deliverable records** at the **Item tier** (`QU-9001/2-V1`, `-V2`, `-V3`, `-A1`, …)
- **N Cost Sheet Items** at the same Item tier

The Cost Sheet ↔ PP relationship is **always 1:1 by Product Code**.

## What "package" tier is for

The Package tier (`QU-XXXX` plain) is rarely used — it's reserved for **multi-project contracts**: an annual deal where one master quote covers a year's worth of work that will be broken into N projects.

Example:
- `QU-9001` = master annual contract, ~10M baht over 12 months
- `QU-9001/1` = Q1 video series PP (one PP record)
- `QU-9001/2` = Q2 video series PP (one PP record)
- `QU-9001/3` = Q3 explainer videos PP (one PP record)
- `QU-9001/4` = Q4 product launch PP (one PP record)

Each `/N` Project tier has its own PP record + Cost Sheet record. The Package tier itself doesn't necessarily have a single Cost Sheet record (in fact, usually doesn't — it's a contractual umbrella, not an invoiced quote).

## The cleanup incident

In April 2026, the team discovered that one historical project (`QU-9001` in this docs anonymization, real `QU-4018`) had been split into **13 separate PP records** — one per Deliverable variant. The rationale at the time was "different formats need different management overhead." But all 13 were under one Cost Sheet record with one Grand Total.

Margin math was unrecoverable until consolidation. 13 PPs were merged into 2 PPs (representing 2 distinct Quarterly batches under the same QU package). 5 + 12 Deliverables sat under those 2 PPs. The Cost Sheet linked to both PPs.

Lesson: **fragmenting at the wrong tier costs more than it saves.** The "different formats need different overhead" intuition is wrong — at the Deliverable level you already have per-EP status, per-EP timeline, per-EP crew. You don't need another whole PP layer for that.

## Why this rule, not "1 QU = 1 Cost Sheet"

The 1:1 PP↔Cost Sheet relationship is the **operational** lever. PP carries the operational state (Stage, Producer, Director, Timeline). Cost Sheet carries the financial state (revenue, line items, External Cost rollup).

If you had 1 Cost Sheet ↔ 1 PP but the PP could be "split" into 2 records via business policy, you'd still get the wrong reports. The constraint has to be at the PP level: **one project's worth of operational state should always join to one project's worth of financial state.**

## Enforcement

| Layer | How enforced |
|---|---|
| Schema | Product Code field on PP — no uniqueness constraint in Airtable, but the auto-linker checks for duplicates |
| Sync runner | Refuses to create a 2nd PP record if Product Code already exists on another PP |
| Operator policy | Producers don't manually duplicate PPs; if a quote needs subdivision, create new `/N` subcodes (and new PPs per subcode) |
| Cost Sheet → PP auto-link | Matches by base QU; if multiple PPs match, raises a conflict for human resolution |

## When you'd legitimately have multiple PPs under one base QU

| Case | Resolution |
|---|---|
| Annual contract → quarterly batches | Use `/N` subcodes — `QU-9001/1`, `QU-9001/2`, etc. — one PP per subcode |
| Same QU mistakenly typed across 2 projects | Operator intervention — fix the wrong project's Product Code |
| Same client, multiple parallel ad-hoc shorts | Each gets its own QU (don't reuse) |

If you find yourself wanting two PPs under exactly the same Product Code (no `/N` suffix), that's a smell — either subdivide with `/N` or you've miscounted what's actually one project.

## Related rules

- **Cost Sheet-first principle** ([doc](cost-sheet-first-principle.md)) — the PP doesn't get a Product Code until the Cost Sheet exists
- **Project ID immutable** — once PP's `Project ID` is set (`PP-YY-NNN`), never change it; if you need to renumber, create a new PP and migrate Deliverables
- **Episode ID immutable** — same idea for Deliverables (`PP-YY-NNN-TNN`)

## Cost of this pattern

- **Producers have to learn the 3-tier format** — onboarding doc has to make it explicit
- **Migration from a "many PPs per QU" past state is painful** — there's one in the repo's case-study (see `case-studies/qu-split-unsplit.md` if added)
- **Doesn't fit every business model** — some agencies legitimately quote a master deal and execute it as 5 fully-independent projects; for them, `QU-9001/1..5` each as separate PPs (with separate Cost Sheet records too) makes more sense than the package tier model
