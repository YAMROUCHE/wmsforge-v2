-- Enterprise Features Test Data
-- Seed data for testing Wave/Task/Labor Management

-- Disable foreign key constraints temporarily
PRAGMA foreign_keys = OFF;

-- Insert test operators
INSERT OR IGNORE INTO operators (id, organization_id, name, employee_id, current_zone, status, productivity_score) VALUES
(1, 1, 'Jean Dupont', 'OP001', 'A', 'available', 95),
(2, 1, 'Marie Martin', 'OP002', 'B', 'available', 88),
(3, 1, 'Pierre Durand', 'OP003', 'C', 'available', 92),
(4, 1, 'Sophie Bernard', 'OP004', 'A', 'available', 85),
(5, 1, 'Lucas Petit', 'OP005', 'B', 'busy', 90);

-- Insert test waves (without total_units field)
INSERT OR IGNORE INTO waves (id, organization_id, name, status, priority, zone, total_orders, total_lines, estimated_time_minutes) VALUES
(1, 1, 'Wave A1 - HIGH', 'pending', 'high', 'A', 8, 24, 45),
(2, 1, 'Wave B1 - NORMAL', 'released', 'normal', 'B', 10, 35, 60),
(3, 1, 'Wave C1 - LOW', 'in_progress', 'low', 'C', 5, 12, 30),
(4, 1, 'Wave A2 - URGENT', 'completed', 'urgent', 'A', 3, 8, 20);

-- Insert test tasks (without foreign key references to products/locations/orders)
INSERT OR IGNORE INTO tasks (id, organization_id, wave_id, type, priority, status, product_id, product_name, quantity, assigned_to, estimated_time_seconds, actual_time_seconds, zone) VALUES
-- Wave 1 tasks (pending)
(1, 1, 1, 'pick', 'high', 'pending', 1, 'Product A', 10, NULL, 180, NULL, 'A'),
(2, 1, 1, 'pick', 'high', 'pending', 2, 'Product B', 5, NULL, 120, NULL, 'A'),
(3, 1, 1, 'pick', 'high', 'pending', 3, 'Product C', 15, NULL, 240, NULL, 'A'),

-- Wave 2 tasks (released/assigned)
(4, 1, 2, 'pick', 'normal', 'assigned', 4, 'Product D', 8, 1, 150, NULL, 'B'),
(5, 1, 2, 'pick', 'normal', 'assigned', 5, 'Product E', 12, 2, 180, NULL, 'B'),
(6, 1, 2, 'pick', 'normal', 'in_progress', 6, 'Product F', 20, 3, 300, NULL, 'B'),

-- Wave 3 tasks (in progress)
(7, 1, 3, 'pick', 'low', 'in_progress', 7, 'Product G', 6, 4, 120, NULL, 'C'),
(8, 1, 3, 'pick', 'low', 'in_progress', 8, 'Product H', 9, 5, 150, NULL, 'C'),

-- Wave 4 tasks (completed)
(9, 1, 4, 'pick', 'urgent', 'completed', 9, 'Product I', 3, 1, 90, 85, 'A'),
(10, 1, 4, 'pick', 'urgent', 'completed', 10, 'Product J', 4, 1, 100, 95, 'A'),

-- Standalone tasks (not part of waves)
(11, 1, NULL, 'put_away', 'normal', 'pending', 11, 'Product K', 25, NULL, 200, NULL, 'A'),
(12, 1, NULL, 'move', 'high', 'pending', 12, 'Product L', 30, NULL, 250, NULL, 'B'),
(13, 1, NULL, 'count', 'low', 'completed', 13, 'Product M', 50, 2, 300, 280, 'C');

-- Insert performance data (for today)
INSERT OR IGNORE INTO operator_performance (organization_id, operator_id, date, tasks_completed, picks_per_hour, lines_per_hour, accuracy_rate, total_hours_worked, avg_task_time_seconds, efficiency_score, daily_score, rank, streak_days) VALUES
(1, 1, DATE('now'), 25, 32, 45, 98, 8, 180, 105, 850, 1, 5),
(1, 2, DATE('now'), 22, 28, 40, 100, 8, 200, 110, 820, 2, 3),
(1, 3, DATE('now'), 20, 26, 38, 95, 8, 210, 102, 780, 3, 7),
(1, 4, DATE('now'), 18, 24, 35, 92, 8, 230, 98, 720, 4, 2),
(1, 5, DATE('now'), 15, 20, 30, 88, 8, 250, 95, 650, 5, 1);

-- Award badges to operators based on performance
INSERT OR IGNORE INTO operator_badges (operator_id, badge_id, date) VALUES
-- Jean Dupont (OP001) - Top performer
(1, 1, DATE('now')),  -- First Blood
(1, 2, DATE('now')),  -- Perfect Accuracy
(1, 3, DATE('now')),  -- Speed Demon

-- Marie Martin (OP002) - Perfect accuracy
(2, 1, DATE('now')),  -- First Blood
(2, 2, DATE('now')),  -- Perfect Accuracy
(2, 4, DATE('now')),  -- Efficiency Master

-- Pierre Durand (OP003)
(3, 1, DATE('now')),  -- First Blood
(3, 3, DATE('now')),  -- Speed Demon

-- Sophie Bernard (OP004)
(4, 1, DATE('now')),  -- First Blood

-- Lucas Petit (OP005)
(5, 1, DATE('now'));  -- First Blood

-- Re-enable foreign key constraints
PRAGMA foreign_keys = ON;
