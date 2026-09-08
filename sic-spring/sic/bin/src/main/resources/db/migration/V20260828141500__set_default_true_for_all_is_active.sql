-- ==============================================================================
-- Migration: V20260828141500__set_default_true_for_all_is_active.sql
-- Description: ตั้งค่า DEFAULT TRUE สำหรับฟิลด์ is_active ในทุกตาราง (Master / General tables)
--              เพื่อป้องกันปัญหาข้อมูลที่สร้างใหม่ถูกปิดการใช้งานโดยไม่ตั้งใจ
-- ==============================================================================

-- 1. ตาราง System User & Organization Management (SU)
ALTER TABLE su_business ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE su_business_role ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE su_program ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE su_business_role_program ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE su_user_business ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE su_user_business_role ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE su_upload ALTER COLUMN is_active SET DEFAULT TRUE;

-- 2. ตาราง Database & Master Configuration (DB)
ALTER TABLE db_country ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_province ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_district ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_sub_district ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_title ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_parameter ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_mail_config ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE db_mail_template ALTER COLUMN is_active SET DEFAULT TRUE;

-- 3. ตาราง Project Management & Workspace (PM)
ALTER TABLE pm_customer ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_customer_project ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_customer_contract ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_requirement ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_specification ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_approval_flow ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_approval ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_diagram ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_design_review ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_document_version ALTER COLUMN is_active SET DEFAULT TRUE;
ALTER TABLE pm_edit_session ALTER COLUMN is_active SET DEFAULT TRUE;
