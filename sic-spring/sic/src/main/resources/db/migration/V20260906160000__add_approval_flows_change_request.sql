-- V20260906160000__add_approval_flows_change_request.sql
-- Add default approval flow for CHANGE_REQUEST and DIAGRAM

-- 1. Ensure CHANGE_REQUEST default approval flow exists
DO $$
DECLARE
    v_flow_id UUID := 'c0000015-0000-0000-0000-000000000015';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'CHANGE_REQUEST_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'CHANGE_REQUEST_FLOW_DEFAULT', 'กระบวนการอนุมัติคำขอเปลี่ยนแปลง (Standard Change Request Approval)', 'CHANGE_REQUEST', 'CHAIN', true, 'กระบวนการตรวจสอบและอนุมัติการขอเปลี่ยนแปลงเอกสารหรือระบบ (Change Request)',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'ผู้จัดการโครงการประเมินผลกระทบ (PM Impact Assessment & Review)', 'PM', true, 3, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ลูกค้าหรือผู้มีอำนาจอนุมัติคำขอ (Customer Sign-off)', 'CUSTOMER', true, 5, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;

-- 2. Ensure DIAGRAM default approval flow exists
DO $$
DECLARE
    v_flow_id UUID := 'c0000018-0000-0000-0000-000000000018';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'DIAGRAM_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'DIAGRAM_FLOW_DEFAULT', 'กระบวนการอนุมัติแผนภาพระบบ (Standard Diagram Approval)', 'DIAGRAM', 'CHAIN', true, 'กระบวนการตรวจทานและอนุมัติแผนภาพสถาปัตยกรรม/ไดอะแกรม (DFD/ER)',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'ผู้จัดการโครงการตรวจสอบ (PM Review)', 'PM', true, 3, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ลูกค้าหรือหัวหน้างานอนุมัติ (Customer Sign-off)', 'CUSTOMER', true, 5, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;

-- 3. Ensure PROJECT default approval flow exists
DO $$
DECLARE
    v_flow_id UUID := 'c0000019-0000-0000-0000-000000000019';
BEGIN
    -- Ensure PROJECT exists in db_parameter (DOCUMENT_TYPE)
    IF NOT EXISTS (SELECT 1 FROM db_parameter WHERE module_code = 'PM' AND parameter_code = 'DOCUMENT_TYPE' AND parameter_value = 'PROJECT') THEN
        INSERT INTO db_parameter (
            id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local,
            is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'PROJECT', 'Project', 'โครงการ (Project)',
            true, 14, 'system', NOW(), 'system', NOW(), false
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'PROJECT_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'PROJECT_FLOW_DEFAULT', 'กระบวนการอนุมัติโครงการใหม่ (Standard Project Approval)', 'PROJECT', 'CHAIN', true, 'กระบวนการพิจารณาตรวจสอบและอนุมัติเปิดโครงการใหม่ (Project Charter & Creation)',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'ผู้จัดการโครงการ / หัวหน้าฝ่าย (PM Review & Verification)', 'PM', true, 3, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ผู้บริหารหรือลูกค้าผู้ว่าจ้าง (Management / Sponsor Sign-off)', 'CUSTOMER', true, 5, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;

-- Ensure PROJECT exists in db_parameter (DOCUMENT_TYPE)
INSERT INTO db_parameter (
    id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local,
    is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete
)
SELECT 
    gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'PROJECT', 'Project', 'โครงการ (Project)',
    true, 14, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (
    SELECT 1 FROM db_parameter 
    WHERE module_code = 'PM' 
      AND parameter_code = 'DOCUMENT_TYPE' 
      AND parameter_value = 'PROJECT'
);


