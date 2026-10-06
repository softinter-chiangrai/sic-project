-- PMDT09 Design Review: print report button/messages
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRINT_BTN', 'Print Report', 'พิมพ์รายงาน', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRINT_FAIL_TITLE', 'Print Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRINT_FAIL_MSG', 'Unable to print the design review report', 'ไม่สามารถพิมพ์รายงาน Design Review ได้', 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, program_code, message_code) DO UPDATE
SET message_en = EXCLUDED.message_en,
    message_local = EXCLUDED.message_local,
    updated_date = NOW();
