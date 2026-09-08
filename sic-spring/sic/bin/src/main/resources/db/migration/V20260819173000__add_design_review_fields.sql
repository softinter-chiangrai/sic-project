-- V20260819173000__add_design_review_fields.sql

ALTER TABLE pm_design_review
    ADD COLUMN IF NOT EXISTS review_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'Medium',
    ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100),
    ADD COLUMN IF NOT EXISTS figma_url TEXT,
    ADD COLUMN IF NOT EXISTS embed_mode VARCHAR(20) DEFAULT 'prototype',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_design_review_project ON pm_design_review(project_id);
CREATE INDEX IF NOT EXISTS idx_design_review_code ON pm_design_review(review_code);

-- 1. ทำเครื่องหมายลบหรือไม่ใช้งานค่าเดิม DFD / ER ที่เคยแยกไว้ (หรือลบทิ้ง)
DELETE FROM db_parameter 
WHERE module_code = 'PM' 
  AND parameter_code = 'DOCUMENT_TYPE' 
  AND parameter_value IN ('DFD', 'ER');

-- 2. แทรก/อัปเดตประเภทเอกสารทั้งหมดให้ตรงตามระบบจริง
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
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'REQUIREMENT',    'Requirement',    'เอกสารความต้องการ',       true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'SPECIFICATION',  'Specification',  'เอกสารกำหนดคุณลักษณะ',     true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DIAGRAM',        'Diagram',        'แผนภาพระบบ (DFD/ER/Flow)', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DESIGN_REVIEW',  'Design Review',  'การตรวจรับแบบดีไซน์',      true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CHANGE_REQUEST', 'Change Request', 'คำขอเปลี่ยนแปลง (CR)',    true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TEST_PLAN',      'Test Plan',      'แผนการทดสอบ',             true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'UAT',            'UAT',            'การตรวจรับระบบโดยผู้ใช้',    true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DELIVERY',       'Delivery',       'เอกสารส่งมอบงาน',         true, 8, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'INVOICE',        'Invoice',        'ใบแจ้งหนี้ / ใบเสร็จ',       true, 9, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_RENEWAL',     'MA Renewal',     'ต่ออายุสัญญาบำรุงรักษา (MA)', true, 10, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TASK',           'Task',           'งาน / กิจกรรม',           true, 11, 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, parameter_code, parameter_value) 
DO UPDATE SET
    parameter_name_en    = EXCLUDED.parameter_name_en,
    parameter_name_local = EXCLUDED.parameter_name_local,
    is_active            = EXCLUDED.is_active,
    sort_order           = EXCLUDED.sort_order,
    updated_by           = 'system',
    updated_date         = NOW(),
    is_delete            = false;
