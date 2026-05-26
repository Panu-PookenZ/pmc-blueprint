# 1-page TL;DR

**Problem:** A growing video production house drowns in spreadsheets. Producer has one Sheet. Director has another. Editor has a third. Accountant has a fourth. None agree.

**The PMC pattern:**

- **Airtable holds the truth.** 21 tables, ~519 fields, all linked. Single source of structured state.
- **Sheets stay as the workspace.** Producers + Directors + Editor never log into Airtable — they edit Sheets like they always did.
- **A change feed bridges them.** An Apps Script `onEdit` trigger writes every cell change into a `_Update Log` tab. A sync runner drains that queue and writes to Airtable. A small web app endpoint flips the rows back to `synced` once done.
- **Money has its own gravity.** A separate Cost Sheet table + Items table sit alongside Production Projects + Deliverables. The Cost Sheet is the source of truth for what a project is worth — never derived from a placeholder code somebody typed into a Sheet.
- **Routines run overnight.** ~10 scheduled tasks land between 00:00 and 09:00 BKK while no one is editing. The morning report shows what changed.
- **A digest bot pushes the daily heartbeat.** A Line bot pushes twice-daily summaries: morning ("what came in overnight + today's shoots") and evening ("tomorrow's shoots + upcoming edit deadlines").

---

## How the pieces talk to each other

```
Humans edit Sheets ──┐
                     │  onEdit ─► _Update Log ─► sync runner ─► Airtable
                     │                                     │
Shared Drive ────────┼──► Footage Log Sheet ──► sync runner─┤
                     │                                     │
External Cost file ──┘                                     │
                                                            ▼
                                              Airtable PMC base
                                                            │
                                              ┌─────────────┼─────────────┐
                                              ▼             ▼             ▼
                                         Hedwig digest   Notion reports   Dashboards
                                         (Line OA)       (per meeting)    (per Producer)
```

## The 21 tables in one breath

**Project layer (5)** — Production Projects · Deliverables · Internal Projects · Internal Project Stages · Timeline Milestones
**People (1)** — Team
**Money (4)** — Project Cost Sheets · Cost Sheet Items · External Costs · Production Monthly Budget · Freelance Costs
**Operations (2)** — Post Production Service · Service Job
**Meetings (5)** — Meetings · Action Items · Decisions · Structural Outputs · Parking Lot
**Feedback (1)** — Feedback Log
**Pipeline (2)** — Sync Jobs · Contacts

Detail in [docs/03-data-model.md](03-data-model.md).

## What this repo gives you

| You want to… | Read |
|---|---|
| Steal the schema | [`airtable/`](../airtable/) — markdown per table |
| Steal the change-feed code | [`automation/apps-script/`](../automation/apps-script/) — 3 sanitized `.gs` files |
| Steal the patterns | [`docs/05-design-patterns/`](05-design-patterns/) — 4 standalone patterns |
| Try it in 15 min | [`examples/try-it-in-15-min.md`](../examples/try-it-in-15-min.md) |
| Read the war stories | [`case-studies/`](../case-studies/) |

## What this repo does NOT give you

- A SaaS — this is a pattern, not a product
- The skill plugin that runs the sync in production (private)
- A no-code setup wizard — you'll need to read code

## Estimated time to clone the system

| Step | Hours |
|---|---|
| Read this repo cover-to-cover | 2-3 |
| Clone demo Airtable to your workspace | 0.5 |
| Wire up your own Sheets + paste Apps Script | 2-3 |
| Build your own sync runner (pick stack) | 6-12 |
| Adapt field routing rules to your business | 3-6 |
| Train Producers on the new Sheet format | 4 |
| **Total** | **~20-30 hours over 1-2 weeks** |

This is faster than building from scratch (the original took 6 months of evening-and-weekend iteration to reach the current shape). The repo is what we wish we had at hour zero.
