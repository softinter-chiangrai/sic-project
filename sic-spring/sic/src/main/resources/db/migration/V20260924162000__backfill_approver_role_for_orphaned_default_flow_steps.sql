-- Migration: V20260924162000__backfill_approver_role_for_orphaned_default_flow_steps.sql
-- Description: V20260924122000 cleared approver_user_id on ALL pm_approval_flow_step rows.
-- The per-business "DEF-<DOCTYPE>-<businessId>" flows (created automatically on business
-- signup in BusinessAccessServiceImpl.createDefaultApprovalFlows) relied solely on
-- approver_user_id and never had approver_role set, so clearing it left those steps with
-- no resolvable approver at all (approval requests get created with an unassigned step,
-- so no one ever sees them to approve). Backfill approver_role = 'ADMIN' for those orphaned
-- steps so they resolve via business ADMIN role membership, matching how the *_FLOW_DEFAULT
-- flows already behave.

UPDATE pm_approval_flow_step s
SET approver_role = 'ADMIN',
    updated_by = 'system',
    updated_date = NOW()
FROM pm_approval_flow f
WHERE s.flow_id = f.id
  AND f.flow_code LIKE 'DEF-%'
  AND s.is_delete = false
  AND (s.approver_role IS NULL OR s.approver_role = '')
  AND (s.approver_user_id IS NULL OR s.approver_user_id = '');
