import { Hono } from 'hono';

const onboardingRouter = new Hono<{ Bindings: { DB: D1Database } }>();

// Templates d'entrepôt prédéfinis
const WAREHOUSE_TEMPLATES = {
  small: {
    name: 'Petit entrepôt',
    area: 500,
    zones: [
      { code: 'RCV', name: 'Réception', type: 'zone' },
      { code: 'STG', name: 'Stockage', type: 'zone' },
      { code: 'SHP', name: 'Expédition', type: 'zone' },
    ],
    locations: 100,
  },
  medium: {
    name: 'Entrepôt moyen',
    area: 2000,
    zones: [
      { code: 'RCV', name: 'Réception', type: 'zone' },
      { code: 'STG-A', name: 'Stockage A', type: 'zone' },
      { code: 'STG-B', name: 'Stockage B', type: 'zone' },
      { code: 'PCK', name: 'Picking', type: 'zone' },
      { code: 'SHP', name: 'Expédition', type: 'zone' },
    ],
    locations: 500,
  },
  large: {
    name: 'Grand entrepôt',
    area: 5000,
    zones: [
      { code: 'RCV-1', name: 'Réception 1', type: 'zone' },
      { code: 'RCV-2', name: 'Réception 2', type: 'zone' },
      { code: 'STG-A', name: 'Stockage Zone A', type: 'zone' },
      { code: 'STG-B', name: 'Stockage Zone B', type: 'zone' },
      { code: 'STG-C', name: 'Stockage Zone C', type: 'zone' },
      { code: 'PCK', name: 'Zone Picking', type: 'zone' },
      { code: 'SHP-1', name: 'Expédition 1', type: 'zone' },
      { code: 'SHP-2', name: 'Expédition 2', type: 'zone' },
    ],
    locations: 2000,
  },
};

// Helper: Créer les zones d'entrepôt
async function createWarehouseZones(db: D1Database, organizationId: number, zones: Array<{code: string, name: string, type: string}>) {
  for (const zone of zones) {
    await db.prepare(`
      INSERT INTO locations (organization_id, code, name, type, parent_id, capacity)
      VALUES (?, ?, ?, ?, NULL, NULL)
    `).bind(organizationId, zone.code, zone.name, zone.type).run();
  }
}

// Helper: Créer les emplacements de stockage
async function createStorageLocations(db: D1Database, organizationId: number, maxLocations: number) {
  const storageZone = await db.prepare(`
    SELECT id FROM locations
    WHERE organization_id = ? AND code LIKE 'STG%'
    LIMIT 1
  `).bind(organizationId).first();

  if (!storageZone) return null;

  const locationsToCreate = Math.min(maxLocations, 50);
  for (let i = 1; i <= locationsToCreate; i++) {
    const aisle = String.fromCharCode(65 + Math.floor((i - 1) / 10));
    const position = ((i - 1) % 10) + 1;
    const level = Math.floor(Math.random() * 4) + 1;
    const code = `${aisle}${position.toString().padStart(2, '0')}-${level}`;

    await db.prepare(`
      INSERT INTO locations (organization_id, code, name, type, parent_id, capacity)
      VALUES (?, ?, ?, 'location', ?, 1)
    `).bind(organizationId, code, `Emplacement ${code}`, storageZone.id).run();
  }

  return storageZone.id;
}

// Helper: Créer un produit de démo
async function createDemoProduct(db: D1Database, organizationId: number, product: any) {
  if (!product || !product.name) return null;

  const sku = product.sku || `PROD-${Date.now().toString().slice(-6)}`;
  await db.prepare(`
    INSERT INTO products (organization_id, sku, name, description, category, unit_price, reorder_point)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    organizationId,
    sku,
    product.name,
    product.description || `Produit de démonstration`,
    product.category || 'Général',
    product.price || 0,
    product.reorderPoint || 10
  ).run();

  return sku;
}

// Helper: Ajouter du stock initial
async function addInitialStock(db: D1Database, organizationId: number, storageZoneId: number, sku: string, quantity: number) {
  const firstLocation = await db.prepare(`
    SELECT id FROM locations
    WHERE organization_id = ? AND type = 'location' AND parent_id = ?
    LIMIT 1
  `).bind(organizationId, storageZoneId).first();

  if (!firstLocation) return;

  const productResult = await db.prepare(`
    SELECT id FROM products WHERE organization_id = ? AND sku = ?
  `).bind(organizationId, sku).first();

  if (!productResult) return;

  await db.prepare(`
    INSERT INTO inventory (organization_id, product_id, location_id, quantity)
    VALUES (?, ?, ?, ?)
  `).bind(organizationId, productResult.id, firstLocation.id, quantity).run();
}

// POST /api/onboarding/complete - Compléter l'onboarding avec template
onboardingRouter.post('/complete', async (c) => {
  try {
    const body = await c.req.json();
    const { template, companyName, product } = body;
    const organizationId = 1;

    const warehouseTemplate = WAREHOUSE_TEMPLATES[template as keyof typeof WAREHOUSE_TEMPLATES] || WAREHOUSE_TEMPLATES.medium;

    await createWarehouseZones(c.env.DB, organizationId, warehouseTemplate.zones);

    const storageZoneId = await createStorageLocations(c.env.DB, organizationId, warehouseTemplate.locations);

    const sku = await createDemoProduct(c.env.DB, organizationId, product);

    if (sku && storageZoneId) {
      const quantity = Number(product?.quantity) || 100;
      // @ts-ignore - TypeScript inference issue with Number()
      await addInitialStock(c.env.DB, organizationId, storageZoneId, sku, quantity);
    }

    return c.json({
      message: 'Onboarding terminé avec succès',
      data: {
        zones: warehouseTemplate.zones.length,
        locations: warehouseTemplate.locations,
        template: template,
      }
    }, 200);
  } catch (error) {
    console.error('Erreur POST /api/onboarding/complete:', error);
    return c.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default onboardingRouter;
