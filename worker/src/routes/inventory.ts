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
    const userId = c.get('userId');
    const body = await c.req.json();
    const { productId, locationId, quantity, type, notes } = body;

    // Validation des champs obligatoires
    if (!productId || !locationId || quantity === undefined || !type) {
      return c.json({ error: 'Champs manquants' }, 400);
    }

    // Validation du type
    if (!['in', 'out', 'adjustment'].includes(type)) {
      return c.json({ error: 'Type invalide. Doit être: in, out ou adjustment' }, 400);
    }

    // Validation de la quantité
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) {
      return c.json({ error: 'La quantité doit être un nombre positif' }, 400);
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

    let newQuantity = 0;

    // 🔥 CORRECTION PRINCIPALE : Gérer correctement chaque type d'opération
    if (existingInventory) {
      const currentQuantity = existingInventory.quantity;

      switch (type) {
        case 'in':
          // Entrée : AJOUTER la quantité
          newQuantity = currentQuantity + qty;
          break;
        case 'out':
          // Sortie : SOUSTRAIRE la quantité
          newQuantity = currentQuantity - qty;
          // Empêcher le stock négatif
          if (newQuantity < 0) {
            return c.json({ 
              error: `Stock insuffisant. Stock actuel: ${currentQuantity}, sortie demandée: ${qty}` 
            }, 400);
          }
          break;
        case 'adjustment':
          // Ajustement : REMPLACER par la nouvelle quantité
          newQuantity = qty;
          break;
      }

      // Mettre à jour l'inventaire existant
      await db
        .update(inventory)
        .set({
          quantity: newQuantity,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(inventory.id, existingInventory.id))
        .run();
    } else {
      // Pas d'inventaire existant
      if (type === 'out') {
        return c.json({ 
          error: 'Impossible de faire une sortie : aucun stock existant' 
        }, 400);
      }

      // Pour 'in' et 'adjustment', créer un nouvel enregistrement
      newQuantity = qty;
      
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

    // Enregistrer le mouvement de stock
    await db
      .insert(stockMovements)
      .values({
        organizationId,
        productId,
        locationId,
        userId,
        type,
        quantity: qty,
        notes: notes || null,
      })
      .run();

    return c.json({ 
      message: 'Stock ajusté avec succès', 
      newQuantity,
      type,
      quantityChanged: qty
    }, 200);
  } catch (error) {
    console.error('Erreur POST /api/inventory/adjust:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

// GET /api/inventory/movements/list - Historique des mouvements
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
    console.error('Erreur GET /api/inventory/movements/list:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default inventoryRouter;
