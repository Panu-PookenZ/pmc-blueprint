# 🎬 Production Projects

> **Table ID:** `tbljhGIprQmq1nO10`
> **Primary field:** `ชื่องาน` (`fldRuKwVTdCGkQAVR`)
> **Field count:** 55
> **Field-type mix:** 15× multipleRecordLinks, 10× rollup, 6× singleSelect, 5× singleLineText, 5× formula, 4× url, 3× multilineText, 2× date, 1× number, 1× richText, 1× currency, 1× multipleSelects, 1× checkbox

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `ชื่องาน` | `fldRuKwVTdCGkQAVR` | singleLineText |  |
| `Project ID` | `fld28pp00Ck63IkDv` | singleLineText |  |
| `Brief Date` | `fldcMJzGRVtj6jnt7` | date | วันที่ลูกค้าส่ง brief เข้ามา (per brief document) — always-write จาก brief-cracker (v3.2). ไม่ใช่ kickoff หรือ shoot ... |
| `Deadline` | `fldu0BlAf3l4hbaKi` | date |  |
| `ประเภทงาน` | `fldSLFiKb7F5DEPF8` | singleSelect |  |
| `Client` | `fldloL1HqUBIoZVDq` | singleLineText |  |
| `Brand Industry` | `fld1KVoSbAslfBLfx` | singleSelect | Industry ของ Client — taxonomy อ้างอิงจาก Producer Dashboard 2026 |
| `% Complete` | `fldpvqKD6O3lAK0Cl` | formula | milestone-driven: หมุด Done ÷ หมุดทั้งหมด (ไม่นับ Cancelled). ไม่มีหมุด → Stage÷8. Cancelled/On Hold → ว่าง. 100% เกิ... |
| `Stage` | `fldEPN6l8F8bMzwXA` | singleSelect |  |
| `Product Code` | `fldYY5QGIcA4PT1kK` | singleLineText |  |
| `Outlet` | `fldeMtJq3E7sGgCs0` | singleSelect |  |
| `Video Type` | `fldHNx2E3t2DRgfNK` | singleSelect | ประเภทของวิดีโอ (จาก Production Tracking Sheet) |
| `Producer` | `fldQmQaPIU64xmxl0` | link → (linked table) | Dropdown ลิงก์ไป Team — รองรับ Producer ของโปรเจกต์ |
| `Brief Link` | `fldz0XrqgIlp1V3Sy` | url | Link ไปยัง Brief (Google Sheet/Doc) ของแต่ละ Project |
| `Brief Summary` | `fldSJL30Ye51qgZb5` | multilineText |  |
| `Research Links` | `fldHSG0nuRi6woVkN` | url |  |
| `DRAFT IDEA` | `fldD2QmJcQCdFeJpp` | multilineText |  |
| `EP Notes` | `fldjx06TGCrSSaKeU` | multilineText |  |
| `EP Count` | `fldUNn2mCwvycdNQP` | rollup |  |
| `Published Count` | `fld4vxiP34gK7G4Ax` | rollup |  |
| `Latest Publish Date` | `fldGAAlUAGsg4IUc7` | rollup |  |
| `Avg Success Rate` | `fldRdBK29jVMLPp8b` | rollup |  |
| `Budget Items` | `fldiYscDof3fjP1Qd` | link → (linked table) |  |
| `Revision Count` | `fldtCyyewfHeSWGVg` | number |  |
| `Deliverables` | `fldUYxyCFvI5FfVeT` | link → (linked table) | EP/ชิ้นงานย่อยของ Production Project — link ไป Deliverables table (1:N) |
| `Project Material` | `fldFiBQFHcxW41gAq` | richText | ไฟล์ / ลิงก์ / ตัวอักษรประกอบ project — brief, research, mood board, tool links, spec, ฯลฯ |
| `Next Milestone Date` | `fld6FHKwm8cj54pKO` | rollup |  |
| `Milestones Done` | `fldz5SW1rhpmDWZSp` | rollup |  |
| `Milestones Total` | `fldHMRsUcoIE7dn4j` | rollup |  |
| `Quoted Revenue (Items)` | `fldxRr77kXAHZXdLd` | rollup |  |
| `Est Cost (Items)` | `fldTpVkjdgNmJx9Q9` | rollup |  |
| `Actual Cost (Items)` | `fldclV1QxKdiMXKK3` | rollup |  |
| `Margin % (Est)` | `fldCztAkGhNDK52fv` | formula |  |
| `Margin % (Act)` | `fldLdZQaRe4h4xzv2` | formula |  |
| `AE` | `fldTwALxxxIph8Qn7` | singleLineText | Account Executive / Project Manager ที่ดูแล project (จาก brief content) — always-write จาก brief-cracker v3.2 |
| `Production Budget` | `fld73rLTIzuyJR2Dj` | currency | งบประมาณ production ตาม brief content (ไม่ใช่ Cost Sheet ไม่ใช่ final cost) — midpoint ถ้า range, null ถ้า ไม่ระบุ. b... |
| `Host` | `fldrs1ea88ZsQSmol` | link → (linked table) | พิธีกร / ผู้ดำเนินรายการ — link ไป Contacts table. brief-cracker v3.2 lookup-by-name + check-first |
| `Distribution Platforms` | `fldljIPUSLFR3NMq1` | multipleSelects | ช่องทางเผยแพร่ตาม brief — brief-cracker v3.2 always-write |
| `Meetings` | `fldum0zdqUzAmnlUv` | link → (linked table) |  |
| `MAM Uploaded` | `fldjmM9xjRjt1tKAy` | checkbox |  |
| `Feedback Log` | `fld5miR9t3YErUj8G` | link → (linked table) |  |
| `คิวถ่าย` | `fldPA2WaUDewDplLV` | link → (linked table) | คิวถ่ายทั้งหมดของ Project นี้ — sync อัตโนมัติจาก Production Job.Project (records ที่ Outlet=Agency). 1 Project : n ค... |
| `Storyline/PPM Link` | `fldm80PbVYww85lAS` | url | ลิงก์ไปยัง Storyline / PPM / Master file ของ Project |
| `Related Internal Projects` | `fld23NvkLqTOVkvcO` | link → (linked table) | Internal Projects ที่เกี่ยวข้องกับงานวิดีโอนี้ — sync อัตโนมัติจาก Internal Projects.Related Production Projects |
| `Post Production Service` | `fldEhczrqjmdNJhjX` | link → (linked table) |  |
| `Action Items` | `fldM13SGPSk68hXbe` | link → (linked table) |  |
| `Structural Outputs` | `fld9cskgyZJ2lkazs` | link → (linked table) |  |
| `Budget Periods` | `fldAnh7TJTP7xLgFM` | link → (linked table) |  |
| `External Costs` | `fldTGetLwZB6yFrMn` | link → (linked table) |  |
| `⭐ Decisions` | `fldGcsMOFncgnWU2n` | link → (linked table) |  |
| `🗓️ Timeline Milestones` | `fldNiiPlnRl0oPhQZ` | link → (linked table) |  |
| `Timeline File` | `fldMYQUWPY4HdM7qZ` | url | ไฟล์ Timeline ที่ Producer ทำหลังโปรเจ็กต์ confirm/จ่ายเงิน — 1 ไฟล์/โปรเจ็กต์. เป็น source ของการ crack เข้า Timelin... |
| `Timeline Status` | `fldUOKHMKBZIWDEQs` | singleSelect | Awaiting Timeline = โปรเจ็กต์ confirm แล้วแต่ Producer ยังไม่ส่ง Timeline (ทำให้สถานะ "รอ Timeline" มองเห็นได้) |
| `Cycle Time (days)` | `fld7wCsJY3DxiqXGk` | formula | วันจาก Brief ถึงปล่อยงานล่าสุด — ใช้วัด throughput/cycle time ของ Project Pipeline |
| `Project Age (days)` | `fldZP158jBi3hCiAr` | formula | อายุงานนับจาก Brief Date ถึงวันนี้ — ใช้เป็น proxy ของ stage-aging ใน Bottleneck lens |
