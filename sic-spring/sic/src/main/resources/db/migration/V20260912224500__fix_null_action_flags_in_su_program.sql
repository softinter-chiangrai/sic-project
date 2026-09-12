-- ==============================================================================
-- Migration: V20260912224500__fix_null_action_flags_in_su_program.sql
-- Description: Fix NULL values in action flags (is_add, is_back, is_print, is_remove, is_save, is_search)
--              for su_program and su_business_role_program tables.
-- ==============================================================================

-- 1. Update NULL values in su_program
UPDATE su_program 
SET 
    is_add = COALESCE(is_add, false),
    is_back = COALESCE(is_back, false),
    is_print = COALESCE(is_print, false),
    is_remove = COALESCE(is_remove, false),
    is_save = COALESCE(is_save, false),
    is_search = COALESCE(is_search, false)
WHERE is_add IS NULL 
   OR is_back IS NULL 
   OR is_print IS NULL 
   OR is_remove IS NULL 
   OR is_save IS NULL 
   OR is_search IS NULL;

-- 2. Update NULL values in su_business_role_program
UPDATE su_business_role_program 
SET 
    is_add = COALESCE(is_add, false),
    is_back = COALESCE(is_back, false),
    is_print = COALESCE(is_print, false),
    is_remove = COALESCE(is_remove, false),
    is_save = COALESCE(is_save, false),
    is_search = COALESCE(is_search, false)
WHERE is_add IS NULL 
   OR is_back IS NULL 
   OR is_print IS NULL 
   OR is_remove IS NULL 
   OR is_save IS NULL 
   OR is_search IS NULL;

-- 3. Set DEFAULT false on all action flag columns in su_program
ALTER TABLE su_program ALTER COLUMN is_add SET DEFAULT false;
ALTER TABLE su_program ALTER COLUMN is_back SET DEFAULT false;
ALTER TABLE su_program ALTER COLUMN is_print SET DEFAULT false;
ALTER TABLE su_program ALTER COLUMN is_remove SET DEFAULT false;
ALTER TABLE su_program ALTER COLUMN is_save SET DEFAULT false;
ALTER TABLE su_program ALTER COLUMN is_search SET DEFAULT false;

-- 4. Set DEFAULT false on all action flag columns in su_business_role_program
ALTER TABLE su_business_role_program ALTER COLUMN is_add SET DEFAULT false;
ALTER TABLE su_business_role_program ALTER COLUMN is_back SET DEFAULT false;
ALTER TABLE su_business_role_program ALTER COLUMN is_print SET DEFAULT false;
ALTER TABLE su_business_role_program ALTER COLUMN is_remove SET DEFAULT false;
ALTER TABLE su_business_role_program ALTER COLUMN is_save SET DEFAULT false;
ALTER TABLE su_business_role_program ALTER COLUMN is_search SET DEFAULT false;
