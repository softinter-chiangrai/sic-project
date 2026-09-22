-- V20260922183000__add_pmrt02a_customer_combobox_translations.sql
-- Add i18n translation messages for PMRT02A Customer combobox (label, placeholder, validation error) and AI modal title

DELETE FROM su_message WHERE message_code IN (
    'PMRT02A_SELECT_CUSTOMER_LABEL',
    'PMRT02A_SELECT_CUSTOMER_PLACEHOLDER',
    'PMRT02A_REQUIRED_CUSTOMER',
    'PMRT02A_AI_MODAL_TITLE'
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
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_SELECT_CUSTOMER_LABEL', 'Customer', 'ลูกค้า', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_SELECT_CUSTOMER_PLACEHOLDER', 'Search and select customer', 'ค้นหาและเลือกลูกค้า', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_REQUIRED_CUSTOMER', 'Please select customer', 'กรุณาเลือกลูกค้า', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMRT02A_AI_MODAL_TITLE', 'AI Project Charter & Scope Generator', 'AI สร้างข้อมูลโครงการและขอบเขตงาน', 'system', NOW(), 'system', NOW(), false);
