-- Add parent_contract_id column to pm_customer_contract
ALTER TABLE pm_customer_contract
ADD COLUMN IF NOT EXISTS parent_contract_id UUID REFERENCES pm_customer_contract(id);

-- Create index for faster parent contract lookups
CREATE INDEX IF NOT EXISTS idx_pm_customer_contract_parent
ON pm_customer_contract(parent_contract_id);
