-- Alter pm_approval_flow_step.approver_user_id to hold multiple comma-separated user IDs
ALTER TABLE pm_approval_flow_step ALTER COLUMN approver_user_id TYPE VARCHAR(1000);
