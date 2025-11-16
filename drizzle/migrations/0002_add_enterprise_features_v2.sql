-- Migration: Add Enterprise Features (Wave/Task/Labor Management)
-- Date: 2025-11-15
-- Version: 2 (sans ALTER TABLE sur orders)

-- Create operators table
CREATE TABLE IF NOT EXISTS operators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  user_id INTEGER REFERENCES users(id),
  name TEXT NOT NULL,
  employee_id TEXT,
  current_zone TEXT,
  status TEXT DEFAULT 'available',
  productivity_score INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create waves table
CREATE TABLE IF NOT EXISTS waves (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'normal',
  zone TEXT,
  assigned_to TEXT,
  total_orders INTEGER DEFAULT 0,
  total_lines INTEGER DEFAULT 0,
  total_units INTEGER DEFAULT 0,
  estimated_time_minutes INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  released_at TEXT,
  completed_at TEXT
);

-- Create wave_orders table
CREATE TABLE IF NOT EXISTS wave_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  wave_id INTEGER NOT NULL REFERENCES waves(id),
  order_id INTEGER NOT NULL REFERENCES orders(id),
  sequence INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  wave_id INTEGER REFERENCES waves(id),
  order_id INTEGER REFERENCES orders(id),
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  product_id INTEGER NOT NULL REFERENCES products(id),
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

-- Create operator_performance table
CREATE TABLE IF NOT EXISTS operator_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id),
  operator_id INTEGER NOT NULL REFERENCES operators(id),
  date TEXT NOT NULL,
  tasks_completed INTEGER DEFAULT 0,
  picks_per_hour INTEGER DEFAULT 0,
  lines_per_hour INTEGER DEFAULT 0,
  accuracy_rate INTEGER DEFAULT 100,
  total_hours_worked INTEGER DEFAULT 0,
  avg_task_time_seconds INTEGER DEFAULT 0,
  efficiency_score INTEGER DEFAULT 100,
  daily_score INTEGER DEFAULT 0,
  rank INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  criteria TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Create operator_badges table
CREATE TABLE IF NOT EXISTS operator_badges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operator_id INTEGER NOT NULL REFERENCES operators(id),
  badge_id INTEGER NOT NULL REFERENCES badges(id),
  earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
  date TEXT NOT NULL
);

-- Insert default badges (ignore if already exist)
INSERT OR IGNORE INTO badges (code, name, description, icon, rarity, criteria) VALUES
('first-blood', 'First Blood', 'Première tâche du jour', '🌅', 'common', '{"min_tasks": 1}'),
('perfect-accuracy', 'Perfect Accuracy', '100% de précision', '🎯', 'rare', '{"min_accuracy": 100}'),
('speed-demon', 'Speed Demon', '+30 picks/heure', '⚡', 'epic', '{"min_picks_per_hour": 30}'),
('efficiency-master', 'Efficiency Master', '+110% efficacité', '🏆', 'epic', '{"min_efficiency": 110}'),
('century', 'Century', '100+ tâches complétées', '💯', 'legendary', '{"min_tasks": 100}');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waves_organization ON waves(organization_id);
CREATE INDEX IF NOT EXISTS idx_waves_status ON waves(status);
CREATE INDEX IF NOT EXISTS idx_tasks_organization ON tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_operator_performance_date ON operator_performance(operator_id, date);
CREATE INDEX IF NOT EXISTS idx_wave_orders_wave ON wave_orders(wave_id);
CREATE INDEX IF NOT EXISTS idx_wave_orders_order ON wave_orders(order_id);
