-- เวอร์ชันของ Test Case ที่สร้างตอนยังไม่ได้ส่งรหัสเอกสาร (document_code เป็น NULL) ให้เติมรหัสจากตัว Test Case
UPDATE pm_document_version v
SET document_code = tc.test_case_code
FROM pm_test_case tc
WHERE v.document_type = 'TEST_CASE'
  AND v.document_id = tc.id
  AND v.document_code IS NULL
  AND tc.test_case_code IS NOT NULL;
