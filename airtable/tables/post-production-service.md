# ✂️ Post Production Service

> **Table ID:** `tblhRCaZeEGUviIGP`
> **Primary field:** `รายการตัดต่อ` (`fldRDXtXtNguWY27c`)
> **Field count:** 19
> **Field-type mix:** 5× multipleRecordLinks, 3× singleLineText, 3× formula, 2× singleSelect, 2× date, 2× multilineText, 1× dateTime, 1× number

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `รายการตัดต่อ` | `fldRDXtXtNguWY27c` | singleLineText | Primary — auto-generated จาก {Project} — {Stage} |
| `Production Project` | `fld6WGf37VW3osOj9` | link → (linked table) | Link ไปยัง Production Project ต้นน้ำ — mandatory ใน import |
| `Deliverable` | `fldCKkwi1vxfi4nNn` | link → (linked table) | Link ไป EP-level deliverable (optional) |
| `Stage` | `fld8wvOisA8dYbqCb` | singleSelect | Stage ของการตัดต่อ — Int. = Internal review, Draft = ส่งลูกค้า, Final = ปิดงาน |
| `Editor` | `fldP2qxa73dKhIyj7` | link → (linked table) | Editor ที่รับผิดชอบ stage นี้ — link ไป Team |
| `Producer` | `fldIYInBsAb95IFNH` | link → (linked table) | Producer ที่ดูแล project — link ไป Team |
| `ทีมงาน` | `fldo0HGHZ1cpNZBiZ` | formula |  |
| `Start Date` | `fldtI4Wz0uy2rLwMY` | date | วันเริ่มของ stage นี้ |
| `End Date` | `fld2N4nOmkxAcg4BW` | date | วันส่ง / ปิดของ stage นี้ |
| `Status` | `fldrgILemFRfnSw2V` | singleSelect | สถานะของ record นี้ |
| `Note` | `fldjlbjuBMcRFrMCw` | multilineText | หมายเหตุ — รวม raw value จาก Editor field ใน Sheet (Freelance / Editor ประจำบ้าน) เก็บไว้ที่นี่ |
| `Days in Stage` | `fldmmPtAPH7ttVKSu` | formula |  |
| `Stage History` | `fldblSW3z2gipW0sm` | multilineText | Timeline ของแต่ละ stage ที่ผ่าน — เก็บไว้เป็น text เพื่อรักษา history จาก Sheet ต้นทาง (Int. → Draft → Final) |
| `Last Sync` | `fldeW9trmQsB5ccZd` | dateTime | Timestamp ของการ sync ครั้งล่าสุด |
| `Job Type` | `fld9SyN9C5UaZA55g` | singleLineText |  |
| `Standalone Edit ID` | `fld7YvbcV1ShJmwgC` | singleLineText | Standalone Editing job ID — format SE-YY-NNN — for editor-led work that's not part of a Production Project. Auto-gene... |
| `Sheet Source Row` | `fldM3Lso3ddGOKhs7` | number | เลข No. ใน Google Sheet ต้นทาง — debug + dedupe |
| `🗓️ Timeline Milestones` | `fldZAKn07UVjIEtGC` | link → (linked table) |  |
| `Edit Duration (days)` | `fldLuds7iqubBZGEq` | formula | วันรวมของงานตัดต่อ (Start ถึง End) — ใช้วัด editor turnaround |
