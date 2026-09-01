-- Add phase_code to pm_phase
ALTER TABLE pm_phase ADD COLUMN IF NOT EXISTS phase_code VARCHAR(30);

-- Populate existing rows with auto-generated code if null
DO $$
DECLARE
    rec RECORD;
    v_seq INT;
BEGIN
    FOR rec IN SELECT DISTINCT project_id FROM pm_phase WHERE phase_code IS NULL LOOP
        v_seq := 1;
        FOR rec IN SELECT id FROM pm_phase WHERE project_id = rec.project_id AND phase_code IS NULL ORDER BY created_at ASC NULLS LAST, start_date ASC NULLS LAST LOOP
            UPDATE pm_phase SET phase_code = 'PH-' || LPAD(v_seq::TEXT, 3, '0') WHERE id = rec.id;
            v_seq := v_seq + 1;
        END LOOP;
    END LOOP;
END $$;
