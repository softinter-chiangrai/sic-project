-- ยกเลิกโหมด SINGLE (คนเดียว) เหลือ CHAIN / PARALLEL / ANY: flow เดิมที่เป็น SINGLE มี step เดียว ใช้ CHAIN แทนได้เลย
UPDATE pm_approval_flow
SET approval_mode = 'CHAIN', updated_by = 'system', updated_date = NOW()
WHERE approval_mode = 'SINGLE';

UPDATE db_parameter
SET is_active = false, is_delete = true, updated_by = 'system', updated_date = NOW()
WHERE module_code = 'PM' AND parameter_code = 'APPROVAL_MODE' AND parameter_value = 'SINGLE';

COMMENT ON COLUMN pm_approval_flow.approval_mode IS 'CHAIN=เรียงลำดับ, PARALLEL=พร้อมกัน, ANY=ใครก็ได้';
