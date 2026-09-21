-- Add and update UI translations for BURT06 mode filter and approval mode labels
DELETE FROM su_message
WHERE message_code = 'BURT06_MODE_ALL_PLACEHOLDER';
INSERT INTO su_message (
    id,
    module_code,
    program_code,
    message_code,
    message_en,
    message_local,
    created_by,
    created_date,
    updated_by,
    updated_date,
    is_delete
  )
VALUES (
    gen_random_uuid(),
    'COMMON',
    'ALL',
    'BURT06_MODE_ALL_PLACEHOLDER',
    '🔄 All approval modes',
    '🔄 ทุกโหมดการอนุมัติ',
    'system',
    NOW(),
    'system',
    NOW(),
    false
  );
UPDATE su_message
SET message_en = 'Sequential',
  message_local = 'เรียงตามลำดับ ',
  updated_date = NOW()
WHERE message_code = 'BURT06_MODE_CHAIN';
UPDATE su_message
SET message_en = 'Parallel',
  message_local = 'พร้อมกัน',
  updated_date = NOW()
WHERE message_code = 'BURT06_MODE_PARALLEL';
UPDATE su_message
SET message_en = 'Anyone (Any)',
  message_local = 'คนใดคนหนึ่ง',
  updated_date = NOW()
WHERE message_code = 'BURT06_MODE_ANY';
UPDATE su_message
SET message_en = 'Single Approver',
  message_local = 'ผู้อนุมัติเดี่ยว',
  updated_date = NOW()
WHERE message_code = 'BURT06_MODE_SINGLE';
UPDATE su_message
SET message_en = 'Approval Mode',
  message_local = 'โหมดการอนุมัติ',
  updated_date = NOW()
WHERE message_code = 'BURT06_COL_MODE';