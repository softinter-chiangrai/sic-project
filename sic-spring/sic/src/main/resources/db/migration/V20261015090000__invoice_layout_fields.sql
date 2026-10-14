-- Invoice layout (items table with code / quantity / unit price / discount, amount in words, issuer + customer header).
-- Everything the invoice report needs beyond its item rows comes from these functions, so the report works with nothing but Jasper + SQL
-- (report-service has no Java helper).

ALTER TABLE pm_invoice_item ADD COLUMN IF NOT EXISTS item_code varchar(50);
ALTER TABLE pm_invoice_item ADD COLUMN IF NOT EXISTS discount numeric(18, 2) NOT NULL DEFAULT 0;

-- whole number below 1,000,000 in Thai words; p_higher = there is something before it (so a trailing 1 reads "เอ็ด")
CREATE OR REPLACE FUNCTION pm_thai_lt_million(n int, p_higher boolean) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    digits text[] := ARRAY['ศูนย์','หนึ่ง','สอง','สาม','สี่','ห้า','หก','เจ็ด','แปด','เก้า'];
    places text[] := ARRAY['','สิบ','ร้อย','พัน','หมื่น','แสน'];
    r text := '';
    p int; d int;
BEGIN
    FOR p IN REVERSE 5 .. 0 LOOP
        d := (n / (10 ^ p)::int) % 10;
        CONTINUE WHEN d = 0;
        IF p = 1 THEN
            r := r || CASE d WHEN 1 THEN 'สิบ' WHEN 2 THEN 'ยี่สิบ' ELSE digits[d + 1] || 'สิบ' END;
        ELSIF p = 0 THEN
            r := r || CASE WHEN d = 1 AND (n > 1 OR p_higher) THEN 'เอ็ด' ELSE digits[d + 1] END;
        ELSE
            r := r || digits[d + 1] || places[p + 1];
        END IF;
    END LOOP;
    RETURN r;
END
$$;

CREATE OR REPLACE FUNCTION pm_thai_int(n bigint) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
    IF n = 0 THEN RETURN 'ศูนย์'; END IF;
    IF n >= 1000000 THEN
        RETURN pm_thai_int(n / 1000000) || 'ล้าน' || CASE WHEN n % 1000000 = 0 THEN '' ELSE pm_thai_lt_million((n % 1000000)::int, true) END;
    END IF;
    RETURN pm_thai_lt_million(n::int, false);
END
$$;

CREATE OR REPLACE FUNCTION pm_english_int(n bigint) RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    small text[] := ARRAY['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
    tens text[] := ARRAY['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
BEGIN
    IF n < 20 THEN RETURN small[n::int + 1]; END IF;
    IF n < 100 THEN RETURN tens[(n / 10)::int + 1] || CASE WHEN n % 10 = 0 THEN '' ELSE '-' || small[(n % 10)::int + 1] END; END IF;
    IF n < 1000 THEN RETURN small[(n / 100)::int + 1] || ' Hundred' || CASE WHEN n % 100 = 0 THEN '' ELSE ' ' || pm_english_int(n % 100) END; END IF;
    IF n < 1000000 THEN RETURN pm_english_int(n / 1000) || ' Thousand' || CASE WHEN n % 1000 = 0 THEN '' ELSE ' ' || pm_english_int(n % 1000) END; END IF;
    IF n < 1000000000 THEN RETURN pm_english_int(n / 1000000) || ' Million' || CASE WHEN n % 1000000 = 0 THEN '' ELSE ' ' || pm_english_int(n % 1000000) END; END IF;
    RETURN pm_english_int(n / 1000000000) || ' Billion' || CASE WHEN n % 1000000000 = 0 THEN '' ELSE ' ' || pm_english_int(n % 1000000000) END;
END
$$;

-- amount in words: Thai "หนึ่งพันเจ็ดสิบบาทถ้วน" / "...บาทห้าสิบสตางค์", English "One Thousand ... Baht Only"
CREATE OR REPLACE FUNCTION pm_baht_text(p numeric, p_lang text DEFAULT 'th') RETURNS text
LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
    total bigint := round(coalesce(p, 0) * 100);
    baht bigint := total / 100;
    satang int := (total % 100)::int;
BEGIN
    IF p_lang = 'en' THEN
        RETURN pm_english_int(baht) || ' Baht' || CASE WHEN satang = 0 THEN ' Only' ELSE ' and ' || pm_english_int(satang) || ' Satang Only' END;
    END IF;
    RETURN pm_thai_int(baht) || 'บาท' || CASE WHEN satang = 0 THEN 'ถ้วน' ELSE pm_thai_int(satang) || 'สตางค์' END;
END
$$;

-- issuer (the business of the invoice), customer and amount in words: one row per invoice
CREATE OR REPLACE FUNCTION pm_invoice_header(p_invoice_id uuid, p_lang text DEFAULT 'th')
RETURNS TABLE ("issuerName" text, "issuerAddress" text, "issuerTaxId" text, "issuerBranch" text, "issuerPhone" text,
               "customerName" text, "customerAddress" text, "customerTaxId" text, "customerBranch" text, "customerPhone" text,
               "totalInWords" text)
LANGUAGE sql STABLE AS $$
    SELECT
        CASE WHEN p_lang = 'en' THEN coalesce(nullif(btrim(coalesce(b.first_name_en, '') || ' ' || coalesce(b.last_name_en, '')), ''), nullif(btrim(coalesce(b.first_name_local, '') || ' ' || coalesce(b.last_name_local, '')), ''))
             ELSE coalesce(nullif(btrim(coalesce(b.first_name_local, '') || ' ' || coalesce(b.last_name_local, '')), ''), nullif(btrim(coalesce(b.first_name_en, '') || ' ' || coalesce(b.last_name_en, '')), '')) END,
        CASE WHEN p_lang = 'en' THEN coalesce(nullif(b.address_en, ''), b.address_local) ELSE coalesce(nullif(b.address_local, ''), b.address_en) END,
        b.tax_id, b.branch_code, b.phone_number,
        CASE WHEN p_lang = 'en' THEN coalesce(nullif(c.company_name_en, ''), nullif(c.company_name_local, ''))
             ELSE coalesce(nullif(c.company_name_local, ''), nullif(c.company_name_en, '')) END,
        CASE WHEN p_lang = 'en' THEN coalesce(nullif(c.address_en, ''), c.address_local) ELSE coalesce(nullif(c.address_local, ''), c.address_en) END,
        c.tax_id, c.branch_code, c.phone_number,
        pm_baht_text(i.total_amount, p_lang)
    FROM pm_invoice i
    LEFT JOIN su_business b ON b.id = i.business_id
    LEFT JOIN pm_customer c ON c.id = i.customer_id
    WHERE i.id = p_invoice_id
$$;
