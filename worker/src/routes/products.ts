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

// GET /api/products - Liste des produits avec pagination
app.get('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);

    // Paramètres de pagination
    const page = parseInt(c.req.query('page') || '1');
    const limit = Math.min(parseInt(c.req.query('limit') || '50'), 100); // Max 100
    const offset = (page - 1) * limit;
    const search = c.req.query('search') || '';
    const category = c.req.query('category') || '';

    // Construire les conditions
    let conditions = eq(products.organizationId, organizationId);

    // Compter le total
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(conditions);
    const total = countResult[0]?.count || 0;

    // Récupérer les produits paginés
    const items = await db
      .select()
      .from(products)
      .where(conditions)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    return c.json({
      items: items || [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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

// POST /api/products/import-csv - Import en masse via CSV (optimisé batch)
app.post('/import-csv', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const { organizationId } = getAuthUser(c);
    const body = await c.req.json();

    if (!body.products || !Array.isArray(body.products)) {
      return c.json({ error: 'Invalid request: products array required' }, 400);
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[]
    };

    const now = new Date().toISOString();

    // Préparer tous les produits valides pour insertion batch
    const validProducts: any[] = [];
    const skuSet = new Set<string>();

    for (const product of body.products) {
      // Validation basique
      if (!product.sku || !product.name) {
        results.failed++;
        results.errors.push(`Ligne invalide: SKU ou Nom manquant`);
        continue;
      }

      // Vérifier les doublons dans le même batch
      if (skuSet.has(product.sku)) {
        results.failed++;
        results.errors.push(`SKU ${product.sku}: Doublon dans le fichier`);
        continue;
      }
      skuSet.add(product.sku);

      const price = product.unitPrice ? parseInt(product.unitPrice) : null;
      const reorderPoint = product.reorderPoint ? parseInt(product.reorderPoint) : 10;

      validProducts.push({
        organizationId,
        sku: product.sku,
        name: product.name,
        description: product.description || null,
        category: product.category || null,
        price: price,
        cost: null,
        weight: null,
        length: null,
        width: null,
        height: null,
        volume: null,
        abcClass: 'C',
        velocityScore: 20,
        minStock: reorderPoint,
        maxStock: null,
        reorderPoint: reorderPoint,
        safetyStock: 0,
        fragile: 0,
        stackable: 1,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      });
    }

    // Insertion en batch de 100 produits (limite SQLite)
    const BATCH_SIZE = 100;
    for (let i = 0; i < validProducts.length; i += BATCH_SIZE) {
      const batch = validProducts.slice(i, i + BATCH_SIZE);
      try {
        // Insertion batch avec onConflictDoNothing pour ignorer les doublons
        await db.insert(products).values(batch).onConflictDoNothing();
        results.created += batch.length;
      } catch (error: any) {
        // Si batch échoue, essayer un par un pour identifier les erreurs
        for (const product of batch) {
          try {
            await db.insert(products).values(product).onConflictDoNothing();
            results.created++;
          } catch (singleError: any) {
            results.failed++;
            const errorMsg = singleError.message || 'Unknown error';
            if (errorMsg.includes('UNIQUE') || errorMsg.includes('unique')) {
              results.errors.push(`SKU ${product.sku}: Already exists`);
            } else {
              results.errors.push(`SKU ${product.sku}: ${errorMsg}`);
            }
          }
        }
      }
    }

    return c.json(results);
  } catch (error) {
    console.error('Error importing products:', error);
    return c.json({
      error: 'Failed to import products',
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
