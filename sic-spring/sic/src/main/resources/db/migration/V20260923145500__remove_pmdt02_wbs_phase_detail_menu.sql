-- Migration: V20260923145500__remove_pmdt02_wbs_phase_detail_menu.sql
-- Description: Deactivate PMDT02 (WBS & Phase Detail) from su_program and su_business_role_program

UPDATE su_program 
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_code = 'PMDT02';

UPDATE su_business_role_program
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_id IN (SELECT id FROM su_program WHERE program_code = 'PMDT02');
