# 👨‍💻 Freelance Costs

> **Table ID:** `tblyoEu6zYxnpY6hB`
> **Primary field:** `รายการ` (`fld9r36ivYHFqJkVm`)
> **Field count:** 19
> **Field-type mix:** 5× singleSelect, 4× singleLineText, 2× multipleRecordLinks, 2× url, 1× multilineText, 1× currency, 1× percent, 1× date, 1× number, 1× dateTime

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `รายการ` | `fld9r36ivYHFqJkVm` | singleLineText |  |
| `Service Job` | `fldIc6CRpgcSaTsVv` | link → (linked table) | Auto-match จาก Show + วันถ่ายทำ |
| `Outlet` | `fld3P2lcIRQTGnZ07` | singleSelect | จาก tab name ของไฟล์ |
| `Vendor` | `fldtSDfhqQPULhwp1` | link → (linked table) | Link → Contacts (Freelancer/Company info อยู่ใน Contact's profile: Type / Company / Position) |
| `ชื่อผู้รับเงิน` | `fldAxaz4QCxgWDoy4` | singleLineText | Raw จากไฟล์ column 'List' — ก่อน match ไป Contact |
| `รหัสพนักงาน` | `fldRrT7e1s8PGyXgk` | singleLineText | รหัส (ถ้ามี) — column B ของไฟล์ มี 'Vat' = บริษัท |
| `ตำแหน่ง` | `fld30Ze8CACeS4KK4` | singleSelect |  |
| `Type` | `fldbRUxAsywrcsdfE` | singleSelect |  |
| `Category` | `fldXYVv6uZQhfr03S` | singleSelect |  |
| `Description` | `fldNaAKhdiDNTbLmR` | multilineText | จาก column 'Colume & Responsibility' — รายละเอียดงาน + show name |
| `Output Link` | `fldo1nw8VPBYupmgn` | url | ลิงก์ YouTube/Drive ของงานที่ถ่าย — column G |
| `Trello Link` | `fldCZw6m7mbWycrM4` | url | Optional — column H |
| `Amount` | `fldS2ftUi3GExnUq4` | currency |  |
| `WHT %` | `fldxS4Bg1GVXEEtIn` | percent |  |
| `Status` | `fld1Ctl6jJEOnyrus` | singleSelect |  |
| `Period` | `fldj8U9vk5Vq3BHRy` | singleLineText | เดือน/ปีของไฟล์ เช่น 'January 2569' — มาจาก sheet header |
| `วันถ่ายทำ` | `fldhtACJaMdzzar66` | date | Column F: 'วันที่ลงคอลัมน์' — พ.ศ. แปลง ค.ศ. |
| `Sheet Source Row` | `fld8OH6gC0BXA2kSD` | number | row ใน source sheet — dedup |
| `Last Sync` | `fld60NO7XT8zU9Cs8` | dateTime |  |
