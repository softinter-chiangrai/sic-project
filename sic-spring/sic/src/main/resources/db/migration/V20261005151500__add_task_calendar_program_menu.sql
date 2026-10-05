-- Migration: V20261005151500__add_task_calendar_program_menu.sql
-- Description: เพิ่มเมนู "ปฏิทินงาน" (PMDT21 / Task Calendar) ภายใต้ Project Workspace (PMDT)
-- ลำดับ sort_order = 25 (ต่อจาก Gantt Schedule 20 และก่อน Requirement Management 30 ตาม SDLC)

-- 1. เพิ่มโปรแกรม PMDT21 ใน su_program
INSERT INTO su_program (
    id, parent_program_id, program_code, icon,
    name_en, name_local, route_path, sort_order,
    is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    'b0000021-0000-0000-0000-000000000021',
    '2521a502-bfaa-4385-8e94-d255d0fcba6b',
    'PMDT21',
    'bi bi-calendar3',
    'Task Calendar',
    'ปฏิทินงาน',
    'pm/calendar',
    25,
    true,
    false, false, false, false, false, false, false,
    'system', NOW(), 'system', NOW()
WHERE NOT EXISTS (SELECT 1 FROM su_program WHERE program_code = 'PMDT21');

-- หากมีอยู่แล้ว ให้อัปเดตค่าให้ตรงกัน
UPDATE su_program
SET parent_program_id = '2521a502-bfaa-4385-8e94-d255d0fcba6b',
    icon = 'bi bi-calendar3',
    name_en = 'Task Calendar',
    name_local = 'ปฏิทินงาน',
    route_path = 'pm/calendar',
    sort_order = 25,
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW()
WHERE program_code = 'PMDT21';

-- 2. ผูกสิทธิ์ทุกบทบาท (Roles) ในทุก Business ให้สามารถเข้าถึงเมนูใหม่ได้
INSERT INTO su_business_role_program (
    id, business_role_id, program_id,
    is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
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
WHERE p.program_code = 'PMDT21'
  AND r.is_active = true
  AND r.is_delete = false
ON CONFLICT (business_role_id, program_id) DO UPDATE SET
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 3. เพิ่มข้อความแปลระบบใน su_message
INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'PMDT21_PAGE_TITLE', 'Task Calendar', 'ปฏิทินงาน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'PMDT21_PAGE_TITLE');

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'COMMON', 'ALL', 'BREADCRUMB_SEG_CALENDAR', 'Task Calendar', 'ปฏิทินงาน', 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_message WHERE message_code = 'BREADCRUMB_SEG_CALENDAR');
