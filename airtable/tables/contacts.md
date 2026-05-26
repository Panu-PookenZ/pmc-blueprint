# 📇 Contacts

> **Table ID:** `tblDEX150rQ73ioCf`
> **Primary field:** `TSD Code` (`fldJVstufRa7QbXai`)
> **Field count:** 33
> **Field-type mix:** 18× multipleRecordLinks, 9× singleLineText, 3× singleSelect, 1× email, 1× checkbox, 1× dateTime

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `TSD Code` | `fldJVstufRa7QbXai` | singleLineText | Primary identifier — TSD00xxx for internal, EXT-xxx for external |
| `Email` | `fldk9O9K7atBBIj0K` | email | Primary matching key — 100% filled for internal |
| `Thai Full Name` | `flddr6ZuVx49R8rXw` | singleLineText | ชื่อจริง (ไม่มีคำนำหน้า) |
| `Thai Nickname` | `fldrWSnxYlaxbWkO6` | singleLineText | ชื่อเล่น |
| `English Full Name` | `fldzI087quH8ryqWS` | singleLineText | Romanized full name — used for matching transcript speaker labels |
| `English Nickname` | `fldfeHf8SuQMBAKoK` | singleLineText |  |
| `Type` | `fldDNfR77cJP93llt` | singleSelect |  |
| `Division` | `fld3XEwbiMMsBZnRG` | singleSelect |  |
| `Department` | `fldTrULTl9affMUUQ` | singleLineText |  |
| `Section` | `fldktLb8l3WxCjWpP` | singleLineText |  |
| `Position` | `fld3XqCpS89NlxBt9` | singleLineText |  |
| `Company` | `fldQJJaIfatwS7UAu` | singleLineText | External บริษัทต้นสังกัด — null ถ้า internal |
| `Active` | `fld3tzEt1QKirNoIQ` | checkbox |  |
| `Team Link` | `fldQlewMISvgkvk9E` | link → (linked table) | Link ไป Team table — null ถ้าไม่ใช่ Production |
| `Last Sync` | `fldIdi10XXrzlzmxZ` | dateTime |  |
| `Source` | `fldEhHnWAO7D5O3Ex` | singleSelect |  |
| `Action Items` | `fldzNthfRuiLf5TuV` | link → (linked table) |  |
| `Parking Lot` | `fldmvaQIMxfw5UfHZ` | link → (linked table) |  |
| `Meetings` | `fldKewWpqi5hMuy70` | link → (linked table) |  |
| `Cost Sheets as ผู้จัดทำ` | `fldmckbyUVpudTgx3` | link → (linked table) | Project Cost Sheets ที่คนนี้เป็น ผู้จัดทำ — auto reverse จาก Project Cost Sheets.ผู้จัดทำ |
| `Cost Sheets as ผู้ตรวจสอบ In-house` | `fld8OYbumivYcPcGy` | link → (linked table) | Project Cost Sheets ที่คนนี้เป็น ผู้ตรวจสอบ In-house — auto reverse จาก Project Cost Sheets.ผู้ตรวจสอบ In-house |
| `Cost Sheets as ผู้อนุมัติ In-house` | `fld3x4Fax1Ho099pG` | link → (linked table) | Project Cost Sheets ที่คนนี้เป็น ผู้อนุมัติ In-house — auto reverse จาก Project Cost Sheets.ผู้อนุมัติ In-house |
| `Cost Sheets as ผู้ตรวจสอบ Outsource` | `fldUNilafl4JoUz6J` | link → (linked table) | Project Cost Sheets ที่คนนี้เป็น ผู้ตรวจสอบ Outsource — auto reverse จาก Project Cost Sheets.ผู้ตรวจสอบ Outsource |
| `Cost Sheets as ผู้อนุมัติ Outsource` | `fldDZ3OxrSOfzTj5C` | link → (linked table) | Project Cost Sheets ที่คนนี้เป็น ผู้อนุมัติ Outsource — auto reverse จาก Project Cost Sheets.ผู้อนุมัติ Outsource |
| `Cost Sheets as AE/PM` | `fldJOHac47WZN1BHa` | link → (linked table) | Project Cost Sheets ที่คนนี้เป็น AE/PM — auto reverse จาก Project Cost Sheets.AE/PM |
| `External Costs` | `fld001XN9wqADXyFn` | link → (linked table) |  |
| `Freelance Costs` | `fldOXe8FJdazVSimt` | link → (linked table) |  |
| `Production Projects` | `fldJwpEdFsLCEtrV0` | link → (linked table) |  |
| `Production Monthly Budget` | `fldFDyuAiXAEmjn8R` | link → (linked table) |  |
| `Production Monthly Budget 2` | `fldiOumIbBrSRVvQQ` | link → (linked table) |  |
| `Production Monthly Budget 3` | `fldx6taRVL8eNNeIw` | link → (linked table) |  |
| `⭐ Decisions` | `fldlRP6bounLtDcbZ` | link → (linked table) |  |
| `Service Job (ฝั่งรายการ)` | `fld7RVFUlNAUoxcjo` | link → (linked table) |  |
