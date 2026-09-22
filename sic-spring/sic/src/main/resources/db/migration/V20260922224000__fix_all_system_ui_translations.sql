-- Migration: Complete Fix for All Corrupted & Suspicious UI Translations across System
-- Fully covers PMDT01-PMDT20, PMRT, BURT, and Business Modules
-- Corrected column names (program_code, is_delete) and compatible PostgreSQL statements

UPDATE su_message SET message_en = 'Project Work Breakdown Structure (WBS)', message_local = 'โครงสร้างการแบ่งงานโครงการ (WBS)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PAGE_TITLE', 'Project Work Breakdown Structure (WBS)', 'โครงสร้างการแบ่งงานโครงการ (WBS)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PAGE_TITLE');

UPDATE su_message SET message_en = 'Manage phases, milestones, deliverables, and work packages', message_local = 'จัดการระยะโครงการ, Milestone, การส่งมอบ และ Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_SUBTITLE', 'Manage phases, milestones, deliverables, and work packages', 'จัดการระยะโครงการ, Milestone, การส่งมอบ และ Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_SUBTITLE');

UPDATE su_message SET message_en = 'All', message_local = 'ทั้งหมด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_FILTER_ALL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_FILTER_ALL', 'All', 'ทั้งหมด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_FILTER_ALL');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Add Phase', message_local = 'เพิ่ม Phase', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_ADD_PHASE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_ADD_PHASE', 'Add Phase', 'เพิ่ม Phase', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_ADD_PHASE');

UPDATE su_message SET message_en = 'Quick View', message_local = 'ดูข้อมูลด่วน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_QUICK_VIEW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_QUICK_VIEW', 'Quick View', 'ดูข้อมูลด่วน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_QUICK_VIEW');

UPDATE su_message SET message_en = 'Edit', message_local = 'แก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_EDIT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_EDIT', 'Edit', 'แก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EDIT');

UPDATE su_message SET message_en = 'Delete', message_local = 'ลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_DELETE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_DELETE', 'Delete', 'ลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_DELETE');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Do you want to delete this phase/milestone?', message_local = 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_CONFIRM_DELETE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_CONFIRM_DELETE_MSG', 'Do you want to delete this phase/milestone?', 'คุณต้องการลบข้อมูลนี้ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_CONFIRM_DELETE_MSG');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_DELETE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_DELETE_FAIL_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_DELETE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_APPROVED_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_APPROVED_LABEL', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_APPROVED_LABEL');

UPDATE su_message SET message_en = 'Not Started', message_local = 'ยังไม่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_STATUS_NOT_STARTED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_STATUS_NOT_STARTED', 'Not Started', 'ยังไม่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_STATUS_NOT_STARTED');

UPDATE su_message SET message_en = 'In Progress', message_local = 'กำลังดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_STATUS_IN_PROGRESS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_STATUS_IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_STATUS_IN_PROGRESS');

UPDATE su_message SET message_en = 'Completed', message_local = 'เสร็จสิ้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_STATUS_DONE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_STATUS_DONE', 'Completed', 'เสร็จสิ้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_STATUS_DONE');

UPDATE su_message SET message_en = 'Delayed', message_local = 'ล่าช้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_STATUS_DELAYED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_STATUS_DELAYED', 'Delayed', 'ล่าช้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_STATUS_DELAYED');

UPDATE su_message SET message_en = 'Edit Milestone', message_local = 'แก้ไข Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_EDIT_MILESTONE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_EDIT_MILESTONE', 'Edit Milestone', 'แก้ไข Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EDIT_MILESTONE');

UPDATE su_message SET message_en = 'Due Date', message_local = 'วันที่ครบกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_DUE_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_DUE_DATE_LABEL', 'Due Date', 'วันที่ครบกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_DUE_DATE_LABEL');

UPDATE su_message SET message_en = 'Milestone Name', message_local = 'ชื่อ Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_MILESTONE_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_MILESTONE_NAME_LABEL', 'Milestone Name', 'ชื่อ Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_MILESTONE_NAME_LABEL');

UPDATE su_message SET message_en = 'Description', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_MILESTONE_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_MILESTONE_DESC_LABEL', 'Description', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_MILESTONE_DESC_LABEL');

UPDATE su_message SET message_en = 'Edit Work Package', message_local = 'แก้ไข Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_EDIT_WORK_PACKAGE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_EDIT_WORK_PACKAGE', 'Edit Work Package', 'แก้ไข Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EDIT_WORK_PACKAGE');

UPDATE su_message SET message_en = 'Start Date', message_local = 'วันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_START_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_START_DATE_LABEL', 'Start Date', 'วันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_START_DATE_LABEL');

UPDATE su_message SET message_en = 'Select start date', message_local = 'เลือกวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_START_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_START_DATE_PLACEHOLDER', 'Select start date', 'เลือกวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_START_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Start date is required', message_local = 'กรุณาระบุวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_START_DATE_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_START_DATE_REQUIRED', 'Start date is required', 'กรุณาระบุวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_START_DATE_REQUIRED');

UPDATE su_message SET message_en = 'Start Time', message_local = 'เวลาเริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_START_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_START_TIME_LABEL', 'Start Time', 'เวลาเริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_START_TIME_LABEL');

UPDATE su_message SET message_en = 'Select time', message_local = 'เลือกเวลา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_SELECT_TIME_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_SELECT_TIME_PLACEHOLDER', 'Select time', 'เลือกเวลา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_SELECT_TIME_PLACEHOLDER');

UPDATE su_message SET message_en = 'End Date', message_local = 'วันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_END_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_END_DATE_LABEL', 'End Date', 'วันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_END_DATE_LABEL');

UPDATE su_message SET message_en = 'Select end date', message_local = 'เลือกวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_END_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_END_DATE_PLACEHOLDER', 'Select end date', 'เลือกวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_END_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'End date is required', message_local = 'กรุณาระบุวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_END_DATE_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_END_DATE_REQUIRED', 'End date is required', 'กรุณาระบุวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_END_DATE_REQUIRED');

UPDATE su_message SET message_en = 'End Time', message_local = 'เวลาสิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_END_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_END_TIME_LABEL', 'End Time', 'เวลาสิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_END_TIME_LABEL');

UPDATE su_message SET message_en = 'Work Package Name', message_local = 'ชื่อ Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_WP_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_WP_NAME_LABEL', 'Work Package Name', 'ชื่อ Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_WP_NAME_LABEL');

UPDATE su_message SET message_en = 'Description', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_WP_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_WP_DESC_LABEL', 'Description', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_WP_DESC_LABEL');

UPDATE su_message SET message_en = 'Estimated Manday', message_local = 'Manday โดยประมาณ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_EST_MANDAY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_EST_MANDAY_LABEL', 'Estimated Manday', 'Manday โดยประมาณ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_EST_MANDAY_LABEL');

UPDATE su_message SET message_en = 'Test Cases & Results', message_local = 'รายการเคสทดสอบและผลการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_CASES_RESULTS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_CASES_RESULTS', 'Test Cases & Results', 'รายการเคสทดสอบและผลการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_CASES_RESULTS');

UPDATE su_message SET message_en = 'Test Case Title', message_local = 'หัวข้อ Test Case', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_CASE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_CASE_TITLE', 'Test Case Title', 'หัวข้อ Test Case', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_CASE_TITLE');

UPDATE su_message SET message_en = 'Test Status', message_local = 'สถานะการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_STATUS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_STATUS_LABEL', 'Test Status', 'สถานะการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_STATUS_LABEL');

UPDATE su_message SET message_en = 'Test Notes', message_local = 'บันทึกการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_NOTE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_NOTE_LABEL', 'Test Notes', 'บันทึกการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_NOTE_LABEL');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PRIORITY_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PRIORITY_LOW', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PRIORITY_LOW');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PRIORITY_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PRIORITY_MEDIUM', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PRIORITY_MEDIUM');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PRIORITY_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PRIORITY_HIGH', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PRIORITY_HIGH');

UPDATE su_message SET message_en = 'Critical', message_local = 'วิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_PRIORITY_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_PRIORITY_CRITICAL', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_PRIORITY_CRITICAL');

UPDATE su_message SET message_en = 'Pass', message_local = 'ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_PASS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_PASS', 'Pass', 'ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_PASS');

UPDATE su_message SET message_en = 'Fail', message_local = 'ไม่ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_FAIL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_FAIL', 'Fail', 'ไม่ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_FAIL');

UPDATE su_message SET message_en = 'Blocked', message_local = 'ติดบล็อก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_BLOCKED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_BLOCKED', 'Blocked', 'ติดบล็อก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_BLOCKED');

UPDATE su_message SET message_en = 'Pending', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT01_TEST_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT01_TEST_PENDING', 'Pending', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT01_TEST_PENDING');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'SRS Code', message_local = 'รหัส SRS', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_CODE', 'SRS Code', 'รหัส SRS', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_CODE');

UPDATE su_message SET message_en = 'Title', message_local = 'หัวข้อ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_TITLE', 'Title', 'หัวข้อ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_TITLE');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_PROJECT', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_PROJECT');

UPDATE su_message SET message_en = 'Version', message_local = 'เวอร์ชัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_VERSION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_VERSION', 'Version', 'เวอร์ชัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_VERSION');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_COL_ACTIONS');

UPDATE su_message SET message_en = 'Draft', message_local = 'ฉบับร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_STATUS_DRAFT', 'Draft', 'ฉบับร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_STATUS_DRAFT');

UPDATE su_message SET message_en = 'Submitted', message_local = 'ยื่นคำขอแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_STATUS_SUBMITTED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_STATUS_SUBMITTED', 'Submitted', 'ยื่นคำขอแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_STATUS_SUBMITTED');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_STATUS_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_STATUS_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_STATUS_APPROVED');

UPDATE su_message SET message_en = 'Rejected', message_local = 'ปฏิเสธ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_STATUS_REJECTED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_STATUS_REJECTED', 'Rejected', 'ปฏิเสธ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_STATUS_REJECTED');

UPDATE su_message SET message_en = 'Cancelled', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_STATUS_CANCELLED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_STATUS_CANCELLED', 'Cancelled', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_STATUS_CANCELLED');

UPDATE su_message SET message_en = 'Export Failed', message_local = 'พิมพ์เอกสารไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRINT_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRINT_FAILED_TITLE', 'Export Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRINT_FAILED_TITLE');

UPDATE su_message SET message_en = 'Unable to export document', message_local = 'ไม่สามารถส่งออกเอกสารได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRINT_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRINT_FAILED_MSG', 'Unable to export document', 'ไม่สามารถส่งออกเอกสารได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRINT_FAILED_MSG');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Do you want to delete this document?', message_local = 'คุณต้องการลบเอกสารนี้ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CONFIRM_DELETE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CONFIRM_DELETE_MSG', 'Do you want to delete this document?', 'คุณต้องการลบเอกสารนี้ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CONFIRM_DELETE_MSG');

UPDATE su_message SET message_en = 'Deleted', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DELETE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DELETE_SUCCESS_TITLE', 'Deleted', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DELETE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Document deleted successfully', message_local = 'ลบเอกสารเรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DELETE_SUCCESS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DELETE_SUCCESS_MSG', 'Document deleted successfully', 'ลบเอกสารเรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DELETE_SUCCESS_MSG');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DELETE_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DELETE_FAILED_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DELETE_FAILED_TITLE');

UPDATE su_message SET message_en = 'Saved', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SAVE_SUCCESS_TITLE', 'Saved', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SAVE_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SAVE_FAILED_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SAVE_FAILED_TITLE');

UPDATE su_message SET message_en = 'SRS Document Details', message_local = 'รายละเอียดเอกสาร SRS', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_FORM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_FORM_TITLE', 'SRS Document Details', 'รายละเอียดเอกสาร SRS', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_FORM_TITLE');

UPDATE su_message SET message_en = 'Document Code', message_local = 'รหัสเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CODE_LABEL', 'Document Code', 'รหัสเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. SRS-2026-001', message_local = 'เช่น SRS-2026-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CODE_PLACEHOLDER', 'e.g. SRS-2026-001', 'เช่น SRS-2026-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Document Title', message_local = 'ชื่อเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TITLE_LABEL', 'Document Title', 'ชื่อเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TITLE_LABEL');

UPDATE su_message SET message_en = 'Enter document title', message_local = 'กรอกชื่อเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TITLE_PLACEHOLDER', 'Enter document title', 'กรอกชื่อเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PROJECT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PROJECT_LABEL', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PROJECT_LABEL');

UPDATE su_message SET message_en = 'Select project', message_local = 'เลือกโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PROJECT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PROJECT_PLACEHOLDER', 'Select project', 'เลือกโครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PROJECT_PLACEHOLDER');

UPDATE su_message SET message_en = 'Scope of Work', message_local = 'ขอบเขตงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SCOPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SCOPE_LABEL', 'Scope of Work', 'ขอบเขตงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SCOPE_LABEL');

UPDATE su_message SET message_en = 'Describe scope of work...', message_local = 'ระบุขอบเขตงาน...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SCOPE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SCOPE_PLACEHOLDER', 'Describe scope of work...', 'ระบุขอบเขตงาน...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SCOPE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Detailed Description', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DESC_LABEL', 'Detailed Description', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DESC_LABEL');

UPDATE su_message SET message_en = 'Enter detailed specifications...', message_local = 'ระบุรายละเอียด...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DESC_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DESC_PLACEHOLDER', 'Enter detailed specifications...', 'ระบุรายละเอียด...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DESC_PLACEHOLDER');

UPDATE su_message SET message_en = 'Approval Process', message_local = 'กระบวนการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_APPROVAL_PROCESS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_APPROVAL_PROCESS_LABEL', 'Approval Process', 'กระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_APPROVAL_PROCESS_LABEL');

UPDATE su_message SET message_en = 'Select Approval Flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_FLOW_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_FLOW_LABEL', 'Select Approval Flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_FLOW_LABEL');

UPDATE su_message SET message_en = 'Select approval flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_FLOW_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_FLOW_PLACEHOLDER', 'Select approval flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_FLOW_PLACEHOLDER');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_BACK_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_BACK_BTN', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_BACK_BTN');

UPDATE su_message SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CANCEL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CANCEL_BTN');

UPDATE su_message SET message_en = 'Save', message_local = 'บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SAVE_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SAVE_BTN', 'Save', 'บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SAVE_BTN');

UPDATE su_message SET message_en = 'Submit for Approval', message_local = 'ส่งขออนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SUBMIT_APPROVAL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SUBMIT_APPROVAL_BTN', 'Submit for Approval', 'ส่งขออนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SUBMIT_APPROVAL_BTN');

UPDATE su_message SET message_en = 'List View', message_local = 'มุมมองรายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TAB_LIST';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TAB_LIST', 'List View', 'มุมมองรายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TAB_LIST');

UPDATE su_message SET message_en = 'Calendar', message_local = 'ปฏิทิน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TAB_CALENDAR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TAB_CALENDAR', 'Calendar', 'ปฏิทิน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TAB_CALENDAR');

UPDATE su_message SET message_en = 'Gantt Chart', message_local = 'แผนภูมิ Gantt', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_GANTT_CHART';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_GANTT_CHART', 'Gantt Chart', 'แผนภูมิ Gantt', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_GANTT_CHART');

UPDATE su_message SET message_en = 'Kanban Board', message_local = 'กระดาน Kanban', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TAB_KANBAN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TAB_KANBAN', 'Kanban Board', 'กระดาน Kanban', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TAB_KANBAN');

UPDATE su_message SET message_en = 'Milestones & Work Packages', message_local = 'Milestone และ Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MS_WP_HEADING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MS_WP_HEADING', 'Milestones & Work Packages', 'Milestone และ Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MS_WP_HEADING');

UPDATE su_message SET message_en = 'Milestones', message_local = 'Milestones', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MILESTONES_WORD';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MILESTONES_WORD', 'Milestones', 'Milestones', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MILESTONES_WORD');

UPDATE su_message SET message_en = 'Add Milestone', message_local = 'เพิ่ม Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_ADD_MILESTONE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_ADD_MILESTONE', 'Add Milestone', 'เพิ่ม Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_ADD_MILESTONE');

UPDATE su_message SET message_en = 'Add Work Package', message_local = 'เพิ่ม Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_ADD_WP_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_ADD_WP_TITLE', 'Add Work Package', 'เพิ่ม Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_ADD_WP_TITLE');

UPDATE su_message SET message_en = 'Add WP', message_local = 'เพิ่ม WP', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_ADD_WP_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_ADD_WP_SHORT', 'Add WP', 'เพิ่ม WP', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_ADD_WP_SHORT');

UPDATE su_message SET message_en = 'Edit Milestone', message_local = 'แก้ไข Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_EDIT_MS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_EDIT_MS_TITLE', 'Edit Milestone', 'แก้ไข Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_EDIT_MS_TITLE');

UPDATE su_message SET message_en = 'Delete Milestone', message_local = 'ลบ Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DELETE_MS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DELETE_MS_TITLE', 'Delete Milestone', 'ลบ Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DELETE_MS_TITLE');

UPDATE su_message SET message_en = 'Date', message_local = 'วันที่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DATE_LABEL', 'Date', 'วันที่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DATE_LABEL');

UPDATE su_message SET message_en = 'Details', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DETAIL_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DETAIL_LABEL', 'Details', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DETAIL_LABEL');

UPDATE su_message SET message_en = 'Enter details...', message_local = 'กรอกรายละเอียด...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DETAIL_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DETAIL_PLACEHOLDER', 'Enter details...', 'กรอกรายละเอียด...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DETAIL_PLACEHOLDER');

UPDATE su_message SET message_en = 'Select Icon', message_local = 'เลือกไอคอน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_ICON_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_ICON_LABEL', 'Select Icon', 'เลือกไอคอน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_ICON_LABEL');

UPDATE su_message SET message_en = 'Phase:', message_local = 'Phase:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PHASE_TITLE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PHASE_TITLE_PREFIX', 'Phase:', 'Phase:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PHASE_TITLE_PREFIX');

UPDATE su_message SET message_en = 'Main Phase', message_local = 'Phase หลัก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MAIN_PHASE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MAIN_PHASE_LABEL', 'Main Phase', 'Phase หลัก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MAIN_PHASE_LABEL');

UPDATE su_message SET message_en = 'Duration', message_local = 'ระยะเวลา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DURATION_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DURATION_LABEL', 'Duration', 'ระยะเวลา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DURATION_LABEL');

UPDATE su_message SET message_en = 'Work Package:', message_local = 'Work Package:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_WP_TITLE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_WP_TITLE_PREFIX', 'Work Package:', 'Work Package:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_WP_TITLE_PREFIX');

UPDATE su_message SET message_en = 'Task:', message_local = 'งาน (Task):', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TASK_TITLE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TASK_TITLE_PREFIX', 'Task:', 'งาน (Task):', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TASK_TITLE_PREFIX');

UPDATE su_message SET message_en = 'Associated tasks and progress', message_local = 'งานที่เกี่ยวข้องและความคืบหน้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TASK_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TASK_SUBTITLE', 'Associated tasks and progress', 'งานที่เกี่ยวข้องและความคืบหน้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TASK_SUBTITLE');

UPDATE su_message SET message_en = 'Assignee', message_local = 'ผู้รับผิดชอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_ASSIGNEE_TOOLTIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_ASSIGNEE_TOOLTIP', 'Assignee', 'ผู้รับผิดชอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_ASSIGNEE_TOOLTIP');

UPDATE su_message SET message_en = 'Milestone Settings', message_local = 'ตั้งค่า Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_EDIT_MS_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_EDIT_MS_TITLE_H', 'Milestone Settings', 'ตั้งค่า Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_EDIT_MS_TITLE_H');

UPDATE su_message SET message_en = 'Milestone Name', message_local = 'ชื่อ Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MS_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MS_NAME_LABEL', 'Milestone Name', 'ชื่อ Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MS_NAME_LABEL');

UPDATE su_message SET message_en = 'Description', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DESCRIPTION_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DESCRIPTION_LABEL', 'Description', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DESCRIPTION_LABEL');

UPDATE su_message SET message_en = 'Enter milestone description...', message_local = 'ระบุรายละเอียด Milestone...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MS_DESCRIPTION_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MS_DESCRIPTION_PLACEHOLDER', 'Enter milestone description...', 'ระบุรายละเอียด Milestone...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MS_DESCRIPTION_PLACEHOLDER');

UPDATE su_message SET message_en = 'Due Date', message_local = 'วันที่ครบกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DUE_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DUE_DATE_LABEL', 'Due Date', 'วันที่ครบกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DUE_DATE_LABEL');

UPDATE su_message SET message_en = 'Select date', message_local = 'เลือกวันที่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_DATE_PLACEHOLDER', 'Select date', 'เลือกวันที่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Due date is required', message_local = 'กรุณาระบุวันที่ครบกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DUE_DATE_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DUE_DATE_REQUIRED', 'Due date is required', 'กรุณาระบุวันที่ครบกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DUE_DATE_REQUIRED');

UPDATE su_message SET message_en = 'Due Time', message_local = 'เวลาที่ครบกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_DUE_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_DUE_TIME_LABEL', 'Due Time', 'เวลาที่ครบกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_DUE_TIME_LABEL');

UPDATE su_message SET message_en = 'Select time', message_local = 'เลือกเวลา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_TIME_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_TIME_PLACEHOLDER', 'Select time', 'เลือกเวลา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_TIME_PLACEHOLDER');

UPDATE su_message SET message_en = 'Work Package Settings', message_local = 'ตั้งค่า Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_EDIT_WP_TITLE_H';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_EDIT_WP_TITLE_H', 'Work Package Settings', 'ตั้งค่า Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_EDIT_WP_TITLE_H');

UPDATE su_message SET message_en = 'Work Package Name', message_local = 'ชื่อ Work Package', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_WP_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_WP_NAME_LABEL', 'Work Package Name', 'ชื่อ Work Package', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_WP_NAME_LABEL');

UPDATE su_message SET message_en = 'Enter work package description...', message_local = 'ระบุรายละเอียด Work Package...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_WP_DESCRIPTION_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_WP_DESCRIPTION_PLACEHOLDER', 'Enter work package description...', 'ระบุรายละเอียด Work Package...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_WP_DESCRIPTION_PLACEHOLDER');

UPDATE su_message SET message_en = 'Start Date', message_local = 'วันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_START_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_START_DATE_LABEL', 'Start Date', 'วันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_START_DATE_LABEL');

UPDATE su_message SET message_en = 'Select start date', message_local = 'เลือกวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_START_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_START_DATE_PLACEHOLDER', 'Select start date', 'เลือกวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_START_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Start date is required', message_local = 'กรุณาระบุวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_START_DATE_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_START_DATE_REQUIRED', 'Start date is required', 'กรุณาระบุวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_START_DATE_REQUIRED');

UPDATE su_message SET message_en = 'Start Time', message_local = 'เวลาเริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_START_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_START_TIME_LABEL', 'Start Time', 'เวลาเริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_START_TIME_LABEL');

UPDATE su_message SET message_en = 'End Date', message_local = 'วันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_END_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_END_DATE_LABEL', 'End Date', 'วันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_END_DATE_LABEL');

UPDATE su_message SET message_en = 'Select end date', message_local = 'เลือกวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_END_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_END_DATE_PLACEHOLDER', 'Select end date', 'เลือกวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_END_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'End date is required', message_local = 'กรุณาระบุวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_END_DATE_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_END_DATE_REQUIRED', 'End date is required', 'กรุณาระบุวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_END_DATE_REQUIRED');

UPDATE su_message SET message_en = 'End Time', message_local = 'เวลาสิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_END_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_END_TIME_LABEL', 'End Time', 'เวลาสิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_END_TIME_LABEL');

UPDATE su_message SET message_en = 'Manday', message_local = 'จำนวน Manday', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MANDAY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MANDAY_LABEL', 'Manday', 'จำนวน Manday', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MANDAY_LABEL');

UPDATE su_message SET message_en = 'Manday is required', message_local = 'กรุณาระบุ Manday', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_MANDAY_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_MANDAY_REQUIRED', 'Manday is required', 'กรุณาระบุ Manday', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_MANDAY_REQUIRED');

UPDATE su_message SET message_en = 'Priority', message_local = 'ความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRIORITY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRIORITY_LABEL', 'Priority', 'ความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRIORITY_LABEL');

UPDATE su_message SET message_en = 'Select priority', message_local = 'เลือกระดับความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_SELECT_PRIORITY_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_SELECT_PRIORITY_PLACEHOLDER', 'Select priority', 'เลือกระดับความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_SELECT_PRIORITY_PLACEHOLDER');

UPDATE su_message SET message_en = 'Linked Test Cases', message_local = 'รายการเคสทดสอบที่เชื่อมโยง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TEST_CASE_LIST_HEADING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TEST_CASE_LIST_HEADING', 'Linked Test Cases', 'รายการเคสทดสอบที่เชื่อมโยง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TEST_CASE_LIST_HEADING');

UPDATE su_message SET message_en = 'cases', message_local = 'เคส', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_CASES_UNIT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_CASES_UNIT', 'cases', 'เคส', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_CASES_UNIT');

UPDATE su_message SET message_en = 'Loading test cases...', message_local = 'กำลังโหลดรายการเคสทดสอบ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_LOADING_TEST_CASES';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_LOADING_TEST_CASES', 'Loading test cases...', 'กำลังโหลดรายการเคสทดสอบ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_LOADING_TEST_CASES');

UPDATE su_message SET message_en = 'No linked test cases found', message_local = 'ไม่พบเคสทดสอบที่เชื่อมโยง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_NO_LINKED_TEST_CASE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_NO_LINKED_TEST_CASE', 'No linked test cases found', 'ไม่พบเคสทดสอบที่เชื่อมโยง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_NO_LINKED_TEST_CASE');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRIORITY_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRIORITY_LOW', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRIORITY_LOW');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRIORITY_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRIORITY_MEDIUM', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRIORITY_MEDIUM');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRIORITY_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRIORITY_HIGH', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRIORITY_HIGH');

UPDATE su_message SET message_en = 'Critical', message_local = 'วิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_PRIORITY_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_PRIORITY_CRITICAL', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_PRIORITY_CRITICAL');

UPDATE su_message SET message_en = 'Pass', message_local = 'ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TEST_STATUS_PASS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TEST_STATUS_PASS', 'Pass', 'ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TEST_STATUS_PASS');

UPDATE su_message SET message_en = 'Fail', message_local = 'ไม่ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TEST_STATUS_FAIL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TEST_STATUS_FAIL', 'Fail', 'ไม่ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TEST_STATUS_FAIL');

UPDATE su_message SET message_en = 'Blocked', message_local = 'ติดบล็อก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TEST_STATUS_BLOCKED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TEST_STATUS_BLOCKED', 'Blocked', 'ติดบล็อก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TEST_STATUS_BLOCKED');

UPDATE su_message SET message_en = 'Pending', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT02_TEST_STATUS_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT02_TEST_STATUS_PENDING', 'Pending', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT02_TEST_STATUS_PENDING');

UPDATE su_message SET message_en = 'Approval Center', message_local = 'ศูนย์การอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_PAGE_TITLE', 'Approval Center', 'ศูนย์การอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_PAGE_TITLE');

UPDATE su_message SET message_en = 'Manage approval workflows and pending requests', message_local = 'จัดการสายการอนุมัติและรายการรออนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_SUBTITLE', 'Manage approval workflows and pending requests', 'จัดการสายการอนุมัติและรายการรออนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_SUBTITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Pending My Approval', message_local = 'รอฉันอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_MY_PENDING_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_MY_PENDING_TITLE', 'Pending My Approval', 'รอฉันอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_MY_PENDING_TITLE');

UPDATE su_message SET message_en = 'Overdue Approvals', message_local = 'รายการเกินกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_OVERDUE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_OVERDUE_TITLE', 'Overdue Approvals', 'รายการเกินกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_OVERDUE_TITLE');

UPDATE su_message SET message_en = 'All Statuses', message_local = 'ทุกสถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_ALL_STATUS_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_ALL_STATUS_PLACEHOLDER', 'All Statuses', 'ทุกสถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_ALL_STATUS_PLACEHOLDER');

UPDATE su_message SET message_en = 'Select Project', message_local = 'เลือกโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_SELECT_PROJECT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_SELECT_PROJECT_PLACEHOLDER', 'Select Project', 'เลือกโครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_SELECT_PROJECT_PLACEHOLDER');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_PROJECT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_PROJECT_LABEL', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_PROJECT_LABEL');

UPDATE su_message SET message_en = 'Document Type / Code', message_local = 'ประเภท / รหัสเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_TYPE_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_TYPE_CODE', 'Document Type / Code', 'ประเภท / รหัสเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_TYPE_CODE');

UPDATE su_message SET message_en = 'Title', message_local = 'หัวข้อ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_TITLE', 'Title', 'หัวข้อ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_TITLE');

UPDATE su_message SET message_en = 'Requester', message_local = 'ผู้ยื่นคำขอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_REQUESTER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_REQUESTER', 'Requester', 'ผู้ยื่นคำขอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_REQUESTER');

UPDATE su_message SET message_en = 'Current Step', message_local = 'ขั้นตอนปัจจุบัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_CURRENT_STEP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_CURRENT_STEP', 'Current Step', 'ขั้นตอนปัจจุบัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_CURRENT_STEP');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_STATUS');

UPDATE su_message SET message_en = 'Submitted Date', message_local = 'วันที่ยื่นขอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_SUBMITTED_DATE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_SUBMITTED_DATE', 'Submitted Date', 'วันที่ยื่นขอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_SUBMITTED_DATE');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_ACTIONS');

UPDATE su_message SET message_en = 'Pending', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_PENDING', 'Pending', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_PENDING');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_APPROVED');

UPDATE su_message SET message_en = 'Rejected', message_local = 'ปฏิเสธ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_REJECTED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_REJECTED', 'Rejected', 'ปฏิเสธ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_REJECTED');

UPDATE su_message SET message_en = 'Need Revision', message_local = 'ต้องแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_NEED_REVISION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_NEED_REVISION', 'Need Revision', 'ต้องแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_NEED_REVISION');

UPDATE su_message SET message_en = 'Cancelled', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_CANCELLED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_CANCELLED', 'Cancelled', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_CANCELLED');

UPDATE su_message SET message_en = 'Export Failed', message_local = 'ส่งออกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_EXPORT_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_EXPORT_FAILED_TITLE', 'Export Failed', 'ส่งออกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_EXPORT_FAILED_TITLE');

UPDATE su_message SET message_en = 'Unable to export approval history', message_local = 'ไม่สามารถส่งออกประวัติการอนุมัติได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_EXPORT_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_EXPORT_FAILED_MSG', 'Unable to export approval history', 'ไม่สามารถส่งออกประวัติการอนุมัติได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_EXPORT_FAILED_MSG');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_BACK_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_BACK_BTN', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_BACK_BTN');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_ITEMS_UNIT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_ITEMS_UNIT', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_ITEMS_UNIT');

UPDATE su_message SET message_en = 'Export CSV', message_local = 'ส่งออก CSV', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_EXPORT_CSV_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_EXPORT_CSV_TITLE', 'Export CSV', 'ส่งออก CSV', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_EXPORT_CSV_TITLE');

UPDATE su_message SET message_en = 'Export to CSV', message_local = 'ส่งออกไฟล์ CSV', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_EXPORT_CSV_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_EXPORT_CSV_BTN', 'Export to CSV', 'ส่งออกไฟล์ CSV', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_EXPORT_CSV_BTN');

UPDATE su_message SET message_en = 'Pending Approvals', message_local = 'รายการรออนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_TAB_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_TAB_PENDING', 'Pending Approvals', 'รายการรออนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_TAB_PENDING');

UPDATE su_message SET message_en = 'Approval History', message_local = 'ประวัติการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_TAB_HISTORY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_TAB_HISTORY', 'Approval History', 'ประวัติการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_TAB_HISTORY');

UPDATE su_message SET message_en = 'My Submissions', message_local = 'รายการที่ฉันยื่นขอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_TAB_MY_REQUESTS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_TAB_MY_REQUESTS', 'My Submissions', 'รายการที่ฉันยื่นขอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_TAB_MY_REQUESTS');

UPDATE su_message SET message_en = 'Overdue', message_local = 'เกินกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_OVERDUE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_OVERDUE_LABEL', 'Overdue', 'เกินกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_OVERDUE_LABEL');

UPDATE su_message SET message_en = 'Due Soon', message_local = 'ใกล้ถึงกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_DUE_SOON_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_DUE_SOON_LABEL', 'Due Soon', 'ใกล้ถึงกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_DUE_SOON_LABEL');

UPDATE su_message SET message_en = 'Due:', message_local = 'ครบกำหนด:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_DUE_DATE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_DUE_DATE_PREFIX', 'Due:', 'ครบกำหนด:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_DUE_DATE_PREFIX');

UPDATE su_message SET message_en = 'Selected:', message_local = 'เลือกแล้ว:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_SELECTED_COUNT_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_SELECTED_COUNT_PREFIX', 'Selected:', 'เลือกแล้ว:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_SELECTED_COUNT_PREFIX');

UPDATE su_message SET message_en = 'Approve Selected', message_local = 'อนุมัติรายการที่เลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_APPROVE_ALL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_APPROVE_ALL_BTN', 'Approve Selected', 'อนุมัติรายการที่เลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_APPROVE_ALL_BTN');

UPDATE su_message SET message_en = 'Reject Selected', message_local = 'ปฏิเสธรายการที่เลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_REJECT_ALL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_REJECT_ALL_BTN', 'Reject Selected', 'ปฏิเสธรายการที่เลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_REJECT_ALL_BTN');

UPDATE su_message SET message_en = 'Clear Selection', message_local = 'ยกเลิกการเลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CLEAR_SELECTION_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CLEAR_SELECTION_BTN', 'Clear Selection', 'ยกเลิกการเลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CLEAR_SELECTION_BTN');

UPDATE su_message SET message_en = 'Need Revision', message_local = 'ต้องแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_NEED_REVISION_OPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_NEED_REVISION_OPT', 'Need Revision', 'ต้องแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_NEED_REVISION_OPT');

UPDATE su_message SET message_en = 'CRM Project', message_local = 'โครงการ CRM', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_PROJECT_CRM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_PROJECT_CRM', 'CRM Project', 'โครงการ CRM', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_PROJECT_CRM');

UPDATE su_message SET message_en = 'HR Project', message_local = 'โครงการ HR', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_PROJECT_HR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_PROJECT_HR', 'HR Project', 'โครงการ HR', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_PROJECT_HR');

UPDATE su_message SET message_en = 'Export Failed', message_local = 'ส่งออกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_EXPORT_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_EXPORT_FAIL_TITLE', 'Export Failed', 'ส่งออกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_EXPORT_FAIL_TITLE');

UPDATE su_message SET message_en = 'Document Type', message_local = 'ประเภทเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_TYPE', 'Document Type', 'ประเภทเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_TYPE');

UPDATE su_message SET message_en = 'Document Code', message_local = 'รหัสเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_DOC_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_DOC_CODE', 'Document Code', 'รหัสเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_DOC_CODE');

UPDATE su_message SET message_en = 'Title / Subject', message_local = 'หัวข้อ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_ITEM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_ITEM', 'Title / Subject', 'หัวข้อ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_ITEM');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_PROJECT', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_PROJECT');

UPDATE su_message SET message_en = 'Requester', message_local = 'ผู้ยื่นขอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_REQUESTER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_REQUESTER', 'Requester', 'ผู้ยื่นขอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_REQUESTER');

UPDATE su_message SET message_en = 'Requested Date', message_local = 'วันที่ยื่นขอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_REQUESTED_DATE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_REQUESTED_DATE', 'Requested Date', 'วันที่ยื่นขอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_REQUESTED_DATE');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_CSV_HEADER_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_CSV_HEADER_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_CSV_HEADER_STATUS');

UPDATE su_message SET message_en = 'Partially Approved', message_local = 'อนุมัติบางส่วน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_PARTIALLY_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_PARTIALLY_APPROVED', 'Partially Approved', 'อนุมัติบางส่วน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_PARTIALLY_APPROVED');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_APPROVED_FULL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_APPROVED_FULL', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_APPROVED_FULL');

UPDATE su_message SET message_en = 'Rejected', message_local = 'ปฏิเสธ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_REJECTED_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_REJECTED_SHORT', 'Rejected', 'ปฏิเสธ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_REJECTED_SHORT');

UPDATE su_message SET message_en = 'Expired', message_local = 'หมดอายุ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_STATUS_EXPIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_STATUS_EXPIRED', 'Expired', 'หมดอายุ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_STATUS_EXPIRED');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_PROJECT', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_PROJECT');

UPDATE su_message SET message_en = 'Requested Date', message_local = 'วันที่ยื่นขอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_REQUESTED_DATE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_REQUESTED_DATE', 'Requested Date', 'วันที่ยื่นขอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_REQUESTED_DATE');

UPDATE su_message SET message_en = 'Title / Subject', message_local = 'หัวข้อ / รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_COL_ITEM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_COL_ITEM', 'Title / Subject', 'หัวข้อ / รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_COL_ITEM');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_BACK_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_BACK_TITLE', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_BACK_TITLE');

UPDATE su_message SET message_en = 'Approval Details', message_local = 'รายละเอียดการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT03_DETAIL_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT03_DETAIL_PAGE_TITLE', 'Approval Details', 'รายละเอียดการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT03_DETAIL_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_ITEMS_UNIT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_ITEMS_UNIT', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_ITEMS_UNIT');

UPDATE su_message SET message_en = 'Add Requirement', message_local = 'เพิ่ม Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_ADD_REQUIREMENT_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_ADD_REQUIREMENT_BTN', 'Add Requirement', 'เพิ่ม Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_ADD_REQUIREMENT_BTN');

UPDATE su_message SET message_en = 'Requirement Name', message_local = 'ชื่อ Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_NAME';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_NAME', 'Requirement Name', 'ชื่อ Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_NAME');

UPDATE su_message SET message_en = 'Version', message_local = 'เวอร์ชัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_VERSION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_VERSION', 'Version', 'เวอร์ชัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_VERSION');

UPDATE su_message SET message_en = 'Requirements', message_local = 'รายการความต้องการ (Requirement)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PAGE_TITLE', 'Requirements', 'รายการความต้องการ (Requirement)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Draft', message_local = 'ฉบับร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_STATUS_DRAFT', 'Draft', 'ฉบับร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_STATUS_DRAFT');

UPDATE su_message SET message_en = 'In Review', message_local = 'อยู่ระหว่างตรวจสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_STATUS_IN_REVIEW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_STATUS_IN_REVIEW', 'In Review', 'อยู่ระหว่างตรวจสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_STATUS_IN_REVIEW');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_STATUS_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_STATUS_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_STATUS_APPROVED');

UPDATE su_message SET message_en = 'Changed', message_local = 'เปลี่ยนแปลงแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_STATUS_CHANGED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_STATUS_CHANGED', 'Changed', 'เปลี่ยนแปลงแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_STATUS_CHANGED');

UPDATE su_message SET message_en = 'Cancelled', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_STATUS_CANCELLED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_STATUS_CANCELLED', 'Cancelled', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_STATUS_CANCELLED');

UPDATE su_message SET message_en = 'Req Code', message_local = 'รหัส Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_CODE', 'Req Code', 'รหัส Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_CODE');

UPDATE su_message SET message_en = 'Title / Description', message_local = 'หัวข้อ / รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_TITLE', 'Title / Description', 'หัวข้อ / รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_TITLE');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_PROJECT', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_PROJECT');

UPDATE su_message SET message_en = 'Type', message_local = 'ประเภท', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_TYPE', 'Type', 'ประเภท', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_TYPE');

UPDATE su_message SET message_en = 'Priority', message_local = 'ความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_PRIORITY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_PRIORITY', 'Priority', 'ความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_PRIORITY');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_COL_ACTIONS');

UPDATE su_message SET message_en = 'General Information', message_local = 'ข้อมูลทั่วไป', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_GENERAL_INFO_SECTION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_GENERAL_INFO_SECTION', 'General Information', 'ข้อมูลทั่วไป', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_GENERAL_INFO_SECTION');

UPDATE su_message SET message_en = 'Requirement Details', message_local = 'รายละเอียดความต้องการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DETAIL_SECTION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DETAIL_SECTION', 'Requirement Details', 'รายละเอียดความต้องการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DETAIL_SECTION');

UPDATE su_message SET message_en = 'Requirement Code', message_local = 'รหัส Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CODE_LABEL', 'Requirement Code', 'รหัส Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. REQ-001', message_local = 'เช่น REQ-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CODE_PLACEHOLDER', 'e.g. REQ-001', 'เช่น REQ-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Requirement Title', message_local = 'ชื่อความต้องการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_TITLE_LABEL', 'Requirement Title', 'ชื่อความต้องการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_TITLE_LABEL');

UPDATE su_message SET message_en = 'Enter requirement title', message_local = 'ระบุชื่อความต้องการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_TITLE_PLACEHOLDER', 'Enter requirement title', 'ระบุชื่อความต้องการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Description', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DESC_LABEL', 'Description', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DESC_LABEL');

UPDATE su_message SET message_en = 'Enter requirement details...', message_local = 'กรอกรายละเอียดความต้องการ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DESC_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DESC_PLACEHOLDER', 'Enter requirement details...', 'กรอกรายละเอียดความต้องการ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DESC_PLACEHOLDER');

UPDATE su_message SET message_en = 'Customer', message_local = 'ลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CUSTOMER_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CUSTOMER_LABEL', 'Customer', 'ลูกค้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CUSTOMER_LABEL');

UPDATE su_message SET message_en = 'Select customer', message_local = 'เลือกลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CUSTOMER_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CUSTOMER_PLACEHOLDER', 'Select customer', 'เลือกลูกค้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CUSTOMER_PLACEHOLDER');

UPDATE su_message SET message_en = 'Autosaving...', message_local = 'กำลังบันทึกอัตโนมัติ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTOSAVING_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTOSAVING_MSG', 'Autosaving...', 'กำลังบันทึกอัตโนมัติ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTOSAVING_MSG');

UPDATE su_message SET message_en = 'Requirement details are required', message_local = 'กรุณากรอกรายละเอียดความต้องการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DESC_REQUIRED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DESC_REQUIRED_MSG', 'Requirement details are required', 'กรุณากรอกรายละเอียดความต้องการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DESC_REQUIRED_MSG');

UPDATE su_message SET message_en = 'Submitted Requirement for approval', message_local = 'ส่งขออนุมัติ Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SUBMIT_APPROVAL_COMMENT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SUBMIT_APPROVAL_COMMENT', 'Submitted Requirement for approval', 'ส่งขออนุมัติ Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SUBMIT_APPROVAL_COMMENT');

UPDATE su_message SET message_en = 'Submit Requirement for approval upon saving', message_local = 'ส่งขออนุมัติ Requirement อัตโนมัติขณะบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTO_SUBMIT_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTO_SUBMIT_APPROVAL', 'Submit Requirement for approval upon saving', 'ส่งขออนุมัติ Requirement อัตโนมัติขณะบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTO_SUBMIT_APPROVAL');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_BACK_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_BACK_BTN', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_BACK_BTN');

UPDATE su_message SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CANCEL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CANCEL_BTN');

UPDATE su_message SET message_en = 'Print Failed', message_local = 'พิมพ์เอกสารไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PRINT_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PRINT_FAIL_TITLE', 'Print Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PRINT_FAIL_TITLE');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Deleted Successfully', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DELETE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DELETE_SUCCESS_TITLE', 'Deleted Successfully', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DELETE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DELETE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DELETE_FAIL_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DELETE_FAIL_TITLE');

UPDATE su_message SET message_en = 'General Information', message_local = 'ข้อมูลทั่วไป', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_GENERAL_INFO_HEADING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_GENERAL_INFO_HEADING', 'General Information', 'ข้อมูลทั่วไป', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_GENERAL_INFO_HEADING');

UPDATE su_message SET message_en = 'Requirement Type', message_local = 'ประเภท Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_TYPE_LABEL', 'Requirement Type', 'ประเภท Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_TYPE_LABEL');

UPDATE su_message SET message_en = 'Priority', message_local = 'ความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PRIORITY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PRIORITY_LABEL', 'Priority', 'ความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PRIORITY_LABEL');

UPDATE su_message SET message_en = 'Description', message_local = 'รายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DESCRIPTION_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DESCRIPTION_LABEL', 'Description', 'รายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DESCRIPTION_LABEL');

UPDATE su_message SET message_en = 'Acceptance Criteria', message_local = 'เกณฑ์การตรวจรับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_ACCEPTANCE_CRITERIA_HEADING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_ACCEPTANCE_CRITERIA_HEADING', 'Acceptance Criteria', 'เกณฑ์การตรวจรับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_ACCEPTANCE_CRITERIA_HEADING');

UPDATE su_message SET message_en = 'Preview document before saving', message_local = 'ดูตัวอย่างเอกสารก่อนบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PREVIEW_FOOTER_NOTE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PREVIEW_FOOTER_NOTE', 'Preview document before saving', 'ดูตัวอย่างเอกสารก่อนบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PREVIEW_FOOTER_NOTE');

UPDATE su_message SET message_en = 'Created:', message_local = 'สร้างเมื่อ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CREATED_AT_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CREATED_AT_PREFIX', 'Created:', 'สร้างเมื่อ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CREATED_AT_PREFIX');

UPDATE su_message SET message_en = 'Must Have', message_local = 'จำเป็นต้องมี (Must Have)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PRIORITY_MUST';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PRIORITY_MUST', 'Must Have', 'จำเป็นต้องมี (Must Have)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PRIORITY_MUST');

UPDATE su_message SET message_en = 'Should Have', message_local = 'ควรจะมี (Should Have)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PRIORITY_SHOULD';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PRIORITY_SHOULD', 'Should Have', 'ควรจะมี (Should Have)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PRIORITY_SHOULD');

UPDATE su_message SET message_en = 'Could Have', message_local = 'ถ้ามีก็ดี (Could Have)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PRIORITY_COULD';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PRIORITY_COULD', 'Could Have', 'ถ้ามีก็ดี (Could Have)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PRIORITY_COULD');

UPDATE su_message SET message_en = 'Won''t Have (This Time)', message_local = 'ยังไม่มีในรอบนี้ (Won''t Have)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PRIORITY_WONT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PRIORITY_WONT', 'Won''t Have (This Time)', 'ยังไม่มีในรอบนี้ (Won''t Have)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PRIORITY_WONT');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_BACK_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_BACK_TITLE', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_BACK_TITLE');

UPDATE su_message SET message_en = 'Requirement Details', message_local = 'รายละเอียด Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_VIEW_REQ_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_VIEW_REQ_TITLE', 'Requirement Details', 'รายละเอียด Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_VIEW_REQ_TITLE');

UPDATE su_message SET message_en = 'Code:', message_local = 'รหัส:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_CODE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_CODE_PREFIX', 'Code:', 'รหัส:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_CODE_PREFIX');

UPDATE su_message SET message_en = 'Edit Mode', message_local = 'โหมดแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_EDIT_MODE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_EDIT_MODE_TITLE', 'Edit Mode', 'โหมดแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_EDIT_MODE_TITLE');

UPDATE su_message SET message_en = 'Split View', message_local = 'แบ่งหน้าจอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SPLIT_SCREEN_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SPLIT_SCREEN_TITLE', 'Split View', 'แบ่งหน้าจอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SPLIT_SCREEN_TITLE');

UPDATE su_message SET message_en = 'Preview Mode', message_local = 'โหมดดูตัวอย่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PREVIEW_MODE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PREVIEW_MODE_TITLE', 'Preview Mode', 'โหมดดูตัวอย่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PREVIEW_MODE_TITLE');

UPDATE su_message SET message_en = 'Requirement Code', message_local = 'รหัส Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_REQ_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_REQ_CODE_LABEL', 'Requirement Code', 'รหัส Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_REQ_CODE_LABEL');

UPDATE su_message SET message_en = 'Requirement Title', message_local = 'ชื่อ Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_REQ_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_REQ_NAME_LABEL', 'Requirement Title', 'ชื่อ Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_REQ_NAME_LABEL');

UPDATE su_message SET message_en = 'Enter requirement name', message_local = 'ระบุชื่อ Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_REQ_NAME_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_REQ_NAME_PLACEHOLDER', 'Enter requirement name', 'ระบุชื่อ Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_REQ_NAME_PLACEHOLDER');

UPDATE su_message SET message_en = 'Requirement Type', message_local = 'ประเภท Requirement', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_REQ_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_REQ_TYPE_LABEL', 'Requirement Type', 'ประเภท Requirement', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_REQ_TYPE_LABEL');

UPDATE su_message SET message_en = 'Rich text editor enabled', message_local = 'รองรับการจัดรูปแบบข้อความ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_RICH_TEXT_HINT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_RICH_TEXT_HINT', 'Rich text editor enabled', 'รองรับการจัดรูปแบบข้อความ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_RICH_TEXT_HINT');

UPDATE su_message SET message_en = 'Enter detailed requirement description...', message_local = 'ระบุรายละเอียดความต้องการ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DESCRIPTION_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DESCRIPTION_PLACEHOLDER', 'Enter detailed requirement description...', 'ระบุรายละเอียดความต้องการ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DESCRIPTION_PLACEHOLDER');

UPDATE su_message SET message_en = 'Description is required', message_local = 'กรุณากรอกรายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DESCRIPTION_REQUIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DESCRIPTION_REQUIRED', 'Description is required', 'กรุณากรอกรายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DESCRIPTION_REQUIRED');

UPDATE su_message SET message_en = 'Attachments', message_local = 'ไฟล์แนบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_ATTACHMENTS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_ATTACHMENTS_LABEL', 'Attachments', 'ไฟล์แนบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_ATTACHMENTS_LABEL');

UPDATE su_message SET message_en = 'Drag and drop files here or click to upload', message_local = 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_UPLOAD_HELPER_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_UPLOAD_HELPER_TEXT', 'Drag and drop files here or click to upload', 'ลากไฟล์มาวางที่นี่ หรือคลิกเพื่ออัปโหลด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_UPLOAD_HELPER_TEXT');

UPDATE su_message SET message_en = 'Approval Workflow', message_local = 'กระบวนการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_APPROVAL_HEADING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_APPROVAL_HEADING', 'Approval Workflow', 'กระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_APPROVAL_HEADING');

UPDATE su_message SET message_en = 'Approval Flow', message_local = 'สายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_APPROVAL_FLOW_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_APPROVAL_FLOW_LABEL', 'Approval Flow', 'สายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_APPROVAL_FLOW_LABEL');

UPDATE su_message SET message_en = 'Select approval flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SELECT_APPROVAL_FLOW_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SELECT_APPROVAL_FLOW_PLACEHOLDER', 'Select approval flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SELECT_APPROVAL_FLOW_PLACEHOLDER');

UPDATE su_message SET message_en = 'Customer Request', message_local = 'ลูกค้าแจ้งความต้องการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SOURCE_CUSTOMER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SOURCE_CUSTOMER', 'Customer Request', 'ลูกค้าแจ้งความต้องการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SOURCE_CUSTOMER');

UPDATE su_message SET message_en = 'Document / Contract', message_local = 'เอกสาร / สัญญา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SOURCE_DOCUMENT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SOURCE_DOCUMENT', 'Document / Contract', 'เอกสาร / สัญญา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SOURCE_DOCUMENT');

UPDATE su_message SET message_en = 'Meeting Discussion', message_local = 'การประชุมสรุปงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SOURCE_MEETING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SOURCE_MEETING', 'Meeting Discussion', 'การประชุมสรุปงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SOURCE_MEETING');

UPDATE su_message SET message_en = 'Saving changes...', message_local = 'กำลังบันทึก...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTOSAVE_SAVING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTOSAVE_SAVING', 'Saving changes...', 'กำลังบันทึก...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTOSAVE_SAVING');

UPDATE su_message SET message_en = 'All changes saved', message_local = 'บันทึกข้อมูลเรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTOSAVE_SAVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTOSAVE_SAVED', 'All changes saved', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTOSAVE_SAVED');

UPDATE su_message SET message_en = 'Unsaved changes', message_local = 'มีข้อมูลที่ยังไม่ได้บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTOSAVE_DIRTY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTOSAVE_DIRTY', 'Unsaved changes', 'มีข้อมูลที่ยังไม่ได้บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTOSAVE_DIRTY');

UPDATE su_message SET message_en = 'Idle', message_local = 'พร้อมใช้งาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTOSAVE_IDLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTOSAVE_IDLE', 'Idle', 'พร้อมใช้งาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTOSAVE_IDLE');

UPDATE su_message SET message_en = 'seconds ago', message_local = 'วินาทีที่แล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SECONDS_AGO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SECONDS_AGO', 'seconds ago', 'วินาทีที่แล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SECONDS_AGO');

UPDATE su_message SET message_en = 'minutes ago', message_local = 'นาทีที่แล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_MINUTES_AGO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_MINUTES_AGO', 'minutes ago', 'นาทีที่แล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_MINUTES_AGO');

UPDATE su_message SET message_en = 'Please enter a description', message_local = 'กรุณากรอกรายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_PLEASE_ENTER_DESCRIPTION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_PLEASE_ENTER_DESCRIPTION', 'Please enter a description', 'กรุณากรอกรายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_PLEASE_ENTER_DESCRIPTION');

UPDATE su_message SET message_en = 'System User', message_local = 'ผู้ใช้งานระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_DEFAULT_USER_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_DEFAULT_USER_LABEL', 'System User', 'ผู้ใช้งานระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_DEFAULT_USER_LABEL');

UPDATE su_message SET message_en = 'Loading...', message_local = 'กำลังโหลด...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_LOADING_ELLIPSIS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_LOADING_ELLIPSIS', 'Loading...', 'กำลังโหลด...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_LOADING_ELLIPSIS');

UPDATE su_message SET message_en = 'Submitted Successfully', message_local = 'ส่งขออนุมัติสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SUBMIT_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SUBMIT_SUCCESS_TITLE', 'Submitted Successfully', 'ส่งขออนุมัติสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SUBMIT_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Submit Failed', message_local = 'ส่งขออนุมัติไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SUBMIT_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SUBMIT_FAIL_TITLE', 'Submit Failed', 'ส่งขออนุมัติไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SUBMIT_FAIL_TITLE');

UPDATE su_message SET message_en = 'Auto submitted for approval on save', message_local = 'ส่งขออนุมัติอัตโนมัติเมื่อบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_AUTO_SUBMIT_APPROVAL_COMMENT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_AUTO_SUBMIT_APPROVAL_COMMENT', 'Auto submitted for approval on save', 'ส่งขออนุมัติอัตโนมัติเมื่อบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_AUTO_SUBMIT_APPROVAL_COMMENT');

UPDATE su_message SET message_en = 'Saved Successfully', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SAVE_SUCCESS_TITLE', 'Saved Successfully', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT04_SAVE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT04_SAVE_FAIL_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT04_SAVE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Architecture & Diagrams', message_local = 'แผนภาพสถาปัตยกรรม (Diagram)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PAGE_TITLE', 'Architecture & Diagrams', 'แผนภาพสถาปัตยกรรม (Diagram)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Diagram Code', message_local = 'รหัส Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_CODE', 'Diagram Code', 'รหัส Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_CODE');

UPDATE su_message SET message_en = 'Diagram Name', message_local = 'ชื่อ Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_NAME';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_NAME', 'Diagram Name', 'ชื่อ Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_NAME');

UPDATE su_message SET message_en = 'Type', message_local = 'ประเภท', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_TYPE', 'Type', 'ประเภท', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_TYPE');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_PROJECT', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_PROJECT');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COL_ACTIONS');

UPDATE su_message SET message_en = 'Data Flow Diagram (DFD)', message_local = 'Data Flow Diagram (DFD)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_TYPE_DFD';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_TYPE_DFD', 'Data Flow Diagram (DFD)', 'Data Flow Diagram (DFD)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_TYPE_DFD');

UPDATE su_message SET message_en = 'Entity Relationship (ER)', message_local = 'Entity Relationship (ER)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_TYPE_ER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_TYPE_ER', 'Entity Relationship (ER)', 'Entity Relationship (ER)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_TYPE_ER');

UPDATE su_message SET message_en = 'Flowchart / Sequence', message_local = 'ผังงาน (Flowchart)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_TYPE_FLOWCHART';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_TYPE_FLOWCHART', 'Flowchart / Sequence', 'ผังงาน (Flowchart)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_TYPE_FLOWCHART');

UPDATE su_message SET message_en = 'Draft', message_local = 'ฉบับร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_STATUS_DRAFT', 'Draft', 'ฉบับร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_STATUS_DRAFT');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_STATUS_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_STATUS_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_STATUS_APPROVED');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_BACK_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_BACK_BTN', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_BACK_BTN');

UPDATE su_message SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CANCEL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CANCEL_BTN');

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

UPDATE su_message SET message_en = 'Select Approval Flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_APPROVAL_FLOW_LABEL', 'Select Approval Flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_LABEL');

UPDATE su_message SET message_en = 'Select approval flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_APPROVAL_FLOW_PLACEHOLDER', 'Select approval flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_APPROVAL_FLOW_PLACEHOLDER');

UPDATE su_message SET message_en = 'Submit for approval automatically upon saving', message_local = 'ส่งขออนุมัติอัตโนมัติเมื่อบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SUBMIT_ON_SAVE_HINT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SUBMIT_ON_SAVE_HINT', 'Submit for approval automatically upon saving', 'ส่งขออนุมัติอัตโนมัติเมื่อบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SUBMIT_ON_SAVE_HINT');

UPDATE su_message SET message_en = 'An error occurred', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_GENERIC_ERROR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_GENERIC_ERROR', 'An error occurred', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_GENERIC_ERROR');

UPDATE su_message SET message_en = 'Saved Successfully', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_SUCCESS_TITLE', 'Saved Successfully', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_FAIL_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Saved manually', message_local = 'บันทึกข้อมูลเรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVED_MANUALLY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVED_MANUALLY', 'Saved manually', 'บันทึกข้อมูลเรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVED_MANUALLY');

UPDATE su_message SET message_en = 'Save failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SAVE_FAILED_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SAVE_FAILED_STATUS', 'Save failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SAVE_FAILED_STATUS');

UPDATE su_message SET message_en = 'Back to AI Chat', message_local = 'กลับไปหน้าแชท AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_BACK_TO_CHAT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_BACK_TO_CHAT_TITLE', 'Back to AI Chat', 'กลับไปหน้าแชท AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_BACK_TO_CHAT_TITLE');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_BACK_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_BACK_LABEL', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_BACK_LABEL');

UPDATE su_message SET message_en = 'Chat History', message_local = 'ประวัติการสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CHAT_HISTORY_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CHAT_HISTORY_LABEL', 'Chat History', 'ประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CHAT_HISTORY_LABEL');

UPDATE su_message SET message_en = 'New Session', message_local = 'เริ่มเซสชันใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEW_SESSION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEW_SESSION_TITLE', 'New Session', 'เริ่มเซสชันใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEW_SESSION_TITLE');

UPDATE su_message SET message_en = 'New Chat', message_local = 'แชทใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NEW_CHAT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NEW_CHAT_LABEL', 'New Chat', 'แชทใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NEW_CHAT_LABEL');

UPDATE su_message SET message_en = 'Start New Chat', message_local = 'เริ่มการสนทนาใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_CREATE_NEW_CHAT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_CREATE_NEW_CHAT_LABEL', 'Start New Chat', 'เริ่มการสนทนาใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_CREATE_NEW_CHAT_LABEL');

UPDATE su_message SET message_en = 'Priority', message_local = 'ความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIORITY_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIORITY_FIELD_LABEL', 'Priority', 'ความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIORITY_FIELD_LABEL');

UPDATE su_message SET message_en = 'Select priority', message_local = 'เลือกระดับความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIORITY_SELECT_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIORITY_SELECT_PH', 'Select priority', 'เลือกระดับความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIORITY_SELECT_PH');

UPDATE su_message SET message_en = 'Manual Code', message_local = 'รหัสคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_CODE_LABEL', 'Manual Code', 'รหัสคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_CODE_LABEL');

UPDATE su_message SET message_en = 'Manual Code', message_local = 'รหัสคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_CODE_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_CODE_FIELD_LABEL', 'Manual Code', 'รหัสคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_CODE_FIELD_LABEL');

UPDATE su_message SET message_en = 'Issue Details', message_local = 'รายละเอียดปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SECTION_ISSUE_DETAILS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SECTION_ISSUE_DETAILS', 'Issue Details', 'รายละเอียดปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SECTION_ISSUE_DETAILS');

UPDATE su_message SET message_en = 'Detailed Description', message_local = 'รายละเอียดปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_DESC_DETAIL_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_DESC_DETAIL_LABEL', 'Detailed Description', 'รายละเอียดปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_DESC_DETAIL_LABEL');

UPDATE su_message SET message_en = 'Description', message_local = 'รายละเอียดปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_FIELD_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_FIELD_DESC_LABEL', 'Description', 'รายละเอียดปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_FIELD_DESC_LABEL');

UPDATE su_message SET message_en = 'AI Diagram Assistant', message_local = 'ผู้ช่วยออกแบบ Diagram ด้วย AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_DIAGRAM_ASSISTANT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_DIAGRAM_ASSISTANT', 'AI Diagram Assistant', 'ผู้ช่วยออกแบบ Diagram ด้วย AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_DIAGRAM_ASSISTANT');

UPDATE su_message SET message_en = 'Generate ER, DFD, Architecture and Flowcharts using natural language', message_local = 'สร้าง ER Diagram, DFD, สถาปัตยกรรมระบบ และ Flowchart ด้วย AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_WELCOME_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_WELCOME_DESC', 'Generate ER, DFD, Architecture and Flowcharts using natural language', 'สร้าง ER Diagram, DFD, สถาปัตยกรรมระบบ และ Flowchart ด้วย AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_WELCOME_DESC');

UPDATE su_message SET message_en = 'Suggested Prompts', message_local = 'ตัวอย่างคำสั่ง Prompt', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SUGGESTED_PROMPTS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SUGGESTED_PROMPTS_LABEL', 'Suggested Prompts', 'ตัวอย่างคำสั่ง Prompt', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SUGGESTED_PROMPTS_LABEL');

UPDATE su_message SET message_en = 'Copied to clipboard', message_local = 'คัดลอกแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPIED_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPIED_LABEL', 'Copied to clipboard', 'คัดลอกแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPIED_LABEL');

UPDATE su_message SET message_en = 'Copy Mermaid Diagram Code', message_local = 'คัดลอกโค้ด Mermaid', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPY_MERMAID_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPY_MERMAID_TITLE', 'Copy Mermaid Diagram Code', 'คัดลอกโค้ด Mermaid', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPY_MERMAID_TITLE');

UPDATE su_message SET message_en = 'Copy Mermaid', message_local = 'คัดลอก Mermaid', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_COPY_MERMAID_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_COPY_MERMAID_LABEL', 'Copy Mermaid', 'คัดลอก Mermaid', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_COPY_MERMAID_LABEL');

UPDATE su_message SET message_en = 'Generate Database ER Diagram', message_local = 'สร้าง ER Diagram ฐานข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_ER_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_ER_TITLE', 'Generate Database ER Diagram', 'สร้าง ER Diagram ฐานข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_ER_TITLE');

UPDATE su_message SET message_en = 'Generate Business Process Flowchart', message_local = 'สร้าง Flowchart กระบวนการทำงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_FLOWCHART_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_FLOWCHART_TITLE', 'Generate Business Process Flowchart', 'สร้าง Flowchart กระบวนการทำงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_FLOWCHART_TITLE');

UPDATE su_message SET message_en = 'Generate System Sequence Diagram', message_local = 'สร้าง Sequence Diagram ระหว่างระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_SEQUENCE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_SEQUENCE_TITLE', 'Generate System Sequence Diagram', 'สร้าง Sequence Diagram ระหว่างระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_SEQUENCE_TITLE');

UPDATE su_message SET message_en = 'Analyze Architecture Impact', message_local = 'วิเคราะห์ผลกระทบเชิงสถาปัตยกรรม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_PROMPT_ANALYZE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_PROMPT_ANALYZE_TITLE', 'Analyze Architecture Impact', 'วิเคราะห์ผลกระทบเชิงสถาปัตยกรรม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_PROMPT_ANALYZE_TITLE');

UPDATE su_message SET message_en = 'Target ER Page', message_local = 'หน้า ER เป้าหมาย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_SELECT_ER_PAGE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_SELECT_ER_PAGE_LABEL', 'Target ER Page', 'หน้า ER เป้าหมาย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_SELECT_ER_PAGE_LABEL');

UPDATE su_message SET message_en = 'No ER page available', message_local = 'ไม่มีหน้า ER ให้เลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_ER_PAGE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_ER_PAGE_MSG', 'No ER page available', 'ไม่มีหน้า ER ให้เลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_ER_PAGE_MSG');

UPDATE su_message SET message_en = 'Database Engine', message_local = 'ระบบฐานข้อมูล (Database)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_DB_VENDOR_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_DB_VENDOR_LABEL', 'Database Engine', 'ระบบฐานข้อมูล (Database)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_DB_VENDOR_LABEL');

UPDATE su_message SET message_en = 'AI Engine Model', message_local = 'โมเดล AI', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AI_MODEL_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AI_MODEL_LABEL', 'AI Engine Model', 'โมเดล AI', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AI_MODEL_LABEL');

UPDATE su_message SET message_en = 'Auto Generate DB Migration', message_local = 'สร้าง DB Migration อัตโนมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_AUTO_MIGRATION_MODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_AUTO_MIGRATION_MODE', 'Auto Generate DB Migration', 'สร้าง DB Migration อัตโนมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_AUTO_MIGRATION_MODE');

UPDATE su_message SET message_en = 'Based on current diagram entities', message_local = 'อ้างอิงจาก Entity ใน Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MIGRATION_BASED_ON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MIGRATION_BASED_ON', 'Based on current diagram entities', 'อ้างอิงจาก Entity ใน Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MIGRATION_BASED_ON');

UPDATE su_message SET message_en = 'Automatically produce SQL DDL scripts for Flyway', message_local = 'สร้างไฟล์สคริปต์ SQL DDL สำหรับ Flyway โดยอัตโนมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_MIGRATION_MODE_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_MIGRATION_MODE_DESC', 'Automatically produce SQL DDL scripts for Flyway', 'สร้างไฟล์สคริปต์ SQL DDL สำหรับ Flyway โดยอัตโนมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_MIGRATION_MODE_DESC');

UPDATE su_message SET message_en = 'Loading history...', message_local = 'กำลังโหลดประวัติ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_LOADING_HISTORY_LOG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_LOADING_HISTORY_LOG', 'Loading history...', 'กำลังโหลดประวัติ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_LOADING_HISTORY_LOG');

UPDATE su_message SET message_en = 'No chat history found', message_local = 'ยังไม่มีประวัติการสนทนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_NO_HISTORY_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_NO_HISTORY_MSG', 'No chat history found', 'ยังไม่มีประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_NO_HISTORY_MSG');

UPDATE su_message SET message_en = 'Generate First Diagram', message_local = 'เริ่มต้นสร้าง Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT05_START_FIRST_GEN_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT05_START_FIRST_GEN_BTN', 'Generate First Diagram', 'เริ่มต้นสร้าง Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT05_START_FIRST_GEN_BTN');

UPDATE su_message SET message_en = 'Saving...', message_local = 'กำลังบันทึก...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVING_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_SAVING_LABEL', 'Saving...', 'กำลังบันทึก...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_SAVING_LABEL');

UPDATE su_message SET message_en = 'Save & Submit Approval', message_local = 'บันทึกและส่งขออนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVE_AND_SUBMIT_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_SAVE_AND_SUBMIT_BTN', 'Save & Submit Approval', 'บันทึกและส่งขออนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_SAVE_AND_SUBMIT_BTN');

UPDATE su_message SET message_en = 'Save Changes', message_local = 'บันทึกข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT06_SAVE_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_SAVE_BTN', 'Save Changes', 'บันทึกข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT06_SAVE_BTN');

UPDATE su_message SET message_en = 'Diagram Editor', message_local = 'ตัวแก้ไข Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_PAGE_TITLE', 'Diagram Editor', 'ตัวแก้ไข Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Draft', message_local = 'ฉบับร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_DRAFT', 'Draft', 'ฉบับร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_DRAFT');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_APPROVED');

UPDATE su_message SET message_en = 'Pending', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_PENDING', 'Pending', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_PENDING');

UPDATE su_message SET message_en = 'Diagram Code', message_local = 'รหัส Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_CODE_LABEL', 'Diagram Code', 'รหัส Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_CODE_LABEL');

UPDATE su_message SET message_en = 'Diagram Name', message_local = 'ชื่อ Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_NAME_LABEL', 'Diagram Name', 'ชื่อ Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_NAME_LABEL');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_BACK_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_BACK_BTN', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_BACK_BTN');

UPDATE su_message SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_CANCEL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_CANCEL_BTN');

UPDATE su_message SET message_en = 'Draft', message_local = 'ฉบับร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_PREVIEW_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_PREVIEW_STATUS_DRAFT', 'Draft', 'ฉบับร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_PREVIEW_STATUS_DRAFT');

UPDATE su_message SET message_en = 'Diagram Code', message_local = 'รหัส Diagram', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_CODE', 'Diagram Code', 'รหัส Diagram', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_CODE');

UPDATE su_message SET message_en = 'Title', message_local = 'ชื่อเรื่อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_TITLE', 'Title', 'ชื่อเรื่อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_TITLE');

UPDATE su_message SET message_en = 'Type', message_local = 'ประเภท', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_TYPE', 'Type', 'ประเภท', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_TYPE');

UPDATE su_message SET message_en = 'Version', message_local = 'เวอร์ชัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_VERSION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_VERSION', 'Version', 'เวอร์ชัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_VERSION');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_APPROVAL');

UPDATE su_message SET message_en = 'Manday', message_local = 'Manday', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_MANDAY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_MANDAY', 'Manday', 'Manday', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_MANDAY');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_COL_ACTIONS');

UPDATE su_message SET message_en = 'In Review', message_local = 'อยู่ระหว่างตรวจสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_REVIEW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_REVIEW', 'In Review', 'อยู่ระหว่างตรวจสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_REVIEW');

UPDATE su_message SET message_en = 'Released', message_local = 'เผยแพร่แล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_RELEASED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_RELEASED', 'Released', 'เผยแพร่แล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_RELEASED');

UPDATE su_message SET message_en = 'Changed', message_local = 'เปลี่ยนแปลงแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_CHANGED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_CHANGED', 'Changed', 'เปลี่ยนแปลงแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_CHANGED');

UPDATE su_message SET message_en = 'Print Failed', message_local = 'พิมพ์เอกสารไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_PRINT_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_PRINT_FAIL_TITLE', 'Print Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_PRINT_FAIL_TITLE');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Deleted Successfully', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_DELETE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_DELETE_SUCCESS_TITLE', 'Deleted Successfully', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_DELETE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_DELETE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_DELETE_FAIL_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_DELETE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Cancelled', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_STATUS_CANCELLED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_STATUS_CANCELLED', 'Cancelled', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_STATUS_CANCELLED');

UPDATE su_message SET message_en = 'Edit Mode', message_local = 'โหมดแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_EDIT_MODE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_EDIT_MODE_TITLE', 'Edit Mode', 'โหมดแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_EDIT_MODE_TITLE');

UPDATE su_message SET message_en = 'Split View', message_local = 'แบ่งหน้าจอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_SPLIT_MODE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_SPLIT_MODE_TITLE', 'Split View', 'แบ่งหน้าจอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_SPLIT_MODE_TITLE');

UPDATE su_message SET message_en = 'Preview Mode', message_local = 'โหมดดูตัวอย่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_PREVIEW_MODE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_PREVIEW_MODE_TITLE', 'Preview Mode', 'โหมดดูตัวอย่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_PREVIEW_MODE_TITLE');

UPDATE su_message SET message_en = 'Saving...', message_local = 'กำลังบันทึก...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_AUTOSAVE_SAVING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_AUTOSAVE_SAVING', 'Saving...', 'กำลังบันทึก...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_AUTOSAVE_SAVING');

UPDATE su_message SET message_en = 'Saved', message_local = 'บันทึกแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_AUTOSAVE_SAVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_AUTOSAVE_SAVED', 'Saved', 'บันทึกแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_AUTOSAVE_SAVED');

UPDATE su_message SET message_en = 'Unsaved', message_local = 'ยังไม่ได้บันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_AUTOSAVE_DIRTY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_AUTOSAVE_DIRTY', 'Unsaved', 'ยังไม่ได้บันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_AUTOSAVE_DIRTY');

UPDATE su_message SET message_en = 'Idle', message_local = 'พร้อมใช้งาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_AUTOSAVE_IDLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_AUTOSAVE_IDLE', 'Idle', 'พร้อมใช้งาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_AUTOSAVE_IDLE');

UPDATE su_message SET message_en = 'seconds ago', message_local = 'วินาทีที่แล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_SECONDS_AGO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_SECONDS_AGO', 'seconds ago', 'วินาทีที่แล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_SECONDS_AGO');

UPDATE su_message SET message_en = 'minutes ago', message_local = 'นาทีที่แล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_MINUTES_AGO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_MINUTES_AGO', 'minutes ago', 'นาทีที่แล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_MINUTES_AGO');

UPDATE su_message SET message_en = 'Saved Successfully', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_SAVE_SUCCESS_TITLE', 'Saved Successfully', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Unable to save diagram changes', message_local = 'ไม่สามารถบันทึกข้อมูล Diagram ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_SAVE_ERROR_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_SAVE_ERROR_MSG', 'Unable to save diagram changes', 'ไม่สามารถบันทึกข้อมูล Diagram ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_SAVE_ERROR_MSG');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT07_SAVE_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT07_SAVE_FAIL_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT07_SAVE_FAIL_TITLE');

UPDATE su_message SET message_en = 'Architecture Review', message_local = 'การตรวจทานสถาปัตยกรรม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT08A_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT08A_TITLE', 'Architecture Review', 'การตรวจทานสถาปัตยกรรม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT08A_TITLE');

UPDATE su_message SET message_en = 'Design Review', message_local = 'การตรวจแบบ (Design Review)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PAGE_TITLE', 'Design Review', 'การตรวจแบบ (Design Review)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Unspecified Creator', message_local = 'ไม่ระบุผู้สร้าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_UNSPECIFIED_CREATOR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_UNSPECIFIED_CREATOR', 'Unspecified Creator', 'ไม่ระบุผู้สร้าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_UNSPECIFIED_CREATOR');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Do you want to delete this design review item?', message_local = 'คุณต้องการลบรายการตรวจแบบนี้ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_CONFIRM_DELETE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_CONFIRM_DELETE_MSG', 'Do you want to delete this design review item?', 'คุณต้องการลบรายการตรวจแบบนี้ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_CONFIRM_DELETE_MSG');

UPDATE su_message SET message_en = 'Pending', message_local = 'รออนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPR_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPR_PENDING', 'Pending', 'รออนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPR_PENDING');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPR_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPR_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPR_APPROVED');

UPDATE su_message SET message_en = 'Rejected', message_local = 'ปฏิเสธ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPR_REJECTED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPR_REJECTED', 'Rejected', 'ปฏิเสธ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPR_REJECTED');

UPDATE su_message SET message_en = 'Need Revision', message_local = 'ต้องแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPR_NEED_REVISION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPR_NEED_REVISION', 'Need Revision', 'ต้องแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPR_NEED_REVISION');

UPDATE su_message SET message_en = 'Cancelled', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPR_CANCELLED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPR_CANCELLED', 'Cancelled', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPR_CANCELLED');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_BACK_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_BACK_BTN', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_BACK_BTN');

UPDATE su_message SET message_en = 'Cancel', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_CANCEL_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_CANCEL_BTN', 'Cancel', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_CANCEL_BTN');

UPDATE su_message SET message_en = 'Review Code', message_local = 'รหัสการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_CODE_LABEL', 'Review Code', 'รหัสการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. DR-001', message_local = 'เช่น DR-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_CODE_PLACEHOLDER', 'e.g. DR-001', 'เช่น DR-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PROJECT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PROJECT_LABEL', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PROJECT_LABEL');

UPDATE su_message SET message_en = 'Select project', message_local = 'เลือกโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PROJECT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PROJECT_PLACEHOLDER', 'Select project', 'เลือกโครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PROJECT_PLACEHOLDER');

UPDATE su_message SET message_en = 'Review Item Title', message_local = 'หัวข้อการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ITEM_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ITEM_TITLE_LABEL', 'Review Item Title', 'หัวข้อการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ITEM_TITLE_LABEL');

UPDATE su_message SET message_en = 'Enter item title', message_local = 'ระบุหัวข้อการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ITEM_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ITEM_TITLE_PLACEHOLDER', 'Enter item title', 'ระบุหัวข้อการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ITEM_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Review Type', message_local = 'ประเภทการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_TYPE_LABEL', 'Review Type', 'ประเภทการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_TYPE_LABEL');

UPDATE su_message SET message_en = 'Select review type', message_local = 'เลือกประเภทการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_TYPE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_TYPE_PLACEHOLDER', 'Select review type', 'เลือกประเภทการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_TYPE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Review Date', message_local = 'วันที่ตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_DATE_LABEL', 'Review Date', 'วันที่ตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_DATE_LABEL');

UPDATE su_message SET message_en = 'Select review date', message_local = 'เลือกวันที่ตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_DATE_PLACEHOLDER', 'Select review date', 'เลือกวันที่ตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Assignee for Resolution', message_local = 'ผู้รับผิดชอบแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ASSIGNEE_FIX_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ASSIGNEE_FIX_LABEL', 'Assignee for Resolution', 'ผู้รับผิดชอบแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ASSIGNEE_FIX_LABEL');

UPDATE su_message SET message_en = 'Select assignee', message_local = 'เลือกผู้รับผิดชอบแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ASSIGNEE_FIX_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ASSIGNEE_FIX_PLACEHOLDER', 'Select assignee', 'เลือกผู้รับผิดชอบแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ASSIGNEE_FIX_PLACEHOLDER');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PRIORITY_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRIORITY_LOW', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PRIORITY_LOW');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PRIORITY_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRIORITY_MEDIUM', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PRIORITY_MEDIUM');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PRIORITY_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRIORITY_HIGH', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PRIORITY_HIGH');

UPDATE su_message SET message_en = 'Critical', message_local = 'วิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_PRIORITY_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_PRIORITY_CRITICAL', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_PRIORITY_CRITICAL');

UPDATE su_message SET message_en = 'Low Severity', message_local = 'ความรุนแรงต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEVERITY_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEVERITY_LOW', 'Low Severity', 'ความรุนแรงต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEVERITY_LOW');

UPDATE su_message SET message_en = 'Medium Severity', message_local = 'ความรุนแรงปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEVERITY_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEVERITY_MEDIUM', 'Medium Severity', 'ความรุนแรงปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEVERITY_MEDIUM');

UPDATE su_message SET message_en = 'High Severity', message_local = 'ความรุนแรงสูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEVERITY_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEVERITY_HIGH', 'High Severity', 'ความรุนแรงสูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEVERITY_HIGH');

UPDATE su_message SET message_en = 'Critical Severity', message_local = 'ความรุนแรงวิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEVERITY_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEVERITY_CRITICAL', 'Critical Severity', 'ความรุนแรงวิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEVERITY_CRITICAL');

UPDATE su_message SET message_en = 'Please fill in all required fields completely.', message_local = 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_VALIDATION_ERROR_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_VALIDATION_ERROR_MSG', 'Please fill in all required fields completely.', 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_VALIDATION_ERROR_MSG');

UPDATE su_message SET message_en = 'Unknown Creator', message_local = 'ไม่ระบุผู้สร้าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_NO_CREATOR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_NO_CREATOR', 'Unknown Creator', 'ไม่ระบุผู้สร้าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_NO_CREATOR');

UPDATE su_message SET message_en = 'Reviewer:', message_local = 'ผู้ตรวจแบบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEWER_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEWER_PREFIX', 'Reviewer:', 'ผู้ตรวจแบบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEWER_PREFIX');

UPDATE su_message SET message_en = 'Design Review', message_local = 'ตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_TAG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_TAG', 'Design Review', 'ตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_TAG');

UPDATE su_message SET message_en = 'Deleted Successfully', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_DELETE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_DELETE_SUCCESS_TITLE', 'Deleted Successfully', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_DELETE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_DELETE_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_DELETE_ERROR_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_DELETE_ERROR_TITLE');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_BACK_BTN_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_BACK_BTN_TITLE', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_BACK_BTN_TITLE');

UPDATE su_message SET message_en = 'Edit Design Review', message_local = 'แก้ไขรายการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_EDIT_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_EDIT_PAGE_TITLE', 'Edit Design Review', 'แก้ไขรายการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_EDIT_PAGE_TITLE');

UPDATE su_message SET message_en = 'Review architecture, code quality, and specification conformance', message_local = 'ตรวจทานสถาปัตยกรรม คุณภาพโค้ด และความสอดคล้องกับข้อกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_FORM_PAGE_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_FORM_PAGE_DESC', 'Review architecture, code quality, and specification conformance', 'ตรวจทานสถาปัตยกรรม คุณภาพโค้ด และความสอดคล้องกับข้อกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_FORM_PAGE_DESC');

UPDATE su_message SET message_en = 'Review Code', message_local = 'รหัสการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_CODE_LABEL', 'Review Code', 'รหัสการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. DR-001', message_local = 'เช่น DR-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEW_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEW_CODE_PLACEHOLDER', 'e.g. DR-001', 'เช่น DR-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEW_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Review Title', message_local = 'หัวข้อการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_TITLE_LABEL', 'Review Title', 'หัวข้อการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_TITLE_LABEL');

UPDATE su_message SET message_en = 'Enter review title', message_local = 'ระบุหัวข้อการตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_TITLE_PLACEHOLDER', 'Enter review title', 'ระบุหัวข้อการตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Target Item / Document', message_local = 'เอกสาร/เป้าหมายที่ตรวจแบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEWABLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEWABLE_LABEL', 'Target Item / Document', 'เอกสาร/เป้าหมายที่ตรวจแบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEWABLE_LABEL');

UPDATE su_message SET message_en = 'Select target document', message_local = 'เลือกเอกสารเป้าหมาย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEWABLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEWABLE_PLACEHOLDER', 'Select target document', 'เลือกเอกสารเป้าหมาย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEWABLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Severity', message_local = 'ระดับความรุนแรง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEVERITY_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEVERITY_FIELD_LABEL', 'Severity', 'ระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEVERITY_FIELD_LABEL');

UPDATE su_message SET message_en = 'Select severity', message_local = 'เลือกระดับความรุนแรง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEV_SELECT_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEV_SELECT_PH', 'Select severity', 'เลือกระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEV_SELECT_PH');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_STATUS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_STATUS_LABEL', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_STATUS_LABEL');

UPDATE su_message SET message_en = 'Select status', message_local = 'เลือกสถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_STATUS_SELECT_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_STATUS_SELECT_PH', 'Select status', 'เลือกสถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_STATUS_SELECT_PH');

UPDATE su_message SET message_en = 'Resolution Due Date', message_local = 'วันที่กำหนดแก้ไขเสร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_DUE_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_DUE_DATE_LABEL', 'Resolution Due Date', 'วันที่กำหนดแก้ไขเสร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_DUE_DATE_LABEL');

UPDATE su_message SET message_en = 'Assigned Fixer', message_local = 'ผู้รับผิดชอบแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ASSIGNED_TO_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ASSIGNED_TO_LABEL', 'Assigned Fixer', 'ผู้รับผิดชอบแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ASSIGNED_TO_LABEL');

UPDATE su_message SET message_en = 'Select assignee', message_local = 'เลือกผู้รับผิดชอบแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ASSIGNED_TO_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ASSIGNED_TO_PH', 'Select assignee', 'เลือกผู้รับผิดชอบแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ASSIGNED_TO_PH');

UPDATE su_message SET message_en = 'Approval Flow', message_local = 'สายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPROVAL_FLOW_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPROVAL_FLOW_LABEL', 'Approval Flow', 'สายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPROVAL_FLOW_LABEL');

UPDATE su_message SET message_en = 'Select approval flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_APPROVAL_FLOW_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_APPROVAL_FLOW_PH', 'Select approval flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_APPROVAL_FLOW_PH');

UPDATE su_message SET message_en = 'Target Type', message_local = 'ประเภทเป้าหมาย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEWABLE_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEWABLE_TYPE_LABEL', 'Target Type', 'ประเภทเป้าหมาย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEWABLE_TYPE_LABEL');

UPDATE su_message SET message_en = 'Target ID', message_local = 'รหัสเป้าหมาย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REVIEWABLE_ID_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REVIEWABLE_ID_LABEL', 'Target ID', 'รหัสเป้าหมาย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REVIEWABLE_ID_LABEL');

UPDATE su_message SET message_en = 'Please fill in all required fields completely', message_local = 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_REQUIRED_FIELDS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_REQUIRED_FIELDS_MSG', 'Please fill in all required fields completely', 'กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_REQUIRED_FIELDS_MSG');

UPDATE su_message SET message_en = 'Please review and correct form inputs', message_local = 'กรุณาตรวจสอบข้อมูลในฟอร์มให้ถูกต้อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_FILL_FORM_CORRECTLY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_FILL_FORM_CORRECTLY', 'Please review and correct form inputs', 'กรุณาตรวจสอบข้อมูลในฟอร์มให้ถูกต้อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_FILL_FORM_CORRECTLY');

UPDATE su_message SET message_en = 'Form Invalid', message_local = 'ข้อมูลฟอร์มไม่ถูกต้อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_FORM_INVALID_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_FORM_INVALID_TITLE', 'Form Invalid', 'ข้อมูลฟอร์มไม่ถูกต้อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_FORM_INVALID_TITLE');

UPDATE su_message SET message_en = 'Low Severity', message_local = 'ความรุนแรงต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEV_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEV_LOW', 'Low Severity', 'ความรุนแรงต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEV_LOW');

UPDATE su_message SET message_en = 'Medium Severity', message_local = 'ความรุนแรงปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEV_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEV_MEDIUM', 'Medium Severity', 'ความรุนแรงปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEV_MEDIUM');

UPDATE su_message SET message_en = 'High Severity', message_local = 'ความรุนแรงสูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEV_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEV_HIGH', 'High Severity', 'ความรุนแรงสูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEV_HIGH');

UPDATE su_message SET message_en = 'Critical Severity', message_local = 'ความรุนแรงวิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_SEV_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_SEV_CRITICAL', 'Critical Severity', 'ความรุนแรงวิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_SEV_CRITICAL');

UPDATE su_message SET message_en = 'Open', message_local = 'เปิดรายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ST_OPEN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ST_OPEN', 'Open', 'เปิดรายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ST_OPEN');

UPDATE su_message SET message_en = 'In Progress', message_local = 'กำลังแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ST_INPROGRESS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ST_INPROGRESS', 'In Progress', 'กำลังแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ST_INPROGRESS');

UPDATE su_message SET message_en = 'Resolved', message_local = 'แก้ไขแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ST_RESOLVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ST_RESOLVED', 'Resolved', 'แก้ไขแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ST_RESOLVED');

UPDATE su_message SET message_en = 'Closed', message_local = 'ปิดรายการแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT09_ST_CLOSED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT09_ST_CLOSED', 'Closed', 'ปิดรายการแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT09_ST_CLOSED');

UPDATE su_message SET message_en = 'Task Tracking', message_local = 'ติดตามงาน (Task Tracking)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PAGE_TITLE', 'Task Tracking', 'ติดตามงาน (Task Tracking)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'All Tasks', message_local = 'งานทั้งหมด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_FILTER_ALL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_FILTER_ALL', 'All Tasks', 'งานทั้งหมด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_FILTER_ALL');

UPDATE su_message SET message_en = 'Please select a project before viewing the Task Board', message_local = 'กรุณาเลือกโปรเจกต์ก่อนดู Task Board', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SELECT_PROJECT_FIRST';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SELECT_PROJECT_FIRST', 'Please select a project before viewing the Task Board', 'กรุณาเลือกโปรเจกต์ก่อนดู Task Board', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SELECT_PROJECT_FIRST');

UPDATE su_message SET message_en = 'Critical', message_local = 'วิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIORITY_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIORITY_CRITICAL', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIORITY_CRITICAL');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIORITY_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIORITY_HIGH', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIORITY_HIGH');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIORITY_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIORITY_MEDIUM', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIORITY_MEDIUM');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIORITY_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIORITY_LOW', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIORITY_LOW');

UPDATE su_message SET message_en = 'Task Code', message_local = 'รหัส Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_CODE_LABEL', 'Task Code', 'รหัส Task', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. TSK-001', message_local = 'เช่น TSK-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_CODE_PLACEHOLDER', 'e.g. TSK-001', 'เช่น TSK-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Task Name', message_local = 'ชื่องาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_NAME_LABEL', 'Task Name', 'ชื่องาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_NAME_LABEL');

UPDATE su_message SET message_en = 'Enter task name', message_local = 'ระบุชื่องาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_NAME_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_NAME_PLACEHOLDER', 'Enter task name', 'ระบุชื่องาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_NAME_PLACEHOLDER');

UPDATE su_message SET message_en = 'Task Description', message_local = 'รายละเอียดงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_DESC_LABEL', 'Task Description', 'รายละเอียดงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_DESC_LABEL');

UPDATE su_message SET message_en = 'Enter detailed task description...', message_local = 'ระบุรายละเอียดงาน...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_DESC_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_DESC_PLACEHOLDER', 'Enter detailed task description...', 'ระบุรายละเอียดงาน...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_DESC_PLACEHOLDER');

UPDATE su_message SET message_en = 'Linked Specification', message_local = 'ผูกโยงกับ Specification', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SPEC_LINK_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SPEC_LINK_LABEL', 'Linked Specification', 'ผูกโยงกับ Specification', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SPEC_LINK_LABEL');

UPDATE su_message SET message_en = 'Select specification', message_local = 'เลือก Specification', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SPEC_LINK_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SPEC_LINK_PLACEHOLDER', 'Select specification', 'เลือก Specification', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SPEC_LINK_PLACEHOLDER');

UPDATE su_message SET message_en = 'Start Date', message_local = 'วันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_START_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_START_DATE_LABEL', 'Start Date', 'วันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_START_DATE_LABEL');

UPDATE su_message SET message_en = 'Select start date', message_local = 'เลือกวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_START_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_START_DATE_PLACEHOLDER', 'Select start date', 'เลือกวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_START_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'End Date', message_local = 'วันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_END_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_END_DATE_LABEL', 'End Date', 'วันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_END_DATE_LABEL');

UPDATE su_message SET message_en = 'Select end date', message_local = 'เลือกวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_END_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_END_DATE_PLACEHOLDER', 'Select end date', 'เลือกวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_END_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Load Failed', message_local = 'โหลดข้อมูลไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_LOAD_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_LOAD_FAIL_TITLE', 'Load Failed', 'โหลดข้อมูลไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_LOAD_FAIL_TITLE');

UPDATE su_message SET message_en = 'Unable to load task list', message_local = 'ไม่สามารถโหลดรายการงานได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_LOAD_TASKS_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_LOAD_TASKS_FAIL_MSG', 'Unable to load task list', 'ไม่สามารถโหลดรายการงานได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_LOAD_TASKS_FAIL_MSG');

UPDATE su_message SET message_en = 'Unable to load bug list', message_local = 'ไม่สามารถโหลดรายการ Bug ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_LOAD_BUGS_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_LOAD_BUGS_FAIL_MSG', 'Unable to load bug list', 'ไม่สามารถโหลดรายการ Bug ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_LOAD_BUGS_FAIL_MSG');

UPDATE su_message SET message_en = 'Please select a project to view the Task Board', message_local = 'กรุณาเลือกโปรเจกต์ก่อนดู Task Board', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SELECT_PROJECT_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SELECT_PROJECT_MSG', 'Please select a project to view the Task Board', 'กรุณาเลือกโปรเจกต์ก่อนดู Task Board', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SELECT_PROJECT_MSG');

UPDATE su_message SET message_en = 'Select project from top navigation', message_local = 'เลือกโครงการจากเมนูด้านบน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SELECT_PROJECT_HINT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SELECT_PROJECT_HINT', 'Select project from top navigation', 'เลือกโครงการจากเมนูด้านบน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SELECT_PROJECT_HINT');

UPDATE su_message SET message_en = 'Go to Project List', message_local = 'ไปที่รายการโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_GO_PROJECT_LIST_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_GO_PROJECT_LIST_BTN', 'Go to Project List', 'ไปที่รายการโครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_GO_PROJECT_LIST_BTN');

UPDATE su_message SET message_en = 'Critical', message_local = 'วิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_CRITICAL', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_CRITICAL');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_HIGH', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_HIGH');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_MEDIUM', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_MEDIUM');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_LOW', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_LOW');

UPDATE su_message SET message_en = 'Task Code', message_local = 'รหัส Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_TASK_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_TASK_CODE', 'Task Code', 'รหัส Task', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_TASK_CODE');

UPDATE su_message SET message_en = 'Task Name', message_local = 'ชื่องาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_TASK_NAME';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_TASK_NAME', 'Task Name', 'ชื่องาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_TASK_NAME');

UPDATE su_message SET message_en = 'Assignee', message_local = 'ผู้รับผิดชอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_ASSIGNEE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_ASSIGNEE', 'Assignee', 'ผู้รับผิดชอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_ASSIGNEE');

UPDATE su_message SET message_en = 'Manday', message_local = 'Manday', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_MANDAY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_MANDAY', 'Manday', 'Manday', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_MANDAY');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_STATUS');

UPDATE su_message SET message_en = 'Priority', message_local = 'ความสำคัญ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_PRIORITY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_PRIORITY', 'Priority', 'ความสำคัญ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_PRIORITY');

UPDATE su_message SET message_en = 'Due Date', message_local = 'วันที่ครบกำหนด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_DUE_DATE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_DUE_DATE', 'Due Date', 'วันที่ครบกำหนด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_DUE_DATE');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_COL_ACTIONS');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Deleted Successfully', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_DELETE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_DELETE_SUCCESS_TITLE', 'Deleted Successfully', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_DELETE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_DELETE_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_DELETE_ERROR_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_DELETE_ERROR_TITLE');

UPDATE su_message SET message_en = 'Specification Link', message_local = 'ผูกโยงกับ Specification', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SPEC_TRACE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SPEC_TRACE_LABEL', 'Specification Link', 'ผูกโยงกับ Specification', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SPEC_TRACE_LABEL');

UPDATE su_message SET message_en = 'Select Specification', message_local = 'เลือก Specification', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SPEC_SELECT_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SPEC_SELECT_PH', 'Select Specification', 'เลือก Specification', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SPEC_SELECT_PH');

UPDATE su_message SET message_en = 'Specification link is required', message_local = 'กรุณาเลือก Specification', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_SPEC_REQUIRED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_SPEC_REQUIRED_MSG', 'Specification link is required', 'กรุณาเลือก Specification', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_SPEC_REQUIRED_MSG');

UPDATE su_message SET message_en = 'Task Code', message_local = 'รหัส Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_CODE_LABEL', 'Task Code', 'รหัส Task', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. TSK-001', message_local = 'เช่น TSK-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_CODE_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_CODE_PH', 'e.g. TSK-001', 'เช่น TSK-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_CODE_PH');

UPDATE su_message SET message_en = 'Task code is required', message_local = 'กรุณากรอกรหัส Task', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_CODE_REQUIRED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_CODE_REQUIRED_MSG', 'Task code is required', 'กรุณากรอกรหัส Task', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_CODE_REQUIRED_MSG');

UPDATE su_message SET message_en = 'Task Name', message_local = 'ชื่องาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_NAME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_NAME_LABEL', 'Task Name', 'ชื่องาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_NAME_LABEL');

UPDATE su_message SET message_en = 'Enter task name', message_local = 'ระบุชื่องาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_NAME_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_NAME_PH', 'Enter task name', 'ระบุชื่องาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_NAME_PH');

UPDATE su_message SET message_en = 'Task name is required', message_local = 'กรุณากรอกชื่องาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_NAME_REQUIRED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_NAME_REQUIRED_MSG', 'Task name is required', 'กรุณากรอกชื่องาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_NAME_REQUIRED_MSG');

UPDATE su_message SET message_en = 'Task Description', message_local = 'รายละเอียดงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_DESC_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_DESC_LABEL', 'Task Description', 'รายละเอียดงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_DESC_LABEL');

UPDATE su_message SET message_en = 'Enter detailed task description...', message_local = 'ระบุรายละเอียดงาน...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TASK_DESC_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TASK_DESC_PH', 'Enter detailed task description...', 'ระบุรายละเอียดงาน...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TASK_DESC_PH');

UPDATE su_message SET message_en = 'Select start date', message_local = 'เลือกวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_START_DATE_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_START_DATE_PH', 'Select start date', 'เลือกวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_START_DATE_PH');

UPDATE su_message SET message_en = 'Start Time', message_local = 'เวลาเริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_START_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_START_TIME_LABEL', 'Start Time', 'เวลาเริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_START_TIME_LABEL');

UPDATE su_message SET message_en = 'Select time', message_local = 'เลือกเวลา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_TIME_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_TIME_PH', 'Select time', 'เลือกเวลา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_TIME_PH');

UPDATE su_message SET message_en = 'Select end date', message_local = 'เลือกวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_END_DATE_PH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_END_DATE_PH', 'Select end date', 'เลือกวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_END_DATE_PH');

UPDATE su_message SET message_en = 'End Time', message_local = 'เวลาสิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_END_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_END_TIME_LABEL', 'End Time', 'เวลาสิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_END_TIME_LABEL');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_LOW_PLAIN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_LOW_PLAIN', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_LOW_PLAIN');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_MEDIUM_PLAIN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_MEDIUM_PLAIN', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_MEDIUM_PLAIN');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_HIGH_PLAIN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_HIGH_PLAIN', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_HIGH_PLAIN');

UPDATE su_message SET message_en = 'Critical', message_local = 'วิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT10_PRIO_CRITICAL_PLAIN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT10_PRIO_CRITICAL_PLAIN', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT10_PRIO_CRITICAL_PLAIN');

UPDATE su_message SET message_en = 'Planned Start Date', message_local = 'วันที่เริ่มต้นตามแผน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_PLAN_START_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_PLAN_START_LABEL', 'Planned Start Date', 'วันที่เริ่มต้นตามแผน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_PLAN_START_LABEL');

UPDATE su_message SET message_en = 'Start date is required', message_local = 'กรุณาระบุวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_START_REQUIRED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_START_REQUIRED_MSG', 'Start date is required', 'กรุณาระบุวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_START_REQUIRED_MSG');

UPDATE su_message SET message_en = 'Planned End Date', message_local = 'วันที่สิ้นสุดตามแผน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_PLAN_END_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_PLAN_END_LABEL', 'Planned End Date', 'วันที่สิ้นสุดตามแผน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_PLAN_END_LABEL');

UPDATE su_message SET message_en = 'End date is required', message_local = 'กรุณาระบุวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_END_REQUIRED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_END_REQUIRED_MSG', 'End date is required', 'กรุณาระบุวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_END_REQUIRED_MSG');

UPDATE su_message SET message_en = 'Saved Successfully', message_local = 'บันทึกสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_SAVE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_SAVE_SUCCESS_TITLE', 'Saved Successfully', 'บันทึกสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_SAVE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Save Failed', message_local = 'บันทึกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_SAVE_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_SAVE_ERROR_TITLE', 'Save Failed', 'บันทึกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_SAVE_ERROR_TITLE');

UPDATE su_message SET message_en = 'To Do', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_TODO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_TODO', 'To Do', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_TODO');

UPDATE su_message SET message_en = 'In Progress', message_local = 'กำลังดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_INPROGRESS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_INPROGRESS', 'In Progress', 'กำลังดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_INPROGRESS');

UPDATE su_message SET message_en = 'Waiting Review', message_local = 'รอตรวจสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_WAITING_REVIEW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_WAITING_REVIEW', 'Waiting Review', 'รอตรวจสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_WAITING_REVIEW');

UPDATE su_message SET message_en = 'Waiting Fix', message_local = 'รอแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_WAITING_FIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_WAITING_FIX', 'Waiting Fix', 'รอแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_WAITING_FIX');

UPDATE su_message SET message_en = 'Done', message_local = 'เสร็จสิ้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_DONE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_DONE', 'Done', 'เสร็จสิ้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_DONE');

UPDATE su_message SET message_en = 'Delayed', message_local = 'ล่าช้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_DELAYED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_DELAYED', 'Delayed', 'ล่าช้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_DELAYED');

UPDATE su_message SET message_en = 'Blocked', message_local = 'ติดบล็อก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_BLOCKED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_BLOCKED', 'Blocked', 'ติดบล็อก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_BLOCKED');

UPDATE su_message SET message_en = 'Cancelled', message_local = 'ยกเลิก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT11_ST_CANCELLED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT11_ST_CANCELLED', 'Cancelled', 'ยกเลิก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT11_ST_CANCELLED');

UPDATE su_message SET message_en = 'Export test summary report', message_local = 'ส่งออกรายงานสรุปผลการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_EXPORT_REPORT_TOOLTIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_EXPORT_REPORT_TOOLTIP', 'Export test summary report', 'ส่งออกรายงานสรุปผลการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_EXPORT_REPORT_TOOLTIP');

UPDATE su_message SET message_en = 'Exporting...', message_local = 'กำลังส่งออก...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_EXPORTING_TEXT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_EXPORTING_TEXT', 'Exporting...', 'กำลังส่งออก...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_EXPORTING_TEXT');

UPDATE su_message SET message_en = 'Export Report', message_local = 'ส่งออกรายงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_EXPORT_REPORT_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_EXPORT_REPORT_BTN', 'Export Report', 'ส่งออกรายงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_EXPORT_REPORT_BTN');

UPDATE su_message SET message_en = 'User Acceptance Testing (UAT)', message_local = 'การทดสอบความยอมรับของผู้ใช้ (UAT)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_RPT_UAT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_RPT_UAT_TITLE', 'User Acceptance Testing (UAT)', 'การทดสอบความยอมรับของผู้ใช้ (UAT)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_RPT_UAT_TITLE');

UPDATE su_message SET message_en = 'UAT Acceptance Test Report for customer sign-off', message_local = 'รายงานผลการตรวจรับระบบ (UAT) สำหรับลูกค้าลงนาม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_RPT_UAT_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_RPT_UAT_DESC', 'UAT Acceptance Test Report for customer sign-off', 'รายงานผลการตรวจรับระบบ (UAT) สำหรับลูกค้าลงนาม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_RPT_UAT_DESC');

UPDATE su_message SET message_en = 'System Integration Testing (SIT)', message_local = 'การทดสอบรวมระบบ (SIT)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_RPT_SIT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_RPT_SIT_TITLE', 'System Integration Testing (SIT)', 'การทดสอบรวมระบบ (SIT)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_RPT_SIT_TITLE');

UPDATE su_message SET message_en = 'Internal System Integration Test Report', message_local = 'รายงานผลการทดสอบรวมระบบ (SIT) ภายในทีม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_RPT_SIT_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_RPT_SIT_DESC', 'Internal System Integration Test Report', 'รายงานผลการทดสอบรวมระบบ (SIT) ภายในทีม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_RPT_SIT_DESC');

UPDATE su_message SET message_en = 'All Test Results', message_local = 'ผลการทดสอบทั้งหมด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_RPT_ALL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_RPT_ALL_TITLE', 'All Test Results', 'ผลการทดสอบทั้งหมด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_RPT_ALL_TITLE');

UPDATE su_message SET message_en = 'Complete test scenario and bug report', message_local = 'รายงานผลการทดสอบและข้อผิดพลาดทั้งหมด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_RPT_ALL_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_RPT_ALL_DESC', 'Complete test scenario and bug report', 'รายงานผลการทดสอบและข้อผิดพลาดทั้งหมด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_RPT_ALL_DESC');

UPDATE su_message SET message_en = 'Pass', message_local = 'ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_STATUS_PASS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_STATUS_PASS', 'Pass', 'ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_STATUS_PASS');

UPDATE su_message SET message_en = 'Fail', message_local = 'ไม่ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_STATUS_FAIL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_STATUS_FAIL', 'Fail', 'ไม่ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_STATUS_FAIL');

UPDATE su_message SET message_en = 'Blocked', message_local = 'ติดบล็อก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_STATUS_BLOCKED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_STATUS_BLOCKED', 'Blocked', 'ติดบล็อก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_STATUS_BLOCKED');

UPDATE su_message SET message_en = 'Pending', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_STATUS_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_STATUS_PENDING', 'Pending', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_STATUS_PENDING');

UPDATE su_message SET message_en = 'Waiting for Test', message_local = 'รอการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_STATUS_WAITING_TEST';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_STATUS_WAITING_TEST', 'Waiting for Test', 'รอการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_STATUS_WAITING_TEST');

UPDATE su_message SET message_en = 'High', message_local = 'สูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_PRIORITY_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_PRIORITY_HIGH', 'High', 'สูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_PRIORITY_HIGH');

UPDATE su_message SET message_en = 'Medium', message_local = 'ปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_PRIORITY_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_PRIORITY_MEDIUM', 'Medium', 'ปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_PRIORITY_MEDIUM');

UPDATE su_message SET message_en = 'Low', message_local = 'ต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_PRIORITY_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_PRIORITY_LOW', 'Low', 'ต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_PRIORITY_LOW');

UPDATE su_message SET message_en = 'Testing', message_local = 'กำลังทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TASK_STATUS_TESTING_OPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TASK_STATUS_TESTING_OPT', 'Testing', 'กำลังทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TASK_STATUS_TESTING_OPT');

UPDATE su_message SET message_en = 'In Development', message_local = 'กำลังพัฒนา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TASK_STATUS_DEV_OPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TASK_STATUS_DEV_OPT', 'In Development', 'กำลังพัฒนา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TASK_STATUS_DEV_OPT');

UPDATE su_message SET message_en = 'Completed', message_local = 'เสร็จสิ้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TASK_STATUS_COMPLETE_OPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TASK_STATUS_COMPLETE_OPT', 'Completed', 'เสร็จสิ้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TASK_STATUS_COMPLETE_OPT');

UPDATE su_message SET message_en = 'To Do', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TASK_STATUS_TODO_OPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TASK_STATUS_TODO_OPT', 'To Do', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TASK_STATUS_TODO_OPT');

UPDATE su_message SET message_en = 'On Hold', message_local = 'ระงับชั่วคราว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TASK_STATUS_ONHOLD_OPT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TASK_STATUS_ONHOLD_OPT', 'On Hold', 'ระงับชั่วคราว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TASK_STATUS_ONHOLD_OPT');

UPDATE su_message SET message_en = 'Load Failed', message_local = 'โหลดข้อมูลไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_LOAD_FAIL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_LOAD_FAIL_TITLE', 'Load Failed', 'โหลดข้อมูลไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_LOAD_FAIL_TITLE');

UPDATE su_message SET message_en = 'Unable to load test scenarios', message_local = 'ไม่สามารถโหลดชุดทดสอบได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_LOAD_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_LOAD_FAIL_MSG', 'Unable to load test scenarios', 'ไม่สามารถโหลดชุดทดสอบได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_LOAD_FAIL_MSG');

UPDATE su_message SET message_en = 'Cannot test while related bug is pending resolution', message_local = 'ไม่สามารถทดสอบได้เนื่องจากมี Bug ที่กำลังรอการแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_CANNOT_TEST_BUG_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_CANNOT_TEST_BUG_MSG', 'Cannot test while related bug is pending resolution', 'ไม่สามารถทดสอบได้เนื่องจากมี Bug ที่กำลังรอการแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_CANNOT_TEST_BUG_MSG');

UPDATE su_message SET message_en = 'Related task is not ready for testing yet', message_local = 'งานที่เกี่ยวข้องยังไม่พร้อมสำหรับการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TASK_NOT_READY_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TASK_NOT_READY_MSG', 'Related task is not ready for testing yet', 'งานที่เกี่ยวข้องยังไม่พร้อมสำหรับการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TASK_NOT_READY_MSG');

UPDATE su_message SET message_en = 'Save Test Result', message_local = 'บันทึกผลการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_SAVE_TEST_RESULT_TT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_SAVE_TEST_RESULT_TT', 'Save Test Result', 'บันทึกผลการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_SAVE_TEST_RESULT_TT');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ Test Scenario', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_CONFIRM_DELETE_SCENARIO_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_CONFIRM_DELETE_SCENARIO_TITLE', 'Confirm Deletion', 'ยืนยันการลบ Test Scenario', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_CONFIRM_DELETE_SCENARIO_TITLE');

UPDATE su_message SET message_en = 'Do you want to delete this Test Scenario?', message_local = 'คุณต้องการลบ Test Scenario นี้ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_CONFIRM_DELETE_SCENARIO_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_CONFIRM_DELETE_SCENARIO_MSG', 'Do you want to delete this Test Scenario?', 'คุณต้องการลบ Test Scenario นี้ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_CONFIRM_DELETE_SCENARIO_MSG');

UPDATE su_message SET message_en = 'Deleted', message_local = 'ลบสำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_DELETE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_DELETE_SUCCESS_TITLE', 'Deleted', 'ลบสำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_DELETE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Delete Failed', message_local = 'ลบไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_DELETE_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_DELETE_FAILED_TITLE', 'Delete Failed', 'ลบไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_DELETE_FAILED_TITLE');

UPDATE su_message SET message_en = 'Bug reported from test result:', message_local = 'Bug ที่เปิดจากผลการทดสอบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_BUG_FROM_TEST_RESULT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_BUG_FROM_TEST_RESULT', 'Bug reported from test result:', 'Bug ที่เปิดจากผลการทดสอบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_BUG_FROM_TEST_RESULT');

UPDATE su_message SET message_en = 'Test Case:', message_local = 'เคสทดสอบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TC_TITLE_BULLET';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TC_TITLE_BULLET', 'Test Case:', 'เคสทดสอบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TC_TITLE_BULLET');

UPDATE su_message SET message_en = 'Steps to reproduce:', message_local = 'ขั้นตอนการทดสอบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_TEST_STEP_BULLET';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_TEST_STEP_BULLET', 'Steps to reproduce:', 'ขั้นตอนการทดสอบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_TEST_STEP_BULLET');

UPDATE su_message SET message_en = 'Expected result:', message_local = 'ผลลัพธ์ที่คาดหวัง:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_EXPECTED_RESULT_BULLET';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_EXPECTED_RESULT_BULLET', 'Expected result:', 'ผลลัพธ์ที่คาดหวัง:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_EXPECTED_RESULT_BULLET');

UPDATE su_message SET message_en = 'Actual result / Error:', message_local = 'ผลลัพธ์จริงที่พบ / ข้อผิดพลาด:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_ACTUAL_RESULT_ERROR_BULLET';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_ACTUAL_RESULT_ERROR_BULLET', 'Actual result / Error:', 'ผลลัพธ์จริงที่พบ / ข้อผิดพลาด:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_ACTUAL_RESULT_ERROR_BULLET');

UPDATE su_message SET message_en = 'Tester:', message_local = 'ผู้ทดสอบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_REPORTER_BULLET';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_REPORTER_BULLET', 'Tester:', 'ผู้ทดสอบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_REPORTER_BULLET');

UPDATE su_message SET message_en = 'Bug Opened', message_local = 'เปิด Bug สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_BUG_OPEN_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_BUG_OPEN_SUCCESS_TITLE', 'Bug Opened', 'เปิด Bug สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_BUG_OPEN_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Bug has been created and linked to task', message_local = 'สร้างรายการ Bug และเชื่อมโยงกับงานเรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_BUG_CREATED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_BUG_CREATED_MSG', 'Bug has been created and linked to task', 'สร้างรายการ Bug และเชื่อมโยงกับงานเรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_BUG_CREATED_MSG');

UPDATE su_message SET message_en = 'Unable to open Bug', message_local = 'ไม่สามารถเปิด Bug ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12_BUG_CREATE_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12_BUG_CREATE_FAILED_TITLE', 'Unable to open Bug', 'ไม่สามารถเปิด Bug ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12_BUG_CREATE_FAILED_TITLE');

UPDATE su_message SET message_en = 'Record Test Result', message_local = 'บันทึกผลการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_RECORD_TEST_RESULT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_RECORD_TEST_RESULT', 'Record Test Result', 'บันทึกผลการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_RECORD_TEST_RESULT');

UPDATE su_message SET message_en = 'Test Case Details', message_local = 'รายละเอียดเคสทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_CASE_DETAILS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_CASE_DETAILS', 'Test Case Details', 'รายละเอียดเคสทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_CASE_DETAILS');

UPDATE su_message SET message_en = 'Edit Test Case', message_local = 'แก้ไข Test Case', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_EDIT_TEST_CASE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_EDIT_TEST_CASE', 'Edit Test Case', 'แก้ไข Test Case', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_EDIT_TEST_CASE');

UPDATE su_message SET message_en = 'Add Test Case', message_local = 'เพิ่ม Test Case', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_ADD_NEW_TEST_CASE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_ADD_NEW_TEST_CASE', 'Add Test Case', 'เพิ่ม Test Case', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_ADD_NEW_TEST_CASE');

UPDATE su_message SET message_en = 'Create New Test Case', message_local = 'สร้าง Test Case ใหม่', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_CREATE_NEW_TEST_CASE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_CREATE_NEW_TEST_CASE', 'Create New Test Case', 'สร้าง Test Case ใหม่', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_CREATE_NEW_TEST_CASE');

UPDATE su_message SET message_en = 'Linking & Test Type', message_local = 'การเชื่อมโยงและประเภทการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_LINKING_AND_TEST_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_LINKING_AND_TEST_TYPE', 'Linking & Test Type', 'การเชื่อมโยงและประเภทการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_LINKING_AND_TEST_TYPE');

UPDATE su_message SET message_en = 'Test Scenario', message_local = 'ชุดทดสอบ (Test Scenario)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_SCENARIO_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_SCENARIO_LABEL', 'Test Scenario', 'ชุดทดสอบ (Test Scenario)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_SCENARIO_LABEL');

UPDATE su_message SET message_en = 'Select scenario', message_local = 'เลือก Test Scenario', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_SELECT_SCENARIO_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_SELECT_SCENARIO_PLACEHOLDER', 'Select scenario', 'เลือก Test Scenario', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_SELECT_SCENARIO_PLACEHOLDER');

UPDATE su_message SET message_en = 'Test Type', message_local = 'ประเภทการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_TYPE_LABEL', 'Test Type', 'ประเภทการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_TYPE_LABEL');

UPDATE su_message SET message_en = 'Based on scenario', message_local = 'ตาม Test Scenario', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_BASED_ON_SCENARIO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_BASED_ON_SCENARIO', 'Based on scenario', 'ตาม Test Scenario', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_BASED_ON_SCENARIO');

UPDATE su_message SET message_en = 'Related Task', message_local = 'งานที่เกี่ยวข้อง (Task)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_RELATED_TASK_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_RELATED_TASK_LABEL', 'Related Task', 'งานที่เกี่ยวข้อง (Task)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_RELATED_TASK_LABEL');

UPDATE su_message SET message_en = 'Select related task', message_local = 'เลือก Task ที่เกี่ยวข้อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_SELECT_RELATED_TASK_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_SELECT_RELATED_TASK_PLACEHOLDER', 'Select related task', 'เลือก Task ที่เกี่ยวข้อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_SELECT_RELATED_TASK_PLACEHOLDER');

UPDATE su_message SET message_en = 'Steps & Expected Results', message_local = 'ขั้นตอน & ผลลัพธ์ที่คาดหวัง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_STEPS_AND_RESULTS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_STEPS_AND_RESULTS', 'Steps & Expected Results', 'ขั้นตอน & ผลลัพธ์ที่คาดหวัง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_STEPS_AND_RESULTS');

UPDATE su_message SET message_en = 'Test Steps', message_local = 'ขั้นตอนการทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_STEP_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_STEP_LABEL', 'Test Steps', 'ขั้นตอนการทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_STEP_LABEL');

UPDATE su_message SET message_en = 'Rich text supported', message_local = 'รองรับข้อความแบบ Rich Text', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_RICH_TEXT_SUPPORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_RICH_TEXT_SUPPORT', 'Rich text supported', 'รองรับข้อความแบบ Rich Text', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_RICH_TEXT_SUPPORT');

UPDATE su_message SET message_en = 'Enter detailed step-by-step test instructions...', message_local = 'ระบุขั้นตอนการทดสอบเป็นข้อๆ...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_STEP_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_STEP_PLACEHOLDER', 'Enter detailed step-by-step test instructions...', 'ระบุขั้นตอนการทดสอบเป็นข้อๆ...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_STEP_PLACEHOLDER');

UPDATE su_message SET message_en = 'Referenced from Related Task', message_local = 'อ้างอิงจาก Task ที่เกี่ยวข้อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_REFERENCE_TASK_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_REFERENCE_TASK_LABEL', 'Referenced from Related Task', 'อ้างอิงจาก Task ที่เกี่ยวข้อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_REFERENCE_TASK_LABEL');

UPDATE su_message SET message_en = 'No related task assigned', message_local = 'ไม่ได้ระบุ Task ที่เกี่ยวข้อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_NO_TASK_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_NO_TASK_PLACEHOLDER', 'No related task assigned', 'ไม่ได้ระบุ Task ที่เกี่ยวข้อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_NO_TASK_PLACEHOLDER');

UPDATE su_message SET message_en = 'Task link will be updated automatically upon saving', message_local = 'ความเชื่อมโยงของ Task จะอัปเดตอัตโนมัติเมื่อบันทึก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TASK_HINT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TASK_HINT', 'Task link will be updated automatically upon saving', 'ความเชื่อมโยงของ Task จะอัปเดตอัตโนมัติเมื่อบันทึก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TASK_HINT');

UPDATE su_message SET message_en = 'AI Prompt / Instructions', message_local = 'คำสั่ง AI / Prompt', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_PROMPT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_PROMPT_LABEL', 'AI Prompt / Instructions', 'คำสั่ง AI / Prompt', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_PROMPT_LABEL');

UPDATE su_message SET message_en = 'Describe what test scenario you want AI to generate...', message_local = 'ระบุสิ่งที่ต้องการให้ AI สร้าง Test Scenario...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_PROMPT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_PROMPT_PLACEHOLDER', 'Describe what test scenario you want AI to generate...', 'ระบุสิ่งที่ต้องการให้ AI สร้าง Test Scenario...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_PROMPT_PLACEHOLDER');

UPDATE su_message SET message_en = 'Copied to clipboard', message_local = 'คัดลอกแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_COPIED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_COPIED', 'Copied to clipboard', 'คัดลอกแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_COPIED');

UPDATE su_message SET message_en = 'Paste into Form', message_local = 'นำข้อมูลลงฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_PASTE_TO_FORM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_PASTE_TO_FORM', 'Paste into Form', 'นำข้อมูลลงฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_PASTE_TO_FORM');

UPDATE su_message SET message_en = 'Steps to Execute', message_local = 'ขั้นตอนการทำงาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_STEPS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_STEPS_LABEL', 'Steps to Execute', 'ขั้นตอนการทำงาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_STEPS_LABEL');

UPDATE su_message SET message_en = 'Expected Result', message_local = 'ผลลัพธ์ที่คาดหวัง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_EXPECTED_RESULT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_EXPECTED_RESULT_LABEL', 'Expected Result', 'ผลลัพธ์ที่คาดหวัง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_EXPECTED_RESULT_LABEL');

UPDATE su_message SET message_en = 'Describe expected result...', message_local = 'ระบุผลลัพธ์ที่คาดหวัง...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_EXPECTED_RESULT_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_EXPECTED_RESULT_PLACEHOLDER', 'Describe expected result...', 'ระบุผลลัพธ์ที่คาดหวัง...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_EXPECTED_RESULT_PLACEHOLDER');

UPDATE su_message SET message_en = 'Expected Result', message_local = 'ผลลัพธ์ที่คาดหวัง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_EXPECTED_RESULT_LABEL2';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_EXPECTED_RESULT_LABEL2', 'Expected Result', 'ผลลัพธ์ที่คาดหวัง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_EXPECTED_RESULT_LABEL2');

UPDATE su_message SET message_en = 'System Integration Test (SIT)', message_local = 'การทดสอบรวมระบบ (SIT)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_TYPE_SIT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_TYPE_SIT', 'System Integration Test (SIT)', 'การทดสอบรวมระบบ (SIT)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_TYPE_SIT');

UPDATE su_message SET message_en = 'User Acceptance Test (UAT)', message_local = 'การตรวจรับระบบ (UAT)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TEST_TYPE_UAT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TEST_TYPE_UAT', 'User Acceptance Test (UAT)', 'การตรวจรับระบบ (UAT)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TEST_TYPE_UAT');

UPDATE su_message SET message_en = 'Pending', message_local = 'รอดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_STATUS_PENDING';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_STATUS_PENDING', 'Pending', 'รอดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_STATUS_PENDING');

UPDATE su_message SET message_en = 'Pass', message_local = 'ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_STATUS_PASS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_STATUS_PASS', 'Pass', 'ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_STATUS_PASS');

UPDATE su_message SET message_en = 'Fail', message_local = 'ไม่ผ่าน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_STATUS_FAIL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_STATUS_FAIL', 'Fail', 'ไม่ผ่าน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_STATUS_FAIL');

UPDATE su_message SET message_en = 'Blocked', message_local = 'ติดบล็อก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_STATUS_BLOCKED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_STATUS_BLOCKED', 'Blocked', 'ติดบล็อก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_STATUS_BLOCKED');

UPDATE su_message SET message_en = 'Incomplete Data', message_local = 'ข้อมูลไม่ครบถ้วน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_INCOMPLETE_DATA_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_INCOMPLETE_DATA_TITLE', 'Incomplete Data', 'ข้อมูลไม่ครบถ้วน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_INCOMPLETE_DATA_TITLE');

UPDATE su_message SET message_en = 'Cannot Save Result', message_local = 'ไม่สามารถบันทึกผลได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_CANNOT_SAVE_TEST_RESULT_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_CANNOT_SAVE_TEST_RESULT_TITLE', 'Cannot Save Result', 'ไม่สามารถบันทึกผลได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_CANNOT_SAVE_TEST_RESULT_TITLE');

UPDATE su_message SET message_en = 'A linked Bug is currently unresolved', message_local = 'มี Bug ที่ยังไม่ได้รับการแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_BUG_UNRESOLVED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_BUG_UNRESOLVED_MSG', 'A linked Bug is currently unresolved', 'มี Bug ที่ยังไม่ได้รับการแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_BUG_UNRESOLVED_MSG');

UPDATE su_message SET message_en = 'Bug reported from test result:', message_local = 'Bug ที่เปิดจากผลการทดสอบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_BUG_FROM_TEST_RESULT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_BUG_FROM_TEST_RESULT', 'Bug reported from test result:', 'Bug ที่เปิดจากผลการทดสอบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_BUG_FROM_TEST_RESULT');

UPDATE su_message SET message_en = 'Test Case Title', message_local = 'หัวข้อเคสทดสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_TITLE_LABEL', 'Test Case Title', 'หัวข้อเคสทดสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_TITLE_LABEL');

UPDATE su_message SET message_en = 'Actual Result Found', message_local = 'ผลการทดสอบจริงที่พบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT12A_ACTUAL_RESULT_FOUND_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT12A_ACTUAL_RESULT_FOUND_LABEL', 'Actual Result Found', 'ผลการทดสอบจริงที่พบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT12A_ACTUAL_RESULT_FOUND_LABEL');

UPDATE su_message SET message_en = 'Back to project list', message_local = 'กลับไปหน้ารายการโครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_BACK_TOOLTIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_BACK_TOOLTIP', 'Back to project list', 'กลับไปหน้ารายการโครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_BACK_TOOLTIP');

UPDATE su_message SET message_en = 'Deliveries', message_local = 'การส่งมอบงาน (Delivery)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PAGE_TITLE', 'Deliveries', 'การส่งมอบงาน (Delivery)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_PAGE_TITLE');

UPDATE su_message SET message_en = 'items', message_local = 'รายการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_ITEMS_SUFFIX', 'items', 'รายการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Confirmed Complete', message_local = 'ยืนยันรับมอบสมบูรณ์', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_CONFIRMED_COMPLETE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CONFIRMED_COMPLETE', 'Confirmed Complete', 'ยืนยันรับมอบสมบูรณ์', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_CONFIRMED_COMPLETE');

UPDATE su_message SET message_en = 'Gate Check Passed', message_local = 'ผ่าน Gate Check', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_GATE_PASSED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_PASSED', 'Gate Check Passed', 'ผ่าน Gate Check', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_GATE_PASSED');

UPDATE su_message SET message_en = 'Gate Check incomplete: please verify checklist', message_local = 'Gate Check ยังไม่สมบูรณ์: กรุณาตรวจสอบ Checklist', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_GATE_INCOMPLETE_TIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_INCOMPLETE_TIP', 'Gate Check incomplete: please verify checklist', 'Gate Check ยังไม่สมบูรณ์: กรุณาตรวจสอบ Checklist', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_GATE_INCOMPLETE_TIP');

UPDATE su_message SET message_en = 'Incomplete', message_local = 'ยังไม่สมบูรณ์', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_NOT_COMPLETE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_NOT_COMPLETE', 'Incomplete', 'ยังไม่สมบูรณ์', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_NOT_COMPLETE');

UPDATE su_message SET message_en = 'Gate Check', message_local = 'Gate Check', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_GATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_LABEL', 'Gate Check', 'Gate Check', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_GATE_LABEL');

UPDATE su_message SET message_en = 'Code / Title', message_local = 'รหัส / หัวข้อ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_CODE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_CODE_TITLE', 'Code / Title', 'รหัส / หัวข้อ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_CODE_TITLE');

UPDATE su_message SET message_en = 'Delivery Type', message_local = 'ประเภทการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_TYPE', 'Delivery Type', 'ประเภทการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_TYPE');

UPDATE su_message SET message_en = 'Version', message_local = 'เวอร์ชัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_VERSION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_VERSION', 'Version', 'เวอร์ชัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_VERSION');

UPDATE su_message SET message_en = 'Delivery Date', message_local = 'วันที่ส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_DELIVERY_DATE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_DELIVERY_DATE', 'Delivery Date', 'วันที่ส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_DELIVERY_DATE');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COL_ACTIONS');

UPDATE su_message SET message_en = 'Print Failed', message_local = 'พิมพ์เอกสารไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_PRINT_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PRINT_ERROR_TITLE', 'Print Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_PRINT_ERROR_TITLE');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Success', message_local = 'สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_SUCCESS_TITLE', 'Success', 'สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_ERROR_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_ERROR_TITLE');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_BACK_SIMPLE_TIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_BACK_SIMPLE_TIP', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_BACK_SIMPLE_TIP');

UPDATE su_message SET message_en = 'Delivery Document Details & Gate Check', message_local = 'รายละเอียดเอกสารส่งมอบและ Gate Check', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_FORM_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_FORM_SUBTITLE', 'Delivery Document Details & Gate Check', 'รายละเอียดเอกสารส่งมอบและ Gate Check', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_FORM_SUBTITLE');

UPDATE su_message SET message_en = 'Delivery Code', message_local = 'รหัสเอกสารส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CODE_LABEL', 'Delivery Code', 'รหัสเอกสารส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_CODE_LABEL');

UPDATE su_message SET message_en = 'Gate Check Status:', message_local = 'สถานะ Gate Check:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_GATE_STATUS_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_STATUS_LABEL', 'Gate Check Status:', 'สถานะ Gate Check:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_GATE_STATUS_LABEL');

UPDATE su_message SET message_en = 'Passed', message_local = 'ผ่านแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_PASSED_WORD';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PASSED_WORD', 'Passed', 'ผ่านแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_PASSED_WORD');

UPDATE su_message SET message_en = 'No checklist items added yet', message_local = 'ยังไม่มีรายการ Checklist', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_GATE_EMPTY_HINT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_GATE_EMPTY_HINT', 'No checklist items added yet', 'ยังไม่มีรายการ Checklist', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_GATE_EMPTY_HINT');

UPDATE su_message SET message_en = 'Delivery Information', message_local = 'ข้อมูลการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_INFO_SECTION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_INFO_SECTION_TITLE', 'Delivery Information', 'ข้อมูลการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_INFO_SECTION_TITLE');

UPDATE su_message SET message_en = 'Delivery Code', message_local = 'รหัสการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_CODE_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CODE_FIELD_LABEL', 'Delivery Code', 'รหัสการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_CODE_FIELD_LABEL');

UPDATE su_message SET message_en = 'e.g. DEL-2026-001', message_local = 'เช่น DEL-2026-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_CODE_PLACEHOLDER', 'e.g. DEL-2026-001', 'เช่น DEL-2026-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Delivery Title', message_local = 'หัวข้อการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_TITLE_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_TITLE_FIELD_LABEL', 'Delivery Title', 'หัวข้อการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_TITLE_FIELD_LABEL');

UPDATE su_message SET message_en = 'Enter delivery title', message_local = 'ระบุหัวข้อการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_TITLE_PLACEHOLDER', 'Enter delivery title', 'ระบุหัวข้อการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Delivery Type', message_local = 'ประเภทการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_TYPE_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_TYPE_FIELD_LABEL', 'Delivery Type', 'ประเภทการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_TYPE_FIELD_LABEL');

UPDATE su_message SET message_en = 'Approval Flow', message_local = 'กระบวนการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_APPROVAL_FLOW_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_APPROVAL_FLOW_TITLE', 'Approval Flow', 'กระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_APPROVAL_FLOW_TITLE');

UPDATE su_message SET message_en = 'Select approval workflow for this delivery', message_local = 'เลือกสายการอนุมัติสำหรับการส่งมอบนี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_APPROVAL_FLOW_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_APPROVAL_FLOW_DESC', 'Select approval workflow for this delivery', 'เลือกสายการอนุมัติสำหรับการส่งมอบนี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_APPROVAL_FLOW_DESC');

UPDATE su_message SET message_en = 'Select Approval Flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_SELECT_APPROVAL_FLOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_SELECT_APPROVAL_FLOW', 'Select Approval Flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_SELECT_APPROVAL_FLOW');

UPDATE su_message SET message_en = 'Request Changes', message_local = 'ขอแก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_REQUEST_EDIT_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_REQUEST_EDIT_BTN', 'Request Changes', 'ขอแก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_REQUEST_EDIT_BTN');

UPDATE su_message SET message_en = 'Edit Delivery', message_local = 'แก้ไขข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_EDIT_DOC_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_EDIT_DOC_BTN', 'Edit Delivery', 'แก้ไขข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_EDIT_DOC_BTN');

UPDATE su_message SET message_en = 'Save Delivery', message_local = 'บันทึกการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_SAVE_DOC_BTN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_SAVE_DOC_BTN', 'Save Delivery', 'บันทึกการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_SAVE_DOC_BTN');

UPDATE su_message SET message_en = 'Paste AI content into form', message_local = 'นำเนื้อหาจาก AI ลงฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_PASTE_TO_FORM_LONG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PASTE_TO_FORM_LONG', 'Paste AI content into form', 'นำเนื้อหาจาก AI ลงฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_PASTE_TO_FORM_LONG');

UPDATE su_message SET message_en = 'Delivery:', message_local = 'การส่งมอบ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_DELIVERY_TITLE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_DELIVERY_TITLE_PREFIX', 'Delivery:', 'การส่งมอบ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_DELIVERY_TITLE_PREFIX');

UPDATE su_message SET message_en = 'Delivery Document', message_local = 'เอกสารการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_DEFAULT_DOC_NAME';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_DEFAULT_DOC_NAME', 'Delivery Document', 'เอกสารการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_DEFAULT_DOC_NAME');

UPDATE su_message SET message_en = 'Note:', message_local = 'หมายเหตุ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_NOTE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_NOTE_PREFIX', 'Note:', 'หมายเหตุ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_NOTE_PREFIX');

UPDATE su_message SET message_en = 'Items:', message_local = 'รายการ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_ITEMS_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_ITEMS_PREFIX', 'Items:', 'รายการ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_ITEMS_PREFIX');

UPDATE su_message SET message_en = 'Paste', message_local = 'วางลงในฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_PASTE_TO_FORM_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_PASTE_TO_FORM_SHORT', 'Paste', 'วางลงในฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_PASTE_TO_FORM_SHORT');

UPDATE su_message SET message_en = 'Delete Draft History', message_local = 'ลบประวัติการร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_DELETE_HISTORY_TIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_DELETE_HISTORY_TIP', 'Delete Draft History', 'ลบประวัติการร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_DELETE_HISTORY_TIP');

UPDATE su_message SET message_en = 'Command:', message_local = 'คำสั่ง:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_COMMAND_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_COMMAND_PREFIX', 'Command:', 'คำสั่ง:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_COMMAND_PREFIX');

UPDATE su_message SET message_en = 'Total items:', message_local = 'จำนวนรายการ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_ITEM_COUNT_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_ITEM_COUNT_PREFIX', 'Total items:', 'จำนวนรายการ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_ITEM_COUNT_PREFIX');

UPDATE su_message SET message_en = 'Final Delivery', message_local = 'ส่งมอบงวดสุดท้าย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_TYPE_FINAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_TYPE_FINAL', 'Final Delivery', 'ส่งมอบงวดสุดท้าย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_TYPE_FINAL');

UPDATE su_message SET message_en = 'Partial Delivery', message_local = 'ส่งมอบงวดงานย่อย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_TYPE_PARTIAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_TYPE_PARTIAL', 'Partial Delivery', 'ส่งมอบงวดงานย่อย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_TYPE_PARTIAL');

UPDATE su_message SET message_en = 'Milestone Delivery', message_local = 'ส่งมอบตาม Milestone', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_TYPE_MILESTONE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_TYPE_MILESTONE', 'Milestone Delivery', 'ส่งมอบตาม Milestone', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_TYPE_MILESTONE');

UPDATE su_message SET message_en = 'Preparing Documents', message_local = 'กำลังเตรียมเอกสาร', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_STATUS_PREPARING_DOC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_STATUS_PREPARING_DOC', 'Preparing Documents', 'กำลังเตรียมเอกสาร', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_STATUS_PREPARING_DOC');

UPDATE su_message SET message_en = 'Confirmed', message_local = 'ยืนยันแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_STAT_CONFIRMED_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_STAT_CONFIRMED_SHORT', 'Confirmed', 'ยืนยันแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_STAT_CONFIRMED_SHORT');

UPDATE su_message SET message_en = 'Delivery Item', message_local = 'รายการส่งมอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT14_DEFAULT_ITEM_NAME';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT14_DEFAULT_ITEM_NAME', 'Delivery Item', 'รายการส่งมอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT14_DEFAULT_ITEM_NAME');

UPDATE su_message SET message_en = 'User Manuals', message_local = 'คู่มือการใช้งาน (User Manual)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_PAGE_TITLE', 'User Manuals', 'คู่มือการใช้งาน (User Manual)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_PAGE_TITLE');

UPDATE su_message SET message_en = 'System manuals, user guides, and operation documentation', message_local = 'คู่มือระบบ คู่มือผู้ใช้งาน และเอกสารการปฏิบัติการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_PAGE_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_PAGE_SUBTITLE', 'System manuals, user guides, and operation documentation', 'คู่มือระบบ คู่มือผู้ใช้งาน และเอกสารการปฏิบัติการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_PAGE_SUBTITLE');

UPDATE su_message SET message_en = 'manuals', message_local = 'เล่ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_ITEMS_SUFFIX', 'manuals', 'เล่ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'User Guide', message_local = 'คู่มือผู้ใช้ทั่วไป', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_USER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_USER', 'User Guide', 'คู่มือผู้ใช้ทั่วไป', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_USER');

UPDATE su_message SET message_en = 'Administrator Guide', message_local = 'คู่มือผู้ดูแลระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_ADMIN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_ADMIN', 'Administrator Guide', 'คู่มือผู้ดูแลระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_ADMIN');

UPDATE su_message SET message_en = 'Installation Guide', message_local = 'คู่มือการติดตั้งระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_INSTALLATION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_INSTALLATION', 'Installation Guide', 'คู่มือการติดตั้งระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_INSTALLATION');

UPDATE su_message SET message_en = 'Operation Manual', message_local = 'คู่มือการปฏิบัติการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_OPERATION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_OPERATION', 'Operation Manual', 'คู่มือการปฏิบัติการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_OPERATION');

UPDATE su_message SET message_en = 'Draft', message_local = 'ฉบับร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_STATUS_DRAFT', 'Draft', 'ฉบับร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_STATUS_DRAFT');

UPDATE su_message SET message_en = 'In Review', message_local = 'อยู่ระหว่างตรวจสอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_STATUS_REVIEW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_STATUS_REVIEW', 'In Review', 'อยู่ระหว่างตรวจสอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_STATUS_REVIEW');

UPDATE su_message SET message_en = 'Approved', message_local = 'อนุมัติแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_STATUS_APPROVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_STATUS_APPROVED', 'Approved', 'อนุมัติแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_STATUS_APPROVED');

UPDATE su_message SET message_en = 'Changed', message_local = 'เปลี่ยนแปลงแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_STATUS_CHANGED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_STATUS_CHANGED', 'Changed', 'เปลี่ยนแปลงแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_STATUS_CHANGED');

UPDATE su_message SET message_en = 'Published', message_local = 'เผยแพร่แล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_STATUS_PUBLISHED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_STATUS_PUBLISHED', 'Published', 'เผยแพร่แล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_STATUS_PUBLISHED');

UPDATE su_message SET message_en = 'Manual Code', message_local = 'รหัสคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_MANUAL_CODE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_MANUAL_CODE', 'Manual Code', 'รหัสคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_MANUAL_CODE');

UPDATE su_message SET message_en = 'Title', message_local = 'ชื่อคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_MANUAL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_MANUAL_TITLE', 'Title', 'ชื่อคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_MANUAL_TITLE');

UPDATE su_message SET message_en = 'Type', message_local = 'ประเภทคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_TYPE', 'Type', 'ประเภทคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_TYPE');

UPDATE su_message SET message_en = 'Version', message_local = 'เวอร์ชัน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_VERSION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_VERSION', 'Version', 'เวอร์ชัน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_VERSION');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_COL_ACTIONS');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Success', message_local = 'สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_SUCCESS_TITLE', 'Success', 'สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_ERROR_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_ERROR_TITLE');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_BACK_SIMPLE_TIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_BACK_SIMPLE_TIP', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_BACK_SIMPLE_TIP');

UPDATE su_message SET message_en = 'User Manual Details & Sections', message_local = 'รายละเอียดคู่มือและหมวดหมู่เนื้อหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_FORM_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_FORM_SUBTITLE', 'User Manual Details & Sections', 'รายละเอียดคู่มือและหมวดหมู่เนื้อหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_FORM_SUBTITLE');

UPDATE su_message SET message_en = 'Manual Information', message_local = 'ข้อมูลคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_INFO_SECTION_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_INFO_SECTION_TITLE', 'Manual Information', 'ข้อมูลคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_INFO_SECTION_TITLE');

UPDATE su_message SET message_en = 'e.g. UM-2026-001', message_local = 'เช่น UM-2026-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_CODE_PLACEHOLDER', 'e.g. UM-2026-001', 'เช่น UM-2026-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Manual Title', message_local = 'ชื่อคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TITLE_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TITLE_FIELD_LABEL', 'Manual Title', 'ชื่อคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TITLE_FIELD_LABEL');

UPDATE su_message SET message_en = 'Enter manual title', message_local = 'ระบุชื่อคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TITLE_PLACEHOLDER', 'Enter manual title', 'ระบุชื่อคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Manual Type', message_local = 'ประเภทคู่มือ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_FIELD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_FIELD_LABEL', 'Manual Type', 'ประเภทคู่มือ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_FIELD_LABEL');

UPDATE su_message SET message_en = 'Approval Flow', message_local = 'กระบวนการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_APPROVAL_FLOW_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_APPROVAL_FLOW_TITLE', 'Approval Flow', 'กระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_APPROVAL_FLOW_TITLE');

UPDATE su_message SET message_en = 'Select approval workflow for this manual', message_local = 'เลือกสายการอนุมัติสำหรับคู่มือนี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_APPROVAL_FLOW_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_APPROVAL_FLOW_DESC', 'Select approval workflow for this manual', 'เลือกสายการอนุมัติสำหรับคู่มือนี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_APPROVAL_FLOW_DESC');

UPDATE su_message SET message_en = 'Approval Process', message_local = 'กระบวนการอนุมัติคู่มือการใช้งาน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_APPROVAL_FLOW_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_APPROVAL_FLOW_LABEL', 'Approval Process', 'กระบวนการอนุมัติคู่มือการใช้งาน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_APPROVAL_FLOW_LABEL');

UPDATE su_message SET message_en = 'Select Approval Flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_SELECT_APPROVAL_FLOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_SELECT_APPROVAL_FLOW', 'Select Approval Flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_SELECT_APPROVAL_FLOW');

UPDATE su_message SET message_en = 'Paste AI content into form', message_local = 'นำเนื้อหาจาก AI ลงฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_PASTE_TO_FORM_LONG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_PASTE_TO_FORM_LONG', 'Paste AI content into form', 'นำเนื้อหาจาก AI ลงฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_PASTE_TO_FORM_LONG');

UPDATE su_message SET message_en = 'Manual:', message_local = 'คู่มือ:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_MANUAL_TITLE_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_MANUAL_TITLE_PREFIX', 'Manual:', 'คู่มือ:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_MANUAL_TITLE_PREFIX');

UPDATE su_message SET message_en = 'Sections:', message_local = 'จำนวนหมวด:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_SECTION_COUNT_PREFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_SECTION_COUNT_PREFIX', 'Sections:', 'จำนวนหมวด:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_SECTION_COUNT_PREFIX');

UPDATE su_message SET message_en = 'Paste', message_local = 'วางลงในฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_PASTE_TO_FORM_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_PASTE_TO_FORM_SHORT', 'Paste', 'วางลงในฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_PASTE_TO_FORM_SHORT');

UPDATE su_message SET message_en = 'Delete Draft History', message_local = 'ลบประวัติการร่าง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_DELETE_HISTORY_TIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_DELETE_HISTORY_TIP', 'Delete Draft History', 'ลบประวัติการร่าง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_DELETE_HISTORY_TIP');

UPDATE su_message SET message_en = 'User Guide', message_local = 'คู่มือสำหรับผู้ใช้งานทั่วไป', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_USER_A';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_USER_A', 'User Guide', 'คู่มือสำหรับผู้ใช้งานทั่วไป', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_USER_A');

UPDATE su_message SET message_en = 'Admin Guide', message_local = 'คู่มือสำหรับผู้ดูแลระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_ADMIN_A';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_ADMIN_A', 'Admin Guide', 'คู่มือสำหรับผู้ดูแลระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_ADMIN_A');

UPDATE su_message SET message_en = 'Installation Guide', message_local = 'คู่มือการติดตั้งระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_INSTALL_A';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_INSTALL_A', 'Installation Guide', 'คู่มือการติดตั้งระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_INSTALL_A');

UPDATE su_message SET message_en = 'Troubleshooting Guide', message_local = 'คู่มือการแก้ไขปัญหาเบื้องต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_TROUBLESHOOT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_TROUBLESHOOT', 'Troubleshooting Guide', 'คู่มือการแก้ไขปัญหาเบื้องต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_TROUBLESHOOT');

UPDATE su_message SET message_en = 'Step Type', message_local = 'ประเภทขั้นตอน', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT15_TYPE_STEP_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT15_TYPE_STEP_LABEL', 'Step Type', 'ประเภทขั้นตอน', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT15_TYPE_STEP_LABEL');

UPDATE su_message SET message_en = 'Unable to load invoice data', message_local = 'ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT16_LOAD_ERROR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT16_LOAD_ERROR', 'Unable to load invoice data', 'ไม่สามารถโหลดข้อมูลใบแจ้งหนี้ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT16_LOAD_ERROR');

UPDATE su_message SET message_en = 'Maintenance Tickets', message_local = 'รายการตั๋วแจ้งปัญหา MA', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PAGE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PAGE_TITLE', 'Maintenance Tickets', 'รายการตั๋วแจ้งปัญหา MA', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PAGE_TITLE');

UPDATE su_message SET message_en = 'tickets', message_local = 'ตั๋ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_ITEMS_SUFFIX';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_ITEMS_SUFFIX', 'tickets', 'ตั๋ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_ITEMS_SUFFIX');

UPDATE su_message SET message_en = 'Export to CSV', message_local = 'ส่งออกไฟล์ CSV', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EXPORT_CSV_TOOLTIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EXPORT_CSV_TOOLTIP', 'Export to CSV', 'ส่งออกไฟล์ CSV', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EXPORT_CSV_TOOLTIP');

UPDATE su_message SET message_en = 'Open', message_local = 'เปิดตั๋ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_OPEN';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_OPEN', 'Open', 'เปิดตั๋ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_OPEN');

UPDATE su_message SET message_en = 'In Progress', message_local = 'กำลังดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_IN_PROGRESS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_IN_PROGRESS');

UPDATE su_message SET message_en = 'Selected:', message_local = 'เลือก:', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SELECTED_COUNT_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SELECTED_COUNT_LABEL', 'Selected:', 'เลือก:', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SELECTED_COUNT_LABEL');

UPDATE su_message SET message_en = 'Export PDF', message_local = 'ส่งออก PDF', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EXPORT_PDF_ALL_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EXPORT_PDF_ALL_BUTTON', 'Export PDF', 'ส่งออก PDF', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EXPORT_PDF_ALL_BUTTON');

UPDATE su_message SET message_en = 'Clear Selection', message_local = 'ยกเลิกการเลือก', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_CANCEL_SELECTION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_CANCEL_SELECTION', 'Clear Selection', 'ยกเลิกการเลือก', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_CANCEL_SELECTION');

UPDATE su_message SET message_en = 'Ticket No.', message_local = 'เลขที่ Ticket', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_TICKET_NO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_TICKET_NO', 'Ticket No.', 'เลขที่ Ticket', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_TICKET_NO');

UPDATE su_message SET message_en = 'Issue Type', message_local = 'ประเภทปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_TYPE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_TYPE', 'Issue Type', 'ประเภทปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_TYPE');

UPDATE su_message SET message_en = 'Customer', message_local = 'ลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_LABEL_CUSTOMER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_LABEL_CUSTOMER', 'Customer', 'ลูกค้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_LABEL_CUSTOMER');

UPDATE su_message SET message_en = 'Project', message_local = 'โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_LABEL_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_LABEL_PROJECT', 'Project', 'โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_LABEL_PROJECT');

UPDATE su_message SET message_en = 'Assignee', message_local = 'ผู้รับผิดชอบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_ASSIGNED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_ASSIGNED', 'Assignee', 'ผู้รับผิดชอบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_ASSIGNED');

UPDATE su_message SET message_en = 'Duration', message_local = 'ระยะเวลา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_LABEL_DURATION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_LABEL_DURATION', 'Duration', 'ระยะเวลา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_LABEL_DURATION');

UPDATE su_message SET message_en = 'Print', message_local = 'พิมพ์', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PRINT_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PRINT_BUTTON', 'Print', 'พิมพ์', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PRINT_BUTTON');

UPDATE su_message SET message_en = 'Edit', message_local = 'แก้ไข', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EDIT_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EDIT_BUTTON', 'Edit', 'แก้ไข', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EDIT_BUTTON');

UPDATE su_message SET message_en = 'View Details', message_local = 'ดูรายละเอียด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_VIEW_FULL_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_VIEW_FULL_BUTTON', 'View Details', 'ดูรายละเอียด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_VIEW_FULL_BUTTON');

UPDATE su_message SET message_en = 'Title', message_local = 'หัวข้อปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_TITLE', 'Title', 'หัวข้อปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_TITLE');

UPDATE su_message SET message_en = 'Customer / Project', message_local = 'ลูกค้า / โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_CUSTOMER_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_CUSTOMER_PROJECT', 'Customer / Project', 'ลูกค้า / โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_CUSTOMER_PROJECT');

UPDATE su_message SET message_en = 'Severity', message_local = 'ระดับความรุนแรง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_SEVERITY';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_SEVERITY', 'Severity', 'ระดับความรุนแรง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_SEVERITY');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_COL_ACTIONS');

UPDATE su_message SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_ERROR_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_ERROR_TITLE');

UPDATE su_message SET message_en = 'Waiting for Customer', message_local = 'รอลูกค้าตอบกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_WAITING_CUSTOMER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_WAITING_CUSTOMER', 'Waiting for Customer', 'รอลูกค้าตอบกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_WAITING_CUSTOMER');

UPDATE su_message SET message_en = 'Resolved', message_local = 'แก้ไขแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_RESOLVED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_RESOLVED', 'Resolved', 'แก้ไขแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_RESOLVED');

UPDATE su_message SET message_en = 'Changed', message_local = 'เปลี่ยนแปลงแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_CHANGED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_CHANGED', 'Changed', 'เปลี่ยนแปลงแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_CHANGED');

UPDATE su_message SET message_en = 'Closed', message_local = 'ปิดตั๋วแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_CLOSED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_CLOSED', 'Closed', 'ปิดตั๋วแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_CLOSED');

UPDATE su_message SET message_en = 'Export Failed', message_local = 'ส่งออกไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EXPORT_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EXPORT_FAILED_TITLE', 'Export Failed', 'ส่งออกไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EXPORT_FAILED_TITLE');

UPDATE su_message SET message_en = 'Unable to export ticket data', message_local = 'ไม่สามารถส่งออกข้อมูลตั๋วได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EXPORT_TICKET_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EXPORT_TICKET_FAILED_MSG', 'Unable to export ticket data', 'ไม่สามารถส่งออกข้อมูลตั๋วได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EXPORT_TICKET_FAILED_MSG');

UPDATE su_message SET message_en = 'Unable to export ticket list', message_local = 'ไม่สามารถส่งออกรายการตั๋วได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EXPORT_LIST_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EXPORT_LIST_FAILED_MSG', 'Unable to export ticket list', 'ไม่สามารถส่งออกรายการตั๋วได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EXPORT_LIST_FAILED_MSG');

UPDATE su_message SET message_en = 'Print Failed', message_local = 'พิมพ์เอกสารไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PRINT_DOC_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PRINT_DOC_FAILED_TITLE', 'Print Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PRINT_DOC_FAILED_TITLE');

UPDATE su_message SET message_en = 'Unable to generate Jasper report', message_local = 'ไม่สามารถสร้างรายงาน PDF ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_JASPER_REPORT_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_JASPER_REPORT_FAILED_MSG', 'Unable to generate Jasper report', 'ไม่สามารถสร้างรายงาน PDF ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_JASPER_REPORT_FAILED_MSG');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Do you want to delete this MA ticket?', message_local = 'คุณต้องการลบตั๋วแจ้งปัญหานี้ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_CONFIRM_DELETE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_CONFIRM_DELETE_MSG', 'Do you want to delete this MA ticket?', 'คุณต้องการลบตั๋วแจ้งปัญหานี้ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_CONFIRM_DELETE_MSG');

UPDATE su_message SET message_en = 'Success', message_local = 'สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SUCCESS_TITLE', 'Success', 'สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Back', message_local = 'ย้อนกลับ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_BACK_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_BACK_LABEL', 'Back', 'ย้อนกลับ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_BACK_LABEL');

UPDATE su_message SET message_en = 'Ticket Details', message_local = 'รายละเอียดตั๋ว MA', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_VIEW_TICKET_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_VIEW_TICKET_TITLE', 'Ticket Details', 'รายละเอียดตั๋ว MA', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_VIEW_TICKET_TITLE');

UPDATE su_message SET message_en = 'Manage maintenance support requests and service levels', message_local = 'จัดการรายการแจ้งปัญหาและการบำรุงรักษาระบบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PAGE_SUBTITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PAGE_SUBTITLE', 'Manage maintenance support requests and service levels', 'จัดการรายการแจ้งปัญหาและการบำรุงรักษาระบบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PAGE_SUBTITLE');

UPDATE su_message SET message_en = 'Ticket No.', message_local = 'เลขที่ Ticket', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TICKET_NO_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TICKET_NO_LABEL', 'Ticket No.', 'เลขที่ Ticket', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TICKET_NO_LABEL');

UPDATE su_message SET message_en = 'General Information', message_local = 'ข้อมูลทั่วไปของตั๋ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SECTION_GENERAL_INFO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SECTION_GENERAL_INFO', 'General Information', 'ข้อมูลทั่วไปของตั๋ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SECTION_GENERAL_INFO');

UPDATE su_message SET message_en = 'Ticket Code', message_local = 'รหัส Ticket', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TICKET_CODE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TICKET_CODE_LABEL', 'Ticket Code', 'รหัส Ticket', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TICKET_CODE_LABEL');

UPDATE su_message SET message_en = 'e.g. TKT-2026-001', message_local = 'เช่น TKT-2026-001', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TICKET_CODE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TICKET_CODE_PLACEHOLDER', 'e.g. TKT-2026-001', 'เช่น TKT-2026-001', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TICKET_CODE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Issue Type', message_local = 'ประเภทปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_ISSUE_TYPE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_ISSUE_TYPE_LABEL', 'Issue Type', 'ประเภทปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_ISSUE_TYPE_LABEL');

UPDATE su_message SET message_en = 'Schedule & Timing', message_local = 'กำหนดเวลาดำเนินการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SECTION_SCHEDULE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SECTION_SCHEDULE', 'Schedule & Timing', 'กำหนดเวลาดำเนินการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SECTION_SCHEDULE');

UPDATE su_message SET message_en = 'Start Date', message_local = 'วันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_START_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_START_DATE_LABEL', 'Start Date', 'วันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_START_DATE_LABEL');

UPDATE su_message SET message_en = 'Select start date', message_local = 'เลือกวันที่เริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_START_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_START_DATE_PLACEHOLDER', 'Select start date', 'เลือกวันที่เริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_START_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Start Time', message_local = 'เวลาเริ่มต้น', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_START_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_START_TIME_LABEL', 'Start Time', 'เวลาเริ่มต้น', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_START_TIME_LABEL');

UPDATE su_message SET message_en = 'Select time', message_local = 'เลือกเวลา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SELECT_TIME_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SELECT_TIME_PLACEHOLDER', 'Select time', 'เลือกเวลา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SELECT_TIME_PLACEHOLDER');

UPDATE su_message SET message_en = 'End Date', message_local = 'วันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_END_DATE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_END_DATE_LABEL', 'End Date', 'วันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_END_DATE_LABEL');

UPDATE su_message SET message_en = 'Select end date', message_local = 'เลือกวันที่สิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_END_DATE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_END_DATE_PLACEHOLDER', 'Select end date', 'เลือกวันที่สิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_END_DATE_PLACEHOLDER');

UPDATE su_message SET message_en = 'End Time', message_local = 'เวลาสิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_END_TIME_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_END_TIME_LABEL', 'End Time', 'เวลาสิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_END_TIME_LABEL');

UPDATE su_message SET message_en = 'Enter issue title', message_local = 'ระบุหัวข้อปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TITLE_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TITLE_PLACEHOLDER', 'Enter issue title', 'ระบุหัวข้อปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TITLE_PLACEHOLDER');

UPDATE su_message SET message_en = 'Describe symptoms, impact, and reproduction steps...', message_local = 'ระบุอาการ สาเหตุ และขั้นตอนที่เกิดปัญหา...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_DESC_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_DESC_PLACEHOLDER', 'Describe symptoms, impact, and reproduction steps...', 'ระบุอาการ สาเหตุ และขั้นตอนที่เกิดปัญหา...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_DESC_PLACEHOLDER');

UPDATE su_message SET message_en = 'Resolution & Root Cause', message_local = 'สรุปการแก้ไขปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SECTION_RESOLUTION';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SECTION_RESOLUTION', 'Resolution & Root Cause', 'สรุปการแก้ไขปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SECTION_RESOLUTION');

UPDATE su_message SET message_en = 'Resolution Method', message_local = 'วิธีแก้ไขปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_RESOLUTION_METHOD_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_RESOLUTION_METHOD_LABEL', 'Resolution Method', 'วิธีแก้ไขปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_RESOLUTION_METHOD_LABEL');

UPDATE su_message SET message_en = 'Describe how the issue was resolved...', message_local = 'ระบุแนวทางและวิธีการแก้ไขปัญหา...', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_RESOLUTION_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_RESOLUTION_PLACEHOLDER', 'Describe how the issue was resolved...', 'ระบุแนวทางและวิธีการแก้ไขปัญหา...', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_RESOLUTION_PLACEHOLDER');

UPDATE su_message SET message_en = 'Approval Process', message_local = 'กระบวนการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SECTION_APPROVAL_PROCESS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SECTION_APPROVAL_PROCESS', 'Approval Process', 'กระบวนการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SECTION_APPROVAL_PROCESS');

UPDATE su_message SET message_en = 'Select approval flow for closing this ticket', message_local = 'เลือกสายการอนุมัติสำหรับการปิดตั๋วนี้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_APPROVAL_PROCESS_DESC';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_APPROVAL_PROCESS_DESC', 'Select approval flow for closing this ticket', 'เลือกสายการอนุมัติสำหรับการปิดตั๋วนี้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_APPROVAL_PROCESS_DESC');

UPDATE su_message SET message_en = 'Select Approval Flow', message_local = 'เลือกสายการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SELECT_APPROVAL_FLOW_PLACEHOLDER';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SELECT_APPROVAL_FLOW_PLACEHOLDER', 'Select Approval Flow', 'เลือกสายการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SELECT_APPROVAL_FLOW_PLACEHOLDER');

UPDATE su_message SET message_en = 'Request Change', message_local = 'ขอเปลี่ยนแปลง (CR)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_REQUEST_CHANGE_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_REQUEST_CHANGE_BUTTON', 'Request Change', 'ขอเปลี่ยนแปลง (CR)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_REQUEST_CHANGE_BUTTON');

UPDATE su_message SET message_en = 'Edit Ticket', message_local = 'แก้ไขข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_EDIT_DATA_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_EDIT_DATA_BUTTON', 'Edit Ticket', 'แก้ไขข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_EDIT_DATA_BUTTON');

UPDATE su_message SET message_en = 'Save Ticket', message_local = 'บันทึกข้อมูล', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SAVE_DATA_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SAVE_DATA_BUTTON', 'Save Ticket', 'บันทึกข้อมูล', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SAVE_DATA_BUTTON');

UPDATE su_message SET message_en = 'Paste AI Content', message_local = 'นำเนื้อหาจาก AI ลงฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PASTE_TO_FORM_BUTTON';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PASTE_TO_FORM_BUTTON', 'Paste AI Content', 'นำเนื้อหาจาก AI ลงฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PASTE_TO_FORM_BUTTON');

UPDATE su_message SET message_en = 'Issue Title', message_local = 'หัวข้อปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_FIELD_TITLE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_FIELD_TITLE_LABEL', 'Issue Title', 'หัวข้อปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_FIELD_TITLE_LABEL');

UPDATE su_message SET message_en = 'Root Cause', message_local = 'สาเหตุของปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_FIELD_CAUSE_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_FIELD_CAUSE_LABEL', 'Root Cause', 'สาเหตุของปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_FIELD_CAUSE_LABEL');

UPDATE su_message SET message_en = 'Resolution Steps', message_local = 'วิธีแก้ไขปัญหา', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_FIELD_RESOLUTION_LABEL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_FIELD_RESOLUTION_LABEL', 'Resolution Steps', 'วิธีแก้ไขปัญหา', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_FIELD_RESOLUTION_LABEL');

UPDATE su_message SET message_en = 'Paste', message_local = 'วางลงในฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PASTE_TO_FORM_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PASTE_TO_FORM_SHORT', 'Paste', 'วางลงในฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PASTE_TO_FORM_SHORT');

UPDATE su_message SET message_en = 'Delete History', message_local = 'ลบประวัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_DELETE_HISTORY_TOOLTIP';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_DELETE_HISTORY_TOOLTIP', 'Delete History', 'ลบประวัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_DELETE_HISTORY_TOOLTIP');

UPDATE su_message SET message_en = 'Bug / Defect Fix', message_local = 'แจ้งปัญหาระบบ (Bug)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TYPE_BUG_SUPPORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TYPE_BUG_SUPPORT', 'Bug / Defect Fix', 'แจ้งปัญหาระบบ (Bug)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TYPE_BUG_SUPPORT');

UPDATE su_message SET message_en = 'Data Correction Issue', message_local = 'ปัญหาข้อมูลไม่ถูกต้อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TYPE_DATA_ISSUE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TYPE_DATA_ISSUE', 'Data Correction Issue', 'ปัญหาข้อมูลไม่ถูกต้อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TYPE_DATA_ISSUE');

UPDATE su_message SET message_en = 'User Inquiry / Support', message_local = 'สอบถามการใช้งานทั่วไป', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TYPE_USER_SUPPORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TYPE_USER_SUPPORT', 'User Inquiry / Support', 'สอบถามการใช้งานทั่วไป', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TYPE_USER_SUPPORT');

UPDATE su_message SET message_en = 'Change Request (CR)', message_local = 'ขอปรับปรุงระบบ (Change Request)', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_TYPE_CHANGE_REQUEST';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_TYPE_CHANGE_REQUEST', 'Change Request (CR)', 'ขอปรับปรุงระบบ (Change Request)', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_TYPE_CHANGE_REQUEST');

UPDATE su_message SET message_en = 'Low Severity', message_local = 'ความรุนแรงต่ำ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SEV_LOW';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SEV_LOW', 'Low Severity', 'ความรุนแรงต่ำ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SEV_LOW');

UPDATE su_message SET message_en = 'Medium Severity', message_local = 'ความรุนแรงปานกลาง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SEV_MEDIUM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SEV_MEDIUM', 'Medium Severity', 'ความรุนแรงปานกลาง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SEV_MEDIUM');

UPDATE su_message SET message_en = 'High Severity', message_local = 'ความรุนแรงสูง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SEV_HIGH';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SEV_HIGH', 'High Severity', 'ความรุนแรงสูง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SEV_HIGH');

UPDATE su_message SET message_en = 'Critical Severity', message_local = 'ความรุนแรงวิกฤต', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_SEV_CRITICAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_SEV_CRITICAL', 'Critical Severity', 'ความรุนแรงวิกฤต', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_SEV_CRITICAL');

UPDATE su_message SET message_en = 'Open / Intake', message_local = 'เปิดตั๋ว / รับเรื่อง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_OPEN_INTAKE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_OPEN_INTAKE', 'Open / Intake', 'เปิดตั๋ว / รับเรื่อง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_OPEN_INTAKE');

UPDATE su_message SET message_en = 'Waiting Customer', message_local = 'รอลูกค้า', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_WAITING_CUST_SHORT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_WAITING_CUST_SHORT', 'Waiting Customer', 'รอลูกค้า', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_WAITING_CUST_SHORT');

UPDATE su_message SET message_en = 'Resolved', message_local = 'แก้ไขแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_RESOLVED_DONE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_RESOLVED_DONE', 'Resolved', 'แก้ไขแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_RESOLVED_DONE');

UPDATE su_message SET message_en = 'Closed', message_local = 'ปิดงานแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_STATUS_CLOSED_WORK';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_STATUS_CLOSED_WORK', 'Closed', 'ปิดงานแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_STATUS_CLOSED_WORK');

UPDATE su_message SET message_en = 'Cannot Perform Action', message_local = 'ไม่สามารถดำเนินการได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_CANNOT_PERFORM_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_CANNOT_PERFORM_TITLE', 'Cannot Perform Action', 'ไม่สามารถดำเนินการได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_CANNOT_PERFORM_TITLE');

UPDATE su_message SET message_en = 'This ticket is view-only or locked', message_local = 'ตั๋วนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_DOC_VIEW_LOCKED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_DOC_VIEW_LOCKED_MSG', 'This ticket is view-only or locked', 'ตั๋วนี้อยู่ในโหมดดูข้อมูลหรือถูกล็อคแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_DOC_VIEW_LOCKED_MSG');

UPDATE su_message SET message_en = 'AI Draft Generated', message_local = 'สร้างเนื้อหา AI สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_AI_GENERATE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_AI_GENERATE_SUCCESS_TITLE', 'AI Draft Generated', 'สร้างเนื้อหา AI สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_AI_GENERATE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'AI draft has been applied to the form', message_local = 'นำเนื้อหาที่ AI สร้างลงฟอร์มเรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_AI_DRAFT_APPLIED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_AI_DRAFT_APPLIED_MSG', 'AI draft has been applied to the form', 'นำเนื้อหาที่ AI สร้างลงฟอร์มเรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_AI_DRAFT_APPLIED_MSG');

UPDATE su_message SET message_en = 'Unable to generate content with AI', message_local = 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_AI_CONTENT_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_AI_CONTENT_FAILED_MSG', 'Unable to generate content with AI', 'ไม่สามารถสร้างเนื้อหาด้วย AI ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_AI_CONTENT_FAILED_MSG');

UPDATE su_message SET message_en = 'No content available to paste', message_local = 'ไม่มีข้อมูลสำหรับวางลงฟอร์ม', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_NO_PASTE_DATA_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_NO_PASTE_DATA_MSG', 'No content available to paste', 'ไม่มีข้อมูลสำหรับวางลงฟอร์ม', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_NO_PASTE_DATA_MSG');

UPDATE su_message SET message_en = 'Pasted Successfully', message_local = 'นำข้อมูลลงฟอร์มเรียบร้อย', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PASTE_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PASTE_SUCCESS_TITLE', 'Pasted Successfully', 'นำข้อมูลลงฟอร์มเรียบร้อย', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PASTE_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Form fields updated from AI content', message_local = 'อัปเดตฟิลด์ในฟอร์มด้วยข้อมูลจาก AI เรียบร้อยแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT17_PASTE_SUCCESS_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT17_PASTE_SUCCESS_MSG', 'Form fields updated from AI content', 'อัปเดตฟิลด์ในฟอร์มด้วยข้อมูลจาก AI เรียบร้อยแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT17_PASTE_SUCCESS_MSG');

UPDATE su_message SET message_en = 'Proposal No.', message_local = 'เลขที่ข้อเสนอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_RENEWAL_NO';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_RENEWAL_NO', 'Proposal No.', 'เลขที่ข้อเสนอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_RENEWAL_NO');

UPDATE su_message SET message_en = 'Contract Reference', message_local = 'สัญญาเดิมอ้างอิง', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_CONTRACT_REF';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_CONTRACT_REF', 'Contract Reference', 'สัญญาเดิมอ้างอิง', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_CONTRACT_REF');

UPDATE su_message SET message_en = 'Customer / Project', message_local = 'ลูกค้า / โครงการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_CUSTOMER_PROJECT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_CUSTOMER_PROJECT', 'Customer / Project', 'ลูกค้า / โครงการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_CUSTOMER_PROJECT');

UPDATE su_message SET message_en = 'New Term Period', message_local = 'ระยะเวลาต่ออายุ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_NEW_TERM';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_NEW_TERM', 'New Term Period', 'ระยะเวลาต่ออายุ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_NEW_TERM');

UPDATE su_message SET message_en = 'Proposed Amount', message_local = 'มูลค่าข้อเสนอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_PROPOSED_AMOUNT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_PROPOSED_AMOUNT', 'Proposed Amount', 'มูลค่าข้อเสนอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_PROPOSED_AMOUNT');

UPDATE su_message SET message_en = 'Status', message_local = 'สถานะ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_STATUS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_STATUS', 'Status', 'สถานะ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_STATUS');

UPDATE su_message SET message_en = 'Approval Status', message_local = 'สถานะการอนุมัติ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_APPROVAL';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_APPROVAL', 'Approval Status', 'สถานะการอนุมัติ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_APPROVAL');

UPDATE su_message SET message_en = 'Actions', message_local = 'จัดการ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_COL_ACTIONS';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_COL_ACTIONS', 'Actions', 'จัดการ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_COL_ACTIONS');

UPDATE su_message SET message_en = 'Unable to load MA renewal data', message_local = 'ไม่สามารถโหลดข้อมูลการต่ออายุสัญญา MA ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_LOAD_ERROR';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_LOAD_ERROR', 'Unable to load MA renewal data', 'ไม่สามารถโหลดข้อมูลการต่ออายุสัญญา MA ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_LOAD_ERROR');

UPDATE su_message SET message_en = 'Draft Proposal', message_local = 'ร่างข้อเสนอ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_STATUS_DRAFT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_STATUS_DRAFT', 'Draft Proposal', 'ร่างข้อเสนอ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_STATUS_DRAFT');

UPDATE su_message SET message_en = 'Proposed to Customer', message_local = 'เสนอราคาแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_STATUS_PROPOSED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_STATUS_PROPOSED', 'Proposed to Customer', 'เสนอราคาแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_STATUS_PROPOSED');

UPDATE su_message SET message_en = 'Confirmed / Signed', message_local = 'ลูกค้ายืนยันแล้ว', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_STATUS_CONFIRMED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_STATUS_CONFIRMED', 'Confirmed / Signed', 'ลูกค้ายืนยันแล้ว', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_STATUS_CONFIRMED');

UPDATE su_message SET message_en = 'Rejected by Customer', message_local = 'ลูกค้าปฏิเสธ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_STATUS_REJECTED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_STATUS_REJECTED', 'Rejected by Customer', 'ลูกค้าปฏิเสธ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_STATUS_REJECTED');

UPDATE su_message SET message_en = 'Proposal Expired', message_local = 'ข้อเสนอหมดอายุ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_STATUS_EXPIRED';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_STATUS_EXPIRED', 'Proposal Expired', 'ข้อเสนอหมดอายุ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_STATUS_EXPIRED');

UPDATE su_message SET message_en = 'Contract Expired', message_local = 'สัญญาเดิมสิ้นสุด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_STATUS_EXPIRED_CONTRACT';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_STATUS_EXPIRED_CONTRACT', 'Contract Expired', 'สัญญาเดิมสิ้นสุด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_STATUS_EXPIRED_CONTRACT');

UPDATE su_message SET message_en = 'Export Failed', message_local = 'พิมพ์เอกสารไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_PRINT_DOC_FAILED_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_PRINT_DOC_FAILED_TITLE', 'Export Failed', 'พิมพ์เอกสารไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_PRINT_DOC_FAILED_TITLE');

UPDATE su_message SET message_en = 'Unable to generate MA proposal PDF', message_local = 'ไม่สามารถสร้างรายงาน PDF ข้อเสนอต่ออายุ MA ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_JASPER_REPORT_FAILED_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_JASPER_REPORT_FAILED_MSG', 'Unable to generate MA proposal PDF', 'ไม่สามารถสร้างรายงาน PDF ข้อเสนอต่ออายุ MA ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_JASPER_REPORT_FAILED_MSG');

UPDATE su_message SET message_en = 'Confirm Deletion', message_local = 'ยืนยันการลบ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_CONFIRM_DELETE_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_CONFIRM_DELETE_TITLE', 'Confirm Deletion', 'ยืนยันการลบ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_CONFIRM_DELETE_TITLE');

UPDATE su_message SET message_en = 'Do you want to delete this renewal proposal?', message_local = 'คุณต้องการลบข้อเสนอต่ออายุสัญญานี้ใช่หรือไม่?', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_CONFIRM_DELETE_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_CONFIRM_DELETE_MSG', 'Do you want to delete this renewal proposal?', 'คุณต้องการลบข้อเสนอต่ออายุสัญญานี้ใช่หรือไม่?', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_CONFIRM_DELETE_MSG');

UPDATE su_message SET message_en = 'Success', message_local = 'สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_SUCCESS_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_SUCCESS_TITLE', 'Success', 'สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_SUCCESS_TITLE');

UPDATE su_message SET message_en = 'Error', message_local = 'เกิดข้อผิดพลาด', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18_ERROR_TITLE', 'Error', 'เกิดข้อผิดพลาด', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18_ERROR_TITLE');

UPDATE su_message SET message_en = 'Unable to load MA proposal form', message_local = 'ไม่สามารถโหลดฟอร์มข้อเสนอ MA ได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18A_LOAD_ERROR_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18A_LOAD_ERROR_MSG', 'Unable to load MA proposal form', 'ไม่สามารถโหลดฟอร์มข้อเสนอ MA ได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18A_LOAD_ERROR_MSG');

UPDATE su_message SET message_en = 'Load Failed', message_local = 'โหลดข้อมูลไม่สำเร็จ', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT18A_LOAD_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT18A_LOAD_ERROR_TITLE', 'Load Failed', 'โหลดข้อมูลไม่สำเร็จ', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT18A_LOAD_ERROR_TITLE');

UPDATE su_message SET message_en = 'Unable to load audit log', message_local = 'ไม่สามารถโหลดประวัติการทำงานได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'PMDT20_LOAD_ERROR_TITLE';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT20_LOAD_ERROR_TITLE', 'Unable to load audit log', 'ไม่สามารถโหลดประวัติการทำงานได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT20_LOAD_ERROR_TITLE');

UPDATE su_message SET message_en = 'Unable to load business invitation data', message_local = 'ไม่สามารถโหลดข้อมูลคำเชิญเข้าร่วมธุรกิจได้', updated_by = 'system', updated_date = NOW() WHERE message_code = 'BUSINESS_INVITE_LOAD_FAIL_MSG';
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete) SELECT gen_random_uuid(), 'COMMON', 'ALL', 'BUSINESS_INVITE_LOAD_FAIL_MSG', 'Unable to load business invitation data', 'ไม่สามารถโหลดข้อมูลคำเชิญเข้าร่วมธุรกิจได้', 'system', NOW(), 'system', NOW(), false WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'BUSINESS_INVITE_LOAD_FAIL_MSG');

