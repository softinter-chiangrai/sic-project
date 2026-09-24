-- Migration: V20260924115000__fix_pmdt01_empty_state_and_ui_translations.sql
-- Description: Fix PMDT01 WBS empty state and UI translations in su_message

-- 1. PMDT01_EMPTY_TITLE
UPDATE su_message 
SET message_en = 'No Phases in this Project', 
    message_local = 'ยังไม่มี Phase ในโครงการนี้', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_EMPTY_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'PMDT01', 'PMDT01_EMPTY_TITLE', 'No Phases in this Project', 'ยังไม่มี Phase ในโครงการนี้', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EMPTY_TITLE');

-- 2. PMDT01_EMPTY_HINT
UPDATE su_message 
SET message_en = 'Get started by clicking "+ Add Phase" above to plan project phases and milestones.', 
    message_local = 'เริ่มต้นด้วยการคลิกปุ่ม "+ เพิ่ม Phase" ด้านบนเพื่อวางแผนงานและไมล์สโตน', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_EMPTY_HINT';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'PMDT01', 'PMDT01_EMPTY_HINT', 'Get started by clicking "+ Add Phase" above to plan project phases and milestones.', 'เริ่มต้นด้วยการคลิกปุ่ม "+ เพิ่ม Phase" ด้านบนเพื่อวางแผนงานและไมล์สโตน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EMPTY_HINT');

-- 3. PMDT01_SAVE
UPDATE su_message 
SET message_en = 'Save', 
    message_local = 'บันทึก', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_SAVE';

-- 4. PMDT01_NO_DESCRIPTION
UPDATE su_message 
SET message_en = 'No description', 
    message_local = 'ไม่มีคำอธิบาย', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_NO_DESCRIPTION';

-- 5. PMDT01_CREATE_SUCCESS_MSG
UPDATE su_message 
SET message_en = 'Phase created successfully', 
    message_local = 'สร้าง Phase เรียบร้อยแล้ว', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_CREATE_SUCCESS_MSG';

-- 6. PMDT01_UPDATE_SUCCESS_MSG
UPDATE su_message 
SET message_en = 'Phase updated successfully', 
    message_local = 'บันทึกการแก้ไข Phase เรียบร้อยแล้ว', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_UPDATE_SUCCESS_MSG';

-- 7. PMDT01_LOAD_FAIL_MSG
UPDATE su_message 
SET message_en = 'Failed to load phase data', 
    message_local = 'ไม่สามารถโหลดข้อมูล Phase ได้', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_LOAD_FAIL_MSG';

-- 8. PMDT01_FILL_ALL_FIELDS
UPDATE su_message 
SET message_en = 'Please fill in all required fields (*)', 
    message_local = 'กรุณากรอกข้อมูลในช่องที่จำเป็น (*) ให้ครบถ้วน', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_FILL_ALL_FIELDS';

-- 9. PMDT01_INVALID_DATA_TITLE
UPDATE su_message 
SET message_en = 'Incomplete Data', 
    message_local = 'ข้อมูลไม่ครบถ้วน', 
    updated_by = 'system', 
    updated_date = NOW() 
WHERE message_code = 'PMDT01_INVALID_DATA_TITLE';
