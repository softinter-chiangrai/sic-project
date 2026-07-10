-- ============================================================
-- SCRIPT สำหรับเพิ่ม Enum / Combobox / LOV ทั้งหมดในระบบ (เวอร์ชันยุบรวมข้อมูลซ้ำ)
-- อ้างอิงตามเอกสาร READMEInformation.md
-- ============================================================

-- ============================================================
-- 1. กลุ่มข้อมูลพื้นฐานทั่วไป (COMMON) - ใช้ร่วมกันหลายโมดูล
-- ============================================================

-- 1.1 สถานะเอกสาร (DOC_STATUS) - ใช้กับ Requirement, DFD, ER, Specification, Approval, Confirm
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'DRAFT', 'Draft', 'ร่าง', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'IN_REVIEW', 'In Review', 'กำลังตรวจสอบ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'APPROVED', 'Approved', 'อนุมัติแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'REJECTED', 'Rejected', 'ถูกปฏิเสธ', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'NEED_REVISION', 'Need Revision', 'ต้องแก้ไข', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'CANCELLED', 'Cancelled', 'ยกเลิก', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'CHANGED', 'Changed', 'เปลี่ยนแปลงแล้ว', true, 7, 'system', NOW(), 'system', NOW(), false);

-- 1.2 สถานะความคืบหน้า (PROGRESS_STATUS) - ใช้กับ Phase, Milestone, Work Package
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'NOT_STARTED', 'Not Started', 'ยังไม่เริ่ม', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'DONE', 'Done', 'เสร็จสิ้น', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'DELAYED', 'Delayed', 'ล่าช้า', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'BLOCKED', 'Blocked', 'ติดปัญหา', true, 5, 'system', NOW(), 'system', NOW(), false);

-- 1.3 สถานะงานเฉพาะ (TASK_STATUS) - ใช้กับ Development Task โดยเฉพาะ (มีสถานะเพิ่มเติมจาก PROGRESS_STATUS)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'TODO', 'Todo', 'ยังไม่เริ่ม', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'IN_PROGRESS', 'In Progress', 'กำลังทำ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'WAITING_REVIEW', 'Waiting Review', 'รอตรวจสอบ', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'WAITING_FIX', 'Waiting Fix', 'รอแก้ไข', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'DONE', 'Done', 'เสร็จแล้ว', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'DELAYED', 'Delayed', 'ล่าช้า', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'BLOCKED', 'Blocked', 'ติดปัญหา', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'CANCELLED', 'Cancelled', 'ยกเลิก', true, 8, 'system', NOW(), 'system', NOW(), false);

-- 1.4 สถานะปัญหาและข้อบกพร่อง (ISSUE_STATUS) - ใช้กับ Bug และ MA Ticket
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'OPEN', 'Open', 'เปิดอยู่', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'WAITING_CUSTOMER', 'Waiting Customer', 'รอลูกค้ายืนยัน', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'RESOLVED', 'Resolved', 'แก้ไขแล้ว', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'CLOSED', 'Closed', 'ปิดแล้ว', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'FIXING', 'Fixing', 'กำลังแก้ไข', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'FIXED', 'Fixed', 'แก้ไขเสร็จ', true, 8, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'RETEST', 'Retest', 'ทดสอบซ้ำ', true, 9, 'system', NOW(), 'system', NOW(), false);

-- 1.5 ระดับความสำคัญทั่วไป (PRIORITY)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'LOW', 'Low', 'ต่ำ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'MEDIUM', 'Medium', 'ปานกลาง', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'HIGH', 'High', 'สูง', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'CRITICAL', 'Critical', 'วิกฤต', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'URGENT', 'Urgent', 'ด่วน', true, 5, 'system', NOW(), 'system', NOW(), false);

-- 1.7 คุณค่าทางธุรกิจ (BUSINESS_VALUE)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'BUSINESS_VALUE', 'HIGH', 'High', 'สูง', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'BUSINESS_VALUE', 'MEDIUM', 'Medium', 'ปานกลาง', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'BUSINESS_VALUE', 'LOW', 'Low', 'ต่ำ', true, 3, 'system', NOW(), 'system', NOW(), false);

-- 2.3 สถานะการลงนาม (SIGN_STATUS)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'DRAFT', 'Draft', 'ร่าง', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'SENT', 'Sent', 'ส่งแล้ว', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'SIGNED', 'Signed', 'ลงนามแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'EXPIRED', 'Expired', 'หมดอายุ', true, 4, 'system', NOW(), 'system', NOW(), false);

-- 2.4 สถานะการต่ออายุ (RENEWAL_STATUS)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'RENEWAL_STATUS', 'NOT_RENEWED', 'Not Renewed', 'ยังไม่ต่อ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'RENEWAL_STATUS', 'PENDING', 'Pending Renewal', 'รอต่อ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'RENEWAL_STATUS', 'RENEWED', 'Renewed', 'ต่อแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false);

-- 2.5 สถานะโครงการ (PROJECT_STATUS) - SDLC 20 สถานะ
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'PROSPECT', 'Prospect', 'อยู่ระหว่างคุยงานกับลูกค้า', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'CONTRACT_DRAFTING', 'Contract Drafting', 'อยู่ระหว่างจัดทำสัญญา', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'CONTRACT_SIGNED', 'Contract Signed', 'ลงนามสัญญาแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'REQUIREMENT_GATHERING', 'Requirement Gathering', 'เก็บ Requirement', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'REQUIREMENT_APPROVAL', 'Requirement Approval', 'รออนุมัติ Requirement', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'SYSTEM_ANALYSIS', 'System Analysis', 'วิเคราะห์ระบบ', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'USECASE_DESIGN', 'Usecase Diagram Design', 'ออกแบบ Usecase Diagram', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DFD_DESIGN', 'DFD Design', 'ออกแบบ Data Flow Diagram', true, 8, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'ER_DESIGN', 'ER Design', 'ออกแบบ ER Diagram', true, 9, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'SPECIFICATION_DESIGN', 'Specification Design', 'ทำ Specification', true, 10, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'SPECIFICATION_APPROVAL', 'Specification Approval', 'รออนุมัติ Specification', true, 11, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'PLANNING', 'Planning', 'วางแผนงาน Development', true, 12, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DEVELOPMENT', 'Development', 'กำลังพัฒนา', true, 13, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'INTERNAL_TESTING', 'Internal Testing', 'ทดสอบภายใน', true, 14, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'UAT', 'UAT', 'ลูกค้าทดสอบ (UAT)', true, 15, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'BUG_FIXING', 'Bug Fixing', 'แก้ไข Bug', true, 16, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'READY_FOR_DELIVERY', 'Ready for Delivery', 'พร้อมส่งมอบ', true, 17, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DELIVERED', 'Delivered', 'ส่งมอบแล้ว', true, 18, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'INVOICING', 'Invoicing', 'ออกใบแจ้งหนี้', true, 19, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'CLOSED', 'Closed', 'ปิดโครงการ', true, 20, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'MA_ACTIVE', 'MA Active', 'อยู่ในระยะ MA', true, 21, 'system', NOW(), 'system', NOW(), false);

-- 2.6 ลำดับความสำคัญของ Requirement (REQ_PRIORITY - MoSCoW)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'MUST', 'Must Have', 'ต้องมี', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'SHOULD', 'Should Have', 'ควรมี', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'COULD', 'Could Have', 'มีก็ได้', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'WONT', 'Wont Have', 'ไม่มีก็ได้', true, 4, 'system', NOW(), 'system', NOW(), false);

-- 2.13 สถานะการทดสอบ (TEST_STATUS)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'TEST_STATUS', 'PASS', 'Pass', 'ผ่าน', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_STATUS', 'FAIL', 'Fail', 'ไม่ผ่าน', true, 2, 'system', NOW(), 'system', NOW(), false);

-- 2.17 สถานะการชำระเงิน (PAYMENT_STATUS)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'UNPAID', 'Unpaid', 'ค้างชำระ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'PARTIAL', 'Partial', 'ชำระบางส่วน', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'PAID', 'Paid', 'ชำระแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'OVERDUE', 'Overdue', 'เกินกำหนด', true, 4, 'system', NOW(), 'system', NOW(), false);

-- ============================================================
-- 1.8 โหมดการอนุมัติ (APPROVAL_MODE) - ใช้เฉพาะโมดูล PM
-- ============================================================
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'CHAIN', 'Chain', 'เรียงลำดับ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'PARALLEL', 'Parallel', 'พร้อมกัน', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'ANY', 'Any', 'ใครก็ได้', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'SINGLE', 'Single', 'คนเดียว', true, 4, 'system', NOW(), 'system', NOW(), false);