-- Add diagram_code to pm_diagram
ALTER TABLE pm_diagram ADD COLUMN IF NOT EXISTS diagram_code VARCHAR(50);

-- Populate existing rows with auto-generated code if null
DO $$
DECLARE
    proj RECORD;
    rec RECORD;
    v_seq INT;
BEGIN
    FOR proj IN SELECT DISTINCT project_id FROM pm_diagram WHERE diagram_code IS NULL AND project_id IS NOT NULL LOOP
        v_seq := 1;
        FOR rec IN SELECT id FROM pm_diagram WHERE project_id = proj.project_id AND diagram_code IS NULL ORDER BY created_date ASC NULLS LAST LOOP
            UPDATE pm_diagram SET diagram_code = 'DIAG-' || LPAD(v_seq::TEXT, 3, '0') WHERE id = rec.id;
            v_seq := v_seq + 1;
        END LOOP;
    END LOOP;

    -- For records without project_id
    v_seq := 1;
    FOR rec IN SELECT id FROM pm_diagram WHERE diagram_code IS NULL ORDER BY created_date ASC NULLS LAST LOOP
        UPDATE pm_diagram SET diagram_code = 'DIAG-' || LPAD(v_seq::TEXT, 3, '0') WHERE id = rec.id;
        v_seq := v_seq + 1;
    END LOOP;
END $$;
