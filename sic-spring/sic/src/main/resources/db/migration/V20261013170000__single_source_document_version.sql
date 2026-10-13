-- เลขเวอร์ชันของเอกสารเก็บที่ pm_document_version ที่เดียว (ประวัติ = แหล่งจริง)
-- เลิกใช้คอลัมน์สำเนา pm_requirement.version / pm_specification.version / pm_user_manual.version / pm_delivery.delivery_version

-- 1) เอกสารที่ยังไม่มีแถวประวัติเลย: สร้างให้จากค่าในคอลัมน์เดิม ก่อนจะลบคอลัมน์ (กันเลขหาย)
INSERT INTO pm_document_version (id, created_by, created_date, updated_by, updated_date, is_delete, business_id,
                                 document_type, document_id, version_no, project_id, document_code, is_active, approval_status)
SELECT gen_random_uuid(), 'system', now(), 'system', now(), false, e.business_id,
       'REQUIREMENT', e.id, 'v' || regexp_replace(COALESCE(NULLIF(trim(e.version), ''), '1.0.0'), '^[vV]', ''),
       e.project_id, e.requirement_code, true, 'DRAFT'
FROM pm_requirement e
WHERE e.is_delete = false
  AND NOT EXISTS (SELECT 1 FROM pm_document_version v WHERE v.document_type = 'REQUIREMENT' AND v.document_id = e.id AND v.is_delete = false);

INSERT INTO pm_document_version (id, created_by, created_date, updated_by, updated_date, is_delete, business_id,
                                 document_type, document_id, version_no, project_id, document_code, is_active, approval_status)
SELECT gen_random_uuid(), 'system', now(), 'system', now(), false, e.business_id,
       'SPECIFICATION', e.id, 'v' || regexp_replace(COALESCE(NULLIF(trim(e.version), ''), '1.0.0'), '^[vV]', ''),
       e.project_id, e.specification_code, true, 'DRAFT'
FROM pm_specification e
WHERE e.is_delete = false
  AND NOT EXISTS (SELECT 1 FROM pm_document_version v WHERE v.document_type = 'SPECIFICATION' AND v.document_id = e.id AND v.is_delete = false);

INSERT INTO pm_document_version (id, created_by, created_date, updated_by, updated_date, is_delete, business_id,
                                 document_type, document_id, version_no, project_id, document_code, is_active, approval_status)
SELECT gen_random_uuid(), 'system', now(), 'system', now(), false, e.business_id,
       'USER_MANUAL', e.id, 'v' || regexp_replace(COALESCE(NULLIF(trim(e.version), ''), '1.0.0'), '^[vV]', ''),
       e.project_id, e.manual_code, true, 'DRAFT'
FROM pm_user_manual e
WHERE e.is_delete = false
  AND NOT EXISTS (SELECT 1 FROM pm_document_version v WHERE v.document_type = 'USER_MANUAL' AND v.document_id = e.id AND v.is_delete = false);

INSERT INTO pm_document_version (id, created_by, created_date, updated_by, updated_date, is_delete, business_id,
                                 document_type, document_id, version_no, project_id, document_code, is_active, approval_status)
SELECT gen_random_uuid(), 'system', now(), 'system', now(), false, e.business_id,
       'DELIVERY', e.id, 'v' || regexp_replace(COALESCE(NULLIF(trim(e.delivery_version), ''), '1.0.0'), '^[vV]', ''),
       e.project_id, e.delivery_code, true, 'DRAFT'
FROM pm_delivery e
WHERE e.is_delete = false
  AND NOT EXISTS (SELECT 1 FROM pm_document_version v WHERE v.document_type = 'DELIVERY' AND v.document_id = e.id AND v.is_delete = false);

-- 2) กติกา "เวอร์ชันปัจจุบัน" ที่เดียว (หน้าจอ, export, รายงาน Jasper เรียกฟังก์ชันนี้)
--    ฉบับที่อนุมัติล่าสุดก่อน; ถ้ายังไม่เคยอนุมัติเลย ใช้ฉบับร่างล่าสุด
--    ไม่ใช้ created_date ล่าสุดอย่างเดียว เพราะอาจได้ฉบับร่าง/ฉบับที่ถูกปฏิเสธ
CREATE OR REPLACE FUNCTION pm_current_version(p_type text, p_id uuid) RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT COALESCE(
        (SELECT v.version_no
           FROM pm_document_version v
          WHERE v.document_type = p_type AND v.document_id = p_id
            AND v.is_delete = false AND v.approval_status = 'APPROVED'
          ORDER BY v.approved_date DESC NULLS LAST, v.created_date DESC
          LIMIT 1),
        (SELECT v.version_no
           FROM pm_document_version v
          WHERE v.document_type = p_type AND v.document_id = p_id
            AND v.is_delete = false
          ORDER BY v.created_date DESC
          LIMIT 1))
$$;

-- เหมือน pm_current_version แต่ต่อท้าย " (Draft)" เมื่อเอกสารยังไม่เคยอนุมัติ (ใช้ในเอกสาร PDF/รายงาน)
CREATE OR REPLACE FUNCTION pm_current_version_label(p_type text, p_id uuid) RETURNS text
LANGUAGE sql STABLE AS $$
    SELECT CASE
        WHEN pm_current_version(p_type, p_id) IS NULL THEN NULL
        WHEN EXISTS (SELECT 1 FROM pm_document_version v
                      WHERE v.document_type = p_type AND v.document_id = p_id
                        AND v.is_delete = false AND v.approval_status = 'APPROVED')
            THEN pm_current_version(p_type, p_id)
        ELSE pm_current_version(p_type, p_id) || ' (Draft)'
    END
$$;

-- 3) ลบคอลัมน์สำเนา
ALTER TABLE pm_requirement DROP COLUMN IF EXISTS version;
ALTER TABLE pm_specification DROP COLUMN IF EXISTS version;
ALTER TABLE pm_user_manual DROP COLUMN IF EXISTS version;
ALTER TABLE pm_delivery DROP COLUMN IF EXISTS delivery_version;
