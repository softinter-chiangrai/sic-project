-- The version a document shows, on screens and in every PDF/report, is its NEWEST version row whatever its approval status
-- (user's rule 2026-10-16; before it was "latest APPROVED, else latest draft", which left reports and grids on an old number
-- after a Change Request made a new version). Screens use pm_current_version, reports pm_current_version_label.

-- newest version row of the document (by created_date); NULL when it has none
CREATE OR REPLACE FUNCTION pm_current_version(p_type text, p_id uuid) RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT v.version_no
      FROM pm_document_version v
     WHERE v.document_type = p_type AND v.document_id = p_id
       AND COALESCE(v.is_delete, false) = false
     ORDER BY v.created_date DESC
     LIMIT 1
$$;

-- same number for reports, with the state of that version: "v3.0.0", "v3.0.0 (Draft)" or "v3.0.0 (Rejected)"
CREATE OR REPLACE FUNCTION pm_current_version_label(p_type text, p_id uuid) RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT v.version_no || CASE upper(COALESCE(v.approval_status, 'DRAFT'))
                              WHEN 'APPROVED' THEN ''
                              WHEN 'REJECTED' THEN ' (Rejected)'
                              ELSE ' (Draft)'
                          END
      FROM pm_document_version v
     WHERE v.document_type = p_type AND v.document_id = p_id
       AND COALESCE(v.is_delete, false) = false
     ORDER BY v.created_date DESC
     LIMIT 1
$$;
