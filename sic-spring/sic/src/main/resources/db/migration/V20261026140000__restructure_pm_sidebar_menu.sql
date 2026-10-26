-- ==============================================================================
-- Migration: V20261026140000__restructure_pm_sidebar_menu.sql
-- Description: ปรับโครงสร้าง Sidebar เมนู Project Management (PM) ออกเป็น 3 กลุ่ม:
--              1. ข้อมูลหลัก (Master Data): โครงการ (อันดับ 1), ข้อมูลลูกค้า, สัญญาและข้อตกลง (ปิด PMRT07 ที่ซ้ำกับกระดิ่ง)
--              2. งานในโครงการ (Project Tasks / SDLC): เฟส, แกนต์, ปฏิทิน, Requirement, Diagram, Spec, Review, Task, Test, Manual, Delivery, Invoice, MA
--              3. การจัดการและกำกับดูแล (Governance & Tracking): ควบคุมการเปลี่ยนแปลง (CR), ศูนย์การอนุมัติ, ศูนย์รวมความคิดเห็น, ประวัติเวอร์ชัน, Audit Log
-- ==============================================================================

-- 1. สร้าง Parent Program กลุ่มที่ 3: PMGV (การจัดการและกำกับดูแล)
INSERT INTO su_program (
    id, parent_program_id, program_code, icon, name_en, name_local, route_path, 
    sort_order, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete, 
    created_by, created_date, updated_by, updated_date
)
VALUES (
    '3531b603-c0bb-4496-9f95-e366e1fdcb7c',
    '1542d19f-b9a9-4e24-a65f-e57dbca4e783', -- PM Root ID
    'PMGV',
    'bi bi-shield-check',
    'Governance & Management',
    'การจัดการและกำกับดูแล',
    NULL,
    30,
    true, false, false, false, false, false, false, false,
    'system', NOW(), 'system', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    parent_program_id = EXCLUDED.parent_program_id,
    program_code = EXCLUDED.program_code,
    icon = EXCLUDED.icon,
    name_en = EXCLUDED.name_en,
    name_local = EXCLUDED.name_local,
    sort_order = EXCLUDED.sort_order,
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 2. ปรับกลุ่ม ข้อมูลหลัก (PMRT):
--    - สลับให้ 'PMRT02' (โครงการ) ขึ้นมาเป็นลำดับแรก (sort_order = 10)
--    - 'PMRT01' (ข้อมูลลูกค้า) sort_order = 20
--    - 'PMRT04' (สัญญาและข้อตกลง) sort_order = 30
UPDATE su_program
SET sort_order = 10, updated_by = 'system', updated_date = NOW()
WHERE program_code = 'PMRT02';

UPDATE su_program
SET sort_order = 20, updated_by = 'system', updated_date = NOW()
WHERE program_code = 'PMRT01';

UPDATE su_program
SET sort_order = 30, updated_by = 'system', updated_date = NOW()
WHERE program_code = 'PMRT04';

-- 3. ย้ายเมนูกำกับดูแล (Change Control, Approval, Notification, Discussion, Version History, Audit Log) เข้ากลุ่ม PMGV
UPDATE su_program
SET parent_program_id = '3531b603-c0bb-4496-9f95-e366e1fdcb7c',
    is_active = true,
    sort_order = CASE program_code
        WHEN 'PMDT06' THEN 10 -- ควบคุมการเปลี่ยนแปลง (CR)
        WHEN 'PMDT03' THEN 20 -- ศูนย์การอนุมัติ (Approval Center)
        WHEN 'PMRT07' THEN 25 -- ศูนย์การแจ้งเตือน (Notification Center)
        WHEN 'PMDT08' THEN 30 -- ศูนย์รวมความคิดเห็น (Discussion Management)
        WHEN 'PMDT19' THEN 40 -- ประวัติเวอร์ชันเอกสาร (Document Version History)
        WHEN 'PMDT20' THEN 50 -- บันทึกประวัติการใช้งาน (Audit Log)
    END,
    updated_by = 'system',
    updated_date = NOW()
WHERE program_code IN ('PMDT06', 'PMDT03', 'PMRT07', 'PMDT08', 'PMDT19', 'PMDT20');

-- 4. จัดเรียงลำดับเมนูในกลุ่ม งานในโครงการ (PMDT) ที่เหลือให้เป็นระเบียบตาม SDLC (10 - 130)
UPDATE su_program p
SET sort_order = v.sort_order,
    updated_by = 'system',
    updated_date = NOW()
FROM (VALUES
    ('PMDT01', 10),   -- Phase Management (WBS)
    ('PMDT11', 20),   -- Gantt Schedule
    ('PMDT21', 30),   -- Task Calendar
    ('PMDT04', 40),   -- Requirement Management
    ('PMDT05', 50),   -- Diagram Management
    ('PMDT07', 60),   -- Specification Management
    ('PMDT09', 70),   -- Design Review
    ('PMDT10', 80),   -- Task Management
    ('PMDT12', 90),   -- Test Management
    ('PMDT15', 100),  -- User Manual
    ('PMDT14', 110),  -- Delivery Management
    ('PMDT16', 120),  -- Invoice & Payment
    ('PMDT17', 130)   -- MA Ticket
) AS v(program_code, sort_order)
WHERE p.program_code = v.program_code;

-- 5. ให้สิทธิ์ทุก Business Role ในระบบเข้าถึงกลุ่มเมนู PMGV ใหม่
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, 
    is_add, is_back, is_print, is_remove, is_save, is_search, is_delete, 
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(),
    r.id,
    '3531b603-c0bb-4496-9f95-e366e1fdcb7c',
    true,
    false, false, false, false, false, false, false,
    'system', NOW(), 'system', NOW()
FROM su_business_role r
WHERE r.is_active = true AND r.is_delete = false
ON CONFLICT (business_role_id, program_id) DO UPDATE SET
    is_active = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();
