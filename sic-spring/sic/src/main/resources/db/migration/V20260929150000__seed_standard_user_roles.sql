-- ==============================================================================
-- Migration: V20260929150000__seed_standard_user_roles.sql
-- Description: สร้างชุด Role มาตรฐานและผูกสิทธิ์โปรแกรมทั้งหมดอัตโนมัติตาม Section 5 ใน READMEInformation.md
-- Roles:
--   1. ADMIN       - ผู้ดูแลระบบ (จัดการระบบ, ผู้ใช้งาน, สิทธิ์)
--   2. PM          - ผู้จัดการโครงการ (ดูแลโครงการทั้งหมด, วางแผน, ติดตามงาน)
--   3. LEAD        - หัวหน้าทีม (Review Design, Confirm Specification)
--   4. BA          - นักวิเคราะห์ธุรกิจ (เก็บ Requirement, ยืนยัน Requirement)
--   5. SA          - นักวิเคราะห์ระบบ (วิเคราะห์ระบบ, ออกแบบ DFD / ER / Architecture)
--   6. DESIGNER    - นักออกแบบ UI/UX (ออกแบบหน้าจอ, Flow, Prototype)
--   7. DEV         - นักพัฒนาซอฟต์แวร์ (พัฒนาระบบตาม Task)
--   8. TESTER      - ผู้ทดสอบระบบ / QA (จัดทำ Test Case, ทดสอบ, แจ้ง Bug)
--   9. CUSTOMER    - ลูกค้า (ยืนยัน Requirement, Specification, UAT, รับมอบงาน)
--   10. FINANCE    - ฝ่ายการเงิน (ออกใบแจ้งหนี้, ติดตามการชำระเงิน)
--   11. MA_SUPPORT - เจ้าหน้าที่ดูแลหลังส่งมอบ (ดูแลหลังส่งมอบ, รับแจ้งปัญหา)
--   12. VIEWER     - ผู้ดูข้อมูลทั่วไป (ดูข้อมูลอย่างเดียว)
-- ==============================================================================

DO $$
DECLARE
    b_rec RECORD;
    v_admin_id UUID;
    v_pm_id UUID;
    v_lead_id UUID;
    v_ba_id UUID;
    v_sa_id UUID;
    v_designer_id UUID;
    v_dev_id UUID;
    v_tester_id UUID;
    v_customer_id UUID;
    v_finance_id UUID;
    v_ma_id UUID;
    v_viewer_id UUID;
BEGIN
    -- วนลูปสร้าง Role ให้ทุก Business ที่มีอยู่ในระบบ
    FOR b_rec IN (SELECT id FROM su_business WHERE is_delete = false) LOOP

        -- 1. ADMIN (Root Role)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, NULL, 'ADMIN', 'Admin', 'ผู้ดูแลระบบ',
            'EXECUTIVE', 10, true, '#EF4444', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_admin_id;

        -- 2. PM (ใต้ Admin)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_admin_id, 'PM', 'Project Manager', 'ผู้จัดการโครงการ',
            'MANAGEMENT', 20, true, '#3B82F6', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_admin_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_pm_id;

        -- 3. Team Lead / Head (ใต้ PM)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_pm_id, 'LEAD', 'Team Lead / Head', 'หัวหน้าทีม',
            'LEAD', 30, true, '#8B5CF6', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_pm_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_lead_id;

        -- 4. BA (ใต้ Lead)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_lead_id, 'BA', 'Business Analyst', 'นักวิเคราะห์ธุรกิจ',
            'ANALYST', 40, true, '#10B981', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_lead_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_ba_id;

        -- 5. SA (ใต้ Lead)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_lead_id, 'SA', 'System Analyst', 'นักวิเคราะห์ระบบ',
            'ANALYST', 50, true, '#06B6D4', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_lead_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_sa_id;

        -- 6. UI/UX Designer (ใต้ Lead)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_lead_id, 'DESIGNER', 'UI/UX Designer', 'นักออกแบบ UI/UX',
            'SPECIALIST', 60, true, '#EC4899', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_lead_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_designer_id;

        -- 7. Developer (ใต้ Lead)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_lead_id, 'DEV', 'Developer', 'นักพัฒนาซอฟต์แวร์',
            'SPECIALIST', 70, true, '#F59E0B', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_lead_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_dev_id;

        -- 8. Tester / QA (ใต้ Lead)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_lead_id, 'TESTER', 'Tester / QA', 'ผู้ทดสอบระบบ / QA',
            'SPECIALIST', 80, true, '#14B8A6', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_lead_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_tester_id;

        -- 9. Customer (ใต้ PM)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_pm_id, 'CUSTOMER', 'Customer', 'ลูกค้า',
            'EXTERNAL', 90, true, '#6366F1', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_pm_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_customer_id;

        -- 10. Finance (ใต้ PM)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_pm_id, 'FINANCE', 'Finance', 'ฝ่ายการเงิน',
            'SUPPORT', 100, true, '#EAB308', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_pm_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_finance_id;

        -- 11. MA Support (ใต้ PM)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_pm_id, 'MA_SUPPORT', 'MA Support', 'เจ้าหน้าที่ดูแลหลังส่งมอบ',
            'SUPPORT', 110, true, '#F97316', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_pm_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_ma_id;

        -- 12. Viewer (ใต้ PM)
        INSERT INTO su_business_role (
            id, business_id, parent_role_id, role_code, role_name_en, role_name_local,
            role_level, sort_order, is_active, color, is_delete, created_by, created_date, updated_by, updated_date
        )
        VALUES (
            gen_random_uuid(), b_rec.id, v_pm_id, 'VIEWER', 'Viewer', 'ผู้ดูข้อมูลทั่วไป',
            'VIEWER', 120, true, '#64748B', false, 'system', NOW(), 'system', NOW()
        )
        ON CONFLICT (business_id, role_code) DO UPDATE SET
            parent_role_id = v_pm_id,
            role_name_en = EXCLUDED.role_name_en,
            role_name_local = EXCLUDED.role_name_local,
            role_level = EXCLUDED.role_level,
            sort_order = EXCLUDED.sort_order,
            color = EXCLUDED.color,
            is_active = true,
            is_delete = false,
            updated_by = 'system',
            updated_date = NOW()
        RETURNING id INTO v_viewer_id;

    END LOOP;
END $$;

-- ==============================================================================
-- 2. กำหนดสิทธิ์ Program Permissions ให้ทุก Role (su_business_role_program)
-- ==============================================================================

-- 2.1 ADMIN & PM & LEAD: สิทธิ์เต็มทุกหน้าจอและทุกปุ่ม (Add, Save, Remove, Print, Search)
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(), r.id, p.id, true, true, true, true, true, true, true, false,
    'system', NOW(), 'system', NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE r.role_code IN ('ADMIN', 'PM', 'LEAD')
  AND r.is_active = true AND r.is_delete = false
  AND p.is_active = true AND p.is_delete = false
ON CONFLICT (business_role_id, program_id) 
DO UPDATE SET
    is_active = true,
    is_add = true,
    is_back = true,
    is_print = true,
    is_remove = true,
    is_save = true,
    is_search = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 2.2 BA & SA & DEV & TESTER & DESIGNER: สิทธิ์การทำงานเต็มในโมดูล Project Workspace (PMDT) + PMRT + BURT
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(), r.id, p.id, true, true, true, true, true, true, true, false,
    'system', NOW(), 'system', NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE r.role_code IN ('BA', 'SA', 'DEV', 'TESTER', 'DESIGNER', 'FINANCE', 'MA_SUPPORT', 'CUSTOMER')
  AND r.is_active = true AND r.is_delete = false
  AND p.is_active = true AND p.is_delete = false
ON CONFLICT (business_role_id, program_id) 
DO UPDATE SET
    is_active = true,
    is_add = true,
    is_back = true,
    is_print = true,
    is_remove = true,
    is_save = true,
    is_search = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- 2.3 VIEWER: สิทธิ์ดูและค้นหาอย่างเดียว (View & Search only)
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(), r.id, p.id, true, false, true, true, false, false, true, false,
    'system', NOW(), 'system', NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE r.role_code = 'VIEWER'
  AND r.is_active = true AND r.is_delete = false
  AND p.is_active = true AND p.is_delete = false
ON CONFLICT (business_role_id, program_id) 
DO UPDATE SET
    is_active = true,
    is_add = false,
    is_back = true,
    is_print = true,
    is_remove = false,
    is_save = false,
    is_search = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

-- ==============================================================================
-- 3. กำหนด Role ADMIN ให้ User ที่อยู่ในระบบปัจจุบัน (ถ้ายังไม่มี Role)
-- ==============================================================================
INSERT INTO su_user_business_role (
    id, user_business_id, business_role_id, is_primary, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(),
    ub.id,
    r.id,
    true,
    true,
    false,
    'system',
    NOW(),
    'system',
    NOW()
FROM su_user_business ub
JOIN su_business_role r ON r.business_id = ub.business_id AND r.role_code = 'ADMIN'
WHERE ub.is_delete = false
  AND NOT EXISTS (
      SELECT 1 FROM su_user_business_role ubr 
      WHERE ubr.user_business_id = ub.id AND ubr.is_delete = false
  );
