-- Impact analysis: one "diagram impact" for every drawing type (DFD, ER, Flowchart, Sequence, ...)
-- instead of separate DFD and ER columns. Existing text is kept, labelled with its old type.
DO $$
DECLARE t text;
BEGIN
    FOREACH t IN ARRAY ARRAY['pm_change_impact_analysis', 'pm_change_impact_analysis_history'] LOOP
        EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS diagram_impact TEXT', t);
        EXECUTE format($q$
            UPDATE %I SET diagram_impact = NULLIF(CONCAT_WS(E'\n',
                CASE WHEN COALESCE(dfd_impact, '') <> '' THEN 'DFD: ' || dfd_impact END,
                CASE WHEN COALESCE(er_impact, '') <> '' THEN 'ER: ' || er_impact END), '')
            WHERE diagram_impact IS NULL$q$, t);
        EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS dfd_impact, DROP COLUMN IF EXISTS er_impact', t);
    END LOOP;
END $$;
