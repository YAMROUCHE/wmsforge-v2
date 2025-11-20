import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, like, desc, asc, sql } from 'drizzle-orm';
import { products } from '../../../db/schema';
import { authMiddleware, optionalAuthMiddleware, getAuthUser } from '../middleware/auth';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// Apply auth middleware to all routes
app.use('/*', authMiddleware);

// GET /api/products - Liste des produits
app.get('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);
    
    // Filter by organization
    const items = await db
      .select()
      .from(products)
      .where(eq(products.organizationId, organizationId))
      .all();
    
    return c.json({
      items: items || [],
      pagination: {
        page: 1,
        limit: 20,
        total: items.length,
        totalPages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return c.json({ error: 'Failed to fetch products' }, 500);
  }
});

// POST /api/products - Créer un produit
app.post('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);
    const body = await c.req.json();
    
    // Calculer le volume si dimensions fournies
    let volume = undefined;
    if (body.length && body.width && body.height) {
      volume = (body.length * body.width * body.height) / 1000000;
    }
    
    const newProduct = {
      organizationId, // Use authenticated user's organization
      sku: body.sku,
      name: body.name,
      description: body.description || null,
      category: body.category || null,
      price: body.price || null,
      cost: body.cost || null,
      weight: body.weight || null,
      length: body.length || null,
      width: body.width || null,
      height: body.height || null,
      volume: volume || null,
      abcClass: body.abcClass || 'C',
      velocityScore: body.abcClass === 'A' ? 80 : body.abcClass === 'B' ? 50 : 20,
      minStock: body.minStock || 0,
      maxStock: body.maxStock || null,
      reorderPoint: body.reorderPoint || null,
      safetyStock: body.safetyStock || 0,
      fragile: body.fragile ? 1 : 0,
      stackable: body.stackable !== false ? 1 : 0,
      status: body.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    const result = await db.insert(products).values(newProduct).returning();
    
    return c.json({
      message: 'Product created successfully',
      product: result[0]
    }, 201);
  } catch (error) {
    console.error('Error creating product:', error);
    return c.json({
      error: 'Failed to create product',
      details: (error as Error).message
    }, 500);
  }
});

// GET /api/products/:id - Détail d'un produit
app.get('/:id', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);
    const id = parseInt(c.req.param('id'));
    
    const product = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, id),
        eq(products.organizationId, organizationId) // Security: only show products from user's org
      ))
      .get();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    return c.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return c.json({ error: 'Failed to fetch product' }, 500);
  }
});

// PUT /api/products/:id - Modifier un produit
app.put('/:id', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    // Vérifier que le produit existe et appartient à l'organization
    const existing = await db
      .select()
      .from(products)
      .where(and(
        eq(products.id, id),
        eq(products.organizationId, organizationId)
      ))
      .get();
    
    if (!existing) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // Calculer le volume si nécessaire
    const existingAny = existing as any;
    let volume = existingAny.volume;
    if (body.length || body.width || body.height) {
      const l = body.length || existingAny.length;
      const w = body.width || existingAny.width;
      const h = body.height || existingAny.height;
      if (l && w && h) {
        volume = (l * w * h) / 1000000;
      }
    }

    const updatedProduct = {
      ...body,
      volume,
      fragile: body.fragile !== undefined ? (body.fragile ? 1 : 0) : existingAny.fragile,
      stackable: body.stackable !== undefined ? (body.stackable ? 1 : 0) : existingAny.stackable,
      updatedAt: new Date().toISOString(),
    };
    
    await db
      .update(products)
      .set(updatedProduct)
      .where(and(
        eq(products.id, id),
        eq(products.organizationId, organizationId)
      ));
    
    return c.json({
      message: 'Product updated successfully',
      product: { ...existing, ...updatedProduct }
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return c.json({ error: 'Failed to update product' }, 500);
  }
});

// DELETE /api/products/:id - Supprimer (soft delete)
app.delete('/:id', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);
    const id = parseInt(c.req.param('id'));
    
    // Note: Since schema doesn't have status field, we just delete the record
    await db
      .delete(products)
      .where(and(
        eq(products.id, id),
        eq(products.organizationId, organizationId)
      ));
    
    return c.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return c.json({ error: 'Failed to delete product' }, 500);
  }
});

export default app;
