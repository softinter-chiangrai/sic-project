-- ============================================================
-- 1.8 โหมดการอนุมัติ (APPROVAL_MODE) - ใช้เฉพาะโมดูล PM
-- ============================================================
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'CHAIN', 'Chain', 'เรียงลำดับ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'PARALLEL', 'Parallel', 'พร้อมกัน', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'ANY', 'Any', 'ใครก็ได้', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'SINGLE', 'Single', 'คนเดียว', true, 4, 'system', NOW(), 'system', NOW(), false);