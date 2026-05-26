# Case studies

Real incidents that shaped the design. Names anonymized but the lessons are real.

| Case | What happened | Pattern documented |
|---|---|---|
| [curl-trap-on-apps-script.md](curl-trap-on-apps-script.md) | First markStatus deployment, 30 minutes burned on curl POST + Apps Script 302 redirect | [markStatus web app pattern](../docs/05-design-patterns/markstatus-web-app-pattern.md) → "use Python NOT curl" |
| [qu-fragmentation-cleanup.md](qu-fragmentation-cleanup.md) | One annual contract fragmented into 13 PPs; margin math unrecoverable until consolidation | [One QU = One PP](../docs/05-design-patterns/one-qu-one-pp-rule.md) |

## Why case studies

Patterns are abstract. Patterns landed *after* an incident, with the incident as the forcing function, are much easier to internalize than patterns presented in isolation. Each case study here:

1. Names the bug pattern that triggered it
2. Walks through what broke and why
3. Shows the cleanup steps
4. Distills the lesson into the corresponding design pattern doc

Reading order suggestion: if you only have time for one, read [`qu-fragmentation-cleanup.md`](qu-fragmentation-cleanup.md) — the cost-of-fragmentation insight applies far beyond this specific schema.
