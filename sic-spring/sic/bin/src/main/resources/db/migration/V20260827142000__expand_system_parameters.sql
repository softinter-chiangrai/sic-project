-- V20260827142000__expand_system_parameters.sql
-- เพิ่มเติมพารามิเตอร์ระบบให้ครอบคลุมทั้งโปรเจกต์ พร้อมรองรับ 2 ภาษา (i18n Header standard)

INSERT INTO db_parameter (
    id,
    module_code,
    parameter_code,
    parameter_value,
    parameter_name_en,
    parameter_name_local,
    is_active,
    sort_order,
    created_by,
    created_date,
    updated_by,
    updated_date,
    is_delete
)
VALUES
    -- 1. สถานะการทดสอบ (TEST_STATUS) เพิ่มเติม
    (gen_random_uuid(), 'PM', 'TEST_STATUS', 'BLOCKED', 'Blocked', 'ติดปัญหา', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_STATUS', 'PENDING', 'Pending', 'รอทดสอบ', true, 4, 'system', NOW(), 'system', NOW(), false),

    -- 2. ระดับความรุนแรงของปัญหา/การตรวจแบบ (TEST_SEVERITY)
    (gen_random_uuid(), 'PM', 'TEST_SEVERITY', 'CRITICAL', 'Critical', 'วิกฤต', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_SEVERITY', 'HIGH', 'High', 'สูง', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_SEVERITY', 'MEDIUM', 'Medium', 'ปานกลาง', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_SEVERITY', 'LOW', 'Low', 'ต่ำ', true, 4, 'system', NOW(), 'system', NOW(), false),

    -- 3. สถานะการตรวจแบบสถาปัตยกรรม/ดีไซน์ (DESIGN_REVIEW_STATUS)
    (gen_random_uuid(), 'PM', 'DESIGN_REVIEW_STATUS', 'PENDING', 'Pending', 'รอตรวจสอบ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DESIGN_REVIEW_STATUS', 'IN_REVIEW', 'In Review', 'กำลังตรวจสอบ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DESIGN_REVIEW_STATUS', 'APPROVED', 'Approved', 'อนุมัติผ่าน', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DESIGN_REVIEW_STATUS', 'REVISION_REQUIRED', 'Revision Required', 'ต้องแก้ไขแบบ', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DESIGN_REVIEW_STATUS', 'REJECTED', 'Rejected', 'ไม่อนุมัติ', true, 5, 'system', NOW(), 'system', NOW(), false),

    -- 4. วงจรการส่งมอบโครงการ (SDLC_STAGE)
    (gen_random_uuid(), 'PM', 'SDLC_STAGE', 'PLANNING', 'Planning & Req', 'วิเคราะห์ความต้องการ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SDLC_STAGE', 'DESIGN', 'Design & Review', 'ตรวจแบบและสถาปัตยกรรม', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SDLC_STAGE', 'DEVELOPMENT', 'Development', 'กำลังพัฒนาโค้ดและระบบ', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SDLC_STAGE', 'TESTING', 'Testing & QA', 'ทดสอบและตรวจรับงาน', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SDLC_STAGE', 'RELEASE', 'Release / Prod', 'ขึ้นระบบและส่งมอบสำเร็จ', true, 5, 'system', NOW(), 'system', NOW(), false),

    -- 5. ประเภทการแจ้งเตือน (NOTIFICATION_TYPE)
    (gen_random_uuid(), 'COMMON', 'NOTIFICATION_TYPE', 'TASK_ASSIGNED', 'Task Assigned', 'มอบหมายงานใหม่', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'NOTIFICATION_TYPE', 'APPROVAL_REQUEST', 'Approval Request', 'คำขออนุมัติ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'NOTIFICATION_TYPE', 'TEST_FAILED', 'Test Failed', 'ผลการทดสอบไม่ผ่าน', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'NOTIFICATION_TYPE', 'DOCUMENT_UPDATED', 'Document Updated', 'เอกสารมีการเปลี่ยนแปลง', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'NOTIFICATION_TYPE', 'SYSTEM', 'System Announcement', 'ประกาศจากระบบ', true, 5, 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, parameter_code, parameter_value)
DO UPDATE SET
    parameter_name_en    = EXCLUDED.parameter_name_en,
    parameter_name_local = EXCLUDED.parameter_name_local,
    is_active            = EXCLUDED.is_active,
    sort_order           = EXCLUDED.sort_order,
    updated_by           = 'system',
    updated_date         = NOW(),
    is_delete            = false;
