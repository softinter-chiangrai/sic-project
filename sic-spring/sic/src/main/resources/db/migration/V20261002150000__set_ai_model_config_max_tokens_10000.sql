-- Migration: V20261002150000__set_ai_model_config_max_tokens_10000.sql
-- Description: Update max_tokens to 10000 for ai model configurations

UPDATE db_ai_model_config
SET max_tokens = 10000,
    updated_date = NOW(),
    updated_by = 'system'
WHERE is_delete = false;

ALTER TABLE db_ai_model_config
    ALTER COLUMN max_tokens SET DEFAULT 10000;
