import os
import re

root_dir = r"c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\sic-spring\sic\src\main\java\com\softinter\sicapi"
target_md = r"c:\Users\lovew\Student\Project-Main\Java-intern\sic-project\docs\BACKEND_ARCHITECTURE_GUIDE.md"

def extract_file_info(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Check package
    pkg_match = re.search(r'package\s+([\w\.]+);', content)
    pkg = pkg_match.group(1) if pkg_match else ""
    
    # Check class/interface/enum definition
    type_match = re.search(r'(public\s+)?(class|interface|enum|@interface)\s+(\w+)', content)
    kind = type_match.group(2) if type_match else "class"
    name = type_match.group(3) if type_match else os.path.basename(filepath)
    
    # Check annotations
    annotations = re.findall(r'@(\w+)', content[:1000])
    
    return {
        "name": os.path.basename(filepath),
        "path": filepath.replace("\\", "/"),
        "kind": kind,
        "class_name": name,
        "annotations": annotations[:5],
        "content_len": len(content)
    }

# Descriptions mapping for all files
DESCRIPTIONS = {
    # Entry
    "SicApiApplication.java": "คลาสหลักสำหรับบูตระบบ Spring Boot (`@SpringBootApplication`), เปิดใช้งาน Asynchronous (`@EnableAsync`), Scheduling (`@EnableScheduling`) และรัน `loadDotEnv()` เพื่อโหลด Environment Variables จากไฟล์ `.env`",

    # Config
    "SecurityConfig.java": "ตั้งค่าความปลอดภัยระบบ (Spring Security), กำหนด Filter ตรวจสอบ JWT Bearer Token จาก Keycloak, จัดการ CORS, Stateless Session, และเปิดสิทธิ์ Public Path (Swagger, Actuator, Public Files)",
    "CorsConfig.java": "กำหนดนโยบาย Cross-Origin Resource Sharing อนุญาตให้ Frontend (`http://localhost:4200`) ส่ง Request และ Header เข้ามาทำงานได้",
    "S3Config.java": "สร้าง Spring Bean `S3Client` เชื่อมต่อไปยัง SeaweedFS Object Storage ผ่านโปรโตคอล AWS S3 API เพื่อบริหารจัดการไฟล์",
    "WebSocketConfig.java": "ตั้งค่า STOMP WebSocket Message Broker ผ่าน Endpoint `/ws` และ Route `/app`, `/topic` สำหรับ Real-time Chat และ WebRTC Signaling",
    "FlywayConfig.java": "ควบคุมการรัน Database Migration สคริปต์ SQL ใน `db/migration` อัตโนมัติเมื่อระบบเริ่มทำงาน ช่วยให้ Schema ตรงกันทุก Environment",
    "BusinessContextHolder.java": "เก็บค่า `businessId` ปัจจุบันของ Thread (ThreadLocal) เพื่อให้เลเยอร์ Service เรียกใช้คัดกรองข้อมูลระดับ Multi-tenancy ได้โดยไม่ต้องส่ง Parameter ข้ามทุกเลเยอร์",
    "AuditLog.java": "Custom Annotation (`@AuditLog`) สำหรับแปะบน Method ของ Controller หรือ Service เพื่อระบุ Action และ Module ที่ต้องการบันทึกประวัติการใช้งาน",
    "AuditLogAspect.java": "คลาส AOP (AspectJ) ดักจับ Method ที่มี `@AuditLog` ดึงข้อมูลผู้ใช้งาน, เวลา, Parameter และผลลัพธ์การทำงาน ไปบันทึกลงตาราง `su_audit_log` อัตโนมัติ",
    "AuditorAwareImpl.java": "ดึง Username ของผู้ใช้ปัจจุบันจาก Keycloak Security Context ส่งให้ฟิลด์ `@CreatedBy` และ `@LastModifiedBy` ใน JPA Entity",
    "JpaConfig.java": "เปิดใช้งาน JPA Auditing (`@EnableJpaAuditing`) สำหรับบันทึก Timestamp และผู้สร้าง/แก้ไขข้อมูลโดยอัตโนมัติ",
    "CacheConfig.java": "เปิดใช้งาน Spring Cache Abstraction (`@EnableCaching`) สำหรับแคชข้อมูลที่ถูกอ่านบ่อย เช่น สิทธิ์เมนู หรือ Resource Bundle แปลภาษา",
    "JacksonInstantConfig.java": "ตั้งค่าโมดูล Jackson สำหรับแปลงและจัดรูปแบบประเภทข้อมูลวันเวลา `Instant` และ `LocalDateTime` ให้ตรงตามมาตรฐาน ISO-8601",
    "OpenApiConfig.java": "ตั้งค่าเอกสาร Swagger / OpenAPI 3.0 สำหรับทดสอบ API และระบุ Security Scheme แบบ Bearer JWT Token",
    "WebConfig.java": "ลงทะเบียน Interceptor (BusinessContextInterceptor, LanguageInterceptor) เข้าสู่ Spring MVC Request Lifecycle",
    "AiApiKeyConverter.java": "JPA AttributeConverter เข้ารหัส (Encrypt) และถอดรหัส (Decrypt) API Key ของ AI (เช่น Gemini, Claude) ก่อนบันทึกลงหรืออ่านจากฐานข้อมูลเพื่อความปลอดภัย",
    "ReportServiceProperties.java": "คลาส Configuration Properties อ่านค่า URL, Secret Token และ Timeout ของ Microservice ออกรายงานจาก `application.yml`",

    # Interceptor
    "BusinessContextInterceptor.java": "ดักจับ HTTP Request เพื่อดึง Header `X-Business-Id` นำไปเซ็ตใน `BusinessContextHolder` และเคลียร์ทิ้งเมื่อ Request ทำงานเสร็จ",
    "JwtChannelInterceptor.java": "ดักจับการเชื่อมต่อ WebSocket (STOMP CONNECT) เพื่อตรวจสอบความถูกต้องของ JWT Token หากไม่ผ่านจะปฏิเสธการเชื่อมต่อทันที",
    "LanguageInterceptor.java": "ดักอ่าน Header `Accept-Language` เพื่อกำหนด Locale ภาษา (ไทย/อังกฤษ) สำหรับแสดงผลข้อความแจ้งเตือนและ Error ในระบบ",

    # Exception
    "GlobalExceptionHandler.java": "ตัวจัดการ Error ส่วนกลางผ่าน `@RestControllerAdvice` รวบรวม Exception ทั้งหมด (Validation, Not Found, Forbidden) แปลงเป็น Response JSON รูปแบบมาตรฐาน",
    "ResourceNotFoundException.java": "Custom Exception สำหรับข้อผิดพลาดค้นหาข้อมูลไม่พบในระบบ (HTTP 404 Not Found)",
    "DocumentLockedException.java": "Custom Exception เมื่อมีผู้ใช้อื่นกำลังเปิดแก้ไขเอกสารฉบับเดียวกันอยู่ ป้องกัน Concurrency Conflict (HTTP 409 Conflict)",

    # Scheduler
    "ApprovalTimeoutScheduler.java": "Cron Job ทำงานตามรอบเวลา ตรวจสอบคำขออนุมัติที่ค้างเกินกำหนด (Timeout) ส่ง Notification เตือนผู้อนุมัติหรืออัปเดตสถานะ",
    "ContractLifecycleScheduler.java": "Cron Job คอยตรวจหาสัญญาลูกค้าที่ใกล้หมดอายุล่วงหน้า แจ้งเตือนฝ่ายขายและผู้จัดการโครงการเพื่อเตรียมดำเนินการต่อสัญญา",

    # WebSocket
    "ChatWebSocketController.java": "Controller ควบคุมการรับ-ส่งข้อความแชทสดรายบุคคล/กลุ่ม และรับ-ส่งสัญญาณ WebRTC Call Signaling (Offer/Answer/Candidate) สำหรับการสื่อสาร Real-time",

    # Util
    "ApprovalKeywordSearchHelper.java": "ตัวช่วยสร้างเงื่อนไข Predicate สำหรับค้นหารายการคำขออนุมัติด้วยคำค้นหา (Keyword Search)",
    "ContractLifecycle.java": "ตรวจสอบและควบคุม State Machine ของสัญญาลูกค้า (Draft -> Active -> Expiring -> Expired)",
    "ContractNoHelper.java": "สร้างและจัดฟอร์แมตรหัสสัญญาโครงการอัตโนมัติตามรูปแบบที่กำหนด (เช่น `CTR-YYYYMM-XXXX`)",
    "DateRangeValidator.java": "ตรวจสอบความถูกต้องของช่วงวันที่ (วันที่เริ่มต้นต้องไม่มากกว่าวันที่สิ้นสุด)",
    "DocumentDiffHelper.java": "เปรียบเทียบความแตกต่างของเนื้อหาเอกสาร 2 เวอร์ชัน (Text Diff) เพื่อดูส่วนที่ถูกเพิ่ม ลบ หรือแก้ไข",
    "EnumConverter.java": "Generic Utility แปลงค่า Enum เป็น String หรือ Integer ในฐานข้อมูลอย่างปลอดภัย",
    "FileVisibilityConverter.java": "แปลงค่าระดับการมองเห็นไฟล์ (Public, Internal, Confidential) ระหว่าง JPA และฐานข้อมูล",
    "JsonSnapshotHelper.java": "แปลง State ของ Entity ให้เป็น JSON Snapshot สำหรับบันทึกประวัติการเปลี่ยนแปลงในตาราง Version History",
    "KeywordSearchHelper.java": "สร้างเงื่อนไข SQL ค้นหาคำแบบ Case-insensitive และ Partial Matching รองรับภาษาไทยและอังกฤษ",
    "LanguageUtils.java": "ฟังก์ชันช่วยเหลือสำหรับตรวจสอบและสกัดรหัสภาษามาตรฐานจาก HTTP Header",
    "LocalizationHelper.java": "ดึงข้อความ Resource Bundle สลับภาษาไทย-อังกฤษตาม Locale ของผู้ใช้งาน",
    "PaginationUtil.java": "ช่วยสร้างออบเจกต์ `Pageable` และคำนวณ Offset, Page Number, Page Size รองรับการทำ Pagination",
    "PdfBook.java": "รวมไฟล์ PDF หลายๆ ฉบับ (เช่น ปก, Requirement, Spec, Diagram) เข้าเป็นเอกสารเล่มเดียวสมบูรณ์",
    "ReportHelper.java": "ฟังก์ชันขนาดใหญ่เตรียมข้อมูล จัดตาราง และคำนวณผลรวมยอดเงิน/เวลา เพื่อส่งต่อให้ Report Service ออกรายงาน",
    "SortValidator.java": "ตรวจสอบความถูกต้องของชื่อคอลัมน์ที่ขอเรียงลำดับ ป้องกัน SQL Injection จากการส่งชื่อคอลัมน์แปลกปลอม",
    "UniquenessValidator.java": "ตรวจสอบความไม่ซ้ำกันของข้อมูลเฉพาะ เช่น รหัสโครงการ หรือเลขที่สัญญา",
    "VersionKeywordSearchHelper.java": "ช่วยค้นหารายการบันทึกประวัติ Version เอกสารตามคำค้นหา",

    # Entity Base & Enums
    "BaseEntity.java": "Entity แม่แบบสำหรับฟิลด์มาตรฐานทุกตาราง: `createdBy`, `createdDate`, `updatedBy`, `updatedDate`",
    "BaseBusinessEntity.java": "Entity แม่แบบสืบทอดจาก `BaseEntity` โดยเพิ่มฟิลด์ `businessId` สำหรับตารางที่ต้องแบ่งข้อมูลตาม Business Unit",
    "ApprovalMode.java": "Enum กำหนดโหมดการอนุมัติ เช่น อนุมัติแบบคนเดียว (SINGLE) หรือตามลำดับขั้น (SEQUENTIAL)",
    "ApprovalStatus.java": "Enum สถานะการอนุมัติ: PENDING (รออนุมัติ), APPROVED (อนุมัติแล้ว), REJECTED (ปฏิเสธ), CANCELLED (ยกเลิก)",
    "BillingType.java": "Enum รูปแบบการวางบิล เช่น ตามงวดงาน (MILESTONE) หรือตามระยะเวลา (MONTHLY/FIXED)",
    "ChatMessageType.java": "Enum ประเภทข้อความแชท: TEXT (ข้อความ), IMAGE (รูปภาพ), FILE (ไฟล์แนบ), CALL_SIGNAL (สัญญาณโทร)",
    "DocumentType.java": "Enum ประเภทเอกสารในระบบ: REQUIREMENT, SPECIFICATION, DFD, ERD, CONTRACT, TEST_CASE ฯลฯ",
    "EntityState.java": "Enum สถานะวงจรชีวิตของข้อมูล เช่น ACTIVE (ใช้งานอยู่), INACTIVE (ปิดการใช้งาน), DELETED (ลบชั่วคราว)",
    "FileCategory.java": "Enum หมวดหมู่ของไฟล์ที่อัปโหลด เช่น AVATAR, ATTACHMENT, CONTRACT_DOC, DIAGRAM_EXPORT",
    "FileVisibility.java": "Enum สิทธิ์การมองเห็นไฟล์: PUBLIC (สาธารณะ), INTERNAL (ภายในองค์กร), CONFIDENTIAL (เฉพาะผู้มีสิทธิ์)",
    "MaTicketSeverity.java": "Enum ระดับความรุนแรงของ MA Ticket: LOW, MEDIUM, HIGH, CRITICAL",
    "MaTicketStatus.java": "Enum สถานะงานแจ้งซ่อม MA: OPEN, IN_PROGRESS, RESOLVED, CLOSED",
    "MaTicketType.java": "Enum ประเภทของ MA Ticket: BUG_FIX (แก้ไขบั๊ก), ENHANCEMENT (ปรับปรุง), SUPPORT (ช่วยเหลือผู้ใช้)",
    "PaymentMethod.java": "Enum วิธีการชำระเงิน: BANK_TRANSFER, CREDIT_CARD, CHEQUE, CASH",
    "PaymentStatus.java": "Enum สถานะการชำระเงิน: UNPAID (ยังไม่จ่าย), PARTIAL (จ่ายบางส่วน), PAID (จ่ายครบแล้ว), OVERDUE (เกินกำหนด)",
    "TraceRelationship.java": "Enum ประเภทความสัมพันธ์ของ Traceability Matrix เช่น IMPLEMENTS, TESTS, DEPENDS_ON",

    # Entity DB (Master Data)
    "DbAiModelConfig.java": "Entity ตาราง `db_ai_model_config` เก็บการตั้งค่า Provider, Model Name, API Key และ Parameter ของ AI",
    "DbCountry.java": "Entity ตาราง `db_country` ข้อมูลประเทศ",
    "DbDistrict.java": "Entity ตาราง `db_district` ข้อมูลอำเภอ/เขต",
    "DbMailConfig.java": "Entity ตาราง `db_mail_config` การตั้งค่า Mail Server และ Credentials",
    "DbMailQueue.java": "Entity ตาราง `db_mail_queue` คิวอีเมลที่รอการส่งออก",
    "DbMailTemplate.java": "Entity ตาราง `db_mail_template` เทมเพลตเนื้อหาอีเมลสำหรับการแจ้งเตือนต่างๆ",
    "DbParameter.java": "Entity ตาราง `db_parameter` พารามิเตอร์ระบบแบบ Key-Value",
    "DbProvince.java": "Entity ตาราง `db_province` ข้อมูลจังหวัด",
    "DbSubDistrict.java": "Entity ตาราง `db_sub_district` ข้อมูลตำบล/แขวง และรหัสไปรษณีย์",
    "DbTitle.java": "Entity ตาราง `db_title` คำนำหน้าชื่อ (นาย, นาง, นางสาว, ดร.)",

    # Entity EX
    "ExExample.java": "Entity ตารางตัวอย่างโครงสร้างโค้ดมาตรฐานสำหรับอ้างอิงในการพัฒนา",
    "StorageUploadReference.java": "Entity ตารางอ้างอิงความสัมพันธ์การใช้งานไฟล์ในระบบ",

    # Entity PM (Project Management - 45 files)
    "AiPipelineJob.java": "Entity ตารางเก็บสถานะงาน Job การแปลง Requirement สู่ WBS/Spec อัตโนมัติด้วย AI",
    "ChangeImpactAnalysis.java": "Entity ตารางบันทึกผลการวิเคราะห์ผลกระทบของ Change Request (CR)",
    "ChangeImpactAnalysisHistory.java": "Entity ตารางบันทึกประวัติการวิเคราะห์ผลกระทบย้อนหลัง",
    "PmApproval.java": "Entity ตารางเก็บข้อมูลคำขออนุมัติหลัก (Target Type, Target ID, ผู้ขอ, สถานะ)",
    "PmApprovalFlow.java": "Entity ตารางนิยามกระบวนการ Flow การอนุมัติของแต่ละประเภทเอกสาร",
    "PmApprovalFlowStep.java": "Entity ตารางกำหนดขั้นตอนย่อยและบทบาทของผู้อนุมัติในแต่ละ Step",
    "PmApprovalLog.java": "Entity ตารางประวัติการกดอนุมัติ ตีกลับ หรือยกเลิกคำขอ",
    "PmApprovalReminder.java": "Entity ตารางประวัติการส่งแจ้งเตือนการอนุมัติที่ค้างอยู่",
    "PmApprovalStepStatus.java": "Entity ตารางสถานะของแต่ละขั้นตอนในคำขออนุมัตินั้นๆ",
    "PmBug.java": "Entity ตารางบันทึกข้อผิดพลาด (Bug) ที่พบจากการทดสอบหรือใช้งานจริง",
    "PmChangeImpact.java": "Entity ตารางแจกแจงรายการผลกระทบต่อโมดูล/ตารางที่เกิดจาก CR",
    "PmChangeRequest.java": "Entity ตารางคำขอเปลี่ยนแปลงขอบเขตงานโครงการ (Change Request - CR)",
    "PmComment.java": "Entity ตารางความคิดเห็นและข้อความพูดคุยในกระดาน Discussion ของโครงการ",
    "PmCrAssignee.java": "Entity ตารางผู้รับผิดชอบการดำเนินการตามคำขอ Change Request",
    "PmCustomer.java": "Entity ตารางข้อมูลลูกค้า บริษัทคู่สัญญา ที่อยู่ และข้อมูลการติดต่อ",
    "PmCustomerContract.java": "Entity ตารางสัญญาโครงการ มูลค่าสัญญา วันที่เริ่ม-สิ้นสุด และเงื่อนไข",
    "PmCustomerProject.java": "Entity ตารางข้อมูลโครงการ วันที่ดำเนินงาน งบประมาณ และสถานะโครงการ",
    "PmDelivery.java": "Entity ตารางงวดการส่งมอบงานโครงการ (Delivery งวดที่ 1, 2, ...)",
    "PmDeliveryChecklist.java": "Entity ตารางรายการตรวจรับงานในแต่ละงวดการส่งมอบ",
    "PmDeliveryItem.java": "Entity ตารางรายการเอกสารหรือผลงานที่ต้องส่งมอบในงวดนั้นๆ",
    "PmDesignReview.java": "Entity ตารางบันทึกผลการตรวจทานการออกแบบ (UI/UX / Architecture Review)",
    "PmDiagramChat.java": "Entity ตารางประวัติการแชทกับ AI ผู้ช่วยให้คำปรึกษาการออกแบบไดอะแกรม",
    "PmDiagramSqlHistory.java": "Entity ตารางประวัติสคริปต์ SQL DDL ที่ถูก Generate มาจาก ER Diagram",
    "PmDiagramTab.java": "Entity ตารางเก็บข้อมูลไดอะแกรม DFD และ ER Diagram (Node, Edge, ตำแหน่งพิกัด)",
    "PmDiagramVersion.java": "Entity ตารางประวัติเวอร์ชันย้อนหลังของไดอะแกรม",
    "PmDocumentVersion.java": "Entity ตารางเก็บ Snapshot เวอร์ชันของเอกสารโครงการสำหรับดูประวัติหรือ Rollback",
    "PmEditSession.java": "Entity ตารางเก็บสถานะ Lock การแก้ไขเอกสารแบบ Concurrency ป้องกันคนเปิดแก้ชนกัน",
    "PmInvoice.java": "Entity ตารางใบแจ้งหนี้ ยอดเงินเรียกเก็บ วันที่ครบกำหนดชำระ",
    "PmInvoiceItem.java": "Entity ตารางรายการสินค้า/บริการย่อยในใบแจ้งหนี้",
    "PmMaTicket.java": "Entity ตารางคำขอแจ้งซ่อม บำรุงรักษา หรือแจ้งปัญหาหลังส่งมอบงาน (MA Support)",
    "PmMaTicketAssignee.java": "Entity ตารางผู้รับผิดชอบ Ticket แจ้งซ่อม MA",
    "PmMilestone.java": "Entity ตารางเป้าหมายความสำเร็จสำคัญ (Milestone) ของแต่ละเฟสโครงการ",
    "PmPayment.java": "Entity ตารางบันทึกการรับชำระเงิน ยอดเงิน วิธีชำระ และหลักฐานการโอน",
    "PmPhase.java": "Entity ตารางเฟสของโครงการตามกระบวนการ SDLC",
    "PmRequirement.java": "Entity ตารางข้อกำหนดและความต้องการของระบบ และสถานะ Sign-off จากลูกค้า",
    "PmReviewComment.java": "Entity ตารางความคิดเห็นระหว่างการตรวจทานการออกแบบ Design Review",
    "PmSpecification.java": "Entity ตารางสเปกของฟังก์ชัน ฟิลด์ข้อมูล และการประเมิน Manday",
    "PmTask.java": "Entity ตารางงานย่อยระดับ Task สำหรับนักพัฒนาใน Work Package",
    "PmTaskAssignee.java": "Entity ตารางผู้รับผิดชอบงาน Task แต่ละชิ้น",
    "PmTestCase.java": "Entity ตารางเคสทดสอบระบบ (Preconditions, Steps, Expected Result, Status)",
    "PmTestScenario.java": "Entity ตารางกลุ่มสถานการณ์การทดสอบ (Test Scenario)",
    "PmTraceLink.java": "Entity ตาราง Traceability Matrix เชื่อมโยง Requirement, Spec, Task, Test Case",
    "PmUserManual.java": "Entity ตารางคู่มือการใช้งานระบบสำหรับผู้ใช้",
    "PmUserManualSection.java": "Entity ตารางหัวข้อย่อยและเนื้อหาในคู่มือการใช้งาน",
    "PmWorkPackage.java": "Entity ตารางกลุ่มงาน Work Package ใน WBS ภายใต้ Phase",

    # Entity SU (System User & Permissions - 21 files)
    "SuAuditLog.java": "Entity ตาราง `su_audit_log` บันทึกประวัติการกระทำของผู้ใช้ในระบบ (Who, When, Action, Data)",
    "SuBusiness.java": "Entity ตาราง `su_business` ข้อมูลองค์กร/หน่วยงาน (Multi-tenancy Unit)",
    "SuBusinessAudit.java": "Entity ตารางบันทึกการเปลี่ยนแปลงข้อมูลองค์กร",
    "SuBusinessInvite.java": "Entity ตารางคำเชิญเข้าร่วมองค์กรและโทเค็นการยืนยัน",
    "SuBusinessRole.java": "Entity ตารางบทบาทหน้าที่ (Roles) ภายในแต่ละองค์กร",
    "SuBusinessRoleProgram.java": "Entity ตารางสิทธิ์ของ Role ต่อแต่ละหน้าจอ (สิทธิ์อ่าน, สิทธิ์เขียน, สิทธิ์ลบ)",
    "SuChatGroup.java": "Entity ตารางห้องแชทกลุ่มโครงการหรือกลุ่มแผนก",
    "SuChatGroupCallParticipant.java": "Entity ตารางบันทึกผู้เข้าร่วมการโทร/ประชุมสายในห้องแชท",
    "SuChatGroupLog.java": "Entity ตารางบันทึกเหตุการณ์ในห้องแชทกลุ่ม (เช่น เพิ่มสมาชิก, เปลี่ยนชื่อกลุ่ม)",
    "SuChatGroupMember.java": "Entity ตารางสมาชิกในแต่ละห้องแชทกลุ่ม",
    "SuChatLog.java": "Entity ตารางข้อความแชทรายบุคคลและกลุ่ม",
    "SuMessage.java": "Entity ตารางข้อความระบบและการแจ้งเตือน",
    "SuNotification.java": "Entity ตารางการแจ้งเตือนส่วนบุคคลของผู้ใช้แต่ละคน",
    "SuProfile.java": "Entity ตารางข้อมูลโปรไฟล์ผู้ใช้งาน (ชื่อ, อีเมล, เบอร์โทร, รูปโปรไฟล์)",
    "SuProgram.java": "Entity ตารางรหัสโปรแกรม/หน้าจอทั้งหมดในระบบ (PMRT01, PMDT01 ฯลฯ)",
    "SuTask.java": "Entity ตารางงานระดับระบบ",
    "SuUpload.java": "Entity ตาราง Metadata ของไฟล์ที่อัปโหลด (ชื่อไฟล์, Bucket S3, ขนาด, MIME Type)",
    "SuUserBusiness.java": "Entity ตารางผูกความสัมพันธ์ระหว่างผู้ใช้งานกับองค์กร (User-Business Mapping)",
    "SuUserBusinessRole.java": "Entity ตารางกำหนด Role ให้กับผู้ใช้งานในองค์กรนั้นๆ",
    "SuUserTask.java": "Entity ตารางมอบหมายงานระบบให้ผู้ใช้",
    "SuVerify.java": "Entity ตารางโทเค็นสำหรับการยืนยันตัวตนหรือรีเซ็ตรหัสผ่าน",

    # Services (Interfaces & Implementations)
    "AiBatchGeneratorService.java": "Interface บริการสร้าง Mockup Data สำหรับทดสอบระบบ",
    "AiBatchGeneratorServiceImpl.java": "Class ให้บริการสร้างข้อมูลจำลองโครงการ ลูกค้า Requirement และ Task แบบ Batch ด้วย AI",
    "AiMemberPicker.java": "Helper ช่วยคัดเลือกสมาชิกทีมที่เหมาะสมกับทักษะของงาน Task",
    "AiModelConfigService.java": "Interface บริการจัดการการตั้งค่าโมเดล AI",
    "AiModelConfigServiceImpl.java": "Class บันทึก แก้ไข และทดสอบการเชื่อมต่อ API ของโมเดล AI (Claude, Gemini)",
    "AiModuleRegistry.java": "Registry รวมรายชื่อและ Prompt Template สำหรับโมดูล AI ในระบบ",
    "AiNavigatorService.java": "Interface บริการ AI แนะนำการใช้งานและค้นหาหน้าจอระบบ",
    "AiNavigatorServiceImpl.java": "Class วิเคราะห์คำถามของผู้ใช้แล้วแนะนำหน้าจอหรือฟังก์ชันที่เกี่ยวข้องในระบบ",
    "AiPhaseWbsService.java": "Service ช่วยสร้างโครงสร้าง Phase, Milestone และ WBS ด้วย AI อัตโนมัติ",
    "AiProjectPipelineJobService.java": "Service ควบคุม Job Background Pipeline ประมวลผลแปลง Requirement เป็น WBS และ Spec",
    "AiProjectPipelineService.java": "Interface ควบคุม Pipeline งาน AI อัตโนมัติ",
    "AiProjectPipelineServiceImpl.java": "Class จัดการคิวงาน ตรวจสอบสถานะ และรับผลลัพธ์ของ AI Project Pipeline",
    "AiScopeContextService.java": "Service สกัดและเตรียม Context ขอบเขตของโครงการส่งต่อให้กับ AI Prompt",
    "AiSqlGeneratorService.java": "Interface บริการแปลง ER Diagram เป็นคำสั่ง SQL DDL",
    "AiSqlGeneratorServiceImpl.java": "Class วิเคราะห์ตาราง ฟิลด์ และความสัมพันธ์จาก ER Diagram แล้วสร้างคำสั่ง SQL CREATE TABLE สำหรับ PostgreSQL/MySQL",
    "ApprovalFlowService.java": "Interface บริการตั้งค่าขั้นตอน Flow การอนุมัติ",
    "ApprovalFlowServiceImpl.java": "Class จัดการเพิ่ม แก้ไข ลบขั้นตอนการอนุมัติ และตรวจสอบสิทธิ์ผู้อนุมัติในแต่ละ Step",
    "ApprovalNotificationService.java": "Interface บริการส่งการแจ้งเตือนงานอนุมัติ",
    "ApprovalNotificationServiceImpl.java": "Class ส่ง Notification และอีเมลแจ้งผู้อนุมัติเมื่อมีคำขอใหม่หรือเมื่อถึงคิวของตน",
    "ApprovalService.java": "Interface บริการแกนหลักของกระบวนการอนุมัติเอกสาร",
    "ApprovalServiceImpl.java": "Class ขนาดใหญ่ควบคุม State Machine การอนุมัติ (ยื่นขอ, อนุมัติ, ตีกลับ, ยกเลิก) ของทุกโมดูลในระบบ",
    "AuditLogService.java": "Interface บริการบันทึกและสืบค้นประวัติ Audit Log",
    "AuditLogServiceImpl.java": "Class จัดการดึงรายการประวัติการใช้งานระบบ พร้อมฟิลเตอร์ค้นหาผู้ใช้ วันที่ และ Action",
    "BulkDocumentExportService.java": "Service ส่งออกเอกสารโครงการจำนวนมากแบบเป็นชุด (Bulk Export)",
    "BusinessAccessService.java": "Interface บริการตรวจสอบสิทธิ์การเข้าถึงองค์กร",
    "BusinessAccessServiceImpl.java": "Class ตรวจสอบความถูกต้องว่าผู้ใช้ปัจจุบันมีสิทธิ์เรียกดูหรือแก้ไขข้อมูลใน Business Unit นั้นหรือไม่",
    "BusinessInviteService.java": "Interface บริการเชิญผู้ใช้เข้าร่วมองค์กร",
    "BusinessInviteServiceImpl.java": "Class สร้างคำเชิญ ส่งอีเมลโทเค็น และตรวจสอบการตอบรับคำเชิญเข้าร่วมองค์กร",
    "ChangeRequestService.java": "Interface บริการจัดการคำขอเปลี่ยนแปลงขอบเขตงาน (CR)",
    "ChangeRequestServiceImpl.java": "Class ควบคุมวงจรชีวิตของ CR คำนวณ Manday และค่าใช้จ่ายที่เปลี่ยนแปลง",
    "ComboboxService.java": "Interface บริการข้อมูล Dropdown ทั่วไประบบ",
    "ComboboxServiceImpl.java": "Class ดึงข้อมูล Master Data ในรูปแบบ Key-Value เพื่อป้อนให้กับ ComboBox ในหน้าจอ Frontend",
    "ContractGeneratorService.java": "Service สร้างข้อมูลตั้งต้นของสัญญาโครงการอัตโนมัติ",
    "ContractLifecycleService.java": "Service ตรวจสอบและอัปเดตสถานะของสัญญาตามเงื่อนไขวันเวลา",
    "CurrentUserService.java": "Interface บริการดึงข้อมูลผู้ใช้งานปัจจุบัน",
    "CurrentUserServiceImpl.java": "Class สกัด Username, Email, BusinessId และ Roles จาก Spring Security Context",
    "DeliveryGeneratorService.java": "Service ช่วยสร้างข้อมูลร่างงวดการส่งมอบงานโครงการ",
    "DiscussionService.java": "Interface บริการกระดานพูดคุยในโครงการ",
    "DiscussionServiceImpl.java": "Class เพิ่ม ตอบกลับ และดึงความคิดเห็นในกระดาน Discussion ของโครงการ",
    "DocumentLivePreviewService.java": "Service แสดงตัวอย่างเอกสารแบบ Live Preview แบบ Real-time",
    "DocumentPdfExporters.java": "Helper จัดการการแปลงโครงสร้างเอกสารโครงการเป็นไฟล์ PDF",
    "DocumentVersionService.java": "Interface บริการบันทึกและเปรียบเทียบเวอร์ชันเอกสาร",
    "DocumentVersionServiceImpl.java": "Class บันทึก JSON Snapshot ทุกการเปลี่ยนแปลง ค้นหาประวัติ และคำนวณ Diff ระหว่างเวอร์ชัน",
    "EditSessionService.java": "Interface บริการจัดการ Concurrency Edit Session",
    "EditSessionServiceImpl.java": "Class สร้าง Lock Session เมื่อเปิดแก้ไขเอกสาร ตรวจจับ Heartbeat และปลด Lock เมื่อผู้ใช้ปิดหน้าจอ",
    "ErXmlParserServiceImpl.java": "Service แปลงไฟล์ XML จากโปรแกรมออกแบบฐานข้อมูล เข้าสู่โครงสร้าง ER Diagram ในระบบ",
    "FileStorageService.java": "Interface บริการจัดเก็บไฟล์ในระบบ Object Storage",
    "FileStorageServiceImpl.java": "Class อัปโหลด ตรวจสอบประเภท/ขนาดไฟล์ ดาวน์โหลด และลบไฟล์บน SeaweedFS S3",
    "GlobalSearchService.java": "Interface บริการค้นหาข้อมูลแบบครอบคลุมทั้งระบบ (Global Search)",
    "GlobalSearchServiceImpl.java": "Class ค้นหาคำค้นหาครอบคลุมทุกโมดูล (โครงการ ลูกค้า สัญญา Requirement และเอกสาร)",
    "ImpactAnalysisService.java": "Interface บริการวิเคราะห์ผลกระทบของ Change Request",
    "ImpactAnalysisServiceImpl.java": "Class วิเคราะห์ความเชื่อมโยง Traceability Matrix เพื่อประเมินผลกระทบต่อ Requirement และ Task เมื่อมี CR",
    "InvoiceGeneratorService.java": "Service ช่วยสร้างร่างใบแจ้งหนี้จากงวดงานที่ส่งมอบแล้ว",
    "MaTicketGeneratorService.java": "Service ช่วยสร้างรหัสและข้อมูลเริ่มต้นของ Ticket แจ้งซ่อม MA",
    "MailService.java": "Interface บริการส่งอีเมล",
    "MailServiceImpl.java": "Class ส่งอีเมลแจ้งเตือนผ่าน JavaMailSender และเชื่อมต่อ SMTP",
    "MenuService.java": "Interface บริการดึงรายการเมนูระบบตามสิทธิ์",
    "MenuServiceImpl.java": "Class คัดกรองและส่งมอบโครงสร้างเมนูหน้าจอที่สอดคล้องกับ Role ของผู้ใช้ปัจจุบัน",
    "MessageI18nCache.java": "Interface แคชข้อความแปลภาษา",
    "MessageI18nCacheImpl.java": "Class แคชข้อความระบบหลายภาษาใน Memory เพื่อประสิทธิภาพในการดึงข้อมูล",
    "MessageService.java": "Interface บริการดึงข้อความแจ้งเตือนและระบบสื่อสาร",
    "MilestoneService.java": "Interface บริการจัดการ Milestone",
    "MilestoneServiceImpl.java": "Class CRUD และติดตามสถานะความสำเร็จของ Milestone ในแต่ละเฟส",
    "NameUtilityService.java": "Interface บริการจัดรูปแบบชื่อ",
    "NameUtilityServiceImpl.java": "Class ฟังก์ชันช่วยเหลือจัดรูปแบบชื่อ-นามสกุล และชื่อโครงการ",
    "PhaseService.java": "Interface บริการจัดการเฟสงานโครงการ",
    "PhaseServiceImpl.java": "Class CRUD เฟสงาน และคำนวณสัดส่วนความก้าวหน้าของแต่ละเฟส",
    "PmAiProviderService.java": "Interface บริการเชื่อมต่อ AI Provider",
    "PmAiProviderServiceImpl.java": "Class จัดการเรียกใช้งาน API ของโมเดล AI แต่ละค่าย (Anthropic Claude, Google Gemini)",
    "PmBugService.java": "Interface บริการจัดการบั๊กของระบบ",
    "PmBugServiceImpl.java": "Class บันทึก แจกจ่ายงาน และติดตามการแก้ไข Bug ที่พบในโครงการ",
    "PmChangeRequestExportService.java": "Interface ส่งออกรายงาน Change Request",
    "PmChangeRequestExportServiceImpl.java": "Class เตรียมข้อมูลสรุปคำขอ CR เพื่อส่งให้ Report Service ออกรายงาน",
    "PmCustomerContractExportService.java": "Interface ส่งออกรายงานสัญญาโครงการ",
    "PmCustomerContractExportServiceImpl.java": "Class ดึงข้อมูลสัญญา รายละเอียดงวดเงิน และเงื่อนไขเพื่อออกเอกสารสัญญา",
    "PmCustomerContractService.java": "Interface บริการจัดการสัญญาลูกค้า",
    "PmCustomerContractServiceImpl.java": "Class ควบคุมวงจรชีวิตสัญญา มูลค่างาน และการต่อสัญญาโครงการ",
    "PmCustomerProjectExportService.java": "Interface ส่งออกรายงานสรุปโครงการ",
    "PmCustomerProjectExportServiceImpl.java": "Class รวบรวมข้อมูลโครงการ ทีมงาน และสถานะงานเพื่อพิมพ์รายงานสรุป",
    "PmCustomerProjectService.java": "Interface บริการจัดการโครงการ",
    "PmCustomerProjectServiceImpl.java": "Class จัดการโครงการ ตรวจสอบเงื่อนไขวันเวลา และสถิติภาพรวม",
    "PmCustomerService.java": "Interface บริการจัดการข้อมูลลูกค้า",
    "PmCustomerServiceImpl.java": "Class CRUD ข้อมูลลูกค้า บริษัทคู่ค้า และผู้ติดต่อ",
    "PmDashboardOrgService.java": "Interface บริการแดชบอร์ดระดับองค์กร",
    "PmDashboardOrgServiceImpl.java": "Class คำนวณสถิติภาพรวมโครงการและงบประมาณระดับองค์กร",
    "PmDeliveryExportService.java": "Interface ส่งออกรายงานการส่งมอบงาน",
    "PmDeliveryExportServiceImpl.java": "Class เตรียมข้อมูลใบส่งมอบงานและ Checklist ตรวจรับ",
    "PmDeliveryService.java": "Interface บริการจัดการงวดการส่งมอบ",
    "PmDeliveryServiceImpl.java": "Class จัดการงวดส่งมอบ ตรวจสอบ Checklist และเปลี่ยนสถานะงวดงาน",
    "PmDesignReviewExportService.java": "Service ส่งออกรายงานสรุปการตรวจทานการออกแบบ",
    "PmDesignReviewService.java": "Interface บริการตรวจทานการออกแบบ",
    "PmDesignReviewServiceImpl.java": "Class จัดการรอบการตรวจทาน UI/Architecture และรวบรวมความคิดเห็นของผู้ตรวจ",
    "PmDiagramChatService.java": "Interface บริการแชทปรึกษาเรื่องไดอะแกรมกับ AI",
    "PmDiagramChatServiceImpl.java": "Class รับคำถามเกี่ยวกับโครงสร้างฐานข้อมูลและ DFD ส่งให้ AI วิเคราะห์และตอบคำถาม",
    "PmDiagramExportService.java": "Interface บริการส่งออกรูปภาพไดอะแกรม",
    "PmDiagramExportServiceImpl.java": "Class ส่งออก DFD และ ER Diagram ในรูปแบบรูปภาพหรือไฟล์เอกสาร",
    "PmDiagramTabService.java": "Interface บริการจัดการแท็บไดอะแกรม",
    "PmDiagramTabServiceImpl.java": "Class บันทึก Node, Edge, สี, ข้อความ และพิกัดของไดอะแกรมลงฐานข้อมูล",
    "PmInvoiceExportService.java": "Interface ส่งออกรายงานใบแจ้งหนี้",
    "PmInvoiceExportServiceImpl.java": "Class เตรียมข้อมูลใบแจ้งหนี้และรายการย่อยเพื่อออกเป็น PDF",
    "PmInvoiceService.java": "Interface บริการจัดการใบแจ้งหนี้",
    "PmInvoiceServiceImpl.java": "Class ออกใบแจ้งหนี้ ติดตามยอดค้างชำระ และคำนวณภาษี",
    "PmMaTicketExportService.java": "Interface ส่งออกรายงานงานแจ้งซ่อม MA",
    "PmMaTicketExportServiceImpl.java": "Class สรุปประวัติ Ticket การแจ้งซ่อมและการแก้ไขเพื่อพิมพ์รายงานส่งลูกค้า",
    "PmMaTicketService.java": "Interface บริการจัดการ Ticket งาน MA",
    "PmMaTicketServiceImpl.java": "Class เปิด Ticket มอบหมายงาน ติดตาม SLA และบันทึกผลการซ่อม",
    "PmPaymentService.java": "Interface บริการบันทึกการรับชำระเงิน",
    "PmPaymentServiceImpl.java": "Class บันทึกหลักฐานการจ่ายเงิน อัปเดตยอดคงเหลือในใบแจ้งหนี้",
    "PmProjectDashboardService.java": "Interface บริการแดชบอร์ดโครงการ",
    "PmProjectDashboardServiceImpl.java": "Class คำนวณดัชนีชี้วัดความคืบหน้า (Burn-down, Task Status) ของโครงการนั้นๆ",
    "PmRequirementExportService.java": "Interface ส่งออกเอกสารความต้องการระบบ",
    "PmRequirementExportServiceImpl.java": "Class เตรียมข้อมูล Software Requirement Specification (SRS) เพื่อออกรายงาน",
    "PmRequirementService.java": "Interface บริการจัดการความต้องการระบบ",
    "PmRequirementServiceImpl.java": "Class บันทึก แก้ไข และติดตามสถานะการ Sign-off Requirement จากลูกค้า",
    "PmSpecificationExportService.java": "Interface ส่งออกรายงาน Specification",
    "PmSpecificationExportServiceImpl.java": "Class เตรียมข้อมูลเอกสาร Functional Specification",
    "PmSpecificationService.java": "Interface บริการจัดการ Specification",
    "PmSpecificationServiceImpl.java": "Class จัดทำสเปก ผูก Data Field Mapping และคำนวณ Manday",
    "PmTestCaseService.java": "Interface บริการจัดการเคสทดสอบ",
    "PmTestCaseServiceImpl.java": "Class จัดการเคสทดสอบ บันทึกผล Pass/Fail และผูกโยงกับ Bug",
    "PmTestScenarioService.java": "Interface บริการจัดการ Test Scenario",
    "PmTestScenarioServiceImpl.java": "Class ควบคุมกลุ่มการทดสอบตามฟังก์ชันงาน",
    "PmUatExportService.java": "Interface ส่งออกเอกสารผลการทดสอบ UAT",
    "PmUatExportServiceImpl.java": "Class สร้างเอกสารรายงานผลการทดสอบ UAT สำหรับให้ลูกค้าเซ็นรับรอง",
    "PmUserManualExportService.java": "Interface ส่งออกคู่มือการใช้งาน",
    "PmUserManualExportServiceImpl.java": "Class รวบรวมหัวข้อ รูปภาพ และเนื้อหาจัดทำเป็นเล่มคู่มือ PDF",
    "PmUserManualService.java": "Interface บริการจัดการคู่มือผู้ใช้",
    "PmUserManualServiceImpl.java": "Class CRUD บทเรียนและเนื้อหาคู่มือการใช้งานระบบ",
    "ProfileService.java": "Interface บริการจัดการโปรไฟล์ส่วนบุคคล",
    "ProfileServiceImpl.java": "Class อัปเดตข้อมูลผู้ใช้ เปลี่ยนรหัสผ่าน และจัดการรูปโปรไฟล์",
    "ProgramAccessCache.java": "Interface แคชสิทธิ์การเข้าถึงหน้าจอ",
    "ProgramAccessCacheImpl.java": "Class เก็บแคชสิทธิ์ของ Role ใน Memory เพื่อให้ตรวจสิทธิ์หน้าจอได้อย่างรวดเร็ว",
    "ProgramAccessService.java": "Interface ตรวจสอบสิทธิ์การเข้าถึงหน้าจอ",
    "ProgramAccessServiceImpl.java": "Class ตรวจสอบว่า Role ของผู้ใช้มีสิทธิ์เข้าถึงหน้าจอนั้นๆ หรือไม่",
    "ProjectGeneratorService.java": "Service ช่วยสร้างข้อมูลโครงการเริ่มต้นและเทมเพลตมาตรฐาน",
    "RequirementExportService.java": "Service รวบรวมและจัดฟอร์แมตข้อมูล Requirement สำหรับออกรายงาน",
    "RequirementGeneratorService.java": "Service ช่วยสร้างรายการ Requirement ตัวอย่างตามประเภทธุรกิจ",
    "SpecificationGeneratorService.java": "Service ช่วยแปลง Requirement ให้กลายเป็น Specification ร่างแรก",
    "SuBusinessService.java": "Interface บริการจัดการข้อมูล Business Unit",
    "SuBusinessServiceImpl.java": "Class จัดการเพิ่มและแก้ไขข้อมูลองค์กร/หน่วยงาน",
    "SuUserBusinessMemberService.java": "Interface จัดการสมาชิกใน Business Unit",
    "SuUserBusinessMemberServiceImpl.java": "Class จัดการสมาชิก เชิญ และกำหนด Role ภายในองค์กร",
    "SuUserBusinessService.java": "Interface จัดการการผูกผู้ใช้กับองค์กร",
    "SuUserBusinessServiceImpl.java": "Class จัดการความสัมพันธ์ระหว่าง User กับ Business Unit ต่างๆ",
    "TaskService.java": "Interface บริการจัดการงาน Task รายบุคคล",
    "TaskServiceImpl.java": "Class จัดการ Task, มอบหมายงาน, บันทึกชั่วโมงทำงาน และเปลี่ยนสถานะงาน",
    "TestCaseGeneratorService.java": "Service สร้าง Test Case ตัวอย่างอัตโนมัติจาก Requirement และ Spec",
    "TestScenarioGeneratorService.java": "Service สร้างกลุ่ม Test Scenario ร่างแรกอัตโนมัติ",
    "ThaiCustomerGeneratorHelper.java": "Helper สร้างข้อมูลจำลองลูกค้า บริษัท และที่อยู่ภาษาไทยสำหรับการทดสอบ",
    "TraceLinkService.java": "Interface บริการจัดการ Traceability Matrix",
    "TraceLinkServiceImpl.java": "Class สร้างและจัดการเส้นทางความเชื่อมโยง Requirement -> Spec -> Task -> Test Case",
    "UnauthorizedException.java": "Exception ที่ถูกโยนเมื่อผู้ใช้ไม่มีสิทธิ์เข้าถึงทรัพยากรนั้นๆ",
    "UserManualGeneratorService.java": "Service ช่วยสร้างโครงร่างคู่มือการใช้งานอัตโนมัติจาก Spec",
    "UserSessionTracker.java": "Interface ติดตาม Session ผู้ใช้งาน",
    "UserSessionTrackerImpl.java": "Class ติดตามสถานะ Active/Idle ของผู้ใช้งานในระบบแบบ Real-time",
    "VerifyService.java": "Interface บริการตรวจสอบและยืนยันตัวตน",
    "VerifyServiceImpl.java": "Class ตรวจสอบ Token การยืนยันอีเมลและการรีเซ็ตรหัสผ่าน",
    "WorkPackageService.java": "Interface บริการจัดการ Work Package",
    "WorkPackageServiceImpl.java": "Class จัดการกลุ่มงานย่อยในระดับ Work Package ภายใต้ Phase โครงการ"
}

# Collect all files
all_files = []
for root, dirs, files in os.walk(root_dir):
    norm_root = os.path.normpath(root).lower()
    if "\\controller" in norm_root or "\\dto" in norm_root or "\\repository" in norm_root:
        continue
    for f in sorted(files):
        if f.endswith(".java"):
            fp = os.path.join(root, f)
            all_files.append((f, fp))

print(f"Total files found: {len(all_files)}")

# Group files by section
sections = [
    ("1. คลาสเริ่มต้นระบบ (Application Entry Point - 1 ไฟล์)", lambda f, p: f == "SicApiApplication.java"),
    ("2. แพ็กเกจ `config` (โครงสร้างพื้นฐาน & การตั้งค่าระบบ - 16 ไฟล์)", lambda f, p: "\\config\\" in p.lower()),
    ("3. แพ็กเกจ `Interceptor` (ตัวดักจับ Request & Protocol - 3 ไฟล์)", lambda f, p: "\\interceptor\\" in p.lower()),
    ("4. แพ็กเกจ `exception` (การจัดการข้อผิดพลาด - 3 ไฟล์)", lambda f, p: "\\exception\\" in p.lower()),
    ("5. แพ็กเกจ `websocket` (การสื่อสาร Real-time - 1 ไฟล์)", lambda f, p: "\\websocket\\" in p.lower()),
    ("6. แพ็กเกจ `scheduler` (งานประมวลผลตามเวลา Background Jobs - 2 ไฟล์)", lambda f, p: "\\scheduler\\" in p.lower()),
    ("7. แพ็กเกจ `util` (คลาสช่วยเหลือส่วนกลาง - 17 ไฟล์)", lambda f, p: "\\util\\" in p.lower()),
    ("8. แพ็กเกจ `entity/base` (โครงสร้าง Entity แม่แบบ - 2 ไฟล์)", lambda f, p: "\\entity\\base\\" in p.lower()),
    ("9. แพ็กเกจ `entity/enums` (ค่าคงที่ Enum ในระบบ - 14 ไฟล์)", lambda f, p: "\\entity\\enums\\" in p.lower()),
    ("10. แพ็กเกจ `entity/db` (ตารางข้อมูลพื้นฐาน Master Data - 10 ไฟล์)", lambda f, p: "\\entity\\db\\" in p.lower()),
    ("11. แพ็กเกจ `entity/ex` (ตารางตัวอย่างและ Storage Ref - 2 ไฟล์)", lambda f, p: "\\entity\\ex\\" in p.lower()),
    ("12. แพ็กเกจ `entity/pm` (ตารางงานโครงการ & วงจร SDLC - 45 ไฟล์)", lambda f, p: "\\entity\\pm\\" in p.lower()),
    ("13. แพ็กเกจ `entity/su` (ตารางระบบ ผู้ใช้งาน สิทธิ์ และแชท - 21 ไฟล์)", lambda f, p: "\\entity\\su\\" in p.lower()),
    ("14. แพ็กเกจ `service` (Interface สำหรับ Business Logic - 71 ไฟล์)", lambda f, p: "\\service\\" in p.lower() and "\\service\\impl\\" not in p.lower()),
    ("15. แพ็กเกจ `service/impl` (Class ประมวลผล Logic & Generator Helpers - 90 ไฟล์)", lambda f, p: "\\service\\impl\\" in p.lower()),
]

# Generate Markdown
md_lines = []
md_lines.append("# คู่มือโครงสร้างและหน้าที่ไฟล์ Backend ทั้งหมด (sic-spring)")
md_lines.append("> **สำหรับเตรียมตัวตรวจโปรเจกต์และตอบคำถามอาจารย์แบบครบถ้วน 100%**  ")
md_lines.append(f"> *รวบรวมไฟล์จริงใน Backend ทั้งหมดจำนวน **{len(all_files)} ไฟล์** (ไม่รวม DTO, Controller, Repository)*\n")
md_lines.append("---\n")

md_lines.append("## สรุปภาพรวมจำนวนไฟล์ในแต่ละโฟลเดอร์\n")
md_lines.append("| โฟลเดอร์ / แพ็กเกจ | จำนวนไฟล์ | หน้าที่โดยย่อ |")
md_lines.append("|---|:---:|---|")
md_lines.append("| `com.softinter.sicapi` (Root) | 1 | คลาสหลักเริ่มระบบ Spring Boot และโหลด `.env` |")
md_lines.append("| `config` | 16 | การตั้งค่า Security, CORS, S3, WebSocket, Flyway, AOP |")
md_lines.append("| `Interceptor` | 3 | ดักจับ Business Context, WebSocket Token, ภาษา |")
md_lines.append("| `exception` | 3 | Global Exception Handling และ Custom Exceptions |")
md_lines.append("| `websocket` | 1 | Real-time Chat & WebRTC Call Signaling |")
md_lines.append("| `scheduler` | 2 | Background Cron Jobs (Approval Timeout, Contract Alert) |")
md_lines.append("| `util` | 17 | ฟังก์ชันช่วยเหลือ จัดทำรายงาน, รวม PDF, คำนวณ, Diff, Snapshot |")
md_lines.append("| `entity/base` | 2 | Base Entity สำหรับ Timestamp และ Business Id |")
md_lines.append("| `entity/enums` | 14 | Enums กำหนดสถานะและประเภทข้อมูลต่างๆ ในระบบ |")
md_lines.append("| `entity/db` | 10 | Master Data ข้อมูลที่อยู่ จังหวัด อำเภอ และพารามิเตอร์ |")
md_lines.append("| `entity/ex` | 2 | โครงสร้างตัวอย่างและ Upload Reference |")
md_lines.append("| `entity/pm` | 45 | ตารางข้อมูลโครงการทั้งหมดตามวงจร SDLC |")
md_lines.append("| `entity/su` | 21 | ตารางผู้ใช้ สิทธิ์ บทบาท ห้องแชท และ Audit Log |")
md_lines.append("| `service` | 71 | Interface กำหนด Business Contract ทุกฟังก์ชัน |")
md_lines.append("| `service/impl` | 90 | Implementation ประมวลผล Business Logic, Generator และ Helper |")
md_lines.append(f"| **รวมทั้งสิ้น** | **{len(all_files)}** | **ครบถ้วนทุกไฟล์ในระบบ** |\n")
md_lines.append("---\n")

total_processed = 0

for sec_title, matcher in sections:
    matched = [(f, p) for f, p in all_files if matcher(f, p)]
    total_processed += len(matched)
    
    md_lines.append(f"## {sec_title}\n")
    md_lines.append("| ลำดับ | ชื่อไฟล์ | หน้าที่และการทำงานโดยละเอียด |")
    md_lines.append("|:---:|---|---|")
    
    for i, (f, p) in enumerate(sorted(matched, key=lambda x: x[0]), 1):
        desc = DESCRIPTIONS.get(f, "ประมวลผลการทำงานส่วนของ " + f.replace(".java", ""))
        md_lines.append(f"| {i} | `{f}` | {desc} |")
    
    md_lines.append("\n---\n")

# Append defense Q&A
md_lines.append("""## 16. แนวทางการตอบคำถามอาจารย์เมื่อตรวจโปรเจกต์ (Cheat Sheet)

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
""")

output_content = "\n".join(md_lines)
with open(target_md, "w", encoding="utf-8") as f:
    f.write(output_content)

print(f"Successfully generated {target_md} with {total_processed} files documented!")
