-- One "Diagram" option for every drawing type (DFD, ER, Use Case, Flowchart, ...), as diagrams already are:
-- 1) project status: Usecase / DFD / ER Design -> Diagram Design
-- 2) approval flows: the DFD / ER flows (auto-created per document type) -> DIAGRAM, the only type diagrams use

-- 1. Project status
INSERT INTO db_parameter (id, module_code, parameter_code, parameter_value, parameter_name_en, parameter_name_local,
                          is_active, sort_order, created_by, created_date, updated_by, updated_date, is_delete)
SELECT gen_random_uuid(), 'PM', 'PROJECT_STATUS', 'DIAGRAM_DESIGN', 'Diagram Design',
       'ออกแบบ Diagram (DFD / ER / Use Case / Flowchart)', true, 7, 'system', NOW(), 'system', NOW(), false
WHERE NOT EXISTS (SELECT 1 FROM db_parameter WHERE module_code = 'PM' AND parameter_code = 'PROJECT_STATUS' AND parameter_value = 'DIAGRAM_DESIGN');

DELETE FROM db_parameter
WHERE module_code = 'PM' AND parameter_code = 'PROJECT_STATUS' AND parameter_value IN ('USECASE_DESIGN', 'DFD_DESIGN', 'ER_DESIGN');

UPDATE pm_customer_project SET status = 'Diagram Design'
WHERE status IN ('Usecase Diagram Design', 'DFD Design', 'ER Design');

-- 2. Approval flows: keep one diagram flow per business. A business without a DIAGRAM flow gets its oldest
--    DFD / ER flow turned into one; the other DFD / ER flows are soft-deleted (nothing uses them).
UPDATE pm_approval_flow f SET document_type = 'DIAGRAM', updated_by = 'system', updated_date = NOW()
WHERE f.id IN (
    SELECT DISTINCT ON (x.business_id) x.id
    FROM pm_approval_flow x
    WHERE x.document_type IN ('DFD', 'ER') AND COALESCE(x.is_delete, false) = false
      AND NOT EXISTS (SELECT 1 FROM pm_approval_flow d
                      WHERE d.business_id IS NOT DISTINCT FROM x.business_id AND d.document_type = 'DIAGRAM'
                        AND COALESCE(d.is_delete, false) = false)
    ORDER BY x.business_id, x.created_date
);

UPDATE pm_approval_flow SET is_delete = true, is_active = false, delete_by = 'system', delete_date = NOW()
WHERE document_type IN ('DFD', 'ER') AND COALESCE(is_delete, false) = false;

UPDATE pm_approval SET document_type = 'DIAGRAM' WHERE document_type IN ('DFD', 'ER');
