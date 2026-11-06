-- เพิ่มคอลัมน์ embedding vector(768) ให้ Diagram, Test Scenario และ Customer Project (Project Overview)
ALTER TABLE pm_diagram ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE pm_test_scenario ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE pm_customer_project ADD COLUMN IF NOT EXISTS embedding vector(768);

-- สร้าง Index แบบ HNSW สำหรับค้นหาความใกล้เคียง
CREATE INDEX IF NOT EXISTS idx_pm_diagram_embedding ON pm_diagram USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_pm_test_scenario_embedding ON pm_test_scenario USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_pm_customer_project_embedding ON pm_customer_project USING hnsw (embedding vector_cosine_ops);
