-- Migration: V20260924120500__add_upstream_project_customer_to_impact_analysis.sql
-- Description: Add impacted_project_ids and impacted_customer_ids to pm_change_impact_analysis

ALTER TABLE pm_change_impact_analysis ADD COLUMN IF NOT EXISTS impacted_project_ids UUID[];
ALTER TABLE pm_change_impact_analysis ADD COLUMN IF NOT EXISTS impacted_customer_ids UUID[];
