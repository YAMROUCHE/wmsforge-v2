import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Organizations
export const organizations = sqliteTable('organizations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Users
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role').default('user'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Products
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  sku: text('sku').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category'),
  unitPrice: integer('unit_price'),
  reorderPoint: integer('reorder_point').default(10),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Suppliers
export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  address: text('address'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Locations (emplacements d'entrepôt)
export const locations = sqliteTable('locations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type'), // 'zone', 'aisle', 'rack', 'shelf'
  parentId: integer('parent_id'),
  capacity: integer('capacity'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Inventory (stock par produit et emplacement)
export const inventory = sqliteTable('inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  productId: integer('product_id').notNull().references(() => products.id),
  locationId: integer('location_id').notNull().references(() => locations.id),
  quantity: integer('quantity').notNull().default(0),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Stock movements (mouvements de stock)
export const stockMovements = sqliteTable('stock_movements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  productId: integer('product_id').notNull().references(() => products.id),
  locationId: integer('location_id').references(() => locations.id),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'in', 'out', 'transfer', 'adjustment'
  quantity: integer('quantity').notNull(),
  reference: text('reference'),
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Orders (commandes)
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  orderNumber: text('order_number').notNull().unique(),
  type: text('type').notNull(), // 'purchase', 'sales'
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  shippingMethod: text('shipping_method'), // 'express', 'standard', 'economy'
  priority: text('priority').default('normal'), // 'urgent', 'normal', 'low'
  supplierId: integer('supplier_id').references(() => suppliers.id),
  status: text('status').default('pending'), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  totalAmount: integer('total_amount'),
  notes: text('notes'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Order items (lignes de commande)
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(),
});

// ========================================
// ENTERPRISE FEATURES - Wave/Task/Labor
// ========================================

// Operators (opérateurs d'entrepôt)
export const operators = sqliteTable('operators', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  employeeId: text('employee_id'),
  currentZone: text('current_zone'),
  status: text('status').default('available'), // 'available', 'busy', 'break', 'offline'
  productivityScore: integer('productivity_score').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Waves (vagues de picking)
export const waves = sqliteTable('waves', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  name: text('name').notNull(),
  status: text('status').default('pending'), // 'pending', 'released', 'in_progress', 'completed', 'cancelled'
  priority: text('priority').default('normal'), // 'urgent', 'normal', 'low'
  zone: text('zone'),
  assignedTo: text('assigned_to'),
  totalOrders: integer('total_orders').default(0),
  totalLines: integer('total_lines').default(0),
  totalUnits: integer('total_units').default(0),
  estimatedTimeMinutes: integer('estimated_time_minutes').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  releasedAt: text('released_at'),
  completedAt: text('completed_at'),
});

// Wave Orders (relation vague <-> commande)
export const waveOrders = sqliteTable('wave_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  waveId: integer('wave_id').notNull().references(() => waves.id),
  orderId: integer('order_id').notNull().references(() => orders.id),
  sequence: integer('sequence').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Tasks (tâches opérateurs)
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  waveId: integer('wave_id').references(() => waves.id),
  orderId: integer('order_id').references(() => orders.id),
  type: text('type').notNull(), // 'pick', 'put_away', 'move', 'count', 'pack', 'receive'
  priority: text('priority').default('normal'), // 'urgent', 'high', 'normal', 'low'
  status: text('status').default('pending'), // 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  productId: integer('product_id').notNull().references(() => products.id),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  fromLocationId: integer('from_location_id').references(() => locations.id),
  toLocationId: integer('to_location_id').references(() => locations.id),
  assignedTo: integer('assigned_to').references(() => operators.id),
  estimatedTimeSeconds: integer('estimated_time_seconds').default(0),
  actualTimeSeconds: integer('actual_time_seconds'),
  zone: text('zone'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  assignedAt: text('assigned_at'),
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
});

// Operator Performance (performances quotidiennes)
export const operatorPerformance = sqliteTable('operator_performance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id').notNull().references(() => organizations.id),
  operatorId: integer('operator_id').notNull().references(() => operators.id),
  date: text('date').notNull(), // Format: YYYY-MM-DD
  tasksCompleted: integer('tasks_completed').default(0),
  picksPerHour: integer('picks_per_hour').default(0),
  linesPerHour: integer('lines_per_hour').default(0),
  accuracyRate: integer('accuracy_rate').default(100), // Pourcentage
  totalHoursWorked: integer('total_hours_worked').default(0),
  avgTaskTimeSeconds: integer('avg_task_time_seconds').default(0),
  efficiencyScore: integer('efficiency_score').default(100), // Pourcentage
  dailyScore: integer('daily_score').default(0), // 0-1000 points
  rank: integer('rank').default(0),
  streakDays: integer('streak_days').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

// Badges (badges de gamification)
export const badges = sqliteTable('badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  code: text('code').notNull().unique(), // 'speed-demon', 'perfect-accuracy', etc.
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  rarity: text('rarity').default('common'), // 'common', 'rare', 'epic', 'legendary'
  criteria: text('criteria'), // JSON avec les critères d'obtention
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

// Operator Badges (badges gagnés par les opérateurs)
export const operatorBadges = sqliteTable('operator_badges', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  operatorId: integer('operator_id').notNull().references(() => operators.id),
  badgeId: integer('badge_id').notNull().references(() => badges.id),
  earnedAt: text('earned_at').default('CURRENT_TIMESTAMP'),
  date: text('date').notNull(), // Format: YYYY-MM-DD (pour badges quotidiens)
});
