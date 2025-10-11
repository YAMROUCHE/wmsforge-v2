import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { users, locations, products } from '../../../db/schema';
import { verifyToken } from '../utils/jwt';

const onboardingRouter = new Hono();

// Middleware d'authentification
onboardingRouter.use('/*', async (c, next) => {
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

// POST /api/onboarding/complete - Compléter l'onboarding
onboardingRouter.post('/complete', async (c) => {
  try {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');
    const body = await c.req.json();
    
    const { warehouseName, product } = body;
    
    const db = drizzle(c.env.DB);
    
    // 1. Créer la zone d'entrepôt si fournie
    if (warehouseName) {
      // Générer un code unique pour l'entrepôt
      const warehouseCode = 'WH-' + Date.now().toString().slice(-6);
      
      await db
        .insert(locations)
        .values({
          organizationId,
          code: warehouseCode,
          name: warehouseName,
          type: 'zone',
          parentId: null,
          capacity: null,
        })
        .run();
    }
    
    // 2. Créer le produit si fourni
    if (product && product.sku && product.name) {
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
    }
    
    // 3. Marquer l'onboarding comme terminé
    await db
      .update(users)
      .set({ onboardingCompleted: 1 })
      .where(eq(users.id, userId))
      .run();
    
    return c.json({ message: 'Onboarding terminé avec succès' }, 200);
  } catch (error) {
    console.error('Erreur POST /api/onboarding/complete:', error);
    return c.json({ error: 'Erreur serveur' }, 500);
  }
});

export default onboardingRouter;
