-- V20260903120000__add_approval_flows_user_manual.sql
-- Add USER_MANUAL parameter and default approval flow for USER_MANUAL

-- 1. Ensure USER_MANUAL exists in su_parameter (DOCUMENT_TYPE)
INSERT INTO su_parameter (id, parameter_group, parameter_code, parameter_value, parameter_name_en, parameter_name_th, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'USER_MANUAL', 'User Manual', 'คู่มือการใช้งาน (User Manual)', true, 13, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (
    SELECT 1 FROM su_parameter WHERE parameter_group = 'PM' AND parameter_code = 'DOCUMENT_TYPE' AND parameter_value = 'USER_MANUAL'
);

-- 2. Insert Default Approval Flow for USER_MANUAL
DO $$
DECLARE
    v_flow_id UUID := 'c0000015-0000-0000-0000-000000000015';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'USER_MANUAL_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'USER_MANUAL_FLOW_DEFAULT', 'กระบวนการอนุมัติคู่มือการใช้งาน (Standard User Manual Approval)', 'USER_MANUAL', 'CHAIN', true, 'กระบวนการตรวจสอบและอนุมัติคู่มือการใช้งานระบบ',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'ผู้จัดการโครงการตรวจสอบคู่มือ (PM Review)', 'PM', true, 3, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ลูกค้ายืนยันรับรองคู่มือ (Customer Acceptance)', 'CUSTOMER', true, 5, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;
