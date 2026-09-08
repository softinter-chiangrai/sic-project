-- V20260904110000__fix_pm_invoice_item_columns.sql
-- Add missing columns to pm_invoice_item to match PmInvoiceItem entity

ALTER TABLE pm_invoice_item ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) DEFAULT '';
ALTER TABLE pm_invoice_item ADD COLUMN IF NOT EXISTS amount NUMERIC(18,2) DEFAULT 0;
ALTER TABLE pm_invoice_item ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

DO $$
BEGIN
    -- Sync amount from legacy total_price if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_invoice_item' AND column_name = 'total_price'
    ) THEN
        UPDATE pm_invoice_item SET amount = COALESCE(total_price, 0) WHERE amount = 0;
    END IF;

    -- Make description nullable and TEXT if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_invoice_item' AND column_name = 'description'
    ) THEN
        ALTER TABLE pm_invoice_item ALTER COLUMN description DROP NOT NULL;
        ALTER TABLE pm_invoice_item ALTER COLUMN description TYPE TEXT;
    END IF;

    -- Sync item_name from description if item_name is empty
    UPDATE pm_invoice_item SET item_name = COALESCE(SUBSTRING(description FROM 1 FOR 255), 'Item') WHERE item_name = '' OR item_name IS NULL;
END $$;
