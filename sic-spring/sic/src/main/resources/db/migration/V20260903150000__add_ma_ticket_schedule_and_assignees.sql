-- V20260903150000__add_ma_ticket_schedule_and_assignees.sql
-- Support the new MA Ticket form: schedule fields, optional customer/project,
-- and multiple assignees (mirrors pm_task_assignee)

ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS start_time VARCHAR(5);
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE pm_ma_ticket ADD COLUMN IF NOT EXISTS end_time VARCHAR(5);

ALTER TABLE pm_ma_ticket ALTER COLUMN customer_id DROP NOT NULL;
ALTER TABLE pm_ma_ticket ALTER COLUMN project_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS pm_ma_ticket_assignee (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id         UUID,
    ma_ticket_id        UUID NOT NULL,
    user_id             VARCHAR(100) NOT NULL,
    is_delete           BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by           VARCHAR(100),
    delete_date         TIMESTAMP WITH TIME ZONE,
    created_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by          VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_ma_ticket_assignee_ticket FOREIGN KEY (ma_ticket_id) REFERENCES pm_ma_ticket(id)
);
