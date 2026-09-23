# ER Diagrams - SIC Project

เอกสารนี้สร้างจากการอ่าน entity (`@Entity`) จริงทุกไฟล์ใน `sic-spring/sic/src/main/java/com/softinter/sicapi/entity` ไม่ได้เดาคอลัมน์หรือความสัมพันธ์ ใช้สัญลักษณ์ Crow's Foot (มาตรฐาน Mermaid `erDiagram`)

ไฟล์ทั้งหมดอยู่ใน `docs/erd/` (ไฟล์ `.mmd` = ต้นฉบับ mermaid, `.png`/`.svg` = ภาพเรนเดอร์)

## หมายเหตุการจัดรูปแบบ (สำคัญสำหรับ print)

ระบบมี entity จริงประมาณ 65 ตาราง ใส่ภาพเดียวอ่านไม่ออกแน่นอน จึงแบ่งเป็น 16 ไฟล์ย่อยตามโมดูล โดยแต่ละไฟล์:
- จำกัดที่ ~5-7 entity ต่อภาพ เพื่อให้ตัวอักษรใหญ่พอเวลา print
- ใช้ `direction LR` ในตัว erDiagram (วางไว้บรรทัดถัดจาก `erDiagram` โดยตรง) — พบว่าถ้าไม่ใส่ mermaid จะจัดเรียงตารางที่เป็น chain (A มี B, B มี C, ...) ซ้อนกันในแนวตั้งลึกมาก ทำให้ภาพสูงและตัวอักษรเล็กเวลาบีบให้พอดีหน้ากระดาษ การบังคับทิศทาง LR ช่วยให้ mermaid กระจายตารางที่ไม่ได้ชนกันไปด้านข้างแทน ลดความสูงของภาพลงได้มาก (บางไฟล์ลดลงกว่า 3 เท่า)
- ใช้ `%%{init: {"theme":"base","themeVariables":{...}, "er": {...fontSize: 22...}}}%%` วางไว้ **หลัง** `erDiagram` เท่านั้น (ถ้าวางก่อนหน้า mermaid จะไม่นำไปใช้เงียบๆ ทดสอบแล้วจริง) — ตั้ง theme เป็นขาว-ดำล้วน (`primaryColor`/`tertiaryColor` = ขาว, border/text/line = ดำ) ไม่มีสีม่วง/เหลืองแบบเดิม
- แต่ละแถวคอลัมน์แสดงแค่ `type` + `name` เท่านั้น (ตัด PK/FK/UK marker และ inline note ออก) เพื่อลดความกว้างต่อแถว ทำให้ใช้ font ใหญ่ขึ้นได้ (16 → 22px) โดยภาพไม่ใหญ่เกิน
- entity ที่ไม่มีความสัมพันธ์ (FK) กับใครเลยในโค้ดจริง (เช่น `su_message`, `su_notification`, `db_title`, `db_parameter`) หรือเป็นกล่อง external stub ที่ไม่มีคอลัมน์เลย (แค่ไว้บอกว่ามี entity นี้อยู่ไฟล์อื่น) **จะไม่วาดเป็นกล่องในภาพอีกต่อไป** — ตัดออกทั้งกล่องและเส้นความสัมพันธ์ที่ชี้ไปหากล่องเปล่านั้น เก็บไว้เป็น comment ในไฟล์แทน เพื่อไม่ให้มีกล่องลอยไร้ประโยชน์กวนสายตา

## รายการไฟล์

| # | ไฟล์ | โมดูล | Entity หลัก |
|---|---|---|---|
| 00 | `erd/erd-00-overview.mmd` | ภาพรวมทุกโมดูล (ชื่อ entity ล้วน ไม่มีคอลัมน์) ใช้ดูความสัมพันธ์ข้ามโมดูล | - |
| 01a | `erd/erd-01a-business-role-program.mmd` | Business / Profile / Role / Program core | su_business, su_profile, su_business_role, su_business_role_program, su_program, su_user_business, su_user_business_role |
| 01b | `erd/erd-01b-access-invite-audit.mmd` | Invite / Audit / Task | su_business_invite, su_business_audit, su_audit_log, su_task, su_user_task |
| 02 | `erd/erd-02-chat-notification.mmd` | Chat / Messaging | SuChatGroup, SuChatGroupMember, SuChatGroupLog, SuChatGroupCallParticipant, SuChatLog |
| 03a | `erd/erd-03a-customer-contract-project.mmd` | Customer / Contract / Project / Delivery | PmCustomer, PmCustomerContract, PmCustomerProject, PmDelivery, PmDeliveryChecklist, PmDeliveryItem |
| 03b | `erd/erd-03b-invoice-payment-ma.mmd` | Invoice / Payment / Maintenance | PmInvoice(+Item), PmPayment, PmMaRenewal, PmMaTicket(+Assignee) |
| 04a1 | `erd/erd-04a1-requirement-diagram.mmd` | Requirement / Diagram | PmRequirement, PmDiagramTab, PmDiagramVersion, PmDiagramChat |
| 04a2 | `erd/erd-04a2-spec-test-manual.mmd` | Specification / Test / Manual | PmSpecification, PmTestScenario, PmTestCase, PmUserManual(+Section) |
| 04b1 | `erd/erd-04b1-changerequest-review.mmd` | Change Request / Design Review | PmChangeRequest, PmChangeImpact, ChangeImpactAnalysis, PmDesignReview(+ReviewComment), PmCrAssignee, PmEditSession |
| 04b2 | `erd/erd-04b2-trace-comment.mmd` | Traceability / Comment | PmTraceLink, TraceRelationship (enum), PmComment |
| 05a1 | `erd/erd-05a1-phase-milestone.mmd` | Phase / Milestone | PmPhase, PmMilestone |
| 05a2 | `erd/erd-05a2-workpackage-task-bug.mmd` | Work Package / Task / Bug | PmWorkPackage, PmTask(+Assignee), PmBug |
| 05b1 | `erd/erd-05b1-approval-flow-definition.mmd` | Approval Flow Definition | PmApprovalFlow, PmApprovalFlowStep, PmApproval |
| 05b2 | `erd/erd-05b2-approval-execution.mmd` | Approval Execution / Audit | PmApprovalStepStatus, PmApprovalLog, PmApprovalReminder |
| 06 | `erd/erd-06-storage.mmd` | File Storage | SuUpload, StorageUploadReference (DTO ไม่ใช่ entity จริง) |
| 07 | `erd/erd-07-reference-master.mmd` | Reference / Master Data | DbCountry/Province/District/SubDistrict, DbMailTemplate/Config/Queue |

## หมายเหตุความถูกต้อง

- ทุก entity อ่านจากไฟล์ `.java` จริงทั้งไฟล์ ไม่มีการเดาคอลัมน์
- ความสัมพันธ์ที่มี `@ManyToOne`/`@OneToMany`/`@JoinColumn`/`mappedBy` จริงในโค้ด จะระบุว่า "mapped" (มี object navigation ผ่าน JPA)
- คอลัมน์ FK ที่เป็น UUID ธรรมดาแต่ไม่มี annotation ความสัมพันธ์ จะถูกวาดเป็นเส้นความสัมพันธ์ระดับ schema แต่ระบุว่า "inferred" หรือ "ไม่มี FK constraint จริง"
- ความสัมพันธ์แบบ polymorphic (เช่น `PmTraceLink.sourceType/sourceId`, `PmComment.targetType/targetId`) วาดเป็นเส้นประไปยังทุก entity เป้าหมายที่เป็นไปได้ พร้อม label "polymorphic"
- entity ที่อยู่นอกไฟล์นี้ (ไม่ว่าจะอยู่คนละโมดูลหรือคนละไฟล์ย่อยในโมดูลเดียวกัน) จะวาดเป็นกล่องชื่อเปล่า พร้อมคอมเมนต์ระบุว่านิยามเต็มอยู่ไฟล์ไหน
