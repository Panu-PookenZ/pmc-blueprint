# 👥 Team

> **Table ID:** `tblaTlz3iumMqTqMv`
> **Primary field:** `ชื่อเล่น` (`fld9Q8Ree01fU7tBB`)
> **Field count:** 53
> **Field-type mix:** 22× multipleRecordLinks, 10× rollup, 7× singleLineText, 4× rating, 2× formula, 1× singleSelect, 1× url, 1× multilineText, 1× email, 1× phoneNumber, 1× multipleSelects, 1× number, 1× date

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `ชื่อเล่น` | `fld9Q8Ree01fU7tBB` | singleLineText | Primary field — ชื่อเล่น |
| `ชื่อ-นามสกุล` | `fldikzJPKZ1gRTqM7` | singleLineText |  |
| `ตำแหน่ง` | `fldqfMrhKlOqe4zPp` | singleSelect |  |
| `ลิ้งค์ KPI Form` | `flduDcbMTIs5vmoyd` | url |  |
| `All Production Projects` | `fldvQYmJQHhwlfC6s` | formula |  |
| `All Service Job` | `fldZSWvqt7mWT9ID4` | formula | สรุปงานถ่ายทั้งหมด (Routine Outlet + Agency) ของแต่ละคน — แสดงตามบทบาท: Videographer / Sound Recorder / Switcher |
| `หมายเหตุ` | `fldU2xoHLF0Xjsvcs` | multilineText |  |
| `Meetings` | `fldOjJHMhMLabfGl1` | link → (linked table) |  |
| `Budget Items` | `fldb4MLl9p5pTy8dF` | link → (linked table) |  |
| `Feedback Log` | `fldcaEnK7eba2FRlB` | link → (linked table) |  |
| `KPI Obj1: Visual Storytelling (35%)` | `fld111ZEcYkOYD5sN` | rating |  |
| `KPI Obj2: Tech & AI (25%)` | `fldH9uaiEegiqhg8y` | rating |  |
| `KPI Obj3: Vertical Video (20%)` | `fld6JR3osTpkoqth0` | rating |  |
| `KPI Obj4: Self-development (20%)` | `fldwiqnQcplUajb1M` | rating |  |
| `# Projects (Year)` | `fld5oDMHBP4UEAdJ9` | rollup |  |
| `Production Budget (Year)` | `fld7pXZJkcRRWZmVN` | rollup |  |
| `# EP Published (Year)` | `fldvZQRsYAQ494DQq` | rollup |  |
| `Shoot-to-Publish Avg` | `fldl3aKpG0Txz7bpX` | rollup |  |
| `# Jobs Final (Year)` | `fldw1narPAwGHzV11` | rollup |  |
| `Days in Stage Avg` | `fldBEJQhRJh5rEvEs` | rollup |  |
| `# Shoots V (Year)` | `fld9PuoO8MAGD99Za` | rollup |  |
| `Hours (Year)` | `fldnS1oxy07YwfHXf` | rollup |  |
| `Next Shoot Date` | `fldLp3ywaOwBfUql4` | rollup |  |
| `KPI Reviews` | `fldlPfLlKGmAitu1E` | singleLineText |  |
| `Projects Directed (rollup)` | `fldi7BYxJSRvWjzCj` | rollup |  |
| `รหัสพนักงาน` | `fld3HTyTAdVSllzfI` | singleLineText | TSD00xxx |
| `Email` | `fldushScRpuYRLb3J` | email |  |
| `เบอร์โทร` | `fld94NDDt1dL3e49N` | phoneNumber |  |
| `ทักษะพิเศษ` | `fldGezk5G5p6shNTw` | multipleSelects |  |
| `ลำดับ` | `fldq7Dwnq0sjgThvE` | number |  |
| `ชื่อภาษาอังกฤษ` | `fldF5UgSwpF5hNq8O` | singleLineText |  |
| `Nickname EN` | `fld3YiLlbbQVsnfDd` | singleLineText |  |
| `Line ID` | `fldJ5fWYTcqwAyHdP` | singleLineText |  |
| `วันเริ่มงาน` | `fld73WE7UY5eg6BN9` | date |  |
| `Projects as Producer` | `fldiJ8cTyIBLZsPFM` | link → (linked table) | งานที่เป็น Producer — sync อัตโนมัติจาก Production Projects.Producer |
| `Work as Videographer` | `fldkjDEx34AWMFCSh` | link → (linked table) | งานถ่ายที่เป็น Videographer — sync อัตโนมัติจาก Service Job.Videographer (ครอบคลุมทั้งงาน Routine Outlet และ Agency P... |
| `Work as Sound Recorder` | `fldFKa4GOFNKyofuf` | link → (linked table) | งานถ่ายที่เป็น Sound Recorder — sync อัตโนมัติจาก Service Job.Sound Recorder (ครอบคลุมทั้งงาน Routine Outlet และ Agen... |
| `Work as Switcher` | `fldb3Zh1grvtqbJCm` | link → (linked table) | งานถ่ายที่เป็น Switcher — sync อัตโนมัติจาก Service Job.Switcher (ครอบคลุมทั้งงาน Routine Outlet และ Agency Project) |
| `Internal as Lead` | `fldf1nJW0mjqARH8X` | link → (linked table) | งาน Internal Project ที่เป็น Lead — sync อัตโนมัติจาก Internal Projects.Lead |
| `Internal as Contributor` | `fldAn70Vp0sAvttHV` | link → (linked table) | งาน Internal Project ที่ร่วมทำ — sync อัตโนมัติจาก Internal Projects.Contributors |
| `Internal Stages as Owner` | `fldR5HtFVl3gFGh90` | link → (linked table) | Stage ของ Internal Project ที่ถือเป็น Owner — sync อัตโนมัติจาก Internal Project Stages.Owner |
| `Post Prod as Editor` | `fldzQ5JpTWC6SABnm` | link → (linked table) | งานตัดต่อ (Post Production Service) ที่คนนี้เป็น Editor — auto reverse จาก Post Production Service.Editor |
| `Post Prod as Producer` | `fldc4WdjdiB7sXpLr` | link → (linked table) | งานตัดต่อ (Post Production Service) ที่คนนี้เป็น Producer — auto reverse จาก Post Production Service.Producer |
| `Contact Record` | `fldIUnVdal2ULFrEY` | link → (linked table) | Auto-linked from Contacts.Team Link — each Production team member's universal Contact record (used for meeting attend... |
| `External Costs` | `fldPoXj3ZJUmTFhwK` | link → (linked table) |  |
| `Feedback Log 2` | `fldz4Z3MSv7x2v2Ne` | link → (linked table) |  |
| `Deliverables as Director` | `flduD67GdLc9GRZBI` | link → (linked table) |  |
| `Deliverables as Producer` | `fldBV3qZXtntpqs9C` | link → (linked table) |  |
| `Deliverables as Videographer` | `fldfSkFTarDKsHIHF` | link → (linked table) |  |
| `Deliverables as Sound Recorder` | `fldJOYlSefqxKL4yA` | link → (linked table) |  |
| `Deliverables as Switcher` | `fldEOBvvYTH38ayY9` | link → (linked table) |  |
| `Deliverables as Photographer` | `fld6YP9pOIH5u19dh` | link → (linked table) |  |
| `🗓️ Timeline Milestones` | `fldPT67AWvZ0Y9iZI` | link → (linked table) |  |
