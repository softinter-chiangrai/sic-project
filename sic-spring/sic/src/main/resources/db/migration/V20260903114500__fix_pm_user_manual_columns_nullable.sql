-- Fix pm_user_manual columns: drop obsolete legacy title column and remove delivery_id NOT NULL constraint
ALTER TABLE pm_user_manual ALTER COLUMN delivery_id DROP NOT NULL;
ALTER TABLE pm_user_manual ALTER COLUMN manual_type DROP NOT NULL;

-- Drop legacy title column (replaced by manual_title)
ALTER TABLE pm_user_manual DROP COLUMN IF EXISTS title;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_user_manual' AND column_name = 'content'
    ) THEN
        ALTER TABLE pm_user_manual ALTER COLUMN content DROP NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_user_manual' AND column_name = 'file_path'
    ) THEN
        ALTER TABLE pm_user_manual ALTER COLUMN file_path DROP NOT NULL;
    END IF;
END $$;
