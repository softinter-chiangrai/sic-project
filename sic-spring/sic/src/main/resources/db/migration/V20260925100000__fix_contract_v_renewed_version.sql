-- Migration: V20260925100000__fix_contract_v_renewed_version.sql
-- Description: เดิมตอนต่อสัญญาระบบบันทึกประวัติของสัญญาเดิมด้วยเลขเวอร์ชันตายตัว "v-renewed" ทำให้คอลัมน์เวอร์ชันแสดงผิด
-- แก้แถวเก่าให้ใช้เลขเวอร์ชันล่าสุดก่อนหน้าของเอกสารเดียวกัน (ถ้าไม่มีให้ใช้ v0.1)

UPDATE pm_document_version v
SET version_no = COALESCE((
        SELECT p.version_no
        FROM pm_document_version p
        WHERE p.document_type = v.document_type
          AND p.document_id = v.document_id
          AND p.version_no <> 'v-renewed'
          AND p.created_date < v.created_date
        ORDER BY p.created_date DESC
        LIMIT 1
    ), 'v0.1'),
    updated_date = NOW()
WHERE v.version_no = 'v-renewed';
