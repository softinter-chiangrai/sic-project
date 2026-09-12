-- V20260912175000__fix_pm_customer_person_type_column.sql
-- Ensure pm_customer table has person_type column

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'pm_customer'
          AND column_name = 'person_type'
    ) THEN
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'pm_customer'
              AND column_name = 'customer_type'
        ) THEN
            ALTER TABLE public.pm_customer RENAME COLUMN customer_type TO person_type;
        ELSE
            ALTER TABLE public.pm_customer ADD COLUMN person_type VARCHAR(50);
        END IF;
    END IF;
END $$;
