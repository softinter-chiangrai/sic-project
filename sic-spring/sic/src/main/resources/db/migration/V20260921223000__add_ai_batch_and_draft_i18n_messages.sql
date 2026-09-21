-- Migration: Add AI Batch Create modal + shared AI Draft attachment English & Thai UI translations
-- Module: COMMON, Program: ALL (shared across every List/Detail page and every AI Draft form)

DELETE FROM su_message WHERE message_code IN (
    'AI_BATCH_TITLE',
    'AI_BATCH_CLOSE',
    'AI_BATCH_PROMPT_LABEL',
    'AI_BATCH_PROMPT_PLACEHOLDER',
    'AI_BATCH_COUNT_LABEL',
    'AI_BATCH_MODEL_LABEL',
    'AI_BATCH_ATTACH_FILE',
    'AI_BATCH_REMOVE_FILE',
    'AI_BATCH_GENERATING',
    'AI_BATCH_GENERATE_MORE',
    'AI_BATCH_GENERATE',
    'AI_BATCH_REVIEW_HEADER',
    'AI_BATCH_REMOVE_ROW',
    'AI_BATCH_APPEND_HINT',
    'AI_BATCH_SAVING',
    'AI_BATCH_SAVE_ALL',
    'AI_BATCH_NO_RESULT_ERROR',
    'AI_BATCH_CALL_ERROR',
    'AI_BATCH_CREATE_BUTTON',
    'AI_DRAFT_ATTACH_LABEL',
    'AI_DRAFT_CHOOSE_FILE',
    'AI_NAV_REMOVE_FILE',
    'AI_NAV_DEFAULT_SESSION_TITLE',
    'AI_NAV_ATTACHMENT_TITLE_PREFIX'
);

INSERT INTO su_message (
    id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete
) VALUES
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_TITLE', 'AI Batch Create', 'สร้างข้อมูลชุดด้วย AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_CLOSE', 'Close', 'ปิด', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_PROMPT_LABEL', 'Describe the data you want AI to create', 'อธิบายข้อมูลที่ต้องการให้ AI สร้าง', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_PROMPT_PLACEHOLDER', 'e.g. Create 10 test cases for the Login page', 'เช่น สร้าง Test Case สำหรับหน้า Login 10 ข้อ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_COUNT_LABEL', 'Count', 'จำนวน', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_MODEL_LABEL', 'AI Model', 'โมเดล AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_ATTACH_FILE', 'Attach file / image', 'แนบไฟล์ / รูปภาพ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_REMOVE_FILE', 'Remove file', 'ลบไฟล์', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_GENERATING', 'Generating data...', 'กำลังสร้างข้อมูล...', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_GENERATE_MORE', 'Generate more', 'สร้างเพิ่มเติม', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_GENERATE', 'Generate data with AI', 'สร้างข้อมูลด้วย AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_REVIEW_HEADER', 'Review data ({{selected}}/{{total}} items selected)', 'ตรวจทานข้อมูล ({{selected}}/{{total}} รายการที่เลือก)', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_REMOVE_ROW', 'Remove row', 'ลบแถว', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_APPEND_HINT', 'Saving only adds new data - existing data is never overwritten', 'การบันทึกจะเพิ่มข้อมูลใหม่เท่านั้น ไม่มีผลกับข้อมูลเดิม', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_SAVING', 'Saving...', 'กำลังบันทึก...', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_SAVE_ALL', 'Save all to system ({{count}})', 'บันทึกทั้งหมดลงระบบ ({{count}})', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_NO_RESULT_ERROR', 'AI could not generate data. Please try adjusting the prompt or attachment.', 'AI ไม่สามารถสร้างข้อมูลได้ กรุณาลองปรับ Prompt หรือไฟล์แนบใหม่', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_CALL_ERROR', 'An error occurred while calling AI', 'เกิดข้อผิดพลาดในการเรียก AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_BATCH_CREATE_BUTTON', 'AI Batch Create', 'สร้างชุดข้อมูลด้วย AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_DRAFT_ATTACH_LABEL', 'Attach files / images (optional)', 'แนบไฟล์ / รูปภาพประกอบ (ไม่บังคับ)', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_DRAFT_CHOOSE_FILE', 'Choose file', 'เลือกไฟล์', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_REMOVE_FILE', 'Remove file', 'ลบไฟล์', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_DEFAULT_SESSION_TITLE', 'Conversation', 'บทสนทนา', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_ATTACHMENT_TITLE_PREFIX', 'Attached: ', 'แนบไฟล์: ', 'system', NOW(), 'system', NOW(), false);
