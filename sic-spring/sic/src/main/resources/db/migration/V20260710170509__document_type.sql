INSERT INTO db_parameter (
  id, 
  module_code, 
  parameter_code, 
  parameter_value, 
  parameter_name_en, 
  parameter_name_local, 
  is_active, 
  sort_order, 
  created_by, 
  created_date,
  updated_by,      -- ✅ เพิ่มตรงนี้
  updated_date,    -- ✅ เพิ่มตรงนี้
  is_delete        -- ✅ เพิ่มตรงนี้ (ถ้า column มี default ให้ใส่ false)
) VALUES 
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'REQUIREMENT', 'Requirement', 'เอกสารความต้องการ', true, 1, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'SPECIFICATION', 'Specification', 'เอกสารกำหนดคุณลักษณะ', true, 2, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DFD', 'DFD', 'แผนภาพกระแสข้อมูล', true, 3, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'ER', 'ER Diagram', 'แผนภาพความสัมพันธ์ข้อมูล', true, 4, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DELIVERY', 'Delivery', 'เอกสารส่งมอบ', true, 5, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'INVOICE', 'Invoice', 'ใบแจ้งหนี้', true, 6, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_RENEWAL', 'MA Renewal', 'ต่ออายุสัญญา MA', true, 7, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CHANGE_REQUEST', 'Change Request', 'คำขอเปลี่ยนแปลง', true, 8, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TEST_PLAN', 'Test Plan', 'แผนการทดสอบ', true, 9, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'UAT', 'UAT', 'การทดสอบกับผู้ใช้', true, 10, 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TASK', 'Task', 'งาน', true, 11, 'system', NOW(), 'system', NOW(), false);