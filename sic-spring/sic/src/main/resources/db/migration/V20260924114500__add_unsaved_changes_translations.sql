-- Migration: V20260924114500__add_unsaved_changes_translations.sql
-- Description: Add unsaved changes confirmation dialog translations to su_message

-- 1. COMMON_UNSAVED_CHANGES_TITLE
UPDATE su_message 
SET message_en = 'Unsaved Changes', message_local = 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_UNSAVED_CHANGES_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_UNSAVED_CHANGES_TITLE', 'Unsaved Changes', 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_UNSAVED_CHANGES_TITLE');

-- 2. COMMON_UNSAVED_CHANGES_MSG
UPDATE su_message 
SET message_en = 'You have unsaved changes. Leave this page anyway?', message_local = 'คุณมีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_UNSAVED_CHANGES_MSG';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_UNSAVED_CHANGES_MSG', 'You have unsaved changes. Leave this page anyway?', 'คุณมีการเปลี่ยนแปลงที่ยังไม่บันทึก ต้องการออกจากหน้านี้หรือไม่?', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_UNSAVED_CHANGES_MSG');
