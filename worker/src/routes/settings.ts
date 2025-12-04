import { Hono } from 'hono';
import { authMiddleware, getAuthUser } from '../middleware/auth';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

app.use('/*', authMiddleware);

// GET /api/settings - Récupérer tous les settings
app.get('/', async (c) => {
  try {
    const { userId, organizationId } = getAuthUser(c);

    // Récupérer profil utilisateur
    const user = await c.env.DB.prepare(
      'SELECT id, name, email, role FROM users WHERE id = ?'
    ).bind(userId).first();

    // Récupérer organisation
    const org = await c.env.DB.prepare(
      'SELECT id, name, address, phone, email FROM organizations WHERE id = ?'
    ).bind(organizationId).first();

    // Récupérer préférences utilisateur
    let prefs: any = null;
    try {
      prefs = await c.env.DB.prepare(
        'SELECT * FROM user_preferences WHERE user_id = ?'
      ).bind(userId).first();
    } catch (e) {
      // Table user_preferences n'existe pas encore, utiliser valeurs par défaut
      console.log('user_preferences table not found, using defaults');
    }

    return c.json({
      profile: {
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'user'
      },
      organization: {
        name: org?.name || '',
        address: org?.address || '',
        phone: org?.phone || '',
        email: org?.email || ''
      },
      notifications: {
        emailNotifications: Boolean(prefs?.notification_email),
        orderNotifications: Boolean(prefs?.notification_orders),
        inventoryAlerts: Boolean(prefs?.notification_inventory),
        lowStockAlerts: Boolean(prefs?.notification_low_stock)
      },
      appearance: {
        theme: prefs?.theme || 'light',
        language: prefs?.language || 'fr',
        dateFormat: prefs?.date_format || 'dd/mm/yyyy'
      }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// PUT /api/settings/profile - Mettre à jour le profil
app.put('/profile', async (c) => {
  try {
    const { userId } = getAuthUser(c);
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE users
      SET name = ?, email = ?, role = ?
      WHERE id = ?
    `).bind(
      body.name,
      body.email,
      body.role,
      userId
    ).run();

    return c.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// PUT /api/settings/organization - Mettre à jour l'organisation
app.put('/organization', async (c) => {
  try {
    const { organizationId } = getAuthUser(c);
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE organizations
      SET name = ?, address = ?, phone = ?, email = ?
      WHERE id = ?
    `).bind(
      body.name,
      body.address,
      body.phone,
      body.email,
      organizationId
    ).run();

    return c.json({ message: 'Organization updated successfully' });
  } catch (error) {
    console.error('Error updating organization:', error);
    return c.json({ error: 'Failed to update organization' }, 500);
  }
});

// PUT /api/settings/notifications - Mettre à jour les notifications
app.put('/notifications', async (c) => {
  try {
    const { userId } = getAuthUser(c);
    const body = await c.req.json();

    await upsertNotificationPreferences(c.env.DB, userId, body);

    return c.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return c.json({ error: 'Failed to update notifications' }, 500);
  }
});

// PUT /api/settings/appearance - Mettre à jour l'apparence
app.put('/appearance', async (c) => {
  try {
    const { userId } = getAuthUser(c);
    const body = await c.req.json();

    await upsertAppearancePreferences(c.env.DB, userId, body);

    return c.json({ message: 'Appearance preferences updated successfully' });
  } catch (error) {
    console.error('Error updating appearance:', error);
    return c.json({ error: 'Failed to update appearance' }, 500);
  }
});

/**
 * Helper: Convert boolean to SQLite integer (1 or 0)
 */
function boolToInt(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * Helper: Check if user preferences exist
 */
async function userPreferencesExist(db: D1Database, userId: number): Promise<boolean> {
  const existing = await db.prepare(
    'SELECT user_id FROM user_preferences WHERE user_id = ?'
  ).bind(userId).first();
  return !!existing;
}

/**
 * Helper: Update notification preferences
 */
async function updateNotificationPreferences(
  db: D1Database,
  userId: number,
  email: number,
  orders: number,
  inventory: number,
  lowStock: number
): Promise<void> {
  await db.prepare(`
    UPDATE user_preferences
    SET notification_email = ?, notification_orders = ?,
        notification_inventory = ?, notification_low_stock = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(email, orders, inventory, lowStock, userId).run();
}

/**
 * Helper: Insert notification preferences
 */
async function insertNotificationPreferences(
  db: D1Database,
  userId: number,
  email: number,
  orders: number,
  inventory: number,
  lowStock: number
): Promise<void> {
  await db.prepare(`
    INSERT INTO user_preferences (
      user_id, notification_email, notification_orders,
      notification_inventory, notification_low_stock
    ) VALUES (?, ?, ?, ?, ?)
  `).bind(userId, email, orders, inventory, lowStock).run();
}

/**
 * Helper: Upsert notification preferences for a user
 */
async function upsertNotificationPreferences(
  db: D1Database,
  userId: number,
  body: {
    emailNotifications: boolean;
    orderNotifications: boolean;
    inventoryAlerts: boolean;
    lowStockAlerts: boolean;
  }
): Promise<void> {
  const email = boolToInt(body.emailNotifications);
  const orders = boolToInt(body.orderNotifications);
  const inventory = boolToInt(body.inventoryAlerts);
  const lowStock = boolToInt(body.lowStockAlerts);

  if (await userPreferencesExist(db, userId)) {
    await updateNotificationPreferences(db, userId, email, orders, inventory, lowStock);
  } else {
    await insertNotificationPreferences(db, userId, email, orders, inventory, lowStock);
  }
}

/**
 * Helper: Update appearance preferences
 */
async function updateAppearancePreferences(
  db: D1Database,
  userId: number,
  theme: string,
  language: string,
  dateFormat: string
): Promise<void> {
  await db.prepare(`
    UPDATE user_preferences
    SET theme = ?, language = ?, date_format = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).bind(theme, language, dateFormat, userId).run();
}

/**
 * Helper: Insert appearance preferences
 */
async function insertAppearancePreferences(
  db: D1Database,
  userId: number,
  theme: string,
  language: string,
  dateFormat: string
): Promise<void> {
  await db.prepare(`
    INSERT INTO user_preferences (
      user_id, theme, language, date_format
    ) VALUES (?, ?, ?, ?)
  `).bind(userId, theme, language, dateFormat).run();
}

/**
 * Helper: Upsert appearance preferences for a user
 */
async function upsertAppearancePreferences(
  db: D1Database,
  userId: number,
  body: {
    theme: string;
    language: string;
    dateFormat: string;
  }
): Promise<void> {
  if (await userPreferencesExist(db, userId)) {
    await updateAppearancePreferences(db, userId, body.theme, body.language, body.dateFormat);
  } else {
    await insertAppearancePreferences(db, userId, body.theme, body.language, body.dateFormat);
  }
}

export default app;
