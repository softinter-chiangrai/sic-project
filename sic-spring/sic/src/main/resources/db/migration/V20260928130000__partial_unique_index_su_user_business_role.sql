-- su_user_business_role เดิมมี UNIQUE(user_business_id, business_role_id) แบบไม่กรอง is_delete
-- ซึ่งจะชนกับแถวที่ถูก soft-delete ไปแล้วถ้ามีการ assign role เดิมกลับมาให้ user เดิมอีกครั้ง
-- (จำเป็นสำหรับการเปลี่ยน SuUserBusinessRoleRepository.deleteByUserBusinessId จาก hard delete
-- เป็น soft-delete ใน service layer)
--
-- ตรวจสอบแล้วว่า ณ วันที่เขียน migration นี้ ไม่มีข้อมูลซ้ำในแถวที่ยัง active (is_delete = false)

DROP INDEX IF EXISTS idx_user_business_role;

CREATE UNIQUE INDEX IF NOT EXISTS ux_user_business_role_active
    ON su_user_business_role (user_business_id, business_role_id)
    WHERE is_delete = false;
