-- V20260824161500__fix_pm_invoice_payment_columns.sql
-- Add missing columns to pm_invoice and pm_payment to match PmInvoice and PmPayment entities

-- Fix pm_invoice columns
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS delivery_id UUID;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS issue_date DATE;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS vat_rate NUMERIC(5,2) DEFAULT 7.00;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS vat_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS paid_amount NUMERIC(15,2) DEFAULT 0;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) DEFAULT 'DRAFT';
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS receipt_file_ref TEXT;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS remark TEXT;

-- Drop NOT NULL constraints if existing legacy columns have them, or copy legacy date if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_invoice' AND column_name = 'contract_id'
    ) THEN
        ALTER TABLE pm_invoice ALTER COLUMN contract_id DROP NOT NULL;
    END IF;

    -- Sync issue_date from invoice_date if issue_date is null
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_invoice' AND column_name = 'invoice_date'
    ) THEN
        UPDATE pm_invoice SET issue_date = invoice_date WHERE issue_date IS NULL AND invoice_date IS NOT NULL;
    END IF;

    -- Sync subtotal_amount from amount if subtotal_amount is 0 or null
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_invoice' AND column_name = 'amount'
    ) THEN
        UPDATE pm_invoice SET subtotal_amount = amount WHERE (subtotal_amount IS NULL OR subtotal_amount = 0) AND amount IS NOT NULL;
    END IF;

    -- Sync vat_amount from vat if vat_amount is 0 or null
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_invoice' AND column_name = 'vat'
    ) THEN
        UPDATE pm_invoice SET vat_amount = vat WHERE (vat_amount IS NULL OR vat_amount = 0) AND vat IS NOT NULL;
    END IF;
END $$;

-- Fix pm_payment columns
ALTER TABLE pm_payment ADD COLUMN IF NOT EXISTS payment_no VARCHAR(50) DEFAULT 'PAY-TEMP';
ALTER TABLE pm_payment ADD COLUMN IF NOT EXISTS bank_name VARCHAR(100);
ALTER TABLE pm_payment ADD COLUMN IF NOT EXISTS receipt_file TEXT;
ALTER TABLE pm_payment ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'PAID';
ALTER TABLE pm_payment ADD COLUMN IF NOT EXISTS notes TEXT;

DO $$
BEGIN
    -- Sync notes from note if present
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pm_payment' AND column_name = 'note'
    ) THEN
        UPDATE pm_payment SET notes = note WHERE notes IS NULL AND note IS NOT NULL;
    END IF;
END $$;
