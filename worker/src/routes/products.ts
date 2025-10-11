import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, like } from 'drizzle-orm';
import { products, locations } from '../../../db/schema';
import { verifyToken } from '../utils/jwt';

const productsRouter = new Hono();

// Middleware d'authentification
productsRouter.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Non autorisé' }, 401);
  }
  const token = authHeader.substring(7);
  const payload = await verifyToken(token, c.env.JWT_SECRET);
  if (!payload) {
    return c.json({ error: 'Token invalide' }, 401);
  }
  c.set('userId', payload.userId);
  c.set('organizationId', payload.organizationId);
  await next();
});

// GET /api/products - Liste des produits
productsRouter.get('/', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const search = c.req.query('search');
    
    const db = drizzle(c.env.DB);
    
    let query = db
      .select()
      .from(products)
      .where(eq(products.organizationId, organizationId));
    
    // Recherche si paramètre fourni
    if (search) {
      query = db
        .select()
        .from(products)
        .where(
          and(
            eq(products.organizationId, organizationId),
            like(products.name, `%${search}%`)
          )
        );
    }
    
    const result = await query.all();
    
    return c.json(result, 200);
  } catch (error) {
    console.error('Erreur GET /api/products:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/products/:id - Détails d'un produit
productsRouter.get('/:id', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const productId = parseInt(c.req.param('id'));
    
    const db = drizzle(c.env.DB);
    const product = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.organizationId, organizationId)
        )
      )
      .get();
    
    if (!product) {
      return c.json({ error: 'Produit non trouvé' }, 404);
    }
    
    return c.json(product, 200);
  } catch (error) {
    console.error('Erreur GET /api/products/:id:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/products - Créer un produit
productsRouter.post('/', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const body = await c.req.json();
    
    const { sku, name, description, category, unitPrice, reorderPoint, imageUrl } = body;
    
    // Validation
    if (!sku || !name) {
      return c.json({ error: 'SKU et nom sont requis' }, 400);
    }
    
    const db = drizzle(c.env.DB);
    
    // Vérifier si le SKU existe déjà
    const existing = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.sku, sku),
          eq(products.organizationId, organizationId)
        )
      )
      .get();
    
    if (existing) {
      return c.json({ error: 'Un produit avec ce SKU existe déjà' }, 400);
    }
    
    // Créer le produit
    const result = await db
      .insert(products)
      .values({
        organizationId,
        sku,
        name,
        description: description || null,
        category: category || null,
        unitPrice: unitPrice ? parseInt(unitPrice) : null,
        reorderPoint: reorderPoint ? parseInt(reorderPoint) : 10,
        imageUrl: imageUrl || null,
      })
      .returning()
      .get();
    
    return c.json(result, 201);
  } catch (error) {
    console.error('Erreur POST /api/products:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// PUT /api/products/:id - Modifier un produit
productsRouter.put('/:id', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const productId = parseInt(c.req.param('id'));
    const body = await c.req.json();
    
    const { sku, name, description, category, unitPrice, reorderPoint, imageUrl } = body;
    
    const db = drizzle(c.env.DB);
    
    // Vérifier que le produit existe et appartient à l'organisation
    const existing = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.organizationId, organizationId)
        )
      )
      .get();
    
    if (!existing) {
      return c.json({ error: 'Produit non trouvé' }, 404);
    }
    
    // Mettre à jour
    const result = await db
      .update(products)
      .set({
        sku: sku || existing.sku,
        name: name || existing.name,
        description: description !== undefined ? description : existing.description,
        category: category !== undefined ? category : existing.category,
        unitPrice: unitPrice !== undefined ? parseInt(unitPrice) : existing.unitPrice,
        reorderPoint: reorderPoint !== undefined ? parseInt(reorderPoint) : existing.reorderPoint,
        imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
      })
      .where(eq(products.id, productId))
      .returning()
      .get();
    
    return c.json(result, 200);
  } catch (error) {
    console.error('Erreur PUT /api/products/:id:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// DELETE /api/products/:id - Supprimer un produit
productsRouter.delete('/:id', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const productId = parseInt(c.req.param('id'));
    
    const db = drizzle(c.env.DB);
    
    // Vérifier que le produit existe
    const existing = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.organizationId, organizationId)
        )
      )
      .get();
    
    if (!existing) {
      return c.json({ error: 'Produit non trouvé' }, 404);
    }
    
    // Supprimer
    await db
      .delete(products)
      .where(eq(products.id, productId))
      .run();
    
    return c.json({ message: 'Produit supprimé avec succès' }, 200);
  } catch (error) {
    console.error('Erreur DELETE /api/products/:id:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/products/import-csv - Import CSV
productsRouter.post('/import-csv', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const body = await c.req.json();
    
    const { products: productsData } = body;
    
    if (!productsData || !Array.isArray(productsData)) {
      return c.json({ error: 'Données invalides' }, 400);
    }
    
    const db = drizzle(c.env.DB);
    const results = { created: 0, failed: 0, errors: [] as string[] };
    
    for (const product of productsData) {
      try {
        // Vérifier si le SKU existe déjà
        const existing = await db
          .select()
          .from(products)
          .where(
            and(
              eq(products.sku, product.sku),
              eq(products.organizationId, organizationId)
            )
          )
          .get();
        
        if (existing) {
          results.failed++;
          results.errors.push(`SKU ${product.sku} existe déjà`);
          continue;
        }
        
        // Créer le produit
        await db
          .insert(products)
          .values({
            organizationId,
            sku: product.sku,
            name: product.name,
            description: product.description || null,
            category: product.category || null,
            unitPrice: product.unitPrice ? parseInt(product.unitPrice) : null,
            reorderPoint: product.reorderPoint ? parseInt(product.reorderPoint) : 10,
            imageUrl: null,
          })
          .run();
        
        results.created++;
      } catch (err) {
        results.failed++;
        results.errors.push(`Erreur pour ${product.sku}: ${err}`);
      }
    }
    
    return c.json(results, 200);
  } catch (error) {
    console.error('Erreur POST /api/products/import-csv:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default productsRouter;
