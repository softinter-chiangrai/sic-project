-- Migration: V20260924115800__fix_project_approval_flow_and_business_id.sql
-- Description: Backfill business_id for PROJECT and all approval flows where business_id is NULL

DO $$
DECLARE
    v_business_id UUID;
BEGIN
    -- 1. Find active primary business
    SELECT id INTO v_business_id 
    FROM su_business 
    WHERE is_delete = false 
    ORDER BY created_date ASC 
    LIMIT 1;

    IF v_business_id IS NOT NULL THEN
        -- Update all flows where business_id is NULL
        UPDATE pm_approval_flow
        SET business_id = v_business_id,
            updated_date = NOW()
        WHERE business_id IS NULL;
    END IF;
END $$;
