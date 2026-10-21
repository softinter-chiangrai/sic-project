-- Phase form uploads attachments (sic-upload) but pm_phase had no column, so files were lost after save.
ALTER TABLE pm_phase ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
