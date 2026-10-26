-- V20261026111500__drop_unused_tables.sql
-- ลบตารางที่ไม่ได้ใช้งานในระบบ (Legacy / Deprecated tables with 0 rows and no entity/service usage)

-- 1. ปลด Foreign Key Constraint ที่ชี้ไปยัง pm_ma_contract จาก pm_ma_ticket
ALTER TABLE IF EXISTS pm_ma_ticket DROP CONSTRAINT IF EXISTS fk_ticket_ma;

-- 2. ลบตารางที่ไม่ได้ใช้งาน
-- 2.1 pm_ma_ticket_comment: คอมเมนต์ MA Ticket ยุคแรก (แทนที่ด้วย pm_comment)
DROP TABLE IF EXISTS pm_ma_ticket_comment CASCADE;

-- 2.2 pm_ma_contract: สัญญา MA ยุคแรก (แทนที่ด้วย pm_customer_contract)
DROP TABLE IF EXISTS pm_ma_contract CASCADE;

-- 2.3 pm_ma_renewal: ปลดระวาง PMDT18 MA Renewal ใน V20261007180000 และลบโค้ด Entity/Service ออกแล้ว
DROP TABLE IF EXISTS pm_ma_renewal CASCADE;

-- 2.4 pm_bug_comment: คอมเมนต์ Bug ยุคแรก (แทนที่ด้วย pm_comment)
DROP TABLE IF EXISTS pm_bug_comment CASCADE;

-- 2.5 pm_bug_retest_plan: แผนทดสอบซ้ำ Bug ที่ไม่ได้นำมาใช้งาน
DROP TABLE IF EXISTS pm_bug_retest_plan CASCADE;

-- 2.6 pm_delivery_document: เอกสารส่งมอบยุคแรก (แทนที่ด้วย pm_delivery, pm_delivery_item, pm_document_version)
DROP TABLE IF EXISTS pm_delivery_document CASCADE;

-- 2.7 pm_task_dependency: ลำดับการพึ่งพาของ Task ที่ไม่ได้นำมาใช้งาน
DROP TABLE IF EXISTS pm_task_dependency CASCADE;

-- 2.8 pm_test_result: ผลทดสอบแยกตารางเดิม (ปัจจุบันเก็บสถานะผลทดสอบไว้ใน pm_test_case โดยตรง)
DROP TABLE IF EXISTS pm_test_result CASCADE;

-- 2.9 pm_usecase: ตาราง Use Case ยุคแรก (ระบบรวมข้อมูลไว้ใน Specification และ Requirement แล้ว)
DROP TABLE IF EXISTS pm_usecase CASCADE;

-- 2.10 pm_notification: ตารางแจ้งเตือนเดิมใน init.sql (ระบบใช้ su_notification แทน)
DROP TABLE IF EXISTS pm_notification CASCADE;

-- 2.11 pm_specification_business_rule: ตาราง Rule เดิมของ Spec ที่ตั้งใจลบใน V20260812161000 แต่พิมพ์ชื่อผิดเป็นมี s
DROP TABLE IF EXISTS pm_specification_business_rule CASCADE;
