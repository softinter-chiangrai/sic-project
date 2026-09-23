-- Migration: Backfill missing records in pm_document_version for existing documents
-- Ensures all created documents appear in Project Document History & Versions (/feature/pm/version)

-- 1. Backfill Requirements
INSERT INTO pm_document_version (
    id, document_type, document_id, document_code, project_id, business_id,
    version_no, change_summary, approval_status, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(),
    'REQUIREMENT',
    r.id,
    r.requirement_code,
    r.project_id,
    r.business_id,
    COALESCE(r.version, 'v1.0'),
    'Initial requirement version',
    COALESCE(r.status, 'DRAFT'),
    true,
    false,
    COALESCE(r.created_by, 'system'),
    COALESCE(r.created_date, NOW()),
    COALESCE(r.created_by, 'system'),
    COALESCE(r.created_date, NOW())
FROM pm_requirement r
WHERE (r.is_delete IS NULL OR r.is_delete = false)
  AND NOT EXISTS (
      SELECT 1 FROM pm_document_version v
      WHERE v.document_id = r.id AND v.document_type = 'REQUIREMENT'
  );

-- 2. Backfill Specifications
INSERT INTO pm_document_version (
    id, document_type, document_id, document_code, project_id, business_id,
    version_no, change_summary, approval_status, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(),
    'SPECIFICATION',
    s.id,
    s.specification_code,
    s.project_id,
    s.business_id,
    COALESCE(s.version, 'v1.0'),
    'Initial specification version',
    COALESCE(s.status, 'DRAFT'),
    true,
    false,
    COALESCE(s.created_by, 'system'),
    COALESCE(s.created_date, NOW()),
    COALESCE(s.created_by, 'system'),
    COALESCE(s.created_date, NOW())
FROM pm_specification s
WHERE (s.is_delete IS NULL OR s.is_delete = false)
  AND NOT EXISTS (
      SELECT 1 FROM pm_document_version v
      WHERE v.document_id = s.id AND v.document_type IN ('SPECIFICATION', 'SPEC')
  );

-- 3. Backfill Contracts
INSERT INTO pm_document_version (
    id, document_type, document_id, document_code, project_id, business_id,
    version_no, change_summary, approval_status, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(),
    'CONTRACT',
    c.id,
    c.contract_no,
    c.project_id,
    c.business_id,
    'v1.0',
    'Initial contract record',
    COALESCE(c.sign_status, 'DRAFT'),
    true,
    false,
    COALESCE(c.created_by, 'system'),
    COALESCE(c.created_date, NOW()),
    COALESCE(c.created_by, 'system'),
    COALESCE(c.created_date, NOW())
FROM pm_customer_contract c
WHERE (c.is_delete IS NULL OR c.is_delete = false)
  AND NOT EXISTS (
      SELECT 1 FROM pm_document_version v
      WHERE v.document_id = c.id AND v.document_type = 'CONTRACT'
  );

-- 4. Backfill Deliveries
INSERT INTO pm_document_version (
    id, document_type, document_id, document_code, project_id, business_id,
    version_no, change_summary, approval_status, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(),
    'DELIVERY',
    d.id,
    d.delivery_code,
    d.project_id,
    d.business_id,
    COALESCE(d.delivery_version, 'v1.0'),
    'Initial delivery record',
    COALESCE(d.status, 'DRAFT'),
    true,
    false,
    COALESCE(d.created_by, 'system'),
    COALESCE(d.created_date, NOW()),
    COALESCE(d.created_by, 'system'),
    COALESCE(d.created_date, NOW())
FROM pm_delivery d
WHERE (d.is_delete IS NULL OR d.is_delete = false)
  AND NOT EXISTS (
      SELECT 1 FROM pm_document_version v
      WHERE v.document_id = d.id AND v.document_type = 'DELIVERY'
  );

-- 5. Backfill User Manuals
INSERT INTO pm_document_version (
    id, document_type, document_id, document_code, project_id, business_id,
    version_no, change_summary, approval_status, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(),
    'USER_MANUAL',
    m.id,
    m.manual_code,
    m.project_id,
    m.business_id,
    COALESCE(m.version, 'v1.0'),
    'Initial user manual record',
    COALESCE(m.status, 'DRAFT'),
    true,
    false,
    COALESCE(m.created_by, 'system'),
    COALESCE(m.created_date, NOW()),
    COALESCE(m.created_by, 'system'),
    COALESCE(m.created_date, NOW())
FROM pm_user_manual m
WHERE (m.is_delete IS NULL OR m.is_delete = false)
  AND NOT EXISTS (
      SELECT 1 FROM pm_document_version v
      WHERE v.document_id = m.id AND v.document_type IN ('USER_MANUAL', 'MANUAL')
  );

-- 6. Backfill Diagrams
INSERT INTO pm_document_version (
    id, document_type, document_id, document_code, project_id, business_id,
    version_no, change_summary, approval_status, is_active, is_delete,
    created_by, created_date, updated_by, updated_date
)
SELECT
    gen_random_uuid(),
    'DIAGRAM',
    dia.id,
    dia.diagram_code,
    dia.project_id,
    dia.business_id,
    'v1.0',
    'Initial diagram version',
    'DRAFT',
    true,
    false,
    COALESCE(dia.created_by, 'system'),
    COALESCE(dia.created_date, NOW()),
    COALESCE(dia.created_by, 'system'),
    COALESCE(dia.created_date, NOW())
FROM pm_diagram dia
WHERE (dia.is_delete IS NULL OR dia.is_delete = false)
  AND NOT EXISTS (
      SELECT 1 FROM pm_document_version v
      WHERE v.document_id = dia.id AND v.document_type = 'DIAGRAM'
  );

-- 7. Normalize document_type for consistency across all version records
UPDATE pm_document_version SET document_type = 'SPECIFICATION' WHERE document_type = 'SPEC';
UPDATE pm_document_version SET document_type = 'USER_MANUAL' WHERE document_type = 'MANUAL';
