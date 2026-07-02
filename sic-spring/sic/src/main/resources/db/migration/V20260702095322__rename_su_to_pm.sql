-- ใช้ query นี้เพื่อสร้าง rename statements ทั้งหมด
SELECT 'ALTER TABLE ' || tablename || ' RENAME TO ' || replace(tablename, 'su_', 'pm_') || ';'
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'su_customer%'
UNION
SELECT 'ALTER INDEX ' || indexname || ' RENAME TO ' || replace(indexname, 'su_', 'pm_') || ';'
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'su_customer%'
UNION
SELECT 'ALTER TABLE ' || conrelid::regclass || ' RENAME CONSTRAINT ' || conname || ' TO ' || replace(conname, 'su_', 'pm_') || ';'
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conname LIKE 'su_customer%';