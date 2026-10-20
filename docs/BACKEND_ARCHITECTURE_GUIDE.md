# คู่มือโครงสร้างและหน้าที่ไฟล์ Backend ทั้งหมด (sic-spring)
> **สำหรับเตรียมตัวตรวจโปรเจกต์และตอบคำถามอาจารย์แบบครบถ้วน 100%**  
> *รวบรวมไฟล์จริงใน Backend ทั้งหมดจำนวน **299 ไฟล์** (ไม่รวม DTO, Controller, Repository)*

---

## สรุปภาพรวมจำนวนไฟล์ในแต่ละโฟลเดอร์

| โฟลเดอร์ / แพ็กเกจ | จำนวนไฟล์ | หน้าที่โดยย่อ |
|---|:---:|---|
| `com.softinter.sicapi` (Root) | 1 | คลาสหลักเริ่มระบบ Spring Boot และโหลด `.env` |
| `config` | 16 | การตั้งค่า Security, CORS, S3, WebSocket, Flyway, AOP |
| `Interceptor` | 3 | ดักจับ Business Context, WebSocket Token, ภาษา |
| `exception` | 3 | Global Exception Handling และ Custom Exceptions |
| `websocket` | 1 | Real-time Chat & WebRTC Call Signaling |
| `scheduler` | 2 | Background Cron Jobs (Approval Timeout, Contract Alert) |
| `util` | 18 | ฟังก์ชันช่วยเหลือ จัดทำรายงาน, รวม PDF, คำนวณ, Diff, Snapshot |
| `entity/base` | 2 | Base Entity สำหรับ Timestamp และ Business Id |
| `entity/enums` | 14 | Enums กำหนดสถานะและประเภทข้อมูลต่างๆ ในระบบ |
| `entity/db` | 10 | Master Data ข้อมูลที่อยู่ จังหวัด อำเภอ และพารามิเตอร์ |
| `entity/ex` | 2 | โครงสร้างตัวอย่างและ Upload Reference |
| `entity/pm` | 45 | ตารางข้อมูลโครงการทั้งหมดตามวงจร SDLC |
| `entity/su` | 21 | ตารางผู้ใช้ สิทธิ์ บทบาท ห้องแชท และ Audit Log |
| `service` | 71 | Interface กำหนด Business Contract ทุกฟังก์ชัน |
| `service/impl` | 90 | Implementation ประมวลผล Business Logic, Generator และ Helper |
| **รวมทั้งสิ้น** | **299** | **ครบถ้วนทุกไฟล์ในระบบ** |

---

## 1. คลาสเริ่มต้นระบบ (Application Entry Point - 1 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `SicApiApplication.java` | คลาสหลักสำหรับบูตระบบ Spring Boot (`@SpringBootApplication`), เปิดใช้งาน Asynchronous (`@EnableAsync`), Scheduling (`@EnableScheduling`) และรัน `loadDotEnv()` เพื่อโหลด Environment Variables จากไฟล์ `.env` |

---

## 2. แพ็กเกจ `config` (โครงสร้างพื้นฐาน & การตั้งค่าระบบ - 16 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `AiApiKeyConverter.java` | JPA AttributeConverter เข้ารหัส (Encrypt) และถอดรหัส (Decrypt) API Key ของ AI (เช่น Gemini, Claude) ก่อนบันทึกลงหรืออ่านจากฐานข้อมูลเพื่อความปลอดภัย |
| 2 | `AuditLog.java` | Custom Annotation (`@AuditLog`) สำหรับแปะบน Method ของ Controller หรือ Service เพื่อระบุ Action และ Module ที่ต้องการบันทึกประวัติการใช้งาน |
| 3 | `AuditLogAspect.java` | คลาส AOP (AspectJ) ดักจับ Method ที่มี `@AuditLog` ดึงข้อมูลผู้ใช้งาน, เวลา, Parameter และผลลัพธ์การทำงาน ไปบันทึกลงตาราง `su_audit_log` อัตโนมัติ |
| 4 | `AuditorAwareImpl.java` | ดึง Username ของผู้ใช้ปัจจุบันจาก Keycloak Security Context ส่งให้ฟิลด์ `@CreatedBy` และ `@LastModifiedBy` ใน JPA Entity |
| 5 | `BusinessContextHolder.java` | เก็บค่า `businessId` ปัจจุบันของ Thread (ThreadLocal) เพื่อให้เลเยอร์ Service เรียกใช้คัดกรองข้อมูลระดับ Multi-tenancy ได้โดยไม่ต้องส่ง Parameter ข้ามทุกเลเยอร์ |
| 6 | `CacheConfig.java` | เปิดใช้งาน Spring Cache Abstraction (`@EnableCaching`) สำหรับแคชข้อมูลที่ถูกอ่านบ่อย เช่น สิทธิ์เมนู หรือ Resource Bundle แปลภาษา |
| 7 | `CorsConfig.java` | กำหนดนโยบาย Cross-Origin Resource Sharing อนุญาตให้ Frontend (`http://localhost:4200`) ส่ง Request และ Header เข้ามาทำงานได้ |
| 8 | `FlywayConfig.java` | ควบคุมการรัน Database Migration สคริปต์ SQL ใน `db/migration` อัตโนมัติเมื่อระบบเริ่มทำงาน ช่วยให้ Schema ตรงกันทุก Environment |
| 9 | `JacksonInstantConfig.java` | ตั้งค่าโมดูล Jackson สำหรับแปลงและจัดรูปแบบประเภทข้อมูลวันเวลา `Instant` และ `LocalDateTime` ให้ตรงตามมาตรฐาน ISO-8601 |
| 10 | `JpaConfig.java` | เปิดใช้งาน JPA Auditing (`@EnableJpaAuditing`) สำหรับบันทึก Timestamp และผู้สร้าง/แก้ไขข้อมูลโดยอัตโนมัติ |
| 11 | `OpenApiConfig.java` | ตั้งค่าเอกสาร Swagger / OpenAPI 3.0 สำหรับทดสอบ API และระบุ Security Scheme แบบ Bearer JWT Token |
| 12 | `ReportServiceProperties.java` | คลาส Configuration Properties อ่านค่า URL, Secret Token และ Timeout ของ Microservice ออกรายงานจาก `application.yml` |
| 13 | `S3Config.java` | สร้าง Spring Bean `S3Client` เชื่อมต่อไปยัง SeaweedFS Object Storage ผ่านโปรโตคอล AWS S3 API เพื่อบริหารจัดการไฟล์ |
| 14 | `SecurityConfig.java` | ตั้งค่าความปลอดภัยระบบ (Spring Security), กำหนด Filter ตรวจสอบ JWT Bearer Token จาก Keycloak, จัดการ CORS, Stateless Session, และเปิดสิทธิ์ Public Path (Swagger, Actuator, Public Files) |
| 15 | `WebConfig.java` | ลงทะเบียน Interceptor (BusinessContextInterceptor, LanguageInterceptor) เข้าสู่ Spring MVC Request Lifecycle |
| 16 | `WebSocketConfig.java` | ตั้งค่า STOMP WebSocket Message Broker ผ่าน Endpoint `/ws` และ Route `/app`, `/topic` สำหรับ Real-time Chat และ WebRTC Signaling |

---

## 3. แพ็กเกจ `Interceptor` (ตัวดักจับ Request & Protocol - 3 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `BusinessContextInterceptor.java` | ดักจับ HTTP Request เพื่อดึง Header `X-Business-Id` นำไปเซ็ตใน `BusinessContextHolder` และเคลียร์ทิ้งเมื่อ Request ทำงานเสร็จ |
| 2 | `JwtChannelInterceptor.java` | ดักจับการเชื่อมต่อ WebSocket (STOMP CONNECT) เพื่อตรวจสอบความถูกต้องของ JWT Token หากไม่ผ่านจะปฏิเสธการเชื่อมต่อทันที |
| 3 | `LanguageInterceptor.java` | ดักอ่าน Header `Accept-Language` เพื่อกำหนด Locale ภาษา (ไทย/อังกฤษ) สำหรับแสดงผลข้อความแจ้งเตือนและ Error ในระบบ |

---

## 4. แพ็กเกจ `exception` (การจัดการข้อผิดพลาด - 3 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `DocumentLockedException.java` | Custom Exception เมื่อมีผู้ใช้อื่นกำลังเปิดแก้ไขเอกสารฉบับเดียวกันอยู่ ป้องกัน Concurrency Conflict (HTTP 409 Conflict) |
| 2 | `GlobalExceptionHandler.java` | ตัวจัดการ Error ส่วนกลางผ่าน `@RestControllerAdvice` รวบรวม Exception ทั้งหมด (Validation, Not Found, Forbidden) แปลงเป็น Response JSON รูปแบบมาตรฐาน |
| 3 | `ResourceNotFoundException.java` | Custom Exception สำหรับข้อผิดพลาดค้นหาข้อมูลไม่พบในระบบ (HTTP 404 Not Found) |

---

## 5. แพ็กเกจ `websocket` (การสื่อสาร Real-time - 1 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `ChatWebSocketController.java` | Controller ควบคุมการรับ-ส่งข้อความแชทสดรายบุคคล/กลุ่ม และรับ-ส่งสัญญาณ WebRTC Call Signaling (Offer/Answer/Candidate) สำหรับการสื่อสาร Real-time |

---

## 6. แพ็กเกจ `scheduler` (งานประมวลผลตามเวลา Background Jobs - 2 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `ApprovalTimeoutScheduler.java` | Cron Job ทำงานตามรอบเวลา ตรวจสอบคำขออนุมัติที่ค้างเกินกำหนด (Timeout) ส่ง Notification เตือนผู้อนุมัติหรืออัปเดตสถานะ |
| 2 | `ContractLifecycleScheduler.java` | Cron Job คอยตรวจหาสัญญาลูกค้าที่ใกล้หมดอายุล่วงหน้า แจ้งเตือนฝ่ายขายและผู้จัดการโครงการเพื่อเตรียมดำเนินการต่อสัญญา |

---

## 7. แพ็กเกจ `util` (คลาสช่วยเหลือส่วนกลาง - 18 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `ApprovalKeywordSearchHelper.java` | ตัวช่วยสร้างเงื่อนไข Predicate สำหรับค้นหารายการคำขออนุมัติด้วยคำค้นหา (Keyword Search) |
| 2 | `ContractLifecycle.java` | ตรวจสอบและควบคุม State Machine ของสัญญาลูกค้า (Draft -> Active -> Expiring -> Expired) |
| 3 | `ContractNoHelper.java` | สร้างและจัดฟอร์แมตรหัสสัญญาโครงการอัตโนมัติตามรูปแบบที่กำหนด (เช่น `CTR-YYYYMM-XXXX`) |
| 4 | `DateRangeValidator.java` | ตรวจสอบความถูกต้องของช่วงวันที่ (วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด) |
| 5 | `DiagramTypes.java` | กำหนดและตรวจสอบชุดประเภทไดอะแกรมทั้งหมด (DFD, ER, SEQUENCE, CLASS, FLOWCHART ฯลฯ) สำหรับระบบ Trace Link และ Change Impact Analysis |
| 6 | `DocumentDiffHelper.java` | เปรียบเทียบความแตกต่างของเนื้อหาเอกสาร 2 เวอร์ชัน (Text Diff) เพื่อดูส่วนที่ถูกเพิ่ม ลบ หรือแก้ไข |
| 7 | `EnumConverter.java` | Generic Utility แปลงค่า Enum เป็น String หรือ Integer ในฐานข้อมูลอย่างปลอดภัย |
| 8 | `FileVisibilityConverter.java` | แปลงค่าระดับการมองเห็นไฟล์ (Public, Internal, Confidential) ระหว่าง JPA และฐานข้อมูล |
| 9 | `JsonSnapshotHelper.java` | แปลง State ของ Entity ให้เป็น JSON Snapshot สำหรับบันทึกประวัติการเปลี่ยนแปลงในตาราง Version History |
| 10 | `KeywordSearchHelper.java` | สร้างเงื่อนไข SQL ค้นหาคำแบบ Case-insensitive และ Partial Matching รองรับภาษาไทยและอังกฤษ |
| 11 | `LanguageUtils.java` | ฟังก์ชันช่วยเหลือสำหรับตรวจสอบและสกัดรหัสภาษามาตรฐานจาก HTTP Header |
| 12 | `LocalizationHelper.java` | ดึงข้อความ Resource Bundle สลับภาษาไทย-อังกฤษตาม Locale ของผู้ใช้งาน |
| 13 | `PaginationUtil.java` | ช่วยสร้างออบเจกต์ `Pageable` และคำนวณ Offset, Page Number, Page Size รองรับการทำ Pagination |
| 14 | `PdfBook.java` | รวมไฟล์ PDF หลายๆ ฉบับ (เช่น ปก, Requirement, Spec, Diagram) เข้าเป็นเอกสารเล่มเดียวสมบูรณ์ |
| 15 | `ReportHelper.java` | ฟังก์ชันขนาดใหญ่เตรียมข้อมูล จัดตาราง และคำนวณผลรวมยอดเงิน/เวลา เพื่อส่งต่อให้ Report Service ออกรายงาน |
| 16 | `SortValidator.java` | ตรวจสอบความถูกต้องของชื่อคอลัมน์ที่ขอเรียงลำดับ ป้องกัน SQL Injection จากการส่งชื่อคอลัมน์แปลกปลอม |
| 17 | `UniquenessValidator.java` | ตรวจสอบความไม่ซ้ำกันของข้อมูลเฉพาะ เช่น รหัสโครงการ หรือเลขที่สัญญา |
| 18 | `VersionKeywordSearchHelper.java` | ช่วยค้นหารายการบันทึกประวัติ Version เอกสารตามคำค้นหา |

---

## 8. แพ็กเกจ `entity/base` (โครงสร้าง Entity แม่แบบ - 2 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `BaseBusinessEntity.java` | Entity แม่แบบสืบทอดจาก `BaseEntity` โดยเพิ่มฟิลด์ `businessId` สำหรับตารางที่ต้องแบ่งข้อมูลตาม Business Unit |
| 2 | `BaseEntity.java` | Entity แม่แบบสำหรับฟิลด์มาตรฐานทุกตาราง: `createdBy`, `createdDate`, `updatedBy`, `updatedDate` |

---

## 9. แพ็กเกจ `entity/enums` (ค่าคงที่ Enum ในระบบ - 14 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `ApprovalMode.java` | Enum กำหนดโหมดการอนุมัติ เช่น อนุมัติแบบคนเดียว (SINGLE) หรือตามลำดับขั้น (SEQUENTIAL) |
| 2 | `ApprovalStatus.java` | Enum สถานะการอนุมัติ: PENDING (รออนุมัติ), APPROVED (อนุมัติแล้ว), REJECTED (ปฏิเสธ), CANCELLED (ยกเลิก) |
| 3 | `BillingType.java` | Enum รูปแบบการวางบิล เช่น ตามงวดงาน (MILESTONE) หรือตามระยะเวลา (MONTHLY/FIXED) |
| 4 | `ChatMessageType.java` | Enum ประเภทข้อความแชท: TEXT (ข้อความ), IMAGE (รูปภาพ), FILE (ไฟล์แนบ), CALL_SIGNAL (สัญญาณโทร) |
| 5 | `DocumentType.java` | Enum ประเภทเอกสารในระบบ: REQUIREMENT, SPECIFICATION, DFD, ERD, CONTRACT, TEST_CASE ฯลฯ |
| 6 | `EntityState.java` | Enum สถานะวงจรชีวิตของข้อมูล เช่น ACTIVE (ใช้งานอยู่), INACTIVE (ปิดการใช้งาน), DELETED (ลบชั่วคราว) |
| 7 | `FileCategory.java` | Enum หมวดหมู่ของไฟล์ที่อัปโหลด เช่น AVATAR, ATTACHMENT, CONTRACT_DOC, DIAGRAM_EXPORT |
| 8 | `FileVisibility.java` | Enum สิทธิ์การมองเห็นไฟล์: PUBLIC (สาธารณะ), INTERNAL (ภายในองค์กร), CONFIDENTIAL (เฉพาะผู้มีสิทธิ์) |
| 9 | `MaTicketSeverity.java` | Enum ระดับความรุนแรงของ MA Ticket: LOW, MEDIUM, HIGH, CRITICAL |
| 10 | `MaTicketStatus.java` | Enum สถานะงานแจ้งซ่อม MA: OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| 11 | `MaTicketType.java` | Enum ประเภทของ MA Ticket: BUG_FIX (แก้ไขบั๊ก), ENHANCEMENT (ปรับปรุง), SUPPORT (ช่วยเหลือผู้ใช้) |
| 12 | `PaymentMethod.java` | Enum วิธีการชำระเงิน: BANK_TRANSFER, CREDIT_CARD, CHEQUE, CASH |
| 13 | `PaymentStatus.java` | Enum สถานะการชำระเงิน: UNPAID (ยังไม่จ่าย), PARTIAL (จ่ายบางส่วน), PAID (จ่ายครบแล้ว), OVERDUE (เกินกำหนด) |
| 14 | `TraceRelationship.java` | Enum ประเภทความสัมพันธ์ของ Traceability Matrix เช่น IMPLEMENTS, TESTS, DEPENDS_ON |

---

## 10. แพ็กเกจ `entity/db` (ตารางข้อมูลพื้นฐาน Master Data - 10 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `DbAiModelConfig.java` | Entity ตาราง `db_ai_model_config` เก็บการตั้งค่า Provider, Model Name, API Key และ Parameter ของ AI |
| 2 | `DbCountry.java` | Entity ตาราง `db_country` ข้อมูลประเทศ |
| 3 | `DbDistrict.java` | Entity ตาราง `db_district` ข้อมูลอำเภอ/เขต |
| 4 | `DbMailConfig.java` | Entity ตาราง `db_mail_config` การตั้งค่า Mail Server และ Credentials |
| 5 | `DbMailQueue.java` | Entity ตาราง `db_mail_queue` คิวอีเมลที่รอการส่งออก |
| 6 | `DbMailTemplate.java` | Entity ตาราง `db_mail_template` เทมเพลตเนื้อหาอีเมลสำหรับการแจ้งเตือนต่างๆ |
| 7 | `DbParameter.java` | Entity ตาราง `db_parameter` พารามิเตอร์ระบบแบบ Key-Value |
| 8 | `DbProvince.java` | Entity ตาราง `db_province` ข้อมูลจังหวัด |
| 9 | `DbSubDistrict.java` | Entity ตาราง `db_sub_district` ข้อมูลตำบล/แขวง และรหัสไปรษณีย์ |
| 10 | `DbTitle.java` | Entity ตาราง `db_title` คำนำหน้าชื่อ (นาย, นาง, นางสาว, ดร.) |

---

## 11. แพ็กเกจ `entity/ex` (ตารางตัวอย่างและ Storage Ref - 2 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `ExExample.java` | Entity ตารางตัวอย่างโครงสร้างโค้ดมาตรฐานสำหรับอ้างอิงในการพัฒนา |
| 2 | `StorageUploadReference.java` | Entity ตารางอ้างอิงความสัมพันธ์การใช้งานไฟล์ในระบบ |

---

## 12. แพ็กเกจ `entity/pm` (ตารางงานโครงการ & วงจร SDLC - 45 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `AiPipelineJob.java` | Entity ตารางเก็บสถานะงาน Job การแปลง Requirement สู่ WBS/Spec อัตโนมัติด้วย AI |
| 2 | `ChangeImpactAnalysis.java` | Entity ตารางบันทึกผลการวิเคราะห์ผลกระทบของ Change Request (CR) |
| 3 | `ChangeImpactAnalysisHistory.java` | Entity ตารางบันทึกประวัติการวิเคราะห์ผลกระทบย้อนหลัง |
| 4 | `PmApproval.java` | Entity ตารางเก็บข้อมูลคำขออนุมัติหลัก (Target Type, Target ID, ผู้ขอ, สถานะ) |
| 5 | `PmApprovalFlow.java` | Entity ตารางนิยามกระบวนการ Flow การอนุมัติของแต่ละประเภทเอกสาร |
| 6 | `PmApprovalFlowStep.java` | Entity ตารางกำหนดขั้นตอนย่อยและบทบาทของผู้อนุมัติในแต่ละ Step |
| 7 | `PmApprovalLog.java` | Entity ตารางประวัติการกดอนุมัติ ตีกลับ หรือยกเลิกคำขอ |
| 8 | `PmApprovalReminder.java` | Entity ตารางประวัติการส่งแจ้งเตือนการอนุมัติที่ค้างอยู่ |
| 9 | `PmApprovalStepStatus.java` | Entity ตารางสถานะของแต่ละขั้นตอนในคำขออนุมัตินั้นๆ |
| 10 | `PmBug.java` | Entity ตารางบันทึกข้อผิดพลาด (Bug) ที่พบจากการทดสอบหรือใช้งานจริง |
| 11 | `PmChangeImpact.java` | Entity ตารางแจกแจงรายการผลกระทบต่อโมดูล/ตารางที่เกิดจาก CR |
| 12 | `PmChangeRequest.java` | Entity ตารางคำขอเปลี่ยนแปลงขอบเขตงานโครงการ (Change Request - CR) |
| 13 | `PmComment.java` | Entity ตารางความคิดเห็นและข้อความพูดคุยในกระดาน Discussion ของโครงการ |
| 14 | `PmCrAssignee.java` | Entity ตารางผู้รับผิดชอบการดำเนินการตามคำขอ Change Request |
| 15 | `PmCustomer.java` | Entity ตารางข้อมูลลูกค้า บริษัทคู่สัญญา ที่อยู่ และข้อมูลการติดต่อ |
| 16 | `PmCustomerContract.java` | Entity ตารางสัญญาโครงการ มูลค่าสัญญา วันที่เริ่ม-สิ้นสุด และเงื่อนไข |
| 17 | `PmCustomerProject.java` | Entity ตารางข้อมูลโครงการ วันที่ดำเนินงาน งบประมาณ และสถานะโครงการ |
| 18 | `PmDelivery.java` | Entity ตารางงวดการส่งมอบงานโครงการ (Delivery งวดที่ 1, 2, ...) |
| 19 | `PmDeliveryChecklist.java` | Entity ตารางรายการตรวจรับงานในแต่ละงวดการส่งมอบ |
| 20 | `PmDeliveryItem.java` | Entity ตารางรายการเอกสารหรือผลงานที่ต้องส่งมอบในงวดนั้นๆ |
| 21 | `PmDesignReview.java` | Entity ตารางบันทึกผลการตรวจทานการออกแบบ (UI/UX / Architecture Review) |
| 22 | `PmDiagramChat.java` | Entity ตารางประวัติการแชทกับ AI ผู้ช่วยให้คำปรึกษาการออกแบบไดอะแกรม |
| 23 | `PmDiagramSqlHistory.java` | Entity ตารางประวัติสคริปต์ SQL DDL ที่ถูก Generate มาจาก ER Diagram |
| 24 | `PmDiagramTab.java` | Entity ตารางเก็บข้อมูลไดอะแกรม DFD และ ER Diagram (Node, Edge, ตำแหน่งพิกัด) |
| 25 | `PmDiagramVersion.java` | Entity ตารางประวัติเวอร์ชันย้อนหลังของไดอะแกรม |
| 26 | `PmDocumentVersion.java` | Entity ตารางเก็บ Snapshot เวอร์ชันของเอกสารโครงการสำหรับดูประวัติหรือ Rollback |
| 27 | `PmEditSession.java` | Entity ตารางเก็บสถานะ Lock การแก้ไขเอกสารแบบ Concurrency ป้องกันคนเปิดแก้ชนกัน |
| 28 | `PmInvoice.java` | Entity ตารางใบแจ้งหนี้ ยอดเงินเรียกเก็บ วันที่ครบกำหนดชำระ |
| 29 | `PmInvoiceItem.java` | Entity ตารางรายการสินค้า/บริการย่อยในใบแจ้งหนี้ |
| 30 | `PmMaTicket.java` | Entity ตารางคำขอแจ้งซ่อม บำรุงรักษา หรือแจ้งปัญหาหลังส่งมอบงาน (MA Support) |
| 31 | `PmMaTicketAssignee.java` | Entity ตารางผู้รับผิดชอบ Ticket แจ้งซ่อม MA |
| 32 | `PmMilestone.java` | Entity ตารางเป้าหมายความสำเร็จสำคัญ (Milestone) ของแต่ละเฟสโครงการ |
| 33 | `PmPayment.java` | Entity ตารางบันทึกการรับชำระเงิน ยอดเงิน วิธีชำระ และหลักฐานการโอน |
| 34 | `PmPhase.java` | Entity ตารางเฟสของโครงการตามกระบวนการ SDLC |
| 35 | `PmRequirement.java` | Entity ตารางข้อกำหนดและความต้องการของระบบ และสถานะ Sign-off จากลูกค้า |
| 36 | `PmReviewComment.java` | Entity ตารางความคิดเห็นระหว่างการตรวจทานการออกแบบ Design Review |
| 37 | `PmSpecification.java` | Entity ตารางสเปกของฟังก์ชัน ฟิลด์ข้อมูล และการประเมิน Manday |
| 38 | `PmTask.java` | Entity ตารางงานย่อยระดับ Task สำหรับนักพัฒนาใน Work Package |
| 39 | `PmTaskAssignee.java` | Entity ตารางผู้รับผิดชอบงาน Task แต่ละชิ้น |
| 40 | `PmTestCase.java` | Entity ตารางเคสทดสอบระบบ (Preconditions, Steps, Expected Result, Status) |
| 41 | `PmTestScenario.java` | Entity ตารางกลุ่มสถานการณ์การทดสอบ (Test Scenario) |
| 42 | `PmTraceLink.java` | Entity ตาราง Traceability Matrix เชื่อมโยง Requirement, Spec, Task, Test Case |
| 43 | `PmUserManual.java` | Entity ตารางคู่มือการใช้งานระบบสำหรับผู้ใช้ |
| 44 | `PmUserManualSection.java` | Entity ตารางหัวข้อย่อยและเนื้อหาในคู่มือการใช้งาน |
| 45 | `PmWorkPackage.java` | Entity ตารางกลุ่มงาน Work Package ใน WBS ภายใต้ Phase |

---

## 13. แพ็กเกจ `entity/su` (ตารางระบบ ผู้ใช้งาน สิทธิ์ และแชท - 21 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `SuAuditLog.java` | Entity ตาราง `su_audit_log` บันทึกประวัติการกระทำของผู้ใช้ในระบบ (Who, When, Action, Data) |
| 2 | `SuBusiness.java` | Entity ตาราง `su_business` ข้อมูลองค์กร/หน่วยงาน (Multi-tenancy Unit) |
| 3 | `SuBusinessAudit.java` | Entity ตารางบันทึกการเปลี่ยนแปลงข้อมูลองค์กร |
| 4 | `SuBusinessInvite.java` | Entity ตารางคำเชิญเข้าร่วมองค์กรและโทเค็นการยืนยัน |
| 5 | `SuBusinessRole.java` | Entity ตารางบทบาทหน้าที่ (Roles) ภายในแต่ละองค์กร |
| 6 | `SuBusinessRoleProgram.java` | Entity ตารางสิทธิ์ของ Role ต่อแต่ละหน้าจอ (สิทธิ์อ่าน, สิทธิ์เขียน, สิทธิ์ลบ) |
| 7 | `SuChatGroup.java` | Entity ตารางห้องแชทกลุ่มโครงการหรือกลุ่มแผนก |
| 8 | `SuChatGroupCallParticipant.java` | Entity ตารางบันทึกผู้เข้าร่วมการโทร/ประชุมสายในห้องแชท |
| 9 | `SuChatGroupLog.java` | Entity ตารางบันทึกเหตุการณ์ในห้องแชทกลุ่ม (เช่น เพิ่มสมาชิก, เปลี่ยนชื่อกลุ่ม) |
| 10 | `SuChatGroupMember.java` | Entity ตารางสมาชิกในแต่ละห้องแชทกลุ่ม |
| 11 | `SuChatLog.java` | Entity ตารางข้อความแชทรายบุคคลและกลุ่ม |
| 12 | `SuMessage.java` | Entity ตารางข้อความระบบและการแจ้งเตือน |
| 13 | `SuNotification.java` | Entity ตารางการแจ้งเตือนส่วนบุคคลของผู้ใช้แต่ละคน |
| 14 | `SuProfile.java` | Entity ตารางข้อมูลโปรไฟล์ผู้ใช้งาน (ชื่อ, อีเมล, เบอร์โทร, รูปโปรไฟล์) |
| 15 | `SuProgram.java` | Entity ตารางรหัสโปรแกรม/หน้าจอทั้งหมดในระบบ (PMRT01, PMDT01 ฯลฯ) |
| 16 | `SuTask.java` | Entity ตารางงานระดับระบบ |
| 17 | `SuUpload.java` | Entity ตาราง Metadata ของไฟล์ที่อัปโหลด (ชื่อไฟล์, Bucket S3, ขนาด, MIME Type) |
| 18 | `SuUserBusiness.java` | Entity ตารางผูกความสัมพันธ์ระหว่างผู้ใช้งานกับองค์กร (User-Business Mapping) |
| 19 | `SuUserBusinessRole.java` | Entity ตารางกำหนด Role ให้กับผู้ใช้งานในองค์กรนั้นๆ |
| 20 | `SuUserTask.java` | Entity ตารางมอบหมายงานระบบให้ผู้ใช้ |
| 21 | `SuVerify.java` | Entity ตารางโทเค็นสำหรับการยืนยันตัวตนหรือรีเซ็ตรหัสผ่าน |

---

## 14. แพ็กเกจ `service` (Interface สำหรับ Business Logic - 71 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `AiBatchGeneratorService.java` | Interface บริการสร้าง Mockup Data สำหรับทดสอบระบบ |
| 2 | `AiModelConfigService.java` | Interface บริการจัดการการตั้งค่าโมเดล AI |
| 3 | `AiModuleRegistry.java` | Registry รวมรายชื่อและ Prompt Template สำหรับโมดูล AI ในระบบ |
| 4 | `AiNavigatorService.java` | Interface บริการ AI แนะนำการใช้งานและค้นหาหน้าจอระบบ |
| 5 | `AiProjectPipelineService.java` | Interface ควบคุม Pipeline งาน AI อัตโนมัติ |
| 6 | `AiSqlGeneratorService.java` | Interface บริการแปลง ER Diagram เป็นคำสั่ง SQL DDL |
| 7 | `ApprovalFlowService.java` | Interface บริการตั้งค่าขั้นตอน Flow การอนุมัติ |
| 8 | `ApprovalNotificationService.java` | Interface บริการส่งการแจ้งเตือนงานอนุมัติ |
| 9 | `ApprovalService.java` | Interface บริการแกนหลักของกระบวนการอนุมัติเอกสาร |
| 10 | `AuditLogService.java` | Interface บริการบันทึกและสืบค้นประวัติ Audit Log |
| 11 | `BusinessAccessService.java` | Interface บริการตรวจสอบสิทธิ์การเข้าถึงองค์กร |
| 12 | `BusinessInviteService.java` | Interface บริการเชิญผู้ใช้เข้าร่วมองค์กร |
| 13 | `ChangeRequestService.java` | Interface บริการจัดการคำขอเปลี่ยนแปลงขอบเขตงาน (CR) |
| 14 | `ComboboxService.java` | Interface บริการข้อมูล Dropdown ทั่วไประบบ |
| 15 | `CurrentUserService.java` | Interface บริการดึงข้อมูลผู้ใช้งานปัจจุบัน |
| 16 | `DiscussionService.java` | Interface บริการกระดานพูดคุยในโครงการ |
| 17 | `DocumentVersionService.java` | Interface บริการบันทึกและเปรียบเทียบเวอร์ชันเอกสาร |
| 18 | `EditSessionService.java` | Interface บริการจัดการ Concurrency Edit Session |
| 19 | `FileStorageService.java` | Interface บริการจัดเก็บไฟล์ในระบบ Object Storage |
| 20 | `GlobalSearchService.java` | Interface บริการค้นหาข้อมูลแบบครอบคลุมทั้งระบบ (Global Search) |
| 21 | `ImpactAnalysisService.java` | Interface บริการวิเคราะห์ผลกระทบของ Change Request |
| 22 | `MailService.java` | Interface บริการส่งอีเมล |
| 23 | `MenuService.java` | Interface บริการดึงรายการเมนูระบบตามสิทธิ์ |
| 24 | `MessageI18nCache.java` | Interface แคชข้อความแปลภาษา |
| 25 | `MessageService.java` | Interface บริการดึงข้อความแจ้งเตือนและระบบสื่อสาร |
| 26 | `MilestoneService.java` | Interface บริการจัดการ Milestone |
| 27 | `NameUtilityService.java` | Interface บริการจัดรูปแบบชื่อ |
| 28 | `PhaseService.java` | Interface บริการจัดการเฟสงานโครงการ |
| 29 | `PmAiProviderService.java` | Interface บริการเชื่อมต่อ AI Provider |
| 30 | `PmBugService.java` | Interface บริการจัดการบั๊กของระบบ |
| 31 | `PmChangeRequestExportService.java` | Interface ส่งออกรายงาน Change Request |
| 32 | `PmCustomerContractExportService.java` | Interface ส่งออกรายงานสัญญาโครงการ |
| 33 | `PmCustomerContractService.java` | Interface บริการจัดการสัญญาลูกค้า |
| 34 | `PmCustomerProjectExportService.java` | Interface ส่งออกรายงานสรุปโครงการ |
| 35 | `PmCustomerProjectService.java` | Interface บริการจัดการโครงการ |
| 36 | `PmCustomerService.java` | Interface บริการจัดการข้อมูลลูกค้า |
| 37 | `PmDashboardOrgService.java` | Interface บริการแดชบอร์ดระดับองค์กร |
| 38 | `PmDeliveryExportService.java` | Interface ส่งออกรายงานการส่งมอบงาน |
| 39 | `PmDeliveryService.java` | Interface บริการจัดการงวดการส่งมอบ |
| 40 | `PmDesignReviewService.java` | Interface บริการตรวจทานการออกแบบ |
| 41 | `PmDiagramChatService.java` | Interface บริการแชทปรึกษาเรื่องไดอะแกรมกับ AI |
| 42 | `PmDiagramExportService.java` | Interface บริการส่งออกรูปภาพไดอะแกรม |
| 43 | `PmDiagramTabService.java` | Interface บริการจัดการแท็บไดอะแกรม |
| 44 | `PmInvoiceExportService.java` | Interface ส่งออกรายงานใบแจ้งหนี้ |
| 45 | `PmInvoiceService.java` | Interface บริการจัดการใบแจ้งหนี้ |
| 46 | `PmMaTicketExportService.java` | Interface ส่งออกรายงานงานแจ้งซ่อม MA |
| 47 | `PmMaTicketService.java` | Interface บริการจัดการ Ticket งาน MA |
| 48 | `PmPaymentService.java` | Interface บริการบันทึกการรับชำระเงิน |
| 49 | `PmProjectDashboardService.java` | Interface บริการแดชบอร์ดโครงการ |
| 50 | `PmRequirementExportService.java` | Interface ส่งออกเอกสารความต้องการระบบ |
| 51 | `PmRequirementService.java` | Interface บริการจัดการความต้องการระบบ |
| 52 | `PmSpecificationExportService.java` | Interface ส่งออกรายงาน Specification |
| 53 | `PmSpecificationService.java` | Interface บริการจัดการ Specification |
| 54 | `PmTestCaseService.java` | Interface บริการจัดการเคสทดสอบ |
| 55 | `PmTestScenarioService.java` | Interface บริการจัดการ Test Scenario |
| 56 | `PmUatExportService.java` | Interface ส่งออกเอกสารผลการทดสอบ UAT |
| 57 | `PmUserManualExportService.java` | Interface ส่งออกคู่มือการใช้งาน |
| 58 | `PmUserManualService.java` | Interface บริการจัดการคู่มือผู้ใช้ |
| 59 | `ProfileService.java` | Interface บริการจัดการโปรไฟล์ส่วนบุคคล |
| 60 | `ProgramAccessCache.java` | Interface แคชสิทธิ์การเข้าถึงหน้าจอ |
| 61 | `ProgramAccessService.java` | Interface ตรวจสอบสิทธิ์การเข้าถึงหน้าจอ |
| 62 | `ReportServiceClient.java` | ประมวลผลการทำงานส่วนของ ReportServiceClient |
| 63 | `SuBusinessService.java` | Interface บริการจัดการข้อมูล Business Unit |
| 64 | `SuUserBusinessMemberService.java` | Interface จัดการสมาชิกใน Business Unit |
| 65 | `SuUserBusinessService.java` | Interface จัดการการผูกผู้ใช้กับองค์กร |
| 66 | `TaskService.java` | Interface บริการจัดการงาน Task รายบุคคล |
| 67 | `TemporaryUploadCleanupSchedulerService.java` | ประมวลผลการทำงานส่วนของ TemporaryUploadCleanupSchedulerService |
| 68 | `TraceLinkService.java` | Interface บริการจัดการ Traceability Matrix |
| 69 | `UserSessionTracker.java` | Interface ติดตาม Session ผู้ใช้งาน |
| 70 | `VerifyService.java` | Interface บริการตรวจสอบและยืนยันตัวตน |
| 71 | `WorkPackageService.java` | Interface บริการจัดการ Work Package |

---

## 15. แพ็กเกจ `service/impl` (Class ประมวลผล Logic & Generator Helpers - 90 ไฟล์)

| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |
|:---:|---|---|
| 1 | `AiBatchGeneratorServiceImpl.java` | Class ให้บริการสร้างข้อมูลจำลองโครงการ ลูกค้า Requirement และ Task แบบ Batch ด้วย AI |
| 2 | `AiMemberPicker.java` | Helper ช่วยคัดเลือกสมาชิกทีมที่เหมาะสมกับทักษะของงาน Task |
| 3 | `AiModelConfigServiceImpl.java` | Class บันทึก แก้ไข และทดสอบการเชื่อมต่อ API ของโมเดล AI (Claude, Gemini) |
| 4 | `AiNavigatorServiceImpl.java` | Class วิเคราะห์คำถามของผู้ใช้แล้วแนะนำหน้าจอหรือฟังก์ชันที่เกี่ยวข้องในระบบ |
| 5 | `AiPhaseWbsService.java` | Service ช่วยสร้างโครงสร้าง Phase, Milestone และ WBS ด้วย AI อัตโนมัติ |
| 6 | `AiProjectPipelineJobService.java` | Service ควบคุม Job Background Pipeline ประมวลผลแปลง Requirement เป็น WBS และ Spec |
| 7 | `AiProjectPipelineServiceImpl.java` | Class จัดการคิวงาน ตรวจสอบสถานะ และรับผลลัพธ์ของ AI Project Pipeline |
| 8 | `AiScopeContextService.java` | Service สกัดและเตรียม Context ขอบเขตของโครงการส่งต่อให้กับ AI Prompt |
| 9 | `AiSqlGeneratorServiceImpl.java` | Class วิเคราะห์ตาราง ฟิลด์ และความสัมพันธ์จาก ER Diagram แล้วสร้างคำสั่ง SQL CREATE TABLE สำหรับ PostgreSQL/MySQL |
| 10 | `ApprovalFlowServiceImpl.java` | Class จัดการเพิ่ม แก้ไข ลบขั้นตอนการอนุมัติ และตรวจสอบสิทธิ์ผู้อนุมัติในแต่ละ Step |
| 11 | `ApprovalNotificationServiceImpl.java` | Class ส่ง Notification และอีเมลแจ้งผู้อนุมัติเมื่อมีคำขอใหม่หรือเมื่อถึงคิวของตน |
| 12 | `ApprovalServiceImpl.java` | Class ขนาดใหญ่ควบคุม State Machine การอนุมัติ (ยื่นขอ, อนุมัติ, ตีกลับ, ยกเลิก) ของทุกโมดูลในระบบ |
| 13 | `AuditLogServiceImpl.java` | Class จัดการดึงรายการประวัติการใช้งานระบบ พร้อมฟิลเตอร์ค้นหาผู้ใช้ วันที่ และ Action |
| 14 | `BulkDocumentExportService.java` | Service ส่งออกเอกสารโครงการจำนวนมากแบบเป็นชุด (Bulk Export) |
| 15 | `BusinessAccessServiceImpl.java` | Class ตรวจสอบความถูกต้องว่าผู้ใช้ปัจจุบันมีสิทธิ์เรียกดูหรือแก้ไขข้อมูลใน Business Unit นั้นหรือไม่ |
| 16 | `BusinessInviteServiceImpl.java` | Class สร้างคำเชิญ ส่งอีเมลโทเค็น และตรวจสอบการตอบรับคำเชิญเข้าร่วมองค์กร |
| 17 | `ChangeRequestServiceImpl.java` | Class ควบคุมวงจรชีวิตของ CR คำนวณ Manday และค่าใช้จ่ายที่เปลี่ยนแปลง |
| 18 | `ComboboxServiceImpl.java` | Class ดึงข้อมูล Master Data ในรูปแบบ Key-Value เพื่อป้อนให้กับ ComboBox ในหน้าจอ Frontend |
| 19 | `ContractGeneratorService.java` | Service สร้างข้อมูลตั้งต้นของสัญญาโครงการอัตโนมัติ |
| 20 | `ContractLifecycleService.java` | Service ตรวจสอบและอัปเดตสถานะของสัญญาตามเงื่อนไขวันเวลา |
| 21 | `CurrentUserServiceImpl.java` | Class สกัด Username, Email, BusinessId และ Roles จาก Spring Security Context |
| 22 | `DeliveryGeneratorService.java` | Service ช่วยสร้างข้อมูลร่างงวดการส่งมอบงานโครงการ |
| 23 | `DiscussionServiceImpl.java` | Class เพิ่ม ตอบกลับ และดึงความคิดเห็นในกระดาน Discussion ของโครงการ |
| 24 | `DocumentLivePreviewService.java` | Service แสดงตัวอย่างเอกสารแบบ Live Preview แบบ Real-time |
| 25 | `DocumentPdfExporters.java` | Helper จัดการการแปลงโครงสร้างเอกสารโครงการเป็นไฟล์ PDF |
| 26 | `DocumentVersionServiceImpl.java` | Class บันทึก JSON Snapshot ทุกการเปลี่ยนแปลง ค้นหาประวัติ และคำนวณ Diff ระหว่างเวอร์ชัน |
| 27 | `EditSessionServiceImpl.java` | Class สร้าง Lock Session เมื่อเปิดแก้ไขเอกสาร ตรวจจับ Heartbeat และปลด Lock เมื่อผู้ใช้ปิดหน้าจอ |
| 28 | `ErXmlParserServiceImpl.java` | Service แปลงไฟล์ XML จากโปรแกรมออกแบบฐานข้อมูล เข้าสู่โครงสร้าง ER Diagram ในระบบ |
| 29 | `FileStorageServiceImpl.java` | Class อัปโหลด ตรวจสอบประเภท/ขนาดไฟล์ ดาวน์โหลด และลบไฟล์บน SeaweedFS S3 |
| 30 | `GlobalSearchServiceImpl.java` | Class ค้นหาคำค้นหาครอบคลุมทุกโมดูล (โครงการ ลูกค้า สัญญา Requirement และเอกสาร) |
| 31 | `ImpactAnalysisServiceImpl.java` | Class วิเคราะห์ความเชื่อมโยง Traceability Matrix เพื่อประเมินผลกระทบต่อ Requirement และ Task เมื่อมี CR |
| 32 | `InvoiceGeneratorService.java` | Service ช่วยสร้างร่างใบแจ้งหนี้จากงวดงานที่ส่งมอบแล้ว |
| 33 | `MaTicketGeneratorService.java` | Service ช่วยสร้างรหัสและข้อมูลเริ่มต้นของ Ticket แจ้งซ่อม MA |
| 34 | `MailServiceImpl.java` | Class ส่งอีเมลแจ้งเตือนผ่าน JavaMailSender และเชื่อมต่อ SMTP |
| 35 | `MenuServiceImpl.java` | Class คัดกรองและส่งมอบโครงสร้างเมนูหน้าจอที่สอดคล้องกับ Role ของผู้ใช้ปัจจุบัน |
| 36 | `MessageI18nCacheImpl.java` | Class แคชข้อความระบบหลายภาษาใน Memory เพื่อประสิทธิภาพในการดึงข้อมูล |
| 37 | `MilestoneServiceImpl.java` | Class CRUD และติดตามสถานะความสำเร็จของ Milestone ในแต่ละเฟส |
| 38 | `NameUtilityServiceImpl.java` | Class ฟังก์ชันช่วยเหลือจัดรูปแบบชื่อ-นามสกุล และชื่อโครงการ |
| 39 | `PhaseServiceImpl.java` | Class CRUD เฟสงาน และคำนวณสัดส่วนความก้าวหน้าของแต่ละเฟส |
| 40 | `PmAiProviderServiceImpl.java` | Class จัดการเรียกใช้งาน API ของโมเดล AI แต่ละค่าย (Anthropic Claude, Google Gemini) |
| 41 | `PmBugServiceImpl.java` | Class บันทึก แจกจ่ายงาน และติดตามการแก้ไข Bug ที่พบในโครงการ |
| 42 | `PmChangeRequestExportServiceImpl.java` | Class เตรียมข้อมูลสรุปคำขอ CR เพื่อส่งให้ Report Service ออกรายงาน |
| 43 | `PmCustomerContractExportServiceImpl.java` | Class ดึงข้อมูลสัญญา รายละเอียดงวดเงิน และเงื่อนไขเพื่อออกเอกสารสัญญา |
| 44 | `PmCustomerContractServiceImpl.java` | Class ควบคุมวงจรชีวิตสัญญา มูลค่างาน และการต่อสัญญาโครงการ |
| 45 | `PmCustomerProjectExportServiceImpl.java` | Class รวบรวมข้อมูลโครงการ ทีมงาน และสถานะงานเพื่อพิมพ์รายงานสรุป |
| 46 | `PmCustomerProjectServiceImpl.java` | Class จัดการโครงการ ตรวจสอบเงื่อนไขวันเวลา และสถิติภาพรวม |
| 47 | `PmCustomerServiceImpl.java` | Class CRUD ข้อมูลลูกค้า บริษัทคู่ค้า และผู้ติดต่อ |
| 48 | `PmDashboardOrgServiceImpl.java` | Class คำนวณสถิติภาพรวมโครงการและงบประมาณระดับองค์กร |
| 49 | `PmDeliveryExportServiceImpl.java` | Class เตรียมข้อมูลใบส่งมอบงานและ Checklist ตรวจรับ |
| 50 | `PmDeliveryServiceImpl.java` | Class จัดการงวดส่งมอบ ตรวจสอบ Checklist และเปลี่ยนสถานะงวดงาน |
| 51 | `PmDesignReviewExportService.java` | Service ส่งออกรายงานสรุปการตรวจทานการออกแบบ |
| 52 | `PmDesignReviewServiceImpl.java` | Class จัดการรอบการตรวจทาน UI/Architecture และรวบรวมความคิดเห็นของผู้ตรวจ |
| 53 | `PmDiagramChatServiceImpl.java` | Class รับคำถามเกี่ยวกับโครงสร้างฐานข้อมูลและ DFD ส่งให้ AI วิเคราะห์และตอบคำถาม |
| 54 | `PmDiagramExportServiceImpl.java` | Class ส่งออก DFD และ ER Diagram ในรูปแบบรูปภาพหรือไฟล์เอกสาร |
| 55 | `PmDiagramTabServiceImpl.java` | Class บันทึก Node, Edge, สี, ข้อความ และพิกัดของไดอะแกรมลงฐานข้อมูล |
| 56 | `PmInvoiceExportServiceImpl.java` | Class เตรียมข้อมูลใบแจ้งหนี้และรายการย่อยเพื่อออกเป็น PDF |
| 57 | `PmInvoiceServiceImpl.java` | Class ออกใบแจ้งหนี้ ติดตามยอดค้างชำระ และคำนวณภาษี |
| 58 | `PmMaTicketExportServiceImpl.java` | Class สรุปประวัติ Ticket การแจ้งซ่อมและการแก้ไขเพื่อพิมพ์รายงานส่งลูกค้า |
| 59 | `PmMaTicketServiceImpl.java` | Class เปิด Ticket มอบหมายงาน ติดตาม SLA และบันทึกผลการซ่อม |
| 60 | `PmPaymentServiceImpl.java` | Class บันทึกหลักฐานการจ่ายเงิน อัปเดตยอดคงเหลือในใบแจ้งหนี้ |
| 61 | `PmProjectDashboardServiceImpl.java` | Class คำนวณดัชนีชี้วัดความคืบหน้า (Burn-down, Task Status) ของโครงการนั้นๆ |
| 62 | `PmRequirementExportServiceImpl.java` | Class เตรียมข้อมูล Software Requirement Specification (SRS) เพื่อออกรายงาน |
| 63 | `PmRequirementServiceImpl.java` | Class บันทึก แก้ไข และติดตามสถานะการ Sign-off Requirement จากลูกค้า |
| 64 | `PmSpecificationExportServiceImpl.java` | Class เตรียมข้อมูลเอกสาร Functional Specification |
| 65 | `PmSpecificationServiceImpl.java` | Class จัดทำสเปก ผูก Data Field Mapping และคำนวณ Manday |
| 66 | `PmTestCaseServiceImpl.java` | Class จัดการเคสทดสอบ บันทึกผล Pass/Fail และผูกโยงกับ Bug |
| 67 | `PmTestScenarioServiceImpl.java` | Class ควบคุมกลุ่มการทดสอบตามฟังก์ชันงาน |
| 68 | `PmUatExportServiceImpl.java` | Class สร้างเอกสารรายงานผลการทดสอบ UAT สำหรับให้ลูกค้าเซ็นรับรอง |
| 69 | `PmUserManualExportServiceImpl.java` | Class รวบรวมหัวข้อ รูปภาพ และเนื้อหาจัดทำเป็นเล่มคู่มือ PDF |
| 70 | `PmUserManualServiceImpl.java` | Class CRUD บทเรียนและเนื้อหาคู่มือการใช้งานระบบ |
| 71 | `ProfileServiceImpl.java` | Class อัปเดตข้อมูลผู้ใช้ เปลี่ยนรหัสผ่าน และจัดการรูปโปรไฟล์ |
| 72 | `ProgramAccessCacheImpl.java` | Class เก็บแคชสิทธิ์ของ Role ใน Memory เพื่อให้ตรวจสิทธิ์หน้าจอได้อย่างรวดเร็ว |
| 73 | `ProgramAccessServiceImpl.java` | Class ตรวจสอบว่า Role ของผู้ใช้มีสิทธิ์เข้าถึงหน้าจอนั้นๆ หรือไม่ |
| 74 | `ProjectGeneratorService.java` | Service ช่วยสร้างข้อมูลโครงการเริ่มต้นและเทมเพลตมาตรฐาน |
| 75 | `RequirementExportService.java` | Service รวบรวมและจัดฟอร์แมตข้อมูล Requirement สำหรับออกรายงาน |
| 76 | `RequirementGeneratorService.java` | Service ช่วยสร้างรายการ Requirement ตัวอย่างตามประเภทธุรกิจ |
| 77 | `SpecificationGeneratorService.java` | Service ช่วยแปลง Requirement ให้กลายเป็น Specification ร่างแรก |
| 78 | `SuBusinessServiceImpl.java` | Class จัดการเพิ่มและแก้ไขข้อมูลองค์กร/หน่วยงาน |
| 79 | `SuUserBusinessMemberServiceImpl.java` | Class จัดการสมาชิก เชิญ และกำหนด Role ภายในองค์กร |
| 80 | `SuUserBusinessServiceImpl.java` | Class จัดการความสัมพันธ์ระหว่าง User กับ Business Unit ต่างๆ |
| 81 | `TaskServiceImpl.java` | Class จัดการ Task, มอบหมายงาน, บันทึกชั่วโมงทำงาน และเปลี่ยนสถานะงาน |
| 82 | `TestCaseGeneratorService.java` | Service สร้าง Test Case ตัวอย่างอัตโนมัติจาก Requirement และ Spec |
| 83 | `TestScenarioGeneratorService.java` | Service สร้างกลุ่ม Test Scenario ร่างแรกอัตโนมัติ |
| 84 | `ThaiCustomerGeneratorHelper.java` | Helper สร้างข้อมูลจำลองลูกค้า บริษัท และที่อยู่ภาษาไทยสำหรับการทดสอบ |
| 85 | `TraceLinkServiceImpl.java` | Class สร้างและจัดการเส้นทางความเชื่อมโยง Requirement -> Spec -> Task -> Test Case |
| 86 | `UnauthorizedException.java` | Exception ที่ถูกโยนเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึงทรัพยากรนั้นๆ |
| 87 | `UserManualGeneratorService.java` | Service ช่วยสร้างโครงร่างคู่มือการใช้งานอัตโนมัติจาก Spec |
| 88 | `UserSessionTrackerImpl.java` | Class ติดตามสถานะ Active/Idle ของผู้ใช้งานในระบบแบบ Real-time |
| 89 | `VerifyServiceImpl.java` | Class ตรวจสอบ Token การยืนยันอีเมลและการรีเซ็ตรหัสผ่าน |
| 90 | `WorkPackageServiceImpl.java` | Class จัดการกลุ่มงานย่อยในระดับ Work Package ภายใต้ Phase โครงการ |

---

## 16. แนวทางการตอบคำถามอาจารย์เมื่อตรวจโปรเจกต์ (Cheat Sheet)

### 1. ทำไมถึงต้องแยก Interface ใน `service` ออกจาก Implementation ใน `service/impl`?
> *"ใช้หลักการ **Dependency Inversion Principle (DIP)** ใน SOLID Principles ครับ เพื่อให้ Controller พึ่งพาเฉพาะ Abstraction (Interface) ไม่ยึดติดกับ Class จริง ช่วยให้เราเขียน Unit Test ได้ง่ายเพราะสามารถ Mock Service ได้ทันที และหากในอนาคตต้องการเปลี่ยน Business Logic หรือสลับ Provider ก็ทำได้โดยไม่ต้องแก้ไข Controller เลยครับ"*

### 2. ระบบจัดการความปลอดภัย (Authentication & Authorization) อย่างไร?
> *"ระบบใช้ **Keycloak (OIDC)** เป็น Identity Provider เมื่อผู้ใช้ล็อกอินจะได้รับ JWT Access Token ทาง Frontend จะแนบ Token ใน Header `Authorization: Bearer <token>` ทุก Request โดยมี `SecurityConfig` คอยตรวจสอบความถูกต้องของ Token ส่วนระดับองค์กร (Multi-tenancy) จะมี `BusinessContextInterceptor` ดักจับ Header `X-Business-Id` เพื่อจำกัดขอบเขตข้อมูลไม่ให้ข้ามบริษัทกันครับ"*

### 3. ทำไมถึงตั้ง `hibernate.ddl-auto: none` แล้วใช้ Flyway แทน?
> *"เพราะในระบบงานจริงระดับ Enterprise การให้ Hibernate สร้างหรือแก้ Table เองมีความเสี่ยงที่ข้อมูลจะสูญหายหรือโครงสร้างเพี้ยน เราจึงใช้ **Flyway** ทำ Database Versioning ผ่านไฟล์ `.sql` ในโฟลเดอร์ `db/migration` ทำให้ทีมพัฒนาทุกคนและ Server ทดสอบมี Schema ตรงกัน 100% เสมอครับ"*

### 4. ถ้ามีผู้ใช้ 2 คนเปิดแก้ไขเอกสารชิ้นเดียวกันพร้อมกัน ระบบป้องกันอย่างไร?
> *"เราทำระบบ Concurrency Control ผ่าน `EditSessionService` ครับ เมื่อมีคนเปิดหน้าจอแก้ไข ระบบจะสร้าง Lock Session บันทึกลงตาราง `pm_edit_session` พร้อมส่ง Heartbeat ตรวจสอบ หากมีผู้ใช้อื่นพยายามเปิดแก้ซ้ำ ระบบจะปฏิเสธและโยน `DocumentLockedException` ทันทีเพื่อป้องกันการบันทึกทับข้อมูลกันครับ"*

### 5. ทำไมไฟล์อัปโหลดถึงไม่เก็บลงฐานข้อมูลโดยตรง?
> *"เราเลือกใช้ **SeaweedFS Object Storage (S3 API)** แทน เพื่อป้องกันไม่ให้ Database บวมและลดภาระ I/O ของฐานข้อมูล โดยจัดเก็บไฟล์ลง Storage และเก็บเฉพาะ Metadata (Path, Key, Bucket, ขนาด) ลงในตาราง `su_upload` ของ PostgreSQL ครับ"*
