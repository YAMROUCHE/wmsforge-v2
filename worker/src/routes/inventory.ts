import { authMiddleware, getAuthUser } from '../middleware/auth';
import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

app.use('/*', authMiddleware);

// GET /api/inventory
app.get('/', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const result = await c.env.DB.prepare('SELECT * FROM inventory WHERE organization_id = ?').bind(organizationId).all();
    return c.json({ items: result.results || [] });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// POST /api/inventory/receive - VERSION SIMPLIFIÉE
app.post('/receive', async (c) => {
  const { organizationId, userId } = getAuthUser(c);
  try {
    const body = await c.req.json();
    
    // Vérifier si le stock existe
    const existing = await c.env.DB.prepare(
      'SELECT * FROM inventory WHERE product_id = ? AND location_id = ?'
    ).bind(body.productId, body.locationId).first();
    
    if (existing) {
      // Mettre à jour le stock existant
      await c.env.DB.prepare(`
        UPDATE inventory 
        SET quantity = quantity + ?, updated_at = ?
        WHERE id = ?
      `).bind(body.quantity, new Date().toISOString(), existing.id).run();
    } else {
      // Créer un nouveau stock
      await c.env.DB.prepare(`
        INSERT INTO inventory (organization_id, product_id, location_id, quantity, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(organizationId, body.productId, body.locationId, body.quantity, new Date().toISOString()).run();
    }
    
    // Enregistrer le mouvement
    await c.env.DB.prepare(`
      INSERT INTO stock_movements (organization_id, type, product_id, location_id, quantity, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(organizationId, 'RECEIVE', body.productId, body.locationId, body.quantity, userId, new Date().toISOString()).run();
    
    return c.json({ message: 'Stock received successfully', quantity: body.quantity });
  } catch (error) {
    console.error('Error receiving stock:', error);
    return c.json({ error: 'Failed to receive stock', details: (error as Error).message }, 500);
  }
});

// GET /api/inventory/movements
app.get('/movements', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const result = await c.env.DB.prepare(`
      SELECT
        sm.id,
        sm.type,
        sm.quantity,
        sm.notes,
        sm.created_at as createdAt,
        p.sku as productSku,
        p.name as productName,
        l.name as locationName
      FROM stock_movements sm
      LEFT JOIN products p ON sm.product_id = p.id
      LEFT JOIN locations l ON sm.location_id = l.id
      WHERE sm.organization_id = ?
      ORDER BY sm.created_at DESC
      LIMIT 50
    `).bind(organizationId).all();
    return c.json({ movements: result.results || [] });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return c.json({ error: 'Failed to fetch movements' }, 500);
  }
});

export default app;
