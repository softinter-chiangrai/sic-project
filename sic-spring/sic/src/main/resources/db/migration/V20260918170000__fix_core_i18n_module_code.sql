-- The previous seed migration (V20260918160000) inserted ~359 shared-component UI
-- translation keys under module_code='CORE' with per-component program_codes
-- (e.g. CORE/MY_WORK_WIDGET, CORE/GRIDPANEL, CORE/TOAST, ...).
-- The frontend's AppTranslateLoader never requests the CORE module for any
-- program - it only ever loads COMMON/ALL (always) plus the current route's
-- module/program (FEATURE/APP or MANAGEMENT/APP). As a result those CORE/*
-- keys were never fetched, so ngx-translate fell back to showing the raw key
-- name on screen (e.g. "MY_WORK_WIDGET_TITLE").
-- Fix: move all module_code='CORE' rows to COMMON/ALL, which is always loaded.
UPDATE su_message
SET module_code = 'COMMON',
    program_code = 'ALL',
    updated_by = 'system',
    updated_date = NOW()
WHERE module_code = 'CORE';