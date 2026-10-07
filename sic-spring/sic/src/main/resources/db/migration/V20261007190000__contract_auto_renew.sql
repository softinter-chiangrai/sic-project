-- สัญญาที่ตั้งต่ออัตโนมัติ: ระบบสร้างฉบับต่ออายุ (ร่าง) ให้เมื่อเหลือไม่เกิน 30 วันก่อนหมดอายุ
ALTER TABLE pm_customer_contract ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN NOT NULL DEFAULT false;
