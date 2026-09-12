DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'db_mail_queue' AND column_name = 'DbMailConfigId'
    ) THEN
        ALTER TABLE db_mail_queue RENAME COLUMN "DbMailConfigId" TO db_mail_config_id;
    END IF;
END $$;
