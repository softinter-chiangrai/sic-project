ALTER TABLE pm_diagram ADD COLUMN graph_data JSONB DEFAULT '{}'::jsonb;
CREATE INDEX idx_diagram_graph ON pm_diagram USING GIN (graph_data);