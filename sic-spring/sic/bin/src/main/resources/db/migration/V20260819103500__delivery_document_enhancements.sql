-- V20260819103500__delivery_document_enhancements.sql
-- Migration script for Enterprise Delivery Document & User Manual full schema sync

-- 1. Ensure all columns exist in pm_delivery (matching PmDelivery.java)
CREATE TABLE IF NOT EXISTS pm_delivery (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID NOT NULL,
    project_id          UUID NOT NULL,
    delivery_code       VARCHAR(50) NOT NULL DEFAULT 'DEL-001',
    delivery_title      VARCHAR(255) NOT NULL DEFAULT 'Delivery',
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
    is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
    is_delete           BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by           VARCHAR(100),
    delete_date         TIMESTAMP WITH TIME ZONE,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS delivery_code VARCHAR(50);
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS delivery_title VARCHAR(255);
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS delivery_type VARCHAR(50) DEFAULT 'FINAL';
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS contract_id UUID;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS milestone_id UUID;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS delivery_date DATE;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS delivery_version VARCHAR(20) DEFAULT '1.0';
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS release_note TEXT;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS delivery_summary TEXT;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'DRAFT';
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS pm_approved_by VARCHAR(255);
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS pm_approved_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS customer_signed_by VARCHAR(255);
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS customer_signed_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_delivery ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;

-- If delivery_code or delivery_title are null for existing records, set default
UPDATE pm_delivery SET delivery_code = 'DEL-' || SUBSTRING(id::text, 1, 8) WHERE delivery_code IS NULL;
UPDATE pm_delivery SET delivery_title = 'Delivery Document' WHERE delivery_title IS NULL;

CREATE INDEX IF NOT EXISTS idx_pm_delivery_project ON pm_delivery(project_id, business_id);

-- 2. Ensure all columns exist in pm_user_manual (matching PmUserManual.java)
CREATE TABLE IF NOT EXISTS pm_user_manual (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID NOT NULL,
    project_id          UUID NOT NULL,
    manual_code         VARCHAR(50) NOT NULL DEFAULT 'MAN-001',
    manual_title        VARCHAR(255) NOT NULL DEFAULT 'User Manual',
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
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS manual_code VARCHAR(50);
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS manual_title VARCHAR(255);
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS manual_type VARCHAR(50) DEFAULT 'USER';
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT '1.0';
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS related_spec_id UUID;
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS delivery_id UUID;
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'DRAFT';
ALTER TABLE pm_user_manual ADD COLUMN IF NOT EXISTS attachment_group_id UUID;

UPDATE pm_user_manual SET manual_code = 'MAN-' || SUBSTRING(id::text, 1, 8) WHERE manual_code IS NULL;
UPDATE pm_user_manual SET manual_title = 'User Manual' WHERE manual_title IS NULL;

CREATE INDEX IF NOT EXISTS idx_pm_user_manual_project ON pm_user_manual(project_id, business_id);

-- 3. Ensure columns exist in pm_delivery_checklist (matching PmDeliveryChecklist.java)
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
    updated_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS item_name VARCHAR(255);
ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS item_category VARCHAR(50);
ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS is_checked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS checked_by VARCHAR(255);
ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS checked_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE pm_delivery_checklist ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 4. pm_delivery_item for Data Linkage
CREATE TABLE IF NOT EXISTS pm_delivery_item (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id     UUID NOT NULL REFERENCES pm_delivery(id) ON DELETE CASCADE,
    item_type       VARCHAR(50) NOT NULL,
    item_id         UUID NOT NULL,
    item_code       VARCHAR(50),
    item_title      VARCHAR(255),
    item_status     VARCHAR(50),
    remark          TEXT,
    sort_order      INTEGER DEFAULT 0,
    is_delete       BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by       VARCHAR(100),
    delete_date     TIMESTAMP WITH TIME ZONE,
    created_by      VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by      VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pm_delivery_item_delivery ON pm_delivery_item(delivery_id);
CREATE INDEX IF NOT EXISTS idx_pm_delivery_item_target ON pm_delivery_item(item_type, item_id);