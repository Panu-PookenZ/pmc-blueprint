# Try PMC in 15 minutes

A guided walkthrough using the demo Airtable base. No installation, no setup — just clicks.

## What you'll see

By the end:
- How the 21 tables are wired together
- The 3-tier QU format in action
- Why Producer/Director/Editor each see different views of the same record
- How money (Cost Sheet) and operations (Production Project) stay in 1:1 correspondence

## What you'll NOT do

- Install Apps Script (covered in [`connecting-your-sheet.md`](connecting-your-sheet.md))
- Deploy the markStatus web app (covered in the [pattern doc](../docs/05-design-patterns/markstatus-web-app-pattern.md))
- Wire your own Google Sheet to it (covered in the connecting doc)

This is a **read-only tour**. Implementation comes later.

---

## Step 1 — Open the demo

→ Open the [**demo Airtable invite link**](https://airtable.com/invite/l?inviteId=invd2RlOujhdPOQpX&inviteToken=82b45a12a06962325e6bb07f8706204f977bd37daf8a9ebaf304485c91a74e2b&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts)

Accept the workspace invite. You'll land in **My First Workspace**. Find the base named **Production Management Center (Copy)** and open it.

## Step 2 — Walk the 7 tables that carry the story (5 min)

The demo has a fully-wired example project: **Example Show Series Q1** (DEMO-26-001) — a 3-EP video series quoted at 800,000 THB for Client X. Walk these 7 tables in order:

### 🎬 Production Projects
Click the table. You see 1 record: `Example Show Series Q1` with `Project ID = DEMO-26-001`, `Product Code = QU-9001/1`, `Stage = 5-Post Production`, `Producer = Producer A`.

**Note the linked fields** on the right side of the row — Deliverables (4), Project Cost Sheet (1), Service Job (2). These are not denormalized copies; they're live links to other tables.

### 💰 Project Cost Sheets
Click. You see 1 record: `QU-9001/1` for `Client X`, total = 800k. The `Production Project` link points back to the PP record. The `Cost Sheet Items` rollup shows 4 items.

### 🧾 Cost Sheet Items
Click. You see 4 records:
- Video Production - EP.1 (Long-form) — 250,000
- Video Production - EP.2 (Long-form) — 250,000
- Video Production - EP.3 (Long-form) — 250,000
- Equipment Rental - 6 shoot days — 50,000

3 × 250k + 50k = 800k total. The 3 video items each link to one Deliverable (EP.1/2/3). The equipment item is shared infrastructure — no Deliverable link.

**Insight:** the `หมวดงบ` (Item Type) discriminator lets you compute "video margin" by rolling up only the Video items. See [`airtable/formulas.md` → Pattern 2](../airtable/formulas.md#pattern-2--conditional-rollup-slice-by-item-type).

### 🎞️ Deliverables
Click. You see 4 records:
- EP.1 Introduction — Episode ID `DEMO-26-001-L01`, Stage = V2
- EP.2 Deep Dive — `DEMO-26-001-L02`, Stage = Editing
- EP.3 Wrap-up — `DEMO-26-001-L03`, Stage = Pre-production
- Short Cut EP.1 — `DEMO-26-001-S01`, Stage = Editing

Each links back to PP + has Director = Director A. The Stage field is **per-Deliverable** — PP says "5-Post Production" overall, but each EP has its own progress.

**Insight:** PP.Stage ≠ Deliverable.Stage. They're decoupled by design — see [`docs/03-data-model.md` → How status flows](../docs/03-data-model.md#how-status-flows).

### 📹 Service Job
Click. You see 2 records:
- Shoot Day 1 (EP.1 + EP.2) — 2026-02-10, Videographer = Cino A, Status = Delivered
- Shoot Day 2 (EP.3) — 2026-02-24, Videographer = Cino A, Status = Confirmed

Each shoot day produces footage that potentially feeds multiple deliverables. The `Footage Link` URL points to the Drive folder. The `footage-sync` skill populates this from the daily Drive crawl.

### ✂️ Post Production Service
Click. You see 3 records — one per long-form EP:
- DEMO-26-001-L01 — Editor = Editor A, Stage = V2 (matches Deliverable.Stage)
- DEMO-26-001-L02 — Stage = Editing
- DEMO-26-001-L03 — Stage = Pre-production

Note the PPS rows mirror the Deliverable stages but exist as separate records — the Editor needs its own queue view independent of the Director/Producer view.

### 👥 Team
Click. You see 4 records: Producer A, Director A, Editor A, Cino A. The rest of the tables link back here for role assignments.

## Step 3 — Try a "what if" question (5 min)

Open Production Projects → click into the `Example Show Series Q1` row. Note the `Stage` field = `5-Post Production`.

Now go to Deliverables. Filter `Stage = Pre-production`. You'll see EP.3 is still at Pre-production even though the parent PP is at Post-Production. **That's normal** — EP.1 has been shot, EP.3 hasn't.

If you wanted "Show me PPs where some deliverables are stuck behind the PP's overall stage", that's a view filter:

```
Production Projects WHERE
  Stage IN (5-Post Production, 6-Delivered) AND
  Deliverables (rollup MIN of Stage) IN (Pre-production, Storyline)
```

The schema supports the question; the view design is up to you.

## Step 4 — Look at the views design (3 min)

Open the Deliverables table. Click the view picker (top-left of the data grid). Notice the demo only ships a single "All Records" view — but the [`airtable/views.md`](../airtable/views.md) doc lists the recommended view set:

- HERO — Producer × Stage (grouped)
- Today's shoots
- This week's publishes
- By Director
- Footage missing
- Stuck > 14 days
- Final approved
- Published

Each is a 1-role × 1-time-horizon filter. Create one of them yourself in the demo (right-click view list → Create view) to see the filter UI.

## Step 5 — Now follow the money (2 min)

Project Cost Sheets shows the quote total. But what about **actual** spend?

The base has an `💸 External Costs` table (empty in the demo) that the accountant uploads weekly. Each External Cost record links to one Cost Sheet Item. The Cost Sheet rolls up External Costs to get **Actual Total** — and the Margin formula does (Revenue - Actual Total) / Revenue.

In the demo, External Costs is empty so margins show estimated only. In production, this is where the real-vs-budgeted picture lives.

**Insight:** External Costs is the *one table the Producer doesn't touch*. Accountant owns it. PMC just consumes the rollup.

---

## What to do next

| If you want to… | Go to |
|---|---|
| Understand how Sheets bridge to Airtable | [`docs/04-sync-pipeline.md`](../docs/04-sync-pipeline.md) |
| Read the design patterns | [`docs/05-design-patterns/`](../docs/05-design-patterns/) |
| Set up your own Sheet with the change feed | [`examples/connecting-your-sheet.md`](connecting-your-sheet.md) |
| Clone the schema into your own workspace | [`airtable/README.md`](../airtable/README.md) → "Clone the demo into your own workspace" |
| See what other records exist in the demo | [`examples/sample-data.md`](sample-data.md) |

---

## Common questions

### Why is the demo schema so big? 21 tables for a 30-person team?

Each table earns its place by representing a **persistent business object** (a quote, a deliverable, an editor's queue, a shoot day). Trying to collapse them — e.g. merging Service Job into Deliverable as a multi-valued attribute — loses the ability to view "today's shoots across all projects" or "this Cinematographer's weekly load".

Smaller teams CAN start with fewer tables (a Production Projects table + a Deliverables table + a Team table is a reasonable v0). But the 21-table shape scales to the team's actual workflows. Adding tables later is much easier than refactoring data out of denormalized fields.

### Can I just use Airtable native automations instead of an external sync runner?

For some flows, yes. The base uses native automations for in-Airtable reactivity (stage transition notifications, Cost Sheet → PP auto-linker). See [`airtable/automations.md`](../airtable/automations.md).

But for the **Sheets ↔ Airtable bridge**, native automations don't fit:
- They can't read from arbitrary Google Sheets cells (only Airtable triggers)
- They have per-month run quotas that don't scale to a per-edit cadence
- They have no good story for retries/deferrals

The external runner (your stack of choice) gives you a real programming language for the routing rules, error handling, and crack chains.

### Do I need to use Google Workspace?

The Apps Script pattern is Google-specific. If you're on Microsoft 365, the equivalent is **Office Scripts** + **Power Automate** — same shape (cell-level trigger writes to a log queue, runner drains it) but the code is different. The Airtable side is identical.
