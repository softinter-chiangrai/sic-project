-- Add priority column to pm_change_request table
ALTER TABLE pm_change_request 
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'MEDIUM';

-- Update existing records to have 'MEDIUM' priority if null
UPDATE pm_change_request 
SET priority = 'MEDIUM' 
WHERE priority IS NULL;
