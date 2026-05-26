# 💸 External Costs

> **Table ID:** `tblQXbwV0ygP4JWAM`
> **Primary field:** `รายการ` (`fldtq681flwGe5Ufi`)
> **Field count:** 23
> **Field-type mix:** 6× singleLineText, 5× multipleRecordLinks, 4× url, 2× singleSelect, 1× date, 1× currency, 1× percent, 1× multilineText, 1× number, 1× dateTime

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `รายการ` | `fldtq681flwGe5Ufi` | singleLineText |  |
| `Product Code` | `fldEjXMUwaw92Ieyu` | singleLineText | QU-XXXX-V1 / QU-XXXX/N — ไฟล์ต้นทางจากไฟล์บัญชี |
| `QU` | `fldk1sv54et6ubUo3` | singleLineText | Raw Quotation reference (อาจ multi: 'QU-3980,QU-3983') |
| `Cost Sheet` | `fldZBxFE7pTD74LmB` | link → (linked table) | Auto-match จาก Product Code → Quotation No. → Cost Sheets parent |
| `Production Project` | `fldMumzUpvzDwhjID` | link → (linked table) | Auto-match จาก Quotation → Production Projects.Product Code |
| `Producer` | `fldJxhqdITQyVOjab` | link → (linked table) | Producer ของ Project — link ไป Team table (ตรงไปชื่อเล่น) |
| `ชื่องาน` | `fldK7260WYjMwTNUb` | singleLineText | ชื่องาน/episode เฉพาะของรายงานจ่าย ตามที่บัญชีระบุ |
| `วันถ่ายทำ` | `fldvNtpJDf62VaHO9` | date |  |
| `ประเภทค่าใช้จ่าย` | `fldWU0iJCb8rnFcV8` | singleSelect | Taxonomy ของไฟล์ External Cost — ต่างจาก Cost Sheet master 43. ฦ จะเพิ่มตามที่มีรายการใหม่ |
| `ชื่อผู้รับเงิน` | `fld7sr7hYRcbmjExz` | singleLineText | ตามไฟล์ — ฟรีแลนซ์ (บุคคลธรรมดา) หรือบริษัท |
| `Vendor` | `fldDGrYq7UIEQ3UcW` | link → (linked table) | Optional — link ไป Contacts ถ้า vendor มีใน base แล้ว (รองรับ freelance/external suppliers) |
| `ยอด (Net)` | `fldEluI81ZC66DQcR` | currency | ยอดใบแจ้งหนี้ ก่อนหัก WHT |
| `WHT %` | `fldgIPESWSPAEnVSn` | percent | ภาษีหัก ณ ที่จ่าย (3% / 5% / 0%) |
| `Status` | `fldXFASQdsEQ8h2Mq` | singleSelect | สถานะตามบัญชี |
| `เลขที่ใบแจ้งหนี้` | `fldPF8F5J95Jpk4xC` | singleLineText |  |
| `ใบเสนอราคา` | `fldW4nAtzKvfvJPMJ` | url |  |
| `ใบแจ้งหนี้` | `fldUGZSZoQB4zkAoO` | url |  |
| `ใบแจ้งโอน` | `fldjDoXrhp74O3Ebn` | url | สลิปโอนจากบัญชี |
| `ใบกำกับภาษี` | `fldyoLs91lDBC2d8N` | url |  |
| `หมายเหตุ` | `fldVqEKVHSgbA39Wq` | multilineText |  |
| `Sheet Source Row` | `fldbLgqE8o1ystHar` | number | เลข row ใน Google Sheet ต้นทาง — debug + dedupe |
| `Last Sync` | `fldprFgVgXymNuU8u` | dateTime |  |
| `Cost Sheet Item` | `fldh7g7ldOn78VLSU` | link → (linked table) | Item-level link to Cost Sheet Items (matched via Product Code text exact match during weekly sync). Enables Plan vs A... |
