-- Migration: Add AI Navigator English & Thai UI Translations
-- Module: COMMON, Program: ALL

DELETE FROM su_message WHERE message_code IN (
    'AI_NAV_FAB_TITLE',
    'AI_NAV_TITLE',
    'AI_NAV_DRAG_DROP',
    'AI_NAV_SELECT_MODEL',
    'AI_NAV_RECOMMENDED',
    'AI_NAV_NEW_CHAT',
    'AI_NAV_NEW_CHAT_TITLE',
    'AI_NAV_HISTORY',
    'AI_NAV_NO_HISTORY',
    'AI_NAV_MESSAGES_COUNT',
    'AI_NAV_DELETE_SESSION',
    'AI_NAV_CLEAR_ALL_HISTORY',
    'AI_NAV_CONFIRM_CLEAR',
    'AI_NAV_ATTACH_FILE',
    'AI_NAV_INPUT_PLACEHOLDER',
    'AI_NAV_SEND',
    'AI_NAV_CLOSE',
    'AI_NAV_INITIAL_WELCOME',
    'AI_NAV_ERROR_MSG'
);

INSERT INTO su_message (
    id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete
) VALUES
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_FAB_TITLE', 'AI System Navigator', 'ผู้ช่วย AI นำทางระบบ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_TITLE', 'AI System Navigator', 'ผู้ช่วย AI นำทางระบบ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_DRAG_DROP', 'Drop files here to attach to AI', 'วางไฟล์ที่นี่เพื่อแนบให้ AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_SELECT_MODEL', 'Select AI Model', 'เลือกโมเดล AI', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_RECOMMENDED', 'Recommended', 'แนะนำ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_NEW_CHAT', 'New Chat', 'แชทใหม่', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_NEW_CHAT_TITLE', 'Start new conversation', 'เริ่มบทสนทนาใหม่', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_HISTORY', 'Chat History', 'ประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_NO_HISTORY', 'No chat history yet', 'ยังไม่มีประวัติการสนทนา', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_MESSAGES_COUNT', 'messages', 'ข้อความ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_DELETE_SESSION', 'Delete this chat', 'ลบบทสนทนานี้', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_CLEAR_ALL_HISTORY', 'Clear all history', 'ล้างประวัติทั้งหมด', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_CONFIRM_CLEAR', 'Are you sure you want to clear all chat history?', 'คุณต้องการล้างประวัติการสนทนาทั้งหมดหรือไม่?', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_ATTACH_FILE', 'Attach files or images', 'แนบไฟล์หรือรูปภาพ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_INPUT_PLACEHOLDER', 'Ask about workflows or where you want to go...', 'ถามขั้นตอนการใช้งาน หรือบอกว่าอยากไปหน้าไหน...', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_SEND', 'Send message', 'ส่งข้อความ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_CLOSE', 'Close', 'ปิด', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_INITIAL_WELCOME', 'Hello! I am the SIC AI System Navigator. Ask about system workflows or tell me where you would like to go.', 'สวัสดีครับ ผมคือผู้ช่วย AI นำทางระบบ SIC ถามขั้นตอนการใช้งาน หรือบอกว่าอยากไปหน้าไหน/อยากสร้างข้อมูลอะไรได้เลยครับ', 'system', NOW(), 'system', NOW(), false),
(gen_random_uuid(), 'COMMON', 'ALL', 'AI_NAV_ERROR_MSG', 'Sorry, an error occurred while connecting to AI. Please try again.', 'ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง', 'system', NOW(), 'system', NOW(), false);
