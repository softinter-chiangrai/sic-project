-- Add upstream impact translations to su_message

INSERT INTO su_message (id, module_code, program_code, message_code, message_en, message_local, created_by, created_date, updated_by, updated_date, is_delete)
VALUES
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_UPSTREAM_CONTEXT_LABEL', 'Impacted Projects & Customers (Upstream)', 'ผลกระทบระดับโครงการและลูกค้า (Upstream Impact)', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_IMPACT_CUSTOMERS_LABEL', 'Impacted Customers', 'ลูกค้าที่ได้รับผลกระทบ', 'system', NOW(), 'system', NOW(), false),
  (gen_random_uuid(), 'COMMON', 'ALL', 'PMDT06_IMPACT_PROJECTS_LABEL', 'Impacted Projects', 'โครงการที่ได้รับผลกระทบ', 'system', NOW(), 'system', NOW(), false)
ON CONFLICT (module_code, program_code, message_code) DO UPDATE
SET message_en = EXCLUDED.message_en,
    message_local = EXCLUDED.message_local,
    updated_date = NOW();
