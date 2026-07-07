-- ============================================================
-- Script: ทำให้คอลัมน์ business_id ในทุกตาราง pm_* เป็น NULL (nullable)
-- ใช้สำหรับระบบภายในองค์กร ที่ไม่จำเป็นต้องมี business_id
-- ============================================================

DO $$
DECLARE
    tbl_name text;
BEGIN
    FOR tbl_name IN
        SELECT table_name
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name LIKE 'pm\_%' ESCAPE '\'
          AND column_name = 'business_id'
    LOOP
        EXECUTE format('ALTER TABLE %I ALTER COLUMN business_id DROP NOT NULL;', tbl_name);
        RAISE NOTICE 'Changed business_id to nullable in %', tbl_name;
    END LOOP;
END $$;