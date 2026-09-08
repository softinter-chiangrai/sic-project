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
) VALUES 
    (gen_random_uuid(), 'PM', 'CHANGE_REASON', 'SCOPE', 'Scope Change', 'เปลี่ยนแปลงขอบเขต', true, 1, 'system', now(), 'system', now(), false),
    (gen_random_uuid(), 'PM', 'CHANGE_REASON', 'BUDGET', 'Budget Change', 'เปลี่ยนแปลงงบประมาณ', true, 2, 'system', now(), 'system', now(), false),
    (gen_random_uuid(), 'PM', 'CHANGE_REASON', 'SCHEDULE', 'Schedule Change', 'เปลี่ยนแปลงกำหนดเวลา', true, 3, 'system', now(), 'system', now(), false),
    (gen_random_uuid(), 'PM', 'CHANGE_REASON', 'TECHNICAL', 'Technical Change', 'เปลี่ยนแปลงทางเทคนิค', true, 4, 'system', now(), 'system', now(), false),
    (gen_random_uuid(), 'PM', 'CHANGE_REASON', 'CUSTOMER_REQUEST', 'Customer Request', 'คำขอจากลูกค้า', true, 5, 'system', now(), 'system', now(), false);

ALTER TABLE pm_edit_session ADD COLUMN delete_by VARCHAR(100);
ALTER TABLE pm_edit_session ADD COLUMN delete_date TIMESTAMP;
ALTER TABLE pm_edit_session ALTER COLUMN is_delete SET DEFAULT FALSE;