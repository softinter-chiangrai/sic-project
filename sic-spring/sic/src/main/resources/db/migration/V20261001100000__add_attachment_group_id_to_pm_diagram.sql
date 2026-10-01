-- Allow attaching files to diagrams (same pattern as other modules) so the diagram PDF report can list them.
ALTER TABLE pm_diagram ADD COLUMN IF NOT EXISTS attachment_group_id UUID;
