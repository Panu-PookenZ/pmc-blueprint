# Views — slice the same table for different roles

Every PMC table has a small number of carefully-designed views. The views are what humans see; the underlying records are universal. This doc covers the view patterns — not every individual view's filter.

## The view design rule

> **Each view is for one role × one time horizon.**

Examples:
- "Producer's active week" — filter: `Stage IN (Pre/Prod/Post/Delivered)` AND `Owner = me` AND `Updated this week`
- "Director's deliverables this month" — filter: `Director = me` AND `Shoot Date in next 30 days`
- "Editor's queue this week" — filter: `Editor = me` AND `Status IN (Editing, V1, V2)`
- "Money — all open" — filter: `Stage NOT IN (Closed, Cancelled)`

Don't try to make one universal "everything" view. Different humans need different defaults.

## View patterns by table

### 🎬 Production Projects — 6+ views

| View | Filter | Sort | Audience |
|---|---|---|---|
| All Active | Stage IN (1-Briefing..6-Delivered) AND not cancelled | Deadline asc | Everyone |
| By Producer (A/B/C) | Producer = X | Deadline asc | Producer X |
| Stage funnel | grouped by Stage | (none) | Leadership |
| Margin watch | Margin Est < 30% OR Margin Act < 30% | Margin Act asc | Producer + Leadership |
| Awaiting Cost Sheet | Cost Sheet count = 0 AND Stage ≥ 2 | Brief Date asc | Producer |
| Recently complete | Stage = 7-Closed AND updated last 30d | Updated desc | Producer (post-mortem) |

### 🎞️ Deliverables — 8+ views

| View | Filter | Sort | Audience |
|---|---|---|---|
| HERO — Producer × Stage | grouped by Producer, then Stage | Episode ID asc | Leadership ★ |
| Today's shoots | Service Job.Shoot Date = today | – | Producer A.M. desk |
| This week's publishes | Publish Date in this week | Publish Date asc | Producer + Director |
| By Director | Director = X | Stage progress | Director |
| Footage missing | Footage Link is empty AND Stage ≥ Shooting | Episode ID | Producer ↔ Cinematographer |
| Stuck > 14 days | Last Updated > 14d ago AND Stage IN (Editing, V1, V2) | Last Updated asc | Editor + Producer |
| Final approved | Stage = Final AND Published Link empty | Final Date | Producer |
| Published | Stage = Published | Publish Date desc | Marketing |

### 💰 Project Cost Sheets — 5+ views

| View | Filter | Sort | Audience |
|---|---|---|---|
| Open | Stage NOT IN (Closed) | Created desc | Accountant + Producer |
| Margin tracker | grouped by Margin band (>50%, 30-50%, 10-30%, <10%, loss) | – | Leadership ★ |
| External cost gap | External cost actual > 0 BUT not yet 100% linked | – | Accountant |
| By Client | grouped by Client | Created desc | Producer + sales review |
| Q-end snapshot | Updated in this quarter | Created asc | Leadership quarterly review |

### 📹 Service Job — 5+ views

| View | Filter | Sort | Audience |
|---|---|---|---|
| Today | Shoot Date = today | Start Time asc | Operations morning desk |
| Tomorrow | Shoot Date = tomorrow | Start Time asc | Operations evening desk |
| Next 14 days | Shoot Date in next 14 days | Shoot Date asc | Operations + Producer |
| Unconfirmed | Status = Scheduled (not yet Confirmed) | Shoot Date asc | Producer ↔ Cinematographer |
| By Cinematographer | grouped by Cinematographer | Shoot Date asc | Capacity planning |

### ✂️ Post Production Service — 6+ views

| View | Filter | Sort | Audience |
|---|---|---|---|
| By Editor | grouped by Editor | Stage progress | Editor + Editor lead |
| Approaching deadline | End Date in next 7 days AND Status ≠ Final | End Date asc | Editor lead |
| Stuck > 7 days | Last Updated > 7d ago AND Status ≠ Final | Last Updated asc | Editor lead |
| Standalone (no Production link) | Production Project is empty | Created desc | Editor lead (for SE-YY-NNN format) |
| Last week's delivers | Status = Final AND End Date in last week | End Date desc | Leadership review |
| All open | Status NOT IN (Final, Cancelled) | Stage asc | Editor lead daily |

## Interface vs. view

Airtable has two surfaces:
- **Grid views** (what this doc covers) — the table-with-filters surface
- **Interface Designer** — a separate WYSIWYG app builder that exposes views to non-editors

The production house uses both:
- **Operators** (leadership, Producer, Director, Editor) — work directly in Grid views inside the base
- **Read-only audiences** — get Interfaces (e.g. a Project page with HERO Producer × Stage view embedded, plus rollup tiles)

Interface designs aren't easily exportable as code — see [`../docs/06-management-interface.md`](../docs/06-management-interface.md) for the conceptual layout used (9 Windows × 6 Object pages).

## When to add a new view

Default to **fewer views, broader filters** + use grouping for the slicing.

Add a new view when:
1. A specific role asks for the same filter combo twice in a week
2. An automation needs a stable filter target (some Airtable automations target a specific view)
3. A dashboard / Interface needs a pre-filtered data source

Don't add a view for:
- Ad-hoc one-shot questions (use the toolbar filter instead)
- Filters that overlap heavily with existing views (consolidate via grouping)
- Personal preferences ("I like X first, then Y") — use record coloring instead

## View hygiene

Once a quarter:
- Audit view count per table — flag any table with >12 views
- Delete views with no recent edits in 30d (probably abandoned)
- Rename views that don't describe their role + horizon ("View 12" → "Director X stuck > 7d")
- Re-check filters reference current field IDs (rename of underlying fields breaks views silently)
