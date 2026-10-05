-- Migration: V20261005111500__reorder_program_management_before_permission.sql
-- Description: ปรับลำดับเมนูในกลุ่มการตั้งค่าธุรกิจ (BURT):
-- ให้ "จัดการโปรแกรม" (BURT05) ขึ้นก่อน "จัดการสิทธิ์" (BURT02)
-- ลำดับใหม่:
-- 10: ข้อมูลทางธุรกิจ (BURT01)
-- 20: จัดการทีม (BURT04)
-- 30: จัดการบทบาท (BURT03)
-- 40: จัดการโปรแกรม (BURT05)
-- 50: จัดการสิทธิ์ (BURT02)
-- 60: การจัดการกระบวนการอนุมัติ (BURT06)
-- 70: จัดการ AI Model (BURT07)

UPDATE su_program p
SET sort_order = v.sort_order,
    updated_by = 'system',
    updated_date = NOW()
FROM (VALUES
    ('BURT01', 10), -- ข้อมูลทางธุรกิจ
    ('BURT04', 20), -- จัดการทีม
    ('BURT03', 30), -- จัดการบทบาท
    ('BURT05', 40), -- จัดการโปรแกรม
    ('BURT02', 50), -- จัดการสิทธิ์
    ('BURT06', 60), -- การจัดการกระบวนการอนุมัติ
    ('BURT07', 70)  -- จัดการ AI Model
) AS v(program_code, sort_order)
WHERE p.program_code = v.program_code
  AND p.is_delete = false;
