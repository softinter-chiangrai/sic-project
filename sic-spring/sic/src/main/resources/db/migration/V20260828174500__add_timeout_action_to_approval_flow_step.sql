-- เพิ่ม timeout_action ในตาราง pm_approval_flow_step
ALTER TABLE pm_approval_flow_step
ADD COLUMN IF NOT EXISTS timeout_action VARCHAR(30) DEFAULT 'NONE';

COMMENT ON COLUMN pm_approval_flow_step.timeout_action IS 'NONE, AUTO_SKIP, AUTO_APPROVE, AUTO_REJECT, ESCALATE';
