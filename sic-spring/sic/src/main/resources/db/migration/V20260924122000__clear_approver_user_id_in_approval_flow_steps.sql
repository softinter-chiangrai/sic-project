-- Migration: V20260924122000__clear_approver_user_id_in_approval_flow_steps.sql
-- Description: Clear approver_user_id in pm_approval_flow_step so flows can be bound manually by users/admin in UI

UPDATE pm_approval_flow_step
SET approver_user_id = NULL,
    updated_date = NOW()
WHERE approver_user_id IS NOT NULL;
