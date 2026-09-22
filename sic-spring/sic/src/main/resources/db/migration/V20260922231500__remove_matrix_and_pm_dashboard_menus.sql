-- Migration: V20260922231500__remove_matrix_and_pm_dashboard_menus.sql
-- Description: Deactivate Matrix (PMRT05), PM Dashboard (PMRT03), and Executive Dashboard (PMRT06) from su_program

UPDATE su_program 
SET is_active = false, is_delete = true, updated_date = NOW(), updated_by = 'system'
WHERE program_code IN ('PMRT03', 'PMRT05', 'PMRT06');
