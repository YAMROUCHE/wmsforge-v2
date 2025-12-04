import { authMiddleware, getAuthUser } from '../middleware/auth';
import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

app.use('/*', authMiddleware);

// GET /api/orders - Liste toutes les commandes
app.get('/', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const result = await c.env.DB.prepare(`
      SELECT
        o.*,
        COUNT(oi.id) as items_count
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.organization_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).bind(organizationId).all();

    return c.json({ orders: result.results || [] });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// GET /api/orders/stats - Statistiques des commandes
app.get('/stats', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(total_amount) as total_revenue
      FROM orders
      WHERE organization_id = ?
    `).bind(organizationId).first();

    return c.json({ stats: stats || {} });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// GET /api/orders/:id - Détails d'une commande avec ses items
app.get('/:id', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const orderId = c.req.param('id');

    // Récupérer la commande
    const order = await c.env.DB.prepare(`
      SELECT *
      FROM orders
      WHERE id = ? AND organization_id = ?
    `).bind(orderId, organizationId).first();

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    // Récupérer les items de la commande
    const items = await c.env.DB.prepare(`
      SELECT
        oi.*,
        p.sku,
        p.name as product_name
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).bind(orderId).all();

    return c.json({
      order: { ...order, items: items.results || [] }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// POST /api/orders - Créer une nouvelle commande
app.post('/', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const body = await c.req.json();
    const { type, customerName, customerEmail, items } = body;

    // Générer un numéro de commande unique
    const orderNumber = `ORD-${Date.now()}`;

    // Calculer le montant total
    let totalAmount = 0;
    if (items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) =>
        sum + (item.quantity * item.unitPrice), 0
      );
    }

    // Créer la commande
    const orderResult = await c.env.DB.prepare(`
      INSERT INTO orders (
        organization_id,
        order_number,
        type,
        customer_name,
        customer_email,
        status,
        total_amount,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      organizationId,
      orderNumber,
      type,
      customerName || null,
      customerEmail || null,
      'pending',
      totalAmount,
      new Date().toISOString()
    ).run();

    const orderId = orderResult.meta.last_row_id;

    // Ajouter les items si présents
    if (items && items.length > 0) {
      for (const item of items) {
        await c.env.DB.prepare(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?)
        `).bind(orderId, item.productId, item.quantity, item.unitPrice).run();
      }
    }

    return c.json({
      message: 'Order created successfully',
      orderId,
      orderNumber
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ error: 'Failed to create order', details: (error as Error).message }, 500);
  }
});

// PUT /api/orders/:id/status - Changer le statut d'une commande
app.put('/:id/status', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const orderId = c.req.param('id');
    const { status } = await c.req.json();

    // Valider le statut
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    await c.env.DB.prepare(`
      UPDATE orders
      SET status = ?
      WHERE id = ? AND organization_id = ?
    `).bind(status, orderId, organizationId).run();

    return c.json({ message: 'Status updated successfully', status });
  } catch (error) {
    console.error('Error updating status:', error);
    return c.json({ error: 'Failed to update status' }, 500);
  }
});

// POST /api/orders/:id/items - Ajouter des items à une commande
app.post('/:id/items', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const orderId = c.req.param('id');
    const { productId, quantity, unitPrice } = await c.req.json();

    // Ajouter l'item
    await c.env.DB.prepare(`
      INSERT INTO order_items (order_id, product_id, quantity, unit_price)
      VALUES (?, ?, ?, ?)
    `).bind(orderId, productId, quantity, unitPrice).run();

    // Mettre à jour le montant total de la commande
    await c.env.DB.prepare(`
      UPDATE orders
      SET total_amount = (
        SELECT SUM(quantity * unit_price) FROM order_items WHERE order_id = ?
      )
      WHERE id = ?
    `).bind(orderId, orderId).run();

    return c.json({ message: 'Item added successfully' });
  } catch (error) {
    console.error('Error adding item:', error);
    return c.json({ error: 'Failed to add item' }, 500);
  }
});

// DELETE /api/orders/:id - Supprimer une commande
app.delete('/:id', async (c) => {
  const { organizationId } = getAuthUser(c);
  try {
    const orderId = c.req.param('id');

    // Supprimer les items de la commande
    await c.env.DB.prepare(`
      DELETE FROM order_items WHERE order_id = ?
    `).bind(orderId).run();

    // Supprimer la commande
    await c.env.DB.prepare(`
      DELETE FROM orders WHERE id = ? AND organization_id = ?
    `).bind(orderId, organizationId).run();

    return c.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return c.json({ error: 'Failed to delete order' }, 500);
  }
});

export default app;
