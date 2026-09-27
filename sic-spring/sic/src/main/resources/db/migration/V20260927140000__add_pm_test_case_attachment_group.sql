-- V20260927140000__add_pm_test_case_attachment_group.sql
-- Allow attaching evidence files (screenshots, logs) when recording a test result,
-- same pattern already used by pm_bug.attachment_group_id / pm_delivery.attachment_group_id.

ALTER TABLE pm_test_case ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
