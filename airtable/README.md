# Airtable schema

The PMC base has **21 tables / 519 fields** total. This directory documents the schema as code.

## Try the demo base

A public demo base mirrors the production schema exactly (Airtable's "Duplicate base" preserves internal table + field IDs, so the demo is a perfect clone). The demo is **schema-only** (0 records) — read the structure, clone it into your own workspace, then populate with your own data.

→ **[Open the demo invite](https://airtable.com/invite/l?inviteId=invd2RlOujhdPOQpX&inviteToken=82b45a12a06962325e6bb07f8706204f977bd37daf8a9ebaf304485c91a74e2b&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts)**

Once you join the workspace, the demo base is **Production Management Center (Copy)** (`appIYEG4tZHqUhupQ`).

## Browse tables

→ **[Table reference (INDEX.md)](tables/INDEX.md)** — full list with 1-line role descriptions

The four "core" tables to read first if you're skimming:

| Table | Why |
|---|---|
| [🎬 Production Projects](tables/production-projects.md) | The unit of quoted work |
| [🎞️ Deliverables](tables/deliverables.md) | The unit of shipped work (1 PP → N Deliverables) |
| [💰 Project Cost Sheets](tables/project-cost-sheets.md) | The truth about money |
| [📹 Service Job](tables/service-job.md) | The unit of shoot work (crew + date) |

## Clone the demo into your own workspace

1. Click the demo invite link above; accept.
2. Open **Production Management Center (Copy)** in the My First Workspace.
3. Right-click the base → **Duplicate base**.
4. Choose your own workspace as the destination.
5. Choose "Without records" — you only want the schema.
6. Click **Duplicate**.

You now have a fresh copy in your workspace. Note: the new copy will have **different** table + field IDs than the production version (Airtable only preserves IDs within a Duplicate to the same workspace). Your Apps Script + sync runner will need to use **your** IDs.

To get your new IDs:
- Open each table → click the dropdown next to the table name → **Edit table** → the URL bar shows the table ID (`tbl...`).
- For field IDs: open Settings → API documentation, or use the `pyairtable` library.

## Populate with sample data

The demo intentionally has 0 records so you start clean. For a worked example, see [`examples/sample-data.md`](../examples/sample-data.md) — describes a synthetic project end-to-end (Producer A quotes Client X for a 3-EP video series; PP record + Cost Sheet record + 3 Deliverable records + 3 Service Job records + 1 PPS row).

## Schema documents

| File | What |
|---|---|
| [`tables/INDEX.md`](tables/INDEX.md) | List of all 21 tables with role labels |
| `tables/*.md` | One per table: ID, primary field, field-type mix, full field list with types + descriptions |
| [`views.md`](views.md) | Key views per role (Producer / Director / Editor / Money) |
| [`formulas.md`](formulas.md) | Reusable formula + rollup patterns (margin, milestone-driven %, status mapping) |
| [`automations.md`](automations.md) | Airtable native automation patterns used in the base |

## What the schema files are auto-generated from

The `tables/*.md` files were generated from the demo base's [API schema](https://airtable.com/api/meta) via the `gen-table-docs.py` script (in this repo's commit history). The script is not shipped because regenerating from your own base is trivial:

```bash
# After you have AIRTABLE_PAT + your_base_id:
curl -H "Authorization: Bearer $AIRTABLE_PAT" \
  "https://api.airtable.com/v0/meta/bases/$YOUR_BASE_ID/tables" \
  > schema.json
python3 gen-table-docs.py schema.json out/
```

This means **you can regenerate the doc tree against your own base any time**. The schema docs stay in sync with the live base, not the other way around.

## What does NOT ship in schema docs

- **Field default values** — most are blank; defaults that matter are documented in per-table prose
- **View configurations** — view filters/sorts are described conceptually in [`views.md`](views.md), not exported field-by-field
- **Automation triggers** — Airtable native automations described conceptually in [`automations.md`](automations.md)
- **Per-field permissions** — the production base uses simple "everyone can edit" inside the small team; no field-level locks
