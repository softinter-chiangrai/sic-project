# -*- coding: utf-8 -*-
r"""
Full Quiz Application Builder for SIC Backend Presentation Defense.
Generates an interactive, beautiful, offline-ready single-file HTML app:
c:/Users/lovew/Student/Project-Main/Java-intern/sic-project/sic_backend_quiz_game.html
"""
import os
import json

WORKSPACE = r"c:\Users\lovew\Student\Project-Main\Java-intern\sic-project"

def build_quiz():
    parsed_json_path = os.path.join(WORKSPACE, "parsed_backend_files.json")
    with open(parsed_json_path, "r", encoding="utf-8") as f:
        file_records = json.load(f)

    print(f"Loaded {len(file_records)} file records.")

    # Additional file records for repositories and entities to ensure 100% coverage
    additional_files = [
        {"fileName": "PmCustomerRepository.java", "className": "PmCustomerRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Spring Data JPA Repository จัดการข้อมูลลูกค้าและค้นหาตามบริษัท (businessId)"},
        {"fileName": "PmCustomerProjectRepository.java", "className": "PmCustomerProjectRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการข้อมูลโครงการ ค้นหาโครงการตามลูกค้า และดึงสถิติความคืบหน้า"},
        {"fileName": "PmCustomerContractRepository.java", "className": "PmCustomerContractRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการข้อมูลสัญญาจ้างและสัญญา MA ตรวจสอบวันหมดอายุสัญญา"},
        {"fileName": "PmRequirementRepository.java", "className": "PmRequirementRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการข้อกำหนดและความต้องการระบบ ค้นหาตามโปรเจกต์และสถานะอนุมัติ"},
        {"fileName": "PmSpecificationRepository.java", "className": "PmSpecificationRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการสเปกระบบเชิงเทคนิค เชื่อมโยงกับ Requirement และแท็บไดอะแกรม"},
        {"fileName": "PmTaskRepository.java", "className": "PmTaskRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการ Task งานพัฒนา ค้นหาตาม WBS Phase, Milestone และสถานะ Kanban"},
        {"fileName": "PmTestCaseRepository.java", "className": "PmTestCaseRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการเคสทดสอบ ผลการรัน Pass/Fail และเชื่อมโยงกับ Bug"},
        {"fileName": "PmBugRepository.java", "className": "PmBugRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการข้อผิดพลาดและบั๊กในระบบ ติดตามสถานะการแก้ไข (Defect Tracking)"},
        {"fileName": "PmApprovalRepository.java", "className": "PmApprovalRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการคำขออนุมัติหลัก (Header) ตรวจสอบประวัติและสถานะคำขอปัจจุบัน"},
        {"fileName": "PmApprovalFlowRepository.java", "className": "PmApprovalFlowRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการแม่แบบ Flow การอนุมัติตามประเภทเอกสารและ businessId"},
        {"fileName": "PmApprovalStepStatusRepository.java", "className": "PmApprovalStepStatusRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการสถานะการอนุมัติรายขั้นตอน ตรวจสอบว่าผู้อนุมัติคนใดอนุมัติแล้วบ้าง"},
        {"fileName": "PmTraceLinkRepository.java", "className": "PmTraceLinkRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดการกราฟความสัมพันธ์ TraceLink พร้อม Native Query Recursive CTE"},
        {"fileName": "ChangeImpactAnalysisRepository.java", "className": "ChangeImpactAnalysisRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository บันทึกผลการวิเคราะห์ผลกระทบเมื่อมีการแก้ไขเอกสารหรือเปิด Change Request"},
        {"fileName": "PmDocumentVersionRepository.java", "className": "PmDocumentVersionRepository", "layer": "Repository", "category": "Data Access Layer (PM)", "description": "Repository จัดเก็บ JSON Snapshot และประวัติการเปลี่ยนแปลงเวอร์ชันของเอกสาร"},
        {"fileName": "SuUserRepository.java", "className": "SuUserRepository", "layer": "Repository", "category": "Data Access Layer (SU)", "description": "Repository จัดการบัญชีผู้ใช้ ค้นหาด้วย Username หรือ Email"},
        {"fileName": "SuBusinessRoleProgramRepository.java", "className": "SuBusinessRoleProgramRepository", "layer": "Repository", "category": "Data Access Layer (SU)", "description": "Repository ตรวจสอบสิทธิ์การเข้าถึงหน้าจอโปรแกรมตาม Role ของผู้ใช้"},
        {"fileName": "SuAuditLogRepository.java", "className": "SuAuditLogRepository", "layer": "Repository", "category": "Data Access Layer (SU)", "description": "Repository บันทึกและค้นหา Audit Trail ประวัติการใช้งานระบบของผู้ใช้"},
        {"fileName": "DbAiModelConfigRepository.java", "className": "DbAiModelConfigRepository", "layer": "Repository", "category": "Data Access Layer (DB)", "description": "Repository จัดเก็บและโหลดค่าคอนฟิกโมเดล AI (Prompt, Temperature, Provider)"},
        {"fileName": "BaseBusinessEntity.java", "className": "BaseBusinessEntity", "layer": "Entity & Enum", "category": "Domain Models (Base)", "description": "คลาสแม่แบบ Entity สำหรับตาราง Multi-Tenant มีคอลัมน์ businessId ควบคุมการแบ่งแยกบริษัท"},
        {"fileName": "BaseEntity.java", "className": "BaseEntity", "layer": "Entity & Enum", "category": "Domain Models (Base)", "description": "คลาสแม่แบบ Entity จัดการเวลาสร้าง (createdDate), ผู้สร้าง (createdBy), เวลาแก้ไข และเวอร์ชัน"},
        {"fileName": "ApprovalStatus.java", "className": "ApprovalStatus", "layer": "Entity & Enum", "category": "Domain Enums", "description": "Enum สถานะการอนุมัติ: PENDING, APPROVED, REJECTED, NEED_REVISION, CANCELLED, EXPIRED, SKIPPED"},
        {"fileName": "ApprovalMode.java", "className": "ApprovalMode", "layer": "Entity & Enum", "category": "Domain Enums", "description": "Enum โหมดการอนุมัติ: CHAIN (เรียงลำดับ), PARALLEL (พร้อมกัน), ANY (ใครก็ได้)"},
        {"fileName": "TraceRelationship.java", "className": "TraceRelationship", "layer": "Entity & Enum", "category": "Domain Enums", "description": "Enum ความสัมพันธ์ TraceLink: DESIGNED_BY, IMPLEMENTED_BY, DOCUMENTED_BY, VERIFIED_BY, FAILED_BY, AFFECTED_BY, RELATED_TO"},
        {"fileName": "PmTraceLink.java", "className": "PmTraceLink", "layer": "Entity & Enum", "category": "Domain Models (PM)", "description": "Entity ตาราง pm_trace_link เก็บกราฟความสัมพันธ์ระหว่างเอกสารต้นทางและปลายทาง"},
        {"fileName": "PmApproval.java", "className": "PmApproval", "layer": "Entity & Enum", "category": "Domain Models (PM)", "description": "Entity ตาราง pm_approval เก็บหัวข้อคำขออนุมัติ สถานะรวม และเอกสารต้นเรื่อง"},
        {"fileName": "PmApprovalStepStatus.java", "className": "PmApprovalStepStatus", "layer": "Entity & Enum", "category": "Domain Models (PM)", "description": "Entity ตาราง pm_approval_step_status เก็บสถานะการอนุมัติของแต่ละบุคคลในแต่ละ Step"},
        {"fileName": "PmCustomerProject.java", "className": "PmCustomerProject", "layer": "Entity & Enum", "category": "Domain Models (PM)", "description": "Entity ตาราง pm_customer_project จัดเก็บรายละเอียดโครงการ รหัสโครงการ วันที่เริ่มต้นและสิ้นสุด"},
        {"fileName": "PmRequirement.java", "className": "PmRequirement", "layer": "Entity & Enum", "category": "Domain Models (PM)", "description": "Entity ตาราง pm_requirement จัดเก็บข้อกำหนดความต้องการ ประเภท และความสำคัญของระบบ"},
        {"fileName": "PmSpecification.java", "className": "PmSpecification", "layer": "Entity & Enum", "category": "Domain Models (PM)", "description": "Entity ตาราง pm_specification จัดเก็บสเปกระบบเชิงเทคนิค สถาปัตยกรรม และตรรกะการทำงาน"}
    ]

    all_files = file_records + additional_files
    print(f"Total merged files: {len(all_files)}")

    # Deep Architecture Workflows for Set 2
    workflows = [
        {
            "id": "W01",
            "topic": "Multi-Tenancy & Request Context Lifecycle",
            "title": "การคัดแยกข้อมูล Multi-Tenant และวงจรชีวิต Request Context",
            "summary": "ทุก HTTP Request ถูกตรวจสอบ Header X-Business-Id โดย BusinessContextInterceptor นำไปเก็บไว้ใน BusinessContextHolder ผ่าน ThreadLocal เพื่อส่งต่อให้ Repository และ Entity จัดการข้อมูลเฉพาะบริษัทของตนเอง และทำการเคลียร์ทิ้งเมื่อจบ Request",
            "steps": [
                "1. Client ส่ง HTTP Request แนบ Header `X-Business-Id`",
                "2. `BusinessContextInterceptor` ดักจับ Request ก่อนเข้า Controller อ่านค่า UUID",
                "3. นำ `businessId` ไปเก็บใน `BusinessContextHolder.setBusinessId()` ซึ่งใช้ `ThreadLocal<UUID>`",
                "4. Controller และ Service เรียกใช้ Repository ในการค้นหาหรือบันทึกข้อมูล",
                "5. Entity ที่สืบทอด `BaseBusinessEntity` ถูกกำหนด `businessId` ตาม ThreadLocal อัตโนมัติ",
                "6. เมื่อ Request ทำงานเสร็จสิ้น Interceptor รัน `afterCompletion()` สั่ง `BusinessContextHolder.clear()` เพื่อป้องกัน Memory Leak ใน Thread Pool"
            ],
            "keyFiles": ["BusinessContextInterceptor.java", "BusinessContextHolder.java", "BaseBusinessEntity.java", "WebConfig.java"],
            "trapQuestion": "ทำไมต้องเคลียร์ ThreadLocal ตอนจบ Request?",
            "defenseTip": "เน้นตอบเรื่อง Tomcat Thread Pooling เพราะ Web Server ใช้เธรดซ้ำ (Thread Reuse) หากไม่เรียก clear() ใน afterCompletion() เธรดนั้นอาจนำค่า businessId เดิมไปใช้กับ Request ของผู้ใช้คนอื่น ซึ่งทำให้เกิดปัญหา Data Leakage ข้าม Tenant ได้"
        },
        {
            "id": "W02",
            "topic": "Security, Keycloak Authentication & Stateless JWT",
            "title": "การพิสูจน์ตัวตนผ่าน Keycloak และการถอดรหัส JWT RS256",
            "summary": "ระบบใช้ Keycloak เป็น Identity Provider โดย Spring Security ตรวจสอบลายเซ็นของ Token ด้วย JWK Set (RS256 Public Key) แบบ Stateless โดยไม่ต้องโทรไปถาม Keycloak ซ้ำทุก Request",
            "steps": [
                "1. ผู้ใช้ล็อกอินผ่านหน้าเว็บไปยัง Keycloak และได้รับ Bearer JWT Access Token",
                "2. Frontend ส่ง Token มาใน Authorization Header (`Bearer <JWT>` )",
                "3. `SecurityConfig` กำหนด SessionCreationPolicy เป็น `STATELESS`",
                "4. Spring Security ถอดรหัสและตรวจสอบลายเซ็นดิจิทัลด้วย Public Key จาก Keycloak JWK Set Endpoint (RS256)",
                "5. ข้อมูลผู้ใช้และสิทธิ์เบื้องต้นถูกบรรจุลงใน `SecurityContextHolder`",
                "6. `AuditorAwareImpl` ดึง Username จาก SecurityContext เพื่อใส่ค่าให้อัตโนมัติใน `@CreatedBy` และ `@LastModifiedBy`"
            ],
            "keyFiles": ["SecurityConfig.java", "AuditorAwareImpl.java", "AuthController.java", "VerifyController.java"],
            "trapQuestion": "ถ้า Keycloak ล่มชั่วขณะ ระบบ Backend ยัง Verify Token ของคนที่ล็อกอินอยู่ได้ไหม?",
            "defenseTip": "ตอบว่าได้ชั่วขณะสำหรับ Token เดิมที่ยังไม่หมดอายุ เพราะ Spring Boot มีการแคช JWK Set Public Key ไว้ในหน่วยความจำ จึงสามารถ Verify Signature ทางคณิตศาสตร์ (RS256) ได้โดยตรงโดยไม่ต้องยิงหา Keycloak ทุกครั้ง"
        },
        {
            "id": "W03",
            "topic": "Program-Level RBAC & Menu Authorization",
            "title": "การควบคุมสิทธิ์ระดับหน้าจอโปรแกรมด้วย @RequireProgram",
            "summary": "เหนือกว่า Role ทั่วไป ระบบ SIC ควบคุมสิทธิ์ละเอียดถึงระดับรหัสโปรแกรม (Program Code) เช่น PMDT04 โดยใช้ Custom Annotation และ Interceptor ตรวจสอบกับตารางสิทธิ์ของบริษัท",
            "steps": [
                "1. พัฒนาการแปะ Annotation `@RequireProgram(\"PMDTxx\")` ไว้เหนือ Controller Method",
                "2. เมื่อมี Request เข้ามา `ProgramPermissionInterceptor` สกัดอ่านค่ารหัสโปรแกรมจาก Method Annotation",
                "3. ดึงบทบาท (Role) ของ User ในบริษัทปัจจุบันจาก Token และ Database",
                "4. `ProgramPermissionService` ค้นหาในตาราง `su_business_role_program` ว่า Role นี้ได้รับสิทธิ์หรือไม่",
                "5. หากมีสิทธิ์ อนุญาตให้เข้าสู่ Business Logic ใน Controller",
                "6. หากไม่มีสิทธิ์ โยน `ProgramPermissionDeniedException` ส่งกลับ HTTP 403 Forbidden ทันที"
            ],
            "keyFiles": ["RequireProgram.java", "ProgramPermissionInterceptor.java", "ProgramPermissionService.java", "SuBusinessRoleProgramRepository.java"],
            "trapQuestion": "ถ้าคนยิง Postman แอบข้ามหน้าจอ UI ไปยิง API ตรงๆ จะถูกบล็อคไหม?",
            "defenseTip": "ตอบอย่างมั่นใจว่าถูกบล็อค 100% เพราะกลไกความปลอดภัยฝังอยู่ที่ Interceptor เลเยอร์ Backend ก่อนถึง Controller Method ไม่ได้พึ่งพาการซ่อนปุ่มบนหน้าบ้านเพียงอย่างเดียว"
        },
        {
            "id": "W04",
            "topic": "Approval Flow State Machine: Submission to Review",
            "title": "กลไกส่งขออนุมัติและการตั้งต้น State Machine",
            "summary": "การส่งเอกสารเข้าสู่กระบวนการอนุมัติ จะตรวจสอบป้องกันการส่งซ้ำ โหลด Flow ตามประเภทเอกสาร สร้างแถวสถานะรายขั้นตอน และปรับสถานะเอกสารต้นทางเป็น In Review",
            "steps": [
                "1. ผู้ใช้กดปุ่ม 'ส่งขออนุมัติ' หน้าเว็บส่ง Request ไปที่ `POST /api/pm/approvals/submit`",
                "2. `ApprovalServiceImpl` ตรวจสอบว่ามีคำขอของเอกสารนี้ที่อยู่ในสถานะ PENDING อยู่แล้วหรือไม่ ป้องกันส่งซ้ำ",
                "3. ค้นหาแม่แบบจาก `pm_approval_flow` โดยจับคู่ `document_type` และ `business_id`",
                "4. สร้างแถวหลัก `pm_approval` และแตกรายการขั้นตอนลงใน `pm_approval_step_status`",
                "5. ตรวจสอบว่า Requester มีชื่ออยู่ใน Step ใดหรือไม่ หากมีจะทำ Auto-Approve ขั้นตอนของตนทันที",
                "6. ปรับสถานะเอกสารต้นทาง (Requirement/Spec/Contract) เป็น 'รออนุมัติ / In Review'",
                "7. `ApprovalNotificationServiceImpl` ส่ง In-app Notification แจ้งเตือนไปยังผู้อนุมัติขั้นตอนแรก"
            ],
            "keyFiles": ["ApprovalServiceImpl.java", "PmApprovalController.java", "PmApprovalFlowRepository.java", "PmApprovalStepStatusRepository.java"],
            "trapQuestion": "ถ้าผู้ส่งเอกสารเป็นผู้อนุมัติขั้นที่ 1 เอง ระบบจะให้เขากดอนุมัติตัวเองซ้ำไหม?",
            "defenseTip": "ตอบว่าระบบมีกลไก Requester Auto-Approve ตรวจสอบ Username ของผู้ส่ง หากตรงกับผู้อนุมัติในขั้นตอน ระบบจะปรับสถานะขั้นนั้นเป็น APPROVED ให้อัตโนมัติและส่งงานต่อให้ขั้นถัดไปทันที เพื่อลด Redundant Work"
        },
        {
            "id": "W05",
            "topic": "Approval Flow Execution: Modes & Transitions",
            "title": "โหมดการอนุมัติ (CHAIN, PARALLEL, ANY) และการประมวลผลผลลัพธ์",
            "summary": "ระบบรองรับ 3 โหมดการอนุมัติ และควบคุมทิศทางการเปลี่ยนสถานะ (State Transition) ตามผลการตัดสินใจของผู้อนุมัติอย่างเคร่งครัด",
            "steps": [
                "1. โหมด CHAIN: เรียงลำดับตามขั้นตอน 1 -> 2 -> 3 ต้องผ่านทีละขั้น",
                "2. โหมด PARALLEL: แจ้งเตือนผู้อนุมัติทุกคนพร้อมกัน ทุกคนต้องกด Approve ครบคำขอจึงจะสมบูรณ์",
                "3. โหมด ANY: ใครคนใดคนหนึ่งในกลุ่มกด Approve ถือว่าผ่านคำขอนั้นทันที",
                "4. กรณีผู้อนุมัติกด APPROVE: ตรวจสอบว่าครบเงื่อนไขของ Flow หรือยัง หากครบจะเข้าสู่กระบวนการ Finalize",
                "5. กรณีผู้อนุมัติกด REJECT: คำขอถูกปิดสถานะเป็น REJECTED ทันที และสถานะเอกสารต้นทางกลับเป็น Draft",
                "6. กรณีผู้อนุมัติกด NEED_REVISION: บันทึกเหตุผลที่ต้องแก้ สถานะเอกสารกลับเป็น Draft เพื่อให้ผู้สร้างแก้ไขและส่งใหม่"
            ],
            "keyFiles": ["ApprovalServiceImpl.java", "ApprovalMode.java", "ApprovalStatus.java", "PmApprovalLogRepository.java"],
            "trapQuestion": "ถ้าในโหมด CHAIN มีคนกด REJECT ที่ขั้นที่ 2 ผู้อนุมัติขั้นที่ 3 จะยังเห็นงานไหม?",
            "defenseTip": "ตอบว่าไม่เห็น เพราะการ REJECT จะ Termination คำขอทันที สถานะภาพรวมจะกลายเป็น REJECTED และเอกสารจะถูกส่งกลับไปให้ Requester แก้ไขทันที ไม่มีการส่งต่องานไปข้างหน้า"
        },
        {
            "id": "W06",
            "topic": "Approval Finalization, Document Lock & Snapshotting",
            "title": "การสิ้นสุดการอนุมัติ การล็อคเอกสาร และการทำ Snapshot เวอร์ชัน",
            "summary": "เมื่อคำขออนุมัติผ่านครบทุกเงื่อนไข ระบบจะทำการ Finalize ปรับสถานะเอกสาร ล็อคป้องกันการแก้ไขโดยตรง และบันทึก JSON Snapshot ลงในประวัติเวอร์ชันอย่างปลอดภัย",
            "steps": [
                "1. `ApprovalServiceImpl.isApprovalComplete()` คืนค่า true",
                "2. อัปเดตสถานะใน `pm_approval` เป็น APPROVED พร้อมบันทึก Final Approver และเวลาเสร็จสิ้น",
                "3. ปรับสถานะของเอกสารต้นเรื่องเป็น 'อนุมัติแล้ว / Approved'",
                "4. ทำการ Document Lock: เอกสารถูกล็อค ห้ามแก้ไขผ่านหน้าจอปกติ (หากส่ง PUT จะโดน `DocumentLockedException`)",
                "5. เรียก `JsonSnapshotHelper` แปลงข้อมูล Entity ทั้งหมดของเอกสารเป็น JSON String",
                "6. บันทึก JSON ลงตาราง `pm_document_version` พร้อมเพิ่มเลขเวอร์ชัน (เช่น 1.0, 2.0)",
                "7. หากเอกสารนี้มี Change Request (CR) ที่ผูกอยู่ ระบบจะรัน Auto-Implement ปิดงาน CR อัตโนมัติ"
            ],
            "keyFiles": ["ApprovalServiceImpl.java", "JsonSnapshotHelper.java", "PmDocumentVersionRepository.java", "DocumentLockedException.java"],
            "trapQuestion": "ถ้าเอกสารถูก Approve แล้ว แต่อยากแก้คำผิด ทำไมถึงแก้ตรงๆ ไม่ได้?",
            "defenseTip": "ตอบตามหลัก Audit & Compliance ว่าเพื่อรักษาความถูกต้องตามกฎหมายและสัญญา เอกสารที่เซ็นอนุมัติแล้วต้องไม่ถูกเปลี่ยนแปลงอย่างเงียบๆ หากต้องการแก้ไข ต้องเปิด Change Request (CR) เพื่อให้มี Audit Trail ชัดเจนเสมอ"
        },
        {
            "id": "W07",
            "topic": "Approval SLA Timeout & Background Scheduler",
            "title": "การจัดการ SLA หมดอายุด้วย ApprovalTimeoutScheduler",
            "summary": "Cron Job ทำงานเบื้องหลังตรวจสอบคำขออนุมัติที่ค้างเกินกำหนดเวลาตามแม่แบบ เพื่อป้องกันกระบวนการทำงานสะดุด",
            "steps": [
                "1. `@Scheduled(cron = \"0 0 * * * *\")` สั่งให้ `ApprovalTimeoutScheduler` ตรวจสอบทุกชั่วโมง",
                "2. ดึงคำขออนุมัติทั้งหมดที่มีสถานะ PENDING",
                "3. คำนวณระยะเวลาตั้งแต่วันส่งคำขอ เทียบกับ SLA Timeout ใน `PmApprovalFlowStep`",
                "4. หากเกินกำหนดและคอนฟิกเป็น AUTO_SKIP: ระบบจะข้ามขั้นตอนนี้และส่งต่องานให้ขั้นถัดไป",
                "5. หากคอนฟิกเป็น AUTO_APPROVE: ระบบจะอนุมัติขั้นตอนนี้แทนเสมือนมีผู้อนุมัติและบันทึก System Log",
                "6. หากคอนฟิกเป็น AUTO_REJECT / EXPIRE: ระบบจะปรับสถานะคำขอเป็น EXPIRED และส่งกลับร่างเอกสาร"
            ],
            "keyFiles": ["ApprovalTimeoutScheduler.java", "ApprovalServiceImpl.java", "PmApprovalStepStatus.java"],
            "trapQuestion": "ถ้าเซิร์ฟเวอร์มีหลายเครื่อง (Clustered Backend) Scheduler จะทำงานซ้ำซ้อนไหม?",
            "defenseTip": "ตอบว่าสามารถใช้ ShedLock หรือฐานข้อมูลล็อกเพื่อควบคุมให้ทำงานเพียงโหนดเดียว หรือใช้ Transaction Level Pessimistic Lock ตอนอัปเดตสถานะของแต่ละแถว"
        },
        {
            "id": "W08",
            "topic": "AI Integration: Context-Injection & Architecture Rationale",
            "title": "สถาปัตยกรรม Context-Injection ปะทะ Direct DB Connection ของ AI",
            "summary": "AI ใน SIC ทำงานผ่าน Context-Injection โดย Backend ทำหน้าที่เป็น Middleware คัดกรองและประกอบบริบท ป้องกัน Hallucination และ Token บวมอย่างสิ้นเชิง",
            "steps": [
                "1. ทำไมไม่ให้ AI เชื่อมต่อ Database เองตรงๆ? -> เพราะ AI อาจรันคำสั่งผิดพลาด, รั่วไหลข้าม Tenant, และเดาข้อมูล (Hallucination)",
                "2. Backend ทำหน้าที่เป็น Context Broker: ดึงข้อมูลจริงที่ผ่าน Validation และ Tenant Filter แล้วจาก Database",
                "3. คัดกรองข้อมูลให้อยู่ในรูปแบบที่กระชับและตรงประเด็น (Structured Context)",
                "4. ประกอบบริบทเข้ากับ System Prompt และ User Intent",
                "5. ส่ง Prompt ไปยังโมเดลภายนอก (Gemini/Claude) ผ่าน HTTPS REST API",
                "6. รับผลลัพธ์ที่เป็น Structured JSON นำมา Validate และ Map ลง Entity เพื่อบันทึกลง Database"
            ],
            "keyFiles": ["SpecificationGeneratorService.java", "TestCaseGeneratorService.java", "AiProjectContextHelper.java", "AiApiKeyConverter.java"],
            "trapQuestion": "ทำไมถึงบอกว่าวิธีนี้ปลอดภัยกว่าการใช้ LangChain หรือ SQL Agent ทั่วไป?",
            "defenseTip": "ตอบว่าเพราะ Context-Injection ควบคุม Data Boundaries ในเลเยอร์โค้ด Java ได้ 100% ข้อมูลที่ส่งให้ AI มาจากคำสั่ง SQL ที่ผ่าน Security Context ของเราเอง AI ไม่มีสิทธิ์ยิงคำสั่ง DDL/DML ใส่ฐานข้อมูลโดยตรงเด็ดขาด"
        },
        {
            "id": "W09",
            "topic": "AI Scope Isolation & One-Shot Index Menu",
            "title": "การคุม Scope ด้วยสารบัญย่อ One-Shot Project Index Menu",
            "summary": "AiProjectContextHelper สกัดสารบัญย่อทั้งโปรเจกต์ป้อนให้ AI ช่วยให้ AI ผูกความสัมพันธ์กับเอกสารอื่นได้ในรอบเดียวโดยไม่กิน Token มหาศาล",
            "steps": [
                "1. เมื่อเรียกสร้างเอกสาร (เช่น Spec) Service จะเรียก `AiProjectContextHelper.buildProjectIndexBlock(projectId)`",
                "2. ฟังก์ชันจะดึงรายชื่อ Requirements, Diagrams, Tasks ที่มีอยู่เดิมในโปรเจกต์มาทำเป็นสารบัญย่อ (ID + Code + Title)",
                "3. นำสารบัญย่อแนบเข้าไปใน Prompt ให้ AI เห็นภาพรวมทั้งโปรเจกต์",
                "4. AI สามารถอ่านและเลือกได้ว่า Spec นี้ควรเชื่อมโยงกับ `requirementId` ข้อใด และ `diagramId` รูปใด",
                "5. AI ส่ง ID ที่เลือกกลับมาใน JSON Response",
                "6. Backend นำ ID นั้นมาสร้าง TraceLink เชื่อมโยงในระบบให้อัตโนมัติ"
            ],
            "keyFiles": ["AiProjectContextHelper.java", "SpecificationGeneratorService.java", "RequirementGeneratorService.java", "PmTraceLinkRepository.java"],
            "trapQuestion": "ถ้าโปรเจกต์มีเอกสาร 500 ใบ การดึงสารบัญย่อจะทำให้ Token เกินหรือไม่?",
            "defenseTip": "ตอบว่าสารบัญย่อดึงเฉพาะ (ID, Code, Name) ใช้เพียง 1-2 บรรทัดต่อเอกสาร เอกสาร 500 ใบใช้ Token ไม่ถึง 10,000 tokens ซึ่งอยู่ในขอบเขต Context Window ของ Gemini (1M-2M tokens) ได้อย่างสบายและประหยัดกว่าการส่งเนื้อหาเต็มถึง 95%"
        },
        {
            "id": "W10",
            "topic": "AI Scope Protection & Chain Resolution",
            "title": "การสาวโซ่เอกสาร (Chain Resolution) และการป้องกันข้อมูลรั่วไหล",
            "summary": "หากผู้ใช้ระบุ ID เอกสารปลาย เช่น taskId ระบบจะสาวโซ่ความสัมพันธ์ใน DB เพื่อดึง Requirement และ Project ที่ถูกต้อง และตัดการพึ่งพาค่าที่อาจเพี้ยนจาก Header",
            "steps": [
                "1. ผู้ใช้ส่งคำขอพร้อม `taskId` มาที่ Backend",
                "2. โค้ดสาวโซ่ความสัมพันธ์: `task = taskRepository.findById(taskId)`",
                "3. `spec = task.getSpecification()`",
                "4. `requirement = spec.getRequirement()`",
                "5. `project = requirement.getProject()`",
                "6. นำเนื้อหาฉบับเต็มของ Task, Spec, Requirement นี้มาใส่เป็นบริบทหลัก",
                "7. หาก `projectId == null` ระบบจะ Return ทันที ไม่มีการเดาข้ามโปรเจกต์เพื่อความปลอดภัยสูงสุด"
            ],
            "keyFiles": ["TestCaseGeneratorService.java", "SpecificationGeneratorService.java", "TaskRepository.java", "PmSpecificationRepository.java"],
            "trapQuestion": "ทำไมถึงตัดการอ่าน projectId จากแถบบนหน้าเว็บ (Header Bar)?",
            "defenseTip": "ตอบว่าเพราะผู้ใช้อาจเปิดหลายแท็บ หรือสลับโปรเจกต์ในหน้าจออื่นทำให้ค่าใน Client Header ค้างและไม่ตรงกับเอกสารที่กำลังเปิดอยู่ การสาวโซ่จาก ID ของเอกสารโดยตรง (Chain Resolution) จึงการันตีความถูกต้องของ Scope 100%"
        },
        {
            "id": "W11",
            "topic": "TraceLink Architecture & Graph Storage",
            "title": "สถาปัตยกรรมกราฟความสัมพันธ์ในตาราง pm_trace_link",
            "summary": "ระบบจัดเก็บโครงข่ายความสัมพันธ์ระหว่างเอกสารทุกประเภทในตารางเดียวในลักษณะ Directed Graph (Node-Edge) พร้อม Enum ความสัมพันธ์เชิงวิศวกรรม",
            "steps": [
                "1. ตาราง `pm_trace_link` มีฟิลด์ `source_type`, `source_id`, `target_type`, `target_id`",
                "2. ฟิลด์ `relationship_type` เก็บค่า Enum เช่น DESIGNED_BY, IMPLEMENTED_BY, VERIFIED_BY, FAILED_BY",
                "3. รองรับการเชื่อมโยงข้ามประเภทเอกสารทั้งหมด (Requirement -> Spec -> Task -> TestCase -> Bug)",
                "4. มีฟิลด์ `project_id` เพื่อแยกขอบเขตข้อมูลรายโครงการ",
                "5. มีฟิลด์ `is_delete` สำหรับทำ Soft Delete เมื่อยกเลิกการเชื่อมโยง",
                "6. มี Index บน `(source_type, source_id)` และ `(target_type, target_id)` เพื่อให้ค้นหาความสัมพันธ์ได้รวดเร็วระดับมิลลิวินาที"
            ],
            "keyFiles": ["PmTraceLink.java", "PmTraceLinkRepository.java", "TraceRelationship.java", "TraceLinkServiceImpl.java"],
            "trapQuestion": "ทำไมไม่สร้าง Foreign Key แยกตารางละคู่ เช่น requirement_specification_link?",
            "defenseTip": "ตอบว่าเพราะเอกสารในระบบมีมากกว่า 10 ชนิด หากสร้างคู่ตารางจะเกิดตารางความสัมพันธ์นับสิบตาราง การใช้ Generic Directed Graph ในตารางเดียว (pm_trace_link) ทำให้เขียนอัลกอริทึมค้นหากราฟและทำ Impact Analysis ได้แบบรวมศูนย์และยืดหยุ่นกว่ามาก"
        },
        {
            "id": "W12",
            "topic": "TraceLink Traversal & PostgreSQL Recursive CTE",
            "title": "การค้นหากราฟหลายระดับด้วย PostgreSQL Recursive CTE (WITH RECURSIVE)",
            "summary": "การค้นหาความสัมพันธ์ย้อนรอยทั้งสายน้ำ (End-to-End Traceability) ทำงานผ่านคำสั่ง SQL เดียวด้วยความสามารถ Recursive CTE ของ PostgreSQL 17",
            "steps": [
                "1. เมื่อผู้ใช้ต้องการดู Trace Matrix หรือทำ Impact Analysis ระบบเรียก `TraceLinkRepository`",
                "2. Backend รัน Native SQL: `WITH RECURSIVE trace_graph AS (...)`",
                "3. ส่วน Base Query: เลือก Node เริ่มต้นจาก `source_id` หรือ `target_id` ที่ระบุ",
                "4. ส่วน Recursive Query: ทำการ `UNION ALL` เพื่อดึง Node ที่เชื่อมต่อไปเรื่อยๆ ทั้งทิศทาง Upstream และ Downstream",
                "5. กำหนดเงื่อนไข `depth <= MAX_DEPTH` และป้องกัน Circular Loop ด้วยการเช็ค Path Array",
                "6. ได้ผลลัพธ์โครงข่ายความสัมพันธ์ครบทุกระดับออกมาใน Query เดียว แล้วส่งต่อให้ Frontend วาด Diagram หรือ Matrix Table"
            ],
            "keyFiles": ["PmTraceLinkRepository.java", "TraceLinkServiceImpl.java", "ImpactAnalysisServiceImpl.java"],
            "trapQuestion": "ถ้ามีความสัมพันธ์วนซ้ำเป็นลูป (Circular Dependency) Recursive Query จะเกิด Infinite Loop ไหม?",
            "defenseTip": "ตอบว่าไม่เกิด เพราะใน SQL มีการเก็บ Array ของ ID ที่เคยแวะผ่านมาแล้ว (`ARRAY[source_id]`) และใส่เงื่อนไข `WHERE NOT (target_id = ANY(visited_path))` ดักไว้เสมอ"
        },
        {
            "id": "W13",
            "topic": "Change Impact Analysis & Change Request Workflow",
            "title": "การวิเคราะห์ผลกระทบเมื่อเกิดการเปลี่ยนแปลง (Change Impact Analysis)",
            "summary": "เมื่อ Requirement เปลี่ยนแปลง หรือมีการเปิด Change Request ระบบจะคำนวณว่ากระทบต่อ Spec, Task, Test Case หรือ Bug ใดบ้าง และแจ้งเตือนให้ทีมงานดำเนินการ",
            "steps": [
                "1. เมื่อมีการเปิด Change Request (CR) บนเอกสารต้นทาง",
                "2. `ImpactAnalysisServiceImpl` ดึงกราฟความสัมพันธ์ของเอกสารนั้นผ่าน `TraceLinkService`",
                "3. คำนวณรายการ Artifacts ทั้งหมดที่อยู่ปลายน้ำ (Downstream Artifacts)",
                "4. ตรวจสอบสถานะของ Artifacts เหล่านั้น เช่น Task พัฒนาไปแล้วหรือยัง, Test Case เขียนไว้แล้วหรือไม่",
                "5. ประเมินระดับผลกระทบ (High, Medium, Low) และบันทึกลงตาราง `pm_change_impact_analysis`",
                "6. แจ้งเตือนผู้รับผิดชอบเอกสารปลายน้ำให้ตรวจสอบและทำการ Re-test หรือ Re-design"
            ],
            "keyFiles": ["ImpactAnalysisServiceImpl.java", "PmChangeRequestServiceImpl.java", "ChangeImpactAnalysisRepository.java", "PmChangeRequest.java"],
            "trapQuestion": "ฟังก์ชันนี้ช่วยอะไรทีมพัฒนาในชีวิตจริง?",
            "defenseTip": "ตอบว่าช่วยแก้ปัญหาคลาสสิกของ Software Engineering คือ 'แก้ความต้องการนิดเดียว แต่ระบบพังทั้งระบบโดยไม่มีใครรู้' ระบบนี้ชี้เป้าทันทีว่าต้องไปแก้โค้ดและรันเทสเคสใดซ้ำบ้าง ทำให้ประเมิน Manday และราคาของ CR ได้แม่นยำ"
        },
        {
            "id": "W14",
            "topic": "Concurrency & Optimistic Locking",
            "title": "การป้องกันการแก้ไขชนกันด้วย Optimistic Locking และ @Version",
            "summary": "ระบบใช้กลไก Optimistic Locking ผ่านฟิลด์ @Version ใน BaseEntity ร่วมกับ RowVersionGuard เพื่อป้องกันปัญหา Lost Updates เมื่อมีผู้ใช้ทำงานพร้อมกัน",
            "steps": [
                "1. `BaseEntity` มีฟิลด์ `@Version private Long rowVersion;`",
                "2. เมื่อผู้ใช้คนที่ 1 และคนที่ 2 ดึงข้อมูลเอกสารใบเดียวกันไปพร้อมกัน ทั้งสองจะได้ `rowVersion = 1`",
                "3. ผู้ใช้คนที่ 1 กดบันทึกก่อน -> JPA ตรวจสอบ `WHERE id = ? AND row_version = 1` สำเร็จ และอัปเดตเป็น `row_version = 2`",
                "4. ผู้ใช้คนที่ 2 กดบันทึกตามมา -> JPA ส่ง `WHERE id = ? AND row_version = 1` แต่ไม่พบแถวที่ตรงเงื่อนไข",
                "5. JPA โยน `OptimisticLockException` ทันที",
                "6. `RowVersionGuard` ดักจับและส่ง Error ชัดเจนให้หน้าบ้านว่า 'ข้อมูลถูกแก้ไขโดยผู้อื่นไปแล้ว กรุณารีเฟรชก่อนแก้ไข'"
            ],
            "keyFiles": ["BaseEntity.java", "RowVersionGuard.java", "GlobalExceptionHandler.java"],
            "trapQuestion": "ทำไมเลือกใช้ Optimistic Lock แทนที่จะเป็น Pessimistic Lock (SELECT FOR UPDATE)?",
            "defenseTip": "ตอบว่าเพราะระบบจัดการเอกสารผู้ใช้ใช้เวลาอ่านและกรอกฟอร์มนาน (Think Time สูง) หากใช้ Pessimistic Lock จะเป็นการล็อค Connection ของฐานข้อมูลค้างไว้ ทำให้ระบบรองรับผู้ใช้ได้น้อยลง Optimistic Lock จึงมี Performance สูงกว่าและเหมาะกับ Web Application มากกว่า"
        },
        {
            "id": "W15",
            "topic": "Collaborative Editing Sessions & CodeSequenceLock",
            "title": "ระบบ Collaborative Lock และการป้องกันเลขเอกสารชนกัน",
            "summary": "ระบบมี PmEditSessionController ควบคุมการเปิดเอกสารแบบ Real-time และ CodeSequenceLock ป้องกันการออกรหัสเอกสารซ้ำกันในระดับมิลลิวินาที",
            "steps": [
                "1. เมื่อผู้ใช้เปิดหน้าเอกสารเพื่อแก้ไข จะส่งสัญญาณขอ Session ไปที่ `PmEditSessionController`",
                "2. ระบบบันทึก Session ในตาราง พร้อมเวลา Heartbeat ล่าสุด",
                "3. หากมีผู้ใช้คนที่ 2 เปิดหน้าเดียวกัน ระบบจะแจ้งเตือนว่า 'มีคุณ... กำลังแก้ไขอยู่' และเปิดให้อ่านแบบ Read-Only",
                "4. เมื่อบันทึกเอกสารใหม่ ระบบต้องสร้างรหัสเอกสาร เช่น REQ-2026-0001",
                "5. `CodeSequenceLock` ทำการล็อคแบบ synchronized / distributed lock ในช่วงคำนวณและเพิ่มเลขที่",
                "6. การันตีว่าเลขที่เอกสารจะไม่ชนกันแม้จะมีการกดยืนยันพร้อมกันในเสี้ยววินาที"
            ],
            "keyFiles": ["PmEditSessionController.java", "CodeSequenceLock.java", "ContractNoHelper.java"],
            "trapQuestion": "ถ้าคนเปิดหน้าทิ้งไว้แล้วปิดเบราว์เซอร์ไปเลย เอกสารจะถูกล็อคค้างไหม?",
            "defenseTip": "ตอบว่าไม่ค้าง เพราะมีกลไก Session Timeout และ Heartbeat หากหน้าเว็บไม่ส่งสัญญาณ Ping ภายใน 3-5 นาที ระบบจะตัด Session ของผู้ใช้นั้นออกและปลดล็อคให้คนอื่นเข้าแก้ต่อได้อัตโนมัติ"
        },
        {
            "id": "W16",
            "topic": "Object Storage Integration with SeaweedFS S3",
            "title": "การจัดเก็บไฟล์แนบและรูปภาพด้วย SeaweedFS S3 API",
            "summary": "ระบบเชื่อมต่อไปยัง SeaweedFS Object Storage โดยใช้ AWS S3 SDK มาตรฐาน พร้อมระบบคัดแยกความปลอดภัยของไฟล์ (Public, Private, Business)",
            "steps": [
                "1. `S3Config` สร้าง Bean `S3Client` โดยอ่าน Endpoint, Access Key, Secret Key จาก `.env`",
                "2. เมื่อผู้ใช้อัปโหลดไฟล์ `StorageController` รับไฟล์และส่งต่อให้ `FileStorageServiceImpl`",
                "3. ทำการตรวจสอบขนาดไฟล์และประเภท Mime Type เพื่อความปลอดภัย",
                "4. ตั้งชื่อไฟล์ใหม่ด้วย UUID ป้องกันชื่อไฟล์ชนกันหรือมีอักขระอันตราย",
                "5. ส่งไฟล์ขึ้น Bucket ใน SeaweedFS ผ่าน `s3Client.putObject()` แบบ Streaming เพื่อไม่ให้กิน RAM",
                "6. บันทึก Metadata ของไฟล์ (ขนาด, ประเภท, ผู้สร้าง, สิทธิ์การมองเห็น FileVisibility) ลงฐานข้อมูล"
            ],
            "keyFiles": ["S3Config.java", "StorageController.java", "FileStorageServiceImpl.java", "FileVisibility.java"],
            "trapQuestion": "ทำไมเลือกใช้ SeaweedFS แทนที่จะเก็บไฟล์ลงใน Local Disk ของเซิร์ฟเวอร์?",
            "defenseTip": "ตอบว่าเพื่อให้ระบบรองรับ Horizontal Scaling หากมี Backend หลาย Instance การเก็บใน Local Disk จะทำให้เซิร์ฟเวอร์อีกเครื่องมองไม่เห็นไฟล์ การใช้ SeaweedFS ซึ่งเป็น Distributed Object Storage และรองรับ S3 API ทำให้ขยายพื้นที่ได้ง่าย และสามารถสลับไปใช้ Cloud เช่น AWS S3 หรือ MinIO ได้ทันทีโดยไม่ต้องแก้โค้ด"
        },
        {
            "id": "W17",
            "topic": "JasperReports Microservice & Bulk Document Export",
            "title": "สถาปัตยกรรมออกรายงานและรวมเล่ม PDF ด้วย PdfBook",
            "summary": "การออกเอกสาร PDF ใช้ Microservice แยกต่างหาก (sic-report-service) สื่อสารผ่าน REST พร้อม Secret Key และมี PdfBook ทำหน้าที่รวมรายงานทุกประเภทเป็นเล่มสมบูรณ์เล่มเดียว",
            "steps": [
                "1. Client ขอส่งออกเอกสารรวมทั้งโปรเจกต์ผ่าน `BulkDocumentExportController`",
                "2. `BulkDocumentExportService` รวบรวมข้อมูลเอกสารทั้งหมด (Requirement, Spec, Diagram, Test Case)",
                "3. เรียก `ReportServiceClient` ส่งข้อมูล Payload ไปยัง `sic-report-service`",
                "4. แนบ Header ลับเพื่อตรวจสอบสิทธิ์การเรียกข้าม Service (Microservice Secret Header)",
                "5. `sic-report-service` คอมไพล์เทมเพลต Jasper (.jrxml) และคืนไฟล์ PDF กลับมา",
                "6. `PdfBook` นำ PDF แต่ละส่วนมารวมกัน (Merge), ใส่สารบัญ, และรันเลขหน้าอัตโนมัติ ส่งกลับให้ผู้ใช้ดาวน์โหลด"
            ],
            "keyFiles": ["BulkDocumentExportService.java", "ReportServiceClient.java", "PdfBook.java", "ReportHelper.java"],
            "trapQuestion": "ทำไมต้องแยก Report Service ออกเป็นอีก Container/Microservice?",
            "defenseTip": "ตอบว่าเพราะการประมวลผล JasperReports และการแปลง PDF กิน CPU และ Memory มหาศาล หากรันใน Spring Boot ตัวหลักอาจทำให้ API อื่นๆ ช้าลงหรือเกิด Out-Of-Memory (OOM) การแยก Service ทำให้สเกลและจัดการทรัพยากรได้อย่างอิสระ"
        },
        {
            "id": "W18",
            "topic": "Realtime STOMP WebSockets & WebRTC Signaling",
            "title": "การสื่อสารแบบ Real-time ด้วย STOMP WebSocket และ WebRTC Signaling",
            "summary": "ระบบแชทสดและการโทรแบบเห็นหน้าทำงานผ่าน STOMP Message Broker โดยมี JwtChannelInterceptor ตรวจสอบ Token ตั้งแต่ช่วง Handshake",
            "steps": [
                "1. `WebSocketConfig` เปิดใช้งาน STOMP ผ่าน Endpoint `/ws` และตั้ง Destination Prefix `/app`, `/topic`",
                "2. ในช่วง STOMP CONNECT: `JwtChannelInterceptor` สกัด JWT Token จาก Native Header และตรวจสอบความถูกต้อง",
                "3. หาก Token ไม่ผ่าน ระบบจะ Reject การเชื่อมต่อทันที",
                "4. เมื่อผู้ใช้ส่งข้อความแชท: เข้าสู่ `ChatWebSocketController` และบันทึกลงตาราง `su_chat_message`",
                "5. ยิงกระจายข้อความไปยังผู้รับผ่าน STOMP Topic `/topic/chat/{roomId}`",
                "6. การโทร WebRTC: ใช้ WebSocket ช่องทางเดียวกันนี้ในการแลกเปลี่ยนสัญญาณ Signaling (SDP Offer/Answer และ ICE Candidates)"
            ],
            "keyFiles": ["WebSocketConfig.java", "JwtChannelInterceptor.java", "ChatWebSocketController.java", "SuChatMessageRepository.java"],
            "trapQuestion": "ทำไมถึงใช้ STOMP Protocol บน WebSocket แทนที่จะใช้ Pure WebSocket ดิบๆ?",
            "defenseTip": "ตอบว่าเพราะ STOMP ให้โครงสร้างแบบ Publish-Subscribe (Pub/Sub) และ Message Broker มาในตัว มีคำสั่งมาตรฐาน (CONNECT, SUBSCRIBE, SEND) ทำให้จัดการ Routing ไปยัง Room หรือผู้ใช้แต่ละคนได้ง่าย และผูกกับ Spring Security Channel Interceptor ได้อย่างเป็นทางการ"
        },
        {
            "id": "W19",
            "topic": "Flyway Database Migration Pipeline",
            "title": "วงจรชีวิตการจัดการโครงสร้างฐานข้อมูลด้วย Flyway",
            "summary": "ทุกการเปลี่ยนแปลงของฐานข้อมูลถูกควบคุมผ่านไฟล์ Versioned SQL Scripts ใน src/main/resources/db/migration โดย Flyway จะรันอัตโนมัติเมื่อระบบ Boot",
            "steps": [
                "1. นักพัฒนาเขียนไฟล์สคริปต์ SQL ตั้งชื่อตามมาตรฐาน เช่น `V1__init.sql`, `V2__add_trace_link.sql`",
                "2. เมื่อเปิด Spring Boot: `FlywayConfig` จะเริ่มการตรวจสอบก่อนที่ Hibernate/JPA จะเชื่อมต่อ",
                "3. Flyway ตรวจสอบตารางประวัติ `flyway_schema_history` ในฐานข้อมูล",
                "4. คำนวณ Checksum ของไฟล์สคริปต์เดิม หากมีการแอบแก้ไขสคริปต์เก่า Flyway จะโยน Error ป้องกัน Database Inconsistency",
                "5. รันไฟล์ Migration ใหม่ที่ยังไม่เคยรันตามลำดับเวอร์ชันอย่างเป็นระเบียบ",
                "6. หากมี Script ใด Error ระบบจะ Rollback และหยุดการ Boot เพื่อไม่ให้ Schema พัง"
            ],
            "keyFiles": ["FlywayConfig.java", "SicApiApplication.java"],
            "trapQuestion": "ทำไมถึงไม่ใช้ hibernate.ddl-auto=update ของ Spring Boot เพื่อสร้างตารางอัตโนมัติ?",
            "defenseTip": "ตอบตามหลัก Production Best Practice ว่า ddl-auto=update อันตรายมากในระดับ Enterprise เพราะควบคุมการเปลี่ยนชื่อคอลัมน์ การลบ หรือ Index ไม่ได้ และอาจทำให้ข้อมูลสูญหาย การใช้ Flyway ทำให้เราควบคุม DDL ด้วย SQL จริง 100% มี Version Control และตรวจสอบย้อนหลังได้"
        },
        {
            "id": "W20",
            "topic": "Centralized Exception Handling & Standard Error Response",
            "title": "การจัดการ Error ส่วนกลางด้วย @RestControllerAdvice",
            "summary": "ข้อผิดพลาดทุกประเภทในระบบถูกดักจับและแปลงเป็นโครงสร้าง JSON ErrorResponse มาตรฐานที่ GlobalExceptionHandler เพื่อให้หน้าบ้านแสดงผลได้ถูกต้องและไม่เปิดเผย StackTrace",
            "steps": [
                "1. ข้อผิดพลาดเกิดขึ้นใน Service เช่น ค้นหาไม่เจอ, เอกสารถูกล็อค, หรือสิทธิ์ไม่ผ่าน",
                "2. โค้ดโยน Custom Exception เช่น `ResourceNotFoundException`, `DocumentLockedException`, `ProgramPermissionDeniedException`",
                "3. `GlobalExceptionHandler` ที่มี `@RestControllerAdvice` จะดักจับ Exception ตามประเภทที่ระบุใน `@ExceptionHandler`",
                "4. แมป Exception เข้ากับ HTTP Status Code ที่เหมาะสม (404, 409, 403, 400)",
                "5. สร้างออบเจกต์ `ErrorResponse` ที่มีฟิลด์ `timestamp`, `status`, `error`, `message`, `path`",
                "6. ซ่อน Internal StackTrace ไม่ให้ส่งออกไปภายนอกเพื่อความปลอดภัยตามหลัก Secure Coding"
            ],
            "keyFiles": ["GlobalExceptionHandler.java", "ResourceNotFoundException.java", "DocumentLockedException.java", "ProgramPermissionDeniedException.java"],
            "trapQuestion": "ทำไมไม่ใส่ try-catch ครอบใน Controller ทุกตัว?",
            "defenseTip": "ตอบตามหลัก Clean Architecture ว่าเพื่อขจัดโค้ดซ้ำซ้อน (Boilerplate) และแยกความรับผิดชอบ (Separation of Concerns) ให้ Controller มีหน้าที่เพียงรับ-ส่งข้อมูล ส่วนการจัดการ Error ให้เลเยอร์ส่วนกลาง (@RestControllerAdvice) ดูแลทั้งหมด"
        }
    ]

    print(f"Loaded {len(workflows)} architecture workflows.")

    # Save workflows to scratch json
    out_wf = os.path.join(WORKSPACE, "parsed_workflows.json")
    with open(out_wf, "w", encoding="utf-8") as f:
        json.dump(workflows, f, ensure_ascii=False, indent=2)

    # Let's generate sic_backend_quiz_game.html
    html_content = generate_html(all_files, workflows)
    output_html_path = os.path.join(WORKSPACE, "sic_backend_quiz_game.html")
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Successfully generated quiz game at: {output_html_path}")
    print(f"File size: {os.path.getsize(output_html_path)} bytes")

def generate_html(files_data, workflows_data):
    files_json_str = json.dumps(files_data, ensure_ascii=False)
    workflows_json_str = json.dumps(workflows_data, ensure_ascii=False)

    return f"""<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>SIC Backend Presentation Defense Quiz Game</title>
<style>
  :root {{
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-card: #1e293b;
    --bg-hover: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --accent: #38bdf8;
    --accent-glow: rgba(56, 189, 248, 0.25);
    --success: #10b981;
    --success-bg: rgba(16, 185, 129, 0.15);
    --error: #ef4444;
    --error-bg: rgba(239, 68, 68, 0.15);
    --warning: #f59e0b;
    --purple: #a855f7;
    --border: #334155;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --font: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: var(--font);
  }}

  body {{
    background-color: var(--bg-primary);
    color: var(--text-primary);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
  }}

  header {{
    background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
    border-bottom: 1px solid var(--border);
    padding: 1.25rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    position: sticky;
    top: 0;
    z-index: 100;
  }}

  .brand {{
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }}

  .brand-logo {{
    width: 44px;
    height: 44px;
    border-radius: var(--radius-sm);
    background: linear-gradient(135deg, #0284c7, #38bdf8);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 1.2rem;
    color: #fff;
    box-shadow: 0 0 15px var(--accent-glow);
  }}

  .brand-text h1 {{
    font-size: 1.25rem;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }}

  .brand-text p {{
    font-size: 0.8rem;
    color: var(--text-secondary);
  }}

  .tech-pills {{
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }}

  .pill {{
    font-size: 0.75rem;
    padding: 0.25rem 0.65rem;
    border-radius: 999px;
    background-color: rgba(56, 189, 248, 0.1);
    color: var(--accent);
    border: 1px solid rgba(56, 189, 248, 0.25);
    font-weight: 600;
  }}

  .container {{
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }}

  /* Mode Switcher Tabs */
  .set-nav {{
    display: flex;
    background: var(--bg-secondary);
    padding: 0.35rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
    gap: 0.35rem;
  }}

  .set-btn {{
    flex: 1;
    padding: 0.85rem 1.25rem;
    border: none;
    background: transparent;
    color: var(--text-secondary);
    font-weight: 700;
    font-size: 0.95rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }}

  .set-btn.active {{
    background: linear-gradient(135deg, #0284c7, #2563eb);
    color: #fff;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
  }}

  .set-btn .badge {{
    background: rgba(255, 255, 255, 0.2);
    font-size: 0.75rem;
    padding: 0.15rem 0.5rem;
    border-radius: 999px;
  }}

  /* Top Toolbar */
  .toolbar {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
    background: var(--bg-card);
    padding: 1rem 1.25rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
  }}

  .toolbar-left, .toolbar-right {{
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }}

  .stat-badge {{
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }}

  .stat-badge strong {{
    color: var(--text-primary);
    font-size: 1rem;
  }}

  .stat-badge.streak strong {{
    color: var(--warning);
  }}

  .stat-badge.score strong {{
    color: var(--success);
  }}

  .select-mode {{
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border);
    padding: 0.5rem 0.85rem;
    border-radius: var(--radius-sm);
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    outline: none;
  }}

  .btn {{
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    border: none;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }}

  .btn-primary {{
    background: var(--accent);
    color: #0f172a;
  }}

  .btn-primary:hover {{
    filter: brightness(1.1);
    box-shadow: 0 0 10px var(--accent-glow);
  }}

  .btn-outline {{
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }}

  .btn-outline:hover {{
    background: var(--bg-hover);
    color: var(--text-primary);
  }}

  /* Progress Bar */
  .progress-wrap {{
    width: 100%;
    height: 8px;
    background: var(--bg-secondary);
    border-radius: 999px;
    overflow: hidden;
    border: 1px solid var(--border);
  }}

  .progress-bar {{
    height: 100%;
    width: 0%;
    background: linear-gradient(90deg, #38bdf8, #10b981);
    transition: width 0.3s ease;
  }}

  /* Main Quiz Card */
  .quiz-card {{
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    position: relative;
  }}

  .q-header {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }}

  .q-tag {{
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.25rem 0.75rem;
    border-radius: var(--radius-sm);
    background: rgba(168, 85, 247, 0.15);
    color: #c084fc;
    border: 1px solid rgba(168, 85, 247, 0.3);
  }}

  .q-num {{
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 700;
  }}

  .q-title {{
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1.5;
    color: #ffffff;
  }}

  .q-code {{
    background: #090d16;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    color: #38bdf8;
    font-family: 'Consolas', monospace;
    font-size: 0.95em;
    border: 1px solid rgba(56, 189, 248, 0.2);
  }}

  /* 4 Options Grid */
  .options-grid {{
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.85rem;
  }}

  @media (min-width: 768px) {{
    .options-grid {{
      grid-template-columns: 1fr 1fr;
    }}
  }}

  .option-btn {{
    background: #151f32;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.15rem 1.25rem;
    color: var(--text-primary);
    text-align: left;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: flex-start;
    gap: 0.85rem;
    line-height: 1.45;
  }}

  .option-btn:hover:not(:disabled) {{
    background: #24324d;
    border-color: var(--accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }}

  .opt-letter {{
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #1e293b;
    border: 1px solid #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 0.85rem;
    color: var(--accent);
    flex-shrink: 0;
  }}

  .option-btn.correct {{
    background: var(--success-bg) !important;
    border-color: var(--success) !important;
    color: #34d399 !important;
  }}

  .option-btn.correct .opt-letter {{
    background: var(--success);
    color: #fff;
    border-color: var(--success);
  }}

  .option-btn.wrong {{
    background: var(--error-bg) !important;
    border-color: var(--error) !important;
    color: #f87171 !important;
  }}

  .option-btn.wrong .opt-letter {{
    background: var(--error);
    color: #fff;
    border-color: var(--error);
  }}

  /* Explanation / Pro-Tip Box */
  .feedback-box {{
    margin-top: 1rem;
    background: #0b1329;
    border-radius: var(--radius-md);
    padding: 1.25rem;
    border: 1px solid #1e3a5f;
    display: none;
    flex-direction: column;
    gap: 0.85rem;
    animation: fadeIn 0.3s ease;
  }}

  .feedback-box.show {{
    display: flex;
  }}

  .feedback-header {{
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    font-size: 1rem;
  }}

  .feedback-header.is-correct {{
    color: var(--success);
  }}

  .feedback-header.is-wrong {{
    color: var(--error);
  }}

  .feedback-desc {{
    font-size: 0.95rem;
    color: #cbd5e1;
    line-height: 1.6;
  }}

  .defense-tip-box {{
    background: rgba(245, 158, 11, 0.1);
    border-left: 4px solid var(--warning);
    padding: 0.85rem 1rem;
    border-radius: 4px;
  }}

  .defense-tip-title {{
    color: var(--warning);
    font-weight: 800;
    font-size: 0.85rem;
    margin-bottom: 0.35rem;
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }}

  .defense-tip-text {{
    font-size: 0.9rem;
    color: #fde68a;
    line-height: 1.5;
  }}

  .q-footer {{
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border);
    padding-top: 1.25rem;
    margin-top: 0.5rem;
  }}

  /* Study Bank / Search View */
  .search-container {{
    display: none;
    flex-direction: column;
    gap: 1.25rem;
  }}

  .search-container.active {{
    display: flex;
  }}

  .search-box {{
    display: flex;
    gap: 0.75rem;
    align-items: center;
    background: var(--bg-card);
    padding: 0.75rem 1rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--border);
  }}

  .search-input {{
    flex: 1;
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 1rem;
    outline: none;
  }}

  .filter-chips {{
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }}

  .chip {{
    padding: 0.35rem 0.85rem;
    border-radius: 999px;
    background: var(--bg-card);
    border: 1px solid var(--border);
    font-size: 0.8rem;
    color: var(--text-secondary);
    cursor: pointer;
    font-weight: 600;
  }}

  .chip.active {{
    background: var(--accent);
    color: #0f172a;
    border-color: var(--accent);
  }}

  .study-list {{
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }}

  .study-card {{
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }}

  .study-card h3 {{
    font-size: 1.05rem;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }}

  /* Completion Modal */
  .modal-overlay {{
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(5px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }}

  .modal-overlay.show {{
    display: flex;
  }}

  .modal-card {{
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    max-width: 550px;
    width: 100%;
    padding: 2.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }}

  .score-circle {{
    width: 120px;
    height: 120px;
    border-radius: 50%;
    margin: 0 auto;
    background: conic-gradient(var(--accent) 0%, #1e293b 0%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }}

  .score-circle-inner {{
    width: 100px;
    height: 100px;
    border-radius: 50%;
    background: var(--bg-card);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }}

  .score-circle-inner strong {{
    font-size: 1.75rem;
    color: var(--accent);
  }}

  @keyframes fadeIn {{
    from {{ opacity: 0; transform: translateY(6px); }}
    to {{ opacity: 1; transform: translateY(0); }}
  }}

  @keyframes popIn {{
    from {{ opacity: 0; transform: scale(0.9); }}
    to {{ opacity: 1; transform: scale(1); }}
  }}
</style>
</head>
<body>

<header>
  <div class="brand">
    <div class="brand-logo">SIC</div>
    <div class="brand-text">
      <h1>SIC Backend Defense Quiz Game</h1>
      <p>เตรียมความพร้อมตอบคำถามกรรมการระดับ Senior Engineer</p>
    </div>
  </div>
  <div class="tech-pills">
    <span class="pill">Spring Boot 4.1.1</span>
    <span class="pill">Java 21</span>
    <span class="pill">PostgreSQL 17</span>
    <span class="pill">Keycloak RS256</span>
    <span class="pill">Clean Architecture</span>
  </div>
</header>

<div class="container">

  <!-- Set Switcher -->
  <div class="set-nav">
    <button class="set-btn active" id="btnSet1" onclick="switchSet(1)">
      <span>ชุดที่ 1: หน้าที่ของไฟล์และคลาส (File Responsibilities)</span>
      <span class="badge" id="set1Count">1,000+ ข้อ</span>
    </button>
    <button class="set-btn" id="btnSet2" onclick="switchSet(2)">
      <span>ชุดที่ 2: กลไกและกระบวนการทำงาน (System Workflows)</span>
      <span class="badge" id="set2Count">1,000+ ข้อ</span>
    </button>
  </div>

  <!-- Toolbar -->
  <div class="toolbar">
    <div class="toolbar-left">
      <select class="select-mode" id="quizModeSelect" onchange="changeQuizMode()">
        <option value="10">⚡ ด่วน 10 ข้อ (Quick Test)</option>
        <option value="30" selected>🎯 ติวเข้ม 30 ข้อ (Defense Prep)</option>
        <option value="100">🏆 สอบจำลอง 100 ข้อ (Mock Exam)</option>
        <option value="endless">♾️ ฝึกฝนต่อเนื่อง 1,000+ ข้อ (Endless Marathon)</option>
        <option value="study">📚 คลังข้อสอบ & ค้นหาเฉลยทั้งหมด (Study Bank)</option>
      </select>
      <div class="stat-badge score">
        <span>คะแนน:</span>
        <strong id="scoreDisplay">0</strong>
      </div>
      <div class="stat-badge streak">
        <span>คอมโบ:</span>
        <strong id="streakDisplay">0 🔥</strong>
      </div>
      <div class="stat-badge">
        <span>ความแม่นยำ:</span>
        <strong id="accDisplay">0%</strong>
      </div>
    </div>
    <div class="toolbar-right">
      <button class="btn btn-outline" onclick="resetQuiz()">🔄 สุ่มชุดคำถามใหม่</button>
    </div>
  </div>

  <!-- Progress Bar -->
  <div class="progress-wrap" id="progressWrap">
    <div class="progress-bar" id="progressBar"></div>
  </div>

  <!-- Quiz Playground Area -->
  <main class="quiz-card" id="quizCard">
    <div class="q-header">
      <span class="q-tag" id="qCategory">Config & Security</span>
      <span class="q-num" id="qCounter">ข้อที่ 1 / 30</span>
    </div>

    <div class="q-title" id="qTitle">
      กำลังโหลดคำถาม...
    </div>

    <div class="options-grid" id="optionsGrid">
      <!-- 4 Option Buttons dynamically populated -->
    </div>

    <!-- Explanation Box (Appears after answer) -->
    <div class="feedback-box" id="feedbackBox">
      <div class="feedback-header" id="feedbackHeader">
        <span id="feedbackIcon">✅</span>
        <span id="feedbackTitle">ถูกต้องยอดเยี่ยม!</span>
      </div>
      <div class="feedback-desc" id="feedbackDesc">
        คำอธิบายเจาะลึก...
      </div>
      <div class="defense-tip-box" id="defenseTipBox">
        <div class="defense-tip-title">💡 ธงคำตอบสำหรับตอบกรรมการ (Presentation Pro-Tip)</div>
        <div class="defense-tip-text" id="defenseTipText">
          เน้นตอบเรื่องนี้เพื่อแสดงความเข้าใจลึกซึ้ง...
        </div>
      </div>
    </div>

    <div class="q-footer">
      <button class="btn btn-outline" id="prevBtn" onclick="prevQuestion()" disabled>⬅️ ก่อนหน้า</button>
      <button class="btn btn-primary" id="nextBtn" onclick="nextQuestion()" disabled>ถัดไป ➡️</button>
    </div>
  </main>

  <!-- Study Bank / Search View -->
  <div class="search-container" id="studyContainer">
    <div class="search-box">
      <span>🔍</span>
      <input type="text" class="search-input" id="studySearchInput" placeholder="พิมพ์ชื่อไฟล์, รหัสโปรแกรม, คีย์เวิร์ด (เช่น Approval, JWT, TraceLink, CTE, ThreadLocal)..." oninput="renderStudyBank()">
    </div>
    <div class="filter-chips" id="filterChips">
      <span class="chip active" onclick="filterStudyLayer('ALL')">ทั้งหมด</span>
      <span class="chip" onclick="filterStudyLayer('Controller')">Controllers</span>
      <span class="chip" onclick="filterStudyLayer('Service')">Services & AI</span>
      <span class="chip" onclick="filterStudyLayer('Interceptor')">Interceptors</span>
      <span class="chip" onclick="filterStudyLayer('Config & Root')">Config & Security</span>
      <span class="chip" onclick="filterStudyLayer('Repository')">Repositories</span>
      <span class="chip" onclick="filterStudyLayer('Entity & Enum')">Entities</span>
      <span class="chip" onclick="filterStudyLayer('Util')">Utilities</span>
      <span class="chip" onclick="filterStudyLayer('Workflow')">Architecture Workflows</span>
    </div>
    <div class="study-list" id="studyList">
      <!-- List populated dynamically -->
    </div>
  </div>

</div>

<!-- Completion Modal -->
<div class="modal-overlay" id="completionModal">
  <div class="modal-card">
    <h2 style="font-size: 1.6rem; color: #fff;">🎉 ทดสอบเสร็จสิ้น!</h2>
    <div class="score-circle" id="modalScoreCircle">
      <div class="score-circle-inner">
        <strong id="modalScorePct">85%</strong>
        <span style="font-size: 0.75rem; color: var(--text-secondary);">คะแนนความพร้อม</span>
      </div>
    </div>
    <p id="modalFeedbackText" style="color: var(--text-secondary); line-height: 1.6;">
      คุณตอบถูก 25 จาก 30 ข้อ อยู่ในเกณฑ์ความพร้อมระดับสูง สามารถอธิบายกลไก Backend ได้อย่างมั่นใจ!
    </p>
    <div style="display: flex; gap: 0.75rem; justify-content: center;">
      <button class="btn btn-primary" onclick="closeModalAndRestart()">เล่นอีกครั้ง</button>
      <button class="btn btn-outline" onclick="openStudyBankFromModal()">อ่านคลังคำถามทบทวน</button>
    </div>
  </div>
</div>

<script>
// RAW DATA INJECTED FROM BACKEND SUMMARIES
const BACKEND_FILES = {files_json_str};
const WORKFLOWS = {workflows_json_str};

let currentSet = 1; // 1: Files, 2: Workflows
let quizMode = "30"; // 10, 30, 100, endless, study
let questionsPool = [];
let currentQuestionIndex = 0;
let userAnswers = {{}};
let score = 0;
let streak = 0;
let answeredCount = 0;
let selectedStudyFilter = "ALL";

// PROCEDURAL QUESTION GENERATORS
function generateFileQuestions(targetCount) {{
  const questions = [];
  const files = BACKEND_FILES;
  const numFiles = files.length;

  const templates = [
    // T0: Direct Responsibility
    (f) => ({{
      category: f.layer + " | " + f.category,
      title: `ไฟล์ <span class="q-code">${{f.fileName}}</span> ในระบบ Backend ของ SIC มีหน้าที่หลักคืออะไร?`,
      correct: f.description,
      tip: `หากกรรมการถามเกี่ยวกับ ${{f.className}} ให้ตอบว่าอยู่ในเลเยอร์ ${{f.layer}} ทำหน้าที่: ${{f.description.slice(0, 100)}}... และตอบเน้นเรื่องการแยกหน้าที่ตาม Clean Architecture`
    }}),
    // T1: Reverse Lookup (Function to File)
    (f) => ({{
      category: f.layer + " | " + f.category,
      title: `หากต้องการตรวจสอบหรือแก้ไขกระบวนการ: "<b>${{f.description}}</b>" คุณต้องเปิดดูไฟล์ใดใน Backend?`,
      correct: f.fileName,
      tip: `ไฟล์ ${{f.fileName}} เป็นจุดรับผิดชอบหลักของฟังก์ชันนี้ตาม Single Responsibility Principle (SRP) อยู่ที่พาธโฟลเดอร์ตาม Layer ${{f.layer}}`
    }}),
    // T2: Layer & Architecture Role
    (f) => ({{
      category: f.layer + " | " + f.category,
      title: `ในสถาปัตยกรรม Layered Architecture ของ SIC ไฟล์ <span class="q-code">${{f.fileName}}</span> จัดอยู่ใน Layer ใดและเชื่อมโยงกับส่วนใด?`,
      correct: `จัดอยู่ใน Layer [${{f.layer}}] ทำหน้าที่ ${{f.description.slice(0, 80)}}`,
      tip: `ตอบกรรมการให้เห็นโครงสร้าง Layer ชัดเจน เช่น Controller รับ Request -> Service จัดการ Logic -> Repository ต่อ Database`
    }}),
    // T3: Which file handles action
    (f) => ({{
      category: f.layer + " | " + f.category,
      title: `ในส่วนของ ${{f.category}} คลาสใดต่อไปนี้ทำหน้าที่เป็นตัวจัดการหลัก?`,
      correct: f.className,
      tip: `คลาส ${{f.className}} เป็นตัวขับเคลื่อนหลักในโมดูลนี้ สังเกตจากชื่อคลาสที่ระบุหน้าที่และขอบเขตงานชัดเจน`
    }}),
    // T4: True statement about file
    (f) => ({{
      category: f.layer + " | " + f.category,
      title: `ข้อความใดต่อไปนี้อธิบายหน้าที่ของ <span class="q-code">${{f.fileName}}</span> ได้ถูกต้องที่สุด?`,
      correct: f.description,
      tip: `จำคีย์เวิร์ดสำคัญของ ${{f.fileName}} ไว้ตอบ เช่น หากเป็น Controller จะจัดการ Endpoint หากเป็น Service จะคุม Business Logic และหากเป็น Repository จะยิง JPA/SQL`
    }})
  ];

  let qCount = 0;
  let attempts = 0;
  const maxQ = targetCount === "endless" ? 1500 : parseInt(targetCount, 10);

  while (questions.length < maxQ && attempts < 10000) {{
    attempts++;
    const file = files[qCount % numFiles];
    const templateIndex = Math.floor(Math.random() * templates.length);
    const qData = templates[templateIndex](file);

    // Generate 3 distractors
    let distractors = [];
    if (templateIndex === 1 || templateIndex === 3) {{
      // Filename or classname distractors
      const otherFiles = files.filter(x => x.fileName !== file.fileName);
      shuffleArray(otherFiles);
      distractors = otherFiles.slice(0, 3).map(x => templateIndex === 1 ? x.fileName : x.className);
    }} else {{
      // Description distractors
      const otherFiles = files.filter(x => x.fileName !== file.fileName && x.description !== file.description);
      shuffleArray(otherFiles);
      distractors = otherFiles.slice(0, 3).map(x => x.description);
    }}

    // Construct 4 options
    const options = [qData.correct, ...distractors];
    shuffleArray(options);
    const correctIndex = options.indexOf(qData.correct);

    questions.push({{
      id: `F_${{questions.length + 1}}`,
      type: "file",
      category: qData.category,
      title: qData.title,
      options: options,
      correctIndex: correctIndex,
      explanation: `คำตอบที่ถูกต้องคือ: "<b>${{qData.correct}}</b>"<br>เนื่องจากไฟล์ <code>${{file.fileName}}</code> รับผิดชอบ: ${{file.description}}`,
      defenseTip: qData.tip
    }});

    qCount++;
  }}

  return questions;
}}

function generateWorkflowQuestions(targetCount) {{
  const questions = [];
  const wfs = WORKFLOWS;
  const numWfs = wfs.length;

  const maxQ = targetCount === "endless" ? 1500 : parseInt(targetCount, 10);

  // Each workflow can spawn multiple distinct scenario questions
  let qIndex = 0;
  while (questions.length < maxQ) {{
    const wf = wfs[qIndex % numWfs];
    const subType = Math.floor(qIndex / numWfs) % 5;

    let qObj = null;

    if (subType === 0) {{
      // Question about Summary / Architectural Goal
      qObj = {{
        category: "Workflow | " + wf.topic,
        title: `ในกระบวนการ <b>"${{wf.title}}"</b> ของระบบ SIC มีหลักการทำงานโดยสรุปอย่างไร?`,
        correct: wf.summary,
        distractors: [
          "ให้ Frontend ทำการคำนวณและประมวลผลทั้งหมด แล้วส่งข้อมูลที่สำเร็จรูปมาเก็บลงฐานข้อมูลโดยตรง",
          "เชื่อมต่อผ่าน External Webhook ของ第三方โดยไม่มีการดักตรวจสิทธิ์หรือคัดแยก Tenant",
          "บันทึกไฟล์ชั่วคราวลง Local Storage ของเครื่อง Client แล้วลบทิ้งทุกครั้งที่รีเฟรชหน้าจอ"
        ],
        explanation: wf.summary,
        defenseTip: wf.defenseTip
      }};
    }} else if (subType === 1) {{
      // Question about Key Files involved
      const correctFiles = wf.keyFiles.join(", ");
      const randomOtherWf = wfs[(qIndex + 3) % numWfs];
      const distractor1 = randomOtherWf.keyFiles.join(", ");
      const distractor2 = ["ExExampleController.java", "DbCountryRepository.java", "JacksonInstantConfig.java"].join(", ");
      const distractor3 = ["HealthController.java", "MenuController.java", "ComboboxController.java"].join(", ");

      qObj = {{
        category: "Workflow & Files | " + wf.topic,
        title: `หากต้องการตรวจสอบการทำงานของ <b>"${{wf.title}}"</b> ทั้งกระบวนการ ไฟล์กลุ่มใดคือแกนหลักที่เกี่ยวข้องโดยตรง?`,
        correct: correctFiles,
        distractors: [distractor1, distractor2, distractor3],
        explanation: `กลุ่มไฟล์แกนหลักที่ควบคุมกระบวนการนี้คือ: <code>${{correctFiles}}</code> ซึ่งครอบคลุมตั้งแต่ Interceptor, Service ไปจนถึง Repository`,
        defenseTip: wf.defenseTip
      }};
    }} else if (subType === 2) {{
      // Question about Defense Trap
      qObj = {{
        category: "Defense Trap | " + wf.topic,
        title: `กรรมการถาม: <b>"${{wf.trapQuestion}}"</b> คุณควรตอบด้วยหลักการใดจึงจะถูกต้องที่สุด?`,
        correct: wf.defenseTip,
        distractors: [
          "ตอบว่าระบบไม่ได้จัดการจุดนี้ เพราะปกติผู้ใช้งานทั่วไปจะไม่สังเกตเห็นข้อผิดพลาดนี้",
          "ตอบว่าปัญหาเกิดจากเฟรมเวิร์ก Spring Boot ซึ่งไม่สามารถควบคุมพฤติกรรมในระดับลึกได้",
          "ตอบว่าแก้ไขได้โดยการให้ผู้ใช้กดรีสตาร์ทเบราว์เซอร์ใหม่ทุกครั้งที่เกิดปัญหา"
        ],
        explanation: `ธงคำตอบที่ถูกต้องตามหลักวิศวกรรมซอฟต์แวร์คือ: ${{wf.defenseTip}}`,
        defenseTip: wf.defenseTip
      }};
    }} else if (subType === 3) {{
      // Question about Sequence of steps
      const stepItem = wf.steps[qIndex % wf.steps.length];
      qObj = {{
        category: "Step Sequence | " + wf.topic,
        title: `ในขั้นตอนการทำงานของ <b>"${{wf.title}}"</b> ข้อใดคือขั้นตอนที่ระบบปฏิบัติจริง?`,
        correct: stepItem,
        distractors: [
          "ข้ามการตรวจสอบสิทธิ์ความปลอดภัยแล้วเข้าถึง Database ทันทีเพื่อความรวดเร็ว",
          "อนุญาตให้ผู้ใช้แก้ไขเอกสารที่ได้รับการ Approved แล้วได้ทันทีโดยไม่ต้องเปิด Change Request",
          "ให้ AI เชื่อมต่อฐานข้อมูลโดยตรงผ่าน SQL Agent เพื่อค้นหาข้อมูลข้ามทุกโครงการ"
        ],
        explanation: `ขั้นตอนที่ถูกต้องคือ: <b>${{stepItem}}</b><br>ขั้นตอนทั้งหมดในกระบวนการนี้:<br>${{wf.steps.join("<br>")}}`,
        defenseTip: wf.defenseTip
      }};
    }} else {{
      // Architectural rationale
      qObj = {{
        category: "Architecture Decision | " + wf.topic,
        title: `เหตุใดระบบ SIC จึงเลือกออกแบบกระบวนการ <b>"${{wf.title}}"</b> ในลักษณะนี้?`,
        correct: wf.defenseTip,
        distractors: [
          "เพื่อให้โค้ดมีจำนวนบรรทัดเยอะที่สุดตามเกณฑ์การส่งมอบงานโครงการ",
          "เพื่อเลียนแบบระบบตัวอย่างเก่าโดยไม่ได้พิจารณาเรื่อง Multi-tenancy หรือความปลอดภัย",
          "เพื่อลดการเขียน Unit Test และไม่ต้องจัดการ Transaction"
        ],
        explanation: `เหตุผลทางสถาปัตยกรรม: ${{wf.defenseTip}}`,
        defenseTip: wf.defenseTip
      }};
    }}

    const options = [qObj.correct, ...qObj.distractors];
    shuffleArray(options);
    const correctIndex = options.indexOf(qObj.correct);

    questions.push({{
      id: `W_${{questions.length + 1}}`,
      type: "workflow",
      category: qObj.category,
      title: qObj.title,
      options: options,
      correctIndex: correctIndex,
      explanation: qObj.explanation,
      defenseTip: qObj.defenseTip
    }});

    qIndex++;
  }}

  return questions;
}}

function shuffleArray(arr) {{
  for (let i = arr.length - 1; i > 0; i--) {{
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }}
}}

// APP STATE INITIALIZATION
function initQuiz() {{
  quizMode = document.getElementById("quizModeSelect").value;
  if (quizMode === "study") {{
    showStudyBank();
    return;
  }}

  hideStudyBank();

  if (currentSet === 1) {{
    questionsPool = generateFileQuestions(quizMode);
  }} else {{
    questionsPool = generateWorkflowQuestions(quizMode);
  }}

  currentQuestionIndex = 0;
  userAnswers = {{}};
  score = 0;
  streak = 0;
  answeredCount = 0;

  updateStats();
  renderCurrentQuestion();
}}

function switchSet(setNum) {{
  currentSet = setNum;
  document.getElementById("btnSet1").classList.toggle("active", setNum === 1);
  document.getElementById("btnSet2").classList.toggle("active", setNum === 2);

  if (quizMode === "study") {{
    renderStudyBank();
  }} else {{
    initQuiz();
  }}
}}

function changeQuizMode() {{
  quizMode = document.getElementById("quizModeSelect").value;
  if (quizMode === "study") {{
    showStudyBank();
  }} else {{
    initQuiz();
  }}
}}

function resetQuiz() {{
  initQuiz();
}}

function renderCurrentQuestion() {{
  const q = questionsPool[currentQuestionIndex];
  if (!q) return;

  const total = quizMode === "endless" ? "∞" : questionsPool.length;
  document.getElementById("qCounter").innerText = `ข้อที่ ${{currentQuestionIndex + 1}} / ${{total}}`;
  document.getElementById("qCategory").innerText = q.category;
  document.getElementById("qTitle").innerHTML = q.title;

  // Render 4 Options
  const grid = document.getElementById("optionsGrid");
  grid.innerHTML = "";

  const letters = ["A", "B", "C", "D"];
  const isAnswered = userAnswers.hasOwnProperty(currentQuestionIndex);

  q.options.forEach((opt, idx) => {{
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerHTML = `<span class="opt-letter">${{letters[idx]}}</span> <span>${{opt}}</span>`;
    
    if (isAnswered) {{
      btn.disabled = true;
      const userChoice = userAnswers[currentQuestionIndex];
      if (idx === q.correctIndex) {{
        btn.classList.add("correct");
      }} else if (idx === userChoice) {{
        btn.classList.add("wrong");
      }}
    }} else {{
      btn.onclick = () => handleAnswer(idx);
    }}

    grid.appendChild(btn);
  }});

  // Feedback Box
  const fBox = document.getElementById("feedbackBox");
  if (isAnswered) {{
    const userChoice = userAnswers[currentQuestionIndex];
    const isCorrect = userChoice === q.correctIndex;

    fBox.classList.add("show");
    const fHeader = document.getElementById("feedbackHeader");
    fHeader.className = "feedback-header " + (isCorrect ? "is-correct" : "is-wrong");
    document.getElementById("feedbackIcon").innerText = isCorrect ? "✅" : "❌";
    document.getElementById("feedbackTitle").innerText = isCorrect ? "ถูกต้องยอดเยี่ยม!" : "ยังไม่ถูกต้อง";
    document.getElementById("feedbackDesc").innerHTML = q.explanation;
    document.getElementById("defenseTipText").innerText = q.defenseTip;
  }} else {{
    fBox.classList.remove("show");
  }}

  // Navigation buttons
  document.getElementById("prevBtn").disabled = currentQuestionIndex === 0;
  document.getElementById("nextBtn").disabled = !isAnswered;

  // Progress Bar
  const pct = ((currentQuestionIndex + (isAnswered ? 1 : 0)) / questionsPool.length) * 100;
  document.getElementById("progressBar").style.width = `${{Math.min(pct, 100)}}%`;
}}

function handleAnswer(selectedIndex) {{
  if (userAnswers.hasOwnProperty(currentQuestionIndex)) return;

  const q = questionsPool[currentQuestionIndex];
  userAnswers[currentQuestionIndex] = selectedIndex;
  answeredCount++;

  const isCorrect = selectedIndex === q.correctIndex;
  if (isCorrect) {{
    score++;
    streak++;
  }} else {{
    streak = 0;
  }}

  updateStats();
  renderCurrentQuestion();

  // If last question in finite quiz
  if (quizMode !== "endless" && answeredCount === questionsPool.length) {{
    setTimeout(showCompletionModal, 1200);
  }}
}}

function nextQuestion() {{
  if (currentQuestionIndex < questionsPool.length - 1) {{
    currentQuestionIndex++;
    renderCurrentQuestion();
  }} else if (quizMode === "endless") {{
    // Append more questions dynamically
    const moreQ = currentSet === 1 ? generateFileQuestions(50) : generateWorkflowQuestions(50);
    questionsPool.push(...moreQ);
    currentQuestionIndex++;
    renderCurrentQuestion();
  }}
}}

function prevQuestion() {{
  if (currentQuestionIndex > 0) {{
    currentQuestionIndex--;
    renderCurrentQuestion();
  }}
}}

function updateStats() {{
  document.getElementById("scoreDisplay").innerText = score;
  document.getElementById("streakDisplay").innerText = `${{streak}} 🔥`;
  const acc = answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0;
  document.getElementById("accDisplay").innerText = `${{acc}}%`;
}}

function showCompletionModal() {{
  const modal = document.getElementById("completionModal");
  const pct = Math.round((score / questionsPool.length) * 100);
  document.getElementById("modalScorePct").innerText = `${{pct}}%`;

  let msg = `คุณตอบถูก ${{score}} จาก ${{questionsPool.length}} ข้อ `;
  if (pct >= 85) {{
    msg += "🎉 ความพร้อมระดับยอดเยี่ยม! คุณสามารถอธิบายสถาปัตยกรรม SIC และตอบคำถามกรรมการได้อย่างมั่นใจในระดับ Senior Engineer!";
  }} else if (pct >= 60) {{
    msg += "👍 ความพร้อมระดับดี ผ่านเกณฑ์พื้นฐาน ควรทบทวนจุดที่ตอบผิดอีกเล็กน้อยก่อนขึ้นพรีเซนต์";
  }} else {{
    msg += "⚠️ แนะนำให้อ่านคลังคำถาม (Study Bank) ทบทวนเพิ่มเติมเพื่อเสริมความมั่นใจในการตอบคำถามของระบบ";
  }}

  document.getElementById("modalFeedbackText").innerText = msg;
  modal.classList.add("show");
}}

function closeModalAndRestart() {{
  document.getElementById("completionModal").classList.remove("show");
  initQuiz();
}}

function openStudyBankFromModal() {{
  document.getElementById("completionModal").classList.remove("show");
  document.getElementById("quizModeSelect").value = "study";
  changeQuizMode();
}}

// STUDY BANK LOGIC
function showStudyBank() {{
  document.getElementById("quizCard").style.display = "none";
  document.getElementById("progressWrap").style.display = "none";
  document.getElementById("studyContainer").classList.add("active");
  renderStudyBank();
}}

function hideStudyBank() {{
  document.getElementById("quizCard").style.display = "flex";
  document.getElementById("progressWrap").style.display = "block";
  document.getElementById("studyContainer").classList.remove("active");
}}

function filterStudyLayer(layer) {{
  selectedStudyFilter = layer;
  const chips = document.querySelectorAll(".chip");
  chips.forEach(c => {{
    c.classList.toggle("active", c.innerText.includes(layer) || (layer === "ALL" && c.innerText === "ทั้งหมด"));
  }});
  renderStudyBank();
}}

function renderStudyBank() {{
  const container = document.getElementById("studyList");
  container.innerHTML = "";
  const query = document.getElementById("studySearchInput").value.trim().toLowerCase();

  if (currentSet === 1) {{
    // Render Files
    let filtered = BACKEND_FILES;
    if (selectedStudyFilter !== "ALL") {{
      filtered = filtered.filter(f => f.layer.toLowerCase().includes(selectedStudyFilter.toLowerCase()));
    }}
    if (query) {{
      filtered = filtered.filter(f => 
        f.fileName.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query)
      );
    }}

    if (filtered.length === 0) {{
      container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">ไม่พบไฟล์ที่ตรงกับคำค้นหา</div>`;
      return;
    }}

    filtered.forEach(f => {{
      const card = document.createElement("div");
      card.className = "study-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="pill">${{f.layer}} | ${{f.category}}</span>
          <span style="font-size:0.8rem; color:var(--text-secondary); font-family:monospace;">${{f.fileName}}</span>
        </div>
        <h3 style="color:#38bdf8;">📁 ${{f.className}}</h3>
        <p style="color:#cbd5e1; font-size:0.95rem; line-height:1.5;">${{f.description}}</p>
        <div class="defense-tip-box" style="margin-top:0.35rem;">
          <div class="defense-tip-title">💡 ธงคำตอบถ้ากรรมการถามถึงไฟล์นี้:</div>
          <div class="defense-tip-text">อยู่ในเลเยอร์ ${{f.layer}} ของระบบ SIC เน้นอธิบายว่าช่วยแยกความรับผิดชอบ (Separation of Concerns) ตาม Clean Architecture และเชื่อมโยงกับการทำงานแบบ Multi-Tenant</div>
        </div>
      `;
      container.appendChild(card);
    }});
  }} else {{
    // Render Workflows
    let filtered = WORKFLOWS;
    if (query) {{
      filtered = filtered.filter(w => 
        w.title.toLowerCase().includes(query) ||
        w.summary.toLowerCase().includes(query) ||
        w.topic.toLowerCase().includes(query) ||
        w.keyFiles.some(kf => kf.toLowerCase().includes(query)) ||
        w.defenseTip.toLowerCase().includes(query)
      );
    }}

    if (filtered.length === 0) {{
      container.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">ไม่พบกระบวนการที่ตรงกับคำค้นหา</div>`;
      return;
    }}

    filtered.forEach(w => {{
      const card = document.createElement("div");
      card.className = "study-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="pill" style="background:rgba(168,85,247,0.15); color:#c084fc; border-color:rgba(168,85,247,0.3);">${{w.topic}}</span>
          <span style="font-size:0.8rem; color:var(--text-secondary);">${{w.id}}</span>
        </div>
        <h3 style="color:#f8fafc; font-size:1.15rem;">⚙️ ${{w.title}}</h3>
        <p style="color:#cbd5e1; font-size:0.95rem; line-height:1.6;">${{w.summary}}</p>
        
        <div style="background:#090d16; padding:0.85rem; border-radius:8px; border:1px solid #1e293b; margin:0.35rem 0;">
          <strong style="color:var(--accent); font-size:0.85rem;">ลำดับขั้นตอนการทำงาน (Flow Steps):</strong>
          <ol style="margin-left:1.25rem; margin-top:0.4rem; color:#94a3b8; font-size:0.85rem; line-height:1.6;">
            ${{w.steps.map(s => `<li>${{s}}</li>`).join("")}}
          </ol>
        </div>

        <div style="font-size:0.85rem; color:#94a3b8;">
          <strong>ไฟล์แกนหลักที่เกี่ยวข้อง:</strong> <code>${{w.keyFiles.join(", ")}}</code>
        </div>

        <div class="defense-tip-box" style="margin-top:0.5rem;">
          <div class="defense-tip-title">🎯 คำถามดักของกรรมการ: "${{w.trapQuestion}}"</div>
          <div class="defense-tip-text"><b>แนวทางการตอบ:</b> ${{w.defenseTip}}</div>
        </div>
      `;
      container.appendChild(card);
    }});
  }}
}}

// START APPLICATION ON LOAD
window.onload = () => {{
  initQuiz();
}};
</script>

</body>
</html>
"""

if __name__ == "__main__":
    build_quiz()
