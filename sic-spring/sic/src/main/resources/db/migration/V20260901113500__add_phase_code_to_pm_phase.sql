-- Add phase_code to pm_phase
ALTER TABLE pm_phase ADD COLUMN IF NOT EXISTS phase_code VARCHAR(30);

-- Populate existing rows with auto-generated code if null
DO $$
DECLARE
    p_rec RECORD;
    item_rec RECORD;
    v_seq INT;
BEGIN
    FOR p_rec IN SELECT DISTINCT project_id FROM pm_phase WHERE phase_code IS NULL LOOP
        v_seq := 1;
        FOR item_rec IN SELECT id FROM pm_phase WHERE project_id = p_rec.project_id AND phase_code IS NULL ORDER BY created_date ASC NULLS LAST, start_date ASC NULLS LAST LOOP
            UPDATE pm_phase SET phase_code = 'PH-' || LPAD(v_seq::TEXT, 3, '0') WHERE id = item_rec.id;
            v_seq := v_seq + 1;
        END LOOP;
    END LOOP;
END $$;

