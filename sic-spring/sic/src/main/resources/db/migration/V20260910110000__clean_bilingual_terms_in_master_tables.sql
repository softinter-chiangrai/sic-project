-- Clean mixed bilingual terms (ไทย)อังกฤษ and อังกฤษ(ไทย) from master tables

-- 1. Clean pm_approval_flow
UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติคำขอเปลี่ยนแปลง', 
    description = 'กระบวนการตรวจสอบและอนุมัติการขอเปลี่ยนแปลงเอกสารหรือระบบ'
WHERE flow_code = 'CHANGE_REQUEST_FLOW_DEFAULT';

UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติแผนภาพระบบ', 
    description = 'กระบวนการตรวจทานและอนุมัติแผนภาพสถาปัตยกรรม/ไดอะแกรม'
WHERE flow_code = 'DIAGRAM_FLOW_DEFAULT';

UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติโครงการใหม่', 
    description = 'กระบวนการพิจารณาตรวจสอบและอนุมัติเปิดโครงการใหม่'
WHERE flow_code = 'PROJECT_FLOW_DEFAULT';

UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติการส่งมอบงาน', 
    description = 'กระบวนการอนุมัติตรวจรับและส่งมอบงาน'
WHERE flow_code = 'DELIVERY_FLOW_DEFAULT';

UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติใบแจ้งหนี้', 
    description = 'กระบวนการอนุมัติใบแจ้งหนี้และการชำระเงิน'
WHERE flow_code = 'INVOICE_FLOW_DEFAULT';

UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติปิดตั๋ว MA', 
    description = 'กระบวนการอนุมัติการแก้ไขปัญหาและปิดงาน MA Ticket'
WHERE flow_code = 'MA_TICKET_FLOW_DEFAULT';

UPDATE pm_approval_flow 
SET flow_name = 'กระบวนการอนุมัติคู่มือการใช้งาน', 
    description = 'กระบวนการตรวจทานและอนุมัติคู่มือผู้ใช้'
WHERE flow_code = 'USER_MANUAL_FLOW_DEFAULT';

-- 2. Clean pm_approval_flow_step
UPDATE pm_approval_flow_step 
SET step_name = 'ลูกค้าหรือผู้มีอำนาจอนุมัติ'
WHERE step_name LIKE '%Customer Sign-off%';

UPDATE pm_approval_flow_step 
SET step_name = 'ผู้จัดการโครงการตรวจทาน'
WHERE step_name LIKE '%PM Review%';

UPDATE pm_approval_flow_step 
SET step_name = 'ฝ่ายการเงินตรวจสอบ'
WHERE step_name LIKE '%Finance Review%';

UPDATE pm_approval_flow_step 
SET step_name = 'ผู้มีอำนาจลงนามอนุมัติ'
WHERE step_name LIKE '%Management Approval%' OR step_name LIKE '%Management / Sponsor%';

UPDATE pm_approval_flow_step 
SET step_name = 'หัวหน้างานตรวจสอบผลการแก้ไข'
WHERE step_name LIKE '%Lead/PM Review%';

UPDATE pm_approval_flow_step 
SET step_name = 'ลูกค้ายืนยันผลการแก้ไข'
WHERE step_name LIKE '%Customer Acceptance%';

-- 3. Clean db_parameter
UPDATE db_parameter 
SET parameter_name_local = 'โครงการ' 
WHERE parameter_name_local LIKE 'โครงการ (%';

UPDATE db_parameter 
SET parameter_name_local = 'ข้อกำหนดความต้องการ' 
WHERE parameter_name_local LIKE 'ความต้องการ (%' OR parameter_name_local LIKE 'ข้อกำหนด (%';

UPDATE db_parameter 
SET parameter_name_local = 'ข้อกำหนดเชิงเทคนิค' 
WHERE parameter_name_local LIKE 'ข้อกำหนดเชิงเทคนิค (%';

UPDATE db_parameter 
SET parameter_name_local = 'แผนภาพระบบ' 
WHERE parameter_name_local LIKE 'แผนภาพระบบ (%';

UPDATE db_parameter 
SET parameter_name_local = 'คำขอเปลี่ยนแปลง' 
WHERE parameter_name_local LIKE 'คำขอเปลี่ยนแปลง (%';

UPDATE db_parameter 
SET parameter_name_local = 'เอกสารส่งมอบงาน' 
WHERE parameter_name_local LIKE 'เอกสารส่งมอบ (%' OR parameter_name_local LIKE 'ส่งมอบงาน (%';

UPDATE db_parameter 
SET parameter_name_local = 'สัญญา' 
WHERE parameter_name_local LIKE 'สัญญา (%';

UPDATE db_parameter 
SET parameter_name_local = 'ใบแจ้งหนี้' 
WHERE parameter_name_local LIKE 'ใบแจ้งหนี้ (%';

UPDATE db_parameter 
SET parameter_name_local = 'ตั๋วแจ้งปัญหา MA' 
WHERE parameter_name_local LIKE 'ใบแจ้งปัญหา% (MA Ticket)%' OR parameter_name_local LIKE 'ตั๋วแจ้งปัญหา MA (%';

UPDATE db_parameter 
SET parameter_name_local = 'ต่ออายุสัญญาบำรุงรักษา' 
WHERE parameter_name_local LIKE 'ต่ออายุสัญญาบำรุงรักษา (%';

UPDATE db_parameter 
SET parameter_name_local = 'คู่มือการใช้งาน' 
WHERE parameter_name_local LIKE 'คู่มือการใช้งาน (%';

UPDATE db_parameter 
SET parameter_name_local = 'ลูกค้าทดสอบ' 
WHERE parameter_name_local LIKE 'ลูกค้าทดสอบ (%';

-- 4. Clean su_program
UPDATE su_program 
SET name_local = 'ควบคุมการเปลี่ยนแปลง' 
WHERE name_local = 'ควบคุมการเปลี่ยนแปลง (CR)';

UPDATE su_program 
SET name_local = 'การบำรุงรักษาระบบ' 
WHERE name_local = 'การบำรุงรักษา (MA Ticket)';
