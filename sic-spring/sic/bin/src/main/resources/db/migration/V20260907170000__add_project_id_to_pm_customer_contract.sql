-- V20260907170000__add_project_id_to_pm_customer_contract.sql
-- เพิ่ม column project_id ลงในตาราง pm_customer_contract เพื่อเก็บความสัมพันธ์โดยตรง
ALTER TABLE pm_customer_contract
    ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES pm_customer_project(id);

-- อัปเดตข้อมูลเดิม: ถ้า pm_customer_project มี contract_id ชี้อยู่แล้ว ให้ย้อนกลับมาใส่ project_id ใน contract
UPDATE pm_customer_contract c
SET project_id = p.id
FROM pm_customer_project p
WHERE p.contract_id = c.id
  AND p.is_delete = false
  AND c.project_id IS NULL;
