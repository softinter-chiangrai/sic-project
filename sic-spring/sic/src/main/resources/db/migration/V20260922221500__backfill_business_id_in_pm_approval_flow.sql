-- ==============================================================================
-- Migration: V20260922221500__backfill_business_id_in_pm_approval_flow.sql
-- Description: Backfill business_id for pm_approval_flow records where business_id is NULL
-- ==============================================================================

DO $$
DECLARE
    v_business_id UUID;
BEGIN
    SELECT id INTO v_business_id 
    FROM su_business 
    WHERE is_delete = false 
    ORDER BY created_date ASC 
    LIMIT 1;

    IF v_business_id IS NOT NULL THEN
        UPDATE pm_approval_flow
        SET business_id = v_business_id,
            updated_date = NOW()
        WHERE business_id IS NULL;
    END IF;
END $$;
