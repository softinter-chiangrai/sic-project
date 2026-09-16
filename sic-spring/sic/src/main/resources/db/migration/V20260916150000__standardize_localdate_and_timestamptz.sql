-- V20260916150000__standardize_localdate_and_timestamptz.sql
-- Standardize calendar dates to DATE and timestamps to TIMESTAMPTZ across the database

DO $$
BEGIN
    -- 1. pm_customer_project (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_project' AND column_name = 'start_date') THEN
        ALTER TABLE pm_customer_project ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
        ALTER TABLE pm_customer_project ALTER COLUMN start_date DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_project' AND column_name = 'planned_end_date') THEN
        ALTER TABLE pm_customer_project ALTER COLUMN planned_end_date TYPE DATE USING planned_end_date::DATE;
        ALTER TABLE pm_customer_project ALTER COLUMN planned_end_date DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_project' AND column_name = 'actual_end_date') THEN
        ALTER TABLE pm_customer_project ALTER COLUMN actual_end_date TYPE DATE USING actual_end_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_project' AND column_name = 'budget_manday') THEN
        ALTER TABLE pm_customer_project ALTER COLUMN budget_manday DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_project' AND column_name = 'status') THEN
        ALTER TABLE pm_customer_project ALTER COLUMN status DROP NOT NULL;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_project' AND column_name = 'priority') THEN
        ALTER TABLE pm_customer_project ALTER COLUMN priority DROP NOT NULL;
    END IF;

    -- 2. pm_customer_contract (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_contract' AND column_name = 'start_date') THEN
        ALTER TABLE pm_customer_contract ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_customer_contract' AND column_name = 'end_date') THEN
        ALTER TABLE pm_customer_contract ALTER COLUMN end_date TYPE DATE USING end_date::DATE;
    END IF;

    -- 3. pm_phase (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_phase' AND column_name = 'start_date') THEN
        ALTER TABLE pm_phase ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_phase' AND column_name = 'end_date') THEN
        ALTER TABLE pm_phase ALTER COLUMN end_date TYPE DATE USING end_date::DATE;
    END IF;

    -- 4. pm_milestone (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_milestone' AND column_name = 'due_date') THEN
        ALTER TABLE pm_milestone ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
    END IF;

    -- 5. pm_work_package (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_work_package' AND column_name = 'start_date') THEN
        ALTER TABLE pm_work_package ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_work_package' AND column_name = 'end_date') THEN
        ALTER TABLE pm_work_package ALTER COLUMN end_date TYPE DATE USING end_date::DATE;
    END IF;

    -- 6. pm_task (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_task' AND column_name = 'start_date') THEN
        ALTER TABLE pm_task ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_task' AND column_name = 'end_date') THEN
        ALTER TABLE pm_task ALTER COLUMN end_date TYPE DATE USING end_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_task' AND column_name = 'actual_start') THEN
        ALTER TABLE pm_task ALTER COLUMN actual_start TYPE DATE USING actual_start::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_task' AND column_name = 'actual_end') THEN
        ALTER TABLE pm_task ALTER COLUMN actual_end TYPE DATE USING actual_end::DATE;
    END IF;

    -- 7. pm_invoice (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_invoice' AND column_name = 'invoice_date') THEN
        ALTER TABLE pm_invoice ALTER COLUMN invoice_date TYPE DATE USING invoice_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_invoice' AND column_name = 'due_date') THEN
        ALTER TABLE pm_invoice ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_invoice' AND column_name = 'payment_date') THEN
        ALTER TABLE pm_invoice ALTER COLUMN payment_date TYPE DATE USING payment_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_invoice' AND column_name = 'issue_date') THEN
        ALTER TABLE pm_invoice ALTER COLUMN issue_date TYPE DATE USING issue_date::DATE;
    END IF;

    -- 8. pm_payment (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_payment' AND column_name = 'payment_date') THEN
        ALTER TABLE pm_payment ALTER COLUMN payment_date TYPE DATE USING payment_date::DATE;
    END IF;

    -- 9. pm_ma_contract (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_contract' AND column_name = 'start_date') THEN
        ALTER TABLE pm_ma_contract ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_contract' AND column_name = 'end_date') THEN
        ALTER TABLE pm_ma_contract ALTER COLUMN end_date TYPE DATE USING end_date::DATE;
    END IF;

    -- 10. pm_ma_renewal (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_renewal' AND column_name = 'current_end_date') THEN
        ALTER TABLE pm_ma_renewal ALTER COLUMN current_end_date TYPE DATE USING current_end_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_renewal' AND column_name = 'new_start_date') THEN
        ALTER TABLE pm_ma_renewal ALTER COLUMN new_start_date TYPE DATE USING new_start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_renewal' AND column_name = 'new_end_date') THEN
        ALTER TABLE pm_ma_renewal ALTER COLUMN new_end_date TYPE DATE USING new_end_date::DATE;
    END IF;

    -- 11. pm_ma_ticket (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'start_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN start_date TYPE DATE USING start_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'end_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN end_date TYPE DATE USING end_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'due_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'target_response_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN target_response_date TYPE DATE USING target_response_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'target_resolve_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN target_resolve_date TYPE DATE USING target_resolve_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'closed_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN closed_date TYPE DATE USING closed_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_ma_ticket' AND column_name = 'resolved_date') THEN
        ALTER TABLE pm_ma_ticket ALTER COLUMN resolved_date TYPE DATE USING resolved_date::DATE;
    END IF;

    -- 12. pm_delivery (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_delivery' AND column_name = 'delivery_date') THEN
        ALTER TABLE pm_delivery ALTER COLUMN delivery_date TYPE DATE USING delivery_date::DATE;
    END IF;

    -- 13. pm_design_review (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_design_review' AND column_name = 'due_date') THEN
        ALTER TABLE pm_design_review ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
    END IF;

    -- 14. pm_bug (Calendar dates -> DATE)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_bug' AND column_name = 'fix_due_date') THEN
        ALTER TABLE pm_bug ALTER COLUMN fix_due_date TYPE DATE USING fix_due_date::DATE;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pm_bug' AND column_name = 'due_date') THEN
        ALTER TABLE pm_bug ALTER COLUMN due_date TYPE DATE USING due_date::DATE;
    END IF;
END $$;
