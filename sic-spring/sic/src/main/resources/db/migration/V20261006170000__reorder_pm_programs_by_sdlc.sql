-- Migration: V20261006170000__reorder_pm_programs_by_sdlc.sql
-- Description: ปรับลำดับเมนู (su_program.sort_order) ของ Project Workspace ตามวงจร SDLC ที่ถูกต้อง
-- 1. วางแผน: Phase (WBS) -> Gantt Schedule -> Task Calendar
-- 2. วิเคราะห์/ออกแบบ: Requirement -> Diagram (DFD/ERD) -> Specification -> Design Review
-- 3. พัฒนา/ทดสอบ: Task Management (Dev) -> Test Management (Testing)
-- 4. ส่งมอบ: User Manual (คู่มือ) -> Delivery (การส่งมอบงาน)
-- 5. การเงิน/บำรุงรักษา: Invoice & Payment (วางบิล) -> MA Ticket (บำรุงรักษา)
-- 6. กำกับดูแล (Governance): Change Control -> Approval Center -> Feedback -> Document Version -> Audit Log

UPDATE su_program p
SET sort_order = v.sort_order,
    updated_by = 'system',
    updated_date = NOW()
FROM (VALUES
    -- 1. Planning & Scheduling
    ('PMDT01', 10),   -- Phase Management        : วางแผนโครงการ (Planning / WBS)
    ('PMDT11', 20),   -- Gantt Schedule          : แผนผังแกนต์ (Schedule)
    ('PMDT21', 25),   -- Task Calendar           : ปฏิทินงาน (Calendar)
    
    -- 2. Analysis & Design
    ('PMDT04', 30),   -- Requirement Management  : จัดการความต้องการ (Requirement)
    ('PMDT05', 40),   -- Diagram Management      : แผนภาพระบบ (DFD / ER / Use Case)
    ('PMDT07', 50),   -- Specification Management: ข้อมูลจำเพาะระบบ (Specification)
    ('PMDT09', 60),   -- Design Review           : ตรวจทานการออกแบบ

    -- 3. Development & Quality Assurance
    ('PMDT10', 70),   -- Task Management         : การพัฒนาระบบ (Development Tasks)
    ('PMDT12', 80),   -- Test Management         : การทดสอบระบบ (Testing / Test Case)

    -- 4. Documentation & Handover
    ('PMDT15', 90),   -- User Manual             : คู่มือการใช้งาน (Documentation)
    ('PMDT14', 100),  -- Delivery Management     : การส่งมอบงาน (Delivery Handover)

    -- 5. Finance & Maintenance
    ('PMDT16', 110),  -- Invoice & Payment       : ใบแจ้งหนี้และการชำระเงิน (Billing)
    ('PMDT17', 120),  -- MA Ticket               : การบำรุงรักษาระบบ (Maintenance)

    -- 6. Governance & Cross-Cutting
    ('PMDT06', 130),  -- Change Control          : ควบคุมการเปลี่ยนแปลง
    ('PMDT03', 140),  -- Approval Center         : ศูนย์การอนุมัติ
    ('PMDT08', 150),  -- Discussion Management   : ศูนย์รวมความคิดเห็น
    ('PMDT19', 160),  -- Document Version History: ประวัติเวอร์ชันเอกสาร
    ('PMDT20', 170)   -- Audit Log               : บันทึกประวัติการใช้งาน
) AS v(program_code, sort_order)
WHERE p.program_code = v.program_code
  AND p.is_delete = false;
