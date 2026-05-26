# Cost Sheet-first principle

> **The Product Code on a Production Project record is populated only when a matching Cost Sheet record exists in Airtable. Never from a Sheet edit. Never as a placeholder.**

## The bug this prevents

Without this rule, the team kept hitting the same shape of bug:

1. A Producer adds a new row to the Producer Dashboard Sheet for a new project.
2. The Producer types a Product Code like `QU-2811` into the Product Code column — but no Cost Sheet has been created yet.
3. Sync runner sees `QU-2811`, writes it to `Production Projects.Product Code`.
4. Weeks later, accounting creates a Cost Sheet for a different project under `QU-2811` (the Producer's earlier typing was a placeholder / guess / wrong).
5. Auto-linker matches Cost Sheet → Production Project by Product Code. **Wrong PP gets linked to the Cost Sheet.**
6. Margin rolls up against the wrong project. Cross-client data contamination.

This actually happened: `QU-2811` was typed against both a PEA (utility) project AND a foundation project. When the real Cost Sheet for one of them arrived, the rollup math was wrong by ~hundreds of thousands of THB.

## The rule

| What | Where | Who writes it |
|---|---|---|
| `Production Projects.Product Code` | PP table, single field | **Only** the `budget-sync` skill, **only** when a matching Cost Sheet record is upserted into Airtable |
| `Deliverables.Product Code` | Deliverables table | Sheet's PD column F syncs here freely (per-EP tag) |
| Sheet PD column F (Product Code) | Producer Dashboard | Producer can type freely — but it never flows to PP |

The same Product Code field exists on both PP and Deliverables. Producers can type at the Deliverable level (it's a per-EP tag — they may know a Cost Sheet is coming). The PP-level field is reserved for the truth.

## Why two fields with the same name

Because the **questions they answer are different**:

- `Deliverables.Product Code` = "what line item in some quote is this deliverable expected to be?"
- `Production Projects.Product Code` = "what is the canonical QU that this PP is quoted under?"

A PP's `Product Code` is the **claim** that this PP has a real quote in the books. The claim is only true once a Cost Sheet exists. The Deliverable's `Product Code` is a **prediction** that the deliverable will fit into a (possibly-future) quote line.

## The 3-tier QU format

The Cost Sheet-first principle works with a strict 3-tier QU naming:

| Tier | Format | Meaning | Example |
|---|---|---|---|
| **Package** | `QU-XXXX` (plain) | Master quote covering multiple PPs (e.g. an annual contract) | `QU-9001` |
| **Project** | `QU-XXXX/N` | One specific PP within a package | `QU-9001/2` |
| **Item** | `QU-XXXX-V1`, `QU-XXXX-A2`, `QU-XXXX-EP3` | One line item / deliverable within a project | `QU-9001/2-V1` |

So a PP record carries `Product Code = QU-9001/2` (Project tier). A Deliverable record under it carries `Product Code = QU-9001/2-V1` (Item tier). The matching Cost Sheet's `Product Code = QU-9001/2` (Project tier).

When the budget-sync skill auto-links: it extracts the base QU (`extract_quotation_base()` → strips `-V1`, `-A2`, etc.) and matches Cost Sheet ↔ PP by that base form.

## Enforcement in code

The sync runner explicitly does NOT write `Production Projects.Product Code` from Sheet edits:

```python
# In the field routing table (excerpt from sync runner)
ROUTING = {
    ("All Projects", "Product Code"): None,  # never sync; PP gets it from budget-sync
    ("PD Producer A", "Product Code"): ("Deliverables", "Product Code"),  # per-EP fine
    ("PD Producer B", "Product Code"): ("Deliverables", "Product Code"),
    # ...
}
```

And in the SKILL.md prompt (Hard Rule 14):
> **PP.Product Code is derived from Cost Sheet only** — Sheet PD col F (Product Code) syncs to `Deliverables.Product Code` ONLY. **Never write** to `Production Projects.Product Code` from a Sheet edit.

## The inverse — `budget-sync` populating PP.Product Code

The budget-sync skill processes Cost Sheets and explicitly fills `Production Projects.Product Code`:

```python
# After Cost Sheet record is created/matched + linked to PP
base_qu = extract_quotation_base(quotation_no)  # "QU-9001/2" from "QU-9001/2-V1"
current = pp.get("fields", {}).get("Product Code", "").strip()
if not current:
    patch_pp(pp_record_id, {"Product Code": base_qu})
elif current == base_qu:
    pass  # idempotent no-op
else:
    # mismatch — ABORT + flag conflict, don't auto-overwrite
    log_conflict(pp_record_id, current, base_qu)
```

The conflict-on-mismatch handling is non-negotiable: if `PP.Product Code` already has a different value, **abort and surface to a human**. Silent overwrite is exactly the bug pattern we're preventing.

## What this implies for the human workflow

| Step | Producer action | What the system does |
|---|---|---|
| 1 | New brief arrives | Adds a row to Producer Dashboard with Project Name + Brief Link |
| 2 | (no QU yet) | Sync writes PP record with `Product Code` empty |
| 3 | Quote drafted | Producer or accountant creates Cost Sheet with `QU-9001/2` |
| 4 | (auto) | budget-sync writes `PP.Product Code = QU-9001/2` (was empty → fills) |
| 5 | Deliverable assigned to line item | Producer types `QU-9001/2-V1` on the per-EP row of Sheet |
| 6 | (auto) | sync writes `Deliverables.Product Code = QU-9001/2-V1` |

Step 4 is the moment of truth — the **PP-Cost Sheet link** comes into existence and the PP becomes "real money".

## Cost of this pattern

- **Apparent friction:** Producer types a QU on the Sheet, sees it not appear on the PP — feels like the system swallowed their input. (It did, just not at the PP level.) Onboarding doc has to make this explicit.
- **Reporting depends on Cost Sheets being current:** if a Producer drags her feet on creating Cost Sheets, the margin reports look incomplete. Solved by accountant policy: Cost Sheet record exists by the end of week of brief arrival.
- **Cannot pre-populate PP for known recurring work:** an annual recurring project still has to wait for a Cost Sheet record before its PP gets a QU. Solved by creating placeholder Cost Sheets at year-start for known recurring contracts.

For the volume of cross-client data corruption it prevents, the trade-offs are net favorable.
