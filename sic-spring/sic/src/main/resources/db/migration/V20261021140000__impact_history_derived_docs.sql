-- Impact history kept only base ids; manuals/deliveries/invoices/MA tickets were re-derived live,
-- so old versions showed today's values. Store them at record time.
ALTER TABLE pm_change_impact_analysis_history ADD COLUMN IF NOT EXISTS impacted_manual_ids UUID[];
ALTER TABLE pm_change_impact_analysis_history ADD COLUMN IF NOT EXISTS impacted_delivery_ids UUID[];
ALTER TABLE pm_change_impact_analysis_history ADD COLUMN IF NOT EXISTS impacted_invoice_ids UUID[];
ALTER TABLE pm_change_impact_analysis_history ADD COLUMN IF NOT EXISTS impacted_ma_ticket_ids UUID[];
