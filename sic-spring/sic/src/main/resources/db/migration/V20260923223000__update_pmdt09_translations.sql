-- Migration: Add and Update translations for PMDT09 (Design Review)
-- Module: COMMON, Program: ALL

DELETE FROM su_message WHERE message_code IN (
    'PMDT09_PROJECT_LABEL',
    'PMDT09_PROJECT_PLACEHOLDER',
    'PMDT09_REVIEW_CODE_LABEL',
    'PMDT09_REVIEW_CODE_PLACEHOLDER',
    'PMDT09_TITLE_LABEL',
    'PMDT09_TITLE_PLACEHOLDER',
    'PMDT09_SEVERITY_FIELD_LABEL',
    'PMDT09_SEV_SELECT_PH',
    'PMDT09_STATUS_LABEL',
    'PMDT09_STATUS_SELECT_PH',
    'PMDT09_DUE_DATE_LABEL',
    'PMDT09_ASSIGNED_TO_LABEL',
    'PMDT09_ASSIGNED_TO_PH',
    'PMDT09_APPROVAL_FLOW_LABEL',
    'PMDT09_APPROVAL_FLOW_PH',
    'PMDT09_DESC_LABEL',
    'PMDT09_DESC_PLACEHOLDER',
    'PMDT09_FIGMA_URL_LABEL',
    'PMDT09_FIGMA_URL_PH',
    'PMDT09_CANCEL_BTN',
    'PMDT09_SAVE_BTN',
    'PMDT09_SUBMIT_APPROVAL_BTN'
);

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PROJECT_LABEL', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PROJECT_PLACEHOLDER', 'Select project', 'เลือกโครงการ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_CODE_LABEL', 'Review Code', 'รหัส Design Review', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_CODE_PLACEHOLDER', 'e.g. DR-001', 'เช่น DR-001', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_TITLE_LABEL', 'Review Title', 'หัวข้อการตรวจทาน', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_TITLE_PLACEHOLDER', 'Enter review title', 'ระบุหัวข้อการตรวจทาน', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEVERITY_FIELD_LABEL', 'Severity', 'ระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEV_SELECT_PH', 'Select severity', 'เลือกระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_STATUS_LABEL', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_STATUS_SELECT_PH', 'Select status', 'เลือกสถานะ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_DUE_DATE_LABEL', 'Resolution Due Date', 'กำหนดเสร็จ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ASSIGNED_TO_LABEL', 'Assigned Fixer', 'ผู้รับผิดชอบแก้ไข', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ASSIGNED_TO_PH', 'Select assignee...', 'เลือกผู้รับผิดชอบ...', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPROVAL_FLOW_LABEL', 'Approval Flow', 'ขั้นตอนการอนุมัติ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPROVAL_FLOW_PH', 'Select approval flow...', 'เลือกขั้นตอนการอนุมัติ...', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_DESC_LABEL', 'Description', 'รายละเอียดการตรวจทาน', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_DESC_PLACEHOLDER', 'Enter review details, comments or improvements...', 'ระบุรายละเอียด ข้อคิดเห็น หรือจุดที่ต้องปรับปรุง...', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_FIGMA_URL_LABEL', 'Figma File / Prototype URL', 'Figma File / Prototype URL', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_FIGMA_URL_PH', 'https://www.figma.com/file/...', 'https://www.figma.com/file/...', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SAVE_BTN', 'Save', 'บันทึก', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SUBMIT_APPROVAL_BTN', 'Submit for Approval', 'ส่งขออนุมัติ', 'system', NOW(), 'system', NOW(), false);
