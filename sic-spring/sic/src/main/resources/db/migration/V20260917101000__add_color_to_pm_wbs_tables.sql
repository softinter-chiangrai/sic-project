-- V20260917101000__add_color_to_pm_wbs_tables.sql

-- 1. Add color to pm_phase
ALTER TABLE public.pm_phase
    ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- 2. Add color to pm_milestone
ALTER TABLE public.pm_milestone
    ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- 3. Add color to pm_work_package
ALTER TABLE public.pm_work_package
    ADD COLUMN IF NOT EXISTS color VARCHAR(20);

-- 4. Add color to pm_task
ALTER TABLE public.pm_task
    ADD COLUMN IF NOT EXISTS color VARCHAR(20);
