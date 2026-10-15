-- V20260912172000__seed_default_admin_approval_flows_for_all_doc_types.sql
-- สร้างและตั้งค่า Default Approval Flow สำหรับเอกสารทุกประเภท (Admin อนุมัติ 1 คน, กำหนดเวลา 1 วัน, เกินเวลาปฏิเสธอัตโนมัติ AUTO_REJECT)

-- 1. Ensure all DOCUMENT_TYPE parameters exist in db_parameter
INSERT INTO db_parameter (
    id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local,
    is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete
)
VALUES
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'REQUIREMENT',    'Requirement',    'ข้อกำหนดความต้องการ',       true, 1,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'SPECIFICATION',  'Specification',  'ข้อกำหนดเชิงเทคนิค',       true, 2,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DIAGRAM',        'Diagram',        'แผนภาพระบบ',               true, 3,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DESIGN_REVIEW',  'Design Review',  'การตรวจรับแบบดีไซน์',        true, 4,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CHANGE_REQUEST', 'Change Request', 'คำขอเปลี่ยนแปลง',           true, 5,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TEST_PLAN',      'Test Plan',      'แผนการทดสอบ',               true, 6,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'UAT',            'UAT',            'การตรวจรับระบบโดยผู้ใช้',      true, 7,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DELIVERY',       'Delivery',       'เอกสารส่งมอบงาน',           true, 8,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'INVOICE',        'Invoice',        'ใบแจ้งหนี้',                 true, 9,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_RENEWAL',     'MA Renewal',     'ต่ออายุสัญญาบำรุงรักษา',      true, 10, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TASK',           'Task',           'งาน / กิจกรรม',             true, 11, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CONTRACT',       'Contract',       'สัญญา',                     true, 12, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_TICKET',      'MA Ticket',      'ตั๋วแจ้งปัญหา MA',           true, 13, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'USER_MANUAL',    'User Manual',    'คู่มือการใช้งาน',             true, 14, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'PROJECT',        'Project',        'โครงการ',                   true, 15, 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, parameter_code, parameter_value)
DO UPDATE SET
    parameter_name_en    = EXCLUDED.parameter_name_en,
    parameter_name_local = EXCLUDED.parameter_name_local,
    is_active            = true,
    sort_order           = EXCLUDED.sort_order,
    updated_by           = 'system',
    updated_date         = NOW(),
    is_delete            = false;

-- 2. Ensure all ADMIN roles in every business have full access to all active programs
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    'system',
    NOW(),
    'system',
    NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE r.role_code = 'ADMIN'
  AND r.is_active = true 
  AND r.is_delete = false
  AND p.is_active = true 
  AND p.is_delete = false
ON CONFLICT (business_role_id, program_id) 
DO UPDATE SET
    is_active = true,
    is_add = true,
    is_back = true,
    is_print = true,
    is_remove = true,
    is_save = true,
    is_search = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

