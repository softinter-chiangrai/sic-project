-- V20260912172000__seed_default_admin_approval_flows_for_all_doc_types.sql
-- สร้างและตั้งค่า Default Approval Flow สำหรับเอกสารทุกประเภท (Admin อนุมัติ 1 คน, กำหนดเวลา 1 วัน, เกินเวลาปฏิเสธอัตโนมัติ AUTO_REJECT)

-- 1. Ensure all DOCUMENT_TYPE parameters exist in db_parameter
INSERT INTO db_parameter (
    id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local,
    is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete
)
VALUES
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'REQUIREMENT',    'Requirement',    'ข้อกำหนดความต้องการ',       true, 1,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'SPECIFICATION',  'Specification',  'ข้อกำหนดเชิงเทคนิค',       true, 2,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DIAGRAM',        'Diagram',        'แผนภาพระบบ',               true, 3,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DESIGN_REVIEW',  'Design Review',  'การตรวจรับแบบดีไซน์',        true, 4,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CHANGE_REQUEST', 'Change Request', 'คำขอเปลี่ยนแปลง',           true, 5,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TEST_PLAN',      'Test Plan',      'แผนการทดสอบ',               true, 6,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'UAT',            'UAT',            'การตรวจรับระบบโดยผู้ใช้',      true, 7,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'DELIVERY',       'Delivery',       'เอกสารส่งมอบงาน',           true, 8,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'INVOICE',        'Invoice',        'ใบแจ้งหนี้',                 true, 9,  'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_RENEWAL',     'MA Renewal',     'ต่ออายุสัญญาบำรุงรักษา',      true, 10, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'TASK',           'Task',           'งาน / กิจกรรม',             true, 11, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'CONTRACT',       'Contract',       'สัญญา',                     true, 12, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_TICKET',      'MA Ticket',      'ตั๋วแจ้งปัญหา MA',           true, 13, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'USER_MANUAL',    'User Manual',    'คู่มือการใช้งาน',             true, 14, 'system', NOW(), 'system', NOW(), false),
    (gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'PROJECT',        'Project',        'โครงการ',                   true, 15, 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, parameter_code, parameter_value)
DO UPDATE SET
    parameter_name_en    = EXCLUDED.parameter_name_en,
    parameter_name_local = EXCLUDED.parameter_name_local,
    is_active            = true,
    sort_order           = EXCLUDED.sort_order,
    updated_by           = 'system',
    updated_date         = NOW(),
    is_delete            = false;

-- 2. Seed / Update Approval Flows and Steps for all document types
DO $$
DECLARE
    r RECORD;
    v_flow_id UUID;
    v_flow_code VARCHAR(100);
    v_flow_name VARCHAR(255);
    v_description TEXT;
BEGIN
    FOR r IN (
        SELECT parameter_value, COALESCE(parameter_name_local, parameter_name_en, parameter_value) AS doc_name
        FROM db_parameter
        WHERE module_code = 'PM' 
          AND parameter_code = 'DOCUMENT_TYPE'
          AND is_delete = false
        ORDER BY sort_order ASC
    ) LOOP
        v_flow_code := r.parameter_value || '_FLOW_DEFAULT';
        v_flow_name := 'กระบวนการอนุมัติ' || r.doc_name;
        v_description := 'กระบวนการอนุมัติเริ่มต้นสำหรับ ' || r.doc_name || ' (ผู้ดูแลระบบอนุมัติภายใน 1 วัน, เกินเวลาปฏิเสธอัตโนมัติ)';

        -- Check if flow with this specific flow_code exists
        SELECT id INTO v_flow_id 
        FROM pm_approval_flow 
        WHERE flow_code = v_flow_code;

        -- If not found by flow_code, check if there is an active default flow for this document_type
        IF v_flow_id IS NULL THEN
            SELECT id INTO v_flow_id 
            FROM pm_approval_flow 
            WHERE document_type = r.parameter_value 
              AND is_active = true 
              AND is_delete = false
            LIMIT 1;
        END IF;

        -- Insert new flow or update existing flow
        IF v_flow_id IS NULL THEN
            v_flow_id := gen_random_uuid();
            INSERT INTO pm_approval_flow (
                id, flow_code, flow_name, document_type, approval_mode, is_active, description,
                created_by, created_date, updated_by, updated_date, is_delete
            ) VALUES (
                v_flow_id, v_flow_code, v_flow_name, r.parameter_value, 'CHAIN', true, v_description,
                'system', NOW(), 'system', NOW(), false
            );
        ELSE
            UPDATE pm_approval_flow 
            SET flow_name = v_flow_name,
                approval_mode = 'CHAIN',
                is_active = true,
                description = v_description,
                updated_by = 'system',
                updated_date = NOW(),
                is_delete = false
            WHERE id = v_flow_id;
        END IF;

        -- Clear existing steps to ensure only 1 admin approval step
        DELETE FROM pm_approval_flow_step WHERE flow_id = v_flow_id;

        -- Insert 1 single Admin approval step (1 day timeout, AUTO_REJECT)
        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, approver_user_id, is_required,
            timeout_days, timeout_action, can_skip, condition_expression,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            gen_random_uuid(),
            v_flow_id,
            1,
            'ผู้ดูแลระบบอนุมัติ (Admin Approval)',
            'ADMIN',
            NULL,
            true,
            1,
            'AUTO_REJECT',
            false,
            NULL,
            'system',
            NOW(),
            'system',
            NOW(),
            false
        );

    END LOOP;
END $$;

-- 3. Ensure all ADMIN roles in every business have full access to all active programs
INSERT INTO su_business_role_program (
    id, business_role_id, program_id, is_active, is_add, is_back, is_print, is_remove, is_save, is_search, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT 
    gen_random_uuid(),
    r.id,
    p.id,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    false,
    'system',
    NOW(),
    'system',
    NOW()
FROM su_business_role r
CROSS JOIN su_program p
WHERE r.role_code = 'ADMIN'
  AND r.is_active = true 
  AND r.is_delete = false
  AND p.is_active = true 
  AND p.is_delete = false
ON CONFLICT (business_role_id, program_id) 
DO UPDATE SET
    is_active = true,
    is_add = true,
    is_back = true,
    is_print = true,
    is_remove = true,
    is_save = true,
    is_search = true,
    is_delete = false,
    updated_by = 'system',
    updated_date = NOW();

