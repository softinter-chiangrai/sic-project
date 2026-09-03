-- V20260902180000__add_approval_flows_delivery_invoice_maticket.sql
-- Add MA_TICKET parameter and default approval flows for DELIVERY, INVOICE, MA_TICKET

-- 1. Ensure MA_TICKET exists in su_parameter (DOCUMENT_TYPE)
INSERT INTO su_parameter (id, parameter_group, parameter_code, parameter_value, parameter_name_en, parameter_name_th, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_TICKET', 'MA Ticket', 'ใบแจ้งปัญหาและบำรุงรักษา (MA Ticket)', true, 12, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (
    SELECT 1 FROM su_parameter WHERE parameter_group = 'PM' AND parameter_code = 'DOCUMENT_TYPE' AND parameter_value = 'MA_TICKET'
);

-- 2. Insert Default Approval Flows for DELIVERY, INVOICE, MA_TICKET if not present

-- DELIVERY Default Flow
DO $$
DECLARE
    v_flow_id UUID := 'c0000014-0000-0000-0000-000000000014';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'DELIVERY_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'DELIVERY_FLOW_DEFAULT', 'กระบวนการอนุมัติการส่งมอบงาน (Standard Delivery Approval)', 'DELIVERY', 'CHAIN', true, 'กระบวนการอนุมัติตรวจรับและส่งมอบงาน',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'ผู้จัดการโครงการตรวจรับมอบ (PM Review)', 'PM', true, 3, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ลูกค้ายืนยันรับมอบงาน (Customer Sign-off)', 'CUSTOMER', true, 5, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;

-- INVOICE Default Flow
DO $$
DECLARE
    v_flow_id UUID := 'c0000016-0000-0000-0000-000000000016';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'INVOICE_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'INVOICE_FLOW_DEFAULT', 'กระบวนการอนุมัติใบแจ้งหนี้ (Standard Invoice Approval)', 'INVOICE', 'CHAIN', true, 'กระบวนการอนุมัติใบแจ้งหนี้และการชำระเงิน',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'ฝ่ายการเงินตรวจสอบ (Finance Review)', 'FINANCE', true, 3, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ผู้มีอำนาจลงนามอนุมัติ (Management Approval)', 'HEAD', true, 5, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;

-- MA_TICKET Default Flow
DO $$
DECLARE
    v_flow_id UUID := 'c0000017-0000-0000-0000-000000000017';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pm_approval_flow WHERE flow_code = 'MA_TICKET_FLOW_DEFAULT') THEN
        INSERT INTO pm_approval_flow (
            id, flow_code, flow_name, document_type, approval_mode, is_active, description,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES (
            v_flow_id, 'MA_TICKET_FLOW_DEFAULT', 'กระบวนการอนุมัติปิดตั๋ว MA (Standard MA Ticket Approval)', 'MA_TICKET', 'CHAIN', true, 'กระบวนการอนุมัติและยืนยันการแก้ไขปัญหา MA Ticket',
            'system', NOW(), 'system', NOW(), false
        );

        INSERT INTO pm_approval_flow_step (
            id, flow_id, step_order, step_name, approver_role, is_required, timeout_days, can_skip,
            created_by, created_date, updated_by, updated_date, is_delete
        ) VALUES
        (gen_random_uuid(), v_flow_id, 1, 'หัวหน้างานตรวจสอบผลการแก้ไข (Lead/PM Review)', 'PM', true, 2, false, 'system', NOW(), 'system', NOW(), false),
        (gen_random_uuid(), v_flow_id, 2, 'ลูกค้ายืนยันผลการแก้ไข (Customer Acceptance)', 'CUSTOMER', true, 3, false, 'system', NOW(), 'system', NOW(), false);
    END IF;
END $$;
