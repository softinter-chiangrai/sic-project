-- ============================================================
-- Script สร้างฐานข้อมูลระบบ SoftFlow (PostgreSQL)
-- รวม 75 ตาราง + ระบบอนุมัติขั้นสูง (แบบ Workflow)
-- ปรับปรุง: ลบฟิลด์สถานะอนุมัติซ้ำซ้อน ใช้ระบบอนุมัติกลางแทน
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

-- 10. su_business (มี FK ไป db_title, db_country, db_province, db_district, db_sub_district)
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

-- 11. su_business_audit (extends BaseBusinessEntity)
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

-- 12. su_business_invite (extends BaseEntity, ไม่มี business_id)
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

-- 13. su_business_role (extends BaseEntity, ไม่มี business_id)
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

-- 15. su_user_business (extends BaseBusinessEntity)
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

-- 16. su_user_business_role (extends BaseEntity, ไม่มี business_id)
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

-- 17. su_profile (extends BaseEntity)
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

-- 21. su_chat_group_member (extends BaseBusinessEntity)
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

-- 22. su_chat_group_log (extends BaseBusinessEntity)
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

-- 23. su_chat_log (extends BaseBusinessEntity)
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

-- 24. su_chat_group_call_participant (extends BaseEntity)
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
-- ส่วนที่ 4: งานทั่วไปและ PM พื้นฐาน (ตารางที่ 25-31)
-- ============================================================

-- 25. su_task (task ทั่วไป)
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

-- 26. su_user_task (extends BaseBusinessEntity)
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

-- 29. pm_customer (extends BaseBusinessEntity) 
-- ปรับ business_id ให้เป็น NULL ได้
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

-- 30. pm_customer_contract (extends BaseBusinessEntity)
-- ลบ sign_status ออก (ใช้ระบบอนุมัติแทน)
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

-- 31. pm_customer_project (extends BaseBusinessEntity)
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

-- ============================================================
-- ส่วนที่ 5: Requirement และ Change Control (ตารางที่ 32-34)
-- ============================================================

-- 32. pm_requirement (extends BaseBusinessEntity)
-- ลบ ba_confirm_status และ customer_confirm_status ออก
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

-- 33. pm_requirement_change_request (extends BaseBusinessEntity)
-- ลบ internal_approval_status และ customer_approval_status ออก
CREATE TABLE IF NOT EXISTS pm_requirement_change_request (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
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

-- 34. pm_change_impact_analysis (extends BaseBusinessEntity)
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
-- ส่วนที่ 6: DFD (ตารางที่ 35-38)
-- ============================================================

-- 35. pm_dfd (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_dfd (
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
    dfd_name VARCHAR(255) NOT NULL,
    dfd_level VARCHAR(20) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_dfd_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 36. pm_dfd_process (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_dfd_process (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    dfd_id UUID NOT NULL,
    process_code VARCHAR(30) NOT NULL,
    process_name VARCHAR(255) NOT NULL,
    description TEXT,
    input_data TEXT,
    output_data TEXT,
    related_requirement TEXT,
    related_data_store TEXT,
    owner VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_process_dfd FOREIGN KEY (dfd_id) REFERENCES pm_dfd(id)
);

-- 37. pm_dfd_data_flow (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_dfd_data_flow (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    dfd_id UUID NOT NULL,
    process_id UUID,
    flow_name VARCHAR(255) NOT NULL,
    flow_source VARCHAR(100),
    flow_target VARCHAR(100),
    data_description TEXT,
    CONSTRAINT fk_flow_dfd FOREIGN KEY (dfd_id) REFERENCES pm_dfd(id),
    CONSTRAINT fk_flow_process FOREIGN KEY (process_id) REFERENCES pm_dfd_process(id)
);

-- 38. pm_dfd_external_entity (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_dfd_external_entity (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    dfd_id UUID NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    description TEXT,
    CONSTRAINT fk_ext_entity_dfd FOREIGN KEY (dfd_id) REFERENCES pm_dfd(id)
);

-- ============================================================
-- ส่วนที่ 7: ER Diagram (ตารางที่ 39-42)
-- ============================================================

-- 39. pm_er_diagram (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_er_diagram (
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
    diagram_name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_er_project FOREIGN KEY (project_id) REFERENCES pm_customer_project(id)
);

-- 40. pm_er_table (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_er_table (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    er_diagram_id UUID NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    related_dfd_data_store VARCHAR(255),
    related_requirement VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Draft',
    CONSTRAINT fk_er_table_diagram FOREIGN KEY (er_diagram_id) REFERENCES pm_er_diagram(id)
);

-- 41. pm_er_column (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_er_column (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    table_id UUID NOT NULL,
    column_name VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) NOT NULL,
    length INTEGER,
    nullable BOOLEAN,
    default_value VARCHAR(255),
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_foreign_key BOOLEAN DEFAULT FALSE,
    reference_table UUID,
    reference_column VARCHAR(100),
    description TEXT,
    related_requirement VARCHAR(255),
    CONSTRAINT fk_column_table FOREIGN KEY (table_id) REFERENCES pm_er_table(id)
);

-- 42. pm_er_relationship (extends BaseBusinessEntity)
CREATE TABLE IF NOT EXISTS pm_er_relationship (
    id UUID PRIMARY KEY,
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL,
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,
    business_id UUID,
    table_from_id UUID NOT NULL,
    table_to_id UUID NOT NULL,
    relationship_type VARCHAR(20) NOT NULL,
    description TEXT,
    CONSTRAINT fk_relationship_from FOREIGN KEY (table_from_id) REFERENCES pm_er_table(id),
    CONSTRAINT fk_relationship_to FOREIGN KEY (table_to_id) REFERENCES pm_er_table(id)
);

-- ============================================================
-- ส่วนที่ 8: Specification และ Use Case (ตารางที่ 43-44)
-- ============================================================

-- 43. pm_specification (extends BaseBusinessEntity)
-- ลบ head_confirm_status และ customer_confirm_status ออก
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

-- 44. pm_usecase (extends BaseBusinessEntity)
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
-- ส่วนที่ 9: Planning และ Development Task (ตารางที่ 45-50)
-- ============================================================

-- 45. pm_phase (extends BaseBusinessEntity)
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

-- 46. pm_milestone (extends BaseBusinessEntity)
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

-- 47. pm_work_package (extends BaseBusinessEntity)
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

-- 48. pm_task (Development Task) (extends BaseBusinessEntity)
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

-- 49. pm_task_dependency (extends BaseBusinessEntity)
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

-- 50. pm_task_assignee (extends BaseBusinessEntity)
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
-- ส่วนที่ 10: Design Review (ตารางที่ 51-52)
-- ============================================================

-- 51. pm_design_review (extends BaseBusinessEntity)
-- คง status ไว้ (ไม่ใช่การอนุมัติโดยตรง)
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

-- 52. pm_review_comment (extends BaseBusinessEntity)
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
-- ส่วนที่ 11: Testing (ตารางที่ 53-56)
-- ============================================================

-- 53. pm_test_plan (extends BaseBusinessEntity)
-- คง status ไว้ (ไม่เกี่ยวกับการอนุมัติ)
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

-- 54. pm_test_scenario (extends BaseBusinessEntity)
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

-- 55. pm_test_case (extends BaseBusinessEntity)
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

-- 56. pm_test_result (extends BaseBusinessEntity)
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
-- ส่วนที่ 12: Bug / Issue (ตารางที่ 57-59)
-- ============================================================

-- 57. pm_bug (extends BaseBusinessEntity)
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

-- 58. pm_bug_retest_plan (extends BaseBusinessEntity)
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

-- 59. pm_bug_comment (extends BaseBusinessEntity)
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
-- ส่วนที่ 13: Delivery (ตารางที่ 60-63)
-- ============================================================

-- 60. pm_delivery (extends BaseBusinessEntity)
-- คง delivery_status ไว้ (ไม่ใช่การอนุมัติโดยตรง)
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

-- 61. pm_delivery_document (extends BaseBusinessEntity)
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

-- 62. pm_user_manual (extends BaseBusinessEntity)
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

-- 63. pm_delivery_checklist (extends BaseBusinessEntity)
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
-- ส่วนที่ 14: Invoice และ Payment (ตารางที่ 64-66)
-- ============================================================

-- 64. pm_invoice (extends BaseBusinessEntity)
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

-- 65. pm_invoice_item (extends BaseBusinessEntity)
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

-- 66. pm_payment (extends BaseBusinessEntity)
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
-- ส่วนที่ 15: MA และ Support (ตารางที่ 67-70)
-- ============================================================

-- 67. pm_ma_contract (extends BaseBusinessEntity)
-- คง status ไว้ (เช่น Active, Expired) ซึ่งไม่ใช่การอนุมัติโดยตรง
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

-- 68. pm_ma_ticket (extends BaseBusinessEntity)
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

-- 69. pm_ma_ticket_comment (extends BaseBusinessEntity)
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

-- 70. pm_ma_renewal (extends BaseBusinessEntity)
-- คง renewal_status ไว้ (ไม่เกี่ยวกับการอนุมัติ)
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
-- ส่วนที่ 16: ระบบกลาง (Cross-Cutting) (ตารางที่ 71, 73-75)
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
-- ส่วนที่ 17: ระบบอนุมัติขั้นสูง (Workflow-based)
-- ============================================================

-- ลบตารางระบบอนุมัติเดิม (ถ้ามี) พร้อมความสัมพันธ์ทั้งหมด
DROP TABLE IF EXISTS 
    pm_approval_reminder,
    pm_approval_log,
    pm_approval_step_status,
    pm_approval,
    pm_approval_flow_step,
    pm_approval_flow 
CASCADE;

-- 1. pm_approval_flow: นิยามกระบวนการอนุมัติ
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

-- 2. pm_approval_flow_step: ขั้นตอนในกระบวนการอนุมัติ
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

-- 3. pm_approval: คำขออนุมัติ (Instance ของ Flow)
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

-- 4. pm_approval_step_status: สถานะแต่ละขั้นตอน
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

-- 5. pm_approval_log: ประวัติการดำเนินการ
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

-- 6. pm_approval_reminder: การเตือน
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

-- ============================================================
-- จบสคริปต์
-- ============================================================