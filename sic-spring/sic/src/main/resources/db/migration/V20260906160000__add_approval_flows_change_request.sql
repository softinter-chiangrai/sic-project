-- V20260906160000__add_approval_flows_change_request.sql
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


