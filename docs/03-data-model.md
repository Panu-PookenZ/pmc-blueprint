# Data model

PMC's Airtable base has **21 tables** with **~519 fields** total. This doc is the bird's-eye view. Per-table detail with field types and rationale lives in [`airtable/tables/`](../airtable/tables/).

## The five layers

The 21 tables organize into 5 conceptual layers:

```
┌─────────────────────────────────────────────────────────────────┐
│                       L1 — PROJECTS                              │
│  Production Projects · Deliverables · Internal Projects ·        │
│  Internal Project Stages · Timeline Milestones                   │
└─────────────────────────────────────────────────────────────────┘
                            │ linked
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       L2 — OPERATIONS                            │
│  Service Job (shoot crews)  ·  Post Production Service (edit Q)  │
└─────────────────────────────────────────────────────────────────┘
                            │ linked
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       L3 — MONEY                                 │
│  Project Cost Sheets · Cost Sheet Items · External Costs ·       │
│  Production Monthly Budget · Freelance Costs                     │
└─────────────────────────────────────────────────────────────────┘
                            │ linked
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       L4 — PEOPLE & FEEDBACK                     │
│  Team · Contacts · Feedback Log                                  │
└─────────────────────────────────────────────────────────────────┘
                            │ referenced by
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       L5 — KNOWLEDGE & PIPELINE                  │
│  Meetings · Action Items · Decisions · Structural Outputs ·      │
│  Parking Lot · Sync Jobs                                         │
└─────────────────────────────────────────────────────────────────┘
```

## The core 4 tables (where to start if you're skimming)

If you only read about 4 tables, read these. They carry ~80% of the operational truth.

### 🎬 Production Projects (PP)
1 record per quoted package of work. Carries the QU (Quotation Number) as `Product Code`. Linked to:
- 1..N Deliverables (the actual videos/photos produced)
- 1..1 Project Cost Sheet (the quote)
- 0..N Service Jobs (each shoot day)
- 1 Producer, 0..N Directors (via Deliverables)

Stage progression: 1-Briefing → 2-Quoting → 3-PPM → 4-Production → 5-Post → 6-Delivered → 7-Closed → 8-Complete. PP.Stage represents the **client-facing process** state.

### 🎞️ Deliverables
1 record per final video / album / spot / short — the unit that gets delivered to the client.
Linked to:
- 1 Production Project (parent)
- 1 Director (per-EP) + 0..N crew links
- 0..1 Cost Sheet Item (line in the quote)
- 0..1 Post Production Service entry (when it enters the edit queue)
- 0..N Service Jobs (shoot dates that produced footage for it)
- 0..N Timeline Milestones (PPM, shoot, V1, V2, final, publish dates)

Stage progression: Pre-production → Storyline → Script → Shooting → Editing → V1/V2/V3 → Final → Delivered → Published. Deliverable.Stage represents the **internal craft** state — independent of PP.Stage. (See [pattern doc](05-design-patterns/pp-stage-vs-deliverable-stage.md).)

### 💰 Project Cost Sheets
1 record per QU-XXXX quote. Carries grand total, sums per item type (video/photo/album), and rollups of actual spend from External Costs.

### 🧾 Cost Sheet Items
1 record per line item in a Cost Sheet. Discriminator: `Item Type` ∈ {Video, Photo, Album, Spot, Equipment, Talent, Other}. Each Video item typically links to one Deliverable. Each Equipment/Talent item rolls up into the Cost Sheet's total cost.

The discriminator lets you compute **Video margin** = Video revenue - Video cost, sliced cleanly from non-video items. Verified pattern — 87% Video Margin across 8 measured projects in the production house data.

## Relationship map (key edges only)

```
                    ┌────────────────────────────────┐
                    │ Project Cost Sheets            │
                    │ Product Code (QU-XXXX) — primary
                    └─┬────────┬─────────────────────┘
                  1:1 │   1:N  │ (Items live under Cost Sheet)
                      ▼        ▼
   ┌─────────────────────────────┐  ┌──────────────────────────────┐
   │ Production Projects         │  │ Cost Sheet Items             │
   │ Project ID (PP-26-NNN) —prim│  │ Item Type, Amount, etc.      │
   │ Stage (client process)      │  └─────┬────────────────────────┘
   └────────┬────────────────────┘     1:1│ (Item → Deliverable)
        1:N │                              ▼
            ▼                          ┌───────────────────────────┐
   ┌──────────────────────────────────►│ Deliverables              │
   │ Service Job                       │ Episode ID (PP-NNN-TNN) —p│
   │ Shoot date, crew, Footage Link    │ Stage (internal craft)    │
   └───────────────────────────────────│ Director, Producer        │
                                       │ Footage Link, Final Link  │
                                       └────┬──────────────────────┘
                                            │ 1:0..1
                                            ▼
                                 ┌─────────────────────────┐
                                 │ Post Production Service │
                                 │ Editor, Stage, Dates    │
                                 └─────────────────────────┘
```

(Many tables omitted for clarity — full relationship map in [`docs/diagrams/airtable-relationships.mmd`](diagrams/airtable-relationships.mmd).)

## Primary keys + ID conventions

| Table | Primary field | ID format | Generated by |
|---|---|---|---|
| Production Projects | Project ID | `PP-YY-NNN` (e.g. `PP-26-025`) | Sheet auto-gen on row creation |
| Deliverables | Episode ID | `PP-YY-NNN-TNN` (T=type letter) | Sheet auto-gen on Episode Type pick |
| Post Production Service | Episode/SE ID | `PP-YY-NNN-TNN` OR `SE-YY-NNN` (standalone) | Sheet auto-gen |
| Project Cost Sheets | Product Code | `QU-XXXX` | Producer-typed (4-digit serial) |
| Cost Sheet Items | (computed) | inherits Cost Sheet QU + suffix | – |
| Service Job | (computed) | derived from shoot date + show | – |
| Team | TSD Code | 3-letter (e.g. `PNW`) | Manual |
| Contacts | (varies) | – | – |
| Meetings | (computed) | timestamp-based | – |

The type letters in Episode IDs encode deliverable type:
- `L` = Long-form (full episode, 5+ min)
- `S` = Short-form (vertical, ≤2 min)
- `A` = Album (photo set)
- `T` = Spot (commercial)
- `B` = BTS (behind the scenes)

## How status flows

Three independent stage columns:

| Table | Field | Meaning | Driven by |
|---|---|---|---|
| Production Projects | `Stage` | Client-facing process | Producer's view of project lifecycle |
| Deliverables | `Stage` | Internal craft state | Director + Editor's view of work-in-progress |
| Post Production Service | `Status` | Editor's queue | Editor only |

These are **decoupled by design**. A PP can be at `5-Post Production` while two of its Deliverables are at `Editing` and a third is at `Delivered`. That's normal. (See [pattern doc](05-design-patterns/pp-stage-vs-deliverable-stage.md) for why this isn't auto-derived.)

## Schema export

The full schema (all 21 tables, all 519 fields, all formulas, all rollup configs) is in [`airtable/tables/`](../airtable/tables/) — one markdown file per table. For programmatic access:

- The **demo Airtable base** (`appIYEG4tZHqUhupQ`) carries the live schema. Use the Airtable API or `pyairtable` to inspect it.
- The demo has `0` records — pure schema clone. See [`airtable/README.md`](../airtable/README.md) for how to populate with sample data.

## What's NOT in this base (intentionally)

- **Client CRM** — Brief Link is a URL pointing to a Google Doc / Drive folder; we don't model client contacts in PMC. (Use HubSpot, Folk, or Notion.)
- **Asset library / MAM** — Footage Link is a URL pointing to a Drive folder. We don't track individual files, color-grade rounds, or master locations. (Use Mimir, Iconik, or Drive itself.)
- **Time tracking** — no per-task time entries. Editor hours are estimated at the PPS row level if at all. (Use Harvest, Toggl, or just don't.)
- **Invoicing / AR** — payment terms, payment status, invoice generation all happen in the parent organization's finance stack. PMC sees only the External Cost line items the accountant uploads.
- **Public-facing dashboards** — clients never see Airtable. They see PDF Cost Sheets and Notion Strategic Research pages.

These boundaries are firm — each is the topic of its own gravitational well that PMC doesn't try to absorb.
