-- เลิกใช้ MA Renewal (PMDT18): การต่อสัญญา MA ทำที่แท็บ "สัญญา MA" ในหน้า MA Ticket แทน
-- ปิดขั้นตอนอนุมัติและประเภทเอกสารของ MA_RENEWAL (soft delete) ไม่ลบตาราง pm_ma_renewal / ประวัติเวอร์ชัน / รายการอนุมัติเดิม
UPDATE pm_approval_flow
SET is_active = false, is_delete = true, updated_by = 'system', updated_date = NOW()
WHERE document_type = 'MA_RENEWAL' AND is_delete = false;

UPDATE db_parameter
SET is_active = false, is_delete = true, updated_by = 'system', updated_date = NOW()
WHERE module_code = 'PM' AND parameter_code = 'DOCUMENT_TYPE' AND parameter_value = 'MA_RENEWAL' AND is_delete = false;
