-- Unify all UI translation messages under COMMON/ALL so they are loaded globally
-- on frontend application start.
UPDATE su_message
SET module_code = 'COMMON',
    program_code = 'ALL',
    updated_by = 'system',
    updated_date = NOW()
WHERE module_code != 'COMMON' OR program_code != 'ALL';
