

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_diagram_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_bug_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_requirement_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_spec_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_task_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_test_case_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_table_names TEXT[];

-- 1. ลบ Foreign Key Constraints
ALTER TABLE IF EXISTS pm_specification_screen 
    DROP CONSTRAINT IF EXISTS fk_pm_spec_screen_spec;

ALTER TABLE IF EXISTS pm_specification_field 
    DROP CONSTRAINT IF EXISTS fk_pm_spec_field_spec;

ALTER TABLE IF EXISTS pm_specification_validation 
    DROP CONSTRAINT IF EXISTS fk_pm_spec_validation_spec;

ALTER TABLE IF EXISTS pm_specification_business_rules 
    DROP CONSTRAINT IF EXISTS fk_pm_spec_br_spec;

ALTER TABLE IF EXISTS pm_specification_api 
    DROP CONSTRAINT IF EXISTS fk_pm_spec_api_spec;

ALTER TABLE IF EXISTS pm_specification_version 
    DROP CONSTRAINT IF EXISTS fk_pm_spec_version_spec;


-- 2. ลบตารางทั้งหมดที่ไม่ใช้ (รวม version)
DROP TABLE IF EXISTS pm_specification_api CASCADE;
DROP TABLE IF EXISTS pm_specification_business_rules CASCADE;
DROP TABLE IF EXISTS pm_specification_field CASCADE;
DROP TABLE IF EXISTS pm_specification_screen CASCADE;
DROP TABLE IF EXISTS pm_specification_validation CASCADE;
DROP TABLE IF EXISTS pm_specification_version CASCADE;


-- 3. ปรับโครงสร้างตารางหลัก (pm_specification)
-- ลบคอลัมน์ที่ไม่ใช้ (เนื้อหาทั้งหมดจะอยู่ใน description)
ALTER TABLE pm_specification 
    DROP COLUMN IF EXISTS objective;

ALTER TABLE pm_specification 
    DROP COLUMN IF EXISTS scope;

ALTER TABLE pm_specification 
    DROP COLUMN IF EXISTS remark;


-- 4. เปลี่ยน description ให้เป็น TEXT (รองรับ HTML ขนาดใหญ่)
ALTER TABLE pm_specification 
    ALTER COLUMN description TYPE TEXT;


-- 5. (Optional) ถ้ายังไม่มี upload_group_id ให้เพิ่ม (สำหรับไฟล์แนบ)
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS upload_group_id UUID;