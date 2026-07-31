-- V20260731160000__change_request_upgrade.sql

-- 1. เพิ่ม project_id ใน pm_change_request (หากยังไม่มี)
ALTER TABLE pm_change_request ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES pm_customer_project(id);

-- 2. สร้างตาราง pm_cr_assignee
CREATE TABLE IF NOT EXISTS pm_cr_assignee (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_request_id UUID NOT NULL REFERENCES pm_change_request(id) ON DELETE CASCADE,
    user_id VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
    completed_at TIMESTAMPTZ,
    created_by VARCHAR(100) DEFAULT 'system',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cr_assignee_request ON pm_cr_assignee (change_request_id);
CREATE INDEX IF NOT EXISTS idx_cr_assignee_user ON pm_cr_assignee (user_id);

-- 3. สร้างตาราง pm_change_impact
CREATE TABLE IF NOT EXISTS pm_change_impact (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_request_id UUID NOT NULL REFERENCES pm_change_request(id) ON DELETE CASCADE,
    impacted_type VARCHAR(50) NOT NULL,
    impacted_id UUID NOT NULL,
    impacted_title VARCHAR(255),
    impact_level VARCHAR(20) DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH
    created_by VARCHAR(100) DEFAULT 'system',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_cr_impact_request ON pm_change_impact (change_request_id);
