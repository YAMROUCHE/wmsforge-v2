import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// GET /api/settings - Récupérer tous les settings
app.get('/', async (c) => {
  try {
    const userId = 1; // TODO: Récupérer depuis JWT
    const orgId = 1;

    // Récupérer profil utilisateur
    const user = await c.env.DB.prepare(
      'SELECT id, name, email, role FROM users WHERE id = ?'
    ).bind(userId).first();

    // Récupérer organisation
    const org = await c.env.DB.prepare(
      'SELECT id, name, address, phone, email FROM organizations WHERE id = ?'
    ).bind(orgId).first();

    // Récupérer préférences utilisateur
    let prefs = await c.env.DB.prepare(
      'SELECT * FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();

    // Si pas de préférences, créer avec valeurs par défaut
    if (!prefs) {
      await c.env.DB.prepare(`
        INSERT INTO user_preferences (
          user_id, notification_email, notification_orders,
          notification_inventory, notification_low_stock,
          theme, language, date_format
        ) VALUES (?, 1, 1, 1, 1, 'light', 'fr', 'dd/mm/yyyy')
      `).bind(userId).run();

      prefs = await c.env.DB.prepare(
        'SELECT * FROM user_preferences WHERE user_id = ?'
      ).bind(userId).first();
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
    const userId = 1; // TODO: Récupérer depuis JWT
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
    const orgId = 1;
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
      orgId
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
    const userId = 1; // TODO: Récupérer depuis JWT
    const body = await c.req.json();

    // Vérifier si l'utilisateur a déjà des préférences
    const existing = await c.env.DB.prepare(
      'SELECT user_id FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE user_preferences
        SET notification_email = ?,
            notification_orders = ?,
            notification_inventory = ?,
            notification_low_stock = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(
        body.emailNotifications ? 1 : 0,
        body.orderNotifications ? 1 : 0,
        body.inventoryAlerts ? 1 : 0,
        body.lowStockAlerts ? 1 : 0,
        userId
      ).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO user_preferences (
          user_id, notification_email, notification_orders,
          notification_inventory, notification_low_stock
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(
        userId,
        body.emailNotifications ? 1 : 0,
        body.orderNotifications ? 1 : 0,
        body.inventoryAlerts ? 1 : 0,
        body.lowStockAlerts ? 1 : 0
      ).run();
    }

    return c.json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return c.json({ error: 'Failed to update notifications' }, 500);
  }
});

// PUT /api/settings/appearance - Mettre à jour l'apparence
app.put('/appearance', async (c) => {
  try {
    const userId = 1; // TODO: Récupérer depuis JWT
    const body = await c.req.json();

    // Vérifier si l'utilisateur a déjà des préférences
    const existing = await c.env.DB.prepare(
      'SELECT user_id FROM user_preferences WHERE user_id = ?'
    ).bind(userId).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE user_preferences
        SET theme = ?, language = ?, date_format = ?, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).bind(
        body.theme,
        body.language,
        body.dateFormat,
        userId
      ).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO user_preferences (
          user_id, theme, language, date_format
        ) VALUES (?, ?, ?, ?)
      `).bind(
        userId,
        body.theme,
        body.language,
        body.dateFormat
      ).run();
    }

    return c.json({ message: 'Appearance preferences updated successfully' });
  } catch (error) {
    console.error('Error updating appearance:', error);
    return c.json({ error: 'Failed to update appearance' }, 500);
  }
});

export default app;
