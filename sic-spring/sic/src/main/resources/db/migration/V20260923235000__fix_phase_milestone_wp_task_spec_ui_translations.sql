-- Fix abbreviations, dummy headers ("Header Title", "Title H", "Ms", "Wp"), and missing labels for PMDT01, PMDT02, PMDT06, PMDT07, PMDT12

-- PMDT01: Phase
UPDATE su_message SET message_en = 'Create Phase', message_local = 'สร้าง Phase', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_CREATE_PHASE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_CREATE_PHASE_TITLE', 'Create Phase', 'สร้าง Phase', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_CREATE_PHASE_TITLE');

UPDATE su_message SET message_en = 'Edit Phase', message_local = 'แก้ไข Phase', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_EDIT_PHASE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_EDIT_PHASE_TITLE', 'Edit Phase', 'แก้ไข Phase', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EDIT_PHASE_TITLE');

UPDATE su_message SET message_en = 'Customer', message_local = 'ลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_CUSTOMER_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_CUSTOMER_LABEL', 'Customer', 'ลูกค้า', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_CUSTOMER_LABEL');

UPDATE su_message SET message_en = 'Search and select customer', message_local = 'ค้นหาและเลือกลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_CUSTOMER_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_CUSTOMER_PLACEHOLDER', 'Search and select customer', 'ค้นหาและเลือกลูกค้า', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_CUSTOMER_PLACEHOLDER');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PROJECT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PROJECT_LABEL', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PROJECT_LABEL');

UPDATE su_message SET message_en = 'Search and select project', message_local = 'ค้นหาและเลือกโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PROJECT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PROJECT_PLACEHOLDER', 'Search and select project', 'ค้นหาและเลือกโครงการ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PROJECT_PLACEHOLDER');


-- PMDT02: Milestone, Work Package, Task
UPDATE su_message SET message_en = 'Create Milestone', message_local = 'สร้าง Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CREATE_MS_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CREATE_MS_TITLE_H', 'Create Milestone', 'สร้าง Milestone', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CREATE_MS_TITLE_H');

UPDATE su_message SET message_en = 'Edit Milestone', message_local = 'แก้ไข Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_EDIT_MS_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_EDIT_MS_TITLE_H', 'Edit Milestone', 'แก้ไข Milestone', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_EDIT_MS_TITLE_H');

UPDATE su_message SET message_en = 'Phase', message_local = 'เฟส (Phase)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PHASE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PHASE_LABEL', 'Phase', 'เฟส (Phase)', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PHASE_LABEL');

UPDATE su_message SET message_en = 'Search and select phase', message_local = 'ค้นหาและเลือกเฟส', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_PHASE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_PHASE_PLACEHOLDER', 'Search and select phase', 'ค้นหาและเลือกเฟส', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_PHASE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Create Work Package', message_local = 'สร้าง Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CREATE_WP_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CREATE_WP_TITLE_H', 'Create Work Package', 'สร้าง Work Package', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CREATE_WP_TITLE_H');

UPDATE su_message SET message_en = 'Edit Work Package', message_local = 'แก้ไข Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_EDIT_WP_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_EDIT_WP_TITLE_H', 'Edit Work Package', 'แก้ไข Work Package', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_EDIT_WP_TITLE_H');

UPDATE su_message SET message_en = 'Milestone', message_local = 'ไมล์สโตน (Milestone)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MILESTONE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MILESTONE_LABEL', 'Milestone', 'ไมล์สโตน (Milestone)', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MILESTONE_LABEL');

UPDATE su_message SET message_en = 'Search and select milestone', message_local = 'ค้นหาและเลือกไมล์สโตน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_MILESTONE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_MILESTONE_PLACEHOLDER', 'Search and select milestone', 'ค้นหาและเลือกไมล์สโตน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_MILESTONE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Create Task', message_local = 'สร้าง Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CREATE_TASK_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CREATE_TASK_TITLE_H', 'Create Task', 'สร้าง Task', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CREATE_TASK_TITLE_H');

UPDATE su_message SET message_en = 'Edit Task', message_local = 'แก้ไข Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_EDIT_TASK_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_EDIT_TASK_TITLE_H', 'Edit Task', 'แก้ไข Task', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_EDIT_TASK_TITLE_H');

UPDATE su_message SET message_en = 'Work Package', message_local = 'แพ็กเกจงาน (Work Package)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_WORK_PACKAGE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_WORK_PACKAGE_LABEL', 'Work Package', 'แพ็กเกจงาน (Work Package)', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_WORK_PACKAGE_LABEL');

UPDATE su_message SET message_en = 'Search and select work package', message_local = 'ค้นหาและเลือกแพ็กเกจงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_WP_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_WP_PLACEHOLDER', 'Search and select work package', 'ค้นหาและเลือกแพ็กเกจงาน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_WP_PLACEHOLDER');


-- PMDT06: Change Request
UPDATE su_message SET message_en = 'Customer', message_local = 'ลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_CUSTOMER_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_CUSTOMER_LABEL', 'Customer', 'ลูกค้า', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_CUSTOMER_LABEL');

UPDATE su_message SET message_en = 'Search and select customer', message_local = 'ค้นหาและเลือกลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_CUSTOMER_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_CUSTOMER_PLACEHOLDER', 'Search and select customer', 'ค้นหาและเลือกลูกค้า', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_CUSTOMER_PLACEHOLDER');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_PROJECT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_PROJECT_LABEL', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_PROJECT_LABEL');

UPDATE su_message SET message_en = 'Search and select project', message_local = 'ค้นหาและเลือกโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_PROJECT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_PROJECT_PLACEHOLDER', 'Search and select project', 'ค้นหาและเลือกโครงการ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_PROJECT_PLACEHOLDER');


-- PMDT07: Specification
UPDATE su_message SET message_en = 'Specification', message_local = 'รายการ Specification', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_HEADER_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_HEADER_TITLE', 'Specification', 'รายการ Specification', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_HEADER_TITLE');


-- PMDT12: Test Execution & Bug Report
UPDATE su_message SET message_en = 'Search scenario, case code, title, tester...', message_local = 'ค้นหา Scenario, รหัสเคส, หัวข้อ, ผู้ทดสอบ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_SEARCH_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_SEARCH_PLACEHOLDER', 'Search scenario, case code, title, tester...', 'ค้นหา Scenario, รหัสเคส, หัวข้อ, ผู้ทดสอบ...', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_SEARCH_PLACEHOLDER');

UPDATE su_message SET message_en = '📊 All Test Case Statuses', message_local = '📊 ทุกสถานะ Test Case', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_FILTER_STATUS_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_FILTER_STATUS_PH', '📊 All Test Case Statuses', '📊 ทุกสถานะ Test Case', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_FILTER_STATUS_PH');

UPDATE su_message SET message_en = '⚡ All Priorities', message_local = '⚡ ทุกระดับความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_FILTER_PRIORITY_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_FILTER_PRIORITY_PH', '⚡ All Priorities', '⚡ ทุกระดับความสำคัญ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_FILTER_PRIORITY_PH');

UPDATE su_message SET message_en = '🎯 All Task Statuses', message_local = '🎯 ทุกสถานะ Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_FILTER_TASK_STATUS_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_FILTER_TASK_STATUS_PH', '🎯 All Task Statuses', '🎯 ทุกสถานะ Task', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_FILTER_TASK_STATUS_PH');

UPDATE su_message SET message_en = 'Severity', message_local = 'ระดับความรุนแรง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_SEVERITY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_SEVERITY_LABEL', 'Severity', 'ระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_SEVERITY_LABEL');

UPDATE su_message SET message_en = 'Select severity', message_local = 'เลือกระดับความรุนแรง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_SEVERITY_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_SEVERITY_PH', 'Select severity', 'เลือกระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_SEVERITY_PH');

UPDATE su_message SET message_en = 'Bug Title / Summary', message_local = 'ชื่อ / หัวข้อ Bug', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_BUG_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_BUG_TITLE_LABEL', 'Bug Title / Summary', 'ชื่อ / หัวข้อ Bug', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_BUG_TITLE_LABEL');

UPDATE su_message SET message_en = 'Enter bug details...', message_local = 'ระบุข้อผิดพลาดที่พบ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_BUG_TITLE_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_BUG_TITLE_PH', 'Enter bug details...', 'ระบุข้อผิดพลาดที่พบ...', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_BUG_TITLE_PH');

UPDATE su_message SET message_en = 'Assigned Fixer', message_local = 'ผู้รับผิดชอบแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_ASSIGNED_TO_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_ASSIGNED_TO_LABEL', 'Assigned Fixer', 'ผู้รับผิดชอบแก้ไข', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_ASSIGNED_TO_LABEL');

UPDATE su_message SET message_en = 'Select assignee', message_local = 'เลือกสมาชิกทีมผู้รับผิดชอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_ASSIGNED_TO_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_ASSIGNED_TO_PH', 'Select assignee', 'เลือกสมาชิกทีมผู้รับผิดชอบ', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_ASSIGNED_TO_PH');

UPDATE su_message SET message_en = 'Estimated Manday', message_local = 'ประมาณการ Manday', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_MANDAY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_MANDAY_LABEL', 'Estimated Manday', 'ประมาณการ Manday', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_MANDAY_LABEL');
