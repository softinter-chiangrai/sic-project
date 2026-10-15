-- V20260902180000__add_approval_flows_delivery_invoice_maticket.sql
-- Add MA_TICKET parameter and default approval flows for DELIVERY, INVOICE, MA_TICKET

-- 1. Ensure MA_TICKET exists in db_parameter (DOCUMENT_TYPE)
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local, is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'DOCUMENT_TYPE', 'MA_TICKET', 'MA Ticket', 'ใบแจ้งปัญหาและบำรุงรักษา (MA Ticket)', true, 12, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (
    SELECT 1 FROM db_parameter WHERE module_code = 'PM' AND parameter_code = 'DOCUMENT_TYPE' AND parameter_value = 'MA_TICKET'
);
