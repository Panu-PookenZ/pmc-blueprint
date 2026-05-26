# Formulas + rollups — reusable patterns

The PMC base uses ~42 computed fields (formulas + rollups + lookups). This doc catalogs the patterns that appear repeatedly.

## Pattern 1 — Milestone-driven percentage

**Where used:** `Production Projects.% Complete` (`fldpvqKD6O3lAK0Cl`)

**Idea:** Don't bind `% Complete` to `Stage` directly — bind it to **how many milestone records are marked Done**. Milestones (PPM, Shoot, Edit V1, Edit V2, Final, Publish) are explicit records in a `Timeline Milestones` table linked to each PP.

```
% Complete =
  IF(milestones_total = 0,
     stage_number / 8,                   // fallback to coarse stage-based %
     done_milestones / milestones_total) // actual milestone-driven %
```

Plus:
```
IF(Stage = "Cancelled" OR Stage = "On Hold",
   BLANK(),                               // grey out, don't show 0%
   <formula above>)
```

**Why:** Stage is a discrete state. % Complete should be a continuous progress signal. Stage 4-Production might be 20% done (just kicked off) or 80% done (shooting wraps tomorrow). Milestones give the resolution; Stage doesn't.

**Trade-off:** Requires the team to actually create milestone records per PP (extra setup work). Worth it for projects > 4 weeks; overkill for one-week spots.

## Pattern 2 — Conditional rollup (slice by Item Type)

**Where used:** `Project Cost Sheets.Video Revenue`, `.Video Cost`, `.Video Margin`, etc.

**Idea:** A Cost Sheet has many Items (line items). Items have an `Item Type` discriminator (Video / Photo / Album / Spot / Equipment / Talent). To compute *video-only margin*, you need to roll up only the items where `Item Type = Video`.

In Airtable:
1. Add a rollup field on Cost Sheet → reference `Cost Sheet Items.Amount`
2. In the rollup config, **add a filter**: `{Item Type} = "Video"`
3. Aggregator: `SUM(values)`

This gives you `Video Revenue` (sum of all video Items' Amount). Repeat with different filters / fields for `Video Cost`, `Non-Video Revenue`, etc.

**Gotcha (verified 2026-05-25):** **Conditional rollups DO NOT survive Duplicate field.** The duplicate copies the rollup but strips the filter, and the Edit Field UI hides the toggle to re-add the filter. If you need another conditional rollup, **create fresh via Insert** (right-click → Insert right) and configure the filter — never Duplicate.

## Pattern 3 — Stage mapping (discrete → numeric for sorting)

**Where used:** sort orders + roll-up math

**Idea:** Stage is a singleSelect, but you often want to sort by progression or compute "average stage across deliverables". Map names → numbers in a formula field:

```
SWITCH({Stage},
  "1-Briefing", 1,
  "2-Quoting", 2,
  "3-PPM", 3,
  "4-Production", 4,
  "5-Post Production", 5,
  "6-Delivered", 6,
  "7-Closed", 7,
  "8-Complete", 8,
  BLANK())
```

Then a rollup on PP from Deliverables.Stage_Numeric with `AVERAGE(values)` gives "average craft stage across this PP's deliverables" — a single number, sortable.

## Pattern 4 — Array join (rollup → singleLineText concat)

**Where used:** `Production Projects.All Director Names` (a single string listing all unique Directors across the PP's Deliverables)

**Gotcha:** A naive `&""` concatenation of a rollup of strings produces a mashed-together result with no separator. Use `ARRAYJOIN({rollup}, ", ")` instead:

```
// Rollup field: pull Deliverables.Director Name (via lookup from linked Team)
// Aggregator: ARRAYJOIN(values, ", ")
```

Or compute in a formula field that references the rollup:
```
ARRAYJOIN(ARRAYUNIQUE(values), ", ")
```

Multi-record-link fields auto-join with ", " on display, so this pattern is only needed when rolling up a non-link source.

## Pattern 5 — `{Link} & ""` for rollup → text coercion

**Where used:** anywhere you need the rolled-up value as text for further string ops

Airtable rollups return their natural type; if you need text from a rollup of links you need `&""` for coercion. Combined with ARRAYJOIN, this is the canonical pattern.

```
// Field: "Director list" (formula, text)
ARRAYJOIN({Directors rollup} & "", ", ")
```

## Pattern 6 — Margin formula (revenue - cost) / revenue

**Where used:** `Project Cost Sheets.Margin %`

```
IF(OR({Revenue} = BLANK(), {Revenue} = 0),
   BLANK(),
   ({Revenue} - {Total Cost}) / {Revenue})
```

Format the field as Percent with 1 decimal place. Wrap with `IF()` to avoid divide-by-zero noise.

Two margin fields exist on every Cost Sheet — **Margin Estimated** (revenue - estimated cost) and **Margin Actual** (revenue - actual cost from External Costs rollup). The gap between them is the truth about budget discipline per project.

## Pattern 7 — Idempotent populate-if-blank

**Where used:** `Deliverables.ชื่อ EP` (primary field)

The primary field is derived (Project Name + " - " + EP. Label) but the sync skill must **fill it only if blank**, never overwrite. This is enforced in skill logic, not in a formula, because:
- Once a record exists, its primary is what users have learned to refer to
- Overwriting it would break references everywhere

Pattern in the skill:
```python
if existing_record["fields"].get("ชื่อ EP", "").strip() == "":
    patch_with({"ชื่อ EP": f"{project_name} - {ep_label}"})
else:
    pass  # never overwrite
```

This isn't a formula but it's listed here because the formula approach (using a formula field instead of a writable field) was tried and abandoned — humans need to be able to manually edit the primary in rare cases.

## Pattern 8 — Computed read-only "Status Bar" string

**Where used:** Producer Dashboard Sheet column F (`Progress`) — not Airtable, but worth noting since it interops

A status bar that visually shows progress like `▓▓▓░░░░░░░ 30%` is built via Sheet formula, with conditional formatting + emoji concatenation. The Airtable side stores raw `Stage` + `% Complete`; the visual bar is rendered in the Sheet for the human consuming it.

## When to use a formula vs. a rollup vs. a script

| Need | Use |
|---|---|
| Per-record computation from same record's fields | Formula |
| Aggregation across linked records (sum, avg, count, min, max) | Rollup |
| Conditional aggregation across linked records | Rollup with filter |
| Pulling one field from a linked record verbatim | Lookup |
| Complex multi-step logic that doesn't fit one formula | Multiple chained formula fields (or a script) |
| Cross-base computation | Script (extension) |
| Dynamic computation triggered by external event | Automation script |

Default to formula + rollup. Reach for scripts only when those genuinely can't express what you need.

## Hygiene

- Name computed fields with a verb + noun: `Compute Margin Pct`, `Sum Video Revenue`
- Document non-obvious formulas in the field's description (Airtable Edit Field → Description box) — gets exported in schema dumps
- Quarterly: run a base health check — count broken formulas via Airtable API; the field's `isValid` returns false if a referenced field was deleted/renamed
