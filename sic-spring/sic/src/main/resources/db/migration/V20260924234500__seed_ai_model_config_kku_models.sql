-- Migration: V20260924234500__seed_ai_model_config_kku_models.sql
-- Description: ตั้งค่า AI model เริ่มต้นของหน้า "จัดการ AI Model" (BURT07) ให้ใช้ KKU GenAI gateway (รูปแบบ OpenAI-compatible)
-- api_key เก็บแบบเข้ารหัส AES-GCM ตาม AiApiKeyConverter (เข้ารหัสด้วยค่า app.ai.config-encryption-key)
-- ถ้า environment ไหนตั้ง AI_MODEL_CONFIG_ENCRYPTION_KEY เป็นค่าอื่น ให้เข้าไปกรอก key ใหม่ในหน้าจัดการ AI Model อีกครั้ง

INSERT INTO db_ai_model_config
    (model_code, display_name, provider_label, api_format, api_url, api_key, max_tokens,
     description, icon, is_recommended, is_default, is_active, sort_order)
VALUES
    ('gemini-3.8-flash', 'Gemini 3.8 Flash', 'Google (KKU)', 'OPENAI_COMPATIBLE',
     'https://gen.ai.kku.ac.th/upacth/api/v1/chat/completions',
     'hu9NUMMHnTJ/kDin7CEnGv0epe2ez6YGYaJ6FOQlHQVEDLCGHAqPhYbmWzvUIs3Y0yWxiO942W23dLyVar4netuMqwyJFFCHg/NOE2h+11Uq3KmHSprHh0aGfSbi4CE=',
     4096, 'ประมวลผลรวดเร็ว ฉลาด และแม่นยำสูง (แนะนำ)', 'bi-stars', true, true, true, 1),

    ('claude-sonnet-5', 'Claude Sonnet 5', 'Anthropic (KKU)', 'OPENAI_COMPATIBLE',
     'https://gen.ai.kku.ac.th/upacth/api/v1/chat/completions',
     'hu9NUMMHnTJ/kDin7CEnGv0epe2ez6YGYaJ6FOQlHQVEDLCGHAqPhYbmWzvUIs3Y0yWxiO942W23dLyVar4netuMqwyJFFCHg/NOE2h+11Uq3KmHSprHh0aGfSbi4CE=',
     4096, 'คิดวิเคราะห์ลึก แม่นยำสูง สำหรับสถาปัตยกรรมที่ซับซ้อน', 'bi-cpu', false, false, true, 2),

    ('gpt-5.4', 'OpenAI GPT-5.4', 'OpenAI (KKU)', 'OPENAI_COMPATIBLE',
     'https://gen.ai.kku.ac.th/upacth/api/v1/chat/completions',
     'hu9NUMMHnTJ/kDin7CEnGv0epe2ez6YGYaJ6FOQlHQVEDLCGHAqPhYbmWzvUIs3Y0yWxiO942W23dLyVar4netuMqwyJFFCHg/NOE2h+11Uq3KmHSprHh0aGfSbi4CE=',
     4096, 'โมเดลอัจฉริยะ ความสามารถสูง', 'bi-cpu-fill', false, false, true, 3),

    ('deepseek-v4-flash', 'DeepSeek V4 Flash', 'DeepSeek (KKU)', 'OPENAI_COMPATIBLE',
     'https://gen.ai.kku.ac.th/upacth/api/v1/chat/completions',
     'hu9NUMMHnTJ/kDin7CEnGv0epe2ez6YGYaJ6FOQlHQVEDLCGHAqPhYbmWzvUIs3Y0yWxiO942W23dLyVar4netuMqwyJFFCHg/NOE2h+11Uq3KmHSprHh0aGfSbi4CE=',
     4096, 'คิดวิเคราะห์ตรรกะและการเขียนโค้ดดีเยี่ยม', 'bi-robot', false, false, true, 4)
ON CONFLICT (model_code) WHERE is_delete = false
DO UPDATE SET
    display_name = EXCLUDED.display_name,
    provider_label = EXCLUDED.provider_label,
    api_format = EXCLUDED.api_format,
    api_url = EXCLUDED.api_url,
    api_key = EXCLUDED.api_key,
    max_tokens = EXCLUDED.max_tokens,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    is_recommended = EXCLUDED.is_recommended,
    is_default = EXCLUDED.is_default,
    is_active = true,
    sort_order = EXCLUDED.sort_order,
    updated_by = 'system',
    updated_date = NOW();

-- model เดิมที่ seed ไว้แต่ไม่มี key และไม่อยู่ในรายการใหม่: ปิดใช้งาน (ไม่ลบ) เพื่อไม่ให้ขึ้นใน dropdown แล้วเรียกใช้ไม่ได้
UPDATE db_ai_model_config
SET is_active = false,
    is_default = false,
    updated_by = 'system',
    updated_date = NOW()
WHERE is_delete = false
  AND api_key IS NULL
  AND model_code NOT IN ('gemini-3.8-flash', 'claude-sonnet-5', 'gpt-5.4', 'deepseek-v4-flash');
