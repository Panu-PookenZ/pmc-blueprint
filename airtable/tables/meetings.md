# 📝 Meetings

> **Table ID:** `tbldNM25crY8gvOVI`
> **Primary field:** `ชื่อประชุม` (`fld2SdTknAF7VahMN`)
> **Field count:** 33
> **Field-type mix:** 9× multilineText, 8× multipleRecordLinks, 6× singleLineText, 5× singleSelect, 3× url, 2× dateTime

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `ชื่อประชุม` | `fld2SdTknAF7VahMN` | singleLineText |  |
| `วันที่` | `fldB2q1R8bwU6OBhj` | dateTime |  |
| `ประเภท` | `fldnlixUNl8oUvkzN` | singleSelect |  |
| `Projects ที่เกี่ยวข้อง` | `fldsNfYicfSnjaDcb` | link → (linked table) |  |
| `Calendar Event ID` | `fld71AKdxJpaC4PkA` | singleLineText |  |
| `Pre-meeting Brief` | `fldy4qybjUq4qKyad` | multilineText |  |
| `Meeting Notes` | `fld5vYeSoikVSWoun` | multilineText |  |
| `Suggested Actions` | `fldBRVGcPrxBUsz9E` | multilineText |  |
| `Transcript Link` | `fld8GAgXnfsY3S4nZ` | url |  |
| `Internal Project` | `fldhWYF6sS3FOliX4` | link → (linked table) | Internal Project ที่ประชุมนี้เกี่ยวข้อง — sync อัตโนมัติจาก Internal Projects.Meetings |
| `Action Items` | `fldeqh7t4I7PnGgxi` | link → (linked table) | Auto-linked from Action Items table (Source Meeting field). Each linked record = 1 atomic action item with Owner, Due... |
| `Structural Outputs` | `fldIxzis0LYQiVZG6` | link → (linked table) |  |
| `Parking Lot` | `fldX9Tm3GOakoVBwY` | link → (linked table) |  |
| `Transkriptor ID` | `fldcZ5gGYvhqBzwyx` | singleLineText | tid from Transkriptor — for idempotency check, e.g. #Transkription#01KN1T9G5W98F34WPG8MHSAWAW |
| `Drive File ID` | `fldcapB0EJi2mSw8z` | singleLineText | Google Drive file ID of the .docx export — primary source for processing |
| `Drive File URL` | `fldpf1gJWzJp65xsb` | url | Direct link to the .docx in Drive for manual review |
| `Counterparty` | `fldiHwJ9R636sB7QM` | singleSelect | Who the meeting is with — drives routing, confidentiality, summary tone |
| `Phase` | `fldX8poYsUe5iMKt6` | singleSelect | What phase of work the meeting addresses — drives extraction emphasis |
| `Attendees (Contacts)` | `fldtyXrTKRzFH3Aci` | link → (linked table) | Attendees as Contacts records — primary going forward (legacy ผู้เข้าร่วม → Team kept for backwards compatibility) |
| `Summary Short` | `fldtEmMD1H3uuezPH` | singleLineText | 1 ประโยค — สำหรับ Slack notification |
| `Summary Long` | `fldfYHv6g0bGyn4xu` | multilineText | 1 paragraph 4-6 ประโยค — สำหรับ Notion / Meeting Notes header |
| `Language` | `fldpuWHHkOWDaxsmi` | singleSelect |  |
| `AI Review Status` | `fld2YYAxus1fHG6Zw` | singleSelect | EP review state — pending = AI extracted, awaiting EP review |
| `Decisions Log` | `fld12md8KtTTdSvMx` | multilineText | Markdown list of decisions made — each item: statement / scope / made_by / quote (Minimal path: text. Upgrade to sepa... |
| `Risks Log` | `fldgIBxhLFbcyVWoy` | multilineText | Markdown list of risks raised — description / severity / category / raised_by / mitigation |
| `Open Questions Log` | `fldg2ACHpXf6HtCua` | multilineText | Markdown list — questions raised, who needs to answer, what they block |
| `Key Quotes` | `fld5yAxPinMcxvS21` | multilineText | Searchable quotes from meeting — speaker / topic / quote (one per line for grep/search) |
| `ผู้เข้าร่วม` | `fldjvNv8W8kHk5Pcw` | link → (linked table) |  |
| `Action Items (legacy text)` | `fld4zwCJC8pyGR8n0` | multilineText | Legacy multilineText field — pre-Schema-v1.2 dump. New extractions write to Action Items table (link below). Kept for... |
| `Decisions` | `fldtSd2I3E48UBuvw` | link → (linked table) | Atomic decisions extracted from this meeting (parallel to Action Items / Structural Outputs / Parking Lot). Reverse-l... |
| `Notion Page URL` | `fldWie619vkVIEn9h` | url | Direct link to the Notion page for this meeting (filled by meeting-intelligence skill — Schema v1.3) |
| `Notion Page ID` | `fld3F92uZ7W5YdHog` | singleLineText | Notion page ID for idempotency check by meeting-intelligence skill |
| `Last Notion Sync` | `fldnM0aViT3nys9ax` | dateTime | When meeting-intelligence skill last wrote the Notion page (UTC ISO timestamp) |
