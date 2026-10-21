-- These forms upload attachments (sic-upload) but the tables had no column, so files were lost after save.
ALTER TABLE pm_milestone ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_work_package ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_task ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_test_scenario ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_design_review ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
