-- Line items (สินค้า/บริการ) belonging to a PM invoice, similar to a receipt's item list.
CREATE TABLE IF NOT EXISTS pm_invoice_item (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id      UUID NOT NULL REFERENCES pm_invoice(id),
    item_name       VARCHAR(255) NOT NULL,
    description     TEXT,
    amount          NUMERIC(18,2) NOT NULL DEFAULT 0,
    sort_order      INTEGER DEFAULT 0,
    is_delete       BOOLEAN NOT NULL DEFAULT FALSE,
    delete_by       VARCHAR(100),
    delete_date     TIMESTAMP WITH TIME ZONE,
    created_by      VARCHAR(100) NOT NULL DEFAULT 'system',
    created_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by      VARCHAR(100) NOT NULL DEFAULT 'system',
    updated_date    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pm_invoice_item_invoice_id ON pm_invoice_item(invoice_id);
