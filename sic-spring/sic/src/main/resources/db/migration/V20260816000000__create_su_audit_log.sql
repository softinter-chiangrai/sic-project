-- ============================================================
-- 1. เปลี่ยนชื่อตาราง
-- ============================================================
ALTER TABLE pm_audit_log RENAME TO su_audit_log;

-- ============================================================
-- 2. เพิ่มคอลัมน์ที่ขาดหายไป (ใช้ DO block เพื่อป้องกัน error)
-- ============================================================
DO $$
BEGIN
    -- ฟิลด์จาก Entity เดิมที่ยังไม่มีในตาราง
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='su_audit_log' AND column_name='username') THEN
        ALTER TABLE su_audit_log ADD COLUMN username VARCHAR(100);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='su_audit_log' AND column_name='user_fullname') THEN
        ALTER TABLE su_audit_log ADD COLUMN user_fullname VARCHAR(200);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='su_audit_log' AND column_name='module') THEN
        ALTER TABLE su_audit_log ADD COLUMN module VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='su_audit_log' AND column_name='description') THEN
        ALTER TABLE su_audit_log ADD COLUMN description TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='su_audit_log' AND column_name='status') THEN
        ALTER TABLE su_audit_log ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Success';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='su_audit_log' AND column_name='details') THEN
        ALTER TABLE su_audit_log ADD COLUMN details TEXT;
    END IF;

END $$;

-- ============================================================
-- 3. (Optional) เปลี่ยนประเภทของ old_value / new_value เป็น JSONB
--    เพื่อให้เก็บโครงสร้างข้อมูลได้ยืดหยุ่น
-- ============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='su_audit_log' AND column_name='old_value' 
               AND data_type != 'jsonb') THEN
        ALTER TABLE su_audit_log ALTER COLUMN old_value TYPE JSONB USING old_value::jsonb;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='su_audit_log' AND column_name='new_value' 
               AND data_type != 'jsonb') THEN
        ALTER TABLE su_audit_log ALTER COLUMN new_value TYPE JSONB USING new_value::jsonb;
    END IF;
END $$;

-- ============================================================
-- 4. สร้าง Indexes เพื่อเพิ่มประสิทธิภาพการค้นหา
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_target ON su_audit_log (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON su_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON su_audit_log (created_date DESC);
CREATE INDEX IF NOT EXISTS idx_audit_business ON su_audit_log (business_id);


ALTER TABLE pm_test_case ADD COLUMN task_id UUID;
ALTER TABLE pm_test_case ADD COLUMN IF NOT EXISTS scenario_name VARCHAR(255);
ALTER TABLE pm_test_case ALTER COLUMN scenario_id DROP NOT NULL;

ALTER TABLE pm_test_scenario ADD COLUMN IF NOT EXISTS task_id UUID;
