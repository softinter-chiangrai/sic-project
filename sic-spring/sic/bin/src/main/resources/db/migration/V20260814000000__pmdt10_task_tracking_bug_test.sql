-- V20260814000000__pmdt10_task_tracking_bug_test.sql
-- Migration script for pmdt10: Bug, Test Case, Test Scenario enhancements

-- 1. Update pm_bug table
ALTER TABLE pm_bug ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_bug ADD COLUMN IF NOT EXISTS steps_to_reproduce TEXT;
ALTER TABLE pm_bug ADD COLUMN IF NOT EXISTS environment VARCHAR(50);
ALTER TABLE pm_bug ADD COLUMN IF NOT EXISTS issue_type VARCHAR(20) DEFAULT 'Bug';
ALTER TABLE pm_bug ADD COLUMN IF NOT EXISTS attachment_group_id UUID;

-- 2. Update pm_test_case table
ALTER TABLE pm_test_case ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_test_case ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE pm_test_case ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'Medium';

-- 3. Update pm_test_scenario table
ALTER TABLE pm_test_scenario ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE pm_test_scenario ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active';
ALTER TABLE pm_test_scenario ALTER COLUMN test_plan_id DROP NOT NULL;
