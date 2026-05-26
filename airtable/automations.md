# Airtable native automations

PMC's automation lives in **two places**:
1. **Airtable native automations** — for in-base reactivity (this doc)
2. **External sync runners** — for cross-system flows (covered in [`../automation/`](../automation/))

Use native automations for things that should react inside Airtable. Use external runners for things that need to reach other systems (Sheets, Drive, Notion, Line).

## Used patterns

### A1 — Stage transition notification

**Trigger:** when `Deliverables.Stage` changes to `Delivered` or `Published`

**Action:** send Slack/Line message to a small "wins" channel

**Why native:** the trigger is per-record-field; native automations handle this with zero infrastructure.

```
Trigger: When record matches conditions
  Table: Deliverables
  Conditions: Stage IS Delivered (or any of [Delivered, Published])
  Only run when conditions become true (not on every save)
Action: Send a message
  Tool: Slack (or HTTP webhook → Line)
  Channel: #wins
  Body: "🎉 {Episode ID} — {ชื่อ EP} delivered by {Producer}"
```

### A2 — Missing field validation reminder

**Trigger:** when `Production Projects.Stage` enters `3-PPM` AND `Brief Link` is empty

**Action:** post a Slack DM to the Producer

```
Trigger: Stage IS 3-PPM
  Condition: Brief Link IS EMPTY
Action: Send Slack DM to {Producer.Slack ID}
  Body: "PP {Project ID} entered PPM stage without a Brief Link — please attach."
```

### A3 — Cost Sheet → Project linker

**Trigger:** when a `Project Cost Sheets` record is created OR `Product Code` is edited

**Action:** find matching Production Project by `Product Code` exact match, set the link field

```
Trigger: Record created (or Product Code modified)
Action 1: Find records
  Table: Production Projects
  Condition: {Product Code} = {Triggering record's Product Code}
Action 2: Update record
  Table: Project Cost Sheets
  Record: Triggering record
  Fields: Production Project = {Action 1 result}
```

**Why useful:** as accountants enter Cost Sheets, they auto-link to the PP without manual lookup. Falls back gracefully if no match (just leaves the link empty).

### A4 — Episode ID conflict alarm

**Trigger:** when a `Deliverables` record is saved AND a count rollup of `Episode ID` matches across the base is > 1 (i.e., duplicate Episode ID exists)

**Action:** Slack DM to the Producer + Editor

```
Trigger: Record updated
  Condition: Duplicate Episode ID count > 1 (computed via a "Duplicate IDs" rollup field)
Action: Send Slack DM
  Body: "Duplicate Episode ID {Episode ID} detected — please re-pick"
```

**Why:** the sheet's auto-gen has a known race; this catches the rare case where it slips through.

## Patterns intentionally NOT used

### Not: status auto-progression

It might be tempting to write:

> When `Deliverables.Status = Editing` AND `Edit Date < today`, auto-advance to `V1`.

Don't. Stage transitions are **a human decision** — the editor decides when V1 is "really V1", not a date check. Auto-progression creates ghost transitions and erodes trust in the data.

### Not: cross-base sync via Airtable Sync

Airtable has a "Sync" feature (one base reads another's table). It's tempting but:
- Sync source = read-only on the destination (limits utility)
- Sync delay can be 5-15 min (too slow for some workflows)
- Premium feature (not on free/team plans)
- Adds opaque dependency hard to debug

PMC uses external sync runners instead — explicit code beats opaque native sync.

### Not: complex multi-step automations in Airtable

Native automations have a clean 1-trigger → 1-3-actions sweet spot. Anything more complex (loops, conditional branches, error recovery) belongs in the external runner where you have a real programming language.

The line: if the automation needs an `if` statement *inside* an action, move it out of Airtable.

## Quotas

Airtable native automations have monthly quotas:
- Free: 100 runs / month
- Team: 25,000 runs / month
- Business: 100,000 runs / month

For PMC's volume (~30 staff, ~50 active projects), Team plan's 25k/month is comfortable as long as you don't trigger on every record save. Trigger on specific field changes or conditions, not blanket save events.

## Where to find the automation panel

In Airtable: top right of base → **Automations** tab. Each automation has:
- Trigger (1)
- Action(s) (1+)
- Test pane (try with a sample record)
- Run history (last N runs with success/fail + payload)
- Toggle (on/off)

For non-trivial automations: **always set up a test record first**, run the automation against it, verify the side effect, then enable for live records.
