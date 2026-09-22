-- Fix PMDT05 Diagram UI Translations in su_message table

-- 1. Create / Edit Diagram Dialog
UPDATE su_message SET message_en = 'Create New Diagram', message_local = 'สร้าง Diagram ใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_DIAGRAM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_DIAGRAM_TITLE', 'Create New Diagram', 'สร้าง Diagram ใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_DIAGRAM_TITLE');

UPDATE su_message SET message_en = 'Edit Diagram', message_local = 'แก้ไขข้อมูล Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_EDIT_DIAGRAM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_EDIT_DIAGRAM_TITLE', 'Edit Diagram', 'แก้ไขข้อมูล Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_EDIT_DIAGRAM_TITLE');

UPDATE su_message SET message_en = 'Create Diagram', message_local = 'สร้าง Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_DIALOG_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_DIALOG_BTN', 'Create Diagram', 'สร้าง Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_DIALOG_BTN');

UPDATE su_message SET message_en = 'Save', message_local = 'บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_DIALOG_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_DIALOG_BTN', 'Save', 'บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_DIALOG_BTN');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_APPROVED_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_APPROVED_LABEL', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_APPROVED_LABEL');

UPDATE su_message SET message_en = 'Diagram Code', message_local = 'รหัส Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_CODE_LABEL', 'Diagram Code', 'รหัส Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. DIA-001', message_local = 'เช่น DIA-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_CODE_PLACEHOLDER', 'e.g. DIA-001', 'เช่น DIA-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Diagram Name', message_local = 'ชื่อ Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_NAME_LABEL', 'Diagram Name', 'ชื่อ Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_NAME_LABEL');

UPDATE su_message SET message_en = 'Enter diagram name', message_local = 'ระบุชื่อ Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_NAME_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_NAME_PLACEHOLDER', 'Enter diagram name', 'ระบุชื่อ Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_NAME_PLACEHOLDER');

UPDATE su_message SET message_en = 'Diagram Type', message_local = 'ประเภท Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_TYPE_LABEL', 'Diagram Type', 'ประเภท Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_TYPE_LABEL');

UPDATE su_message SET message_en = 'Select diagram type', message_local = 'เลือกประเภท Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_TYPE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_TYPE_PLACEHOLDER', 'Select diagram type', 'เลือกประเภท Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_TYPE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Requirement:', message_local = 'Requirement ต้นทาง:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_REQ_SOURCE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REQ_SOURCE_LABEL', 'Requirement:', 'Requirement ต้นทาง:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REQ_SOURCE_LABEL');

UPDATE su_message SET message_en = 'Approval Process', message_local = 'กระบวนการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_APPROVAL_PROCESS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_APPROVAL_PROCESS_LABEL', 'Approval Process', 'กระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_APPROVAL_PROCESS_LABEL');

UPDATE su_message SET message_en = 'Select Approval Flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_APPROVAL_FLOW_LABEL', 'Select Approval Flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_LABEL');

UPDATE su_message SET message_en = 'Select approval flow (optional)', message_local = 'เลือกสายการอนุมัติ (ถ้ามี)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_APPROVAL_FLOW_PLACEHOLDER', 'Select approval flow (optional)', 'เลือกสายการอนุมัติ (ถ้ามี)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_PLACEHOLDER');

UPDATE su_message SET message_en = 'Will submit for approval upon saving', message_local = 'จะส่งขออนุมัติทันทีที่บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SUBMIT_ON_SAVE_HINT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SUBMIT_ON_SAVE_HINT', 'Will submit for approval upon saving', 'จะส่งขออนุมัติทันทีที่บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SUBMIT_ON_SAVE_HINT');

UPDATE su_message SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CANCEL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CANCEL_BTN');

UPDATE su_message SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ERROR_GENERIC_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ERROR_GENERIC_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ERROR_GENERIC_TITLE');

UPDATE su_message SET message_en = 'Project ID is required', message_local = 'กรุณาระบุโครงการก่อนดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_PROJECT_ID_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_PROJECT_ID_MSG', 'Project ID is required', 'กรุณาระบุโครงการก่อนดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_PROJECT_ID_MSG');

-- 2. Main Toolbar & Tab Bar
UPDATE su_message SET message_en = 'Generate SQL from ER Diagram', message_local = 'สร้างคำสั่ง SQL จาก ER Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GENERATE_SQL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GENERATE_SQL_TITLE', 'Generate SQL from ER Diagram', 'สร้างคำสั่ง SQL จาก ER Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GENERATE_SQL_TITLE');

UPDATE su_message SET message_en = 'Generate SQL', message_local = 'สร้างคำสั่ง SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GENERATE_SQL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GENERATE_SQL_BTN', 'Generate SQL', 'สร้างคำสั่ง SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GENERATE_SQL_BTN');

UPDATE su_message SET message_en = 'AI Assistant', message_local = 'ผู้ช่วย AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CHAT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CHAT_TITLE', 'AI Assistant', 'ผู้ช่วย AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CHAT_TITLE');

UPDATE su_message SET message_en = 'AI Assistant', message_local = 'ผู้ช่วย AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CHAT_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CHAT_BTN', 'AI Assistant', 'ผู้ช่วย AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CHAT_BTN');

UPDATE su_message SET message_en = 'Save Diagram', message_local = 'บันทึก Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_TITLE', 'Save Diagram', 'บันทึก Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_TITLE');

UPDATE su_message SET message_en = 'Save', message_local = 'บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_BTN', 'Save', 'บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_BTN');

UPDATE su_message SET message_en = 'Reload Diagram', message_local = 'โหลด Diagram ใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_RELOAD_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_RELOAD_TITLE', 'Reload Diagram', 'โหลด Diagram ใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_RELOAD_TITLE');

UPDATE su_message SET message_en = 'Reload', message_local = 'โหลดใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_RELOAD_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_RELOAD_BTN', 'Reload', 'โหลดใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_RELOAD_BTN');

UPDATE su_message SET message_en = 'Loading diagrams...', message_local = 'กำลังโหลด Diagram...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOADING_TABS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOADING_TABS', 'Loading diagrams...', 'กำลังโหลด Diagram...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOADING_TABS');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_APPROVED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_APPROVED_TITLE', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_APPROVED_TITLE');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_APPROVED_BADGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_APPROVED_BADGE', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_APPROVED_BADGE');

UPDATE su_message SET message_en = 'Pending Approval', message_local = 'อยู่ระหว่างตรวจสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PENDING_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PENDING_TITLE', 'Pending Approval', 'อยู่ระหว่างตรวจสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PENDING_TITLE');

UPDATE su_message SET message_en = 'In Review', message_local = 'รอตรวจสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PENDING_BADGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PENDING_BADGE', 'In Review', 'รอตรวจสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PENDING_BADGE');

UPDATE su_message SET message_en = 'Need Revision', message_local = 'ต้องแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEEDS_REVISION_BADGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEEDS_REVISION_BADGE', 'Need Revision', 'ต้องแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEEDS_REVISION_BADGE');

UPDATE su_message SET message_en = 'Rejected', message_local = 'ไม่อนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_REJECTED_BADGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REJECTED_BADGE', 'Rejected', 'ไม่อนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REJECTED_BADGE');

UPDATE su_message SET message_en = 'Rejected', message_local = 'ไม่อนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_REJECTED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REJECTED_TITLE', 'Rejected', 'ไม่อนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REJECTED_TITLE');

UPDATE su_message SET message_en = 'Draft', message_local = 'แบบร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DRAFT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DRAFT_TITLE', 'Draft', 'แบบร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DRAFT_TITLE');

UPDATE su_message SET message_en = 'Draft', message_local = 'แบบร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DRAFT_BADGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DRAFT_BADGE', 'Draft', 'แบบร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DRAFT_BADGE');

UPDATE su_message SET message_en = 'Edit Diagram Details', message_local = 'แก้ไขข้อมูล Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_EDIT_TAB_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_EDIT_TAB_TITLE', 'Edit Diagram Details', 'แก้ไขข้อมูล Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_EDIT_TAB_TITLE');

UPDATE su_message SET message_en = 'Delete Diagram', message_local = 'ลบ Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DELETE_TAB_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DELETE_TAB_TITLE', 'Delete Diagram', 'ลบ Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DELETE_TAB_TITLE');

UPDATE su_message SET message_en = '+ New Diagram', message_local = '+ สร้าง Diagram ใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEW_DIAGRAM_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEW_DIAGRAM_BTN', '+ New Diagram', '+ สร้าง Diagram ใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEW_DIAGRAM_BTN');

UPDATE su_message SET message_en = 'Draw.io Ready', message_local = 'พร้อมใช้งาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DRAWIO_READY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DRAWIO_READY', 'Draw.io Ready', 'พร้อมใช้งาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DRAWIO_READY');

UPDATE su_message SET message_en = 'Connecting...', message_local = 'กำลังเชื่อมต่อ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CONNECTING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CONNECTING', 'Connecting...', 'กำลังเชื่อมต่อ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CONNECTING');

UPDATE su_message SET message_en = 'diagrams', message_local = 'แผนภาพ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DIAGRAM_COUNT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DIAGRAM_COUNT', 'diagrams', 'แผนภาพ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DIAGRAM_COUNT');

UPDATE su_message SET message_en = 'Loading diagram editor...', message_local = 'กำลังโหลดโปรแกรมวาดภาพ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOADING_DIAGRAM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOADING_DIAGRAM', 'Loading diagram editor...', 'กำลังโหลดโปรแกรมวาดภาพ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOADING_DIAGRAM');

UPDATE su_message SET message_en = 'This diagram is approved and locked for editing.', message_local = 'Diagram นี้ได้รับการอนุมัติแล้ว และถูกล็อคการแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOCKED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOCKED_MSG', 'This diagram is approved and locked for editing.', 'Diagram นี้ได้รับการอนุมัติแล้ว และถูกล็อคการแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOCKED_MSG');

UPDATE su_message SET message_en = 'Request Change (CR)', message_local = 'ขอแก้ไข (CR)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_REQUEST_CHANGE_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_REQUEST_CHANGE_BTN', 'Request Change (CR)', 'ขอแก้ไข (CR)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_REQUEST_CHANGE_BTN');

UPDATE su_message SET message_en = 'AI Diagram Assistant', message_local = 'ผู้ช่วยออกแบบ Diagram ด้วย AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_ASSISTANT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_ASSISTANT_TITLE', 'AI Diagram Assistant', 'ผู้ช่วยออกแบบ Diagram ด้วย AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_ASSISTANT_TITLE');

UPDATE su_message SET message_en = 'Close AI Assistant', message_local = 'ปิดหน้าต่าง AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CLOSE_CHAT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CLOSE_CHAT_TITLE', 'Close AI Assistant', 'ปิดหน้าต่าง AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CLOSE_CHAT_TITLE');

-- 3. Alerts & CRUD Actions
UPDATE su_message SET message_en = 'Created Successfully', message_local = 'สร้างสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_SUCCESS_TITLE', 'Created Successfully', 'สร้างสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Diagram "{0}" created successfully.', message_local = 'สร้าง Diagram "{0}" เรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_SUCCESS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_SUCCESS_MSG', 'Diagram "{0}" created successfully.', 'สร้าง Diagram "{0}" เรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_SUCCESS_MSG');

UPDATE su_message SET message_en = 'Create Failed', message_local = 'สร้างไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_FAIL_TITLE', 'Create Failed', 'สร้างไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_FAIL_TITLE');

UPDATE su_message SET message_en = 'An error occurred', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GENERIC_ERROR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GENERIC_ERROR', 'An error occurred', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GENERIC_ERROR');

UPDATE su_message SET message_en = 'Submitted diagram for approval following data changes', message_local = 'ส่งขออนุมัติ Diagram จากการแก้ไขข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SUBMIT_APPROVAL_COMMENT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SUBMIT_APPROVAL_COMMENT', 'Submitted diagram for approval following data changes', 'ส่งขออนุมัติ Diagram จากการแก้ไขข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SUBMIT_APPROVAL_COMMENT');

UPDATE su_message SET message_en = 'Saved Successfully', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_SUCCESS_TITLE', 'Saved Successfully', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Diagram "{0}" updated successfully.', message_local = 'อัปเดตข้อมูล Diagram "{0}" เรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_UPDATE_SUCCESS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_UPDATE_SUCCESS_MSG', 'Diagram "{0}" updated successfully.', 'อัปเดตข้อมูล Diagram "{0}" เรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_UPDATE_SUCCESS_MSG');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_FAIL_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Diagram Locked', message_local = 'เอกสารถูกล็อค', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOCKED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOCKED_TITLE', 'Diagram Locked', 'เอกสารถูกล็อค', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOCKED_TITLE');

UPDATE su_message SET message_en = 'Approved diagrams cannot be deleted.', message_local = 'ไม่สามารถลบ Diagram ที่ผ่านการอนุมัติแล้วได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOCKED_DELETE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOCKED_DELETE_MSG', 'Approved diagrams cannot be deleted.', 'ไม่สามารถลบ Diagram ที่ผ่านการอนุมัติแล้วได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOCKED_DELETE_MSG');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DELETE_TAB_CONFIRM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DELETE_TAB_CONFIRM_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DELETE_TAB_CONFIRM_TITLE');

UPDATE su_message SET message_en = 'Are you sure you want to delete diagram "{0}"?', message_local = 'คุณต้องการลบ Diagram "{0}" ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DELETE_TAB_CONFIRM_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DELETE_TAB_CONFIRM_MSG', 'Are you sure you want to delete diagram "{0}"?', 'คุณต้องการลบ Diagram "{0}" ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DELETE_TAB_CONFIRM_MSG');

UPDATE su_message SET message_en = 'Deleted Successfully', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DELETED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DELETED_TITLE', 'Deleted Successfully', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DELETED_TITLE');

UPDATE su_message SET message_en = 'Diagram "{0}" has been deleted.', message_local = 'ลบ Diagram "{0}" เรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_TAB_DELETED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_TAB_DELETED_MSG', 'Diagram "{0}" has been deleted.', 'ลบ Diagram "{0}" เรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_TAB_DELETED_MSG');

UPDATE su_message SET message_en = 'Failed', message_local = 'ทำรายการไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_FAILED_TITLE', 'Failed', 'ทำรายการไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_FAILED_TITLE');

UPDATE su_message SET message_en = 'Failed to delete diagram.', message_local = 'ไม่สามารถลบ Diagram ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DELETE_TAB_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DELETE_TAB_FAIL_MSG', 'Failed to delete diagram.', 'ไม่สามารถลบ Diagram ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DELETE_TAB_FAIL_MSG');

UPDATE su_message SET message_en = 'Unknown Project', message_local = 'ไม่ระบุโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_UNKNOWN_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_UNKNOWN_PROJECT', 'Unknown Project', 'ไม่ระบุโครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_UNKNOWN_PROJECT');

UPDATE su_message SET message_en = 'Project Mismatch', message_local = 'โครงการไม่ตรงกัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROJECT_MISMATCH_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROJECT_MISMATCH_TITLE', 'Project Mismatch', 'โครงการไม่ตรงกัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROJECT_MISMATCH_TITLE');

UPDATE su_message SET message_en = 'The loaded diagram belongs to another project.', message_local = 'Diagram ที่โหลดไม่ได้อยู่ในโครงการที่เลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROJECT_MISMATCH_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROJECT_MISMATCH_MSG', 'The loaded diagram belongs to another project.', 'Diagram ที่โหลดไม่ได้อยู่ในโครงการที่เลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROJECT_MISMATCH_MSG');

UPDATE su_message SET message_en = 'Load Failed', message_local = 'โหลดข้อมูลไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOAD_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOAD_FAIL_TITLE', 'Load Failed', 'โหลดข้อมูลไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOAD_FAIL_TITLE');

UPDATE su_message SET message_en = 'No Diagram Selected', message_local = 'ไม่พบ Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_DIAGRAM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_DIAGRAM_TITLE', 'No Diagram Selected', 'ไม่พบ Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_DIAGRAM_TITLE');

UPDATE su_message SET message_en = 'Please select or create a diagram before saving.', message_local = 'กรุณาเลือกหรือสร้าง Diagram ก่อนบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_DIAGRAM_SAVE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_DIAGRAM_SAVE_MSG', 'Please select or create a diagram before saving.', 'กรุณาเลือกหรือสร้าง Diagram ก่อนบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_DIAGRAM_SAVE_MSG');

UPDATE su_message SET message_en = 'Empty Diagram', message_local = 'Diagram ว่างเปล่า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_EMPTY_DIAGRAM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_EMPTY_DIAGRAM_TITLE', 'Empty Diagram', 'Diagram ว่างเปล่า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_EMPTY_DIAGRAM_TITLE');

UPDATE su_message SET message_en = 'Cannot save an empty diagram.', message_local = 'ไม่สามารถบันทึก Diagram ที่ว่างเปล่าได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_EMPTY_DIAGRAM_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_EMPTY_DIAGRAM_MSG', 'Cannot save an empty diagram.', 'ไม่สามารถบันทึก Diagram ที่ว่างเปล่าได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_EMPTY_DIAGRAM_MSG');

UPDATE su_message SET message_en = 'Saving...', message_local = 'กำลังบันทึก...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVING_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVING_TITLE', 'Saving...', 'กำลังบันทึก...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVING_TITLE');

UPDATE su_message SET message_en = 'Diagram is currently saving.', message_local = 'ระบบกำลังบันทึก Diagram อยู่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVING_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVING_MSG', 'Diagram is currently saving.', 'ระบบกำลังบันทึก Diagram อยู่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVING_MSG');

UPDATE su_message SET message_en = 'Approved diagrams cannot be modified.', message_local = 'ไม่สามารถแก้ไข Diagram ที่ผ่านการอนุมัติแล้วได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOCKED_SAVE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOCKED_SAVE_MSG', 'Approved diagrams cannot be modified.', 'ไม่สามารถแก้ไข Diagram ที่ผ่านการอนุมัติแล้วได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOCKED_SAVE_MSG');

UPDATE su_message SET message_en = 'Missing Requirement', message_local = 'ไม่พบ Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MISSING_REQ_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MISSING_REQ_TITLE', 'Missing Requirement', 'ไม่พบ Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MISSING_REQ_TITLE');

UPDATE su_message SET message_en = 'Please link this diagram with a Requirement before saving.', message_local = 'กรุณาเชื่อมโยง Diagram นี้กับ Requirement ก่อนบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MISSING_REQ_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MISSING_REQ_MSG', 'Please link this diagram with a Requirement before saving.', 'กรุณาเชื่อมโยง Diagram นี้กับ Requirement ก่อนบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MISSING_REQ_MSG');

UPDATE su_message SET message_en = 'Saved at {0}', message_local = 'บันทึกเมื่อ {0}', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVED_MANUALLY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVED_MANUALLY', 'Saved at {0}', 'บันทึกเมื่อ {0}', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVED_MANUALLY');

UPDATE su_message SET message_en = 'Auto-saved at {0}', message_local = 'บันทึกอัตโนมัติเมื่อ {0}', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AUTO_SAVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AUTO_SAVED', 'Auto-saved at {0}', 'บันทึกอัตโนมัติเมื่อ {0}', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AUTO_SAVED');

UPDATE su_message SET message_en = 'Diagram saved successfully.', message_local = 'บันทึก Diagram เรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_SUCCESS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_SUCCESS_MSG', 'Diagram saved successfully.', 'บันทึก Diagram เรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_SUCCESS_MSG');

UPDATE su_message SET message_en = 'Save failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_FAILED_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_FAILED_STATUS', 'Save failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_FAILED_STATUS');

UPDATE su_message SET message_en = 'Please open a diagram first.', message_local = 'กรุณาเปิด Diagram ก่อน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_OPEN_DIAGRAM_FIRST_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_OPEN_DIAGRAM_FIRST_MSG', 'Please open a diagram first.', 'กรุณาเปิด Diagram ก่อน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_OPEN_DIAGRAM_FIRST_MSG');

UPDATE su_message SET message_en = 'Please draw ER Diagram before generating SQL.', message_local = 'กรุณาวาด ER Diagram ก่อนสร้าง SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DRAW_ER_FIRST_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DRAW_ER_FIRST_MSG', 'Please draw ER Diagram before generating SQL.', 'กรุณาวาด ER Diagram ก่อนสร้าง SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DRAW_ER_FIRST_MSG');

UPDATE su_message SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ERROR_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ERROR_TITLE');

UPDATE su_message SET message_en = 'Unable to get diagram data from editor.', message_local = 'ไม่สามารถดึงข้อมูลจาก Diagram Editor ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GET_XML_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GET_XML_FAIL_MSG', 'Unable to get diagram data from editor.', 'ไม่สามารถดึงข้อมูลจาก Diagram Editor ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GET_XML_FAIL_MSG');

-- 4. AI Assistant Chat (PMDT05A)
UPDATE su_message SET message_en = 'View All Chat History', message_local = 'ดูประวัติการสนทนาทั้งหมด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_VIEW_ALL_HISTORY_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_VIEW_ALL_HISTORY_TITLE', 'View All Chat History', 'ดูประวัติการสนทนาทั้งหมด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_VIEW_ALL_HISTORY_TITLE');

UPDATE su_message SET message_en = 'History', message_local = 'ประวัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_HISTORY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_HISTORY_LABEL', 'History', 'ประวัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_HISTORY_LABEL');

UPDATE su_message SET message_en = 'Save Title', message_local = 'บันทึกชื่อ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_TITLE_NAME';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_TITLE_NAME', 'Save Title', 'บันทึกชื่อ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_TITLE_NAME');

UPDATE su_message SET message_en = 'New Session', message_local = 'บทสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DEFAULT_SESSION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DEFAULT_SESSION_TITLE', 'New Session', 'บทสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DEFAULT_SESSION_TITLE');

UPDATE su_message SET message_en = 'Edit Title', message_local = 'แก้ไขชื่อบทสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_EDIT_SESSION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_EDIT_SESSION_TITLE', 'Edit Title', 'แก้ไขชื่อบทสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_EDIT_SESSION_TITLE');

UPDATE su_message SET message_en = 'New Session', message_local = 'เริ่มการสนทนาใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEW_SESSION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEW_SESSION_TITLE', 'New Session', 'เริ่มการสนทนาใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEW_SESSION_TITLE');

UPDATE su_message SET message_en = 'New Chat', message_local = 'แชทใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEW_CHAT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEW_CHAT_LABEL', 'New Chat', 'แชทใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEW_CHAT_LABEL');

UPDATE su_message SET message_en = 'Clear Messages in Session', message_local = 'ล้างข้อความในบทสนทนานี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CLEAR_CHAT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CLEAR_CHAT_TITLE', 'Clear Messages in Session', 'ล้างข้อความในบทสนทนานี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CLEAR_CHAT_TITLE');

UPDATE su_message SET message_en = 'Back to Chat', message_local = 'กลับไปที่หน้าแชท', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_BACK_TO_CHAT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_BACK_TO_CHAT_TITLE', 'Back to Chat', 'กลับไปที่หน้าแชท', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_BACK_TO_CHAT_TITLE');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_BACK_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_BACK_LABEL', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_BACK_LABEL');

UPDATE su_message SET message_en = 'Chat History', message_local = 'ประวัติการสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CHAT_HISTORY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CHAT_HISTORY_LABEL', 'Chat History', 'ประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CHAT_HISTORY_LABEL');

UPDATE su_message SET message_en = 'Start New Chat', message_local = 'เริ่มการสนทนาใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_NEW_CHAT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_NEW_CHAT_LABEL', 'Start New Chat', 'เริ่มการสนทนาใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_NEW_CHAT_LABEL');

UPDATE su_message SET message_en = 'Search chat history...', message_local = 'ค้นหาประวัติการสนทนา...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SEARCH_HISTORY_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SEARCH_HISTORY_PLACEHOLDER', 'Search chat history...', 'ค้นหาประวัติการสนทนา...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SEARCH_HISTORY_PLACEHOLDER');

UPDATE su_message SET message_en = 'No chat history found', message_local = 'ไม่พบประวัติการสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_HISTORY_FOUND';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_HISTORY_FOUND', 'No chat history found', 'ไม่พบประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_HISTORY_FOUND');

UPDATE su_message SET message_en = 'No results match your search.', message_local = 'ไม่พบผลลัพธ์ที่ตรงกับการค้นหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_SEARCH_RESULT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_SEARCH_RESULT', 'No results match your search.', 'ไม่พบผลลัพธ์ที่ตรงกับการค้นหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_SEARCH_RESULT');

UPDATE su_message SET message_en = 'You have not started any conversations yet.', message_local = 'คุณยังไม่มีประวัติการสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_CHAT_HISTORY_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_CHAT_HISTORY_MSG', 'You have not started any conversations yet.', 'คุณยังไม่มีประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_CHAT_HISTORY_MSG');

UPDATE su_message SET message_en = 'Start New Chat', message_local = 'เริ่มการสนทนาใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_START_NEW_CHAT_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_START_NEW_CHAT_BTN', 'Start New Chat', 'เริ่มการสนทนาใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_START_NEW_CHAT_BTN');

UPDATE su_message SET message_en = 'Save', message_local = 'บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_LABEL', 'Save', 'บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_LABEL');

UPDATE su_message SET message_en = 'Active', message_local = 'กำลังสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ACTIVE_BADGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ACTIVE_BADGE', 'Active', 'กำลังสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ACTIVE_BADGE');

UPDATE su_message SET message_en = 'No messages in this chat', message_local = 'ยังไม่มีข้อความในบทสนทนานี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_MESSAGES_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_MESSAGES_MSG', 'No messages in this chat', 'ยังไม่มีข้อความในบทสนทนานี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_MESSAGES_MSG');

UPDATE su_message SET message_en = 'Edit Chat Name', message_local = 'แก้ไขชื่อบทสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_EDIT_NAME_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_EDIT_NAME_TITLE', 'Edit Chat Name', 'แก้ไขชื่อบทสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_EDIT_NAME_TITLE');

UPDATE su_message SET message_en = 'Delete Chat Session', message_local = 'ลบบทสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DELETE_SESSION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DELETE_SESSION_TITLE', 'Delete Chat Session', 'ลบบทสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DELETE_SESSION_TITLE');

UPDATE su_message SET message_en = 'messages', message_local = 'ข้อความ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MESSAGES_COUNT_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MESSAGES_COUNT_SUFFIX', 'messages', 'ข้อความ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MESSAGES_COUNT_SUFFIX');

UPDATE su_message SET message_en = 'AI Diagram Assistant', message_local = 'ผู้ช่วยออกแบบ Diagram ด้วย AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_DIAGRAM_ASSISTANT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_DIAGRAM_ASSISTANT', 'AI Diagram Assistant', 'ผู้ช่วยออกแบบ Diagram ด้วย AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_DIAGRAM_ASSISTANT');

UPDATE su_message SET message_en = 'Generate ER diagrams, DFDs, sequence diagrams and flowcharts quickly with AI.', message_local = 'พร้อมช่วยคุณออกแบบ ปรับปรุง หรือแปลง Diagram ด้วย AI ได้อย่างรวดเร็ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_WELCOME_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_WELCOME_DESC', 'Generate ER diagrams, DFDs, sequence diagrams and flowcharts quickly with AI.', 'พร้อมช่วยคุณออกแบบ ปรับปรุง หรือแปลง Diagram ด้วย AI ได้อย่างรวดเร็ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_WELCOME_DESC');

UPDATE su_message SET message_en = 'Suggested Prompts', message_local = 'ตัวอย่างคำสั่ง Prompt', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SUGGESTED_PROMPTS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SUGGESTED_PROMPTS_LABEL', 'Suggested Prompts', 'ตัวอย่างคำสั่ง Prompt', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SUGGESTED_PROMPTS_LABEL');

UPDATE su_message SET message_en = 'Copied!', message_local = 'คัดลอกแล้ว!', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPIED_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPIED_LABEL', 'Copied!', 'คัดลอกแล้ว!', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPIED_LABEL');

UPDATE su_message SET message_en = 'Copy Mermaid Code', message_local = 'คัดลอกโค้ด Mermaid', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPY_MERMAID_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPY_MERMAID_TITLE', 'Copy Mermaid Code', 'คัดลอกโค้ด Mermaid', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPY_MERMAID_TITLE');

UPDATE su_message SET message_en = 'Copy Mermaid', message_local = 'คัดลอก Mermaid', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPY_MERMAID_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPY_MERMAID_LABEL', 'Copy Mermaid', 'คัดลอก Mermaid', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPY_MERMAID_LABEL');

UPDATE su_message SET message_en = 'Processing request...', message_local = 'กำลังประมวลผลคำสั่ง...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_PROCESSING_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_PROCESSING_LABEL', 'Processing request...', 'กำลังประมวลผลคำสั่ง...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_PROCESSING_LABEL');

UPDATE su_message SET message_en = 'Select AI model', message_local = 'เลือกโมเดล AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_MODEL_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_MODEL_PLACEHOLDER', 'Select AI model', 'เลือกโมเดล AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_MODEL_PLACEHOLDER');

UPDATE su_message SET message_en = 'Type a prompt or instructions for AI...', message_local = 'พิมพ์คำถาม หรือสั่งให้ AI ปรับแต่ง Diagram...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CHAT_INPUT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CHAT_INPUT_PLACEHOLDER', 'Type a prompt or instructions for AI...', 'พิมพ์คำถาม หรือสั่งให้ AI ปรับแต่ง Diagram...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CHAT_INPUT_PLACEHOLDER');

UPDATE su_message SET message_en = 'Send', message_local = 'ส่ง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SEND_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SEND_BTN', 'Send', 'ส่ง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SEND_BTN');

UPDATE su_message SET message_en = 'Press', message_local = 'กด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PRESS_ENTER_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PRESS_ENTER_PREFIX', 'Press', 'กด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PRESS_ENTER_PREFIX');

UPDATE su_message SET message_en = 'to send', message_local = 'เพื่อส่งข้อความ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PRESS_ENTER_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PRESS_ENTER_SUFFIX', 'to send', 'เพื่อส่งข้อความ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PRESS_ENTER_SUFFIX');

UPDATE su_message SET message_en = 'Create ER Diagram', message_local = 'สร้าง ER Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_ER_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_ER_TITLE', 'Create ER Diagram', 'สร้าง ER Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_ER_TITLE');

UPDATE su_message SET message_en = 'Design an ER diagram for an e-commerce order management system.', message_local = 'ช่วยออกแบบ ER Diagram สำหรับระบบจัดการคำสั่งซื้อของ e-commerce พร้อมตารางและ Relations', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_ER_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_ER_TEXT', 'Design an ER diagram for an e-commerce order management system.', 'ช่วยออกแบบ ER Diagram สำหรับระบบจัดการคำสั่งซื้อของ e-commerce พร้อมตารางและ Relations', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_ER_TEXT');

UPDATE su_message SET message_en = 'Create Process Flowchart', message_local = 'สร้าง Flowchart การทำงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_FLOWCHART_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_FLOWCHART_TITLE', 'Create Process Flowchart', 'สร้าง Flowchart การทำงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_FLOWCHART_TITLE');

UPDATE su_message SET message_en = 'Create a flowchart for user registration and authentication.', message_local = 'ช่วยสร้าง Flowchart กระบวนการสมัครสมาชิกและยืนยันตัวตนของผู้ใช้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_FLOWCHART_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_FLOWCHART_TEXT', 'Create a flowchart for user registration and authentication.', 'ช่วยสร้าง Flowchart กระบวนการสมัครสมาชิกและยืนยันตัวตนของผู้ใช้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_FLOWCHART_TEXT');

UPDATE su_message SET message_en = 'Create Sequence Diagram', message_local = 'สร้าง Sequence Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_SEQUENCE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_SEQUENCE_TITLE', 'Create Sequence Diagram', 'สร้าง Sequence Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_SEQUENCE_TITLE');

UPDATE su_message SET message_en = 'Generate a sequence diagram for payment gateway processing.', message_local = 'ช่วยสร้าง Sequence Diagram ขั้นตอนการชำระเงินผ่าน Payment Gateway', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_SEQUENCE_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_SEQUENCE_TEXT', 'Generate a sequence diagram for payment gateway processing.', 'ช่วยสร้าง Sequence Diagram ขั้นตอนการชำระเงินผ่าน Payment Gateway', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_SEQUENCE_TEXT');

UPDATE su_message SET message_en = 'Analyze Architecture', message_local = 'วิเคราะห์สถาปัตยกรรม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_ANALYZE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_ANALYZE_TITLE', 'Analyze Architecture', 'วิเคราะห์สถาปัตยกรรม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_ANALYZE_TITLE');

UPDATE su_message SET message_en = 'Analyze the current architecture and suggest optimizations.', message_local = 'ช่วยวิเคราะห์สถาปัตยกรรมระบบนี้และแนะนำแนวทางปรับปรุงให้ดียิ่งขึ้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_ANALYZE_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_ANALYZE_TEXT', 'Analyze the current architecture and suggest optimizations.', 'ช่วยวิเคราะห์สถาปัตยกรรมระบบนี้และแนะนำแนวทางปรับปรุงให้ดียิ่งขึ้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_ANALYZE_TEXT');

UPDATE su_message SET message_en = 'New Session', message_local = 'บทสนทนาใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEW_SESSION_TITLE_DEFAULT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEW_SESSION_TITLE_DEFAULT', 'New Session', 'บทสนทนาใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEW_SESSION_TITLE_DEFAULT');

UPDATE su_message SET message_en = 'Failed to connect to AI assistant. Please try again.', message_local = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_CONNECT_ERROR_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_CONNECT_ERROR_MSG', 'Failed to connect to AI assistant. Please try again.', 'เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI กรุณาลองใหม่อีกครั้ง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_CONNECT_ERROR_MSG');

-- 5. SQL Export Dialog
UPDATE su_message SET message_en = 'ER Diagram SQL Generator', message_local = 'เครื่องมือแปลง ER Diagram เป็น SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SQL_GEN_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SQL_GEN_TITLE', 'ER Diagram SQL Generator', 'เครื่องมือแปลง ER Diagram เป็น SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SQL_GEN_TITLE');

UPDATE su_message SET message_en = 'History Log', message_local = 'ประวัติการสร้าง SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_HISTORY_LOG_TAB';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_HISTORY_LOG_TAB', 'History Log', 'ประวัติการสร้าง SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_HISTORY_LOG_TAB');

UPDATE su_message SET message_en = 'Target ER Page', message_local = 'เลือกหน้า ER Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_ER_PAGE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_ER_PAGE_LABEL', 'Target ER Page', 'เลือกหน้า ER Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_ER_PAGE_LABEL');

UPDATE su_message SET message_en = 'No ER Diagram page found in this diagram.', message_local = 'ไม่พบหน้า ER Diagram ในแผนภาพนี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_ER_PAGE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_ER_PAGE_MSG', 'No ER Diagram page found in this diagram.', 'ไม่พบหน้า ER Diagram ในแผนภาพนี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_ER_PAGE_MSG');

UPDATE su_message SET message_en = 'Target Database', message_local = 'ประเภทฐานข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DB_VENDOR_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DB_VENDOR_LABEL', 'Target Database', 'ประเภทฐานข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DB_VENDOR_LABEL');

UPDATE su_message SET message_en = 'AI Model', message_local = 'โมเดล AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_MODEL_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_MODEL_LABEL', 'AI Model', 'โมเดล AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_MODEL_LABEL');

UPDATE su_message SET message_en = 'Initial Database Setup (DDL)', message_local = 'สร้างฐานข้อมูลเริ่มต้น (DDL)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_INITIAL_SETUP_MODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_INITIAL_SETUP_MODE', 'Initial Database Setup (DDL)', 'สร้างฐานข้อมูลเริ่มต้น (DDL)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_INITIAL_SETUP_MODE');

UPDATE su_message SET message_en = 'Generates full CREATE TABLE, PRIMARY KEY, FOREIGN KEY, and INDEX scripts.', message_local = 'สร้างคำสั่ง CREATE TABLE, PRIMARY KEY, FOREIGN KEY และ INDEX ทั้งหมด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_INITIAL_SETUP_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_INITIAL_SETUP_DESC', 'Generates full CREATE TABLE, PRIMARY KEY, FOREIGN KEY, and INDEX scripts.', 'สร้างคำสั่ง CREATE TABLE, PRIMARY KEY, FOREIGN KEY และ INDEX ทั้งหมด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_INITIAL_SETUP_DESC');

UPDATE su_message SET message_en = 'Auto DB Migration (v{0})', message_local = 'สร้าง Migration อัตโนมัติ (v{0})', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AUTO_MIGRATION_MODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AUTO_MIGRATION_MODE', 'Auto DB Migration (v{0})', 'สร้าง Migration อัตโนมัติ (v{0})', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AUTO_MIGRATION_MODE');

UPDATE su_message SET message_en = 'Based on previous version v{0}', message_local = 'เปรียบเทียบความเปลี่ยนแปลงจากเวอร์ชัน v{0}', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MIGRATION_BASED_ON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MIGRATION_BASED_ON', 'Based on previous version v{0}', 'เปรียบเทียบความเปลี่ยนแปลงจากเวอร์ชัน v{0}', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MIGRATION_BASED_ON');

UPDATE su_message SET message_en = 'Generates ALTER TABLE, ADD/DROP COLUMN scripts for schema migration.', message_local = 'สร้างคำสั่ง ALTER TABLE, ADD/DROP COLUMN สำหรับอัปเกรด Schema', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MIGRATION_MODE_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MIGRATION_MODE_DESC', 'Generates ALTER TABLE, ADD/DROP COLUMN scripts for schema migration.', 'สร้างคำสั่ง ALTER TABLE, ADD/DROP COLUMN สำหรับอัปเกรด Schema', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MIGRATION_MODE_DESC');

UPDATE su_message SET message_en = 'Generation Engine:', message_local = 'เครื่องมือประมวลผล:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ENGINE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ENGINE_LABEL', 'Generation Engine:', 'เครื่องมือประมวลผล:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ENGINE_LABEL');

UPDATE su_message SET message_en = 'AI (Smart types & constraints)', message_local = 'AI (คำนวณ Type & Constraint อัจฉริยะ)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ENGINE_AI_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ENGINE_AI_LABEL', 'AI (Smart types & constraints)', 'AI (คำนวณ Type & Constraint อัจฉริยะ)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ENGINE_AI_LABEL');

UPDATE su_message SET message_en = 'Direct XML Parser', message_local = 'Parser ตรงจาก XML', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ENGINE_PARSER_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ENGINE_PARSER_LABEL', 'Direct XML Parser', 'Parser ตรงจาก XML', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ENGINE_PARSER_LABEL');

UPDATE su_message SET message_en = 'Generating SQL...', message_local = 'กำลังสร้างคำสั่ง SQL...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GENERATING_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GENERATING_TEXT', 'Generating SQL...', 'กำลังสร้างคำสั่ง SQL...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GENERATING_TEXT');

UPDATE su_message SET message_en = 'Generated SQL Result', message_local = 'ผลลัพธ์คำสั่ง SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GENERATED_SQL_RESULT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GENERATED_SQL_RESULT', 'Generated SQL Result', 'ผลลัพธ์คำสั่ง SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GENERATED_SQL_RESULT');

UPDATE su_message SET message_en = ' (Saved)', message_local = ' (บันทึกแล้ว)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVED_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVED_SUFFIX', ' (Saved)', ' (บันทึกแล้ว)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVED_SUFFIX');

UPDATE su_message SET message_en = 'Copy', message_local = 'คัดลอก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPY_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPY_TEXT', 'Copy', 'คัดลอก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPY_TEXT');

UPDATE su_message SET message_en = 'Copied!', message_local = 'คัดลอกแล้ว!', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPIED_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPIED_TEXT', 'Copied!', 'คัดลอกแล้ว!', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPIED_TEXT');

UPDATE su_message SET message_en = 'Download .sql', message_local = 'ดาวน์โหลด .sql', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DOWNLOAD_SQL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DOWNLOAD_SQL_BTN', 'Download .sql', 'ดาวน์โหลด .sql', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DOWNLOAD_SQL_BTN');

UPDATE su_message SET message_en = 'Download', message_local = 'ดาวน์โหลด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DOWNLOAD_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DOWNLOAD_BTN', 'Download', 'ดาวน์โหลด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DOWNLOAD_BTN');

UPDATE su_message SET message_en = 'Loading SQL generation history...', message_local = 'กำลังโหลดประวัติการสร้าง SQL...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOADING_HISTORY_LOG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOADING_HISTORY_LOG', 'Loading SQL generation history...', 'กำลังโหลดประวัติการสร้าง SQL...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOADING_HISTORY_LOG');

UPDATE su_message SET message_en = 'No SQL generation history for this diagram yet.', message_local = 'ยังไม่มีประวัติการสร้าง SQL สำหรับ Diagram นี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_HISTORY_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_HISTORY_MSG', 'No SQL generation history for this diagram yet.', 'ยังไม่มีประวัติการสร้าง SQL สำหรับ Diagram นี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_HISTORY_MSG');

UPDATE su_message SET message_en = 'Generate First SQL', message_local = 'เริ่มสร้าง SQL ครั้งแรก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_START_FIRST_GEN_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_START_FIRST_GEN_BTN', 'Generate First SQL', 'เริ่มสร้าง SQL ครั้งแรก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_START_FIRST_GEN_BTN');

UPDATE su_message SET message_en = 'by ', message_local = 'โดย ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_BY_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_BY_PREFIX', 'by ', 'โดย ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_BY_PREFIX');

UPDATE su_message SET message_en = 'Hide SQL Script', message_local = 'ซ่อนโค้ด SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_HIDE_SQL_SCRIPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_HIDE_SQL_SCRIPT', 'Hide SQL Script', 'ซ่อนโค้ด SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_HIDE_SQL_SCRIPT');

UPDATE su_message SET message_en = 'Preview SQL Script', message_local = 'ดูโค้ด SQL', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PREVIEW_SQL_SCRIPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PREVIEW_SQL_SCRIPT', 'Preview SQL Script', 'ดูโค้ด SQL', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PREVIEW_SQL_SCRIPT');

UPDATE su_message SET message_en = 'Diagram ID:', message_local = 'รหัส Diagram:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_TAB_ID_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_TAB_ID_LABEL', 'Diagram ID:', 'รหัส Diagram:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_TAB_ID_LABEL');

UPDATE su_message SET message_en = 'Close', message_local = 'ปิด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CLOSE_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CLOSE_BTN', 'Close', 'ปิด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CLOSE_BTN');

UPDATE su_message SET message_en = 'No Page Selected', message_local = 'ยังไม่ได้เลือกหน้า Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_PAGE_SELECTED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_PAGE_SELECTED_TITLE', 'No Page Selected', 'ยังไม่ได้เลือกหน้า Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_PAGE_SELECTED_TITLE');

UPDATE su_message SET message_en = 'Please select an ER Diagram page.', message_local = 'กรุณาเลือกหน้า ER Diagram ก่อนดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_PAGE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_PAGE_MSG', 'Please select an ER Diagram page.', 'กรุณาเลือกหน้า ER Diagram ก่อนดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_PAGE_MSG');

UPDATE su_message SET message_en = 'Page Not Found', message_local = 'ไม่พบหน้าที่เลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PAGE_NOT_FOUND_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PAGE_NOT_FOUND_TITLE', 'Page Not Found', 'ไม่พบหน้าที่เลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PAGE_NOT_FOUND_TITLE');

UPDATE su_message SET message_en = 'The selected page could not be found.', message_local = 'ไม่พบข้อมูลของหน้าที่เลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PAGE_NOT_EXIST_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PAGE_NOT_EXIST_MSG', 'The selected page could not be found.', 'ไม่พบข้อมูลของหน้าที่เลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PAGE_NOT_EXIST_MSG');

UPDATE su_message SET message_en = 'Could not generate SQL script.', message_local = 'ไม่สามารถสร้างสคริปต์ SQL ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GEN_SQL_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GEN_SQL_FAIL_MSG', 'Could not generate SQL script.', 'ไม่สามารถสร้างสคริปต์ SQL ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GEN_SQL_FAIL_MSG');

UPDATE su_message SET message_en = 'Generation Failed', message_local = 'สร้างไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GEN_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GEN_FAILED_TITLE', 'Generation Failed', 'สร้างไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GEN_FAILED_TITLE');
