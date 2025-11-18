-- Migration: Add integrations system
-- Description: Tables pour gérer les intégrations externes (Shopify, Salesforce, etc.)

-- Table principale des intégrations
CREATE TABLE IF NOT EXISTS integrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,                     -- Ex: "Shopify", "Salesforce"
  type TEXT NOT NULL,                     -- 'ecommerce', 'crm', 'erp', 'shipping', 'custom'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'pending'
  config TEXT,                            -- JSON: credentials, settings
  webhook_secret TEXT,                    -- Secret pour vérifier les webhooks
  sync_settings TEXT,                     -- JSON: direction, entities, frequency
  last_sync_at DATETIME,
  last_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherches rapides
CREATE INDEX IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX IF NOT EXISTS idx_integrations_status ON integrations(status);

-- Logs des synchronisations
CREATE TABLE IF NOT EXISTS integration_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  integration_id INTEGER NOT NULL,
  action TEXT NOT NULL,                   -- 'sync', 'import', 'export', 'webhook'
  status TEXT NOT NULL,                   -- 'success', 'error', 'pending'
  entity_type TEXT,                       -- 'order', 'product', 'customer', 'inventory'
  entity_count INTEGER DEFAULT 0,         -- Nombre d'entités traitées
  details TEXT,                           -- JSON: metadata, erreurs
  duration_ms INTEGER,                    -- Durée en millisecondes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_integration_logs_integration ON integration_logs(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_logs_created ON integration_logs(created_at);

-- Mapping Shopify ↔ WMS
CREATE TABLE IF NOT EXISTS shopify_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  integration_id INTEGER NOT NULL,
  wms_entity_type TEXT NOT NULL,         -- 'order', 'product', 'customer'
  wms_entity_id INTEGER NOT NULL,
  shopify_id TEXT NOT NULL,              -- ID Shopify (bigint en string)
  shopify_admin_graphql_id TEXT,         -- GID Shopify
  sync_status TEXT DEFAULT 'synced',     -- 'synced', 'pending', 'error'
  last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

-- Index composites pour lookups bidirectionnels
CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_wms_lookup
  ON shopify_mappings(integration_id, wms_entity_type, wms_entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_id_lookup
  ON shopify_mappings(integration_id, shopify_id);

-- Mapping Salesforce ↔ WMS (pour future implémentation)
CREATE TABLE IF NOT EXISTS salesforce_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  integration_id INTEGER NOT NULL,
  wms_entity_type TEXT NOT NULL,
  wms_entity_id INTEGER NOT NULL,
  salesforce_id TEXT NOT NULL,           -- 18-char Salesforce ID
  salesforce_object_type TEXT,           -- 'Order', 'Account', 'Product2'
  sync_status TEXT DEFAULT 'synced',
  last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_salesforce_wms_lookup
  ON salesforce_mappings(integration_id, wms_entity_type, wms_entity_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_salesforce_id_lookup
  ON salesforce_mappings(integration_id, salesforce_id);

-- Table pour stocker les webhooks reçus (queue)
CREATE TABLE IF NOT EXISTS webhook_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  integration_id INTEGER NOT NULL,
  webhook_type TEXT NOT NULL,            -- Ex: 'orders/create', 'products/update'
  payload TEXT NOT NULL,                 -- JSON payload complet
  headers TEXT,                          -- JSON: X-Shopify-Topic, etc.
  status TEXT DEFAULT 'pending',         -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  processed_at DATETIME,
  error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhook_queue_status ON webhook_queue(status);
CREATE INDEX IF NOT EXISTS idx_webhook_queue_integration ON webhook_queue(integration_id);
