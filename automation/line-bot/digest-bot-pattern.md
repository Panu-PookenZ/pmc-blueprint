# Daily digest bot pattern (a.k.a. "Hedwig")

The production house pushes a **twice-daily digest** of the PMC state to a small leadership group via a Line bot. This doc is the design — the actual implementation is straightforward Bash + `curl` to the Line Push Message API.

## Why a bot

The Airtable base has the truth. The Sheets have the workspace surface. **Neither is the right surface to monitor health.** A team lead doesn't want to log into Airtable every morning to find out:

- 🚨 Did any sync job fail overnight?
- 🌅 What's shooting today?
- 🎞️ Which EPs publish today?
- 📎 Any new brief came in overnight?
- ☑️ Any action items assigned to me?
- 🎬 Did any project move stages overnight?

A push notification in the channel the team already uses is the right surface.

## When it fires

| Slot | Time (Asia/Bangkok) | Audience | Content |
|---|---|---|---|
| Morning | 08:00 daily | leadership group | what changed in last 12h + today's shoots + today's publishes + my action items |
| Evening | 18:00 Mon-Fri | leadership group | tomorrow's shoots + upcoming edit deadlines + EP delivered today |
| Weekly preview | Sunday 16:00 | leadership group | next 7 days outlook |

## Architecture

```
┌─────────────┐      ┌─────────────────────────┐      ┌──────────────┐
│  cron       │ ───→ │  Bash digest builder    │ ───→ │  Line Push   │
│  08:00 BKK  │      │  - query Airtable PMC   │      │  API         │
└─────────────┘      │  - query Sheets         │      └──────────────┘
                     │  - filter "big updates" │
                     │  - compose ≤2500 chars  │
                     │  - escape Thai          │
                     └─────────────────────────┘
                                  │
                                  ▼
                     ┌─────────────────────────┐
                     │  Notion DB audit row    │
                     │  (slot, date, content)  │
                     └─────────────────────────┘
```

## Content rules

The digest is **terse**. Default to silence — only include a section if there's something to say.

| Trigger | Section in digest |
|---|---|
| Production Project gets a new Brief Link | 📎 Brief ใหม่ |
| Cost Sheet record created | 💰 Cost Sheet ใหม่ |
| Deliverable.Stage changed | 🎬 Stage transitions |
| Action Item created (group by meeting) | ☑️ Action items ใหม่ |
| Sync Job status=Failed in window | 🚨 Sync fail |
| Deliverable.Stage → Delivered/Published | 🎉 EP เสร็จ |
| Service Job tomorrow (evening slot) | 🌅 พรุ่งนี้ |
| Post Prod End Date ≤3d AND not Final (evening) | 🎞️ Edit deadlines |
| Feedback Log Obj1-4 < threshold | 📊 KPI red flag |

## Push API (Line)

Secrets in macOS Keychain — never in source:

```bash
TOKEN=$(security find-generic-password -a hedwig -s HEDWIG_LINE_TOKEN -w)
GROUP=$(security find-generic-password -a hedwig -s HEDWIG_GROUP_ID -w)

curl -sS -X POST "https://api.line.me/v2/bot/message/push" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"to\":\"$GROUP\", \"messages\":[{\"type\":\"text\",\"text\":\"$DIGEST_BODY\"}]}"
```

Fallback if group push fails: multicast to individual user IDs at `/v2/bot/message/multicast`.

## Why this pattern, not Slack / email

| Choice | Why |
|---|---|
| Line | The team already uses Line for fast async ops. Email + Slack are both checked late. |
| Push API not chat bot | One-way digest — no need for command-handling complexity |
| Group push primary, user multicast fallback | Group keeps the audience small + everyone sees the same digest; fallback handles transient group ID changes |
| Twice-daily | Morning = "what's incoming"; evening = "what's tomorrow". Once per day misses the evening-prep window |
| Optional audit record in Notion | Lets the team scroll past digests and search them later — Line message search is poor |

## Reference

For the full ruleset + a sample digest in Thai, see the `pmc-hedwig-digest` skill spec (internal). The pattern above is the universal extraction — adapt to your audience's language and tooling.
