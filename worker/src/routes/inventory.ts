import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import { inventory, stockMovements, products, locations } from '../../../db/schema';

const app = new Hono<{
  Bindings: {
    DB: D1Database;
  };
}>();

// GET /api/inventory - Vue globale du stock
app.get('/', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    
    // Pour l'instant, retourner une liste vide car pas de stock
    const items = await db
      .select()
      .from(inventory)
      .all();
    
    return c.json({ items: items || [] });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return c.json({ error: 'Failed to fetch inventory' }, 500);
  }
});

// POST /api/inventory/receive - Réception de marchandise
app.post('/receive', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    
    // Vérifier si le stock existe déjà pour ce produit/emplacement
    const existingInventory = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.product_id, body.productId),
          eq(inventory.location_id, body.locationId)
        )
      )
      .get();
    
    if (existingInventory) {
      // Mettre à jour le stock existant
      await db
        .update(inventory)
        .set({
          quantity_on_hand: existingInventory.quantity_on_hand + body.quantity,
          quantity_available: existingInventory.quantity_available + body.quantity,
          last_movement_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where(eq(inventory.id, existingInventory.id));
    } else {
      // Créer un nouveau stock
      await db.insert(inventory).values({
        organization_id: 1,
        product_id: body.productId,
        location_id: body.locationId,
        quantity_on_hand: body.quantity,
        quantity_available: body.quantity,
        quantity_reserved: 0,
        lot_number: body.lotNumber || null,
        status: 'available',
        received_date: new Date().toISOString(),
        last_movement_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Enregistrer le mouvement
    await db.insert(stockMovements).values({
      organization_id: 1,
      type: 'RECEIVE',
      product_id: body.productId,
      from_location_id: null,
      to_location_id: body.locationId,
      quantity: body.quantity,
      lot_number: body.lotNumber || null,
      user_id: 1,
      reason: body.reason || 'Réception marchandise',
      reference: body.reference || body.poNumber || null,
      created_at: new Date().toISOString()
    });
    
    return c.json({ 
      message: 'Stock received successfully',
      quantity: body.quantity 
    });
  } catch (error) {
    console.error('Error receiving stock:', error);
    return c.json({ error: 'Failed to receive stock', details: error.message }, 500);
  }
});

// POST /api/inventory/move - Déplacement de stock
app.post('/move', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    
    // Récupérer le stock source
    const sourceInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, body.fromInventoryId))
      .get();
    
    if (!sourceInventory || sourceInventory.quantity_available < body.quantity) {
      return c.json({ error: 'Insufficient stock' }, 400);
    }
    
    // Mettre à jour le stock source
    await db
      .update(inventory)
      .set({
        quantity_on_hand: sourceInventory.quantity_on_hand - body.quantity,
        quantity_available: sourceInventory.quantity_available - body.quantity,
        last_movement_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .where(eq(inventory.id, body.fromInventoryId));
    
    // Vérifier/créer le stock destination
    const destInventory = await db
      .select()
      .from(inventory)
      .where(
        and(
          eq(inventory.product_id, sourceInventory.product_id),
          eq(inventory.location_id, body.toLocationId)
        )
      )
      .get();
    
    if (destInventory) {
      await db
        .update(inventory)
        .set({
          quantity_on_hand: destInventory.quantity_on_hand + body.quantity,
          quantity_available: destInventory.quantity_available + body.quantity,
          last_movement_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .where(eq(inventory.id, destInventory.id));
    } else {
      await db.insert(inventory).values({
        organization_id: 1,
        product_id: sourceInventory.product_id,
        location_id: body.toLocationId,
        quantity_on_hand: body.quantity,
        quantity_available: body.quantity,
        quantity_reserved: 0,
        status: 'available',
        lot_number: sourceInventory.lot_number,
        last_movement_date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    // Enregistrer le mouvement
    await db.insert(stockMovements).values({
      organization_id: 1,
      type: 'MOVE',
      product_id: sourceInventory.product_id,
      from_location_id: sourceInventory.location_id,
      to_location_id: body.toLocationId,
      quantity: body.quantity,
      user_id: 1,
      reason: body.reason || 'Transfert de stock',
      created_at: new Date().toISOString()
    });
    
    return c.json({ message: 'Stock moved successfully' });
  } catch (error) {
    console.error('Error moving stock:', error);
    return c.json({ error: 'Failed to move stock' }, 500);
  }
});

// POST /api/inventory/adjust - Ajustement de stock
app.post('/adjust', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    const body = await c.req.json();
    
    const inv = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, body.inventoryId))
      .get();
    
    if (!inv) {
      return c.json({ error: 'Inventory not found' }, 404);
    }
    
    const difference = body.newQuantity - inv.quantity_on_hand;
    
    // Mettre à jour le stock
    await db
      .update(inventory)
      .set({
        quantity_on_hand: body.newQuantity,
        quantity_available: body.newQuantity - inv.quantity_reserved,
        last_count_date: new Date().toISOString(),
        last_movement_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .where(eq(inventory.id, body.inventoryId));
    
    // Enregistrer le mouvement
    await db.insert(stockMovements).values({
      organization_id: 1,
      type: 'ADJUST',
      product_id: inv.product_id,
      from_location_id: inv.location_id,
      to_location_id: inv.location_id,
      quantity: Math.abs(difference),
      quantity_before: inv.quantity_on_hand,
      quantity_after: body.newQuantity,
      user_id: 1,
      reason: body.reason || 'Ajustement inventaire',
      notes: body.notes || null,
      created_at: new Date().toISOString()
    });
    
    return c.json({ 
      message: 'Stock adjusted successfully',
      difference: difference
    });
  } catch (error) {
    console.error('Error adjusting stock:', error);
    return c.json({ error: 'Failed to adjust stock' }, 500);
  }
});

// GET /api/inventory/movements - Historique des mouvements
app.get('/movements', async (c) => {
  try {
    const db = drizzle(c.env.DB);
    
    const movements = await db
      .select()
      .from(stockMovements)
      .orderBy(sql`${stockMovements.created_at} DESC`)
      .limit(50)
      .all();
    
    return c.json({ movements: movements || [] });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return c.json({ error: 'Failed to fetch movements' }, 500);
  }
});

export default app;
