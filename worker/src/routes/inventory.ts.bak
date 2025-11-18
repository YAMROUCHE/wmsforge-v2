import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// GET /api/inventory
app.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT * FROM inventory').all();
    return c.json({ items: result.results || [] });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// POST /api/inventory/receive - VERSION SIMPLIFIÉE
app.post('/receive', async (c) => {
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
      `).bind(1, body.productId, body.locationId, body.quantity, new Date().toISOString()).run();
    }
    
    // Enregistrer le mouvement
    await c.env.DB.prepare(`
      INSERT INTO stock_movements (organization_id, type, product_id, location_id, quantity, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(1, 'RECEIVE', body.productId, body.locationId, body.quantity, 1, new Date().toISOString()).run();
    
    return c.json({ message: 'Stock received successfully', quantity: body.quantity });
  } catch (error) {
    console.error('Error receiving stock:', error);
    return c.json({ error: 'Failed to receive stock', details: error.message }, 500);
  }
});

// GET /api/inventory/movements
app.get('/movements', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM stock_movements ORDER BY created_at DESC LIMIT 50'
    ).all();
    return c.json({ movements: result.results || [] });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return c.json({ error: 'Failed to fetch movements' }, 500);
  }
});

export default app;
