# ☑️ Action Items

> **Table ID:** `tblh3wMpqdOllNH49`
> **Primary field:** `Task` (`fldsIxkAd7uKN3qkZ`)
> **Field count:** 15
> **Field-type mix:** 4× multipleRecordLinks, 3× singleLineText, 3× singleSelect, 2× number, 2× multilineText, 1× date

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `Task` | `fldsIxkAd7uKN3qkZ` | singleLineText | Imperative task description — e.g. 'ส่ง treatment v2 ให้ client' |
| `Source Meeting` | `fld0p14KevACohG65` | link → (linked table) |  |
| `Owner` | `fld76wP4JZ9Wa1aVG` | link → (linked table) | Owner — link to Contacts |
| `Owner Confidence` | `fldgYF5wAK99DBCfR` | number | AI confidence in owner attribution 0-1 |
| `Due Date` | `fldq04nsqn4SLVcbl` | date |  |
| `Due Date Confidence` | `fldYaq25QUUPex5XY` | number |  |
| `Priority` | `fldLym9p1MzcYkSNB` | singleSelect |  |
| `Status` | `fld63YyizRhfSkc1x` | singleSelect |  |
| `Related Production Project` | `fldAeoaV0gst4chNl` | link → (linked table) |  |
| `Related Internal Project` | `flduwIlvLNjC74Jnn` | link → (linked table) |  |
| `Transcript Quote` | `fld19AkHyGLALCzUO` | multilineText | Anchor quote from transcript for verification |
| `Transcript Speaker` | `fldlJcVF73d8wZgoy` | singleLineText | English full name of the speaker who said the quote |
| `Approx Position` | `fldf4NjaGXxanhwzR` | singleSelect | Where in the meeting (early/mid/late) — since timestamps not available from .docx |
| `Blocked By` | `fldBKnkRHEIc9dQnu` | singleLineText | Free-text — external blocker or dependency description |
| `Notes` | `fldROiRx07jmCRFnD` | multilineText |  |
