-- ============================================================
-- Script สร้างฐานข้อมูลระบบ SoftFlow (PostgreSQL)
-- รวมทุกตาราง (ปรับปรุงล่าสุด: รวม DFD/ER ใน Diagram เดียว)
-- ============================================================

-- เปิดใช้งาน UUID Extension (ถ้ายังไม่ได้เปิด)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- ส่วนที่ 1: Master Data (ตารางที่ 1-9)
-- ============================================================

-- 1. db_country
CREATE TABLE IF NOT EXISTS db_country (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    country_code VARCHAR(10) NOT NULL,
    iso_code VARCHAR(10) NOT NULL,
    country_name_en VARCHAR(100) NOT NULL,
    country_name_local VARCHAR(100) NOT NULL,
    support_local_address BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_country_code ON db_country (country_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_iso_code ON db_country (iso_code);

-- 2. db_province
CREATE TABLE IF NOT EXISTS db_province (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    country_id UUID NOT NULL,
    province_code VARCHAR(10) NOT NULL,
    province_name_en VARCHAR(255) NOT NULL,
    province_name_local VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_province_country FOREIGN KEY (country_id) REFERENCES db_country(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_province_code ON db_province (province_code);
CREATE INDEX IF NOT EXISTS idx_province_country_id ON db_province (country_id);

-- 3. db_district
CREATE TABLE IF NOT EXISTS db_district (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    province_id UUID NOT NULL,
    district_code VARCHAR(10) NOT NULL,
    district_name_en VARCHAR(255) NOT NULL,
    district_name_local VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_district_province FOREIGN KEY (province_id) REFERENCES db_province(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_district_code ON db_district (district_code);
CREATE INDEX IF NOT EXISTS idx_district_province_id ON db_district (province_id);

-- 4. db_sub_district
CREATE TABLE IF NOT EXISTS db_sub_district (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    district_id UUID NOT NULL,
    sub_district_code VARCHAR(10) NOT NULL,
    sub_district_name_en VARCHAR(255) NOT NULL,
    sub_district_name_local VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    latitude BIGINT,
    longitude BIGINT,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_sub_district_district FOREIGN KEY (district_id) REFERENCES db_district(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sub_district_code ON db_sub_district (sub_district_code);
CREATE INDEX IF NOT EXISTS idx_sub_district_district_id ON db_sub_district (district_id);

-- 5. db_title
CREATE TABLE IF NOT EXISTS db_title (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    person_type VARCHAR(20) NOT NULL,
    prefix_short_name_en VARCHAR(100) NOT NULL,
    prefix_short_name_local VARCHAR(100) NOT NULL,
    suffix_short_name_en VARCHAR(100),
    suffix_short_name_local VARCHAR(100),
    prefix_name_en VARCHAR(100) NOT NULL,
    prefix_name_local VARCHAR(100) NOT NULL,
    suffix_name_en VARCHAR(100),
    suffix_name_local VARCHAR(100),
    sort_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

-- 6. db_parameter
CREATE TABLE IF NOT EXISTS db_parameter (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    module_code VARCHAR(50) NOT NULL,
    parameter_code VARCHAR(50) NOT NULL,
    parameter_value VARCHAR(50) NOT NULL,
    parameter_name_en VARCHAR(100) NOT NULL,
    parameter_name_local VARCHAR(100) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_module_param_value ON db_parameter (module_code, parameter_code, parameter_value);

-- 7. db_mail_config
CREATE TABLE IF NOT EXISTS db_mail_config (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    config_name VARCHAR(100) NOT NULL,
    smtp_server VARCHAR(255) NOT NULL,
    smtp_port INTEGER NOT NULL,
    email_from VARCHAR(320) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(500) NOT NULL,
    enable_ssl BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT FALSE,
    max_retry INTEGER DEFAULT 3,
    description VARCHAR(500)
);

-- 8. db_mail_template
CREATE TABLE IF NOT EXISTS db_mail_template (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    template_code VARCHAR(50) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    subject_en VARCHAR(255) NOT NULL,
    subject_local VARCHAR(255) NOT NULL,
    content_en TEXT NOT NULL,
    content_local TEXT NOT NULL,
    is_html BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT FALSE,
    variables VARCHAR(3000)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_template_code ON db_mail_template (template_code);

-- 9. db_mail_queue
CREATE TABLE IF NOT EXISTS db_mail_queue (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    template_id UUID NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_name VARCHAR(255),
    body_data TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    retry_count INTEGER DEFAULT 0,
    error_message VARCHAR(500),
    scheduled_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    used_config_id UUID,
    use_english BOOLEAN DEFAULT FALSE,
    "DbMailConfigId" UUID,
    CONSTRAINT fk_mail_queue_template FOREIGN KEY (template_id) REFERENCES db_mail_template(id),
    CONSTRAINT fk_mail_queue_config FOREIGN KEY ("DbMailConfigId") REFERENCES db_mail_config(id)
);

CREATE INDEX IF NOT EXISTS idx_mail_queue_template ON db_mail_queue (template_id);
CREATE INDEX IF NOT EXISTS idx_mail_queue_config ON db_mail_queue ("DbMailConfigId");

-- ============================================================
-- ส่วนที่ 2: องค์กร สิทธิ์ และผู้ใช้ (ตารางที่ 10-18)
-- ============================================================

-- 10. su_business
CREATE TABLE IF NOT EXISTS su_business (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    tax_id VARCHAR(30),
    business_code VARCHAR(30) NOT NULL,
    branch_code VARCHAR(30),
    person_type VARCHAR(100) NOT NULL,
    title_id UUID NOT NULL,
    first_name_en VARCHAR(100) NOT NULL,
    middle_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    first_name_local VARCHAR(100) NOT NULL,
    middle_name_local VARCHAR(100),
    last_name_local VARCHAR(100),
    country_id UUID NOT NULL,
    support_local_address BOOLEAN NOT NULL DEFAULT FALSE,
    address_en VARCHAR(255),
    address_local VARCHAR(255),
    province_id UUID,
    district_id UUID,
    sub_district_id UUID,
    zip_code VARCHAR(20),
    email VARCHAR(320),
    phone_number VARCHAR(20),
    fax VARCHAR(20),
    upload_group_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_business_title FOREIGN KEY (title_id) REFERENCES db_title(id),
    CONSTRAINT fk_business_country FOREIGN KEY (country_id) REFERENCES db_country(id),
    CONSTRAINT fk_business_province FOREIGN KEY (province_id) REFERENCES db_province(id),
    CONSTRAINT fk_business_district FOREIGN KEY (district_id) REFERENCES db_district(id),
    CONSTRAINT fk_business_sub_district FOREIGN KEY (sub_district_id) REFERENCES db_sub_district(id)
);

-- 11. su_business_audit
CREATE TABLE IF NOT EXISTS su_business_audit (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    session_id VARCHAR(100),
    username VARCHAR(100),
    client_ip VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    remark VARCHAR(500),
    CONSTRAINT fk_audit_business FOREIGN KEY (business_id) REFERENCES su_business(id)
);

-- 12. su_business_invite
CREATE TABLE IF NOT EXISTS su_business_invite (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    role_id UUID NOT NULL,
    invite_type VARCHAR(50) NOT NULL,
    invite_email VARCHAR(320),
    invite_token VARCHAR(300),
    is_activated BOOLEAN NOT NULL DEFAULT FALSE,
    expire_at TIMESTAMPTZ,
    max_uses INTEGER,
    use_count INTEGER DEFAULT 0,
    CONSTRAINT fk_invite_business FOREIGN KEY (business_id) REFERENCES su_business(id), 
    CONSTRAINT fk_invite_role FOREIGN KEY (role_id) REFERENCES su_business_role(id)
);
CREATE INDEX IF NOT EXISTS idx_invite_business ON su_business_invite (business_id);

-- 13. su_business_role
CREATE TABLE IF NOT EXISTS su_business_role (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    parent_role_id UUID,
    role_code VARCHAR(50) NOT NULL,
    role_name_en VARCHAR(255) NOT NULL,
    role_name_local VARCHAR(255) NOT NULL,
    role_level VARCHAR(50),
    sort_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    color VARCHAR(20),
    CONSTRAINT fk_role_business FOREIGN KEY (business_id) REFERENCES su_business(id),
    CONSTRAINT fk_role_parent FOREIGN KEY (parent_role_id) REFERENCES su_business_role(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_role_code ON su_business_role (business_id, role_code);

-- 14. su_business_role_program
CREATE TABLE IF NOT EXISTS su_business_role_program (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_role_id UUID NOT NULL,
    program_id UUID NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_add BOOLEAN NOT NULL DEFAULT FALSE,
    is_back BOOLEAN NOT NULL DEFAULT FALSE,
    is_print BOOLEAN NOT NULL DEFAULT FALSE,
    is_remove BOOLEAN NOT NULL DEFAULT FALSE,
    is_save BOOLEAN NOT NULL DEFAULT FALSE,
    is_search BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_role_program_role FOREIGN KEY (business_role_id) REFERENCES su_business_role(id),
    CONSTRAINT fk_role_program_program FOREIGN KEY (program_id) REFERENCES su_program(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_business_role_program ON su_business_role_program (business_role_id, program_id);

-- 15. su_user_business
CREATE TABLE IF NOT EXISTS su_user_business (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_business_business FOREIGN KEY (business_id) REFERENCES su_business(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_business ON su_user_business (user_id, business_id);

-- 16. su_user_business_role
CREATE TABLE IF NOT EXISTS su_user_business_role (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    user_business_id UUID NOT NULL,
    business_role_id UUID NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_user_role_user_business FOREIGN KEY (user_business_id) REFERENCES su_user_business(id),
    CONSTRAINT fk_user_role_role FOREIGN KEY (business_role_id) REFERENCES su_business_role(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_business_role ON su_user_business_role (user_business_id, business_role_id);

-- 17. su_profile
CREATE TABLE IF NOT EXISTS su_profile (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    user_id VARCHAR(100) NOT NULL,
    tax_id VARCHAR(30),
    title_id UUID NOT NULL,
    first_name_en VARCHAR(100) NOT NULL,
    middle_name_en VARCHAR(100),
    last_name_en VARCHAR(100),
    first_name_local VARCHAR(100) NOT NULL,
    middle_name_local VARCHAR(100),
    last_name_local VARCHAR(100),
    country_id UUID,
    support_local_address BOOLEAN NOT NULL DEFAULT FALSE,
    address_en VARCHAR(255),
    address_local VARCHAR(255),
    province_id UUID,
    district_id UUID,
    sub_district_id UUID,
    zip_code VARCHAR(20),
    email VARCHAR(320) NOT NULL,
    phone_number VARCHAR(20),
    upload_group_id UUID,
    CONSTRAINT fk_profile_title FOREIGN KEY (title_id) REFERENCES db_title(id),
    CONSTRAINT fk_profile_country FOREIGN KEY (country_id) REFERENCES db_country(id),
    CONSTRAINT fk_profile_province FOREIGN KEY (province_id) REFERENCES db_province(id),
    CONSTRAINT fk_profile_district FOREIGN KEY (district_id) REFERENCES db_district(id),
    CONSTRAINT fk_profile_sub_district FOREIGN KEY (sub_district_id) REFERENCES db_sub_district(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_id ON su_profile (user_id);

-- 18. su_program
CREATE TABLE IF NOT EXISTS su_program (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    parent_program_id UUID,
    program_code VARCHAR(50) NOT NULL,
    icon VARCHAR(100),
    name_en VARCHAR(255) NOT NULL,
    name_local VARCHAR(255) NOT NULL,
    route_path VARCHAR(500),
    sort_order INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_add BOOLEAN NOT NULL DEFAULT FALSE,
    is_back BOOLEAN NOT NULL DEFAULT FALSE,
    is_print BOOLEAN NOT NULL DEFAULT FALSE,
    is_remove BOOLEAN NOT NULL DEFAULT FALSE,
    is_save BOOLEAN NOT NULL DEFAULT FALSE,
    is_search BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_program_parent FOREIGN KEY (parent_program_id) REFERENCES su_program(id)
);

CREATE INDEX IF NOT EXISTS idx_program_code ON su_program (program_code);

-- ============================================================
-- ส่วนที่ 3: ระบบแชท / สื่อสาร (ตารางที่ 19-24)
-- ============================================================

-- 19. su_upload
CREATE TABLE IF NOT EXISTS su_upload (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    bussiness_id UUID,
    bucket_name VARCHAR(100) NOT NULL,
    object_key VARCHAR(1000) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    visibility INTEGER NOT NULL,
    storage_url VARCHAR(2000) NOT NULL,
    access_url VARCHAR(2000) NOT NULL,
    is_streaming BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    upload_group_id UUID,
    temp_expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bucket_name ON su_upload (bucket_name);
CREATE INDEX IF NOT EXISTS idx_object_key ON su_upload (object_key);

-- 20. su_chat_group
CREATE TABLE IF NOT EXISTS su_chat_group (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    name VARCHAR(200) NOT NULL
);

-- 21. su_chat_group_member
CREATE TABLE IF NOT EXISTS su_chat_group_member (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    group_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    CONSTRAINT fk_group_member_group FOREIGN KEY (group_id) REFERENCES su_chat_group(id)
);

-- 22. su_chat_group_log
CREATE TABLE IF NOT EXISTS su_chat_group_log (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    group_id UUID NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(100),
    message VARCHAR(4000) NOT NULL DEFAULT '',
    message_type VARCHAR(20) NOT NULL,
    attachment_id UUID,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(100),
    CONSTRAINT fk_group_log_group FOREIGN KEY (group_id) REFERENCES su_chat_group(id),
    CONSTRAINT fk_group_log_attachment FOREIGN KEY (attachment_id) REFERENCES su_upload(id)
);

-- 23. su_chat_log
CREATE TABLE IF NOT EXISTS su_chat_log (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    sender_id VARCHAR(100) NOT NULL,
    receiver_id VARCHAR(100) NOT NULL,
    sender_name VARCHAR(100),
    receiver_name VARCHAR(100),
    message VARCHAR(4000) NOT NULL DEFAULT '',
    message_type VARCHAR(20) NOT NULL,
    attachment_id UUID,
    is_cancelled BOOLEAN NOT NULL DEFAULT FALSE,
    cancelled_at TIMESTAMPTZ,
    cancelled_by VARCHAR(100),
    call_accepted BOOLEAN,
    call_duration_seconds INTEGER,
    is_read BOOLEAN,
    is_deleted BOOLEAN,
    CONSTRAINT fk_chat_log_attachment FOREIGN KEY (attachment_id) REFERENCES su_upload(id)
);

CREATE INDEX IF NOT EXISTS idx_business_sender_receiver ON su_chat_log (business_id, sender_id, receiver_id);

-- 24. su_chat_group_call_participant
CREATE TABLE IF NOT EXISTS su_chat_group_call_participant (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    log_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    CONSTRAINT fk_call_participant_log FOREIGN KEY (log_id) REFERENCES su_chat_group_log(id)
);

-- ============================================================
-- ส่วนที่ 4: งานทั่วไปและ PM พื้นฐาน (ตารางที่ 25-34)
-- ============================================================

-- 25. su_task
CREATE TABLE IF NOT EXISTS su_task (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    task_code VARCHAR(20) NOT NULL,
    task_name_en VARCHAR(255),
    task_name_local VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT FALSE
);

-- 26. su_user_task
CREATE TABLE IF NOT EXISTS su_user_task (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    description VARCHAR(2000),
    task_id UUID NOT NULL,
    CONSTRAINT fk_user_task_task FOREIGN KEY (task_id) REFERENCES su_task(id)
);

-- 27. su_verify
CREATE TABLE IF NOT EXISTS su_verify (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    verify_type VARCHAR(100) NOT NULL,
    reference_number VARCHAR(300) NOT NULL,
    token VARCHAR(300) NOT NULL,
    max_retry INTEGER NOT NULL DEFAULT 5,
    retry_count INTEGER NOT NULL DEFAULT 0,
    expire_at TIMESTAMPTZ NOT NULL,
    recipient VARCHAR(255) NOT NULL
);

-- 28. su_message
CREATE TABLE IF NOT EXISTS su_message (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    module_code VARCHAR(10) NOT NULL,
    program_code VARCHAR(50) NOT NULL,
    message_code VARCHAR(50) NOT NULL,
    message_en VARCHAR(255) NOT NULL,
    message_local VARCHAR(255) NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_module_program_message ON su_message (module_code, program_code, message_code);

-- 29. pm_customer
CREATE TABLE IF NOT EXISTS pm_customer (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    customer_code VARCHAR(30) NOT NULL,
    upload_group_id UUID,
    tax_id VARCHAR(30),
    company_name_en VARCHAR(255) NOT NULL,
    company_name_local VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    phone_number VARCHAR(20),
    email VARCHAR(320),
    line_id VARCHAR(100),
    address_en VARCHAR(500),
    address_local VARCHAR(500),
    zip_code VARCHAR(20),
    customer_type VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    remark TEXT,
    province_id UUID,
    district_id UUID,
    sub_district_id UUID,
    CONSTRAINT fk_customer_province FOREIGN KEY (province_id) REFERENCES db_province(id),
    CONSTRAINT fk_customer_district FOREIGN KEY (district_id) REFERENCES db_district(id),
    CONSTRAINT fk_customer_sub_district FOREIGN KEY (sub_district_id) REFERENCES db_sub_district(id)
);

-- 30. pm_customer_contract
CREATE TABLE IF NOT EXISTS pm_customer_contract (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    customer_id UUID NOT NULL,
    contract_no VARCHAR(50) NOT NULL,
    contract_type VARCHAR(50),
    start_date DATE,
    end_date DATE,
    contract_value NUMERIC(19,2),
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_contract_customer FOREIGN KEY (customer_id) REFERENCES pm_customer(id)
);

-- 31. pm_customer_project
CREATE TABLE IF NOT EXISTS pm_customer_project (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    customer_id UUID NOT NULL,
    contract_id UUID,
    project_code VARCHAR(30) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    budget_manday INTEGER,
    used_manday INTEGER DEFAULT 0,
    status VARCHAR(50),
    priority VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_project_customer FOREIGN KEY (customer_id) REFERENCES pm_customer(id),
    CONSTRAINT fk_project_contract FOREIGN KEY (contract_id) REFERENCES pm_customer_contract(id)
);

-- 32. pm_requirement
CREATE TABLE IF NOT EXISTS pm_requirement (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    requirement_code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    requirement_type VARCHAR(50),
    source VARCHAR(100),
    priority VARCHAR(20),
    business_value VARCHAR(255),
    acceptance_criteria TEXT,
    version VARCHAR(10),
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_req_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 33. pm_requirement_change_request
CREATE TABLE IF NOT EXISTS pm_requirement_change_request (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    requirement_id UUID NOT NULL,
    change_description TEXT,
    impact_summary TEXT,
    estimated_manday INTEGER,
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_change_req FOREIGN KEY (requirement_id) REFERENCES pm_requirement(id)
);

-- 34. pm_change_impact_analysis
CREATE TABLE IF NOT EXISTS pm_change_impact_analysis (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    change_request_id UUID NOT NULL,
    dfd_impact TEXT,
    er_impact TEXT,
    ui_impact TEXT,
    api_impact TEXT,
    test_impact TEXT,
    manday_impact INTEGER,
    timeline_impact INTEGER,
    cost_impact TEXT,
    CONSTRAINT fk_impact_change FOREIGN KEY (change_request_id) REFERENCES pm_requirement_change_request(id)
);

-- ============================================================
-- ส่วนที่ 5: Specification และ Use Case (ตารางที่ 43-44) [ข้าม DFD/ER เดิม]
-- ============================================================

-- 43. pm_specification
CREATE TABLE IF NOT EXISTS pm_specification (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    spec_code VARCHAR(30) NOT NULL,
    spec_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    related_requirement TEXT,
    related_er TEXT,
    ui_action TEXT,
    validation_rule TEXT,
    permission TEXT,
    estimated_manday INTEGER,
    dependency TEXT,
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_spec_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 44. pm_usecase
CREATE TABLE IF NOT EXISTS pm_usecase (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    usecase_name VARCHAR(255) NOT NULL,
    description TEXT,
    actor VARCHAR(100),
    pre_condition TEXT,
    post_condition TEXT,
    basic_flow TEXT,
    alternative_flow TEXT,
    CONSTRAINT fk_usecase_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- ============================================================
-- ส่วนที่ 6: Planning และ Development Task (ตารางที่ 45-50)
-- ============================================================

-- 45. pm_phase
CREATE TABLE IF NOT EXISTS pm_phase (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    phase_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    owner VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Not Started',
    dependency UUID,
    progress INTEGER DEFAULT 0,
    CONSTRAINT fk_phase_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 46. pm_milestone
CREATE TABLE IF NOT EXISTS pm_milestone (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    phase_id UUID NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Not Started',
    CONSTRAINT fk_milestone_phase FOREIGN KEY (phase_id) REFERENCES pm_phase(id)
);

-- 47. pm_work_package
CREATE TABLE IF NOT EXISTS pm_work_package (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    milestone_id UUID NOT NULL,
    package_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Not Started',
    CONSTRAINT fk_package_milestone FOREIGN KEY (milestone_id) REFERENCES pm_milestone(id)
);

-- 48. pm_task (Development Task)
CREATE TABLE IF NOT EXISTS pm_task (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    work_package_id UUID NOT NULL,
    spec_id UUID,
    task_code VARCHAR(30) NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(100),
    start_date DATE,
    end_date DATE,
    actual_start DATE,
    actual_end DATE,
    estimate_manday INTEGER,
    actual_manday INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'Todo',
    priority VARCHAR(20) DEFAULT 'Medium',
    dependency_on UUID,
    impact_if_delay TEXT,
    CONSTRAINT fk_task_package FOREIGN KEY (work_package_id) REFERENCES pm_work_package(id),
    CONSTRAINT fk_task_spec FOREIGN KEY (spec_id) REFERENCES pm_specification(id)
);

-- 49. pm_task_dependency
CREATE TABLE IF NOT EXISTS pm_task_dependency (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    task_id UUID NOT NULL,
    depends_on_task_id UUID NOT NULL,
    CONSTRAINT fk_dep_task FOREIGN KEY (task_id) REFERENCES pm_task(id),
    CONSTRAINT fk_dep_depends_on FOREIGN KEY (depends_on_task_id) REFERENCES pm_task(id)
);

-- 50. pm_task_assignee
CREATE TABLE IF NOT EXISTS pm_task_assignee (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    task_id UUID NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    role_in_task VARCHAR(50),
    CONSTRAINT fk_assignee_task FOREIGN KEY (task_id) REFERENCES pm_task(id)
);

-- ============================================================
-- ส่วนที่ 7: Design Review (ตารางที่ 51-52)
-- ============================================================

-- 51. pm_design_review
CREATE TABLE IF NOT EXISTS pm_design_review (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    review_item_type VARCHAR(50) NOT NULL,
    review_item_id UUID NOT NULL,
    reviewer VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Open',
    due_date DATE,
    CONSTRAINT fk_review_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 52. pm_review_comment
CREATE TABLE IF NOT EXISTS pm_review_comment (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    review_id UUID NOT NULL,
    comment_type VARCHAR(20) NOT NULL,
    comment_text TEXT NOT NULL,
    severity VARCHAR(20),
    assigned_to VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Open',
    CONSTRAINT fk_review_comment_review FOREIGN KEY (review_id) REFERENCES pm_design_review(id)
);

-- ============================================================
-- ส่วนที่ 8: Testing (ตารางที่ 53-56)
-- ============================================================

-- 53. pm_test_plan
CREATE TABLE IF NOT EXISTS pm_test_plan (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    test_type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_testplan_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 54. pm_test_scenario
CREATE TABLE IF NOT EXISTS pm_test_scenario (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    test_plan_id UUID NOT NULL,
    scenario_name VARCHAR(255) NOT NULL,
    description TEXT,
    prerequisite TEXT,
    CONSTRAINT fk_scenario_plan FOREIGN KEY (test_plan_id) REFERENCES pm_test_plan(id)
);

-- 55. pm_test_case
CREATE TABLE IF NOT EXISTS pm_test_case (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    scenario_id UUID NOT NULL,
    test_case_code VARCHAR(30) NOT NULL,
    test_step TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    actual_result TEXT,
    test_status VARCHAR(20) DEFAULT 'Pending',
    tester VARCHAR(100),
    test_date TIMESTAMPTZ,
    related_requirement TEXT,
    related_spec TEXT,
    related_task TEXT,
    CONSTRAINT fk_testcase_scenario FOREIGN KEY (scenario_id) REFERENCES pm_test_scenario(id)
);

-- 56. pm_test_result
CREATE TABLE IF NOT EXISTS pm_test_result (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    test_case_id UUID NOT NULL,
    execution_date TIMESTAMPTZ,
    result VARCHAR(20) NOT NULL,
    actual_output TEXT,
    remarks TEXT,
    CONSTRAINT fk_testresult_case FOREIGN KEY (test_case_id) REFERENCES pm_test_case(id)
);

-- ============================================================
-- ส่วนที่ 9: Bug / Issue (ตารางที่ 57-59)
-- ============================================================

-- 57. pm_bug
CREATE TABLE IF NOT EXISTS pm_bug (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    task_id UUID,
    test_case_id UUID,
    bug_code VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) NOT NULL,
    priority VARCHAR(20) NOT NULL,
    found_by VARCHAR(100),
    assigned_to VARCHAR(100),
    found_date TIMESTAMPTZ,
    fix_due_date DATE,
    fixed_date TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'Open',
    related_spec VARCHAR(255),
    CONSTRAINT fk_bug_task FOREIGN KEY (task_id) REFERENCES pm_task(id),
    CONSTRAINT fk_bug_testcase FOREIGN KEY (test_case_id) REFERENCES pm_test_case(id)
);

-- 58. pm_bug_retest_plan
CREATE TABLE IF NOT EXISTS pm_bug_retest_plan (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    bug_id UUID NOT NULL,
    fix_plan TEXT,
    retest_date DATE,
    status VARCHAR(20) DEFAULT 'Open',
    CONSTRAINT fk_retest_bug FOREIGN KEY (bug_id) REFERENCES pm_bug(id)
);

-- 59. pm_bug_comment
CREATE TABLE IF NOT EXISTS pm_bug_comment (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    bug_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    CONSTRAINT fk_bugcomment_bug FOREIGN KEY (bug_id) REFERENCES pm_bug(id)
);

-- ============================================================
-- ส่วนที่ 10: Delivery (ตารางที่ 60-63)
-- ============================================================

-- 60. pm_delivery
CREATE TABLE IF NOT EXISTS pm_delivery (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    delivery_date DATE,
    delivery_status VARCHAR(20) DEFAULT 'In Progress',
    released_version VARCHAR(50),
    release_notes TEXT,
    delivery_letter_path VARCHAR(500),
    CONSTRAINT fk_delivery_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 61. pm_delivery_document
CREATE TABLE IF NOT EXISTS pm_delivery_document (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    delivery_id UUID NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(500),
    file_size BIGINT,
    version VARCHAR(20),
    CONSTRAINT fk_doc_delivery FOREIGN KEY (delivery_id) REFERENCES pm_delivery(id)
);

-- 62. pm_user_manual
CREATE TABLE IF NOT EXISTS pm_user_manual (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    delivery_id UUID NOT NULL,
    manual_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    file_path VARCHAR(500),
    version VARCHAR(20),
    CONSTRAINT fk_manual_delivery FOREIGN KEY (delivery_id) REFERENCES pm_delivery(id)
);

-- 63. pm_delivery_checklist
CREATE TABLE IF NOT EXISTS pm_delivery_checklist (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    delivery_id UUID NOT NULL,
    checklist_name VARCHAR(255) NOT NULL,
    is_checked BOOLEAN DEFAULT FALSE,
    checked_by VARCHAR(100),
    checked_at TIMESTAMPTZ,
    remark TEXT,
    CONSTRAINT fk_checklist_delivery FOREIGN KEY (delivery_id) REFERENCES pm_delivery(id)
);

-- ============================================================
-- ส่วนที่ 11: Invoice และ Payment (ตารางที่ 64-66)
-- ============================================================

-- 64. pm_invoice
CREATE TABLE IF NOT EXISTS pm_invoice (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    contract_id UUID NOT NULL,
    invoice_no VARCHAR(50) NOT NULL,
    invoice_date DATE,
    due_date DATE,
    amount NUMERIC(19,2),
    vat NUMERIC(19,2),
    total_amount NUMERIC(19,2),
    payment_status VARCHAR(20) DEFAULT 'Unpaid',
    payment_date DATE,
    receipt_file VARCHAR(500),
    billing_type VARCHAR(50),
    milestone VARCHAR(255),
    CONSTRAINT fk_invoice_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id),
    CONSTRAINT fk_invoice_contract FOREIGN KEY (contract_id) REFERENCES pm_customer_contract(id)
);

-- 65. pm_invoice_item
CREATE TABLE IF NOT EXISTS pm_invoice_item (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    invoice_id UUID NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(19,2),
    unit_price NUMERIC(19,2),
    total_price NUMERIC(19,2),
    CONSTRAINT fk_invoiceitem_invoice FOREIGN KEY (invoice_id) REFERENCES pm_invoice(id)
);

-- 66. pm_payment
CREATE TABLE IF NOT EXISTS pm_payment (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    invoice_id UUID NOT NULL,
    payment_date DATE,
    amount NUMERIC(19,2),
    payment_method VARCHAR(50),
    reference_no VARCHAR(100),
    note TEXT,
    CONSTRAINT fk_payment_invoice FOREIGN KEY (invoice_id) REFERENCES pm_invoice(id)
);

-- ============================================================
-- ส่วนที่ 12: MA และ Support (ตารางที่ 67-70)
-- ============================================================

-- 67. pm_ma_contract
CREATE TABLE IF NOT EXISTS pm_ma_contract (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    project_id UUID NOT NULL,
    contract_no VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    contract_value NUMERIC(19,2),
    status VARCHAR(20) DEFAULT 'Active',
    CONSTRAINT fk_ma_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 68. pm_ma_ticket
CREATE TABLE IF NOT EXISTS pm_ma_ticket (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    ma_contract_id UUID NOT NULL,
    ticket_no VARCHAR(30) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20),
    sla_hours INTEGER,
    assigned_to VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Open',
    reported_date TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    resolved_date TIMESTAMPTZ,
    CONSTRAINT fk_ticket_ma FOREIGN KEY (ma_contract_id) REFERENCES pm_ma_contract(id)
);

-- 69. pm_ma_ticket_comment
CREATE TABLE IF NOT EXISTS pm_ma_ticket_comment (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    ticket_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    CONSTRAINT fk_comment_ticket FOREIGN KEY (ticket_id) REFERENCES pm_ma_ticket(id)
);

-- 70. pm_ma_renewal
CREATE TABLE IF NOT EXISTS pm_ma_renewal (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    ma_contract_id UUID NOT NULL,
    renewal_date DATE,
    new_end_date DATE,
    renewal_status VARCHAR(20) DEFAULT 'Pending',
    note TEXT,
    CONSTRAINT fk_renewal_ma FOREIGN KEY (ma_contract_id) REFERENCES pm_ma_contract(id)
);

-- ============================================================
-- ส่วนที่ 13: ระบบกลาง (Cross-Cutting) (ตารางที่ 71, 73-75)
-- ============================================================

-- 71. pm_comment (Polymorphic)
CREATE TABLE IF NOT EXISTS pm_comment (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    parent_comment_id UUID,
    content TEXT NOT NULL,
    is_decision BOOLEAN DEFAULT FALSE,
    is_question BOOLEAN DEFAULT FALSE,
    is_resolved BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    mention_user_id VARCHAR(100),
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_comment_id) REFERENCES pm_comment(id)
);

CREATE INDEX IF NOT EXISTS idx_comment_target ON pm_comment (target_type, target_id);

-- 73. pm_document_version (Polymorphic)
CREATE TABLE IF NOT EXISTS pm_document_version (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    document_type VARCHAR(50) NOT NULL,
    document_id UUID NOT NULL,
    version_no VARCHAR(20) NOT NULL,
    change_summary TEXT,
    file_path VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_version_document ON pm_document_version (document_type, document_id);

-- 74. pm_notification
CREATE TABLE IF NOT EXISTS pm_notification (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    receiver_id VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    event_type VARCHAR(50),
    target_type VARCHAR(50),
    target_id UUID
);

CREATE INDEX IF NOT EXISTS idx_notification_receiver ON pm_notification (receiver_id);

-- 75. pm_audit_log
CREATE TABLE IF NOT EXISTS pm_audit_log (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    user_id VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id UUID NOT NULL,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(50),
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON pm_audit_log (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON pm_audit_log (user_id);

-- ============================================================
-- ส่วนที่ 14: ระบบอนุมัติขั้นสูง (Workflow-based)
-- ============================================================

-- 1. pm_approval_flow: นิยามกระบวนการอนุมัติ
CREATE TABLE IF NOT EXISTS pm_approval_flow (
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

-- 2. pm_approval_flow_step: ขั้นตอนในกระบวนการอนุมัติ
CREATE TABLE IF NOT EXISTS pm_approval_flow_step (
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
    approver_user_id VARCHAR(1000),
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

-- 3. pm_approval: คำขออนุมัติ (Instance ของ Flow)
CREATE TABLE IF NOT EXISTS pm_approval (
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

-- 4. pm_approval_step_status: สถานะแต่ละขั้นตอน
CREATE TABLE IF NOT EXISTS pm_approval_step_status (
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

-- 5. pm_approval_log: ประวัติการดำเนินการ
CREATE TABLE IF NOT EXISTS pm_approval_log (
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

-- 6. pm_approval_reminder: การเตือน
CREATE TABLE IF NOT EXISTS pm_approval_reminder (
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

-- ============================================================
-- ส่วนที่ 15: Diagram (แทนที่ DFD/ER เดิม)
-- ============================================================

-- ============================================================
-- ส่วนที่ 15: Diagram (แทนที่ DFD/ER เดิม)
-- ============================================================

-- ลบตารางเก่าทั้งหมดที่เกี่ยวข้อง (ถ้ามี)
DROP TABLE IF EXISTS pm_diagram CASCADE;
DROP TABLE IF EXISTS pm_diagram_versions CASCADE;
DROP TABLE IF EXISTS pm_diagram_chat CASCADE;


-- 1. pm_diagram (เก็บ Diagram ทั้งหมด แยกตามประเภท)
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
    project_id VARCHAR(100) NOT NULL,  -- เก็บเป็นข้อความ รองรับการเชื่อมต่อกับระบบอื่น
    user_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    diagram_type VARCHAR(50) NOT NULL,
    mermaid_script TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. pm_diagram_versions (ประวัติเวอร์ชัน)
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

-- 3. pm_diagram_chat (ประวัติการแชท)
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

-- Indexes สำหรับ Diagram
CREATE INDEX IF NOT EXISTS idx_diagram_project ON pm_diagram (project_id);
CREATE INDEX IF NOT EXISTS idx_diagram_user ON pm_diagram (user_id);
CREATE INDEX IF NOT EXISTS idx_diagram_business ON pm_diagram (business_id);
CREATE INDEX IF NOT EXISTS idx_diagram_type ON pm_diagram (diagram_type);
CREATE INDEX IF NOT EXISTS idx_diagram_metadata ON pm_diagram USING GIN (metadata);

CREATE INDEX IF NOT EXISTS idx_version_diagram ON pm_diagram_versions (diagram_id);
CREATE INDEX IF NOT EXISTS idx_chat_diagram ON pm_diagram_chat (diagram_id);
CREATE INDEX IF NOT EXISTS idx_chat_user ON pm_diagram_chat (user_id);

-- ============================================================
-- ส่วนที่ 16: ข้อมูลเริ่มต้นใน db_parameter (Enum/Lookup)
-- ============================================================

INSERT INTO db_parameter (
    id,
    module_code,
    parameter_code,
    parameter_value,
    parameter_name_en,
    parameter_name_local,
    is_active,
    sort_order,
    created_by,
    created_date,
    updated_by,
    updated_date,
    is_delete
)
VALUES
    -- สถานะเอกสาร (DOC_STATUS)
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'DRAFT', 'Draft', 'ร่าง', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'IN_REVIEW', 'In Review', 'กำลังตรวจสอบ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'APPROVED', 'Approved', 'อนุมัติแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'REJECTED', 'Rejected', 'ถูกปฏิเสธ', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'NEED_REVISION', 'Need Revision', 'ต้องแก้ไข', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'CANCELLED', 'Cancelled', 'ยกเลิก', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'DOC_STATUS', 'CHANGED', 'Changed', 'เปลี่ยนแปลงแล้ว', true, 7, 'system', NOW(), 'system', NOW(), false),

    -- สถานะความคืบหน้า (PROGRESS_STATUS)
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'NOT_STARTED', 'Not Started', 'ยังไม่เริ่ม', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'DONE', 'Done', 'เสร็จสิ้น', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'DELAYED', 'Delayed', 'ล่าช้า', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PROGRESS_STATUS', 'BLOCKED', 'Blocked', 'ติดปัญหา', true, 5, 'system', NOW(), 'system', NOW(), false),

    -- สถานะงานเฉพาะ (TASK_STATUS)
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'TODO', 'Todo', 'ยังไม่เริ่ม', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'IN_PROGRESS', 'In Progress', 'กำลังทำ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'WAITING_REVIEW', 'Waiting Review', 'รอตรวจสอบ', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'WAITING_FIX', 'Waiting Fix', 'รอแก้ไข', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'DONE', 'Done', 'เสร็จแล้ว', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'DELAYED', 'Delayed', 'ล่าช้า', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'BLOCKED', 'Blocked', 'ติดปัญหา', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TASK_STATUS', 'CANCELLED', 'Cancelled', 'ยกเลิก', true, 8, 'system', NOW(), 'system', NOW(), false),

    -- สถานะปัญหาและข้อบกพร่อง (ISSUE_STATUS)
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'OPEN', 'Open', 'เปิดอยู่', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'IN_PROGRESS', 'In Progress', 'กำลังดำเนินการ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'WAITING_CUSTOMER', 'Waiting Customer', 'รอลูกค้ายืนยัน', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'RESOLVED', 'Resolved', 'แก้ไขแล้ว', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'CLOSED', 'Closed', 'ปิดแล้ว', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'FIXING', 'Fixing', 'กำลังแก้ไข', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'FIXED', 'Fixed', 'แก้ไขเสร็จ', true, 8, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ISSUE_STATUS', 'RETEST', 'Retest', 'ทดสอบซ้ำ', true, 9, 'system', NOW(), 'system', NOW(), false),

    -- ระดับความสำคัญทั่วไป (PRIORITY)
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'LOW', 'Low', 'ต่ำ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'MEDIUM', 'Medium', 'ปานกลาง', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'HIGH', 'High', 'สูง', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'CRITICAL', 'Critical', 'วิกฤต', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'PRIORITY', 'URGENT', 'Urgent', 'ด่วน', true, 5, 'system', NOW(), 'system', NOW(), false),

    -- คุณค่าทางธุรกิจ (BUSINESS_VALUE)
    (gen_random_uuid(), 'PM', 'BUSINESS_VALUE', 'HIGH', 'High', 'สูง', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'BUSINESS_VALUE', 'MEDIUM', 'Medium', 'ปานกลาง', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'BUSINESS_VALUE', 'LOW', 'Low', 'ต่ำ', true, 3, 'system', NOW(), 'system', NOW(), false),

    -- สถานะการลงนาม (SIGN_STATUS)
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'DRAFT', 'Draft', 'ร่าง', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'SENT', 'Sent', 'ส่งแล้ว', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'SIGNED', 'Signed', 'ลงนามแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'SIGN_STATUS', 'EXPIRED', 'Expired', 'หมดอายุ', true, 4, 'system', NOW(), 'system', NOW(), false),

    -- สถานะการต่ออายุ (RENEWAL_STATUS)
    (gen_random_uuid(), 'PM', 'RENEWAL_STATUS', 'NOT_RENEWED', 'Not Renewed', 'ยังไม่ต่อ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'RENEWAL_STATUS', 'PENDING', 'Pending Renewal', 'รอต่อ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'RENEWAL_STATUS', 'RENEWED', 'Renewed', 'ต่อแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),

    -- สถานะโครงการ (PROJECT_STATUS) 21 สถานะ
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'PROSPECT', 'Prospect', 'อยู่ระหว่างคุยงานกับลูกค้า', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'CONTRACT_DRAFTING', 'Contract Drafting', 'อยู่ระหว่างจัดทำสัญญา', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'CONTRACT_SIGNED', 'Contract Signed', 'ลงนามสัญญาแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'REQUIREMENT_GATHERING', 'Requirement Gathering', 'เก็บ Requirement', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'REQUIREMENT_APPROVAL', 'Requirement Approval', 'รออนุมัติ Requirement', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'SYSTEM_ANALYSIS', 'System Analysis', 'วิเคราะห์ระบบ', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'USECASE_DESIGN', 'Usecase Diagram Design', 'ออกแบบ Usecase Diagram', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DFD_DESIGN', 'DFD Design', 'ออกแบบ Data Flow Diagram', true, 8, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'ER_DESIGN', 'ER Design', 'ออกแบบ ER Diagram', true, 9, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'SPECIFICATION_DESIGN', 'Specification Design', 'ทำ Specification', true, 10, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'SPECIFICATION_APPROVAL', 'Specification Approval', 'รออนุมัติ Specification', true, 11, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'PLANNING', 'Planning', 'วางแผนงาน Development', true, 12, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DEVELOPMENT', 'Development', 'กำลังพัฒนา', true, 13, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'INTERNAL_TESTING', 'Internal Testing', 'ทดสอบภายใน', true, 14, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'UAT', 'UAT', 'ลูกค้าทดสอบ (UAT)', true, 15, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'BUG_FIXING', 'Bug Fixing', 'แก้ไข Bug', true, 16, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'READY_FOR_DELIVERY', 'Ready for Delivery', 'พร้อมส่งมอบ', true, 17, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DELIVERED', 'Delivered', 'ส่งมอบแล้ว', true, 18, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'INVOICING', 'Invoicing', 'ออกใบแจ้งหนี้', true, 19, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'CLOSED', 'Closed', 'ปิดโครงการ', true, 20, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'MA_ACTIVE', 'MA Active', 'อยู่ในระยะ MA', true, 21, 'system', NOW(), 'system', NOW(), false),

    -- ลำดับความสำคัญของ Requirement (REQ_PRIORITY - MoSCoW)
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'MUST', 'Must Have', 'ต้องมี', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'SHOULD', 'Should Have', 'ควรมี', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'COULD', 'Could Have', 'มีก็ได้', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'REQ_PRIORITY', 'WONT', 'Wont Have', 'ไม่มีก็ได้', true, 4, 'system', NOW(), 'system', NOW(), false),

    -- สถานะการทดสอบ (TEST_STATUS)
    (gen_random_uuid(), 'PM', 'TEST_STATUS', 'PASS', 'Pass', 'ผ่าน', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'TEST_STATUS', 'FAIL', 'Fail', 'ไม่ผ่าน', true, 2, 'system', NOW(), 'system', NOW(), false),

    -- สถานะการชำระเงิน (PAYMENT_STATUS)
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'UNPAID', 'Unpaid', 'ค้างชำระ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'PARTIAL', 'Partial', 'ชำระบางส่วน', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'PAID', 'Paid', 'ชำระแล้ว', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'PAYMENT_STATUS', 'OVERDUE', 'Overdue', 'เกินกำหนด', true, 4, 'system', NOW(), 'system', NOW(), false),

    -- โหมดการอนุมัติ (APPROVAL_MODE)
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'CHAIN', 'Chain', 'เรียงลำดับ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'PARALLEL', 'Parallel', 'พร้อมกัน', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'ANY', 'Any', 'ใครก็ได้', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'APPROVAL_MODE', 'SINGLE', 'Single', 'คนเดียว', true, 4, 'system', NOW(), 'system', NOW(), false),

    -- ประเภทเอกสาร (DOCUMENT_TYPE)
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'REQUIREMENT', 'Requirement', 'เอกสารความต้องการ', true, 1, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'SPECIFICATION', 'Specification', 'เอกสารกำหนดคุณลักษณะ', true, 2, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DFD', 'DFD', 'แผนภาพกระแสข้อมูล', true, 3, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'ER', 'ER Diagram', 'แผนภาพความสัมพันธ์ข้อมูล', true, 4, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DELIVERY', 'Delivery', 'เอกสารส่งมอบ', true, 5, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'INVOICE', 'Invoice', 'ใบแจ้งหนี้', true, 6, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_RENEWAL', 'MA Renewal', 'ต่ออายุสัญญา MA', true, 7, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CHANGE_REQUEST', 'Change Request', 'คำขอเปลี่ยนแปลง', true, 8, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TEST_PLAN', 'Test Plan', 'แผนการทดสอบ', true, 9, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'UAT', 'UAT', 'การทดสอบกับผู้ใช้', true, 10, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TASK', 'Task', 'งาน', true, 11, 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, parameter_code, parameter_value) DO NOTHING;

-- ============================================================
-- ส่วนที่ 17: การปรับแต่งเพิ่มเติม
-- ============================================================

-- ขยายขนาด approver_user_id ใน pm_approval_flow_step เพื่อรองรับหลาย User ID
ALTER TABLE pm_approval_flow_step ALTER COLUMN approver_user_id TYPE VARCHAR(1000);

-- ============================================================
-- จบสคริปต์
-- ============================================================