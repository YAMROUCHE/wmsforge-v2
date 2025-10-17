import { Hono } from 'hono';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// GET /api/locations
app.get('/', async (c) => {
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
  try {
    const body = await c.req.json();
    
    await c.env.DB.prepare(`
      INSERT INTO locations (
        organization_id, code, name, type, capacity, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      1,
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

export default app;
