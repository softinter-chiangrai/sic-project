-- Migration: V20260924200000__reorder_programs_by_sdlc.sql
-- Description: เรียงลำดับเมนู (su_program.sort_order) ของ Project Workspace ตามวงจร SDLC
-- แทนการเรียงตามเลขรหัสโปรแกรม: Planning -> Requirement -> Analysis/Design -> Development
-- -> Testing -> Delivery -> Billing -> Maintenance แล้วตามด้วยงานกำกับดูแลที่ใช้ตลอดวงจร (Governance)
-- กติกา: ทุก migration ที่เพิ่ม su_program ใหม่ ให้กำหนด sort_order ตามตำแหน่งใน SDLC (เว้นห่างทีละ 10)

UPDATE su_program p
SET sort_order = v.sort_order,
    updated_by = 'system',
    updated_date = NOW()
FROM (VALUES
    -- Project Workspace (PMDT) ตามลำดับ SDLC
    ('PMDT01', 10),   -- Phase Management        : วางแผนโครงการ (Planning / WBS)
    ('PMDT11', 20),   -- Gantt Schedule          : วางแผนโครงการ (Schedule)
    ('PMDT04', 30),   -- Requirement Management  : เก็บความต้องการ (Requirement)
    ('PMDT05', 40),   -- Diagram Management      : วิเคราะห์และออกแบบ (DFD / ER / Use Case)
    ('PMDT07', 50),   -- Specification Management: ออกแบบรายละเอียด (Specification)
    ('PMDT09', 60),   -- Design Review           : ตรวจทานการออกแบบ
    ('PMDT10', 70),   -- Task Management         : พัฒนา (Development)
    ('PMDT12', 80),   -- Test Management         : ทดสอบ (Testing)
    ('PMDT14', 90),   -- Delivery Management     : ส่งมอบ (Delivery)
    ('PMDT15', 100),  -- User Manual             : คู่มือประกอบการส่งมอบ
    ('PMDT16', 110),  -- Invoice & Payment       : วางบิล/รับชำระ
    ('PMDT17', 120),  -- MA Ticket               : บำรุงรักษา (Maintenance)
    -- งานกำกับดูแลที่ใช้ตลอดวงจร (Governance / Cross-cutting)
    ('PMDT06', 130),  -- Change Control
    ('PMDT03', 140),  -- Approval Center
    ('PMDT08', 150),  -- Discussion Management
    ('PMDT19', 160),  -- Document Version History
    ('PMDT20', 170),  -- Audit Log

    -- Business Setting (BURT): AI Model Management ต่อท้ายกลุ่มเดียวกัน (เดิมใส่ 7 ทำให้ขึ้นก่อนทุกเมนู)
    ('BURT07', 70)
) AS v(program_code, sort_order)
WHERE p.program_code = v.program_code
  AND p.is_delete = false;
