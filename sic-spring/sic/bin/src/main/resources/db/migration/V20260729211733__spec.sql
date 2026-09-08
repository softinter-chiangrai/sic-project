-- ============================================================
-- SCRIPT: MIGRATION SPECIFICATION (ฉบับรันจบ)
-- ============================================================

-- 1. ลบ 4 ฟิลด์เก่า (ถ้ายังมีอยู่)
ALTER TABLE pm_specification DROP COLUMN IF EXISTS related_requirement;
ALTER TABLE pm_specification DROP COLUMN IF EXISTS related_diagram;
ALTER TABLE pm_specification DROP COLUMN IF EXISTS head_confirm_status;
ALTER TABLE pm_specification DROP COLUMN IF EXISTS customer_confirm_status;

-- 2. เพิ่ม 2 ฟิลด์ใหม่
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'DRAFT';
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS approval_flow_id UUID;

-- 3. บังคับให้ requirement_id ไม่เป็น NULL (ถ้ามี NULL ให้ตั้งค่าเริ่มต้น)
UPDATE pm_specification SET requirement_id = '00000000-0000-0000-0000-000000000000' WHERE requirement_id IS NULL;
ALTER TABLE pm_specification ALTER COLUMN requirement_id SET NOT NULL;

-- 4. สร้างตาราง UI Actions
CREATE TABLE IF NOT EXISTS pm_spec_ui_action (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID NOT NULL REFERENCES pm_specification(id) ON DELETE CASCADE,
    action_name VARCHAR(100) NOT NULL,
    permission VARCHAR(100),
    url_path VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

-- 5. สร้างตาราง Validation Rules
CREATE TABLE IF NOT EXISTS pm_spec_validation_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    spec_id UUID NOT NULL REFERENCES pm_specification(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(50) NOT NULL,
    rule_value VARCHAR(255),
    error_message VARCHAR(255),
    sort_order INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(100),
    updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

-- 6. สร้าง Index (เพื่อความเร็ว)
CREATE INDEX IF NOT EXISTS idx_spec_ui_action_spec_id ON pm_spec_ui_action(spec_id);
CREATE INDEX IF NOT EXISTS idx_spec_validation_rule_spec_id ON pm_spec_validation_rule(spec_id);

DROP TABLE IF EXISTS pm_spec_ui_action CASCADE;
DROP TABLE IF EXISTS pm_spec_validation_rule CASCADE;
-- จบ


-- ============================================================
-- Specification Module Tables (Upgrade existing pm_specification)
-- ใช้สำหรับรันต่อจาก migrations ก่อนหน้า (V20260717162220__, V20260722121741__, V20260729211733__)
-- ไม่สร้างตาราง pm_specification ซ้ำ แต่เพิ่มคอลัมน์ที่ขาดและสร้างตารางย่อย
-- ============================================================

-- 1. เพิ่มคอลัมน์ที่ขาดในตาราง pm_specification ที่มีอยู่แล้ว
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS specification_code VARCHAR(50);
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS module VARCHAR(100);
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS owner VARCHAR(100);
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium';
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS remark TEXT;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS upload_group_id UUID;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS ai_generated_at TIMESTAMP;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS generated_from_requirement_id UUID;
ALTER TABLE pm_specification ADD COLUMN IF NOT EXISTS generated_from_diagram_id UUID;

-- 2. เติมค่า specification_code จาก spec_code (ถ้ายังไม่มี)
UPDATE pm_specification SET specification_code = spec_code WHERE specification_code IS NULL AND spec_code IS NOT NULL;
ALTER TABLE pm_specification ALTER COLUMN specification_code SET NOT NULL;

-- 3. เพิ่ม unique constraint สำหรับ specification_code (ถ้ายังไม่มี)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pm_specification_specification_code_key') THEN
        ALTER TABLE pm_specification ADD CONSTRAINT pm_specification_specification_code_key UNIQUE (specification_code);
    END IF;
END $$;

-- 4. สร้างตารางย่อยทั้งหมด (ถ้ายังไม่มี) พร้อม foreign key ไปยัง pm_specification

-- 4.1 Mapping Specification - Requirement
CREATE TABLE IF NOT EXISTS pm_specification_requirement (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    requirement_id UUID NOT NULL,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_req_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE,
    CONSTRAINT fk_spec_req_req FOREIGN KEY (requirement_id) REFERENCES pm_requirement(id)
);

CREATE INDEX IF NOT EXISTS idx_spec_req_spec ON pm_specification_requirement(specification_id);
CREATE INDEX IF NOT EXISTS idx_spec_req_req ON pm_specification_requirement(requirement_id);

-- 4.2 Screen Specification
CREATE TABLE IF NOT EXISTS pm_specification_screen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    screen_name VARCHAR(255) NOT NULL,
    description TEXT,
    navigation TEXT,
    mockup_url VARCHAR(500),
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_screen_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spec_screen_spec ON pm_specification_screen(specification_id);

-- 4.3 Field Specification
CREATE TABLE IF NOT EXISTS pm_specification_field (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    max_length INTEGER,
    default_value VARCHAR(255),
    description TEXT,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_field_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spec_field_spec ON pm_specification_field(specification_id);

-- 4.4 Validation Rules (ตารางใหม่ แยกจาก pm_spec_validation_rule ที่มีอยู่แล้ว)
CREATE TABLE IF NOT EXISTS pm_specification_validation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    validation_type VARCHAR(50) NOT NULL,
    rule TEXT NOT NULL,
    error_message TEXT,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_val_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spec_val_spec ON pm_specification_validation(specification_id);

-- 4.5 Business Rules
CREATE TABLE IF NOT EXISTS pm_specification_business_rule (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'Medium',
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_rule_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spec_rule_spec ON pm_specification_business_rule(specification_id);

-- 4.6 API Specification
CREATE TABLE IF NOT EXISTS pm_specification_api (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    http_method VARCHAR(10) NOT NULL,
    url VARCHAR(500) NOT NULL,
    request_schema JSONB,
    response_schema JSONB,
    authentication VARCHAR(50),
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_api_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spec_api_spec ON pm_specification_api(specification_id);

-- 4.7 Version History (Snapshot)
CREATE TABLE IF NOT EXISTS pm_specification_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    specification_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    specification_data JSONB NOT NULL,
    change_summary TEXT,
    changed_by VARCHAR(100) NOT NULL,
    changed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_delete BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_spec_ver_spec FOREIGN KEY (specification_id) REFERENCES pm_specification(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_spec_ver_spec ON pm_specification_version(specification_id);
CREATE INDEX IF NOT EXISTS idx_spec_ver_number ON pm_specification_version(version_number);

-- ============================================================
-- จบการอัปเกรด Specification Module
-- ============================================================


DROP TABLE IF EXISTS pm_specification_requirement;

CREATE INDEX IF NOT EXISTS idx_trace_source_type_id ON pm_trace_link(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_trace_target_type_id ON pm_trace_link(target_type, target_id);

DROP TABLE IF EXISTS pm_change_impact_analysis CASCADE;
DROP TABLE IF EXISTS pm_requirement_change_request CASCADE;

-- 1. สร้างตาราง Change Request
CREATE TABLE IF NOT EXISTS pm_change_request (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES pm_customer_project(id),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    change_reason VARCHAR(50) NOT NULL,
    requester_id VARCHAR(100) NOT NULL,
    assignee_id VARCHAR(100) NOT NULL,
    target_version VARCHAR(20),
    status VARCHAR(20) DEFAULT 'DRAFT',
    created_by VARCHAR(100) DEFAULT 'system',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ
);

-- 2. สร้างตาราง Edit Session
CREATE TABLE IF NOT EXISTS pm_edit_session (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_request_id UUID NOT NULL REFERENCES pm_change_request(id),
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    assignee_id VARCHAR(100) NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100) DEFAULT 'system',
    created_date TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(100) DEFAULT 'system',
    updated_date TIMESTAMPTZ DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_cr_target ON pm_change_request (target_type, target_id);
CREATE INDEX idx_cr_status ON pm_change_request (status);
CREATE INDEX idx_session_target ON pm_edit_session (target_type, target_id);
CREATE INDEX idx_session_active ON pm_edit_session (is_active);

ALTER TABLE pm_edit_session ADD COLUMN edit_type VARCHAR(20) DEFAULT 'CHANGE_REQUEST';