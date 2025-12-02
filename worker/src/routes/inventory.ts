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
    const result = await c.env.DB.prepare(`
      SELECT
        i.id,
        i.product_id as productId,
        i.location_id as locationId,
        i.quantity as quantityOnHand,
        i.quantity as quantityAvailable,
        0 as quantityReserved,
        i.updated_at as lastMovementDate,
        p.name as productName,
        p.sku as productSku,
        l.code as locationCode,
        'available' as status
      FROM inventory i
      LEFT JOIN products p ON i.product_id = p.id
      LEFT JOIN locations l ON i.location_id = l.id
      WHERE i.organization_id = ?
      ORDER BY i.updated_at DESC
    `).bind(organizationId).all();
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

// POST /api/inventory/move - Déplacer du stock entre emplacements
app.post('/move', async (c) => {
  const { organizationId, userId } = getAuthUser(c);
  try {
    const body = await c.req.json();
    const { fromInventoryId, toLocationId, quantity, reason } = body;
    const sourceInventoryId = fromInventoryId;

    // Récupérer l'inventaire source
    const source = await c.env.DB.prepare(
      'SELECT * FROM inventory WHERE id = ?'
    ).bind(sourceInventoryId).first() as any;

    if (!source) {
      return c.json({ error: 'Stock source non trouvé' }, 404);
    }

    if (source.quantity < quantity) {
      return c.json({
        error: `Stock insuffisant. Vous essayez de déplacer ${quantity} unités mais seulement ${source.quantity} disponibles.`
      }, 400);
    }

    // Réduire le stock source
    await c.env.DB.prepare(`
      UPDATE inventory
      SET quantity = quantity - ?, updated_at = ?
      WHERE id = ?
    `).bind(quantity, new Date().toISOString(), sourceInventoryId).run();

    // Augmenter le stock destination (ou créer)
    const existing = await c.env.DB.prepare(
      'SELECT * FROM inventory WHERE product_id = ? AND location_id = ?'
    ).bind(source.product_id, toLocationId).first();

    if (existing) {
      await c.env.DB.prepare(`
        UPDATE inventory
        SET quantity = quantity + ?, updated_at = ?
        WHERE id = ?
      `).bind(quantity, new Date().toISOString(), existing.id).run();
    } else {
      await c.env.DB.prepare(`
        INSERT INTO inventory (organization_id, product_id, location_id, quantity, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).bind(organizationId, source.product_id, toLocationId, quantity, new Date().toISOString()).run();
    }

    // Enregistrer le mouvement (location_id = destination)
    await c.env.DB.prepare(`
      INSERT INTO stock_movements (organization_id, type, product_id, location_id, quantity, notes, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(organizationId, 'MOVE', source.product_id, toLocationId, quantity, reason || null, userId, new Date().toISOString()).run();

    return c.json({ message: 'Stock moved successfully', quantity });
  } catch (error) {
    console.error('Error moving stock:', error);
    return c.json({ error: 'Failed to move stock', details: (error as Error).message }, 500);
  }
});

// POST /api/inventory/adjust - Ajuster la quantité en stock
app.post('/adjust', async (c) => {
  const { organizationId, userId } = getAuthUser(c);
  try {
    const body = await c.req.json();
    const { inventoryId, newQuantity, reason, notes } = body;

    // Récupérer l'inventaire actuel
    const current = await c.env.DB.prepare(
      'SELECT * FROM inventory WHERE id = ? AND organization_id = ?'
    ).bind(inventoryId, organizationId).first() as any;

    if (!current) {
      return c.json({ error: 'Stock non trouvé' }, 404);
    }

    const oldQuantity = current.quantity;
    const difference = newQuantity - oldQuantity;

    // Mettre à jour la quantité
    await c.env.DB.prepare(`
      UPDATE inventory
      SET quantity = ?, updated_at = ?
      WHERE id = ?
    `).bind(newQuantity, new Date().toISOString(), inventoryId).run();

    // Enregistrer le mouvement d'ajustement
    await c.env.DB.prepare(`
      INSERT INTO stock_movements (organization_id, type, product_id, location_id, quantity, notes, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      organizationId,
      'ADJUST',
      current.product_id,
      current.location_id,
      difference,
      `${reason || 'Ajustement'}${notes ? ': ' + notes : ''}`,
      userId,
      new Date().toISOString()
    ).run();

    return c.json({
      message: 'Stock ajusté avec succès',
      oldQuantity,
      newQuantity,
      difference
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return c.json({ error: 'Failed to adjust stock', details: (error as Error).message }, 500);
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
