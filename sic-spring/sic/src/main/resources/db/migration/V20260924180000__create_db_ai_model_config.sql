-- Migration: V20260924180000__create_db_ai_model_config.sql
-- Description: ย้ายรายการ AI model (id/name/provider/apiUrl/apiKey) ออกจากโค้ด/ env var hardcode
-- ใน PmAiProviderServiceImpl มาเก็บในตาราง เพื่อให้ admin จัดการผ่านหน้าเว็บได้เอง (BURT07)
-- api_key เก็บแบบเข้ารหัส (AES-GCM ผ่าน AiApiKeyConverter ฝั่ง backend) จึงปล่อย NULL ไว้ก่อน
-- admin ต้องเข้าไปกรอก key จริงในหน้าจัดการ model หลัง deploy

CREATE TABLE IF NOT EXISTS db_ai_model_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by VARCHAR(100),
    delete_date TIMESTAMPTZ,

    model_code VARCHAR(150) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    provider_label VARCHAR(100) NOT NULL,
    api_format VARCHAR(30) NOT NULL,
    api_url VARCHAR(500) NOT NULL,
    api_key VARCHAR(1000),
    max_tokens INTEGER DEFAULT 4096,
    description VARCHAR(500),
    icon VARCHAR(100),
    is_recommended BOOLEAN DEFAULT FALSE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 1
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_db_ai_model_config_model_code
    ON db_ai_model_config (model_code) WHERE is_delete = false;


-- ลงทะเบียนหน้า "จัดการ AI Model" (BURT07) ในเมนู Business Setting เดียวกับ BURT01-06
INSERT INTO su_program (id, parent_program_id, program_code, icon, name_en, name_local, route_path, sort_order, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), '019eb052-e6bc-7d6c-b099-d9b7e8e2625a', 'BURT07', 'bi-robot',
       'AI Model Management', 'จัดการ AI Model', 'bu/ai-model-config', 7, true,
       false, false, false, false, false, false, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM su_program WHERE program_code = 'BURT07');

-- ให้สิทธิ์ ADMIN role ทุก business เข้าถึงหน้านี้ได้ (pattern เดียวกับ V20260912172000)
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(), r.id, p.id, true, false, false, false, false, false, false, false,
    'system', NOW(), 'system', NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE r.role_code = 'ADMIN'
  AND r.is_active = true
  AND r.is_delete = false
  AND p.program_code = 'BURT07'
  AND p.is_active = true
  AND p.is_delete = false
ON CONFLICT (business_role_id, program_id)
DO UPDATE SET
    is_active = true,
    is_add = false,
    is_back = false,
    is_print = false,
    is_remove = false,
    is_save = false,
    is_search = false,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();
