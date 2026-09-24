-- Migration: V20260924101500__remove_pmdt18_renewal_management_menu.sql
-- Description: Deactivate PMDT18 (Renewal Management) from su_program and su_business_role_program

UPDATE su_program 
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_code = 'PMDT18';

UPDATE su_business_role_program
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_id IN (SELECT id FROM su_program WHERE program_code = 'PMDT18');
