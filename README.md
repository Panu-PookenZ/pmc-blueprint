# pmc-blueprint

> A production-management blueprint for video production houses, built on Airtable + Google Sheets + Apps Script.

This repo is the **design + code blueprint** behind a real production management system running a 30-person video production house. Not a product, not a SaaS — a documented pattern you can adapt, fork, or learn from.

```
       ┌─────────────┐                   ┌──────────────┐                  ┌──────────────┐
       │ Google      │  onEdit → queue   │ Sync runner  │  PATCH records   │ Airtable     │
       │ Sheets      │  ─────────────►   │ (your stack) │  ─────────────►  │ PMC base     │
       │ (workspace) │                   │              │                  │ (truth)      │
       └─────────────┘  ◄─────────────   │              │                  │ 21 tables    │
                        web app: flip    │              │                  │ 519 fields   │
                        status            └──────────────┘                  └──────────────┘
                        synced/deferred
```

The system unifies three views of production work into one durable source of truth:

- **Producer view** — projects, budgets, deadlines
- **Director view** — per-episode creative work
- **Editor view** — post-production queue and stage transitions

…and it lets Sheets stay as the **workspace surface** people edit every day while Airtable holds the **structured truth**. A change-feed pipeline syncs the two.

## At a glance

| | |
|---|---|
| **Schema** | 21 tables, ~519 fields, fully linked. See [data model](docs/03-data-model.md). |
| **Sync** | Apps Script `onEdit` writes change feed; runner drains it; web app flips status. See [pipeline](docs/04-sync-pipeline.md). |
| **Patterns** | 4 reusable design patterns ([Cost Sheet-first](docs/05-design-patterns/cost-sheet-first-principle.md), [status-based gate](docs/05-design-patterns/status-based-gate-not-watermark.md), [one QU = one PP](docs/05-design-patterns/one-qu-one-pp-rule.md), [markStatus web app](docs/05-design-patterns/markstatus-web-app-pattern.md)) |
| **Try the demo** | [Open Airtable invite](https://airtable.com/invite/l?inviteId=invd2RlOujhdPOQpX&inviteToken=82b45a12a06962325e6bb07f8706204f977bd37daf8a9ebaf304485c91a74e2b&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts) → schema fully wired, sample project pre-loaded. [Walk through it in 15 min](examples/try-it-in-15-min.md). |
| **Adapt for your team** | [Connect your own Sheet](examples/connecting-your-sheet.md) — 11 steps, ~30 min |
| **Real war stories** | [Case studies](case-studies/) — incidents that shaped the design |

---

## Why this exists

Every video production house hits the same walls around year 2:

1. **Spreadsheets multiply** — each Producer has their own; each Director has their own; the Editor's calendar is a third one. None of them agree at any moment.
2. **Money lives in PDFs** — Cost Sheets are quotes in Sheets, actual spending is in the accountant's file, and nobody knows the real margin per project until the books close.
3. **Status updates are tribal** — "where's that project?" requires 3 Slack messages and a glance at a shared Drive folder.
4. **Schema drift kills automation** — every time someone renames a column or adds a tab, last week's automation breaks silently.

PMC (Production Management Center) is one team's answer to those walls. The repo documents the design so others can adapt it without reinventing every wall.

---

## How to navigate this repo

| If you want to… | Start here |
|---|---|
| Understand the big picture in 1 page | [`docs/00-tldr.md`](docs/00-tldr.md) |
| Read the vision + why | [`docs/01-vision.md`](docs/01-vision.md) |
| See the data model (21 tables + relationships) | [`docs/03-data-model.md`](docs/03-data-model.md) |
| Understand the sync pipeline | [`docs/04-sync-pipeline.md`](docs/04-sync-pipeline.md) |
| Browse reusable design patterns | [`docs/05-design-patterns/`](docs/05-design-patterns/) |
| Try the demo Airtable + see the schema | [`airtable/README.md`](airtable/README.md) |
| Read the Apps Script code | [`automation/apps-script/`](automation/apps-script/) |
| Try it on your own data in 15 min | [`examples/try-it-in-15-min.md`](examples/try-it-in-15-min.md) |
| Read war stories / case studies | [`case-studies/`](case-studies/) |

---

## What's NOT in this repo (and why)

This is an open design blueprint, but a few things stay behind glass:

- **Production data** — no real records, no client names, no Producer/Director nicknames. Everything in the repo and the demo Airtable is anonymized (`Producer A/B/C`, `Client X/Y/Z`, `DEMO-26-001`).
- **Skill/agent prompts** — the team uses a private Claude Code plugin to drive the routines. The plugin source itself isn't published; the underlying patterns (status-based gates, web app endpoints, Hybrid 3-tier model routing) are.
- **Secrets** — API tokens, web app deployment URLs, Line bot tokens, Trello tokens all live in macOS Keychain and Apps Script `ScriptProperties`, never in the repo.
- **Internal sync logs** — the daily run logs reference real record IDs and project codes, so they stay private.

Production source links (Google Sheets / Drive folders) referenced in the docs are **domain-restricted to one organization's email** — they appear as placeholders in code (`<PRODUCER_DASHBOARD_SHEET_ID>`) and the prose explains the role each one plays.

---

## Try the demo Airtable

The schema (21 tables / 519 fields) is mirrored into a public-access demo base. Open the [demo invite](https://airtable.com/invite/l?inviteId=invd2RlOujhdPOQpX&inviteToken=82b45a12a06962325e6bb07f8706204f977bd37daf8a9ebaf304485c91a74e2b&utm_medium=email&utm_source=product_team&utm_content=transactional-alerts) and explore. The demo base has the schema fully wired (formulas, rollups, lookups, views) plus a handful of synthetic records so the relationships are visible.

See [`airtable/README.md`](airtable/README.md) for what's in the demo and how to clone it into your own workspace.

---

## License

[MIT](LICENSE) — fork, adapt, ship. Attribution welcome but not required.

## Acknowledgements

Built and refined inside one video production house over 2024-2026. Special debt to the producers, directors, and editors who tolerated weeks of "can you re-pick that episode type again, the script broke" while the pipeline grew up.

---

🤖 This README and the documentation in this repo were generated with [Claude Code](https://claude.com/claude-code) as the writing partner. The system design is the team's; the prose polish is shared work.
