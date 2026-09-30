-- ==============================================================================
-- Migration: V20260930153000__seed_default_user_roles.sql
-- Description: Seed default user roles for all businesses based on SDLC specs:
--              1. Admin
--              2. Project Manager / PM
--              3. Team Lead / Head
--              4. BA (Business Analyst)
--              5. SA (System Analyst)
--              6. UI/UX Designer
--              7. Developer
--              8. Tester / QA
--              9. Customer
--              10. Finance
--              11. MA Support
--              12. Viewer
-- ==============================================================================

-- 1. เพิ่มบทบาทมาตรฐานให้ทุก Business ในระบบ (ถ้ายังไม่มี)
INSERT INTO su_business_role (
    id,
    business_id,
    role_code,
    role_name_en,
    role_name_local,
    role_level,
    sort_order,
    is_active,
    color,
    created_by,
    created_date,
    updated_by,
    updated_date,
    is_delete
)
SELECT 
    gen_random_uuid(),
    b.id,
    v.role_code,
    v.role_name_en,
    v.role_name_local,
    v.role_level,
    v.sort_order,
    true,
    v.color,
    'system',
    NOW(),
    'system',
    NOW(),
    false
FROM su_business b
CROSS JOIN (
    VALUES
    ('ADMIN', 'Administrator', 'ผู้ดูแลระบบ', '1', 1, '#EF4444'),
    ('PM', 'Project Manager', 'ผู้จัดการโครงการ', '2', 2, '#3B82F6'),
    ('TEAM_LEAD', 'Team Lead / Head', 'หัวหน้าทีม / หัวหน้าสายงาน', '3', 3, '#6366F1'),
    ('BA', 'Business Analyst', 'นักวิเคราะห์ธุรกิจ', '4', 4, '#06B6D4'),
    ('SA', 'System Analyst', 'นักวิเคราะห์ระบบ', '5', 5, '#0EA5E9'),
    ('UI_UX', 'UI/UX Designer', 'ผู้ออกแบบ UI/UX', '6', 6, '#EC4899'),
    ('DEV', 'Developer', 'นักพัฒนาระบบ', '7', 7, '#10B981'),
    ('QA', 'Tester / QA', 'ผู้ทดสอบระบบ / QA', '8', 8, '#F59E0B'),
    ('CUSTOMER', 'Customer', 'ลูกค้า / ผู้ว่าจ้าง', '9', 9, '#8B5CF6'),
    ('FINANCE', 'Finance', 'ฝ่ายการเงิน', '10', 10, '#14B8A6'),
    ('MA_SUPPORT', 'MA Support', 'เจ้าหน้าที่ดูแลหลังส่งมอบ (MA)', '11', 11, '#F97316'),
    ('VIEWER', 'Viewer', 'ผู้ดูข้อมูลอย่างเดียว', '12', 12, '#6B7280')
) AS v(role_code, role_name_en, role_name_local, role_level, sort_order, color)
WHERE NOT EXISTS (
    SELECT 1 FROM su_business_role r 
    WHERE r.business_id = b.id 
      AND r.role_code = v.role_code 
      AND r.is_delete = false
);
