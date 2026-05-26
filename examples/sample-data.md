# Sample data in the demo base

The demo base ships with **19 records across 7 tables**, modeling one example project end-to-end. This doc enumerates what's there.

## The story

**Producer A** at Example Production Co. quoted **Client X** (a technology company) for a 3-EP video series called **Example Show Series Q1**. The quote total is 800,000 THB under quotation number `QU-9001/1` (Project tier under the package `QU-9001` — Client X's annual contract). **Director A** is creative lead on all three EPs. **Editor A** owns post-production. **Cinematographer A** ("Cino A") shot all the footage across 2 shoot days. As of the snapshot, EP.1 is at V2 awaiting client feedback, EP.2 is in first-pass edit, EP.3 hasn't shot yet.

## What records exist

### 👥 Team — 4 records

| ชื่อเล่น | TSD Code | ตำแหน่ง |
|---|---|---|
| Producer A | PRA | Producer |
| Director A | DRA | Director |
| Editor A | EDA | Editor |
| Cino A | CIA | Cinematographer |

### 🎬 Production Projects — 1 record

| Project ID | ชื่องาน | Client | Product Code | Stage | Producer |
|---|---|---|---|---|---|
| DEMO-26-001 | Example Show Series Q1 | Client X | QU-9001/1 | 5-Post Production | Producer A |

Brief Date: 2026-01-15 · Deadline: 2026-03-31 · Outlet: Outlet A · Video Type: Branded Series

### 💰 Project Cost Sheets — 1 record

| Reference No. | Quotation No. | Client | Type | Period | Linked PP |
|---|---|---|---|---|---|
| QU-9001/1 | QU-9001/1 | Client X | Project | 2026-01-15 → 2026-03-31 | DEMO-26-001 |

### 🧾 Cost Sheet Items — 4 records (3 video + 1 equipment = 800k total)

| รายการ | หมวดงบ | Amount | Project Link |
|---|---|---|---|
| Video Production - EP.1 (Long-form) | Revenue | 250,000 | DEMO-26-001 |
| Video Production - EP.2 (Long-form) | Revenue | 250,000 | DEMO-26-001 |
| Video Production - EP.3 (Long-form) | Revenue | 250,000 | DEMO-26-001 |
| Equipment Rental - 6 shoot days | Cost | 50,000 | DEMO-26-001 |

### 🎞️ Deliverables — 4 records

| Episode ID | ชื่อ EP | Type | Stage | Director |
|---|---|---|---|---|
| DEMO-26-001-L01 | Example Show Series Q1 - EP.1 Introduction | L (long) | V2 | Director A |
| DEMO-26-001-L02 | Example Show Series Q1 - EP.2 Deep Dive | L | Editing | Director A |
| DEMO-26-001-L03 | Example Show Series Q1 - EP.3 Wrap-up | L | Pre-production | Director A |
| DEMO-26-001-S01 | Example Show Series Q1 - Short Cut EP.1 | S (short) | Editing | Director A |

Publish dates set on the long-form EPs (Mar 15, 22, 29). Short cut has no publish date yet.

### 📹 Service Job — 2 records

| ชื่องาน | Show | Shoot Date | Status | Videographer |
|---|---|---|---|---|
| DEMO-26-001 - Shoot Day 1 (EP.1 + EP.2) | Example Show | 2026-02-10 | Delivered | Cino A |
| DEMO-26-001 - Shoot Day 2 (EP.3) | Example Show | 2026-02-24 | Confirmed | Cino A |

### ✂️ Post Production Service — 3 records (1 per long-form EP)

| รายการตัดต่อ | Editor | Stage | End Date | Status |
|---|---|---|---|---|
| DEMO-26-001-L01 - Editing | Editor A | V2 | 2026-03-15 | In Progress |
| DEMO-26-001-L02 - Editing | Editor A | Editing | 2026-03-22 | In Progress |
| DEMO-26-001-L03 - Editing | Editor A | Pre-production | 2026-03-29 | Scheduled |

The Short Cut (S01) doesn't have a PPS entry yet (would be created when it enters the edit queue).

## What's intentionally NOT in the demo

- **External Costs** — empty. In production this is where the accountant uploads actual spend; the demo shows estimated margin only.
- **Freelance Costs** — empty. The shoot days use only the in-house Cinematographer.
- **Meetings / Action Items / Decisions / Structural Outputs / Parking Lot** — empty. The meeting intelligence pipeline isn't demonstrated in the sample.
- **Sync Jobs** — empty. No automation has run against the demo base.
- **Timeline Milestones** — empty. The PP shows Brief Date + Deadline but no granular milestones.
- **Internal Projects + Internal Project Stages** — empty. These model the production house's own internal initiatives (KPI reviews, team development, ops projects) — separate from client-facing Production Projects.
- **Contacts** — empty. The Team table has the staff; Contacts is for external counterparties (client contacts, freelancer agents).
- **Production Monthly Budget** — empty. This is the rolling P&L sheet maintained by the accountant.
- **Feedback Log** — empty. Per-EP/per-Service-Job feedback rounds.

To expand the demo, follow the patterns in the 7 populated tables. Each table's full schema is in [`airtable/tables/`](../airtable/tables/).

## Want to start from a clean schema?

If you'd rather see the schema with NO records (clean canvas for your own data):

1. Right-click **Production Management Center (Copy)** → **Duplicate base** → choose **Without records**
2. Done — you have a clean clone in your workspace.

The clone will have **different** table + field IDs than the demo (Airtable only preserves IDs within Workspace-level duplicates of certain plans). Your Apps Script + sync runner will need YOUR IDs.

## Want to clean the demo back to empty?

If you want to wipe the sample data and start from empty (don't do this if other people are also exploring the demo!):

1. Select all rows in each table → Delete (this is destructive — undo is per-table only).
2. Or: ask the demo workspace owner to restore from snapshot.

In practice it's safer to clone the schema to your own workspace and experiment there.
