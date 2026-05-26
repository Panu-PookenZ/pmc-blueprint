# 🎞️ Deliverables

> **Table ID:** `tblOTqKShhtRCPvnO`
> **Primary field:** `ชื่อ EP` (`fldrZl8LUExjsQbov`)
> **Field count:** 42
> **Field-type mix:** 10× multipleRecordLinks, 8× url, 5× singleLineText, 5× multipleLookupValues, 3× richText, 2× multilineText, 2× date, 2× checkbox, 1× singleSelect, 1× rating, 1× number, 1× rollup, 1× formula

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `ชื่อ EP` | `fldrZl8LUExjsQbov` | singleLineText | ชื่อ deliverable (เช่น EP.1, V1, Short 1, Full clip) |
| `Project` | `fldVZywDDxrrmrxNg` | link → (linked table) | Link to parent Production Project |
| `Project Name (lookup)` | `fldp2KqWZ1pIS7fUJ` | lookup |  |
| `Project ID (lookup)` | `fldzM2a2sFGNFL9eQ` | lookup |  |
| `Episode ID` | `fld1vK7AyjVqXDopW` | singleLineText |  |
| `Episode Type` | `fldI46w3uGiLuba9H` | singleLineText |  |
| `Brief Date (Project)` | `fldLpUI9Y7w0ZZnPA` | lookup | Lookup ของ Brief Date จาก Production Project แม่ — ไม่ใช่ start date ของ EP (เปลี่ยนชื่อจาก "Project Start Date" 2026... |
| `Project Producer (lookup)` | `fldrSzdWZoqUeBeA2` | lookup |  |
| `Director` | `fldlqBp57mxzqCSUI` | link → (linked table) |  |
| `Cost Sheet Link` | `fldF1fcvO2TlM3HFv` | url | Per-EP Cost Sheet URL (synced from PD col I). Replaces project-level field on Production Projects (migrated 2026-05-19). |
| `Stage` | `fldqxcoqHtKrCoETD` | singleSelect |  |
| `Storyline / PPM Link` | `fldEmFasj1cZtjcri` | url | ลิงก์ไปยัง Storyline / PPM / Shot List specific ของแต่ละ EP (ถ้ามี custom จาก Project master) |
| `Timeline Summary` | `fldS2lEued0kyswbz` | multilineText | 5-8 key milestones extracted from project Timeline file + brief Opus insight (auto-populated by brief-cracker --mode=... |
| `Post Production Service` | `fldwVtK1LnNM8Pj98` | link → (linked table) |  |
| `Publish Date` | `fld2NVDNImqgag0aT` | date |  |
| `Success Rate` | `fldJ4U3p4md0u7UPP` | rating |  |
| `NPS Score` | `fldxexanOvCSQKVSf` | number |  |
| `Footage Link` | `fldV9xFFBVMnX89f2` | url |  |
| `Draft History` | `fldroHhxY7nftmx3s` | richText | Aggregated history ของ Draft links + versions + revision notes (rich text, multi-line). Source: pmc-trello-intelligen... |
| `Final Link` | `fldFzt5pPZ9T2QaSS` | url |  |
| `Publish Link` | `fldBufAenfKvfK825` | url |  |
| `Producer Note` | `fldhNVs7EmU93CqUm` | richText |  |
| `Editor (from PPS, lookup)` | `flduWzgQwbzLTlWQh` | lookup |  |
| `Videographer` | `fldwCjVPGz0XkxH9Z` | link → (linked table) |  |
| `Next Milestone Date` | `fldMWOE9cAJUBFZfx` | rollup |  |
| `Project Material` | `fldCZqcX60ntSOzqr` | richText | Misc files/links จาก Trello card ที่ระบุกลุ่มไม่ได้ (cover images, reference photos, inserts, etc.). Source: pmc-trel... |
| `Location URL` | `fldWANQdxEKdqmJ1p` | url | Location doc link จาก Trello card description (Google Doc ที่ระบุ location ถ่าย). Source: pmc-trello-intelligence skill. |
| `Trello Card URL` | `fldVPmkSE1I1RM6lD` | url | Back-pointer ไป Trello card ของ Deliverable นี้ (1:1 mapping). Source: pmc-trello-intelligence skill. |
| `Vertical Video` | `fldsCOyMCMCB4faQO` | checkbox |  |
| `MAM Uploaded` | `fldkwpmnPOxax8ROa` | checkbox |  |
| `Shoot Date` | `fldIOjFFBmrzBt1ET` | date | Shoot date extracted from project Timeline file (auto-populated by brief-cracker --mode=timeline) |
| `Producer` | `fldbqCi4l5WgXLWDW` | link → (linked table) |  |
| `Product Code` | `fldus4YxQsqw068dC` | singleLineText |  |
| `EP. Label` | `fld8zPoPyZgNPvgwH` | singleLineText |  |
| `Shooting Script Link` | `fldsPP4dpAyLhD55t` | url |  |
| `Director Note` | `fldeWYRrgdWegLA5x` | multilineText |  |
| `Sound Recorder` | `fldfblBJ47DPUkvfE` | link → (linked table) |  |
| `Switcher` | `fld5ZBhVpgA6F5Yx7` | link → (linked table) |  |
| `Photographer` | `fld1jj2oUCTFmnVaU` | link → (linked table) |  |
| `🗓️ Timeline Milestones` | `fldi0Gfu4k5aaW7To` | link → (linked table) |  |
| `Shoot to Publish (days)` | `flds8fpM6vP5V3Okw` | formula | วันจากถ่ายถึงปล่อย EP — post-production cycle time สำหรับ EP Pipeline Throughput lens |
| `Cost Sheet Items` | `fldVgPxq8UNvruE3X` | link → (linked table) |  |
