DROP TABLE IF EXISTS pm_er_relationship CASCADE;
DROP TABLE IF EXISTS pm_er_column CASCADE;
DROP TABLE IF EXISTS pm_er_table CASCADE;


-- ระวัง Foreign Key ถ้ามี ให้ Drop ด้วย Cascade
DROP TABLE IF EXISTS pm_dfd_external_entity CASCADE;
DROP TABLE IF EXISTS pm_dfd_data_flow CASCADE;
DROP TABLE IF EXISTS pm_dfd_process CASCADE;