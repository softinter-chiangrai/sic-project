-- Migration: V20261002141500__remove_burp01_activity_log_menu.sql
-- Description: Deactivate BURP01 (Activity Log) and BURP (Activity) from su_program and su_business_role_program

UPDATE su_program 
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_code IN ('BURP01', 'BURP');

UPDATE su_business_role_program
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_id IN (SELECT id FROM su_program WHERE program_code IN ('BURP01', 'BURP'));
