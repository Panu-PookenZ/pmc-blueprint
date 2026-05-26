# Business architecture

PMC is not a generic project tool. It models a specific kind of company. This doc names that shape so you can decide whether the pattern fits yours.

## The 3-circle business

The production house sits at the intersection of three different commercial models:

```
                     ┌─────────────────────┐
                     │      OUTLET         │  (in-house content brands —
                     │                     │   weekly shows, daily desks,
                     │                     │   recurring podcasts)
                     └──────────┬──────────┘
                                │
                                ▼
                ┌──────────────────────────────┐
                │   PRODUCTION HOUSE (us)      │  ◄── PMC lives here
                │   - producers                │
                │   - directors                │
                │   - editors                  │
                │   - cinematographers         │
                └──────────────┬───────────────┘
                                │
            ┌───────────────────┼───────────────────┐
            ▼                                       ▼
   ┌────────────────────┐                  ┌────────────────────┐
   │  AGENCY (work for  │                  │  POST PRODUCTION   │
   │  external clients) │                  │  SERVICE (sell     │
   │                    │                  │  capacity to other │
   │                    │                  │  studios)          │
   └────────────────────┘                  └────────────────────┘
```

Each circle has different economics, different cycle times, different KPI shapes:

| Circle | Revenue model | Cycle time | Margin shape | Key KPI |
|---|---|---|---|---|
| **Outlet** (own content) | Ads + sponsorship | Weekly recurring | Long-tail; pays off over months | Views, watch time |
| **Agency** (client work) | Per-project quote | 4-12 weeks | Per-project margin (hit or miss) | Margin % per project |
| **PPS** (post-prod service) | Hourly / per-job | 1-3 weeks | Capacity utilization | Editor hours billed / available |

The Producer role is **double-hatted**: the same person who quotes an agency project also produces an in-house outlet show. The data model has to support both — same Producer can show up linked to different parent records depending on which circle the work is in.

## The team shape

| Role | Headcount | Slack handle pattern | Edits in PMC? |
|---|---|---|---|
| Head of Video | 1 | – | Yes, all |
| Producer | 3 (Production House) + ~8 (Outlet) | @producer-X | Yes, their projects |
| Director | 5 | @director-X | Yes, their deliverables |
| Cinematographer | ~5 | @cino-X | No (looked up via Service Job records) |
| Sound / Switcher / Lighting / Photographer | ~10 mixed | – | No |
| Editor | 6 | @editor-X | Yes, their post-prod queue |
| Assistant Editor | 2 | – | No |
| Accountant | 1 (shared with bigger org) | – | No (uploads External Cost file weekly) |

**Production House total: ~31.** Total video team across all circles: ~70+.

The asymmetry — Producers ÷ 2 (Production House count 3 vs Outlet count 8) — matters because the Producer role itself is shaped differently across circles: agency Producer manages briefs + budgets + client relationships, outlet Producer manages show pipelines + audience growth + ad relationships.

## The 5 tracks of work

Internally, PMC organizes around five parallel work tracks:

| Track | What it covers | Status in this repo |
|---|---|---|
| **A. Project Management** | The PP / Deliverable / Cost Sheet / Service Job tables — the core | ★ Documented |
| **B. People Management** | Team / Contacts / KPI / Feedback Log | ★ Documented |
| **C. Knowledge Management** | Meeting Intelligence pipeline + Notion mirroring | ◐ Sketched |
| **D. Asset Management** | Footage Log Sheet + Footage Sync | ★ Documented |
| **E. Insight & Reporting** | Hedwig digest + Notion Strategic Research + Management Interface | ◐ Sketched |

Tracks **A**, **B**, and **D** are fully expressed in this repo's schema and code. Tracks **C** and **E** are sketched at the pattern level — they involve LLM-driven pipelines that the production house runs via private Claude Code skills, and the implementations are too entangled with that runtime to publish clean here.

## Where PMC fits in the broader stack

```
                    ┌────────────────────────────┐
                    │  Client deliverables       │  ← what the world sees
                    │  (videos on YouTube, FB,   │     (out of scope for PMC)
                    │   IG, client microsites)   │
                    └─────────────┬──────────────┘
                                  ▲
                                  │ publish
                    ┌─────────────┴──────────────┐
                    │  Asset library             │  ← Drive + Mimir MAM (future)
                    │  (footage, masters,        │
                    │   color-graded outputs)    │
                    └─────────────┬──────────────┘
                                  ▲
                                  │ edit, color, master
                    ┌─────────────┴──────────────┐
                    │  Edit pipeline             │  ← Editor's Calendar + PPS table
                    │                            │
                    └─────────────┬──────────────┘
                                  ▲
                                  │ shoot
                    ┌─────────────┴──────────────┐
                    │  Shoot operations          │  ← Service Job table + Calendar
                    │                            │
                    └─────────────┬──────────────┘
                                  ▲
                                  │ approve, plan
                    ┌─────────────┴──────────────┐
                    │  PMC ★                     │  ← this repo
                    │  Project + Money + Team    │
                    └─────────────┬──────────────┘
                                  ▲
                                  │ brief, quote
                    ┌─────────────┴──────────────┐
                    │  Sales pipeline            │  ← clients, briefs, quotes
                    │                            │     (managed by Producer,
                    │                            │      lightly modeled in PMC)
                    └────────────────────────────┘
```

PMC owns the middle four layers but stops short of the asset library and the public surface. Sales (the layer below) is modeled only by what spills into a project — Brief Link, Cost Sheet Link, Client name on the PP — but isn't a first-class CRM.

This boundary is intentional. CRM tools (HubSpot et al.) and MAM tools (Mimir, Iconik) each have their own gravity; PMC interops with them via linked URLs rather than absorbing them.

## What this means for your fit

PMC is well-shaped for studios that look like this:

- 15-50 staff, growing
- Multi-circle (own shows + client work + capacity rental, not just one model)
- Producer-led culture (Producers own budgets + client relationships)
- Already on Google Workspace (Sheets, Drive, Calendar)
- Comfortable with low-code (Airtable, Apps Script, Notion) but want a real schema underneath

It's a less natural fit if you're:

- A 3-person team (overkill; just use Notion)
- A 200+ person studio (you'll outgrow Airtable's 100k-records-per-base limit + the single-writer Apps Script model)
- A pure agency (all client work, no own outlets) (the Outlet circle complexity is wasted on you)
- Not on Google Workspace (Apps Script doesn't exist outside it; you'd need to port the change-feed pattern to your stack)

Read [`docs/01-vision.md`](01-vision.md) for the design tenets that follow from this business shape.
