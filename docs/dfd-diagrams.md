# DFD Diagrams - SIC Project

เอกสารนี้สรุป Data Flow Diagram ของระบบ SIC จากโครงสร้างโปรเจกต์ปัจจุบัน โดยอ้างอิงจาก Angular frontend, Spring Boot API, Keycloak, PostgreSQL, SeaweedFS และ Report Service ใน `docker-compose.yml` รวมถึง controller/module หลักใน backend

## DFD Level 0: Context Diagram

```mermaid
flowchart LR
  user[ผู้ใช้งานระบบ<br/>PM / SA / Dev / Tester / Admin]
  customer[ลูกค้า / ผู้เกี่ยวข้องภายนอก]
  keycloak[Keycloak<br/>Identity Provider]
  ai[AI Provider<br/>Gemini / Claude]
  report[Report Service]

  sic((0<br/>SIC Project Management System))

  db[(PostgreSQL<br/>SIC Application Data)]
  object[(SeaweedFS / S3<br/>File & Document Storage)]

  user -->|เข้าสู่ระบบ, จัดการโปรเจกต์, เอกสาร, งาน, อนุมัติ| sic
  sic -->|หน้าจอ, ข้อมูลโปรเจกต์, รายงาน, แจ้งเตือน| user

  customer -->|ข้อมูลลูกค้า, สัญญา, requirement, sign-off| sic
  sic -->|เอกสาร, สถานะงาน, delivery, invoice| customer

  sic -->|ตรวจสอบ token / profile| keycloak
  keycloak -->|JWT / ข้อมูลสิทธิ์| sic

  sic -->|คำขอสร้าง requirement, DFD, spec, test, draft| ai
  ai -->|ผลลัพธ์ที่ AI สร้าง| sic

  sic -->|คำขอสร้าง PDF / รายงาน| report
  report -->|ไฟล์รายงาน| sic

  sic <-->|อ่าน/บันทึกข้อมูลธุรกิจและโปรเจกต์| db
  sic <-->|อัปโหลด/ดาวน์โหลดไฟล์แนบและเอกสาร| object
```

## DFD Level 1: Main Process Decomposition

```mermaid
flowchart TB
  user[ผู้ใช้งานระบบ<br/>PM / SA / Dev / Tester / Admin]
  customer[ลูกค้า / ผู้เกี่ยวข้องภายนอก]
  keycloak[Keycloak<br/>Identity Provider]
  ai[AI Provider<br/>Gemini / Claude]
  report[Report Service]

  p1((1.0<br/>Authentication, Profile<br/>& Business Management))
  p2((2.0<br/>Project & Customer<br/>Management))
  p3((3.0<br/>Analysis, Design<br/>& Traceability))
  p4((4.0<br/>Task, Approval<br/>& Collaboration))
  p5((5.0<br/>File Storage<br/>& Document Output))
  p6((6.0<br/>Search, Dashboard<br/>& Reference Data))

  d1[(D1<br/>User, Profile,<br/>Business & Role Data)]
  d2[(D2<br/>Customer, Contract<br/>& Project Data)]
  d3[(D3<br/>Requirement, Diagram,<br/>Specification & Test Data)]
  d4[(D4<br/>Task, Approval,<br/>Chat, Notification<br/>& Audit Log Data)]
  d5[(D5<br/>File Metadata)]
  d6[(D6<br/>Reference / Master Data)]
  object[(D7<br/>SeaweedFS / S3<br/>Object Files)]

  user -->|login, profile, business selection| p1
  p1 -->|auth result, accessible menu, business context| user
  p1 -->|validate token / user info| keycloak
  keycloak -->|JWT claims / identity data| p1
  p1 <-->|create/update profile, business, role, program access| d1

  user -->|customer, project, contract, MA, invoice request| p2
  customer -->|customer info, requirement input, contract/sign-off data| p2
  p2 -->|project status, contract, invoice, delivery info| user
  p2 -->|project documents/status| customer
  p2 <-->|customer, project, contract, invoice, payment, MA data| d2
  p2 -->|project context| p3
  p2 -->|project timeline / work scope| p4

  user -->|requirement, DFD/ER, spec, test case, manual updates| p3
  p3 -->|analysis/design/test documents| user
  p3 <-->|requirement, diagram tabs, versions, trace links, specs, tests| d3
  p3 -->|AI generation prompt| ai
  ai -->|draft requirement, mermaid, spec, test, manual content| p3
  p3 -->|documents to approve / review| p4
  p3 -->|document export request| p5

  user -->|task update, approval action, chat/message/comment| p4
  p4 -->|pending approvals, notification, chat history, audit result| user
  p4 <-->|tasks, approvals, comments, chat, notifications, audit logs| d4
  p4 -->|approved/rejected document status| p3
  p4 -->|work progress / approval status| p6

  user -->|upload/download file, export PDF| p5
  p5 -->|download URL, uploaded file info, generated document| user
  p5 -->|report generation request| report
  report -->|PDF / report output| p5
  p5 <-->|file upload reference and document metadata| d5
  p5 <-->|binary file objects| object
  p5 -->|attach file reference| p2
  p5 -->|attach document artifact| p3

  user -->|search, dashboard filter, combobox request| p6
  p6 -->|dashboard summary, global search result, LOV data| user
  p6 <-->|reference values: country, province, parameter, title| d6
  p6 -->|read project summary| d2
  p6 -->|read document summary| d3
  p6 -->|read task/approval summary| d4
```

## Process Summary

| Process | รายละเอียดหลัก | Controller / Module ที่เกี่ยวข้อง |
|---|---|---|
| 1.0 Authentication, Profile & Business Management | เข้าสู่ระบบ ตรวจสอบสิทธิ์ จัดการ profile, business, role, program access | `AuthController`, `ProfileController`, `BusinessController`, `SuUser*`, `SuBusiness*`, `SuProgramController` |
| 2.0 Project & Customer Management | จัดการลูกค้า โปรเจกต์ สัญญา delivery invoice payment และ MA | `PmCustomer*`, `PmCustomerProjectController`, `PmCustomerContractController`, `PmDeliveryController`, `PmInvoiceController`, `PmPaymentController`, `PmMa*` |
| 3.0 Analysis, Design & Traceability | จัดการ requirement, DFD/ER diagram, specification, test case, user manual และ trace link | `PmRequirementController`, `PmDiagramTabController`, `PmSpecificationController`, `PmTest*`, `PmUserManualController`, `TraceLinkController` |
| 4.0 Task, Approval & Collaboration | จัดการ phase, milestone, work package, task, approval, chat, notification, audit log | `PhaseController`, `MilestoneController`, `WorkPackageController`, `TaskController`, `PmApproval*`, `ChatController`, `NotificationController`, `AuditLogController` |
| 5.0 File Storage & Document Output | อัปโหลด/ดาวน์โหลดไฟล์ สร้างรายงาน PDF เก็บ metadata และ object file | `StorageController`, report-service, SeaweedFS |
| 6.0 Search, Dashboard & Reference Data | ค้นหาข้อมูล dashboard, combobox, reference/master data | `GlobalSearchController`, `PmProjectDashboardController`, `ComboboxController`, `DbParameterController` |

## Data Stores

| Data Store | ข้อมูลที่จัดเก็บ |
|---|---|
| D1 User, Profile, Business & Role Data | ผู้ใช้ profile business role permission program access |
| D2 Customer, Contract & Project Data | ลูกค้า โปรเจกต์ สัญญา delivery invoice payment MA |
| D3 Requirement, Diagram, Specification & Test Data | requirement, DFD/ER diagram, diagram version, specification, test scenario, test case, manual, trace link |
| D4 Task, Approval, Chat, Notification & Audit Log Data | phase, milestone, work package, task, approval flow/log, chat, message, notification, audit log |
| D5 File Metadata | upload reference, file id, bucket/object key, visibility/category |
| D6 Reference / Master Data | country, province, district, sub-district, title, parameter, mail template/config |
| D7 SeaweedFS / S3 Object Files | ไฟล์จริง เช่น image, video, document, generated report |
