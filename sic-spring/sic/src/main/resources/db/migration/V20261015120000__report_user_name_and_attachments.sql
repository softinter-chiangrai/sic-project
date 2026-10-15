-- Small lookups for the report templates (project report shows every document in full).

-- user id (su_profile.user_id or su_profile.id) -> display name in the report language; falls back to the raw value
CREATE OR REPLACE FUNCTION pm_user_name(p_user text, p_lang text) RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT COALESCE(
        (SELECT COALESCE(
                    NULLIF(TRIM(CASE WHEN p_lang = 'en' THEN CONCAT(sp.first_name_en, ' ', sp.last_name_en)
                                     ELSE CONCAT(sp.first_name_local, ' ', sp.last_name_local) END), ''),
                    NULLIF(TRIM(CONCAT(sp.first_name_local, ' ', sp.last_name_local)), ''),
                    NULLIF(TRIM(CONCAT(sp.first_name_en, ' ', sp.last_name_en)), ''))
           FROM su_profile sp
          WHERE (sp.user_id = p_user OR CAST(sp.id AS VARCHAR) = p_user) AND sp.is_delete = false
          LIMIT 1),
        NULLIF(p_user, ''))
$$;

-- upload group -> "file.pdf (PDF, 12 kB), ..." (same text as the attachment line of the project report), NULL when empty
CREATE OR REPLACE FUNCTION pm_attachment_names(p_group uuid) RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT STRING_AGG(su.file_name || ' (' || COALESCE(UPPER(substring(su.file_name from '\.([^.]+)$')) || ', ', '') || pg_size_pretty(su.file_size) || ')', ', ')
      FROM su_upload su
     WHERE p_group IS NOT NULL AND su.upload_group_id = p_group AND su.is_active = true
$$;
