-- V20260826163000__convert_date_to_timestamptz.sql
-- Synchronize PostgreSQL column types with Java Instant entities

DO $$
BEGIN
    -- 1. pm_delivery
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_delivery' AND column_name = 'delivery_date') THEN
        ALTER TABLE pm_delivery ALTER COLUMN delivery_date TYPE TIMESTAMPTZ USING delivery_date::TIMESTAMPTZ;
    END IF;

    -- 2. pm_invoice
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_invoice' AND column_name = 'issue_date') THEN
        ALTER TABLE pm_invoice ALTER COLUMN issue_date TYPE TIMESTAMPTZ USING issue_date::TIMESTAMPTZ;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_invoice' AND column_name = 'due_date') THEN
        ALTER TABLE pm_invoice ALTER COLUMN due_date TYPE TIMESTAMPTZ USING due_date::TIMESTAMPTZ;
    END IF;

    -- 3. pm_payment
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_payment' AND column_name = 'payment_date') THEN
        ALTER TABLE pm_payment ALTER COLUMN payment_date TYPE TIMESTAMPTZ USING payment_date::TIMESTAMPTZ;
    END IF;

    -- 4. pm_ma_renewal
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_renewal' AND column_name = 'current_end_date') THEN
        ALTER TABLE pm_ma_renewal ALTER COLUMN current_end_date TYPE TIMESTAMPTZ USING current_end_date::TIMESTAMPTZ;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_renewal' AND column_name = 'new_start_date') THEN
        ALTER TABLE pm_ma_renewal ALTER COLUMN new_start_date TYPE TIMESTAMPTZ USING new_start_date::TIMESTAMPTZ;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_renewal' AND column_name = 'new_end_date') THEN
        ALTER TABLE pm_ma_renewal ALTER COLUMN new_end_date TYPE TIMESTAMPTZ USING new_end_date::TIMESTAMPTZ;
    END IF;

    -- 5. pm_design_review
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_design_review' AND column_name = 'due_date') THEN
        ALTER TABLE pm_design_review ALTER COLUMN due_date TYPE TIMESTAMPTZ USING due_date::TIMESTAMPTZ;
    END IF;
END $$;
