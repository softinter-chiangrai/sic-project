-- ==============================================================================
-- Migration: V20260924215000__disable_burt07_action_toolbar_flags.sql
-- Description: Disable top toolbar action buttons (Back, Search, Add, Save, Print, Remove)
--              for BURT07 (AI Model Management - bu/ai-model-config)
-- ==============================================================================

UPDATE su_program
SET is_search = FALSE,
    is_save = FALSE,
    is_print = FALSE,
    is_add = FALSE,
    is_back = FALSE,
    is_remove = FALSE,
    updated_date = CURRENT_TIMESTAMP
WHERE UPPER(program_code) = 'BURT07'
   OR route_path = 'bu/ai-model-config'
   OR route_path = 'ai-model-config';

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
    WHERE UPPER(program_code) = 'BURT07'
       OR route_path = 'bu/ai-model-config'
       OR route_path = 'ai-model-config'
);
