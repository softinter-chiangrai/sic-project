-- =====================================================
-- ตาราง customer (ลูกค้า)
-- =====================================================

-- ✅ สร้างตาราง ชื่อ customer
CREATE TABLE IF NOT EXISTS customer (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL,
    customer_code VARCHAR(30) NOT NULL,
    tax_id VARCHAR(30),
    company_name_en VARCHAR(255) NOT NULL,
    company_name_local VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(320),
    line_id VARCHAR(100),
    address_en VARCHAR(500),
    address_local VARCHAR(500),
    province_id UUID,
    district_id UUID,
    sub_district_id UUID,
    zip_code VARCHAR(20),
    customer_type VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    remark TEXT,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMP NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN DEFAULT false,
    delete_by VARCHAR(100),
    delete_date TIMESTAMP
);

-- ✅ สร้าง Unique constraint
ALTER TABLE customer 
    ADD CONSTRAINT uk_customer_code UNIQUE (business_id, customer_code);

-- ✅ เพิ่ม Foreign Key Constraints
ALTER TABLE customer 
    ADD CONSTRAINT fk_customer_province 
    FOREIGN KEY (province_id) REFERENCES db_province(id);

ALTER TABLE customer 
    ADD CONSTRAINT fk_customer_district 
    FOREIGN KEY (district_id) REFERENCES db_district(id);

ALTER TABLE customer 
    ADD CONSTRAINT fk_customer_sub_district 
    FOREIGN KEY (sub_district_id) REFERENCES db_sub_district(id);

-- ✅ สร้าง Index เพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX IF NOT EXISTS idx_customer_business_id ON customer(business_id);
CREATE INDEX IF NOT EXISTS idx_customer_is_active ON customer(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_customer_code ON customer(customer_code);
CREATE INDEX IF NOT EXISTS idx_customer_company_name_en ON customer(company_name_en);