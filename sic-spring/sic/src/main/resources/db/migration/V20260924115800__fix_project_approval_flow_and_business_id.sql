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

        -- Ensure default PROJECT approval flow exists for this business
        IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE business_id = v_business_id AND document_type = 'PROJECT' AND is_delete = false) THEN
            INSERT INTO pm_approval_flow (
                id, business_id, flow_code, flow_name, document_type, approval_mode, is_active, description, created_by, created_date, is_delete
            ) VALUES (
                gen_random_uuid(),
                v_business_id,
                'DEF-PROJECT-' || substring(replace(v_business_id::text, '-', ''), 1, 8),
                'Default Project Approval',
                'PROJECT',
                'SINGLE',
                true,
                'สร้างอัตโนมัติสำหรับกระบวนการอนุมัติโครงการ',
                'system',
                NOW(),
                false
            );
        END IF;
    END IF;
END $$;
