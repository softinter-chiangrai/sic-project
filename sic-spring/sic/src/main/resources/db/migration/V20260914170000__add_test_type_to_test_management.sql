-- V20260914170000__add_test_type_to_test_management.sql

-- 1. Add test_type to pm_test_scenario
ALTER TABLE public.pm_test_scenario
    ADD COLUMN IF NOT EXISTS test_type VARCHAR(20) DEFAULT 'SIT';

-- 2. Add test_type to pm_test_case
ALTER TABLE public.pm_test_case
    ADD COLUMN IF NOT EXISTS test_type VARCHAR(20) DEFAULT 'SIT';

-- 3. Seed Parameter LOV for TEST_TYPE
INSERT INTO public.db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'PM', 'TEST_TYPE', 'SIT', 'System Integration Testing (SIT)', 'การทดสอบระบบภายใน (SIT)', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_TYPE', 'UAT', 'User Acceptance Testing (UAT)', 'การตรวจรับระบบโดยผู้ใช้ (UAT)', true, 2, 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, parameter_code, parameter_value) DO NOTHING;
