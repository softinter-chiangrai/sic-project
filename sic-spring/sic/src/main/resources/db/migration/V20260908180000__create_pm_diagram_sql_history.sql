-- Create table for storing ER diagram SQL generation history and migration diffs
CREATE TABLE IF NOT EXISTS pm_diagram_sql_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tab_id VARCHAR(100) NOT NULL,
    page_name VARCHAR(255),
    version_no INT NOT NULL,
    generation_type VARCHAR(20) NOT NULL DEFAULT 'FULL', -- 'FULL' or 'MIGRATION'
    vendor VARCHAR(50) NOT NULL DEFAULT 'postgresql',
    engine VARCHAR(20) NOT NULL DEFAULT 'ai',          -- 'ai' or 'parser'
    summary_note TEXT,
    schema_json TEXT,
    generated_sql TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE INDEX IF NOT EXISTS idx_pm_diagram_sql_history_tab_id ON pm_diagram_sql_history(tab_id);
CREATE INDEX IF NOT EXISTS idx_pm_diagram_sql_history_created_at ON pm_diagram_sql_history(created_at DESC);
