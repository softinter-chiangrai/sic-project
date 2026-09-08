-- ==============================================================================
-- Migration: V20260827174500__sync_all_program_routes_and_workspace.sql
-- Description: อัปเดต route_path ทุกหน้าให้ตรงกับ Frontend (BU & PM)
--              พร้อมเพิ่มหน้า Workspace ทั้งหมดให้ครบตามระบบ
-- ==============================================================================

-- 1. อัปเดต/สร้าง Category & Module Headers (Root / Parent Programs)
INSERT INTO su_program (id, program_code, icon, name_en, name_local, route_path, sort_order, is_active, is_delete, created_by, created_date, updated_by, updated_date)
VALUES
    ('019eb052-cb86-76e1-b193-aa7c049709c2', 'BU', 'bi bi-building', 'Business', 'ธุรกิจ', NULL, 10, true, false, 'system', NOW(), 'system', NOW()),
    ('1542d19f-b9a9-4e24-a65f-e57dbca4e783', 'PM', 'bi bi-kanban', 'Project Management', 'ระบบบริหารโครงการ', NULL, 20, true, false, 'system', NOW(), 'system', NOW())
ON CONFLICT (id) DO UPDATE SET
    program_code = EXCLUDED.program_code,
    icon = EXCLUDED.icon,
    name_en = EXCLUDED.name_en,
    name_local = EXCLUDED.name_local,
    route_path = EXCLUDED.route_path,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

INSERT INTO su_program (id, parent_program_id, program_code, icon, name_en, name_local, route_path, sort_order, is_active, is_delete, created_by, created_date, updated_by, updated_date)
VALUES
    ('019eb052-e6bc-7d6c-b099-d9b7e8e2625a', '019eb052-cb86-76e1-b193-aa7c049709c2', 'BURT', 'bi bi-gear', 'Setting', 'ตั้งค่า', NULL, 10, true, false, 'system', NOW(), 'system', NOW()),
    ('019eb054-c2a5-7461-be43-070fefbcefac', '019eb052-cb86-76e1-b193-aa7c049709c2', 'BURP', 'bi bi-activity', 'Activity', 'กิจกรรม', NULL, 20, true, false, 'system', NOW(), 'system', NOW()),
    ('b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', '1542d19f-b9a9-4e24-a65f-e57dbca4e783', 'PMRT', 'bi bi-person-gear', 'Master Data', 'ข้อมูลหลัก', NULL, 10, true, false, 'system', NOW(), 'system', NOW()),
    ('2521a502-bfaa-4385-8e94-d255d0fcba6b', '1542d19f-b9a9-4e24-a65f-e57dbca4e783', 'PMDT', 'bi bi-briefcase', 'Project Workspace', 'งานในโครงการ', NULL, 20, true, false, 'system', NOW(), 'system', NOW())
ON CONFLICT (id) DO UPDATE SET
    parent_program_id = EXCLUDED.parent_program_id,
    program_code = EXCLUDED.program_code,
    icon = EXCLUDED.icon,
    name_en = EXCLUDED.name_en,
    name_local = EXCLUDED.name_local,
    route_path = EXCLUDED.route_path,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 2. ข้อมูลโปรแกรม Business (BU) - ใช้ชื่อจริง (info, permission, role, team, program, approval-flow, activity-log)
INSERT INTO su_program (id, parent_program_id, program_code, icon, name_en, name_local, route_path, sort_order, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete, created_by, created_date, updated_by, updated_date)
VALUES
    ('019eb053-57ff-7647-a61e-55b24dd1f19c', '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT01', 'bi bi-diagram-2', 'Business Information', 'ข้อมูลทางธุรกิจ', 'bu/info', 10, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('019eb053-9560-7395-9afe-539cdb0cb5cb', '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT02', 'bi bi-menu-button-wide-fill', 'Permission Management', 'จัดการสิทธิ์', 'bu/permission', 20, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('019eb053-7344-754a-ad1a-4a3bf3f8df67', '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT03', 'bi bi-diagram-2', 'Role Management', 'จัดการบทบาท', 'bu/role', 30, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('019eb053-ab89-7cd0-a5e4-672ceee3ec14', '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT04', 'bi bi-people', 'Team Management', 'จัดการทีม', 'bu/team', 40, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('8620e2c1-07bf-4229-8ec9-c5447932a3bc', '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT05', 'bi bi-cpu', 'Program Management', 'จัดการโปรแกรม', 'bu/program', 50, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('46e5fd71-3ff7-4454-ab4f-02e6f18dfb57', '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT06', 'bi bi-check-circle-fill', 'Approval Flow Management', 'การจัดการกระบวนการอนุมัติ', 'bu/approval-flow', 60, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('019eb064-cd43-7f87-b6af-8be582607f2f', '019eb054-c2a5-7461-be43-070fefbcefac', 'BURP01', 'bi bi-hourglass', 'Activity Log', 'ประวัติกิจกรรม', 'bu/activity-log', 10, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW())
ON CONFLICT (id) DO UPDATE SET
    parent_program_id = EXCLUDED.parent_program_id,
    program_code = EXCLUDED.program_code,
    icon = EXCLUDED.icon,
    name_en = EXCLUDED.name_en,
    name_local = EXCLUDED.name_local,
    route_path = EXCLUDED.route_path,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    is_add = EXCLUDED.is_add,
    is_back = EXCLUDED.is_back,
    is_print = EXCLUDED.is_print,
    is_remove = EXCLUDED.is_remove,
    is_save = EXCLUDED.is_save,
    is_search = EXCLUDED.is_search,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 3. ข้อมูลโปรแกรม PM Master Data (PMRT)
INSERT INTO su_program (id, parent_program_id, program_code, icon, name_en, name_local, route_path, sort_order, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete, created_by, created_date, updated_by, updated_date)
VALUES
    ('2e7086c0-7409-41cf-b13a-2f829fed2658', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT01', 'bi bi-file-earmark-person-fill', 'Customer Information', 'ข้อมูลลูกค้า', 'pm/customer', 10, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('509fad4d-e52f-40e9-a92a-084ac16e3431', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT02', 'bi bi-kanban', 'Project Management', 'โครงการ', 'pm/project', 20, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('df51adc8-d31e-49a2-a86a-bd2d34dfa86f', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT03', 'bi bi-speedometer2', 'Project Dashboard', 'แดชบอร์ดโครงการ', 'pm/project-dashboard', 30, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('a0000004-0000-0000-0000-000000000004', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT04', 'bi bi-file-earmark-text', 'Contract Management', 'สัญญาและข้อตกลง', 'pm/contract', 40, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('a0000005-0000-0000-0000-000000000005', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT05', 'bi bi-grid-3x3', 'Traceability Matrix', 'เมทริกซ์ความต้องการ', 'pm/matrix', 50, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('a0000006-0000-0000-0000-000000000006', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT06', 'bi bi-graph-up', 'Executive Dashboard', 'แดชบอร์ดผู้บริหาร', 'pm/executive-dashboard', 60, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('a0000007-0000-0000-0000-000000000007', 'b6951d24-02a1-48dd-b8a9-53ec8b5df5f4', 'PMRT07', 'bi bi-bell', 'Notification Center', 'ศูนย์การแจ้งเตือน', 'pm/notifications', 70, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW())
ON CONFLICT (id) DO UPDATE SET
    parent_program_id = EXCLUDED.parent_program_id,
    program_code = EXCLUDED.program_code,
    icon = EXCLUDED.icon,
    name_en = EXCLUDED.name_en,
    name_local = EXCLUDED.name_local,
    route_path = EXCLUDED.route_path,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    is_add = EXCLUDED.is_add,
    is_back = EXCLUDED.is_back,
    is_print = EXCLUDED.is_print,
    is_remove = EXCLUDED.is_remove,
    is_save = EXCLUDED.is_save,
    is_search = EXCLUDED.is_search,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 4. ข้อมูลโปรแกรม PM Project Workspace (PMDT)
INSERT INTO su_program (id, parent_program_id, program_code, icon, name_en, name_local, route_path, sort_order, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete, created_by, created_date, updated_by, updated_date)
VALUES
    ('83344b3f-b6ec-4e8e-b2fe-d53a4ec875a1', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT01', 'bi bi-layer-forward', 'Phase Management', 'การจัดการเฟส', 'pm/phase', 10, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('a66e0233-e139-41ff-92ba-771a5c4050da', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT02', 'bi bi-diagram-3', 'WBS & Phase Detail', 'รายละเอียดเฟสและโครงสร้างงาน', 'pm/phase', 20, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('ff92cdf6-cb22-4cef-bbb3-a54a7cdc36ea', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT03', 'bi bi-check-square-fill', 'Approval Center', 'ศูนย์การอนุมัติ', 'pm/approval', 30, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('7b9d208a-e8a4-461b-a163-ba58076d1ef6', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT04', 'bi bi-list-check', 'Requirement Management', 'ความต้องการระบบ', 'pm/requirement', 40, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000005-0000-0000-0000-000000000005', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT05', 'bi bi-diagram-2', 'Diagram Management', 'แผนภาพระบบ', 'pm/diagram', 50, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000006-0000-0000-0000-000000000006', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT06', 'bi bi-arrow-left-right', 'Requirement Change Control', 'ควบคุมการเปลี่ยนแปลง (CR)', 'pm/change-request', 60, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000007-0000-0000-0000-000000000007', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT07', 'bi bi-file-earmark-code', 'Specification Management', 'ข้อกำหนดระบบ', 'pm/specification', 70, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('c8dab5bc-aaa6-4f4d-86db-02e0a7dce56b', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT08', 'bi bi-chat-dots', 'Discussion Management', 'ศูนย์รวมความคิดเห็น', 'pm/discussion', 80, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000009-0000-0000-0000-000000000009', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT09', 'bi bi-clipboard-check', 'Design Review', 'การตรวจทานการออกแบบ', 'pm/design-review', 90, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000010-0000-0000-0000-000000000010', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT10', 'bi bi-card-checklist', 'Task Management', 'จัดการงานและบอร์ดงาน', 'pm/task-board', 100, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000011-0000-0000-0000-000000000011', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT11', 'bi bi-bar-chart-steps', 'Gantt Schedule', 'ตารางเวลาแกนต์', 'pm/gantt', 110, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000012-0000-0000-0000-000000000012', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT12', 'bi bi-shield-check', 'Test Management', 'การทดสอบระบบ', 'pm/test-management', 120, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000013-0000-0000-0000-000000000013', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT13', 'bi bi-bug', 'Bug Tracking', 'ติดตามข้อผิดพลาด', 'pm/bug', 130, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000014-0000-0000-0000-000000000014', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT14', 'bi bi-box-seam', 'Delivery Management', 'การส่งมอบงาน', 'pm/delivery', 140, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000015-0000-0000-0000-000000000015', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT15', 'bi bi-book', 'User Manual', 'คู่มือการใช้งาน', 'pm/manual', 150, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000016-0000-0000-0000-000000000016', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT16', 'bi bi-receipt', 'Invoice & Payment', 'ใบแจ้งหนี้และการชำระเงิน', 'pm/invoice', 160, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000017-0000-0000-0000-000000000017', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT17', 'bi bi-tools', 'MA Ticket', 'การบำรุงรักษา (MA Ticket)', 'pm/ma-ticket', 170, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000018-0000-0000-0000-000000000018', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT18', 'bi bi-arrow-repeat', 'Renewal Management', 'การต่ออายุสัญญา', 'pm/renewal', 180, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000019-0000-0000-0000-000000000019', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT19', 'bi bi-clock-history', 'Document Version History', 'ประวัติเวอร์ชันเอกสาร', 'pm/version', 190, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW()),
    ('b0000020-0000-0000-0000-000000000020', '2521a502-bfaa-4385-8e94-d255d0fcba6b', 'PMDT20', 'bi bi-journal-text', 'Audit Log', 'บันทึกประวัติการใช้งาน', 'pm/audit', 200, true, false, false, false, false, false, false, false, 'system', NOW(), 'system', NOW())
ON CONFLICT (id) DO UPDATE SET
    parent_program_id = EXCLUDED.parent_program_id,
    program_code = EXCLUDED.program_code,
    icon = EXCLUDED.icon,
    name_en = EXCLUDED.name_en,
    name_local = EXCLUDED.name_local,
    route_path = EXCLUDED.route_path,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    is_add = EXCLUDED.is_add,
    is_back = EXCLUDED.is_back,
    is_print = EXCLUDED.is_print,
    is_remove = EXCLUDED.is_remove,
    is_save = EXCLUDED.is_save,
    is_search = EXCLUDED.is_search,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 5. ผูกสิทธิ์ทุกบทบาท (Roles) ในทุก Business ให้สามารถเข้าถึงโปรแกรมใหม่ได้ทั้งหมด
INSERT INTO su_business_role_program (id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete, created_by, created_date, updated_by, updated_date)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    true,
    false,
    false,
    false,
    false,
    false,
    false,
    false,
    'system',
    NOW(),
    'system',
    NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE p.is_active = true AND p.is_delete = false
ON CONFLICT (business_role_id, program_id) DO UPDATE SET
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();
