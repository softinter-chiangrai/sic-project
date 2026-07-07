-- 1. เพิ่มคอลัมน์ (Nullable)
ALTER TABLE pm_phase ADD COLUMN business_id UUID;

-- 2. อัปเดตค่าด้วย business_id แรก (ถ้ามีข้อมูล)
UPDATE pm_phase SET business_id = (SELECT id FROM su_business LIMIT 1) WHERE business_id IS NULL;

-- 3. เปลี่ยนเป็น NOT NULL
ALTER TABLE pm_phase ALTER COLUMN business_id SET NOT NULL;