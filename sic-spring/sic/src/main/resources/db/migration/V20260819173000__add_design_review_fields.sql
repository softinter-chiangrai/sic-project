-- V20260819173000__add_design_review_fields.sql

ALTER TABLE pm_design_review
    ADD COLUMN IF NOT EXISTS review_code VARCHAR(30),
    ADD COLUMN IF NOT EXISTS title VARCHAR(255),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'Medium',
    ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(100),
    ADD COLUMN IF NOT EXISTS figma_url TEXT,
    ADD COLUMN IF NOT EXISTS embed_mode VARCHAR(20) DEFAULT 'prototype',
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_design_review_project ON pm_design_review(project_id);
CREATE INDEX IF NOT EXISTS idx_design_review_code ON pm_design_review(review_code);
