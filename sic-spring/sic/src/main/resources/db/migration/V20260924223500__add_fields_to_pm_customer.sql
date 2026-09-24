-- V20260924223500__add_fields_to_pm_customer.sql
-- Add title, branch, individual names, and country fields to pm_customer to match business-create

ALTER TABLE public.pm_customer
    ADD COLUMN IF NOT EXISTS branch_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS title_id UUID REFERENCES db_title(id),
    ADD COLUMN IF NOT EXISTS first_name_en VARCHAR(100),
    ADD COLUMN IF NOT EXISTS middle_name_en VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name_en VARCHAR(100),
    ADD COLUMN IF NOT EXISTS first_name_local VARCHAR(100),
    ADD COLUMN IF NOT EXISTS middle_name_local VARCHAR(100),
    ADD COLUMN IF NOT EXISTS last_name_local VARCHAR(100),
    ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES db_country(id),
    ADD COLUMN IF NOT EXISTS support_local_address BOOLEAN DEFAULT FALSE;

-- Backfill first_name_en and first_name_local with company_name for existing records if null
UPDATE public.pm_customer
SET first_name_en = company_name_en
WHERE first_name_en IS NULL AND company_name_en IS NOT NULL;

UPDATE public.pm_customer
SET first_name_local = company_name_local
WHERE first_name_local IS NULL AND company_name_local IS NOT NULL;
