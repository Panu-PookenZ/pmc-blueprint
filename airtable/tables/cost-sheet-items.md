# 🧾 Cost Sheet Items

> **Table ID:** `tblgar8b6y42kVxRN`
> **Primary field:** `รายการ` (`fldqlVtZpfImsNBeU`)
> **Field count:** 27
> **Field-type mix:** 7× singleSelect, 6× multipleRecordLinks, 4× singleLineText, 4× formula, 1× currency, 1× date, 1× url, 1× multilineText, 1× multipleLookupValues, 1× rollup

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `รายการ` | `fldqlVtZpfImsNBeU` | singleLineText |  |
| `Project` | `fldDWUoVp3ROr8m5z` | link → (linked table) |  |
| `หมวดงบ` | `fldU2tbFxpbileQWB` | singleSelect |  |
| `ประเภทค่าใช้จ่าย` | `fldknbYymwW1iElZ1` | singleSelect |  |
| `Amount` | `fldtdAM2mNABE2SFH` | currency |  |
| `วันที่` | `fldBhs4ZRCVp1WxPr` | date |  |
| `สถานะ` | `fldpWOE2qNkgW65kr` | singleSelect |  |
| `Invoice/Receipt` | `fldQiB43XPEqRmacf` | url |  |
| `ผู้อนุมัติ` | `fld4OerNFVgvE3fjh` | link → (linked table) |  |
| `หมายเหตุ` | `flduF4fRfvIBWcyxP` | multilineText |  |
| `Internal Project` | `fld4aZno2uM97IWhj` | link → (linked table) | Internal Project ที่รายการนี้สังกัด — sync อัตโนมัติจาก Internal Projects.Budget Items |
| `Cost Sheet` | `fld7QWH8YZJWFKLE9` | link → (linked table) | Link ไป Cost Sheets (parent) — mandatory หลังจาก sync |
| `Title (from Cost Sheet)` | `fldc1TWzwQRxLUiW7` | lookup |  |
| `Section` | `fldiTRyCI5tuzZeps` | singleSelect | In-house = budget สำรอง / Outsource = จ่ายจริงจาก cost sheet |
| `Item Category` | `fldK2zFVxgjy0cqBc` | singleSelect | Master Expense Categories from Cost Sheet — 43 รายการ ห้ามตั้งชื่อใหม่เอง |
| `Description` | `fldRh1eCW3clm3KjE` | singleLineText | รายละเอียดของรายการ เช่น 'ค่าฟรีแลนซ์ตัดต่อ VDO' |
| `Product Code` | `fldcOoVypO35kIEQm` | singleLineText | QU-XXXX-V1 ระดับ item — ลิงก์ไป revenue line ของ quotation ต้นทาง |
| `Payment Method` | `fldsOW50jQGMH0XOd` | singleSelect |  |
| `Vendor` | `fld94u6lTZOljENz7` | singleLineText | ผู้รับเงิน (ฟรีแลนซ์ / บริษัท / Supplier) |
| `Revenue Category` | `fldgmE7IvqqYeMi4c` | singleSelect | หมวดรายได้ — ใช้เฉพาะ items ที่ Section = Revenue. 11 categories ตาม master Items Code (V/BP/BF/A/L/EP/BN/ET/ES/EO/G) |
| `External Costs` | `fldBHAHHtBJTb55m8` | link → (linked table) | Auto reverse-link from External Costs.Cost Sheet Item. Source for Actual Spent rollup. Set during weekly cost sync vi... |
| `Actual Spent` | `fldm2Gg79aJUobBvX` | rollup |  |
| `Variance` | `fldPEqWUZFgup96nw` | formula |  |
| `Item Type` | `fldncO63QBdfDNoFv` | formula | Classify item: Video / Photo Album / Article / Event Planning / Event Sponsorship / Boostpost / Boost Fee / Other. Ph... |
| `Is Revenue` | `fldsujzY6RpKzR6oG` | formula | Yes if line item is Revenue (รายการ starts with 'Revenue -' or Item Category contains 'Revenue'). No = Cost line. |
| `Is Production Work` | `fldIPHv642K56HAP5` | formula | Yes if Item Type = Video or Photo Album. = work that Production House team does (vs Article/Event/Boostpost done by o... |
| `Deliverable` | `fldtB2mKrNQYSVA85` | link → (linked table) |  |
