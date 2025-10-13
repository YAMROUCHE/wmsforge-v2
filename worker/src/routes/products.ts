import { Hono } from 'hono';

const app = new Hono();

// API Products simplifiée pour tests (sans auth)

// GET /api/products
app.get('/', async (c) => {
  return c.json({
    items: [
      { 
        id: 1, 
        sku: 'SKU-001', 
        name: 'iPhone 15 Pro',
        price: 1299,
        abcClass: 'A',
        category: 'Electronics'
      },
      { 
        id: 2, 
        sku: 'SKU-002', 
        name: 'MacBook Pro',
        price: 2499,
        abcClass: 'A',
        category: 'Electronics'
      }
    ],
    pagination: {
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1
    }
  });
});

// POST /api/products
app.post('/', async (c) => {
  try {
    const body = await c.req.json();
    return c.json({
      message: 'Product created successfully',
      product: {
        id: Date.now(),
        ...body,
        createdAt: new Date().toISOString()
      }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
});

// GET /api/products/sku/:sku
app.get('/sku/:sku', async (c) => {
  const sku = c.req.param('sku');
  return c.json({
    id: 1,
    sku: sku,
    name: `Product ${sku}`,
    price: 999,
    abcClass: 'B',
    status: 'active'
  });
});

// POST /api/products/bulk
app.post('/bulk', async (c) => {
  try {
    const body = await c.req.json();
    const products = body.products || [];
    return c.json({
      message: `Imported ${products.length} products successfully`,
      imported: products.length,
      failed: 0,
      products: products.map((p, i) => ({
        ...p,
        id: i + 1,
        createdAt: new Date().toISOString()
      }))
    });
  } catch (error) {
    return c.json({ error: 'Invalid JSON' }, 400);
  }
});

export default app;
