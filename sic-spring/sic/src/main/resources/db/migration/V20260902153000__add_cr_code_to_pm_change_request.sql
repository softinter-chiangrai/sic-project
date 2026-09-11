-- Add cr_code to pm_change_request
ALTER TABLE pm_change_request ADD COLUMN IF NOT EXISTS cr_code VARCHAR(50);

-- Populate existing rows with auto-generated code if null
DO $$
DECLARE
    p_rec RECORD;
    item_rec RECORD;
    v_seq INT;
BEGIN
    FOR p_rec IN SELECT DISTINCT project_id FROM pm_change_request WHERE cr_code IS NULL AND project_id IS NOT NULL LOOP
        v_seq := 1;
        FOR item_rec IN SELECT id FROM pm_change_request WHERE project_id = p_rec.project_id AND cr_code IS NULL ORDER BY created_date ASC NULLS LAST LOOP
            UPDATE pm_change_request SET cr_code = 'CR-' || LPAD(v_seq::TEXT, 3, '0') WHERE id = item_rec.id;
            v_seq := v_seq + 1;
        END LOOP;
    END LOOP;

    -- For records without project_id
    v_seq := 1;
    FOR item_rec IN SELECT id FROM pm_change_request WHERE cr_code IS NULL ORDER BY created_date ASC NULLS LAST LOOP
        UPDATE pm_change_request SET cr_code = 'CR-' || LPAD(v_seq::TEXT, 3, '0') WHERE id = item_rec.id;
        v_seq := v_seq + 1;
    END LOOP;
END $$;

