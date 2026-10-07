-- flow "กระบวนการอนุมัติ..." (*_FLOW_DEFAULT) ที่ business_id เป็น NULL ไม่ถูกลบใน V20261007140000
-- (NULL = business_id ไม่เป็นจริง) ปิดทิ้งถ้ามี flow "Default ... Approval" (DEF-*) ของ document_type เดียวกันแล้ว
UPDATE pm_approval_flow f
SET is_active = false,
    is_delete = true,
    updated_by = 'system',
    updated_date = NOW()
WHERE f.flow_code LIKE '%\_FLOW\_DEFAULT'
  AND f.business_id IS NULL
  AND f.is_delete = false
  AND EXISTS (
      SELECT 1 FROM pm_approval_flow d
      WHERE d.document_type = f.document_type
        AND d.flow_code LIKE 'DEF-%'
        AND d.is_delete = false
  );
