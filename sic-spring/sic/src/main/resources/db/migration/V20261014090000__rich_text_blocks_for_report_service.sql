-- Rich text (Tiptap HTML) -> report blocks, in SQL.
-- The report templates of sic-spring call com.softinter.sicapi.util.ReportHelper for this; report-service does not have that
-- class, so it cannot compile them. These functions give the templates in reports-standalone/ the same blocks from the database
-- (text, pictures with the width set in the editor, table rows cut into column slices) with nothing but Jasper and JDK classes.
-- NOTE (PostgreSQL regex): the greediness of a whole pattern follows its FIRST quantifier, so attribute parts are written [^>]*?
-- to keep the later (.*?) lazy. Keep in step with ReportHelper.extractContentBlocks / htmlToPlainText / sliceColumns.

-- strip tags + decode the five entities Tiptap writes (same order as ReportHelper.stripTagsAndEntities)
CREATE OR REPLACE FUNCTION pm_strip_tags(p text) RETURNS text
LANGUAGE sql IMMUTABLE AS $$
    SELECT replace(replace(replace(replace(replace(replace(
        regexp_replace(coalesce(p, ''), '<[^>]+>', '', 'g'),
        '&nbsp;', ' '), '&amp;', '&'), '&lt;', '<'), '&gt;', '>'), '&quot;', '"'), '&#39;', '''')
$$;

-- HTML -> plain text lines (ordered / bullet lists, line breaks), NULL when nothing is left
CREATE OR REPLACE FUNCTION pm_html_to_text(p_html text) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    t text := coalesce(p_html, '');
    m text[];
    li text[];
    rep text;
    n int;
    result text;
BEGIN
    IF btrim(t) = '' OR btrim(t) = '-' THEN RETURN NULL; END IF;
    LOOP
        m := regexp_match(t, '<ol[^>]*?>(.*?)</ol>', 'i');
        EXIT WHEN m IS NULL;
        rep := ''; n := 1;
        FOR li IN SELECT regexp_matches(m[1], '<li[^>]*?>(.*?)</li>', 'gi') LOOP
            IF regexp_replace(pm_strip_tags(li[1]), '^\s+|\s+$', '', 'g') <> '' THEN
                rep := rep || n || '. ' || regexp_replace(pm_strip_tags(li[1]), '^\s+|\s+$', '', 'g') || E'\n';
                n := n + 1;
            END IF;
        END LOOP;
        t := regexp_replace(t, '<ol[^>]*?>.*?</ol>', replace(rep, E'\\', E'\\\\'), 'i');
    END LOOP;
    LOOP
        m := regexp_match(t, '<ul[^>]*?>(.*?)</ul>', 'i');
        EXIT WHEN m IS NULL;
        rep := '';
        FOR li IN SELECT regexp_matches(m[1], '<li[^>]*?>(.*?)</li>', 'gi') LOOP
            IF regexp_replace(pm_strip_tags(li[1]), '^\s+|\s+$', '', 'g') <> '' THEN
                rep := rep || '• ' || regexp_replace(pm_strip_tags(li[1]), '^\s+|\s+$', '', 'g') || E'\n';
            END IF;
        END LOOP;
        t := regexp_replace(t, '<ul[^>]*?>.*?</ul>', replace(rep, E'\\', E'\\\\'), 'i');
    END LOOP;
    t := regexp_replace(t, '<br\s*/?>', E'\n', 'gi');
    t := regexp_replace(t, '</(p|div|tr|h[1-6])>', E'\n', 'gi');
    t := pm_strip_tags(t);
    SELECT string_agg(regexp_replace(l, '^\s+|\s+$', '', 'g'), E'\n')
      INTO result
      FROM unnest(regexp_split_to_array(t, E'\r?\n')) AS l
     WHERE regexp_replace(l, '^\s+|\s+$', '', 'g') <> '';
    RETURN nullif(result, '');
END
$$;

-- Blocks of a rich-text field in document order, shaped like the ContentBlocksDataset of the templates:
--   text | picture (imageData + imgWidth = width attribute set in the editor, or NULL + align) | table row (tableRow, cols, c1..c6)
-- p_extra: one more text block at the end (attachment names); p_fallback: used when the field has no content at all.
-- A table wider than 6 columns is cut into slices printed one under the other, each repeating the first column.
CREATE OR REPLACE FUNCTION pm_rich_blocks(p_html text, p_extra text DEFAULT NULL, p_fallback text DEFAULT NULL)
RETURNS TABLE (seq int, "text" text, "imageData" bytea, "imgWidth" int, "align" text,
               "tableRow" boolean, "cols" int, c1 text, c2 text, c3 text, c4 text, c5 text, c6 text)
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    rest text := coalesce(p_html, '');
    n int := 0;
    m text[];
    prefix text;
    token text;
    txt text;
BEGIN
    LOOP
        m := regexp_match(rest, '^(.*?)(<table[^>]*?>.*?</table>|<img\y[^>]*?>)', 'i');
        IF m IS NULL THEN
            txt := pm_html_to_text(rest);
            IF txt IS NOT NULL THEN n := n + 1; seq := n; "text" := txt; "imageData" := NULL; "imgWidth" := NULL; "align" := NULL; "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL; RETURN NEXT; END IF;
            EXIT;
        END IF;
        prefix := m[1]; token := m[2];
        rest := substr(rest, length(prefix) + length(token) + 1);
        txt := pm_html_to_text(prefix);
        IF txt IS NOT NULL THEN n := n + 1; seq := n; "text" := txt; "imageData" := NULL; "imgWidth" := NULL; "align" := NULL; "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL; RETURN NEXT; END IF;

        IF lower(left(token, 6)) = '<table' THEN
            DECLARE
                rows jsonb := '[]'::jsonb;      -- [[cell, cell, ...], ...]
                pics jsonb := '[]'::jsonb;      -- [{"b64":..., "tag":...}, ...] in row order
                r text[];
                cell text[];
                cellsOfRow jsonb;
                tag text[];
                maxCols int := 0;
                dataCols int; sliceCount int; width int; fromCol int; toCol int; s int; ri int; ci int;
                cells text[];
                imgBytes bytea; wAttr text[]; al text[];
                rowHtml text;
                picsOfTable jsonb := '[]'::jsonb;
            BEGIN
                FOR r IN SELECT regexp_matches(token, '<tr[^>]*?>(.*?)</tr>', 'gi') LOOP
                    rowHtml := r[1];
                    cellsOfRow := '[]'::jsonb;
                    FOR cell IN SELECT regexp_matches(rowHtml, '<t[dh][^>]*?>(.*?)</t[dh]>', 'gi') LOOP
                        cellsOfRow := cellsOfRow || to_jsonb(regexp_replace(pm_strip_tags(cell[1]), '^\s+|\s+$', '', 'g'));
                    END LOOP;
                    FOR tag IN SELECT regexp_matches(rowHtml, '(<img\y[^>]*?>)', 'gi') LOOP
                        picsOfTable := picsOfTable || to_jsonb(tag[1]);
                    END LOOP;
                    IF jsonb_array_length(cellsOfRow) > 0 THEN
                        rows := rows || jsonb_build_array(cellsOfRow);
                        maxCols := greatest(maxCols, jsonb_array_length(cellsOfRow));
                    END IF;
                END LOOP;

                IF maxCols <= 6 THEN
                    sliceCount := 1; width := maxCols;
                ELSE
                    dataCols := maxCols - 1;
                    sliceCount := (dataCols + 4) / 5;
                    width := (dataCols + sliceCount - 1) / sliceCount;
                END IF;

                s := 0;
                WHILE s < sliceCount LOOP
                    IF s > 0 THEN   -- small gap between slices
                        n := n + 1; seq := n; "text" := ' '; "imageData" := NULL; "imgWidth" := NULL; "align" := NULL; "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL; RETURN NEXT;
                    END IF;
                    FOR ri IN 0 .. jsonb_array_length(rows) - 1 LOOP
                        cells := ARRAY[]::text[];
                        IF sliceCount = 1 THEN
                            fromCol := 0; toCol := maxCols;
                        ELSE
                            cells := cells || coalesce(rows -> ri ->> 0, '');
                            fromCol := 1 + s * width; toCol := least(maxCols, fromCol + width);
                        END IF;
                        FOR ci IN fromCol .. toCol - 1 LOOP
                            cells := cells || coalesce(rows -> ri ->> ci, '');
                        END LOOP;
                        n := n + 1; seq := n; "text" := NULL; "imageData" := NULL; "imgWidth" := NULL; "align" := NULL;
                        "tableRow" := true;
                        "cols" := 1;
                        FOR ci IN REVERSE least(array_length(cells, 1), 6) .. 2 LOOP
                            IF cells[ci] <> '' THEN "cols" := ci; EXIT; END IF;
                        END LOOP;
                        c1 := cells[1]; c2 := cells[2]; c3 := cells[3]; c4 := cells[4]; c5 := cells[5]; c6 := cells[6];
                        RETURN NEXT;
                    END LOOP;
                    s := s + 1;
                END LOOP;
                -- pictures that were inside cells: printed after the table
                FOR ri IN 0 .. jsonb_array_length(picsOfTable) - 1 LOOP
                    token := picsOfTable ->> ri;
                    DECLARE b text[]; BEGIN
                        b := regexp_match(token, 'data:image/[^;"'']+;base64,([A-Za-z0-9+/=]+)', 'i');
                        IF b IS NOT NULL THEN
                            BEGIN imgBytes := decode(b[1], 'base64'); EXCEPTION WHEN OTHERS THEN imgBytes := NULL; END;
                            IF imgBytes IS NOT NULL THEN
                                wAttr := regexp_match(token, '\swidth="(\d+)"', 'i');
                                al := regexp_match(token, '(?:text-align:\s*|data-align="?)(left|center|right)', 'i');
                                n := n + 1; seq := n; "text" := NULL; "imageData" := imgBytes; "imgWidth" := wAttr[1]::int; "align" := lower(coalesce(al[1], 'left'));
                                "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL;
                                RETURN NEXT;
                            END IF;
                        END IF;
                    END;
                END LOOP;
            END;
        ELSE
            DECLARE b text[]; al text[]; wAttr text[]; imgBytes bytea; BEGIN
                b := regexp_match(token, 'data:image/[^;"'']+;base64,([A-Za-z0-9+/=]+)', 'i');
                IF b IS NOT NULL THEN
                    BEGIN imgBytes := decode(b[1], 'base64'); EXCEPTION WHEN OTHERS THEN imgBytes := NULL; END;
                    IF imgBytes IS NOT NULL THEN
                        wAttr := regexp_match(token, '\swidth="(\d+)"', 'i');
                        al := regexp_match(token, '(?:text-align:\s*|data-align="?)(left|center|right)', 'i');
                        n := n + 1; seq := n; "text" := NULL; "imageData" := imgBytes; "imgWidth" := wAttr[1]::int; "align" := lower(coalesce(al[1], 'left'));
                        "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL;
                        RETURN NEXT;
                    END IF;
                END IF;
            END;
        END IF;
    END LOOP;

    IF n = 0 AND p_fallback IS NOT NULL AND p_fallback <> '' THEN
        n := n + 1; seq := n; "text" := p_fallback; "imageData" := NULL; "imgWidth" := NULL; "align" := NULL; "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL; RETURN NEXT;
    END IF;
    IF p_extra IS NOT NULL AND btrim(p_extra) <> '' THEN
        n := n + 1; seq := n; "text" := p_extra; "imageData" := NULL; "imgWidth" := NULL; "align" := NULL; "tableRow" := NULL; "cols" := NULL; c1 := NULL; c2 := NULL; c3 := NULL; c4 := NULL; c5 := NULL; c6 := NULL; RETURN NEXT;
    END IF;
END
$$;
