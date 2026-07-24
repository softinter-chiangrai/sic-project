
CREATE TYPE trace_relationship AS ENUM (
    'DESIGNED_BY',
    'IMPLEMENTED_BY',
    'DOCUMENTED_BY',
    'VERIFIED_BY',
    'FAILED_BY',
    'AFFECTED_BY',
    'RELATED_TO'
);

CREATE TABLE pm_trace_link (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id UUID NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    relationship_type trace_relationship NOT NULL,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ
);

CREATE INDEX idx_trace_source ON pm_trace_link (source_type, source_id);
CREATE INDEX idx_trace_target ON pm_trace_link (target_type, target_id);
CREATE INDEX idx_trace_project ON pm_trace_link (project_id);
CREATE INDEX idx_trace_relationship ON pm_trace_link (relationship_type);

ALTER TABLE pm_trace_link ADD CONSTRAINT fk_trace_project
    FOREIGN KEY (project_id) REFERENCES pm_customer_project(id);


-- เพิ่มคอลัมน์ requirement_id, version, is_active
ALTER TABLE pm_specification ADD COLUMN requirement_id UUID;
ALTER TABLE pm_specification ADD COLUMN version VARCHAR(20) DEFAULT '1.0';
ALTER TABLE pm_specification ADD COLUMN is_active BOOLEAN DEFAULT TRUE;

-- เพิ่ม Foreign Key และ Index
ALTER TABLE pm_specification ADD CONSTRAINT fk_spec_requirement 
    FOREIGN KEY (requirement_id) REFERENCES pm_requirement(id);
CREATE INDEX idx_spec_requirement ON pm_specification (requirement_id);

ALTER TABLE pm_specification RENAME COLUMN related_er TO related_diagram;


-- เพิ่มคอลัมน์ subject และ attachment_group_id ถ้ายังไม่มี
ALTER TABLE pm_comment ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
ALTER TABLE pm_comment ADD COLUMN IF NOT EXISTS attachment_group_id UUID;

-- สร้าง index สำหรับ parent_comment_id เพื่อเพิ่มประสิทธิภาพการ query
CREATE INDEX IF NOT EXISTS idx_comment_parent ON pm_comment (parent_comment_id);

-- (optional) ถ้าต้องการค้นหาตาม target_type, target_id และ parent null
CREATE INDEX IF NOT EXISTS idx_comment_target_parent_null ON pm_comment (target_type, target_id) WHERE parent_comment_id IS NULL AND is_delete = FALSE;