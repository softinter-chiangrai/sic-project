-- V20260924161500__remove_approved_status_from_phase_milestone_wp_task.sql
-- Remove 'Approved' / 'อนุมัติแล้ว' status from Phase, Milestone, WorkPackage, and Task tables

UPDATE pm_task
SET status = 'Done'
WHERE status ILIKE 'Approved' OR status = 'อนุมัติแล้ว';

UPDATE pm_work_package
SET status = 'Done'
WHERE status ILIKE 'Approved' OR status = 'อนุมัติแล้ว';

UPDATE pm_milestone
SET status = 'Done'
WHERE status ILIKE 'Approved' OR status = 'อนุมัติแล้ว';

UPDATE pm_phase
SET status = 'Done'
WHERE status ILIKE 'Approved' OR status = 'อนุมัติแล้ว';
