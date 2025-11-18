import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// GET /api/waves - Liste toutes les vagues
app.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT
        w.*,
        COUNT(DISTINCT wo.order_id) as actual_orders
      FROM waves w
      LEFT JOIN wave_orders wo ON w.id = wo.wave_id
      WHERE w.organization_id = ?
      GROUP BY w.id
      ORDER BY w.created_at DESC
    `).bind(1).all();

    return c.json({ waves: result.results || [] });
  } catch (error) {
    console.error('Error fetching waves:', error);
    return c.json({ error: 'Failed to fetch waves' }, 500);
  }
});

// GET /api/waves/:id - Détails d'une vague avec ses commandes
app.get('/:id', async (c) => {
  try {
    const waveId = c.req.param('id');

    // Récupérer la vague
    const wave = await c.env.DB.prepare(`
      SELECT * FROM waves
      WHERE id = ? AND organization_id = ?
    `).bind(waveId, 1).first();

    if (!wave) {
      return c.json({ error: 'Wave not found' }, 404);
    }

    // Récupérer les commandes de la vague
    const orders = await c.env.DB.prepare(`
      SELECT
        o.*,
        wo.sequence
      FROM wave_orders wo
      JOIN orders o ON wo.order_id = o.id
      WHERE wo.wave_id = ?
      ORDER BY wo.sequence
    `).bind(waveId).all();

    return c.json({
      wave: { ...wave, orders: orders.results || [] }
    });
  } catch (error) {
    console.error('Error fetching wave:', error);
    return c.json({ error: 'Failed to fetch wave' }, 500);
  }
});

// POST /api/waves - Créer une nouvelle vague
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { name, priority, zone, orderIds } = body;

    // Créer la vague
    const result = await c.env.DB.prepare(`
      INSERT INTO waves (organization_id, name, priority, zone, total_orders, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `).bind(1, name, priority || 'normal', zone || null, orderIds?.length || 0).run();

    const waveId = result.meta.last_row_id;

    // Associer les commandes
    if (orderIds && orderIds.length > 0) {
      for (let i = 0; i < orderIds.length; i++) {
        await c.env.DB.prepare(`
          INSERT INTO wave_orders (wave_id, order_id, sequence)
          VALUES (?, ?, ?)
        `).bind(waveId, orderIds[i], i + 1).run();
      }
    }

    return c.json({ success: true, waveId }, 201);
  } catch (error) {
    console.error('Error creating wave:', error);
    return c.json({ error: 'Failed to create wave' }, 500);
  }
});

// PUT /api/waves/:id/status - Modifier le statut d'une vague
app.put('/:id/status', async (c) => {
  try {
    const waveId = c.req.param('id');
    const { status } = await c.req.json();

    const now = new Date().toISOString();
    let additionalFields = '';

    if (status === 'released') {
      additionalFields = ', released_at = ?';
    } else if (status === 'completed') {
      additionalFields = ', completed_at = ?';
    }

    const query = `
      UPDATE waves
      SET status = ?${additionalFields}
      WHERE id = ? AND organization_id = ?
    `;

    const params = additionalFields
      ? [status, now, waveId, 1]
      : [status, waveId, 1];

    await c.env.DB.prepare(query).bind(...params).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Error updating wave status:', error);
    return c.json({ error: 'Failed to update wave status' }, 500);
  }
});

export default app;
