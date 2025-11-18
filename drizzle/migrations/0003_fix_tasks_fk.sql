-- Migration: Fix tasks table - Remove product_id foreign key constraint
-- Date: 2025-11-16
-- Reason: product_name is sufficient, product_id doesn't need strict FK

-- SQLite doesn't support DROP CONSTRAINT, so we need to recreate the table

-- 1. Create new tasks table without FK constraint on product_id
CREATE TABLE IF NOT EXISTS tasks_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  wave_id INTEGER REFERENCES waves(id),
  order_id INTEGER REFERENCES orders(id),
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  product_id INTEGER NOT NULL, -- NO FK CONSTRAINT
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  from_location_id INTEGER REFERENCES locations(id),
  to_location_id INTEGER REFERENCES locations(id),
  assigned_to INTEGER REFERENCES operators(id),
  estimated_time_seconds INTEGER DEFAULT 0,
  actual_time_seconds INTEGER,
  zone TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  assigned_at TEXT,
  started_at TEXT,
  completed_at TEXT
);

-- 2. Copy existing data
INSERT INTO tasks_new SELECT * FROM tasks;

-- 3. Drop old table
DROP TABLE tasks;

-- 4. Rename new table
ALTER TABLE tasks_new RENAME TO tasks;

-- 5. Recreate indexes
CREATE INDEX IF NOT EXISTS idx_tasks_organization ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
