-- ==============================================================================
-- Migration: V20260913153000__fix_duplicate_pm_approval_flow_and_add_constraints.sql
-- Description: Clean up duplicate rows in pm_approval_flow and add PRIMARY KEY
--              and UNIQUE constraints to prevent duplicate IDs/flow_codes.
-- ==============================================================================
-- 1. Deduplicate pm_approval_flow by ID (keep latest updated/created)
DELETE FROM pm_approval_flow a USING (
        SELECT ctid,
            ROW_NUMBER() OVER (
                PARTITION BY id
                ORDER BY updated_date DESC,
                    created_date DESC
            ) as rnum
        FROM pm_approval_flow
    ) b
WHERE a.ctid = b.ctid
    AND b.rnum > 1;
-- 2. Deduplicate pm_approval_flow by flow_code (keep latest updated/created)
DELETE FROM pm_approval_flow a USING (
        SELECT ctid,
            ROW_NUMBER() OVER (
                PARTITION BY flow_code
                ORDER BY updated_date DESC,
                    created_date DESC
            ) as rnum
        FROM pm_approval_flow
    ) b
WHERE a.ctid = b.ctid
    AND b.rnum > 1;
-- 3. Deduplicate pm_approval_flow_step by ID (if any)
DELETE FROM pm_approval_flow_step a USING (
        SELECT ctid,
            ROW_NUMBER() OVER (
                PARTITION BY id
                ORDER BY updated_date DESC,
                    created_date DESC
            ) as rnum
        FROM pm_approval_flow_step
    ) b
WHERE a.ctid = b.ctid
    AND b.rnum > 1;
-- 4. Add PRIMARY KEY constraint on pm_approval_flow (id)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pm_approval_flow_pkey'
) THEN
ALTER TABLE pm_approval_flow
ADD CONSTRAINT pm_approval_flow_pkey PRIMARY KEY (id);
END IF;
END $$;
-- 5. Add UNIQUE constraint on pm_approval_flow (flow_code)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pm_approval_flow_flow_code_key'
) THEN
ALTER TABLE pm_approval_flow
ADD CONSTRAINT pm_approval_flow_flow_code_key UNIQUE (flow_code);
END IF;
END $$;
-- 6. Add PRIMARY KEY constraint on pm_approval_flow_step (id)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'pm_approval_flow_step_pkey'
) THEN
ALTER TABLE pm_approval_flow_step
ADD CONSTRAINT pm_approval_flow_step_pkey PRIMARY KEY (id);
END IF;
END $$;