-- ปิด flow "กระบวนการอนุมัติ..." (seed จาก migration, *_FLOW_DEFAULT) ที่ซ้ำกับ flow "Default ... Approval" (DEF-*)
-- ที่ระบบสร้างตอนสมัครธุรกิจ เพราะ 1 business + document_type ต้องมี active flow เดียว (findByBusinessIdAndDocumentTypeAndIsActiveTrue)
UPDATE pm_approval_flow f
SET is_active = false,
  is_delete = true,
  updated_by = 'system',
  updated_date = NOW()
WHERE f.flow_code LIKE '%\_FLOW\_DEFAULT'
  AND f.is_delete = false
  AND EXISTS (
    SELECT 1
    FROM pm_approval_flow d
    WHERE d.business_id = f.business_id
      AND d.document_type = f.document_type
      AND d.flow_code LIKE 'DEF-%'
      AND d.is_delete = false
  );