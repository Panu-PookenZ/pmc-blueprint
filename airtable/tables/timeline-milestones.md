# 🗓️ Timeline Milestones

> **Table ID:** `tbl7hD67NzqM5EiwI`
> **Primary field:** `Milestone` (`flddc7WoqBBJIM0FZ`)
> **Field count:** 15
> **Field-type mix:** 5× multipleRecordLinks, 3× singleSelect, 2× date, 2× formula, 1× singleLineText, 1× number, 1× multilineText

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `Milestone` | `flddc7WoqBBJIM0FZ` | singleLineText | Auto: {Episode ID} · {Type} — เขียนโดย crack pipeline ไม่แก้มือ |
| `Deliverable` | `fldi34fTZ8mtt1Hp5` | link → (linked table) | EP ที่หมุดนี้สังกัด (link หลายตัวได้ถ้าหมุดใช้ร่วม เช่น Shoot เดียวของ Full+Short) |
| `Production Project` | `fldXEsjKtXfGBBUuN` | link → (linked table) | โปรเจ็กต์แม่ — crack เป็นคนเติม |
| `Phase` | `fld0905QyoIruVjNf` | singleSelect |  |
| `Type` | `fldhoW2o8f7s3VfD7` | singleSelect |  |
| `Planned Date` | `fldX6oUwyRypZJjqS` | date | วันตามแผน — จากไฟล์ Timeline ของ Producer |
| `Actual Date` | `fldmRwJF8lterXqL2` | date | วันจริง — หมุด Shoot/Draft/Final อ่านจาก Service Job / PPS ที่ link; หมุดอื่นกรอก/crack เอง |
| `Status` | `fldTAPBATgG1RTbzW` | singleSelect |  |
| `Sort Order` | `fldj4LGFD4K6jYXOW` | number | ลำดับหมุดใน EP (Scout=1 … Publish/On-Air=9) |
| `Owner` | `fldgZsZWDzBMxPgjg` | link → (linked table) | ผู้รับผิดชอบหมุดนี้ (optional) |
| `Service Job` | `fldRGohEhQHNALgjU` | link → (linked table) | หมุด Shoot → link คิวถ่ายจริง (L3a เป็นเจ้าของ actual date) |
| `Post Production Service` | `fldzXrY0CZtP8nLs1` | link → (linked table) | หมุด Draft/Final → link รอบตัดต่อจริง (L3b เป็นเจ้าของ actual date) |
| `Note` | `fldGKEQwTRpJsEcWl` | multilineText | หมายเหตุรายหมุด เช่น รอบ feedback กี่วัน, TBC |
| `Slip (days)` | `fldyChMS3V7HkQAYK` | formula | วันจริงช้า/เร็วกว่าแผนกี่วัน (+ = ช้า, - = เร็ว). ว่างถ้ายังไม่มี Actual Date |
| `Health` | `fldDBRKW9eoclvpL7` | formula | สุขภาพหมุด auto — Overdue/review = เลยกำหนดแต่ Status ยังไม่ Done |
