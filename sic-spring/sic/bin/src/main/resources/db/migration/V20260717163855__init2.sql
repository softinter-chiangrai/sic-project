-- 1. แก้ไขชนิดข้อมูลของ project_id
ALTER TABLE pm_diagram ALTER COLUMN project_id TYPE UUID USING project_id::uuid;

ALTER TABLE pm_diagram ADD COLUMN parsed_json_data JSONB;