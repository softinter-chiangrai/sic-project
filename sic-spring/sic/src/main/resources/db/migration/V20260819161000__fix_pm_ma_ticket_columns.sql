-- V20260819161000__fix_pm_ma_ticket_columns.sql
-- Fix pm_ma_ticket schema to match PmMaTicket.java entity

CREATE TABLE IF NOT EXISTS pm_ma_ticket (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID,
    ticket_no           VARCHAR(50) NOT NULL,
    customer_id         UUID,
    project_id          UUID,
    contract_id         UUID,
    ticket_type         VARCHAR(30) NOT NULL DEFAULT 'BUG_SUPPORT',
    title               VARCHAR(255) NOT NULL,
    description         TEXT NOT NULL DEFAULT '',
    severity            VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status              VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assigned_to         VARCHAR(100),
    reported_by         VARCHAR(100) NOT NULL DEFAULT 'Customer',
    reported_date       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    target_response_date TIMESTAMP WITH TIME ZONE,
    target_resolve_date TIMESTAMP WITH TIME ZONE,
    resolved_date       TIMESTAMP WITH TIME ZONE,
    closed_date         TIMESTAMP WITH TIME ZONE,
    resolution_summary  TEXT,
    is_delete           BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by           VARCHAR(100),
    delete_date         TIMESTAMP WITH TIME ZONE,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Drop NOT NULL on legacy ma_contract_id column if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'pm_ma_ticket' AND column_name = 'ma_contract_id'
    ) THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN ma_contract_id DROP NOT NULL;
    END IF;
END $$;

-- Add missing columns to existing pm_ma_ticket table
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS contract_id UUID;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS ticket_type VARCHAR(30) DEFAULT 'BUG_SUPPORT';
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS reported_by VARCHAR(100) DEFAULT 'Customer';
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS target_response_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS target_resolve_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS closed_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS resolution_summary TEXT;

-- Update column lengths if needed
ALTER TABLE pm_ma_ticket ALTER COLUMN ticket_no TYPE VARCHAR(50);
ALTER TABLE pm_ma_ticket ALTER COLUMN status TYPE VARCHAR(30);
