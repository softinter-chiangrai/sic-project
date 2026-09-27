-- V20260927150000__add_attachment_group_id_to_more_modules.sql
-- Allow attaching evidence/support files to more modules, same pattern already used by
-- pm_bug / pm_delivery / pm_user_manual (attachment_group_id) and pm_requirement /
-- pm_specification (upload_group_id) — needed so their PDF reports can list attached files.

ALTER TABLE pm_ma_renewal ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_change_request ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_customer_contract ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_invoice ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
ALTER TABLE pm_customer_project ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
