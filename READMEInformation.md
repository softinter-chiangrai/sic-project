# Software Project Lifecycle Management System

> ระบบบริหารโครงการพัฒนาซอฟต์แวร์แบบครบวงจร  
> ครอบคลุมตั้งแต่ลูกค้า, สัญญา, Requirement, DFD, ER Diagram, Specification, Development, Testing, Delivery, Invoice, MA และการต่อสัญญา

---

## 1. Overview

ระบบนี้ออกแบบมาเพื่อใช้บริหารโครงการพัฒนาซอฟต์แวร์แบบครบวงจร โดยยึดกระบวนการ **SDLC: Software Development Life Cycle** เป็นแกนกลาง

ระบบไม่ได้เป็นเพียง Task Management แต่เป็นแพลตฟอร์มสำหรับควบคุมการทำงานตั้งแต่ต้นน้ำจนถึงปลายน้ำ

```text
Customer / Sales
↓
Contract Management
↓
Project Setup
↓
Requirement Management
↓
Analysis & Design
↓
Specification & Estimation
↓
Project Planning
↓
Development & Tracking
↓
Testing & Bug Management
↓
Delivery / Invoice / MA
```

---

## 2. Objectives

ระบบมีวัตถุประสงค์หลักดังนี้

1. ติดตามการดำเนินงานของแต่ละโครงการในรูปแบบ SDLC
2. กำหนดผู้รับผิดชอบแต่ละโครงการได้
3. จัดทำและบริหารสัญญากับลูกค้า
4. จัดการแผนงานแบบคร่าว ๆ และแบ่งเป็น Phase งาน
5. จัดการ Requirement และต้องได้รับการยืนยันจาก BA และลูกค้าก่อนเข้าสู่กระบวนการถัดไป
6. ออกแบบ Data Flow Diagram หรือ DFD
7. นำ Requirement ไปออกแบบ ER Diagram และ Relationship ตาม DFD โดยต้องได้รับการยืนยันจาก SA
8. Export Database Script ตามประเภท Database เช่น MySQL หรือ PostgreSQL
9. จัดทำ Specification เพื่อกำหนดขอบเขต UI, Function, Data, ER Mapping และ Manday
10. เมื่อ Specification เสร็จ ต้องได้รับการ Confirm จากหัวหน้าสายงานและลูกค้าก่อนนำไปวางแผน
11. มีระบบ Review Design เพื่อแจ้งความไม่ถูกต้องให้ผู้ออกแบบ
12. ติดตามงาน Development ว่าเสร็จตามแผนหรือไม่ ล่าช้าเท่าไร และกระทบงานอื่นหรือไม่
13. มีระบบ Comment แบบ Facebook Post เพื่อถามผู้รับผิดชอบโดยตรง และให้ผู้อื่นเห็นได้
14. ออกแบบเอกสาร Test ตั้งแต่ Unit Test, Integration Test, System Test และ Acceptance Test
15. เมื่อเจอ Bug ต้องแจ้งผู้รับผิดชอบ พร้อมระบุแผนแก้ไขและกำหนดวัน Test รอบถัดไป
16. เมื่อพัฒนาเสร็จและครบตามกำหนดส่งมอบ ระบบต้องสร้างเอกสารส่งมอบให้ลูกค้า
17. ออกแบบคู่มือการใช้งานเพื่อแนบตอนส่งมอบให้ลูกค้า
18. จัดทำใบแจ้งหนี้และติดตามการจัดเก็บเงิน
19. มีระบบ MA สำหรับติดตามงานและรับแจ้งปัญหาหลังส่งมอบ
20. รองรับการต่อสัญญา MA หรือขยายระยะเวลาโครงการ

---

## 3. Core Business Flow

```text
Customer Created
↓
Contract Created
↓
Project Created
↓
Assign PM / BA / SA / Dev / QA
↓
Create Project Phase
↓
Collect Requirement
↓
BA Confirm Requirement
↓
Customer Confirm Requirement
↓
Create DFD
↓
SA Review DFD
↓
Create ER Diagram
↓
SA Confirm ER
↓
Generate DB Script
↓
Create Specification
↓
Head Confirm Specification
↓
Customer Confirm Specification
↓
Create Development Plan
↓
Assign Task to Developer
↓
Developer Work
↓
Internal Review
↓
QA Create Test Case
↓
QA Test
↓
Bug Found
↓
Developer Fix
↓
Retest
↓
UAT
↓
Customer Sign-off
↓
Generate Delivery Document
↓
Create User Manual
↓
Deliver Project
↓
Issue Invoice
↓
Receive Payment
↓
Start MA
↓
Handle Support Ticket
↓
Renew / Extend MA
```

---

## 4. SDLC Status

| ลำดับ | สถานะ | ความหมาย |
|---|---|---|
| 1 | Prospect | อยู่ระหว่างคุยงานกับลูกค้า |
| 2 | Contract Drafting | อยู่ระหว่างจัดทำสัญญา |
| 3 | Contract Signed | ลงนามสัญญาแล้ว |
| 4 | Requirement Gathering | เก็บ Requirement |
| 5 | Requirement Approval | รอ BA / ลูกค้าอนุมัติ Requirement |
| 6 | System Analysis | วิเคราะห์ระบบ |
| 7 | DFD Design | ออกแบบ Data Flow Diagram |
| 8 | ER Design | ออกแบบ ER Diagram |
| 9 | Specification Design | ทำ Specification |
| 10 | Specification Approval | รอหัวหน้าสายงาน / ลูกค้าอนุมัติ Spec |
| 11 | Planning | วางแผนงาน Development |
| 12 | Development | กำลังพัฒนา |
| 13 | Internal Testing | ทดสอบภายใน |
| 14 | UAT | ลูกค้าทดสอบ |
| 15 | Bug Fixing | แก้ไข Bug |
| 16 | Ready for Delivery | พร้อมส่งมอบ |
| 17 | Delivered | ส่งมอบแล้ว |
| 18 | Invoicing | ออกใบแจ้งหนี้ |
| 19 | Closed | ปิดโครงการ |
| 20 | MA Active | อยู่ในระยะ MA |

---

## 5. User Roles

| Role | หน้าที่ |
|---|---|
| Admin | จัดการระบบ, ผู้ใช้งาน, สิทธิ์ |
| Project Manager / PM | ดูแลโครงการทั้งหมด, วางแผน, ติดตามงาน |
| BA | เก็บ Requirement, ยืนยัน Requirement |
| SA | วิเคราะห์ระบบ, ออกแบบ DFD / ER / Architecture |
| UI/UX Designer | ออกแบบหน้าจอ, Flow, Prototype |
| Developer | พัฒนาระบบตาม Task |
| Tester / QA | จัดทำ Test Case, ทดสอบ, แจ้ง Bug |
| Team Lead / Head | Review Design, Confirm Specification |
| Customer | ยืนยัน Requirement, Specification, UAT, รับมอบงาน |
| Finance | ออกใบแจ้งหนี้, ติดตามการชำระเงิน |
| MA Support | ดูแลหลังส่งมอบ, รับแจ้งปัญหา |
| Viewer | ดูข้อมูลอย่างเดียว |

---

## 6. Main Modules

```text
1. Customer Management
2. Contract Management
3. Project Management
4. Phase & Milestone Management
5. Requirement Management
6. Requirement Change Control
7. usecase management
7. DFD Designer / Data Flow Management
8. ER Diagram Designer
9. Database Script Generator
10. Specification Management
11. Design Review Management
12. Planning & Manday Management
13. Development Task Tracking
14. Comment / Discussion Feed
15. Test Management
16. Bug / Issue Management
17. Delivery Document Management
18. User Manual Management
19. Invoice & Payment Management
20. MA / Support Ticket Management
21. Renewal / Extension Management
22. Notification & Approval Center
23. Dashboard & Report
24. Document Version Control
25. Audit Log
26. role Management
28. Permission Management
29. team Management
```

---

## 7. Customer Management

ใช้สำหรับเก็บข้อมูลลูกค้า บริษัท ผู้ติดต่อ และประวัติโครงการ

### Customer Data

| Field | รายละเอียด |
|---|---|
| Customer Name | ชื่อลูกค้า / บริษัท |
| Tax ID | เลขประจำตัวผู้เสียภาษี |
| Address | ที่อยู่ |
| Contact Person | ผู้ประสานงาน |
| Phone / Email / Line | ช่องทางติดต่อ |
| Customer Type | บริษัท / หน่วยงานรัฐ / บุคคล |
| Status | Active / Inactive |
| Remark | หมายเหตุ |

### Features

- ดู Project ทั้งหมดของลูกค้ารายนั้น
- ดู Contract ทั้งหมด
- ดู Invoice / Payment
- ดู MA Ticket
- ดูประวัติการติดต่อ

---

## 8. Contract Management

ใช้จัดการสัญญากับลูกค้า ตั้งแต่ร่างสัญญา ลงนาม ต่อสัญญา และขยายเวลา

### Contract Types

| ประเภท | รายละเอียด |
|---|---|
| Development Contract | สัญญาพัฒนาระบบ |
| Maintenance Contract | สัญญา MA |
| Change Request Contract | สัญญางานเพิ่ม |
| Extension Contract | สัญญาขยายระยะเวลา |
| Support Contract | สัญญาดูแลระบบ |

### Contract Data

| Field | รายละเอียด |
|---|---|
| Contract No | เลขที่สัญญา |
| Customer | ลูกค้า |
| Project | โครงการ |
| Contract Type | ประเภทสัญญา |
| Start Date | วันที่เริ่ม |
| End Date | วันที่สิ้นสุด |
| Contract Value | มูลค่าสัญญา |
| Payment Terms | เงื่อนไขการชำระเงิน |
| Scope Summary | สรุปขอบเขตงาน |
| Contract File | ไฟล์สัญญา |
| Sign Status | Draft / Sent / Signed / Expired |
| Renewal Status | ยังไม่ต่อ / รอต่อ / ต่อแล้ว |

### Contract Workflow

```text
Draft Contract
↓
Internal Review
↓
Send to Customer
↓
Customer Review
↓
Signed
↓
Active
↓
Expired / Renewed / Extended
```

---

## 9. Project Management

Project คือแกนหลักของระบบ ทุกอย่างต้องเชื่อมกับ Project

### Project Data

| Field | รายละเอียด |
|---|---|
| Project Code | รหัสโครงการ |
| Project Name | ชื่อโครงการ |
| Customer | ลูกค้า |
| Contract | สัญญาที่เกี่ยวข้อง |
| Project Manager | ผู้จัดการโครงการ |
| BA | Business Analyst |
| SA | System Analyst |
| Start Date | วันที่เริ่ม |
| Planned End Date | วันที่สิ้นสุดตามแผน |
| Actual End Date | วันที่สิ้นสุดจริง |
| Budget Manday | Manday รวม |
| Used Manday | Manday ที่ใช้จริง |
| Project Status | สถานะ |
| Priority | Low / Medium / High / Critical |

### Project Dashboard Should Show

- สถานะ SDLC ปัจจุบัน
- Progress รวมของโครงการ
- Phase ที่กำลังทำ
- งานที่ล่าช้า
- Requirement ที่ยังไม่ Confirm
- Bug ที่ยังไม่ปิด
- Manday แผนเทียบกับใช้จริง
- เอกสารสำคัญ
- Invoice / Payment Status
- MA Status ถ้ามี

---

## 10. Phase / Milestone / Plan Management

ระบบควรให้วางแผนงานแบบหยาบก่อน แล้วค่อยแตกเป็น Task หลัง Specification ผ่านการอนุมัติ

### Planning Structure

```text
Project
 └── Phase
      └── Milestone
           └── Work Package
                └── Task
```

### Example Phases

| Phase | รายละเอียด |
|---|---|
| Phase 1 | Requirement & Analysis |
| Phase 2 | Design |
| Phase 3 | Development |
| Phase 4 | Testing |
| Phase 5 | UAT |
| Phase 6 | Delivery |
| Phase 7 | MA |

### Phase Data

| Field | รายละเอียด |
|---|---|
| Phase Name | ชื่อ Phase |
| Description | รายละเอียด |
| Start Date | วันที่เริ่ม |
| End Date | วันที่สิ้นสุด |
| Owner | ผู้รับผิดชอบหลัก |
| Status | Not Started / In Progress / Done / Delayed |
| Dependency | ต้องรอ Phase ไหนก่อน |
| Progress | เปอร์เซ็นต์ความคืบหน้า |

---

## 11. Requirement Management

Requirement ต้องผ่านการยืนยันจาก BA และลูกค้าก่อนเข้าสู่ขั้นตอนถัดไป

### Requirement Types

| Type | ตัวอย่าง |
|---|---|
| Functional Requirement | ระบบต้อง Login ได้ |
| Non-Functional Requirement | รองรับผู้ใช้ 1,000 คน |
| Business Rule | อนุมัติได้เฉพาะหัวหน้า |
| Report Requirement | รายงานยอดขายรายเดือน |
| Integration Requirement | เชื่อมต่อ API ภายนอก |
| Security Requirement | ต้องใช้ Role Permission |
| Data Requirement | ต้องเก็บข้อมูลลูกค้า |
| UI Requirement | ต้องมีหน้าจอ Dashboard |

### Requirement Data

| Field | รายละเอียด |
|---|---|
| Requirement Code | REQ-001 |
| Title | หัวข้อ |
| Description | รายละเอียด |
| Requirement Type | ประเภท |
| Source | ลูกค้า / BA / เอกสาร / ประชุม |
| Priority | Must / Should / Could / Won’t |
| Business Value | คุณค่าทางธุรกิจ |
| Acceptance Criteria | เงื่อนไขการยอมรับ |
| Related Files | เอกสารแนบ |
| Created By | ผู้สร้าง |
| BA Confirm Status | Pending / Confirmed / Rejected |
| Customer Confirm Status | Pending / Confirmed / Rejected |
| Version | เวอร์ชัน |
| Status | Draft / In Review / Approved / Changed / Cancelled |

### Requirement Workflow

```text
Draft Requirement
↓
BA Review
↓
BA Confirm
↓
Customer Review
↓
Customer Confirm
↓
Ready for Analysis
```

### Business Rule

```text
Requirement ที่ยังไม่ผ่านการ Confirm จาก BA และลูกค้า
ห้ามนำไปทำ DFD / ER / Specification / Plan / Develop
```

---

## 12. Requirement Change Control

ใช้ควบคุมการเปลี่ยน Requirement ระหว่างโครงการ

### When to Create Change Request

- ลูกค้าเพิ่ม Requirement
- ลูกค้าแก้ Requirement เดิม
- Requirement กระทบ Database
- Requirement กระทบ UI
- Requirement กระทบ Manday
- Requirement กระทบแผนส่งมอบ
- Requirement กระทบสัญญา

### Change Request Workflow

```text
Create Change Request
↓
Impact Analysis
↓
Estimate Manday
↓
Internal Approval
↓
Customer Approval
↓
Update Requirement / Spec / Plan
```

### Impact Data

| Impact | รายละเอียด |
|---|---|
| DFD Impact | กระทบ Data Flow ไหน |
| ER Impact | กระทบ Table / Column ไหน |
| UI Impact | กระทบหน้าจอไหน |
| API Impact | กระทบ Endpoint ไหน |
| Test Impact | ต้องทดสอบใหม่ส่วนไหน |
| Manday Impact | เพิ่ม/ลดกี่ Manday |
| Timeline Impact | เลื่อนกี่วัน |
| Cost Impact | มีค่าใช้จ่ายเพิ่มหรือไม่ |

---

## 13. DFD Design Module

ระบบควรรองรับการออกแบบ Data Flow Diagram จาก Requirement

### Supported DFD Levels

| Level | รายละเอียด |
|---|---|
| Context Diagram | ภาพรวมระบบกับ External Entity |
| DFD Level 0 | Process ใหญ่ของระบบ |
| DFD Level 1 | แตก Process รายละเอียด |
| DFD Level 2 | รายละเอียดเชิงลึกเฉพาะจุด |

### DFD Elements

| Element | รายละเอียด |
|---|---|
| External Entity | ลูกค้า, Admin, Payment Gateway |
| Process | กระบวนการ เช่น Login, Create Order |
| Data Store | แหล่งเก็บข้อมูล เช่น Customer DB |
| Data Flow | เส้นทางข้อมูล |
| Related Requirement | Requirement ที่เกี่ยวข้อง |

### DFD Process Data

| Field | รายละเอียด |
|---|---|
| Process Code | P-001 |
| Process Name | Register User |
| Description | รายละเอียดการทำงาน |
| Input Data | ข้อมูลเข้า |
| Output Data | ข้อมูลออก |
| Related Requirement | REQ ที่เกี่ยวข้อง |
| Related Data Store | Data Store ที่เกี่ยวข้อง |
| Owner | SA / BA |
| Status | Draft / Review / Approved |

---

## 14. ER Diagram Module

เมื่อ DFD เสร็จแล้ว SA จะนำไปออกแบบ ER Diagram และ Relationship

### Features

- สร้าง Table
- สร้าง Column
- กำหนด Data Type
- กำหนด Primary Key
- กำหนด Foreign Key
- กำหนด Unique Constraint
- กำหนด Index
- กำหนด Nullable / Not Null
- กำหนด Default Value
- กำหนด Relationship
- เชื่อม Table กับ DFD Data Store
- เชื่อม Column กับ Requirement
- เชื่อม Entity กับ Specification
- Version Control ER Diagram
- ตรวจสอบผลกระทบเมื่อมีการเปลี่ยน ER

### ER Table Data

| Field | รายละเอียด |
|---|---|
| Table Name | ชื่อตาราง |
| Display Name | ชื่อแสดงผล |
| Description | รายละเอียด |
| Related DFD Data Store | Data Store ที่เกี่ยวข้อง |
| Related Requirement | Requirement ที่เกี่ยวข้อง |
| Status | Draft / Review / Approved |

### ER Column Data

| Field | รายละเอียด |
|---|---|
| Column Name | ชื่อ Column |
| Data Type | varchar, int, uuid |
| Length | ความยาว |
| Nullable | อนุญาต Null หรือไม่ |
| Default Value | ค่าเริ่มต้น |
| Is Primary Key | เป็น PK หรือไม่ |
| Is Foreign Key | เป็น FK หรือไม่ |
| Reference Table | อ้างอิงตาราง |
| Reference Column | อ้างอิง Column |
| Description | รายละเอียด |
| Related Requirement | Requirement ที่เกี่ยวข้อง |

### ER Approval Workflow

```text
Create ER Draft
↓
SA Review
↓
Design Review
↓
SA Confirm
↓
Ready for Specification / Script Export
```

---

## 15. Database Script Generator

เมื่อ ER ผ่านการอนุมัติแล้ว ระบบต้อง Export Script ได้ตาม Database Type

### Supported Databases

| Database | ตัวอย่าง Output |
|---|---|
| PostgreSQL | CREATE TABLE, UUID, SERIAL, TIMESTAMP |
| MySQL | CREATE TABLE, AUTO_INCREMENT |
| SQL Server | CREATE TABLE, IDENTITY |
| Oracle | CREATE TABLE, SEQUENCE |
| SQLite | CREATE TABLE |

### MVP Recommended Databases

- PostgreSQL
- MySQL

### Exportable Scripts

- Create Table
- Alter Table
- Drop Table
- Add Column
- Drop Column
- Modify Column
- Add Constraint
- Drop Constraint
- Create Index
- Insert Master Data
- Migration Script
- Rollback Script

### ER Change Example

```text
customer.phone_number ถูกลบออก
```

ระบบควรแจ้งว่า:

```text
Impact:
- กระทบ Specification: หน้าจอ Customer Form
- กระทบ API: POST /customers
- กระทบ Test Case: TC-CUS-001
- กระทบ Report: Customer Contact Report
- ต้องสร้าง Migration Script: ALTER TABLE customers DROP COLUMN phone_number;
```

---

## 16. Specification Management

Specification คือเอกสารที่บอกว่าแต่ละ Feature / UI / API / Data ทำอะไรได้บ้าง

### Specification Links

```text
Requirement
DFD Process
ER Table / Column
UI Screen
API Endpoint
Test Case
Manday
Task Plan
```

### Specification Types

| Type | รายละเอียด |
|---|---|
| UI Specification | หน้าจอทำอะไรได้บ้าง |
| API Specification | Endpoint รับ/ส่งอะไร |
| Business Rule Specification | กฎของระบบ |
| Report Specification | รายงาน |
| Data Specification | ตาราง/Column ที่ใช้ |
| Integration Specification | เชื่อมต่อระบบอื่น |
| Permission Specification | สิทธิ์ผู้ใช้งาน |

### UI Specification Example

| Field | รายละเอียด |
|---|---|
| Spec Code | SPEC-001 |
| Screen Name | Customer Management |
| Related Requirement | REQ-001, REQ-002 |
| Related ER | customers, customer_contacts |
| UI Action | Add, Edit, Delete, Search |
| Validation Rule | Tax ID ต้อง 13 หลัก |
| Permission | Admin, Sales |
| Estimated Manday | 3 Manday |
| Dependency | ต้องมี Table customers ก่อน |
| Status | Draft / Review / Approved |

### Specification Workflow

```text
Draft Specification
↓
Internal Review
↓
Head / Team Lead Confirm
↓
Customer Review
↓
Customer Confirm
↓
Ready for Planning
```

### Business Rule

```text
Specification ที่ยังไม่ผ่าน Head และลูกค้า
ห้ามนำไปแตก Task Development
```

---

## 17. Design Review Management

ระบบควรมีระบบ Review งานออกแบบ เช่น DFD, ER, UI, Spec

### Reviewable Items

- Requirement
- DFD
- ER Diagram
- Database Design
- UI Flow
- API Design
- Specification
- Test Case
- User Manual

### Review Comment Types

| Type | รายละเอียด |
|---|---|
| Suggestion | ข้อเสนอแนะ |
| Correction | จุดที่ต้องแก้ |
| Risk | ความเสี่ยง |
| Question | คำถาม |
| Approval Note | หมายเหตุประกอบการอนุมัติ |

### Review Workflow

```text
Submit for Review
↓
Reviewer Comment
↓
Designer Revise
↓
Resubmit
↓
Approved / Rejected
```

### Review Example

```text
ER Review:
Table: project_requirements
Issue: ไม่มี field สำหรับ version
Severity: Medium
Reviewer: SA Lead
Assigned To: System Analyst
Due Date: 2 วัน
Status: Open
```

---

## 18. Planning & Manday Management

หลังจาก Specification ผ่านการอนุมัติแล้ว จึงนำไปวางแผน Development

### Planning Inputs

- Specification
- Manday Estimate
- Priority
- Dependency
- Developer Availability
- Phase
- Milestone
- Deadline
- Risk
- Customer Delivery Date

### Development Task Data

| Field | รายละเอียด |
|---|---|
| Task Code | TASK-001 |
| Task Name | Develop Customer Form |
| Related Spec | SPEC-001 |
| Assigned To | Developer |
| Start Date | วันที่เริ่ม |
| End Date | วันที่จบตามแผน |
| Actual Start | วันที่เริ่มจริง |
| Actual End | วันที่จบจริง |
| Estimate Manday | Manday ประเมิน |
| Actual Manday | Manday ใช้จริง |
| Status | Todo / Doing / Done / Delay |
| Dependency | รอ Task อื่น |
| Impact If Delay | กระทบอะไร |

### Task Status

| Status | ความหมาย |
|---|---|
| Todo | ยังไม่เริ่ม |
| In Progress | กำลังทำ |
| Waiting Review | รอ Review |
| Waiting Fix | รอแก้ไข |
| Done | เสร็จ |
| Delayed | ล่าช้า |
| Blocked | ติดปัญหา |
| Cancelled | ยกเลิก |

---

## 19. Dependency & Impact Tracking

ระบบควรตรวจสอบว่างานหนึ่งล่าช้า แล้วกระทบงานอื่นหรือไม่

### Example

```text
TASK-001: ออกแบบ Table Customer
ล่าช้า 2 วัน

กระทบ:
- TASK-002: Develop Customer API
- TASK-003: Develop Customer UI
- TC-001: Test Customer Create
- Delivery Milestone Phase 2
```

### Notifications

ระบบควรแจ้งเตือนเมื่อมี:

- งานล่าช้า
- งานที่ถูกกระทบ
- Phase ที่อาจเลื่อน
- Manday ที่เกิน
- คนที่เกี่ยวข้อง
- PM ที่ต้องตัดสินใจ

---

## 20. Comment / Discussion Feed

ระบบควรมี Comment แบบ Facebook Post เพื่อคุยงานกับผู้รับผิดชอบโดยตรง และให้ผู้อื่นเห็นได้

### Comment Levels

| ระดับ | ใช้กับ |
|---|---|
| Project Feed | คุยภาพรวมโครงการ |
| Requirement Comment | คุย Requirement |
| DFD Comment | คุย DFD |
| ER Comment | คุย Table / Column |
| Spec Comment | คุย Specification |
| Task Comment | คุยงาน Develop |
| Bug Comment | คุย Bug |
| Test Comment | คุยผลทดสอบ |
| MA Ticket Comment | คุยงาน Support |

### Features

- Mention ผู้รับผิดชอบ เช่น `@developer`
- แนบไฟล์ / รูป / เอกสาร
- Reply เป็น Thread
- Pin Comment สำคัญ
- Mark as Decision
- Mark as Question
- Mark as Resolved
- Like / Acknowledge
- Notify ผู้เกี่ยวข้อง
- เห็นประวัติการคุยทั้งหมด

### Example

```text
Post:
@Somchai ช่วยเช็ค API Create Customer ให้หน่อยครับ
ตอนนี้ Test แล้ว Error กรณี Tax ID ซ้ำ

Related:
- TASK-012
- BUG-004
- SPEC-001
```

---

## 21. Test Management

ระบบควรรองรับเอกสารทดสอบครบ 4 ระดับ

### Test Types

| Test Type | รายละเอียด |
|---|---|
| Unit Test | ทดสอบฟังก์ชันย่อย |
| Integration Test | ทดสอบการเชื่อมต่อระหว่าง Module |
| System Test | ทดสอบทั้งระบบ |
| Acceptance Test / UAT | ลูกค้าทดสอบรับมอบ |

### Test Document Data

| Field | รายละเอียด |
|---|---|
| Test Plan | แผนการทดสอบ |
| Test Scenario | สถานการณ์ทดสอบ |
| Test Case | รายการทดสอบ |
| Test Step | ขั้นตอนทดสอบ |
| Expected Result | ผลที่คาดหวัง |
| Actual Result | ผลจริง |
| Test Status | Pass / Fail / Blocked |
| Tester | ผู้ทดสอบ |
| Test Date | วันที่ทดสอบ |
| Related Requirement | Requirement ที่เกี่ยวข้อง |
| Related Spec | Specification ที่เกี่ยวข้อง |
| Related Task | Task ที่เกี่ยวข้อง |

### Test Case Example

| Field | ตัวอย่าง |
|---|---|
| Test Case Code | TC-CUS-001 |
| Module | Customer Management |
| Scenario | เพิ่มลูกค้าใหม่ |
| Step | กรอกชื่อ, Tax ID, กด Save |
| Expected Result | ระบบบันทึกข้อมูลสำเร็จ |
| Actual Result | ระบบแจ้ง Error |
| Status | Fail |
| Bug Created | BUG-001 |

---

## 22. Bug / Issue Management

เมื่อทดสอบเจอ Bug ต้องแจ้งผู้รับผิดชอบ และผูกเข้ากับแผนแก้ไข

### Bug Data

| Field | รายละเอียด |
|---|---|
| Bug Code | BUG-001 |
| Title | หัวข้อ Bug |
| Description | รายละเอียด |
| Severity | Low / Medium / High / Critical |
| Priority | Low / Medium / High / Urgent |
| Found By | Tester / Customer |
| Assigned To | Developer |
| Related Test Case | Test Case ที่เจอ |
| Related Task | Task ที่เกี่ยวข้อง |
| Related Spec | Specification |
| Found Date | วันที่พบ |
| Fix Due Date | วันที่คาดว่าแก้เสร็จ |
| Fixed Date | วันที่แก้จริง |
| Status | Open / Fixing / Fixed / Retest / Closed / Reopen |

### Bug Workflow

```text
Tester Found Bug
↓
Create Bug
↓
Assign Developer
↓
Developer Fix
↓
Submit for Retest
↓
Tester Retest
↓
Pass → Close
Fail → Reopen
```

### Required Retest Planning

เมื่อมี Bug ระบบควรบังคับให้ระบุ:

- จะแก้เสร็จเมื่อไหร่
- จะ Retest วันไหน
- กระทบแผนส่งมอบหรือไม่
- ต้องแจ้งลูกค้าหรือไม่
- ใช้ Manday เพิ่มหรือไม่

---

## 23. Delivery Management

เมื่อพัฒนาเสร็จครบตามกำหนด ระบบควรสร้างเอกสารส่งมอบให้ลูกค้า

### Delivery Gate

ก่อนส่งมอบ ระบบควรตรวจสอบว่า:

- Requirement ผ่านการ Confirm แล้ว
- Specification ผ่านการ Confirm แล้ว
- Development Task เสร็จครบ
- Test Case สำคัญผ่านหมด
- Bug Critical / High ถูกปิดหมด
- User Manual พร้อม
- Release Note พร้อม
- Delivery Checklist ผ่าน
- PM อนุมัติส่งมอบ

### Delivery Documents

| เอกสาร | รายละเอียด |
|---|---|
| Delivery Letter | หนังสือส่งมอบงาน |
| Delivery Checklist | รายการส่งมอบ |
| Release Note | รายละเอียด Version |
| User Manual | คู่มือผู้ใช้งาน |
| Admin Manual | คู่มือผู้ดูแลระบบ |
| Installation Manual | คู่มือติดตั้ง |
| Test Summary Report | สรุปผลทดสอบ |
| UAT Sign-off | เอกสารลูกค้ารับรอง |
| Source Code Package | รายการ Source Code |
| Database Script | Script ที่ส่งมอบ |
| Credential Sheet | ข้อมูลระบบที่ส่งมอบแบบควบคุมสิทธิ์ |

---

## 24. User Manual Management

ระบบควรช่วยจัดทำคู่มือการใช้งานจาก Specification และหน้าจอ

### Manual Types

| Manual Type | รายละเอียด |
|---|---|
| User Manual | คู่มือผู้ใช้งานทั่วไป |
| Admin Manual | คู่มือผู้ดูแลระบบ |
| Installation Manual | คู่มือติดตั้ง |
| Operation Manual | คู่มือปฏิบัติงาน |
| Troubleshooting Guide | คู่มือแก้ปัญหาเบื้องต้น |

### Manual Content

- ชื่อ Module
- วัตถุประสงค์
- สิทธิ์ที่ใช้งานได้
- ขั้นตอนใช้งาน
- ภาพหน้าจอ
- คำอธิบายปุ่ม
- Validation
- Error Message
- FAQ

### Manual Link Example

```text
SPEC-001 Customer Management
↓
Manual Section: วิธีเพิ่มลูกค้าใหม่
↓
Screen: Customer Create Page
↓
Permission: Admin / Sales
```

---

## 25. Invoice & Payment Management

หลังส่งมอบหรือตาม Milestone ระบบต้องออกใบแจ้งหนี้และติดตามการชำระเงิน

### Billing Types

| Type | รายละเอียด |
|---|---|
| Fixed Price | จ่ายตามสัญญา |
| Milestone Billing | จ่ายตามงวดงาน |
| Monthly Billing | รายเดือน |
| MA Billing | ค่าบำรุงรักษา |
| Change Request Billing | งานเพิ่ม |

### Invoice Data

| Field | รายละเอียด |
|---|---|
| Invoice No | เลขใบแจ้งหนี้ |
| Customer | ลูกค้า |
| Project | โครงการ |
| Contract | สัญญา |
| Milestone | งวดงาน |
| Amount | ยอดเงิน |
| VAT | ภาษี |
| Total Amount | ยอดรวม |
| Due Date | วันครบกำหนด |
| Payment Status | Unpaid / Partial / Paid / Overdue |
| Payment Date | วันที่ชำระ |
| Receipt File | ใบเสร็จ |

### Finance Workflow

```text
Generate Invoice
↓
Send to Customer
↓
Waiting Payment
↓
Payment Received
↓
Issue Receipt
↓
Close Billing
```

---

## 26. MA / Support Ticket Management

หลังส่งมอบแล้ว ระบบต้องรองรับงาน MA

### MA Ticket Types

| Type | รายละเอียด |
|---|---|
| Bug Support | แจ้งปัญหาระบบ |
| Data Issue | ข้อมูลผิด |
| User Support | ผู้ใช้ใช้งานไม่ได้ |
| Change Request | ขอเพิ่ม/แก้ Feature |
| Performance Issue | ระบบช้า |
| Security Issue | ปัญหาความปลอดภัย |
| Server / Infra Issue | ปัญหา Server |

### Ticket Data

| Field | รายละเอียด |
|---|---|
| Ticket No | เลข Ticket |
| Customer | ลูกค้า |
| Project | โครงการ |
| Contract MA | สัญญา MA |
| Title | หัวข้อ |
| Description | รายละเอียด |
| Severity | Low / Medium / High / Critical |
| SLA | ระยะเวลาที่ต้องตอบกลับ |
| Assigned To | ผู้รับผิดชอบ |
| Status | Open / In Progress / Waiting Customer / Resolved / Closed |
| Reported Date | วันที่แจ้ง |
| Due Date | วันครบกำหนด |
| Resolved Date | วันที่แก้เสร็จ |

### Ticket Workflow

```text
Customer Create Ticket
↓
Support Triage
↓
Assign Owner
↓
Investigate
↓
Fix / Reply
↓
Customer Confirm
↓
Close Ticket
```

---

## 27. MA Renewal / Contract Extension

ระบบต้องรองรับการต่อสัญญา MA หรือขยายเวลา

### Renewal Notifications

ระบบควรแจ้งเตือนเมื่อ:

- สัญญา MA ใกล้หมดอายุใน 90 วัน
- สัญญา MA ใกล้หมดอายุใน 60 วัน
- สัญญา MA ใกล้หมดอายุใน 30 วัน
- ยังไม่มี Invoice MA รอบใหม่
- ลูกค้ายังไม่ Confirm ต่อสัญญา
- มี Ticket ค้างก่อนปิดสัญญา

### Renewal Workflow

```text
MA Expiring Soon
↓
Notify PM / Sales
↓
Prepare Renewal Proposal
↓
Send to Customer
↓
Customer Confirm
↓
Create New Contract
↓
Activate New MA Period
```

---

## 28. Approval Center

เนื่องจากระบบมีหลายจุดที่ต้อง Confirm ควรมีหน้ากลางสำหรับ Approval

### Approval Items

| รายการ | ผู้อนุมัติ |
|---|---|
| Requirement | BA + Customer |
| DFD | SA / SA Lead |
| ER Diagram | SA |
| Specification | Head + Customer |
| Change Request | PM + Customer |
| Test Plan | QA Lead |
| UAT Result | Customer |
| Delivery | PM + Customer |
| Invoice | Finance / PM |
| MA Renewal | Customer |

### Approval Status

```text
Pending
Approved
Rejected
Need Revision
Cancelled
```

### Approval Data

- Document Type
- Document Code
- Version
- Requested By
- Approver
- Approval Date
- Comment
- Signature / e-Sign
- Attachment

---

## 29. Document Version Control

ทุกเอกสารสำคัญควรมี Version

### Version Controlled Documents

- Requirement
- DFD
- ER Diagram
- Specification
- Test Case
- User Manual
- Delivery Document
- Contract
- Change Request

### Version Example

```text
REQ-001 v1.0 Draft
REQ-001 v1.1 BA Revised
REQ-001 v2.0 Customer Approved
```

### Version Data

- Version No
- Changed By
- Changed Date
- Change Summary
- Previous Version
- Approval Status
- Active Version

---

## 30. Dashboard & Report

ระบบควรมี Dashboard แยกตาม Role

### PM Dashboard

- จำนวน Project ทั้งหมด
- Project ที่กำลังทำ
- Project ที่ล่าช้า
- Task ที่ Overdue
- Bug Critical
- Manday Used vs Planned
- Payment Pending
- MA ใกล้หมดอายุ

### Developer Dashboard

- งานที่ได้รับมอบหมาย
- งานที่ใกล้ครบกำหนด
- Bug ที่ต้องแก้
- Comment ที่ mention ถึงตน
- งานที่ Blocked

### BA Dashboard

- Requirement ที่รอ Review
- Requirement ที่รอลูกค้า Confirm
- Change Request
- Requirement ที่ถูก Reject

### SA Dashboard

- DFD ที่ต้องออกแบบ
- ER ที่รอ Review
- ER Impact จาก Requirement Change
- Specification ที่ต้องตรวจ

### QA Dashboard

- Test Case ที่ต้องทดสอบ
- Bug ที่รอ Retest
- Test Progress
- UAT Status

### Customer Dashboard

- Project Progress
- Requirement ที่ต้อง Confirm
- Specification ที่ต้อง Confirm
- UAT ที่ต้องทดสอบ
- เอกสารส่งมอบ
- Invoice
- MA Ticket

---

## 31. Notification System

ระบบควรแจ้งเตือนผ่านหลายช่องทาง

### Notification Channels

- In-app Notification
- Email
- Line Notify / Line OA
- Microsoft Teams
- Slack
- Calendar Reminder

### Notification Events

- มี Requirement รอ Confirm
- มี Spec รอ Confirm
- มี Comment mention
- มี Task ใกล้ครบกำหนด
- มี Task ล่าช้า
- มี Bug ใหม่
- มี Bug รอ Retest
- มี Invoice ใกล้ Due
- มี MA ใกล้หมดอายุ
- มี Ticket Critical

---

## 32. Key Business Rules

### Rule 1: Requirement Gate

```text
Requirement ต้องผ่าน BA Confirm และ Customer Confirm
ก่อนเข้าสู่ Analysis / DFD / ER / Specification
```

### Rule 2: Specification Gate

```text
Specification ต้องผ่าน Head Confirm และ Customer Confirm
ก่อนนำไปแตก Development Task
```

### Rule 3: ER Change Impact

```text
ถ้า ER เปลี่ยน ต้องตรวจสอบ Impact กับ Spec, API, UI, Test Case และ Script
```

### Rule 4: Bug Gate

```text
Bug ระดับ Critical / High ต้องปิดก่อนส่งมอบ
```

### Rule 5: Delivery Gate

```text
ส่งมอบไม่ได้ถ้า Test Summary ไม่ผ่าน หรือ UAT ยังไม่ Confirm
```

### Rule 6: Invoice Gate

```text
Invoice ตาม Milestone ต้องอ้างอิง Delivery หรือ Contract Payment Term
```

### Rule 7: MA Gate

```text
Ticket MA ต้องอยู่ภายใต้สัญญา MA ที่ Active
```

---

## 33. Business Data Model

### Main Entities

```text
Customer
Contract
Project
ProjectMember
ProjectPhase
Milestone
Requirement
RequirementApproval
RequirementChangeRequest
DFD
DFDProcess
DFDDataFlow
ERDiagram
ERTable
ERColumn
ERRelationship
Specification
SpecificationApproval
DesignReview
Task
TaskDependency
Comment
TestPlan
TestCase
TestResult
Bug
Delivery
UserManual
Invoice
Payment
MATicket
MARenewal
DocumentVersion
Notification
AuditLog
```

---

## 34. ER Concept

```text
Customer 1---N Project
Customer 1---N Contract
Project 1---N Contract
Project 1---N ProjectPhase
ProjectPhase 1---N Milestone
Milestone 1---N Task

Project 1---N Requirement
Requirement 1---N RequirementApproval
Requirement 1---N RequirementChangeRequest
Requirement N---N DFDProcess

DFD 1---N DFDProcess
DFD 1---N DFDDataFlow

Project 1---N ERDiagram
ERDiagram 1---N ERTable
ERTable 1---N ERColumn
ERTable 1---N ERRelationship

Requirement N---N Specification
Specification N---N ERColumn
Specification 1---N Task

Task 1---N Comment
Task 1---N Bug
Task N---N TaskDependency

Project 1---N TestPlan
TestPlan 1---N TestCase
TestCase 1---N TestResult
TestResult 0---1 Bug

Project 1---N Delivery
Delivery 1---N UserManual
Delivery 1---N Invoice
Invoice 1---N Payment

Project 1---N MATicket
Contract 1---N MARenewal
```

---

## 35. Permission Matrix

| Module | PM | BA | SA | Dev | QA | Customer | Finance |
|---|---|---|---|---|---|---|---|
| Project | Full | View | View | View | View | View | View |
| Requirement | Approve | Full | View | View | View | Approve | - |
| DFD | View | Edit | Full | View | View | View | - |
| ER | View | View | Full | View | View | - | - |
| Spec | Approve | Edit | Edit | View | View | Approve | - |
| Plan | Full | View | View | View | View | View | - |
| Task | Full | View | View | Edit | View | View | - |
| Test | View | View | View | View | Full | View/UAT | - |
| Bug | View | View | View | Fix | Full | Create/View | - |
| Delivery | Full | View | View | View | View | Approve | View |
| Invoice | View | - | - | - | - | View | Full |
| MA | Full | View | View | Fix | Test | Create/View | View |

---

## 36. Main Screens

### Project Screens

1. Project List
2. Project Dashboard
3. Project Detail
4. Project Member
5. Project Timeline
6. Phase / Milestone
7. Task Board
8. Gantt Chart
9. Dependency View

### Requirement / Analysis Screens

10. Requirement List
11. Requirement Detail
12. Requirement Approval
13. Change Request
14. DFD Designer
15. DFD Review
16. ER Designer
17. ER Review
18. Database Script Export

### Specification / Planning Screens

19. Specification List
20. Specification Detail
21. UI Scope Mapping
22. ER Mapping
23. Manday Estimate
24. Specification Approval
25. Planning from Approved Spec

### Development Screens

26. Developer Task Board
27. Task Detail
28. Task Comment Feed
29. Code Review Reference
30. Delay Impact View

### Testing Screens

31. Test Plan
32. Test Case
33. Test Execution
34. Bug List
35. Bug Detail
36. Retest Plan
37. Test Summary Report
38. UAT Approval

### Delivery / Finance / MA Screens

39. Delivery Checklist
40. Delivery Document Generator
41. User Manual Builder
42. Invoice List
43. Payment Tracking
44. MA Ticket
45. MA SLA Dashboard
46. MA Renewal

### System Screens

47. User Management
48. Role & Permission
49. Notification Center
50. Approval Center
51. Audit Log
52. Master Data

---

## 37. Traceability Matrix

Traceability Matrix เป็นหัวใจสำคัญของระบบนี้ ใช้ติดตามว่า Requirement หนึ่งตัวเชื่อมโยงไปถึงอะไรบ้าง

```text
REQ-001
↓
DFD Process: P-001
↓
ER Table: customers
↓
ER Column: customers.name, customers.tax_id
↓
Spec: SPEC-001
↓
Task: TASK-001, TASK-002
↓
Test Case: TC-001
↓
Bug: BUG-001
↓
Delivery: DEL-001
```

### Benefits

- รู้ว่า Requirement ทำครบหรือยัง
- ถ้า Requirement เปลี่ยน รู้ว่ากระทบอะไร
- ลูกค้าตรวจสอบได้
- ใช้เป็นหลักฐานตอนส่งมอบ

---

## 38. Impact Analysis Engine

เมื่อมีการเปลี่ยนแปลง ระบบควรวิเคราะห์ผลกระทบอัตโนมัติ

### Example

```text
ลบ Column: customer.email
```

### Impact Result

```text
กระทบ:
- UI: Customer Form
- API: POST /customers
- Report: Customer Contact Report
- Test Case: TC-CUS-001
- User Manual: Section 2.1
- Database Script: ต้องสร้าง Migration
```

---

## 39. Baseline Plan

เมื่อแผนได้รับการอนุมัติ ควร Save เป็น Baseline เพื่อใช้เปรียบเทียบกับแผนจริง

### Compare Items

- แผนเดิมเป็นอย่างไร
- แผนจริงเปลี่ยนไปแค่ไหน
- งานล่าช้ากี่วัน
- ใช้ Manday เกินเท่าไหร่
- มี Change Request กี่รอบ

---

## 40. Customer Portal

ลูกค้าควรมีหน้าใช้งานเอง

### Customer Portal Features

- ดู Progress โครงการ
- Confirm Requirement
- Confirm Specification
- ดู UAT
- แจ้ง Bug
- Download เอกสารส่งมอบ
- ดู Invoice
- แจ้ง Ticket MA

---

## 41. Project Health Score

ระบบควรให้คะแนนสุขภาพโครงการ

| Factor | น้ำหนัก |
|---|---|
| งานล่าช้า | 30% |
| Bug Critical | 20% |
| Manday เกิน | 20% |
| Requirement เปลี่ยนบ่อย | 15% |
| Invoice ค้าง | 10% |
| MA Ticket ค้าง | 5% |

### Result

```text
Green = ปกติ
Yellow = เริ่มเสี่ยง
Red = เสี่ยงสูง
```

---

## 42. Recommended MVP Roadmap

ระบบนี้มีขนาดใหญ่ จึงควรแบ่งพัฒนาเป็น Phase

### Phase 1: Project + Contract + Requirement

- Customer
- Contract
- Project
- Project Member
- Phase / Milestone
- Requirement
- Requirement Approval
- Comment
- Basic Dashboard

### Phase 2: DFD + ER + Specification

- DFD Management
- ER Diagram Management
- ER Table / Column
- Relationship
- Export Script PostgreSQL / MySQL
- Specification
- Spec Approval
- Traceability Matrix

### Phase 3: Planning + Development Tracking

- Task Board
- Manday
- Dependency
- Delay Impact
- Gantt Chart
- Design Review
- Notification

### Phase 4: Test + Bug

- Test Plan
- Test Case
- Test Execution
- Bug Management
- Retest Plan
- Test Summary Report
- UAT Approval

### Phase 5: Delivery + Finance

- Delivery Checklist
- Delivery Document
- User Manual
- Invoice
- Payment Tracking
- Project Closure

### Phase 6: MA + Renewal

- MA Contract
- Support Ticket
- SLA
- MA Dashboard
- Renewal / Extension
- Customer Portal

---

## 43. Suggested System Name

### Professional Names

- SoftFlow PM
- DevLifecycle Manager
- Project SDLC Hub
- Requirement to Delivery Platform
- Software Delivery Control Center

### Thai Names

- ระบบบริหารโครงการพัฒนาซอฟต์แวร์ครบวงจร
- ระบบติดตามงานพัฒนาระบบ
- ระบบจัดการโครงการและส่งมอบซอฟต์แวร์
- ระบบบริหาร SDLC และ MA

### Recommended Name

```text
SoftFlow: Software Project Lifecycle Management System
```

---

## 44. Summary

ระบบนี้ควรออกแบบเป็น **Project Lifecycle Platform** ที่เชื่อมโยงการทำงานตั้งแต่ต้นจนจบ

```text
Requirement → DFD → ER → Spec → Plan → Develop → Test → Deliver → Invoice → MA
```

โดยทุกส่วนต้องเชื่อมกันแบบ Traceability เพื่อให้รู้ว่า:

- Requirement นี้มาจากไหน
- ใคร Confirm แล้ว
- ออกแบบ DFD / ER อะไร
- ใช้ Table / Column ไหน
- อยู่ใน Specification ไหน
- ใช้ Manday เท่าไร
- ถูก Develop โดยใคร
- Test แล้วหรือยัง
- มี Bug ไหม
- ส่งมอบแล้วหรือยัง
- วางบิลแล้วหรือยัง
- อยู่ใน MA หรือไม่
