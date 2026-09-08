-- V20260908170000__fix_pm_ma_renewal_columns.sql
-- Fix pm_ma_renewal schema to match PmMaRenewal.java entity

-- 1. If legacy ma_contract_id exists and contract_id does not, rename or add contract_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pm_ma_renewal' AND column_name = 'ma_contract_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pm_ma_renewal' AND column_name = 'contract_id'
    ) THEN
        ALTER TABLE pm_ma_renewal RENAME COLUMN ma_contract_id TO contract_id;
    END IF;
END $$;

-- 2. Add missing columns expected by PmMaRenewal entity
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS renewal_no VARCHAR(50);
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS contract_id UUID;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS current_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS new_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS new_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS proposed_amount NUMERIC(15, 2) DEFAULT 0.00;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'DRAFT';
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS new_contract_id UUID;
ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS remark TEXT;

-- 3. If renewal_status column exists from legacy schema, sync to status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pm_ma_renewal' AND column_name = 'renewal_status'
    ) THEN
        UPDATE pm_ma_renewal SET status = renewal_status WHERE status IS NULL AND renewal_status IS NOT NULL;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pm_ma_renewal' AND column_name = 'note'
    ) THEN
        UPDATE pm_ma_renewal SET remark = note WHERE remark IS NULL AND note IS NOT NULL;
    END IF;
END $$;
