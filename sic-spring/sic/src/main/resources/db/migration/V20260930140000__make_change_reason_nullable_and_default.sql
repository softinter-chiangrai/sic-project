-- Make change_reason in pm_change_request nullable with default 'CUSTOMER_REQUEST'
ALTER TABLE pm_change_request ALTER COLUMN change_reason DROP NOT NULL;
ALTER TABLE pm_change_request ALTER COLUMN change_reason SET DEFAULT 'CUSTOMER_REQUEST';
