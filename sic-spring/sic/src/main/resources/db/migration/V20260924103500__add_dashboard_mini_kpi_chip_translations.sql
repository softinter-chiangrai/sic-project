-- Migration: V20260924103500__add_dashboard_mini_kpi_chip_translations.sql
-- Description: Add Dashboard Live Mini KPI Chip UI translations to su_message

-- 1. DASHBOARD_CHIP_ACTIVE_PROJECTS
UPDATE su_message 
SET message_en = 'Active Projects', message_local = 'โครงการดำเนินงาน', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'DASHBOARD_CHIP_ACTIVE_PROJECTS';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'DASHBOARD_CHIP_ACTIVE_PROJECTS', 'Active Projects', 'โครงการดำเนินงาน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'DASHBOARD_CHIP_ACTIVE_PROJECTS');

-- 2. DASHBOARD_CHIP_PENDING_APPROVALS
UPDATE su_message 
SET message_en = 'Pending Approvals', message_local = 'รออนุมัติ', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'DASHBOARD_CHIP_PENDING_APPROVALS';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'DASHBOARD_CHIP_PENDING_APPROVALS', 'Pending Approvals', 'รออนุมัติ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'DASHBOARD_CHIP_PENDING_APPROVALS');

-- 3. DASHBOARD_CHIP_OPEN_BUGS
UPDATE su_message 
SET message_en = 'Open Bugs', message_local = 'บั๊กค้าง', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'DASHBOARD_CHIP_OPEN_BUGS';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'DASHBOARD_CHIP_OPEN_BUGS', 'Open Bugs', 'บั๊กค้าง', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'DASHBOARD_CHIP_OPEN_BUGS');

-- 4. DASHBOARD_CHIP_EXPIRING_CONTRACTS
UPDATE su_message 
SET message_en = 'Expiring Contracts', message_local = 'สัญญาใกล้หมดอายุ', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'DASHBOARD_CHIP_EXPIRING_CONTRACTS';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'DASHBOARD_CHIP_EXPIRING_CONTRACTS', 'Expiring Contracts', 'สัญญาใกล้หมดอายุ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'DASHBOARD_CHIP_EXPIRING_CONTRACTS');
