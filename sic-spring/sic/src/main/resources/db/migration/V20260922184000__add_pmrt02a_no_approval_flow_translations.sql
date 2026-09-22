-- V20260922184000__add_pmrt02a_no_approval_flow_translations.sql
-- Add i18n translation messages for warning when no approval flow exists for document type

DELETE FROM su_message WHERE message_code IN (
    'PMRT02A_NO_APPROVAL_FLOW_TITLE',
    'PMRT02A_NO_APPROVAL_FLOW_DESC',
    'PMRT02A_CREATE_APPROVAL_FLOW_BUTTON'
);

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
) VALUES
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_NO_APPROVAL_FLOW_TITLE', 'Approval flow not configured', 'ยังไม่มีกระบวนการอนุมัติสำหรับเอกสารประเภทนี้', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_NO_APPROVAL_FLOW_DESC', 'This document type (Project) has no active approval flow. Please create an approval flow if approval is required.', 'เอกสารประเภทโครงการ (Project) ยังไม่มี Approval Flow ในระบบ หากต้องการส่งขออนุมัติกรุณาสร้างกระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_CREATE_APPROVAL_FLOW_BUTTON', 'Create Approval Flow', 'สร้าง Approval Flow', 'system', NOW(), 'system', NOW(), false);
