-- ==============================================================================
-- Migration: V20260828141500__set_default_true_for_all_is_active.sql
-- Description: ตั้งค่า DEFAULT TRUE สำหรับฟิลด์ is_active ในทุกตาราง (Master / General tables)
--              เพื่อป้องกันปัญหาข้อมูลที่สร้างใหม่ถูกปิดการใช้งานโดยไม่ตั้งใจ
-- ==============================================================================

DO $$
DECLARE
    tbl text;
    tbls text[] := ARRAY[
        'su_business', 'su_business_role', 'su_program', 'su_business_role_program',
        'su_user_business', 'su_user_business_role', 'su_upload',
        'db_country', 'db_province', 'db_district', 'db_sub_district',
        'db_title', 'db_parameter', 'db_mail_config', 'db_mail_template',
        'pm_customer', 'pm_customer_project', 'pm_customer_contract',
        'pm_requirement', 'pm_specification', 'pm_approval_flow',
        'pm_approval', 'pm_diagram', 'pm_design_review',
        'pm_document_version', 'pm_edit_session'
    ];
BEGIN
    FOREACH tbl IN ARRAY tbls LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = tbl AND column_name = 'is_active') THEN
                EXECUTE format('ALTER TABLE %I ALTER COLUMN is_active SET DEFAULT TRUE', tbl);
            ELSE
                EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE', tbl);
            END IF;
        END IF;
    END LOOP;
END $$;

