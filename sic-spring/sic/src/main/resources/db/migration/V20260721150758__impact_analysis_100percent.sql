-- ============================================================
-- Phase 1: Impact Analysis 100% Auto-Detect
-- เพิ่มโครงสร้างที่ทำให้ระบบรู้ได้ทันทีว่าเปลี่ยนแปลงอะไรกระทบอะไรบ้าง
-- โดยใช้ Foreign Key (FK) แทนการค้นหาข้อความแบบ LIKE
-- ============================================================

-- ============================================================
-- 1. ปรับปรุงตาราง pm_change_impact_analysis (ของเดิม)
-- เพิ่มฟิลด์เก็บ ID ของสิ่งที่กระทบ (แบบ Array)
-- ============================================================

-- ตรวจสอบและเพิ่มคอลัมน์ถ้ายังไม่มี
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='impacted_requirement_ids') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN impacted_requirement_ids UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='impacted_spec_ids') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN impacted_spec_ids UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='impacted_task_ids') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN impacted_task_ids UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='impacted_test_case_ids') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN impacted_test_case_ids UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='impacted_bug_ids') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN impacted_bug_ids UUID[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='impacted_table_names') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN impacted_table_names TEXT[];
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='analysis_status') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN analysis_status VARCHAR(20) DEFAULT 'MANUAL';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='analyzed_at') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN analyzed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_change_impact_analysis' AND column_name='analyzed_by') THEN
        ALTER TABLE pm_change_impact_analysis ADD COLUMN analyzed_by VARCHAR(100);
    END IF;
END $$;

COMMENT ON COLUMN pm_change_impact_analysis.impacted_requirement_ids IS 'รายการ Requirement ID ที่กระทบ (ใช้สำหรับ Auto-Detect)';
COMMENT ON COLUMN pm_change_impact_analysis.impacted_spec_ids IS 'รายการ Specification ID ที่กระทบ';
COMMENT ON COLUMN pm_change_impact_analysis.impacted_task_ids IS 'รายการ Task ID ที่กระทบ';
COMMENT ON COLUMN pm_change_impact_analysis.impacted_test_case_ids IS 'รายการ Test Case ID ที่กระทบ';
COMMENT ON COLUMN pm_change_impact_analysis.impacted_bug_ids IS 'รายการ Bug ID ที่กระทบ';
COMMENT ON COLUMN pm_change_impact_analysis.analysis_status IS 'AUTO = วิเคราะห์อัตโนมัติ, MANUAL = ป้อนเอง';


-- ============================================================
-- 2. 🔥 สำคัญที่สุด: สร้างความสัมพันธ์ด้วย FK จริง ๆ
--    เพื่อให้ค้นหาแบบ 100% แทนการค้นหาข้อความ
-- ============================================================

-- 2.1 pm_specification -> เชื่อมกับ pm_requirement โดยตรง
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_specification' AND column_name='requirement_id') THEN
        ALTER TABLE pm_specification ADD COLUMN requirement_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                   WHERE constraint_name='fk_spec_requirement') THEN
        ALTER TABLE pm_specification 
        ADD CONSTRAINT fk_spec_requirement FOREIGN KEY (requirement_id) REFERENCES pm_requirement(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_spec_requirement') THEN
        CREATE INDEX idx_spec_requirement ON pm_specification(requirement_id);
    END IF;
END $$;

-- 2.2 pm_test_case -> เชื่อมกับ pm_task โดยตรง (แทนการเก็บข้อความ)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='pm_test_case' AND column_name='task_id') THEN
        ALTER TABLE pm_test_case ADD COLUMN task_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                   WHERE constraint_name='fk_testcase_task') THEN
        ALTER TABLE pm_test_case 
        ADD CONSTRAINT fk_testcase_task FOREIGN KEY (task_id) REFERENCES pm_task(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname='idx_testcase_task') THEN
        CREATE INDEX idx_testcase_task ON pm_test_case(task_id);
    END IF;
END $$;

-- 2.3 pm_bug -> เชื่อมกับ pm_task โดยตรง (มีอยู่แล้ว แต่ตรวจสอบ)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
                   WHERE constraint_name='fk_bug_task') THEN
        -- ถ้ายังไม่มีคอนสเตรนต์ ให้เพิ่ม
        ALTER TABLE pm_bug ADD CONSTRAINT fk_bug_task FOREIGN KEY (task_id) REFERENCES pm_task(id);
    END IF;
END $$;


-- ============================================================
-- 3. ⚙️ โยนข้อมูลเดิมให้เชื่อมกัน (Migration Data)
--    เพื่อให้ข้อมูลเก่าใช้ Auto-Detect ได้ด้วย
-- ============================================================

-- 3.1 อัปเดต pm_specification.requirement_id จากฟิลด์ข้อความ related_requirement
--     โดยพยายามแมพจาก requirement_code ที่อยู่ในข้อความ (รูปแบบ REQ-XXX)
UPDATE pm_specification spec
SET requirement_id = req.id
FROM pm_requirement req
WHERE spec.requirement_id IS NULL 
  AND req.requirement_code IS NOT NULL
  AND spec.related_requirement IS NOT NULL
  AND spec.related_requirement LIKE '%' || req.requirement_code || '%';

-- 3.2 ถ้ายังมี spec ที่ยังไม่ได้แมพ (กรณีที่ related_requirement มีหลายตัว)
--     ให้แมพเฉพาะตัวแรกที่เจอ (หรือจะปล่อยไว้ให้ Manual ก็ได้)
--     (อันนี้ optional ถ้าอยากให้ครบทุกตัว)
WITH matched AS (
    SELECT DISTINCT ON (spec.id) 
        spec.id AS spec_id, 
        req.id AS req_id
    FROM pm_specification spec
    CROSS JOIN LATERAL regexp_matches(spec.related_requirement, '(REQ-[0-9]+)', 'g') AS matches
    JOIN pm_requirement req ON req.requirement_code = matches[1]
    WHERE spec.requirement_id IS NULL
)
UPDATE pm_specification spec
SET requirement_id = matched.req_id
FROM matched
WHERE spec.id = matched.spec_id;

-- 3.3 อัปเดต pm_test_case.task_id จากฟิลด์ข้อความ related_task
--     โดยแมพจาก task_code (รูปแบบ TASK-XXX)
UPDATE pm_test_case tc
SET task_id = t.id
FROM pm_task t
WHERE tc.task_id IS NULL 
  AND t.task_code IS NOT NULL
  AND tc.related_task IS NOT NULL
  AND tc.related_task LIKE '%' || t.task_code || '%';


-- ============================================================
-- 4. 🧠 ฟังก์ชัน Auto-Detect แบบ 100% (ใช้ FK ตรง ๆ)
--    โค้ดนี้จะถูกเรียกจาก Backend เพื่อค้นหา Impact
-- ============================================================

-- 4.1 ฟังก์ชันหลักสำหรับหา Impact ของ Requirement (รับ requirement_id)
CREATE OR REPLACE FUNCTION detect_impact_by_requirement(req_id UUID)
RETURNS TABLE(
    requirement_ids UUID[],
    spec_ids UUID[],
    task_ids UUID[],
    test_case_ids UUID[],
    bug_ids UUID[]
) LANGUAGE plpgsql AS $$
DECLARE
    v_requirement_ids UUID[] := ARRAY[req_id];
    v_spec_ids UUID[];
    v_task_ids UUID[];
    v_test_case_ids UUID[];
    v_bug_ids UUID[];
BEGIN
    -- 1. หา Specification ที่อ้างอิง Requirement นี้โดยตรง (FK)
    SELECT ARRAY_AGG(id) INTO v_spec_ids
    FROM pm_specification
    WHERE requirement_id = req_id
      AND is_delete = false;

    -- ถ้าไม่มี Spec เลย ให้คืนค่าเฉพาะ Requirement
    IF v_spec_ids IS NULL OR array_length(v_spec_ids, 1) IS NULL THEN
        RETURN QUERY SELECT 
            v_requirement_ids, 
            ARRAY[]::UUID[], 
            ARRAY[]::UUID[], 
            ARRAY[]::UUID[], 
            ARRAY[]::UUID[];
        RETURN;
    END IF;

    -- 2. หา Task ทั้งหมดที่อ้างอิง Spec เหล่านี้ (FK: spec_id)
    SELECT ARRAY_AGG(id) INTO v_task_ids
    FROM pm_task
    WHERE spec_id = ANY(v_spec_ids)
      AND is_delete = false;

    -- 3. หา Test Case ที่อ้างอิง Task เหล่านี้ (FK: task_id)
    IF v_task_ids IS NOT NULL AND array_length(v_task_ids, 1) IS NOT NULL THEN
        SELECT ARRAY_AGG(id) INTO v_test_case_ids
        FROM pm_test_case
        WHERE task_id = ANY(v_task_ids)
          AND is_delete = false;
    ELSE
        v_test_case_ids := ARRAY[]::UUID[];
    END IF;

    -- 4. หา Bug ที่อ้างอิง Task เหล่านี้ (FK: task_id)
    IF v_task_ids IS NOT NULL AND array_length(v_task_ids, 1) IS NOT NULL THEN
        SELECT ARRAY_AGG(id) INTO v_bug_ids
        FROM pm_bug
        WHERE task_id = ANY(v_task_ids)
          AND is_delete = false;
    ELSE
        v_bug_ids := ARRAY[]::UUID[];
    END IF;

    -- ส่งผลลัพธ์กลับ
    RETURN QUERY SELECT 
        v_requirement_ids, 
        COALESCE(v_spec_ids, ARRAY[]::UUID[]),
        COALESCE(v_task_ids, ARRAY[]::UUID[]),
        COALESCE(v_test_case_ids, ARRAY[]::UUID[]),
        COALESCE(v_bug_ids, ARRAY[]::UUID[]);
END;
$$;

-- 4.2 ฟังก์ชัน Auto-Detect จาก Change Request (เรียกใช้จริงใน Backend)
CREATE OR REPLACE FUNCTION auto_detect_impact_from_change_request(cr_id UUID)
RETURNS TABLE(
    impacted_requirement_ids UUID[],
    impacted_spec_ids UUID[],
    impacted_task_ids UUID[],
    impacted_test_case_ids UUID[],
    impacted_bug_ids UUID[]
) LANGUAGE plpgsql AS $$
DECLARE
    v_requirement_id UUID;
BEGIN
    -- 1. ดึง requirement_id จาก Change Request
    SELECT requirement_id INTO v_requirement_id
    FROM pm_requirement_change_request
    WHERE id = cr_id AND is_delete = false;

    IF v_requirement_id IS NULL THEN
        RETURN QUERY SELECT 
            ARRAY[]::UUID[], ARRAY[]::UUID[], 
            ARRAY[]::UUID[], ARRAY[]::UUID[], 
            ARRAY[]::UUID[];
        RETURN;
    END IF;

    -- 2. เรียกฟังก์ชันหาผลกระทบจาก Requirement
    RETURN QUERY
    SELECT * FROM detect_impact_by_requirement(v_requirement_id);
END;
$$;

-- ============================================================
-- 5. ✅ สรุปสิ่งที่ได้
--    - pm_specification มี FK ชี้ไป pm_requirement
--    - pm_test_case มี FK ชี้ไป pm_task
--    - ข้อมูลเดิมถูกแมพให้เชื่อมโยงกัน
--    - ฟังก์ชัน Auto-Detect ใช้ JOIN ตรง ๆ (ไม่มี LIKE)
--    - ความแม่นยำ 100% ในระดับโครงสร้างข้อมูล
-- ============================================================

COMMIT;