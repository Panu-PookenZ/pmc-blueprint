# Case study — when one QU got split into 13 projects

> **TL;DR:** A single annual contract under one Quotation Number had been fragmented into 13 separate Production Project records. Margin math was unrecoverable until cleanup. Lesson: **the One QU = One PP rule is non-negotiable**, even when it feels like sub-projects deserve their own management overhead.

## The discovery

During a routine audit (May 2026), the team's automated audit skill flagged:

> "QU-9001 appears on 13 distinct Production Projects records. Cost Sheet record has total = 12M baht. Margin calculation: indeterminate. External Cost rollup distributes across 13 PPs unevenly."

What it meant: a single annual contract with one accountant-issued quote (QU-9001) had been broken into 13 PP records by Producers over the course of the year. Each PP record had its own Producer, own Director, own stage progression. The rationale at the time (according to original commit messages and Slack threads) was:

> "Each EP series is creatively distinct enough to deserve its own management lane. Sharing the master QU keeps the books simple but each lane needs its own Producer journal."

This sounds plausible in isolation. In practice it broke everything downstream.

## What broke

1. **Margin rollup couldn't compute correctly.** Cost Sheet had a single Revenue = 12M and a single Cost rollup from External Costs. But External Costs (the accountant's actual-spend file) was distributed across the 13 PPs via item-level links. If you summed Cost Sheet.Cost, you got the right number. If you summed PP.Actual Cost (rollup from Cost Sheet Items via External Cost), you got 1/13 the right number per PP. Producers looked at PP-level dashboards and thought they were running 30% margin; reality was 65% across the package.

2. **Audit became impossible.** "How much did we spend on Q3 EPs?" had no single answer — you'd have to manually pick the right subset of the 13 PPs.

3. **Cross-Producer handoffs got messy.** PP records had different Producers depending on which sub-series. A Director working on EPs across 3 of the 13 saw 3 different Producer contexts for nominally the same project.

4. **The 13 PPs each had Stage 8-Complete by different dates.** Cost Sheet Stage was "Open" because not all sub-EPs were closed yet. Stage ↔ Stage disconnect.

## The cleanup

The audit produced a recommendation: **consolidate to 2 PPs** corresponding to the 2 actual quarterly batches within the year, both under QU-9001 (Project tier `/N` subcode).

Steps:
1. Map all 13 existing PPs → 1 of the 2 target PPs (or "this PP is actually a Deliverable on PP-A")
2. Create 2 new PP records: `PP-26-XXX` (Q3 batch) + `PP-26-YYY` (Q4 batch), with `Product Code` = `QU-9001/3` and `QU-9001/4` respectively
3. Migrate ~17 Deliverable records from the old 13 PPs to the 2 new ones (Airtable allows this via update PATCH — just change the `Project` link)
4. Delete the 13 fragmented PPs
5. Update the Cost Sheet to link to **both** new PPs (the master QU `QU-9001` Package tier; the `/3` and `/4` are the Project tier sub-records)
6. Re-verify margin rollups

Total cleanup time: ~3 hours wall clock. Cleanup was committed as a one-shot migration script with a sync log for audit trail.

## What the rule looks like now

The [`one-qu-one-pp-rule.md`](../docs/05-design-patterns/one-qu-one-pp-rule.md) pattern doc came out of this incident. The schema-level enforcement:

- Producers cannot manually create a 2nd PP under an existing Product Code
- The Cost Sheet → PP auto-linker raises a conflict warning if multiple PPs match a given Cost Sheet's base QU
- The audit skill (run nightly) flags any Cost Sheet with > 1 linked PP at the same Product Code

## Why the original choice felt right

The original Producers weren't wrong to want per-sub-series management overhead. They wanted:
- Per-sub-series stage progression (some EPs done, others in production)
- Per-sub-series Producer assignment (different Producers owned different sub-series)
- Per-sub-series timeline + deadline tracking

The mistake was **doing this at the PP layer instead of the Deliverable layer**. Deliverables already support:
- Per-EP Stage (independent of PP Stage — that's why we have [`pp-stage-vs-deliverable-stage`](../docs/03-data-model.md#how-status-flows))
- Per-EP Director, per-EP Producer (a Deliverable can have its own Producer different from its parent PP's Producer if the team needs that)
- Per-EP Publish Date + Timeline Milestones

So everything the Producers wanted was already available, one layer down. The fragmentation at the PP layer was solving a problem that didn't exist there.

## The deeper pattern

When you feel the urge to fragment, ask: **"What's the actual unit I want to manage?"** If it's "this stream of EPs that share a creative theme", that's a Deliverable group, not a Project. If it's "this customer relationship that spans multiple deals", that's still one Production Project with multiple Deliverables grouped by Episode Type.

The PP layer is reserved for **one quote = one project**. Sub-units belong at the Deliverable layer or lower.

## The follow-on we paid

After cleanup, we tightened the schema:
- Added a "split-detection" formula on Cost Sheets that flags `> 1 PP` linked
- Added the daily audit check
- Wrote this case study so future Producers reading the docs see the actual cost of fragmentation
- Updated Producer onboarding to explicitly cover the 3-tier QU format

Total tightening: ~half a day. Worth every minute.

---

**Related:**
- [Pattern: One QU = One PP](../docs/05-design-patterns/one-qu-one-pp-rule.md)
- [Pattern: Cost Sheet-first principle](../docs/05-design-patterns/cost-sheet-first-principle.md)
- [docs/03-data-model.md → How status flows](../docs/03-data-model.md#how-status-flows)
