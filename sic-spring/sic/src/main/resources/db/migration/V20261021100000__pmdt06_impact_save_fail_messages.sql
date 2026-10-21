-- PMDT06: warning shown when the Change Request saved but its Impact Analysis did not
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_IMPACT_SAVE_FAIL_TITLE', 'Impact Analysis Not Saved', 'บันทึกผลกระทบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_IMPACT_SAVE_FAIL_TITLE');

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_IMPACT_SAVE_FAIL_MSG', 'The Change Request was saved, but the Impact Analysis could not be saved', 'บันทึก Change Request แล้ว แต่บันทึก Impact Analysis ไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_IMPACT_SAVE_FAIL_MSG');
