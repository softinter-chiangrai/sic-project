-- Fix pm_delivery_checklist table legacy column constraints from init migration
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pm_delivery_checklist' AND column_name = 'checklist_name'
    ) THEN
        ALTER TABLE pm_delivery_checklist ALTER COLUMN checklist_name DROP NOT NULL;
    END IF;
END $$;
