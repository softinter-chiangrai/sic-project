-- ============================================================
-- ลบตารางระบบอนุมัติ (ถ้ามี) พร้อมความสัมพันธ์ทั้งหมด
-- ============================================================
DROP TABLE IF EXISTS 
    pm_approval_reminder,
    pm_approval_log,
    pm_approval_step_status,
    pm_approval,
    pm_approval_flow_step,
    pm_approval_flow 
CASCADE;

-- ============================================================
-- 1. pm_approval_flow: นิยามกระบวนการอนุมัติ
-- ============================================================
CREATE TABLE pm_approval_flow (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,

    flow_code VARCHAR(50) NOT NULL,
    flow_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    approval_mode VARCHAR(20) DEFAULT 'CHAIN',
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,

    CONSTRAINT uk_approval_flow_code UNIQUE (flow_code)
);

CREATE INDEX IF NOT EXISTS idx_flow_document_type ON pm_approval_flow (document_type);
CREATE INDEX IF NOT EXISTS idx_flow_business ON pm_approval_flow (business_id);

COMMENT ON TABLE pm_approval_flow IS 'นิยามกระบวนการอนุมัติ (Workflow Template)';
COMMENT ON COLUMN pm_approval_flow.approval_mode IS 'CHAIN=เรียงลำดับ, PARALLEL=พร้อมกัน, ANY=ใครก็ได้, SINGLE=คนเดียว';


-- ============================================================
-- 2. pm_approval_flow_step: ขั้นตอนในกระบวนการอนุมัติ
-- ============================================================
CREATE TABLE pm_approval_flow_step (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,

    flow_id UUID NOT NULL,
    step_order INTEGER NOT NULL,
    step_name VARCHAR(255) NOT NULL,
    approver_role VARCHAR(50),
    approver_user_id VARCHAR(100),
    is_required BOOLEAN DEFAULT TRUE,
    timeout_days INTEGER,
    can_skip BOOLEAN DEFAULT FALSE,
    condition_expression VARCHAR(500),

    CONSTRAINT fk_step_flow FOREIGN KEY (flow_id) REFERENCES pm_approval_flow(id)
);

CREATE INDEX IF NOT EXISTS idx_step_flow ON pm_approval_flow_step (flow_id, step_order);
CREATE INDEX IF NOT EXISTS idx_step_role ON pm_approval_flow_step (approver_role);

COMMENT ON TABLE pm_approval_flow_step IS 'ขั้นตอนในกระบวนการอนุมัติ';
COMMENT ON COLUMN pm_approval_flow_step.approver_role IS 'Role ที่ต้องอนุมัติ (BA, CUSTOMER, PM, HEAD, FINANCE, QA_LEAD)';


-- ============================================================
-- 3. pm_approval: คำขออนุมัติ (Instance ของ Flow)
-- ============================================================
CREATE TABLE pm_approval (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,

    document_type VARCHAR(50) NOT NULL,
    document_id UUID NOT NULL,
    document_code VARCHAR(50),
    document_title VARCHAR(500),

    version VARCHAR(20),
    requested_by VARCHAR(100) NOT NULL,
    requested_by_name VARCHAR(255),
    requested_date TIMESTAMPTZ DEFAULT NOW(),

    flow_id UUID NOT NULL,
    current_step_id UUID,

    status VARCHAR(20) DEFAULT 'PENDING',
    final_approver VARCHAR(100),
    final_approval_date TIMESTAMPTZ,

    comment TEXT,
    attachment_id UUID,
    extra_data JSONB,

    reference_id UUID,
    is_active BOOLEAN DEFAULT TRUE,

    CONSTRAINT fk_approval_flow FOREIGN KEY (flow_id) REFERENCES pm_approval_flow(id),
    CONSTRAINT fk_approval_current_step FOREIGN KEY (current_step_id) REFERENCES pm_approval_flow_step(id),
    CONSTRAINT fk_approval_attachment FOREIGN KEY (attachment_id) REFERENCES su_upload(id)
);

CREATE INDEX IF NOT EXISTS idx_approval_document ON pm_approval (document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_approval_status ON pm_approval (status);
CREATE INDEX IF NOT EXISTS idx_approval_requested_by ON pm_approval (requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_business ON pm_approval (business_id);
CREATE INDEX IF NOT EXISTS idx_approval_flow ON pm_approval (flow_id);
CREATE INDEX IF NOT EXISTS idx_approval_current_step ON pm_approval (current_step_id);

COMMENT ON TABLE pm_approval IS 'คำขออนุมัติแต่ละรายการ (Instance)';
COMMENT ON COLUMN pm_approval.status IS 'PENDING, PARTIALLY_APPROVED, APPROVED, REJECTED, NEED_REVISION, CANCELLED, EXPIRED';


-- ============================================================
-- 4. pm_approval_step_status: สถานะแต่ละขั้นตอน
-- ============================================================
CREATE TABLE pm_approval_step_status (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,

    approval_id UUID NOT NULL,
    step_id UUID NOT NULL,

    status VARCHAR(20) DEFAULT 'PENDING',
    approver VARCHAR(100),
    approver_name VARCHAR(255),
    approval_date TIMESTAMPTZ,
    comment TEXT,
    signature_url VARCHAR(500),
    ip_address VARCHAR(50),
    user_agent TEXT,

    is_completed BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_step_status_approval FOREIGN KEY (approval_id) REFERENCES pm_approval(id),
    CONSTRAINT fk_step_status_step FOREIGN KEY (step_id) REFERENCES pm_approval_flow_step(id)
);

CREATE INDEX IF NOT EXISTS idx_step_status_approval ON pm_approval_step_status (approval_id);
CREATE INDEX IF NOT EXISTS idx_step_status_step ON pm_approval_step_status (step_id);
CREATE INDEX IF NOT EXISTS idx_step_status_approver ON pm_approval_step_status (approver);

COMMENT ON TABLE pm_approval_step_status IS 'สถานะของแต่ละขั้นตอนในคำขออนุมัติ (ใช้สำหรับ Parallel)';


-- ============================================================
-- 5. pm_approval_log: ประวัติการดำเนินการ
-- ============================================================
CREATE TABLE pm_approval_log (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,

    approval_id UUID NOT NULL,
    step_status_id UUID,

    action VARCHAR(30) NOT NULL,
    actor VARCHAR(100) NOT NULL,
    actor_name VARCHAR(255),
    comment TEXT,
    old_status VARCHAR(20),
    new_status VARCHAR(20),

    ip_address VARCHAR(50),
    user_agent TEXT,
    extra_data JSONB,

    CONSTRAINT fk_log_approval FOREIGN KEY (approval_id) REFERENCES pm_approval(id),
    CONSTRAINT fk_log_step_status FOREIGN KEY (step_status_id) REFERENCES pm_approval_step_status(id)
);

CREATE INDEX IF NOT EXISTS idx_log_approval ON pm_approval_log (approval_id);
CREATE INDEX IF NOT EXISTS idx_log_actor ON pm_approval_log (actor);
CREATE INDEX IF NOT EXISTS idx_log_action ON pm_approval_log (action);

COMMENT ON TABLE pm_approval_log IS 'ประวัติการกระทำทั้งหมดในคำขออนุมัติ';


-- ============================================================
-- 6. pm_approval_reminder: การเตือน
-- ============================================================
CREATE TABLE pm_approval_reminder (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,

    approval_id UUID NOT NULL,
    step_status_id UUID,

    reminder_type VARCHAR(20) DEFAULT 'AUTO',
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    recipient VARCHAR(100),
    recipient_email VARCHAR(320),
    channel VARCHAR(20),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,

    CONSTRAINT fk_reminder_approval FOREIGN KEY (approval_id) REFERENCES pm_approval(id),
    CONSTRAINT fk_reminder_step_status FOREIGN KEY (step_status_id) REFERENCES pm_approval_step_status(id)
);

CREATE INDEX IF NOT EXISTS idx_reminder_approval ON pm_approval_reminder (approval_id);
CREATE INDEX IF NOT EXISTS idx_reminder_recipient ON pm_approval_reminder (recipient);
==