import { optionalAuthMiddleware, getAuthUser } from '../middleware/auth';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: { DB: D1Database } }>();

app.use('/*', optionalAuthMiddleware);

// GET /api/tasks - Liste toutes les tâches
app.get('/', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const { status, operatorId } = c.req.query();

    let query = `
      SELECT t.*, o.name as operator_name
      FROM tasks t
      LEFT JOIN operators o ON t.assigned_to = o.id
      WHERE t.organization_id = ?
    `;
    const params = [1];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (operatorId) {
      query += ` AND t.assigned_to = ?`;
      params.push(operatorId);
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ tasks: result.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// POST /api/tasks - Créer des tâches
app.post('/', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const tasks = await c.req.json();
    const createdTasks = [];

    for (const task of tasks) {
      const result = await c.env.DB.prepare(`
        INSERT INTO tasks (
          organization_id, wave_id, order_id, type, priority, status,
          product_id, product_name, quantity, from_location_id, to_location_id,
          estimated_time_seconds, zone
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        1, task.waveId || null, task.orderId || null, task.type, task.priority || 'normal',
        'pending', task.productId, task.productName, task.quantity,
        task.fromLocationId || null, task.toLocationId || null, task.estimatedTimeSeconds || 0,
        task.zone || null
      ).run();

      createdTasks.push({ id: result.meta.last_row_id });
    }

    return c.json({ success: true, tasks: createdTasks }, 201);
  } catch (error) {
    console.error('Error creating tasks:', error);
    return c.json({
      error: 'Failed to create tasks',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// PUT /api/tasks/:id/status - Mettre à jour le statut d'une tâche
app.put('/:id/status', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const taskId = c.req.param('id');
    const { status, actualTimeSeconds } = await c.req.json();

    const now = new Date().toISOString();
    let query = 'UPDATE tasks SET status = ?';
    const params = [status];

    if (status === 'in_progress') {
      query += ', started_at = ?';
      params.push(now);
    } else if (status === 'completed') {
      query += ', completed_at = ?, actual_time_seconds = ?';
      params.push(now, actualTimeSeconds || 0);
    }

    query += ' WHERE id = ? AND organization_id = ?';
    params.push(taskId, 1);

    await c.env.DB.prepare(query).bind(...params).run();
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to update task' }, 500);
  }
});

// GET /api/tasks/metrics - Métriques des tâches
app.get('/metrics', async (c) => {
    const authUser = c.get("user");
    const organizationId = authUser?.organizationId || 1;
  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' OR status = 'assigned' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        AVG(CASE WHEN actual_time_seconds > 0 THEN actual_time_seconds ELSE NULL END) as avg_time
      FROM tasks
      WHERE organization_id = ?
    `).bind(organizationId).first();

    return c.json({ metrics: stats || {} });
  } catch (error) {
    return c.json({ error: 'Failed to fetch metrics' }, 500);
  }
});

export default app;
