-- เพิ่ม timeout_action ในตาราง pm_approval_flow_step
ALTER TABLE pm_approval_flow_step
ADD COLUMN IF NOT EXISTS timeout_action VARCHAR(30) DEFAULT 'NONE';
COMMENT ON COLUMN pm_approval_flow_step.timeout_action IS 'NONE, AUTO_SKIP, AUTO_APPROVE, AUTO_REJECT, ESCALATE';
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
    )
VALUES (
        gen_random_uuid(),
        'PM',
        'DOCUMENT_TYPE',
        'CONTRACT',
        'Contract',
        'สัญญา',
        true,
        12,
        'system',
        NOW(),
        'system',
        NOW(),
        false
    ) ON CONFLICT (module_code, parameter_code, parameter_value) DO
UPDATE
SET parameter_name_en = EXCLUDED.parameter_name_en,
    parameter_name_local = EXCLUDED.parameter_name_local,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order,
    updated_by = 'system',
    updated_date = NOW(),
    is_delete = false;