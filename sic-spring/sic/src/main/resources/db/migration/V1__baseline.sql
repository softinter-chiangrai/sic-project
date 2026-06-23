-- =====================================================
-- V1__baseline.sql
-- Baseline schema from .NET application
-- Flyway will skip execution because baseline-on-migrate=true
-- =====================================================

-- 🔴 IMPORTANT: All tables already exist in the database
-- This file is for Flyway to record baseline version 1

SELECT '✅ Baseline version 1 is ready!' as message;

-- (Optional: ใส่ SQL Schema ทั้งหมดที่นี่ก็ได้ แต่ Flyway จะไม่รัน)