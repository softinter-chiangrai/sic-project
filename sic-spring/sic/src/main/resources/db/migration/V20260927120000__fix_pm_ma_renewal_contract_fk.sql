-- V20260927120000__fix_pm_ma_renewal_contract_fk.sql
-- pm_ma_renewal.contract_id was renamed from the legacy ma_contract_id column (V20260908170000),
-- but the leftover fk_renewal_ma constraint still points at pm_ma_contract, a table with no
-- Java entity/service in this codebase. PmMaRenewalServiceImpl already treats contract_id as a
-- pm_customer_contract reference (see mapRequestToEntity), so the FK must match that, or every
-- MA renewal insert (manual or AI-generated) fails with "violates foreign key constraint fk_renewal_ma".

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'pm_ma_renewal' AND constraint_name = 'fk_renewal_ma'
    ) THEN
        ALTER TABLE pm_ma_renewal DROP CONSTRAINT fk_renewal_ma;
    END IF;
END $$;

DO $$
BEGIN
    -- Added as NOT VALID: enforces the correct reference for all new/updated rows without
    -- touching or deleting any existing (possibly orphaned legacy) data.
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'pm_ma_renewal' AND constraint_name = 'fk_renewal_contract'
    ) THEN
        ALTER TABLE pm_ma_renewal
            ADD CONSTRAINT fk_renewal_contract FOREIGN KEY (contract_id) REFERENCES pm_customer_contract(id) NOT VALID;
    END IF;
END $$;
