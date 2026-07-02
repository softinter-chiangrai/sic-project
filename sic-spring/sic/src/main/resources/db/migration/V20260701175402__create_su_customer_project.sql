-- =====================================================
-- V20260701175402__create_su_customer_project_and_contract.sql
-- =====================================================

-- 1. สร้างตาราง su_customer_project ก่อน
CREATE TABLE IF NOT EXISTS su_customer_project (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    project_code VARCHAR(30) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    customer_id UUID,
    contract_id UUID,
    project_manager VARCHAR(100),
    ba VARCHAR(100),
    sa VARCHAR(100),
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    budget_manday INTEGER DEFAULT 0,
    used_manday INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Prospect',
    priority VARCHAR(20) DEFAULT 'Medium',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT false,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

ALTER TABLE su_customer_project ADD CONSTRAINT uk_su_customer_project_code UNIQUE (business_id, project_code);

CREATE INDEX idx_su_customer_project_business_id ON su_customer_project(business_id);
CREATE INDEX idx_su_customer_project_customer_id ON su_customer_project(customer_id);
CREATE INDEX idx_su_customer_project_status ON su_customer_project(status);
CREATE INDEX idx_su_customer_project_is_active ON su_customer_project(is_active);
CREATE INDEX idx_su_customer_project_start_date ON su_customer_project(start_date);
CREATE INDEX idx_su_customer_project_is_delete ON su_customer_project(is_delete);

-- 2. สร้างตาราง su_customer_contract (หลังจาก project)
CREATE TABLE IF NOT EXISTS su_customer_contract (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    contract_no VARCHAR(50) NOT NULL,
    contract_type VARCHAR(50) NOT NULL,
    customer_id UUID NOT NULL,
    project_id UUID,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    contract_value DECIMAL(15,2) DEFAULT 0,
    payment_terms VARCHAR(500),
    scope_summary TEXT,
    sign_status VARCHAR(20) DEFAULT 'Draft',
    renewal_status VARCHAR(50) DEFAULT 'ยังไม่ต่อ',
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT false,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

ALTER TABLE su_customer_contract ADD CONSTRAINT uk_su_customer_contract_no UNIQUE (business_id, contract_no);

ALTER TABLE su_customer_contract ADD CONSTRAINT fk_su_customer_contract_customer 
    FOREIGN KEY (customer_id) REFERENCES su_customer(id);

ALTER TABLE su_customer_contract ADD CONSTRAINT fk_su_customer_contract_project 
    FOREIGN KEY (project_id) REFERENCES su_customer_project(id);

CREATE INDEX idx_su_customer_contract_business_id ON su_customer_contract(business_id);
CREATE INDEX idx_su_customer_contract_customer_id ON su_customer_contract(customer_id);
CREATE INDEX idx_su_customer_contract_project_id ON su_customer_contract(project_id);
CREATE INDEX idx_su_customer_contract_sign_status ON su_customer_contract(sign_status);
CREATE INDEX idx_su_customer_contract_is_active ON su_customer_contract(is_active);
CREATE INDEX idx_su_customer_contract_start_date ON su_customer_contract(start_date);
CREATE INDEX idx_su_customer_contract_end_date ON su_customer_contract(end_date);
CREATE INDEX idx_su_customer_contract_is_delete ON su_customer_contract(is_delete);