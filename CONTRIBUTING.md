# Contributing

This repo is an open design blueprint. Contributions welcome in a few specific shapes — others kindly redirected.

## What's welcome

| Type | Examples |
|---|---|
| **Docs fixes** | Typos, broken links, unclear prose, missing translations |
| **Pattern additions** | New design patterns you've extracted from your own production house experience |
| **Adapter docs** | "Here's how I wired this pattern to MS 365 / Notion / Coda / Smartsheet" |
| **Case studies** | Anonymized incident reports that validate (or invalidate!) a pattern in the repo |
| **Schema variants** | Alternative schemas for adjacent businesses (event production, podcast studios, photo studios) — as a sibling doc, not a replacement |
| **Code skeletons** | Sync runners in other languages (the Python skeleton in `automation/python/` is a starting point — Node / Go / Ruby equivalents welcome) |

## What's not welcome (politely)

- **PRs to the demo Airtable base directly** — the schema lives there, but it's not a contribution surface. Open an issue describing the schema change you'd want and we'll evaluate.
- **Productizing this into a SaaS** — the MIT license allows it, but please don't open PRs that move the repo in that direction. Stay in blueprint mode.
- **Real production data of any kind** — never include real client names, real project IDs, real record IDs, real email addresses, real secrets. Sanitize aggressively.

## Process

1. Open an **issue first** describing what you want to change — even for small fixes. Saves time vs. PR-then-discuss.
2. For docs changes: PR with a focused diff. Reviewers will check tone (the repo aims for honest + specific, not hype-y).
3. For pattern additions: include at least one **war story** that motivated the pattern. Patterns presented in isolation are hard to evaluate.
4. For schema variants: include the rationale ("here's why my business needs a Sponsor table that PMC doesn't").

## Tone

The repo aims for:
- **Honest about trade-offs** — every pattern has a "cost of this pattern" section. Add yours.
- **Specific over abstract** — "the QU-2811 incident" beats "a hypothetical cross-client mix-up".
- **Code over claims** — if a pattern only works with specific code, show the code.
- **Skip the marketing voice** — no "revolutionary", "best-in-class", "unprecedented".

## Sanitization checklist (for any code or example you contribute)

- [ ] No real client names (use Client A/B/C or generic categories)
- [ ] No real team member nicknames (use Producer A/B/C, Director A/B/C, etc.)
- [ ] No real project codes (use DEMO-YY-NNN or QU-9NNN synthetics)
- [ ] No real Airtable base IDs, table IDs, record IDs (use placeholders or DEMO_*)
- [ ] No real Google Sheet IDs, Drive folder IDs (use `<…_SHEET_ID>` placeholders)
- [ ] No real API tokens, OAuth tokens, web app deployment URLs (use placeholders)
- [ ] No real email addresses (use `*@example.com`)
- [ ] No screenshots showing real names or data (or carefully obscure)

When in doubt, anonymize.

## Code style

- **Markdown** — GitHub flavored. One sentence per line where practical (helps diffs). Use `★` for "core / read this first" markers.
- **Apps Script** — single-source files; constants at the top; helpers below; web app endpoints last. No external dependencies (Apps Script doesn't have npm).
- **Python** — type hints + docstrings; standard library only where possible. The runner skeleton uses pure stdlib intentionally.
- **Mermaid** — `erDiagram` for schema relationships, `flowchart` for pipelines, `sequenceDiagram` for interaction protocols.

## License

MIT (see [LICENSE](LICENSE)). Contributions implicitly licensed under MIT.

## Maintainer

[@Panu-PookenZ](https://github.com/Panu-PookenZ) — original author + maintainer.

Open an issue, ping in PR description; turnaround target is "within the week" but not "within the hour".
