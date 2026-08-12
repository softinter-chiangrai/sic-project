

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_diagram_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_bug_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_requirement_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_spec_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_task_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_test_case_ids UUID[];

ALTER TABLE pm_change_impact_analysis
ADD COLUMN IF NOT EXISTS impacted_table_names TEXT[];