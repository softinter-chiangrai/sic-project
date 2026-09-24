-- Migration: V20260924190000__add_change_level_to_change_request.sql
-- Description: เพิ่มระดับการเปลี่ยนแปลง (PATCH/MINOR/MAJOR) ใน Change Request เพื่อใช้ bump เวอร์ชันเอกสารแบบ semver (X.Y.Z)
-- เวอร์ชันเก่า 2 ส่วน (เช่น v1.3) ไม่ถูกแก้ไข ระบบจะถือว่า patch = 0 ตอน bump ครั้งถัดไป

ALTER TABLE pm_change_request
    ADD COLUMN IF NOT EXISTS change_level VARCHAR(10) NOT NULL DEFAULT 'MINOR';
