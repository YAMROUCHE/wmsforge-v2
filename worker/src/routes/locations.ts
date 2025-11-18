import { optionalAuthMiddleware, getAuthUser } from '../middleware/auth';
import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

app.use('/*', optionalAuthMiddleware);

// GET /api/locations
app.get('/', async (c) => {
  const authUser = c.get("user");
  const organizationId = authUser?.organizationId || 1;
  try {
    const result = await c.env.DB.prepare(
      'SELECT * FROM locations'
    ).all();
    
    return c.json({ locations: result.results || [] });
  } catch (error) {
    console.error('Error fetching locations:', error);
    return c.json({ error: 'Failed to fetch locations' }, 500);
  }
});

// POST /api/locations - VERSION SIMPLIFIÉE
app.post('/', async (c) => {
  const authUser = c.get("user");
  const organizationId = authUser?.organizationId || 1;
  try {
    const body = await c.req.json();

    await c.env.DB.prepare(`
      INSERT INTO locations (
        organization_id, code, name, type, capacity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      organizationId,
      body.code,
      body.name,
      body.type || 'rack',
      body.capacity || null,
      new Date().toISOString()
    ).run();

    return c.json({ message: 'Location created successfully' });
  } catch (error) {
    console.error('Error creating location:', error);
    return c.json({ error: 'Failed to create location', details: error.message }, 500);
  }
});

// GET /api/locations/stats - Statistiques des emplacements
app.get('/stats', async (c) => {
  const authUser = c.get("user");
  const organizationId = authUser?.organizationId || 1;
  try {
    const stats = await c.env.DB.prepare(`
      SELECT
        COUNT(*) as total_locations,
        SUM(CASE WHEN type = 'zone' THEN 1 ELSE 0 END) as zones,
        SUM(CASE WHEN type = 'aisle' THEN 1 ELSE 0 END) as aisles,
        SUM(CASE WHEN type = 'rack' THEN 1 ELSE 0 END) as racks,
        SUM(CASE WHEN type = 'shelf' THEN 1 ELSE 0 END) as shelves,
        SUM(capacity) as total_capacity
      FROM locations
      WHERE organization_id = ?
    `).bind(organizationId).first();

    return c.json({ stats: stats || {} });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// GET /api/locations/:id - Détails d'un emplacement
app.get('/:id', async (c) => {
  const authUser = c.get("user");
  const organizationId = authUser?.organizationId || 1;
  try {
    const locationId = c.req.param('id');

    const location = await c.env.DB.prepare(`
      SELECT * FROM locations WHERE id = ? AND organization_id = ?
    `).bind(locationId, organizationId).first();

    if (!location) {
      return c.json({ error: 'Location not found' }, 404);
    }

    return c.json({ location });
  } catch (error) {
    console.error('Error fetching location:', error);
    return c.json({ error: 'Failed to fetch location' }, 500);
  }
});

// PUT /api/locations/:id - Mettre à jour un emplacement
app.put('/:id', async (c) => {
  const authUser = c.get("user");
  const organizationId = authUser?.organizationId || 1;
  try {
    const locationId = c.req.param('id');
    const body = await c.req.json();

    await c.env.DB.prepare(`
      UPDATE locations
      SET code = ?, name = ?, type = ?, capacity = ?
      WHERE id = ? AND organization_id = ?
    `).bind(
      body.code,
      body.name,
      body.type,
      body.capacity || null,
      locationId,
      organizationId
    ).run();

    return c.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    return c.json({ error: 'Failed to update location' }, 500);
  }
});

// DELETE /api/locations/:id - Supprimer un emplacement
app.delete('/:id', async (c) => {
  const authUser = c.get("user");
  const organizationId = authUser?.organizationId || 1;
  try {
    const locationId = c.req.param('id');

    await c.env.DB.prepare(`
      DELETE FROM locations WHERE id = ? AND organization_id = ?
    `).bind(locationId, organizationId).run();

    return c.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('Error deleting location:', error);
    return c.json({ error: 'Failed to delete location' }, 500);
  }
});

export default app;
