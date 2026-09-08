-- Disable all action toolbar buttons for BURT01 (Search, Save, Print, Add, Back, Remove)
UPDATE su_program
SET is_search = FALSE,
    is_save = FALSE,
    is_print = FALSE,
    is_add = FALSE,
    is_back = FALSE,
    is_remove = FALSE,
    updated_date = CURRENT_TIMESTAMP
WHERE UPPER(program_code) = 'BURT01'
   OR route_path = 'bu/burt01'
   OR route_path = 'burt01';

UPDATE su_business_role_program
SET is_search = FALSE,
    is_save = FALSE,
    is_print = FALSE,
    is_add = FALSE,
    is_back = FALSE,
    is_remove = FALSE,
    updated_date = CURRENT_TIMESTAMP
WHERE program_id IN (
    SELECT id FROM su_program
    WHERE UPPER(program_code) = 'BURT01'
       OR route_path = 'bu/burt01'
       OR route_path = 'burt01'
);
