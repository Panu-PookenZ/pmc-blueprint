# 💰 Project Cost Sheets

> **Table ID:** `tblXpuil18LFCNP6y`
> **Primary field:** `Reference No.` (`fldcthXFlkMOAHQTc`)
> **Field count:** 44
> **Field-type mix:** 11× formula, 10× multipleRecordLinks, 8× rollup, 4× singleLineText, 4× singleSelect, 2× date, 2× currency, 1× url, 1× dateTime, 1× multilineText

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `Reference No.` | `fldcthXFlkMOAHQTc` | singleLineText |  |
| `Cost Sheet Type` | `fldq8iScXFM79Gok3` | singleSelect |  |
| `Title` | `fldgzxTKA94ByHWJd` | singleLineText |  |
| `Quotation No.` | `fldMlN1a73yKGL8cS` | singleLineText | QU-XXXX สำหรับ Project — ใช้ match กับ Production Projects.Product Code |
| `Cost Sheet URL` | `fldc2bwunI1sV4wSh` | url |  |
| `Client` | `fld1zsX5D2UtJhXNl` | singleLineText |  |
| `Production Project` | `fldUw8xatOD1wo7Tp` | link → (linked table) |  |
| `Internal Project` | `fldmSiHbCQR46xgSv` | link → (linked table) |  |
| `Outlet หลัก` | `fld0cZ5rYfzb1JdqF` | singleSelect |  |
| `Adver/Non-Adver` | `fldEKjo3IiXoIvt9i` | singleSelect |  |
| `Period Start` | `fld0iYJhRIBu1JqsZ` | date |  |
| `Period End` | `fldXvJxcVLjjUjKRg` | date |  |
| `ผู้จัดทำ` | `fldvIWO1fmC0Si5rU` | link → (linked table) | Default Monthly: ชลธร / Project: AE จาก Cost Sheet |
| `ผู้ตรวจสอบ In-house` | `fldCsNHkKYSbD48R5` | link → (linked table) | Default ตายตัว: สิกฤต ลือสัตย์ |
| `ผู้อนุมัติ In-house` | `fldvI0ZymQj0yiedL` | link → (linked table) | Default Monthly: นครินทร์ / Project: วิไลลักษณ์ |
| `ผู้ตรวจสอบ Outsource` | `fld4726kxJvhIQyuK` | link → (linked table) | Project only — Default: ไวกูณฐ์ |
| `ผู้อนุมัติ Outsource` | `fld4VZqd2KvYer2lp` | link → (linked table) | Project only — Default: ไวกูณฐ์ |
| `AE/PM` | `fldA9qEw73JkBIKU2` | link → (linked table) | Project only — AE จาก Cost Sheet header |
| `Status` | `fld2c0qnBhFeSNGBB` | singleSelect |  |
| `Last Sync` | `fldeffVj0psRRuqkX` | dateTime |  |
| `Budget Items` | `fldPwtYaISKYayExP` | link → (linked table) |  |
| `External Costs` | `fld16Q5l3DdO8K6O4` | link → (linked table) |  |
| `Quoted Revenue` | `fld4jxLnZuV3ct9TJ` | currency | รายได้ตาม Quotation (Estimate) — จาก Cost Sheet header. ไม่ใช่ revenue ที่เก็บได้จริง |
| `Estimated Cost` | `fldmFCvIAfHpmmolk` | rollup |  |
| `Internal Cost` | `fldFJgs3wupQWruhp` | rollup |  |
| `External Actual` | `fldiciroH0aJypPyq` | rollup |  |
| `Total Actual Cost` | `fldCBpVEcU0RMMWdT` | formula |  |
| `Variance` | `fldKJQDQoPP5cV31U` | formula |  |
| `Variance %` | `fldqUaIwPF48LPqs7` | formula |  |
| `Profit (Est)` | `fldnCfyy83nkHW7ty` | formula |  |
| `Profit (Act)` | `fldxWKRHlwCRKRByK` | formula |  |
| `Margin % (Est)` | `fldCmvotu1JuEJxhY` | formula |  |
| `Margin % (Act)` | `fld0khETrJLRvGYjR` | formula |  |
| `Cost Summary` | `fldqgt5osIzCmlfY7` | formula |  |
| `Notes` | `fldYxZeKogbQTihFn` | multilineText |  |
| `🎬 Video Revenue` | `fldZVxCeGeNsPKybc` | rollup |  |
| `Non-Video Revenue` | `fldBl0bsfAikP0rWe` | rollup |  |
| `Video Est Cost` | `fldcXNXdNWizUqYEO` | rollup |  |
| `Non-Video Est Cost` | `fldySyxH9hfKRnSyn` | rollup |  |
| `Video Actual Cost` | `fld9dNQNq6b62Eodn` | rollup |  |
| `Video Margin % (Est)` | `fldtZk4rgxlh6hrIP` | formula |  |
| `Video Margin % (Act)` | `fldK9Qyw427FVBBLS` | formula |  |
| `Video Share %` | `fldFyY6Z0JDikk697` | formula |  |
| `Actual Revenue` | `fldVlLMFUJsPvLbY4` | currency | รายได้ที่เรียกเก็บได้จริง — จะมีข้อมูลภายหลัง (trackไว้ล่วงหน้า). Hidden ใน default View ได้ |
