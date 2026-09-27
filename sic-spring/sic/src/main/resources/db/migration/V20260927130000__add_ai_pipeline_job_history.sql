-- V20260927130000__add_ai_pipeline_job_history.sql
-- AI Full-Project Generator jobs were only kept in server memory (ConcurrentHashMap) and lost on
-- restart or after the in-memory TTL, with no way to look back at past runs. Persist them so the
-- wizard can show generation history.

CREATE TABLE IF NOT EXISTS pm_ai_pipeline_job (
    id UUID PRIMARY KEY,
    business_id UUID NOT NULL,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,

    created_by_user_id VARCHAR(100),
    project_name VARCHAR(255),
    prompt TEXT,
    duration_weeks INTEGER,
    ai_model VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
    message TEXT,
    project_id UUID,
    project_code VARCHAR(50),
    steps JSONB,
    counts JSONB,
    finished BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_pm_ai_pipeline_job_business_created
    ON pm_ai_pipeline_job (business_id, created_date DESC);
