-- V20260917100500__add_contract_details_to_pm_customer_contract.sql

-- Add missing columns to pm_customer_contract
ALTER TABLE public.pm_customer_contract
    ADD COLUMN IF NOT EXISTS payment_terms TEXT,
    ADD COLUMN IF NOT EXISTS scope_summary TEXT,
    ADD COLUMN IF NOT EXISTS sign_status VARCHAR(20) DEFAULT 'Draft',
    ADD COLUMN IF NOT EXISTS renewal_status VARCHAR(50),
    ADD COLUMN IF NOT EXISTS file_attachment UUID;

-- Add index for sign_status
CREATE INDEX IF NOT EXISTS idx_contract_sign_status ON public.pm_customer_contract (sign_status);
