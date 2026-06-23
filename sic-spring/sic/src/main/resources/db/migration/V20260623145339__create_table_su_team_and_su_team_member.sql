-- =====================================================
-- V3__create_su_team_tables.sql
-- สร้างตารางสำหรับจัดการทีม (Team Management)
-- =====================================================

-- =====================================================
-- 1. ตาราง su_team (ทีม)
-- =====================================================
CREATE TABLE IF NOT EXISTS su_team (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    team_code VARCHAR(30) NOT NULL,
    team_name_en VARCHAR(255) NOT NULL,
    team_name_local VARCHAR(255) NOT NULL,
    description TEXT,
    leader_id VARCHAR(100), -- user id ของหัวหน้าทีม (จาก Keycloak)
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT false,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

-- ✅ ตรวจสอบก่อนสร้าง Unique Constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_su_team_code'
    ) THEN
        ALTER TABLE su_team 
            ADD CONSTRAINT uk_su_team_code UNIQUE (business_id, team_code);
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_su_team_business_id ON su_team(business_id);
CREATE INDEX IF NOT EXISTS idx_su_team_leader_id ON su_team(leader_id);
CREATE INDEX IF NOT EXISTS idx_su_team_is_active ON su_team(is_active);


-- =====================================================
-- 2. ตาราง su_team_member (สมาชิกในทีม)
-- =====================================================
CREATE TABLE IF NOT EXISTS su_team_member (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    role_in_team VARCHAR(50), -- LEADER, MEMBER, COORDINATOR
    is_active BOOLEAN DEFAULT true,
    joined_date TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT false,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

-- ✅ ตรวจสอบก่อนสร้าง Unique Constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uk_su_team_member'
    ) THEN
        ALTER TABLE su_team_member 
            ADD CONSTRAINT uk_su_team_member UNIQUE (team_id, user_id);
    END IF;
END $$;

-- ✅ ตรวจสอบก่อนสร้าง Foreign Key
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_su_team_member_team'
    ) THEN
        ALTER TABLE su_team_member 
            ADD CONSTRAINT fk_su_team_member_team 
            FOREIGN KEY (team_id) REFERENCES su_team(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_su_team_member_team_id ON su_team_member(team_id);
CREATE INDEX IF NOT EXISTS idx_su_team_member_user_id ON su_team_member(user_id);
CREATE INDEX IF NOT EXISTS idx_su_team_member_is_active ON su_team_member(is_active);