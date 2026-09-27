-- สคริปต์ทำความสะอาดข้อมูลทดสอบเดิม (ยังไม่ได้รัน — ตรวจสอบก่อนแล้วรันเองเมื่อพร้อม)
-- ใช้กับฐานข้อมูล sic_app  ตัวอย่างการรัน:
--   docker exec -i sic-database psql -U administrator -d sic_app < cleanup_demo_data.sql
-- สำรองข้อมูลไว้แล้วที่ sic_app_backup_before_cleanup.dump  (กู้คืนด้วย pg_restore)
-- สคริปต์ใช้ soft delete (is_delete = true) ไม่ลบข้อมูลจริง
BEGIN;

-- 1) ข้อมูลธุรกิจที่แสดงบนหัวเว็บและแดชบอร์ด (เดิมรหัส 'sadsa')
UPDATE su_business SET business_code='SICR', first_name_en='Softinter Chiangrai', middle_name_en=NULL, last_name_en='Co., Ltd.',
  first_name_local='บริษัท ซอฟต์อินเตอร์ เชียงราย', middle_name_local=NULL, last_name_local='จำกัด',
  phone_number='053-912-229', tax_id='0575555000123'
 WHERE id='0807d52a-defc-4ef9-80a0-2745c24b34db';

-- 2) ลูกค้า: ตั้งชื่อให้อ่านรู้เรื่อง และซ่อนรายการซ้ำ
UPDATE pm_customer SET customer_code='CUS-001', company_name_local='บริษัท ซอฟต์อินเตอร์ เชียงราย จำกัด', company_name_en='Softinter Chiangrai Co., Ltd.',
  first_name_en='Softinter Chiangrai Co., Ltd.', first_name_local='บริษัท ซอฟต์อินเตอร์ เชียงราย จำกัด', phone_number='053-912-229'
 WHERE customer_code='Cus-001' AND is_delete=false;
UPDATE pm_customer SET is_delete=true, delete_date=now() WHERE customer_code='cus-001' AND is_delete=false;

-- 3) โครงการทดสอบเดิม PJ-001 (shopee) และข้อมูลลูก (soft delete)
DO $$
DECLARE p uuid := 'e755282c-0fb3-475a-9db1-24d67bc6f757'; t text;
BEGIN
  FOR t IN SELECT c.table_name FROM information_schema.columns c
           WHERE c.column_name='project_id' AND c.table_schema='public'
             AND c.table_name IN (SELECT table_name FROM information_schema.columns WHERE column_name='is_delete') LOOP
    EXECUTE format('UPDATE %I SET is_delete=true, delete_date=now() WHERE project_id=$1 AND is_delete=false', t) USING p;
  END LOOP;
  UPDATE pm_milestone SET is_delete=true, delete_date=now() WHERE phase_id IN (SELECT id FROM pm_phase WHERE project_id=p);
  UPDATE pm_work_package SET is_delete=true, delete_date=now()
   WHERE milestone_id IN (SELECT id FROM pm_milestone WHERE phase_id IN (SELECT id FROM pm_phase WHERE project_id=p));
  UPDATE pm_task SET is_delete=true, delete_date=now()
   WHERE work_package_id IN (SELECT id FROM pm_work_package WHERE milestone_id IN
         (SELECT id FROM pm_milestone WHERE phase_id IN (SELECT id FROM pm_phase WHERE project_id=p)));
  UPDATE pm_customer_project SET is_delete=true, delete_date=now() WHERE id=p;
END $$;

-- 4) การอนุมัติ / แจ้งเตือน / audit / ความคิดเห็น ที่เกิดก่อนสร้างข้อมูลสาธิต (25 ก.ย. 2569 เวลา 17:00)
UPDATE pm_approval     SET is_delete=true, delete_date=now() WHERE created_date < '2026-09-25 17:00:00+07' AND is_delete=false;
UPDATE pm_notification SET is_delete=true, delete_date=now() WHERE created_date < '2026-09-25 17:00:00+07' AND is_delete=false;
UPDATE su_notification SET is_delete=true, delete_date=now() WHERE created_date < '2026-09-25 17:00:00+07' AND is_delete=false;
UPDATE su_audit_log    SET is_delete=true, delete_date=now() WHERE created_date < '2026-09-25 17:00:00+07' AND is_delete=false;
UPDATE pm_comment      SET is_delete=true, delete_date=now() WHERE created_date < '2026-09-25 17:00:00+07' AND is_delete=false;

COMMIT;
