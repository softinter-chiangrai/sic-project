-- Fix PMDT02_TASKS_WORD incorrect translation value
UPDATE su_message 
SET message_en = 'Tasks', 
    message_local = 'งาน',
    updated_by = 'system',
    updated_date = NOW()
WHERE message_code = 'PMDT02_TASKS_WORD';
