-- Migration: Add and Update translations for PMDT14A (Delivery Gate Check), PMDT16A (Invoice), and PMDT17A (MA Ticket)
-- Remove parentheses and clean Thai descriptions
-- Module: COMMON, Program: ALL

DELETE FROM su_message WHERE message_code IN (
    'PMDT17A_CONTRACT_LABEL',
    'PMDT17A_SELECT_CONTRACT_PLACEHOLDER',
    'PMDT16A_LBL_DELIVERY',
    'PMDT16A_PH_DELIVERY',
    'PMDT14_GATE_CHECK_TITLE',
    'PMDT14_CHECK_GATE_BTN',
    'PMDT14_CHECKING',
    'PMDT14_PASSED_MARK',
    'PMDT14_FAILED_MARK',
    'PMDT14_VIEW_DATA',
    'PMDT14_GO_MANAGE_PENDING',
    'PMDT14_GATE_STATUS_LABEL',
    'PMDT14_STATUS_READY',
    'PMDT14_HAS_CONDITIONS',
    'PMDT14_PASSED_WORD',
    'PMDT14_OUT_OF_WORD',
    'PMDT14_CHECKS_WORD',
    'PMDT14_GATE_EMPTY_HINT',
    'PMDT14_CLICK_TO_MANAGE_TIP'
);

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
  -- PMDT17A (MA Ticket)
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17A_CONTRACT_LABEL', 'Contract', 'สัญญา', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17A_SELECT_CONTRACT_PLACEHOLDER', 'Select contract', 'เลือกสัญญา', 'system', NOW(), 'system', NOW(), false),

  -- PMDT16A (Invoice)
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT16A_LBL_DELIVERY', 'Delivery', 'Delivery', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT16A_PH_DELIVERY', 'Select delivery', 'เลือก Delivery', 'system', NOW(), 'system', NOW(), false),

  -- PMDT14A (Delivery Gate Check)
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_CHECK_TITLE', 'Delivery Gate Check', 'การตรวจสอบความพร้อมส่งมอบ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CHECK_GATE_BTN', 'Re-check', 'ตรวจสอบใหม่', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CHECKING', 'Checking...', 'กำลังตรวจสอบ...', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PASSED_MARK', 'Passed', 'ผ่าน', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_FAILED_MARK', 'Action Required', 'ต้องดำเนินการ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_VIEW_DATA', 'View Details', 'ดูรายละเอียด', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GO_MANAGE_PENDING', 'Manage Pending', 'ไปจัดการรายการค้าง', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_STATUS_LABEL', 'Gate Check Status:', 'สถานะ Gate Check:', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_STATUS_READY', 'Ready to Deliver', 'พร้อมส่งมอบ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_HAS_CONDITIONS', 'Conditions Pending', 'ยังมีเงื่อนไขที่ต้องแก้ไข', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PASSED_WORD', 'Passed', 'ผ่าน', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_OUT_OF_WORD', 'out of', 'จากทั้งหมด', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CHECKS_WORD', 'checks', 'ข้อกำหนด', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_EMPTY_HINT', 'Please select a contract or project to run delivery gate check', 'กรุณาเลือกสัญญาหรือโครงการเพื่อตรวจสอบความพร้อมส่งมอบ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CLICK_TO_MANAGE_TIP', 'Click to manage items in this module', 'คลิกเพื่อไปจัดการข้อมูลในโมดูลนี้', 'system', NOW(), 'system', NOW(), false);

-- Update existing messages to remove Thai parentheses
UPDATE su_message
SET message_en = 'Select related contract',
    message_local = 'เลือกสัญญาที่เกี่ยวข้อง',
    updated_by = 'system',
    updated_date = NOW()
WHERE message_code = 'PMDT16A_PH_CONTRACT';

UPDATE su_message
SET message_en = 'Additional details',
    message_local = 'รายละเอียดเพิ่มเติม',
    updated_by = 'system',
    updated_date = NOW()
WHERE message_code = 'PMDT16A_PH_ITEM_DESC';
