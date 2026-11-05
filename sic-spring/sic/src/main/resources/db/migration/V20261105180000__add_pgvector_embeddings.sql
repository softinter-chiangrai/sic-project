-- เปิด extension pgvector สำหรับคำนวณ Vector Similarity
CREATE EXTENSION IF NOT EXISTS vector;

-- เพิ่มคอลัมน์ embedding vector(768) ให้ 5 เอกสารหลัก
ALTER TABLE pm_requirement ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE pm_customer_contract ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE pm_task ADD COLUMN IF NOT EXISTS embedding vector(768);

-- สร้าง Index แบบ HNSW เพื่อให้ค้นหาความใกล้เคียงระดับมิลลิวินาที
CREATE INDEX IF NOT EXISTS idx_pm_requirement_embedding ON pm_requirement USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_pm_specification_embedding ON pm_specification USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_pm_customer_contract_embedding ON pm_customer_contract USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_pm_delivery_embedding ON pm_delivery USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_pm_task_embedding ON pm_task USING hnsw (embedding vector_cosine_ops);

