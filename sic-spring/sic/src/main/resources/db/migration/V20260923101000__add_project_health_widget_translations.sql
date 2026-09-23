-- Migration: Add Project Health Widget i18n Translations
-- Module: COMMON, Program: ALL

DELETE FROM su_message WHERE message_code IN (
    'PROJECT_HEALTH_WIDGET_TITLE',
    'PROJECT_HEALTH_STATUS_GOOD',
    'PROJECT_HEALTH_STATUS_WARNING',
    'PROJECT_HEALTH_STATUS_CRITICAL',
    'PROJECT_HEALTH_TOTAL_SCORE',
    'PROJECT_HEALTH_FACTOR_TASKS',
    'PROJECT_HEALTH_FACTOR_MANDAY',
    'PROJECT_HEALTH_FACTOR_QUALITY',
    'PROJECT_HEALTH_FACTOR_PHASE',
    'PROJECT_HEALTH_FACTOR_TIMELINE',
    'PROJECT_HEALTH_DETAIL_NO_TASKS',
    'PROJECT_HEALTH_DETAIL_TASKS_PROGRESS',
    'PROJECT_HEALTH_DETAIL_MANDAY_USAGE',
    'PROJECT_HEALTH_DETAIL_NO_BUGS',
    'PROJECT_HEALTH_DETAIL_BUGS_PROGRESS',
    'PROJECT_HEALTH_DETAIL_NO_PHASES',
    'PROJECT_HEALTH_DETAIL_PHASES_PROGRESS',
    'PROJECT_HEALTH_DETAIL_ON_SCHEDULE',
    'PROJECT_HEALTH_DETAIL_DELAYED',
    'PROJECT_HEALTH_DETAIL_COMPLETED',
    'PROJECT_HEALTH_DETAIL_OVERDUE'
);

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_WIDGET_TITLE', 'Project Health', 'สุขภาพโครงการ', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_STATUS_GOOD', 'Good Health', 'สุขภาพดี', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_STATUS_WARNING', 'Needs Attention', 'เฝ้าระวัง', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_STATUS_CRITICAL', 'Critical', 'วิกฤต', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_TOTAL_SCORE', 'Overall Health Score', 'คะแนนสุขภาพรวม', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_FACTOR_TASKS', 'Task Progress', 'ความคืบหน้างาน', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_FACTOR_MANDAY', 'Manday Usage (vs Budget)', 'การใช้ Manday (จากงบทั้งหมด)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_FACTOR_QUALITY', 'Quality & Bug Fixing', 'คุณภาพ & การแก้ไข Bug', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_FACTOR_PHASE', 'Phase Progress', 'ความคืบหน้า Phase', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_FACTOR_TIMELINE', 'Timeline & Schedule Status', 'สถานะและกำหนดการ', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_NO_TASKS', 'No tasks (0/0)', 'ไม่มีงาน (0/0)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_TASKS_PROGRESS', 'Tasks completed {{completed}}/{{total}} ({{percent}}%)', 'งานเสร็จ {{completed}}/{{total}} งาน ({{percent}}%)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_MANDAY_USAGE', '{{used}} / {{budget}} Manday ({{percent}}%)', '{{used}} / {{budget}} Manday ({{percent}}%)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_NO_BUGS', 'Clean, no open bugs (0/0)', 'สมบูรณ์ ไม่มี Bug ในระบบ (0/0)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_BUGS_PROGRESS', 'Fixed {{closed}}/{{total}} bugs ({{percent}}%)', 'แก้ไขแล้ว {{closed}}/{{total}} Bug ({{percent}}%)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_NO_PHASES', 'No phases (0/0)', 'ไม่มี Phase (0/0)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_PHASES_PROGRESS', '{{completed}}/{{total}} Phases ({{percent}}%)', '{{completed}}/{{total}} Phase ({{percent}}%)', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_ON_SCHEDULE', 'On Schedule', 'ตามแผนงาน', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_DELAYED', 'Behind Schedule', 'ล่าช้ากว่ากำหนด', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_COMPLETED', 'Completed as Planned', 'เสร็จสิ้นตามเป้าหมาย', 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'COMMON', 'ALL', 'PROJECT_HEALTH_DETAIL_OVERDUE', 'Overdue / Delivery Passed', 'เกินกำหนดส่งมอบ', 'system', NOW(), 'system', NOW(), false);
