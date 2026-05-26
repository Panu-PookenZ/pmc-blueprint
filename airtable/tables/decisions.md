# ⭐ Decisions

> **Table ID:** `tblGL5j0BuCNmfOi8`
> **Primary field:** `Decision` (`fldvkf9AceCeyzWO3`)
> **Field count:** 16
> **Field-type mix:** 6× multipleRecordLinks, 3× singleSelect, 3× multilineText, 2× singleLineText, 1× number, 1× multipleLookupValues

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `Decision` | `fldvkf9AceCeyzWO3` | singleLineText | Imperative statement of what was decided |
| `Source Meeting` | `fld87ww2KZyCqnMb8` | link → (linked table) | Link to the meeting where this was decided |
| `Category` | `fldy0qsDAOddHWxtC` | singleSelect | What kind of decision |
| `Made By` | `fldlUNdBQYUJZwhg6` | link → (linked table) | Decision-makers (multi-link for group decisions). Empty when Transcript Speaker is unresolved. |
| `Made By Confidence` | `fldlI7MNrhidYxRmj` | number | AI confidence in attribution: 1.0=exact match, 0.7=fuzzy match, 0.0=unmatched |
| `Context` | `fldLLBLiln3ULJ1fB` | multilineText | Why + situation |
| `Quote` | `fldY05mF0Uz1avfBt` | multilineText | Anchor quote from transcript |
| `Transcript Speaker` | `fldtSxGmB72hnzNUk` | singleLineText | English full name of speaker (fallback when Made By unresolved) |
| `Related Production Project` | `fldJAtx8jJ9fkxwxc` | link → (linked table) | Related Production Project (Layer 1) |
| `Related Internal Project` | `fldbDB4DxTm2KsEXU` | link → (linked table) | Related Internal Project |
| `Status` | `fldDCXOCR3VvhPWJq` | singleSelect | Lifecycle state of this decision |
| `Approx Position` | `fldxaofs3I7fR8Bgw` | singleSelect | Where in the meeting (proxy for timestamp, since .docx export lacks timestamps) |
| `Notes` | `fld61Bg2jUr5DywBL` | multilineText | Free-form notes |
| `Superseded By` | `fldxXKvYpOXeZkY3K` | link → (linked table) | If superseded by a later decision, link to the decision that replaces it (self-link) |
| `Supersedes` | `fldnFsRLUWqzpx9Oo` | link → (linked table) | Decisions that THIS record supersedes (reverse of Superseded By). Useful to trace decision lineage forward. |
| `Meeting Date` | `fldAopJSGkTmIfqqe` | lookup |  |
