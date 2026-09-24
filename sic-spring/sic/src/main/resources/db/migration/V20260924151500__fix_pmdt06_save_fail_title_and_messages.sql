-- Fix PMDT06 Save Fail Title & Messages
UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_SAVE_FAIL_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_SAVE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Save Successful', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_SAVE_SUCCESS_TITLE', 'Save Successful', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Change Request saved successfully', message_local = 'บันทึกข้อมูลคำขอเปลี่ยนแปลงเรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVE_SUCCESS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_SAVE_SUCCESS_MSG', 'Change Request saved successfully', 'บันทึกข้อมูลคำขอเปลี่ยนแปลงเรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_SAVE_SUCCESS_MSG');

UPDATE su_message SET message_en = 'Please fill in all required fields', message_local = 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_FILL_ALL_FIELDS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_FILL_ALL_FIELDS_MSG', 'Please fill in all required fields', 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_FILL_ALL_FIELDS_MSG');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_SAVE_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_SAVE_FAILED_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_SAVE_FAILED_TITLE');

UPDATE su_message SET message_en = 'Generic Error', message_local = 'เกิดข้อผิดพลาดในการดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_GENERIC_ERROR';

UPDATE su_message SET message_en = 'Change Request Not Found', message_local = 'ไม่พบข้อมูล Change Request', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_CR_NOT_FOUND_MSG';

UPDATE su_message SET message_en = 'Please save before printing', message_local = 'กรุณาบันทึกข้อมูลก่อนพิมพ์เอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVE_BEFORE_PRINT_MSG';

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_DELETE_FAIL_TITLE';

UPDATE su_message SET message_en = 'An error occurred while deleting', message_local = 'เกิดข้อผิดพลาดในการลบข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_DELETE_ERROR_MSG';

UPDATE su_message SET message_en = 'Submit Failed', message_local = 'ส่งขออนุมัติไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SUBMIT_FAIL_MSG';

UPDATE su_message SET message_en = 'Implement Failed', message_local = 'ดำเนินการไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_IMPLEMENT_FAIL_MSG';

UPDATE su_message SET message_en = 'Complete Task Failed', message_local = 'บันทึกเสร็จสิ้นไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_ASSIGNEE_COMPLETE_FAIL_MSG';
