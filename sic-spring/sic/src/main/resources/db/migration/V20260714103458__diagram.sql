-- ============================================================
-- ลบตารางเก่า (ถ้ามี) - ระวัง! จะลบข้อมูลทั้งหมด
-- ============================================================
DROP TABLE IF EXISTS pm_dfd_diagram CASCADE;
DROP TABLE IF EXISTS pm_er_diagram CASCADE;
DROP TABLE IF EXISTS pm_diagram_versions CASCADE;
DROP TABLE IF EXISTS pm_diagram_chat CASCADE;
DROP TABLE IF EXISTS pm_diagram CASCADE;
DROP TABLE IF EXISTS pm_diagram_projects CASCADE;

-- ============================================================
-- 0. pm_diagram_projects (โปรเจกต์สำหรับจัดกลุ่ม Diagram)
-- ============================================================
CREATE TABLE IF NOT EXISTS pm_diagram_projects (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_favorite BOOLEAN DEFAULT FALSE,
    last_opened TIMESTAMPTZ
);

-- ============================================================
-- 1. pm_diagram (เก็บ Diagram ทั้งหมด แยกตามประเภท)
-- ============================================================
CREATE TABLE IF NOT EXISTS pm_diagram (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    diagram_type VARCHAR(50) NOT NULL,
    mermaid_script TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_diagram_project FOREIGN KEY (project_id) 
        REFERENCES pm_diagram_projects(id) ON DELETE CASCADE
);

-- ============================================================
-- 2. pm_diagram_versions (ประวัติเวอร์ชัน)
-- ============================================================
CREATE TABLE IF NOT EXISTS pm_diagram_versions (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    diagram_id UUID NOT NULL,
    mermaid_script TEXT NOT NULL,
    version_number INTEGER NOT NULL,
    change_comment TEXT,
    CONSTRAINT fk_version_diagram FOREIGN KEY (diagram_id) 
        REFERENCES pm_diagram(id) ON DELETE CASCADE
);

-- ============================================================
-- 3. pm_diagram_chat (ประวัติการแชท)
-- ============================================================
CREATE TABLE IF NOT EXISTS pm_diagram_chat (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    diagram_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    context_data JSONB,
    CONSTRAINT fk_chat_diagram FOREIGN KEY (diagram_id) 
        REFERENCES pm_diagram(id) ON DELETE CASCADE
);

-- ============================================================
-- 🔍 Indexes - ใช้ IF NOT EXISTS เพื่อป้องกันการสร้างซ้ำ
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_diagram_project ON pm_diagram (project_id);
CREATE INDEX IF NOT EXISTS idx_diagram_user ON pm_diagram (user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_business ON pm_diagram (business_id);
CREATE INDEX IF NOT EXISTS idx_diagram_type ON pm_diagram (diagram_type);
CREATE INDEX IF NOT EXISTS idx_diagram_metadata ON pm_diagram USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_version_diagram ON pm_diagram_versions (diagram_id);
CREATE INDEX IF NOT EXISTS idx_chat_diagram ON pm_diagram_chat (diagram_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON pm_diagram_chat (user_id);

CREATE INDEX IF NOT EXISTS idx_project_user ON pm_diagram_projects (user_id);
CREATE INDEX IF NOT EXISTS idx_project_business ON pm_diagram_projects (business_id);