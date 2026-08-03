ALTER TABLE pm_requirement ADD COLUMN IF NOT EXISTS upload_group_id UUID;

-- เพิ่มข้อมูล Requirement Types (ถ้ายังไม่มีในระบบ)
INSERT INTO db_parameter  (
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
SELECT 
    gen_random_uuid(),
    'PM',
    'REQUIREMENT_TYPE',
    vals.parameter_value,
    vals.parameter_name_en,
    vals.parameter_name_local,
    true,
    vals.sort_order,
    'system',
    now(),
    'system',
    now(),
    false
FROM (
    VALUES 
        ('FUNCTIONAL', 'Functional', 'ความต้องการด้านฟังก์ชัน', 1),
        ('NON_FUNCTIONAL', 'Non-Functional', 'ความต้องการด้านประสิทธิภาพ', 2),
        ('BUSINESS_RULE', 'Business Rule', 'กฎทางธุรกิจ', 3),
        ('REPORT', 'Report', 'ความต้องการด้านรายงาน', 4),
        ('INTEGRATION', 'Integration', 'ความต้องการเชื่อมต่อระบบ', 5),
        ('SECURITY', 'Security', 'ความต้องการด้านความปลอดภัย', 6),
        ('DATA', 'Data', 'ความต้องการด้านข้อมูล', 7),
        ('UI', 'UI', 'ความต้องการด้านหน้าจอ', 8)
) AS vals(parameter_value, parameter_name_en, parameter_name_local, sort_order)
WHERE NOT EXISTS (
    SELECT 1 
    FROM db_parameter 
    WHERE module_code = 'PM' 
      AND parameter_code = 'REQUIREMENT_TYPE' 
      AND parameter_value = vals.parameter_value
      AND is_delete = false
);