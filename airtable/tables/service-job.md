# 📹 Service Job

> **Table ID:** `tblGuIq4KokUJde8L`
> **Primary field:** `ชื่องาน` (`fldxfZNpKOPA12SYY`)
> **Field count:** 24
> **Field-type mix:** 7× multipleRecordLinks, 4× singleLineText, 3× formula, 3× singleSelect, 2× date, 2× dateTime, 1× url, 1× multilineText, 1× multipleSelects

## Fields

| Name | ID | Type | Description |
|---|---|---|---|
| ★ `ชื่องาน` | `fldxfZNpKOPA12SYY` | singleLineText | Primary field — ชื่องาน (เช่น 'THE STANDARD DAILY 18 Apr', 'ใสๆในรัก EP.15') |
| `วันถ่ายทำ` | `fld4sWgrUwPxboEP2` | formula |  |
| `Outlet` | `fldEefzYZNH7YzzKe` | singleSelect | ช่อง/Outlet หรือประเภทงาน — WEALTH/NEWS/PODCAST = งานรูทีน Outlet; Agency = งาน Production Project (link ไปที่ Project) |
| `Show` | `fldMs3mFd4hpSKEt0` | singleSelect | รายการ — ใช้ track show-level ของงาน Routine Outlet (Morning Wealth, Now, 8 Minute History, etc.) เป็น singleSelect เ... |
| `เวลาถ่ายทำ` | `fld9xb6XGU6ZDa4Un` | formula |  |
| `ชั่วโมงทำงาน` | `fldPQHZRNgvcenUJD` | formula |  |
| `Location` | `fldaKttTOCEaFc1Wb` | singleLineText | สถานที่ถ่าย |
| `Status` | `fldW7nw2MkeSf5BsO` | singleSelect |  |
| `Videographer` | `fld83bCA9fpDpHrQT` | link → (linked table) | Videographer (ลิงก์ไป Team) |
| `Sound Recorder` | `fldPxDD67CU3Br3xl` | link → (linked table) | Sound Recorder (ลิงก์ไป Team) |
| `Switcher` | `fldw4eL74UFW7xCXc` | link → (linked table) | Switcher (ลิงก์ไป Team) |
| `ทีมฝั่งรายการ` | `fldzNZ1bLyo8vs9kT` | link → (linked table) | คนฝั่งรายการ/คอนเทนต์ (ไม่ใช่ video crew) ที่เกี่ยวข้องกับคิวถ่าย — link ไป Contacts. ป้อนโดย service-job-forward-syn... |
| `Footage Link` | `fldo1QnYLEZ1NuOE8` | url |  |
| `Delivered Date` | `fldapNGQe3L5YXbHH` | date | วันที่ส่งมอบ footage จริง |
| `Calendar Event ID` | `fldX1GYhPxW7WCWoV` | singleLineText | เชื่อมกับ Google Calendar event |
| `หมายเหตุ` | `fld1QmFWjfBIl4PIu` | multilineText |  |
| `วันที่ถ่าย` | `fld6xGI9Ay10kp3jI` | dateTime | วันและเวลานัดถ่าย |
| `เวลาเลิก` | `fldD88Ipx3gp4VV7g` | dateTime | เวลาสิ้นสุดงานถ่าย (end time) — ใช้คำนวณชั่วโมงทำงานของช่างภาพ |
| `Delivery Deadline` | `fldkjdyOrtwFgjNBA` | date | กำหนดส่งมอบ |
| `Requested By` | `fldXhV4r3qi8Orkm9` | singleLineText | ผู้รีเควสต์ (จาก Outlet) |
| `Project` | `fldoaZRzT7mWQrT54` | link → (linked table) | Production Project ที่ shoot นี้สังกัด (ใช้กับ records ที่ Outlet=Agency). 1 shoot : 1 Project — แต่ field เป็น multi... |
| `Program Type` | `fldzNQvheiOERyBTb` | multipleSelects | ประเภทของงาน (Advertorial / Block Shot / Corporate Event) — แยกจาก Show (ชื่อรายการ) |
| `Freelance Costs` | `fldPYnZbO37p222J3` | link → (linked table) |  |
| `🗓️ Timeline Milestones` | `fld6HSdCdbo52aUrX` | link → (linked table) |  |
