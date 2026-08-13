-- V20260815000000__document_management.sql
-- Migration script for Document Management: Delivery, User Manual, Document Version Control

-- 1. pm_delivery
CREATE TABLE IF NOT EXISTS pm_delivery (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID NOT NULL,
    project_id          UUID NOT NULL,
    delivery_code       VARCHAR(50) NOT NULL,
    delivery_title      VARCHAR(255) NOT NULL,
    delivery_type       VARCHAR(50) DEFAULT 'FINAL',
    contract_id         UUID,
    milestone_id        UUID,
    delivery_date       DATE,
    delivery_version    VARCHAR(20) DEFAULT '1.0',
    release_note        TEXT,
    delivery_summary    TEXT,
    status              VARCHAR(30) DEFAULT 'DRAFT',
    pm_approved_by      VARCHAR(255),
    pm_approved_date    TIMESTAMP WITH TIME ZONE,
    customer_signed_by  VARCHAR(255),
    customer_signed_date TIMESTAMP WITH TIME ZONE,
    attachment_group_id UUID,
    is_delete           BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by           VARCHAR(100),
    delete_date         TIMESTAMP WITH TIME ZONE,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    xmin                xid
);

CREATE INDEX IF NOT EXISTS idx_pm_delivery_project ON pm_delivery(project_id, business_id);

-- 2. pm_delivery_checklist
CREATE TABLE IF NOT EXISTS pm_delivery_checklist (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id     UUID NOT NULL REFERENCES pm_delivery(id),
    item_name       VARCHAR(255) NOT NULL,
    item_category   VARCHAR(50),
    is_checked      BOOLEAN NOT NULL DEFAULT FALSE,
    checked_by      VARCHAR(255),
    checked_date    TIMESTAMP WITH TIME ZONE,
    remark          TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_delete       BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by       VARCHAR(100),
    delete_date     TIMESTAMP WITH TIME ZONE,
    created_by      VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by      VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    xmin            xid
);

-- 3. pm_user_manual
CREATE TABLE IF NOT EXISTS pm_user_manual (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID NOT NULL,
    project_id          UUID NOT NULL,
    manual_code         VARCHAR(50) NOT NULL,
    manual_title        VARCHAR(255) NOT NULL,
    manual_type         VARCHAR(50) DEFAULT 'USER',
    version             VARCHAR(20) DEFAULT '1.0',
    related_spec_id     UUID,
    delivery_id         UUID,
    status              VARCHAR(30) DEFAULT 'DRAFT',
    attachment_group_id UUID,
    is_delete           BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by           VARCHAR(100),
    delete_date         TIMESTAMP WITH TIME ZONE,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    xmin                xid
);

CREATE INDEX IF NOT EXISTS idx_pm_user_manual_project ON pm_user_manual(project_id, business_id);

-- 4. pm_user_manual_section
CREATE TABLE IF NOT EXISTS pm_user_manual_section (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manual_id           UUID NOT NULL REFERENCES pm_user_manual(id),
    section_code        VARCHAR(50),
    section_title       VARCHAR(255) NOT NULL,
    content             TEXT,
    sort_order          INTEGER DEFAULT 0,
    permission_roles    TEXT,
    screenshot_group_id UUID,
    is_delete           BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by           VARCHAR(100),
    delete_date         TIMESTAMP WITH TIME ZONE,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    xmin                xid
);

-- 5. Enhancements to pm_document_version
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS document_code VARCHAR(100);
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS previous_version_id UUID;
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS approval_status VARCHAR(30) DEFAULT 'DRAFT';
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255);
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS approved_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS snapshot_data TEXT;
ALTER TABLE pm_document_version ADD COLUMN IF NOT EXISTS file_ref_id UUID;
