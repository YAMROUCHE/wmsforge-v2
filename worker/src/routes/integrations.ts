/**
 * Routes API pour les intégrations
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { ShopifyService } from '../integrations/shopify/ShopifyService';
import { WooCommerceService } from '../integrations/woocommerce/WooCommerceService';
import { SalesforceService } from '../integrations/salesforce/SalesforceService';
import type { Integration } from '../integrations/base/IntegrationService';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS pour le frontend
app.use('/*', cors());

/**
 * GET /api/integrations
 * Liste toutes les intégrations
 */
app.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      `SELECT id, name, type, status, last_sync_at, last_error, created_at
       FROM integrations
       ORDER BY created_at DESC`
    ).all();

    return c.json({
      integrations: result.results,
      count: result.results.length
    });
  } catch (error) {
    console.error('Error fetching integrations:', error);
    return c.json({ error: 'Failed to fetch integrations' }, 500);
  }
});

/**
 * GET /api/integrations/:id
 * Détails d'une intégration
 */
app.get('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    const integration = await c.env.DB.prepare(
      `SELECT * FROM integrations WHERE id = ?`
    ).bind(id).first();

    if (!integration) {
      return c.json({ error: 'Integration not found' }, 404);
    }

    return c.json({ integration });
  } catch (error) {
    return c.json({ error: 'Failed to fetch integration' }, 500);
  }
});

/**
 * POST /api/integrations/shopify/setup
 * Configure une nouvelle intégration Shopify
 */
app.post('/shopify/setup', async (c) => {
  try {
    const body = await c.req.json();
    const { shop_domain, access_token } = body;

    if (!shop_domain || !access_token) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Générer un webhook secret
    const webhook_secret = crypto.randomUUID();

    // Créer l'intégration
    const result = await c.env.DB.prepare(
      `INSERT INTO integrations (name, type, status, config, webhook_secret, sync_settings)
       VALUES ('Shopify', 'ecommerce', 'pending', ?, ?, ?)`
    ).bind(
      JSON.stringify({
        shop_domain,
        access_token,
        api_version: '2024-01'
      }),
      webhook_secret,
      JSON.stringify({
        direction: 'one-way',
        entities: ['orders', 'products'],
        frequency: 'realtime'
      })
    ).run();

    const integrationId = result.meta.last_row_id;

    // Récupérer l'intégration créée
    const integration = await c.env.DB.prepare(
      `SELECT * FROM integrations WHERE id = ?`
    ).bind(integrationId).first() as Integration;

    // Tester la connexion
    const shopifyService = new ShopifyService(c.env.DB, integration);
    await shopifyService.authenticate();

    // Enregistrer les webhooks sur Shopify
    await registerShopifyWebhooks(shop_domain, access_token, webhook_secret);

    // Lancer un premier sync
    const syncResult = await shopifyService.syncOrders();

    return c.json({
      integration: {
        id: integrationId,
        name: 'Shopify',
        type: 'ecommerce',
        status: 'active',
        webhook_url: `${c.req.url.split('/api')[0]}/api/webhooks/shopify/${integrationId}`
      },
      sync: syncResult
    }, 201);
  } catch (error) {
    console.error('Shopify setup error:', error);
    return c.json({
      error: 'Failed to setup Shopify integration',
      details: (error as Error).message
    }, 500);
  }
});

/**
 * POST /api/integrations/woocommerce/setup
 * Configure une nouvelle intégration WooCommerce
 */
app.post('/woocommerce/setup', async (c) => {
  try {
    const body = await c.req.json();
    const { store_url, consumer_key, consumer_secret } = body;

    if (!store_url || !consumer_key || !consumer_secret) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Générer un webhook secret
    const webhook_secret = crypto.randomUUID();

    // Créer l'intégration
    const result = await c.env.DB.prepare(
      `INSERT INTO integrations (name, type, status, config, webhook_secret, sync_settings)
       VALUES ('WooCommerce', 'ecommerce', 'pending', ?, ?, ?)`
    ).bind(
      JSON.stringify({
        store_url,
        consumer_key,
        consumer_secret
      }),
      webhook_secret,
      JSON.stringify({
        direction: 'one-way',
        entities: ['orders', 'products'],
        frequency: 'realtime'
      })
    ).run();

    const integrationId = result.meta.last_row_id;

    // Récupérer l'intégration créée
    const integration = await c.env.DB.prepare(
      `SELECT * FROM integrations WHERE id = ?`
    ).bind(integrationId).first() as Integration;

    // Tester la connexion
    const wooService = new WooCommerceService(c.env.DB, integration);
    await wooService.authenticate();

    // Lancer un premier sync
    const syncResult = await wooService.syncOrders();

    return c.json({
      integration: {
        id: integrationId,
        name: 'WooCommerce',
        type: 'ecommerce',
        status: 'active',
        webhook_url: `${c.req.url.split('/api')[0]}/api/webhooks/woocommerce/${integrationId}`
      },
      sync: syncResult
    }, 201);
  } catch (error) {
    console.error('WooCommerce setup error:', error);
    return c.json({
      error: 'Failed to setup WooCommerce integration',
      details: (error as Error).message
    }, 500);
  }
});

/**
 * POST /api/integrations/salesforce/setup
 * Configure une nouvelle intégration Salesforce
 */
app.post('/salesforce/setup', async (c) => {
  try {
    const body = await c.req.json();
    const { instance_url, access_token, refresh_token, client_id, client_secret } = body;

    if (!instance_url || !access_token) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Créer l'intégration
    const result = await c.env.DB.prepare(
      `INSERT INTO integrations (name, type, status, config, sync_settings)
       VALUES ('Salesforce', 'crm', 'pending', ?, ?)`
    ).bind(
      JSON.stringify({
        instance_url,
        access_token,
        refresh_token,
        client_id,
        client_secret
      }),
      JSON.stringify({
        direction: 'bidirectional',
        entities: ['accounts', 'opportunities', 'contacts'],
        frequency: 'scheduled'
      })
    ).run();

    const integrationId = result.meta.last_row_id;

    // Récupérer l'intégration créée
    const integration = await c.env.DB.prepare(
      `SELECT * FROM integrations WHERE id = ?`
    ).bind(integrationId).first() as Integration;

    // Tester la connexion
    const sfService = new SalesforceService(c.env.DB, integration);
    await sfService.authenticate();

    // Lancer un premier sync des Opportunities
    const syncResult = await sfService.syncOrders();

    return c.json({
      integration: {
        id: integrationId,
        name: 'Salesforce',
        type: 'crm',
        status: 'active'
      },
      sync: syncResult
    }, 201);
  } catch (error) {
    console.error('Salesforce setup error:', error);
    return c.json({
      error: 'Failed to setup Salesforce integration',
      details: (error as Error).message
    }, 500);
  }
});

/**
 * POST /api/integrations/:id/sync
 * Déclencher une synchronisation manuelle
 */
app.post('/:id/sync', async (c) => {
  const id = c.req.param('id');
  const { entity_type } = await c.req.json();

  try {
    const integration = await c.env.DB.prepare(
      `SELECT * FROM integrations WHERE id = ?`
    ).bind(id).first() as Integration;

    if (!integration) {
      return c.json({ error: 'Integration not found' }, 404);
    }

    const result = await performIntegrationSync(c.env.DB, integration, entity_type);
    return c.json({ sync: result });
  } catch (error) {
    return c.json({ error: 'Sync failed', details: (error as Error).message }, 500);
  }
});

/**
 * GET /api/integrations/:id/logs
 * Récupérer les logs de synchronisation
 */
app.get('/:id/logs', async (c) => {
  const id = c.req.param('id');
  const limit = c.req.query('limit') || '50';

  try {
    const logs = await c.env.DB.prepare(
      `SELECT * FROM integration_logs
       WHERE integration_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    ).bind(id, parseInt(limit)).all();

    return c.json({ logs: logs.results });
  } catch (error) {
    return c.json({ error: 'Failed to fetch logs' }, 500);
  }
});

/**
 * DELETE /api/integrations/:id
 * Supprimer une intégration
 */
app.delete('/:id', async (c) => {
  const id = c.req.param('id');

  try {
    await c.env.DB.prepare(
      `DELETE FROM integrations WHERE id = ?`
    ).bind(id).run();

    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to delete integration' }, 500);
  }
});

/**
 * POST /api/webhooks/shopify/:integration_id
 * Receiver pour les webhooks Shopify
 */
app.post('/webhooks/shopify/:integration_id', async (c) => {
  const integrationId = c.req.param('integration_id');

  try {
    const integration = await c.env.DB.prepare(
      `SELECT * FROM integrations WHERE id = ?`
    ).bind(integrationId).first() as Integration;

    if (!integration) {
      return c.json({ error: 'Integration not found' }, 404);
    }

    const body = await c.req.text();
    const headers = Object.fromEntries(c.req.raw.headers.entries());

    const shopifyService = new ShopifyService(c.env.DB, integration);
    await shopifyService.handleWebhook(body, headers);

    return c.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

/**
 * Helper: Perform integration sync based on type and entity
 */
async function performIntegrationSync(
  db: D1Database,
  integration: Integration,
  entity_type: string
): Promise<any> {
  switch (integration.type) {
    case 'ecommerce':
      return performEcommerceSync(db, integration, entity_type);
    case 'crm':
      return performCrmSync(db, integration, entity_type);
    default:
      throw new Error('Unsupported integration type');
  }
}

/**
 * Helper: Perform e-commerce platform sync
 */
async function performEcommerceSync(
  db: D1Database,
  integration: Integration,
  entity_type: string
): Promise<any> {
  if (integration.name === 'Shopify') {
    const shopifyService = new ShopifyService(db, integration);
    return entity_type === 'products'
      ? await shopifyService.syncProducts()
      : await shopifyService.syncOrders();
  } else if (integration.name === 'WooCommerce') {
    const wooService = new WooCommerceService(db, integration);
    return entity_type === 'products'
      ? await wooService.syncProducts()
      : await wooService.syncOrders();
  } else {
    throw new Error('Unsupported ecommerce platform');
  }
}

/**
 * Helper: Perform CRM platform sync
 */
async function performCrmSync(
  db: D1Database,
  integration: Integration,
  entity_type: string
): Promise<any> {
  const sfService = new SalesforceService(db, integration);
  return (entity_type === 'products' || entity_type === 'accounts')
    ? await sfService.syncProducts() // Sync Accounts
    : await sfService.syncOrders(); // Sync Opportunities
}

/**
 * Helper : Enregistrer les webhooks sur Shopify
 */
async function registerShopifyWebhooks(
  shop_domain: string,
  access_token: string,
  webhook_secret: string
): Promise<void> {
  const topics = ['orders/create', 'orders/updated', 'products/create', 'products/update'];
  const webhookUrl = `${process.env.PUBLIC_URL || 'http://localhost:8787'}/api/webhooks/shopify`;

  for (const topic of topics) {
    await fetch(`https://${shop_domain}/admin/api/2024-01/webhooks.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': access_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        webhook: {
          topic,
          address: webhookUrl,
          format: 'json'
        }
      })
    });
  }
}

export default app;
