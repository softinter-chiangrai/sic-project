-- ============================================================
-- เพิ่ม Composite Index บน su_audit_log (business_id, created_date DESC)
-- เพื่อเร่งความเร็วในการสืบค้นประวัติการใช้งานตามบริษัทและช่วงเวลา
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_audit_business_created 
ON su_audit_log (business_id, created_date DESC);
