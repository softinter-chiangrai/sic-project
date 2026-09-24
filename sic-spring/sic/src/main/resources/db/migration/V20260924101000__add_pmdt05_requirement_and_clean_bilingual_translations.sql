-- Migration: Add PMDT05 Requirement translations and remove English parentheses from requirement labels
-- File: V20260924101000__add_pmdt05_requirement_and_clean_bilingual_translations.sql

-- 1. PMDT05_REQUIREMENT_LABEL
UPDATE su_message 
SET message_en = 'Requirement', message_local = 'ความต้องการ', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'PMDT05_REQUIREMENT_LABEL';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REQUIREMENT_LABEL', 'Requirement', 'ความต้องการ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REQUIREMENT_LABEL');

-- 2. PMDT05_REQUIREMENT_PLACEHOLDER
UPDATE su_message 
SET message_en = 'Select related requirement (optional)', message_local = 'เลือกความต้องการที่เกี่ยวข้อง (ไม่บังคับ)', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'PMDT05_REQUIREMENT_PLACEHOLDER';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REQUIREMENT_PLACEHOLDER', 'Select related requirement (optional)', 'เลือกความต้องการที่เกี่ยวข้อง (ไม่บังคับ)', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REQUIREMENT_PLACEHOLDER');

-- 3. PMDT05_REQ_SOURCE_LABEL
UPDATE su_message 
SET message_en = 'Source Requirement:', message_local = 'ความต้องการต้นทาง:', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'PMDT05_REQ_SOURCE_LABEL';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REQ_SOURCE_LABEL', 'Source Requirement:', 'ความต้องการต้นทาง:', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REQ_SOURCE_LABEL');

-- 4. Clean up existing requirement labels with (Requirement) in message_local
UPDATE su_message 
SET message_local = 'ความต้องการ', updated_by = 'system', updated_date = NOW() 
WHERE message_code IN ('PMDT07_REQUIREMENT_LABEL', 'PMDT06_TARGET_REQUIREMENT', 'PMDT06_TARGET_REQ_FULL');

UPDATE su_message 
SET message_local = 'รายการความต้องการ', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'PMDT04_PAGE_TITLE';
