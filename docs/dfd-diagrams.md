# DFD Diagrams - SIC Project

เอกสารนี้สร้างขึ้นใหม่ทั้งหมดจากการอ่านโค้ดจริง (controller ทุกตัวใน `sic-spring/sic/src/main/java/com/softinter/sicapi/controller`) ไม่ได้อ้างอิงเอกสาร DFD ฉบับก่อนหน้า เพราะฉบับก่อนหน้าไม่ถูกต้อง

ใช้สัญลักษณ์แบบ Gane-Sarson: วงกลมคู่ = process, สี่เหลี่ยมขอบคู่ = external entity, กระบอก = data store

ไฟล์ทั้งหมดอยู่ใน `docs/dfd/` (ไฟล์ `.mmd` = ต้นฉบับ mermaid, `.png`/`.svg` = ภาพเรนเดอร์)

## Level 0 - Context Diagram

| ไฟล์ | เนื้อหา |
|---|---|
| `dfd/dfd-level0.mmd` | ภาพรวมทั้งระบบ: ผู้ใช้งาน, ลูกค้า, Keycloak, AI Provider, Report Service, PostgreSQL, SeaweedFS/S3 |

## Level 1 - Process Decomposition (แยกเป็นรายภาพต่อ process เพื่อให้อ่านง่าย)

| Process | ไฟล์ | Controller ที่ใช้อ้างอิง |
|---|---|---|
| 1.0 Authentication, Profile, Business & Access Management | `dfd/dfd-level1-01-auth-business.mmd` | AuthController, ProfileController, BusinessController, SuBusinessInviteController, SuBusinessRoleController, SuBusinessRoleProgramController, SuProgramController, SuUserController, SuUserBusinessController, SuUserBusinessMemberController, SuUserBusinessRoleController, VerifyController, AuditLogController, MenuController, SuTaskController |
| 2.0 Chat, Messaging & Notification | `dfd/dfd-level1-02-chat-notification.mmd` | ChatController, ChatHubController, MessageController, DiscussionController, NotificationController |
| 3.0 Customer, Project, Contract, Delivery & Finance | `dfd/dfd-level1-03-customer-project-finance.mmd` | PmCustomerController, PmCustomerContractController, PmCustomerProjectController, PmDeliveryController, PmInvoiceController, PmPaymentController, PmMaRenewalController, PmMaTicketController |
| 4.0 Requirement, Analysis, Design & Traceability (incl. AI) | `dfd/dfd-level1-04a-requirement-design.mmd` (authoring) + `dfd/dfd-level1-04b-traceability-review.mmd` (governance) | PmRequirementController, PmDiagramTabController, PmDiagramChatController, PmDiagramAiController, DiagramSqlController, PmSpecificationController, PmTestScenarioController, PmTestCaseController, PmUserManualController, AiBatchGeneratorController, AiNavigatorController, AiSqlGeneratorController, TraceLinkController, ImpactAnalysisController, PmChangeRequestController, PmDesignReviewController, DocumentVersionController, PmEditSessionController |
| 5.0 Phase, Milestone, Task, Approval & Bug Tracking | `dfd/dfd-level1-05-task-approval-bug.mmd` | PhaseController, MilestoneController, WorkPackageController, TaskController, ProjectTaskController, PmBugController, PmApprovalController, PmApprovalFlowController |
| 6.0 File Storage & Document/Report Output | `dfd/dfd-level1-06-file-storage.mmd` | StorageController + report-service (external) |
| 7.0 Search, Dashboard & Reference Data | `dfd/dfd-level1-07-search-dashboard-reference.mmd` | GlobalSearchController, ComboboxController, DbParameterController, PmProjectDashboardController |

`dfd/dfd-level1-overview.mmd` คือภาพแผนที่รวม 7 process + 8 data store ไว้ในภาพเดียว (ระดับความละเอียดต่ำกว่าภาพย่อย ใช้ดูภาพรวมความสัมพันธ์ระหว่าง process เท่านั้น)

## Data Stores

| Data Store | ข้อมูลที่จัดเก็บ | ตรงกับ ERD |
|---|---|---|
| D1 Auth/Business Data | profile, business, role, program, permission, invite, audit log | `erd/erd-01-auth-business.mmd` |
| D2 Chat/Notification Data | chat group, chat log, message, notification | `erd/erd-02-chat-notification.mmd` |
| D3 Customer/Project/Finance Data | customer, contract, project, delivery, invoice, payment, MA renewal/ticket | `erd/erd-03-project-customer-finance.mmd` |
| D4 Requirement/Design Data | requirement, diagram tab/version, specification, test, manual, trace link, change request, design review | `erd/erd-04a-*.mmd`, `erd/erd-04b-*.mmd` |
| D5 Task/Approval/Bug Data | phase, milestone, work package, task, approval flow/log, bug | `erd/erd-05-task-approval.mmd` |
| D6 File Storage Metadata | upload reference, bucket/object key, visibility/category | `erd/erd-06-storage.mmd` |
| D7 Reference/Master Data | country, province, district, sub-district, title, parameter, mail template/config/queue | `erd/erd-07-reference-master.mmd` |
| D8 SeaweedFS/S3 Object Files | ไฟล์จริง (image, video, document, generated report) | - |
