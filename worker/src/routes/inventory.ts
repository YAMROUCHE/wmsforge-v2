import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import { inventory, products, locations, stockMovements } from '../../../db/schema';
import { verifyToken } from '../utils/jwt';

const inventoryRouter = new Hono();

// Middleware d'authentification
inventoryRouter.use('/*', async (c, next) => {
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

// GET /api/inventory - Liste du stock par produit
inventoryRouter.get('/', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const db = drizzle(c.env.DB);

    const result = await db
      .select({
        productId: products.id,
        sku: products.sku,
        name: products.name,
        category: products.category,
        reorderPoint: products.reorderPoint,
        totalQuantity: sql<number>`COALESCE(SUM(${inventory.quantity}), 0)`,
      })
      .from(products)
      .leftJoin(inventory, eq(products.id, inventory.productId))
      .where(eq(products.organizationId, organizationId))
      .groupBy(products.id)
      .all();

    return c.json(result, 200);
  } catch (error) {
    console.error('Erreur GET /api/inventory:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/inventory/:productId - Détails du stock d'un produit par emplacement
inventoryRouter.get('/:productId', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const productId = parseInt(c.req.param('productId'));
    const db = drizzle(c.env.DB);

    const result = await db
      .select({
        id: inventory.id,
        productId: inventory.productId,
        locationId: inventory.locationId,
        locationName: locations.name,
        locationCode: locations.code,
        quantity: inventory.quantity,
        updatedAt: inventory.updatedAt,
      })
      .from(inventory)
      .innerJoin(locations, eq(inventory.locationId, locations.id))
      .where(eq(inventory.productId, productId))
      .all();

    return c.json(result, 200);
  } catch (error) {
    console.error('Erreur GET /api/inventory/:productId:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// POST /api/inventory/adjust - Ajuster le stock
inventoryRouter.post('/adjust', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const userId = c.get('userId'); // 🔥 AJOUT DU userId
    const body = await c.req.json();
    const { productId, locationId, quantity, type, notes } = body;

    if (!productId || !locationId || quantity === undefined || !type) {
      return c.json({ error: 'Champs manquants' }, 400);
    }

    const db = drizzle(c.env.DB);

    // Vérifier si l'inventaire existe déjà
    const existingInventory = await db
      .select()
      .from(inventory)
      .where(
        sql`${inventory.productId} = ${productId} AND ${inventory.locationId} = ${locationId}`
      )
      .get();

    let newQuantity;
    if (existingInventory) {
      // Mettre à jour la quantité
      newQuantity = existingInventory.quantity + parseInt(quantity);
      
      await db
        .update(inventory)
        .set({
          quantity: newQuantity,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(inventory.id, existingInventory.id))
        .run();
    } else {
      // Créer un nouvel enregistrement d'inventaire
      newQuantity = parseInt(quantity);
      
      await db
        .insert(inventory)
        .values({
          organizationId,
          productId,
          locationId,
          quantity: newQuantity,
        })
        .run();
    }

    // Enregistrer le mouvement de stock avec userId 🔥
    await db
      .insert(stockMovements)
      .values({
        organizationId,
        productId,
        locationId,
        userId, // 🔥 AJOUT ICI
        type,
        quantity: parseInt(quantity),
        notes: notes || null,
      })
      .run();

    return c.json({ message: 'Stock ajusté avec succès', newQuantity }, 200);
  } catch (error) {
    console.error('Erreur POST /api/inventory/adjust:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/stock-movements - Historique des mouvements
inventoryRouter.get('/movements/list', async (c) => {
  try {
    const organizationId = c.get('organizationId');
    const db = drizzle(c.env.DB);

    const result = await db
      .select({
        id: stockMovements.id,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
        notes: stockMovements.notes,
        createdAt: stockMovements.createdAt,
        productSku: products.sku,
        productName: products.name,
        locationName: locations.name,
      })
      .from(stockMovements)
      .innerJoin(products, eq(stockMovements.productId, products.id))
      .leftJoin(locations, eq(stockMovements.locationId, locations.id))
      .where(eq(stockMovements.organizationId, organizationId))
      .orderBy(sql`${stockMovements.createdAt} DESC`)
      .limit(50)
      .all();

    return c.json(result, 200);
  } catch (error) {
    console.error('Erreur GET /api/stock-movements:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default inventoryRouter;
