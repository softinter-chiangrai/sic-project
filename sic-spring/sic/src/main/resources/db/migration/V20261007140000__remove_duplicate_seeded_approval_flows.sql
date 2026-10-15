-- ปิดและลบ flow ทุกตัวที่ seed จาก migration (*_FLOW_DEFAULT) ออกทั้งหมด
-- เพื่อให้ระบบพึ่งพา Default Approval Flow (DEF-*) ที่ BusinessAccessServiceImpl สร้างให้อัตโนมัติเท่านั้น
UPDATE pm_approval_flow_step s
SET is_delete = true,
    updated_by = 'system',
    updated_date = NOW()
FROM pm_approval_flow f
WHERE s.flow_id = f.id
  AND f.flow_code LIKE '%\_FLOW\_DEFAULT'
  AND s.is_delete = false;

UPDATE pm_approval_flow
SET is_active = false,
    is_delete = true,
    updated_by = 'system',
    updated_date = NOW()
WHERE flow_code LIKE '%\_FLOW\_DEFAULT'
  AND is_delete = false;