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
  supplierId: integer('supplier_id').references(() => suppliers.id),
  status: text('status').default('pending'), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  totalAmount: integer('total_amount'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
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
