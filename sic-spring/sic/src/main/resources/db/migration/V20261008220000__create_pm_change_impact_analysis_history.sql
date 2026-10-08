-- V20261008220000__create_pm_change_impact_analysis_history.sql
-- Description: Create pm_change_impact_analysis_history and add ai_rationale to pm_change_impact_analysis

ALTER TABLE pm_change_impact_analysis ADD COLUMN IF NOT EXISTS ai_rationale TEXT;

CREATE TABLE IF NOT EXISTS pm_change_impact_analysis_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_request_id UUID NOT NULL REFERENCES pm_change_request(id) ON DELETE CASCADE,
    analysis_id UUID,
    analysis_status VARCHAR(20) NOT NULL DEFAULT 'MANUAL',
    version_no INT NOT NULL DEFAULT 1,
    manday_impact INT,
    timeline_impact INT,
    dfd_impact TEXT,
    er_impact TEXT,
    ui_impact TEXT,
    api_impact TEXT,
    test_impact TEXT,
    cost_impact TEXT,
    ai_rationale TEXT,
    impacted_requirement_ids UUID[],
    impacted_spec_ids UUID[],
    impacted_task_ids UUID[],
    impacted_test_case_ids UUID[],
    impacted_bug_ids UUID[],
    impacted_diagram_ids UUID[],
    impacted_table_names TEXT[],
    impacted_project_ids UUID[],
    impacted_customer_ids UUID[],
    analyzed_at TIMESTAMPTZ DEFAULT NOW(),
    analyzed_by VARCHAR(100),
    created_by VARCHAR(100) DEFAULT 'system',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100),
    updated_date TIMESTAMPTZ,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    is_delete BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_change_impact_history_cr 
    ON pm_change_impact_analysis_history(change_request_id, created_date DESC);
