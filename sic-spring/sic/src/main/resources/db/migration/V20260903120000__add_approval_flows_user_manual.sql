-- V20260903120000__add_approval_flows_user_manual.sql
-- Add USER_MANUAL parameter and default approval flow for USER_MANUAL

-- 1. Ensure USER_MANUAL exists in su_parameter (DOCUMENT_TYPE)
INSERT INTO su_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'USER_MANUAL', 'User Manual', 'คู่มือการใช้งาน (User Manual)', true, 13, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (
    SELECT 1 FROM su_parameter WHERE module_code = 'PM' AND parameter_code = 'DOCUMENT_TYPE' AND parameter_value = 'USER_MANUAL'
);

