-- Migration: V20260924152500__add_common_dialog_and_unsaved_changes_translations.sql
-- Description: Add and fix all common dialog, confirmation, and unsaved changes translations for bilingual support (TH / EN)

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

-- 3. COMMON_CONFIRM_TITLE
UPDATE su_message 
SET message_en = 'Confirmation', message_local = 'ยืนยันการทำรายการ', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_CONFIRM_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_CONFIRM_TITLE', 'Confirmation', 'ยืนยันการทำรายการ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_CONFIRM_TITLE');

-- 4. COMMON_CONFIRM_MSG
UPDATE su_message 
SET message_en = 'Are you sure you want to proceed?', message_local = 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_CONFIRM_MSG';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_CONFIRM_MSG', 'Are you sure you want to proceed?', 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_CONFIRM_MSG');

-- 5. COMMON_CONFIRM_BTN
UPDATE su_message 
SET message_en = 'Confirm', message_local = 'ยืนยัน', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_CONFIRM_BTN';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_CONFIRM_BTN', 'Confirm', 'ยืนยัน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_CONFIRM_BTN');

-- 6. COMMON_CANCEL_BTN
UPDATE su_message 
SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_CANCEL_BTN';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_CANCEL_BTN');

-- 7. COMMON_CLOSE_BTN
UPDATE su_message 
SET message_en = 'Close', message_local = 'ปิด', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_CLOSE_BTN';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_CLOSE_BTN', 'Close', 'ปิด', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_CLOSE_BTN');

-- 8. COMMON_OK_BTN
UPDATE su_message 
SET message_en = 'OK', message_local = 'ตกลง', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_OK_BTN';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_OK_BTN', 'OK', 'ตกลง', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_OK_BTN');

-- 9. COMMON_SUCCESS_TITLE
UPDATE su_message 
SET message_en = 'Success', message_local = 'สำเร็จ', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_SUCCESS_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_SUCCESS_TITLE', 'Success', 'สำเร็จ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_SUCCESS_TITLE');

-- 10. COMMON_ERROR_TITLE
UPDATE su_message 
SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_ERROR_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_ERROR_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_ERROR_TITLE');

-- 11. COMMON_WARNING_TITLE
UPDATE su_message 
SET message_en = 'Warning', message_local = 'แจ้งเตือน', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_WARNING_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_WARNING_TITLE', 'Warning', 'แจ้งเตือน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_WARNING_TITLE');

-- 12. COMMON_INFO_TITLE
UPDATE su_message 
SET message_en = 'Information', message_local = 'ข้อมูล', updated_by = 'system', updated_date = NOW() 
WHERE message_code = 'COMMON_INFO_TITLE';

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'COMMON_INFO_TITLE', 'Information', 'ข้อมูล', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'COMMON_INFO_TITLE');
