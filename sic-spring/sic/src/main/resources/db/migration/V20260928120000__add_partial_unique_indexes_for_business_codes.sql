-- ป้องกันรหัสธุรกิจ (customer/contract/project/specification code) ซ้ำกันในระดับ DB จริง
-- ใช้ partial unique index (WHERE is_delete = false) แทน UNIQUE constraint ธรรมดา
-- เพื่อไม่ให้ชนกับแถวที่ถูก soft-delete ไปแล้ว (แถวที่ is_delete = true ไม่ถูกนับใน index นี้เลย
-- จึงสามารถนำรหัสเดิมกลับมาใช้ใหม่ได้หลัง soft-delete โดยไม่ชน constraint)
--
-- ตรวจสอบแล้วว่า ณ วันที่เขียน migration นี้ ไม่มีข้อมูลซ้ำในแถวที่ยัง active (is_delete = false)
-- ในทั้ง 4 ตารางนี้ จึงสร้าง index ได้ทันทีโดยไม่ต้อง cleanup ข้อมูลก่อน

CREATE UNIQUE INDEX IF NOT EXISTS ux_pm_customer_code
    ON pm_customer (business_id, customer_code)
    WHERE is_delete = false;

CREATE UNIQUE INDEX IF NOT EXISTS ux_pm_customer_contract_no
    ON pm_customer_contract (business_id, contract_no)
    WHERE is_delete = false;

CREATE UNIQUE INDEX IF NOT EXISTS ux_pm_customer_project_code
    ON pm_customer_project (business_id, project_code)
    WHERE is_delete = false;

-- specification_code ต้อง scope ตามโครงการ (project_id) ไม่ใช่ scope ทั้งระบบ
-- เพราะแต่ละโครงการ/แต่ละ business ควรใช้เลขรันของตัวเอง (SPEC-001, SPEC-002, ...) ได้อิสระ
CREATE UNIQUE INDEX IF NOT EXISTS ux_pm_specification_code_per_project
    ON pm_specification (project_id, specification_code)
    WHERE is_delete = false;
