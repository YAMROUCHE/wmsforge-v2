/**
 * Shopify Integration Service
 * Gère OAuth, sync bidirectionnel, et webhooks
 */

import { IntegrationService, Integration, SyncResult } from '../base/IntegrationService';
import crypto from 'crypto';

interface ShopifyConfig {
  shop_domain: string;      // example.myshopify.com
  access_token: string;
  api_version: string;      // 2024-01
}

interface ShopifyOrder {
  id: number;
  order_number: number;
  email: string;
  total_price: string;
  created_at: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    id: number;
    title: string;
    quantity: number;
    price: string;
    sku?: string;
  }>;
}

interface ShopifyProduct {
  id: number;
  title: string;
  variants: Array<{
    id: number;
    sku: string;
    price: string;
    inventory_quantity: number;
  }>;
}

export class ShopifyService extends IntegrationService {
  private config: ShopifyConfig;

  constructor(db: D1Database, integration: Integration) {
    super(db, integration);
    this.config = this.getConfig<ShopifyConfig>();
  }

  /**
   * Vérifie que l'access token est valide
   */
  async authenticate(): Promise<void> {
    try {
      const response = await this.shopifyAPI('GET', '/shop.json');
      if (!response.ok) {
        throw new Error('Invalid access token');
      }
      await this.updateIntegrationStatus('active');
    } catch (error) {
      await this.updateIntegrationStatus('error', (error as Error).message);
      throw error;
    }
  }

  /**
   * Sync des commandes Shopify → WMS
   */
  async syncOrders(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let entityCount = 0;

    try {
      // Récupérer la dernière date de sync
      const lastSync = this.integration.last_sync_at || '2024-01-01T00:00:00Z';

      // Fetch orders depuis Shopify
      const response = await this.shopifyAPI(
        'GET',
        `/orders.json?status=any&created_at_min=${lastSync}&limit=250`
      );

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json() as { orders?: ShopifyOrder[] };
      const orders: ShopifyOrder[] = data.orders || [];

      // Import chaque commande
      for (const shopifyOrder of orders) {
        try {
          await this.importOrder(shopifyOrder);
          entityCount++;
        } catch (error) {
          errors.push(`Order ${shopifyOrder.order_number}: ${(error as Error).message}`);
        }
      }

      // Log du sync
      await this.logSync({
        integration_id: this.integration.id,
        action: 'sync_orders',
        status: errors.length > 0 ? 'error' : 'success',
        entity_type: 'order',
        entity_count: entityCount,
        details: JSON.stringify({ errors }),
        duration_ms: Date.now() - startTime
      });

      await this.updateLastSync();

      return {
        success: errors.length === 0,
        entity_count: entityCount,
        errors,
        duration_ms: Date.now() - startTime
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      await this.logSync({
        integration_id: this.integration.id,
        action: 'sync_orders',
        status: 'error',
        entity_type: 'order',
        entity_count: entityCount,
        details: JSON.stringify({ error: (error as Error).message }),
        duration_ms: duration
      });

      return {
        success: false,
        entity_count: entityCount,
        errors: [(error as Error).message],
        duration_ms: duration
      };
    }
  }

  /**
   * Sync des produits Shopify → WMS
   */
  async syncProducts(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let entityCount = 0;

    try {
      const response = await this.shopifyAPI('GET', '/products.json?limit=250');

      if (!response.ok) {
        throw new Error(`Shopify API error: ${response.status}`);
      }

      const data = await response.json() as { products?: ShopifyProduct[] };
      const products: ShopifyProduct[] = data.products || [];

      for (const shopifyProduct of products) {
        try {
          await this.importProduct(shopifyProduct);
          entityCount++;
        } catch (error) {
          errors.push(`Product ${shopifyProduct.id}: ${(error as Error).message}`);
        }
      }

      await this.logSync({
        integration_id: this.integration.id,
        action: 'sync_products',
        status: errors.length > 0 ? 'error' : 'success',
        entity_type: 'product',
        entity_count: entityCount,
        details: JSON.stringify({ errors }),
        duration_ms: Date.now() - startTime
      });

      return {
        success: errors.length === 0,
        entity_count: entityCount,
        errors,
        duration_ms: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        entity_count: entityCount,
        errors: [(error as Error).message],
        duration_ms: Date.now() - startTime
      };
    }
  }

  /**
   * Handler pour les webhooks Shopify
   */
  async handleWebhook(payload: any, headers: any): Promise<void> {
    const topic = headers['x-shopify-topic'];
    const hmac = headers['x-shopify-hmac-sha256'];

    // Vérifier la signature HMAC
    if (!this.verifyWebhook(payload, hmac)) {
      throw new Error('Invalid webhook signature');
    }

    // Ajouter à la queue
    await this.db.prepare(
      `INSERT INTO webhook_queue (integration_id, webhook_type, payload, headers, status)
       VALUES (?, ?, ?, ?, 'pending')`
    ).bind(
      this.integration.id,
      topic,
      JSON.stringify(payload),
      JSON.stringify(headers)
    ).run();

    // Process immédiatement si possible
    await this.processWebhook(topic, payload);
  }

  /**
   * Process webhook selon le type
   */
  private async processWebhook(topic: string, payload: any): Promise<void> {
    switch (topic) {
      case 'orders/create':
      case 'orders/updated':
        await this.importOrder(payload);
        break;

      case 'products/create':
      case 'products/update':
        await this.importProduct(payload);
        break;

      case 'inventory_levels/update':
        // Sync inventory (à implémenter)
        break;

      default:
        console.log(`Unhandled webhook: ${topic}`);
    }
  }

  /**
   * Import une commande Shopify dans WMS
   */
  private async importOrder(shopifyOrder: ShopifyOrder): Promise<void> {
    // Vérifier si déjà importée
    const existing = await this.db.prepare(
      `SELECT wms_entity_id FROM shopify_mappings
       WHERE integration_id = ? AND shopify_id = ? AND wms_entity_type = 'order'`
    ).bind(this.integration.id, shopifyOrder.id.toString()).first();

    if (existing) {
      // Update existant
      await this.db.prepare(
        `UPDATE orders SET
          total_amount = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        parseFloat(shopifyOrder.total_price),
        existing.wms_entity_id
      ).run();

      return;
    }

    // Créer nouvelle commande
    const orderResult = await this.db.prepare(
      `INSERT INTO orders (order_number, customer_name, customer_email, total_amount, status, source, created_at)
       VALUES (?, ?, ?, ?, 'pending', 'shopify', ?)`
    ).bind(
      shopifyOrder.order_number,
      `${shopifyOrder.customer.first_name} ${shopifyOrder.customer.last_name}`,
      shopifyOrder.customer.email,
      parseFloat(shopifyOrder.total_price),
      shopifyOrder.created_at
    ).run();

    const wmsOrderId = orderResult.meta.last_row_id;

    // Créer le mapping
    await this.db.prepare(
      `INSERT INTO shopify_mappings (integration_id, wms_entity_type, wms_entity_id, shopify_id)
       VALUES (?, 'order', ?, ?)`
    ).bind(
      this.integration.id,
      wmsOrderId,
      shopifyOrder.id.toString()
    ).run();

    // Import line items
    for (const item of shopifyOrder.line_items) {
      await this.db.prepare(
        `INSERT INTO order_items (order_id, product_name, quantity, unit_price, sku)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        wmsOrderId,
        item.title,
        item.quantity,
        parseFloat(item.price),
        item.sku || null
      ).run();
    }
  }

  /**
   * Import un produit Shopify dans WMS
   */
  private async importProduct(shopifyProduct: ShopifyProduct): Promise<void> {
    // Prendre la première variante pour simplifier
    const variant = shopifyProduct.variants[0];
    if (!variant) return;

    const existing = await this.db.prepare(
      `SELECT wms_entity_id FROM shopify_mappings
       WHERE integration_id = ? AND shopify_id = ? AND wms_entity_type = 'product'`
    ).bind(this.integration.id, shopifyProduct.id.toString()).first();

    if (existing) {
      // Update
      await this.db.prepare(
        `UPDATE products SET
          name = ?,
          price = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        shopifyProduct.title,
        parseFloat(variant.price),
        existing.wms_entity_id
      ).run();
      return;
    }

    // Créer nouveau produit
    const productResult = await this.db.prepare(
      `INSERT INTO products (name, sku, price, category, created_at)
       VALUES (?, ?, ?, 'E-commerce', datetime('now'))`
    ).bind(
      shopifyProduct.title,
      variant.sku || `SHOP-${shopifyProduct.id}`,
      parseFloat(variant.price)
    ).run();

    const wmsProductId = productResult.meta.last_row_id;

    // Mapping
    await this.db.prepare(
      `INSERT INTO shopify_mappings (integration_id, wms_entity_type, wms_entity_id, shopify_id)
       VALUES (?, 'product', ?, ?)`
    ).bind(
      this.integration.id,
      wmsProductId,
      shopifyProduct.id.toString()
    ).run();
  }

  /**
   * Vérifier la signature HMAC du webhook
   */
  private verifyWebhook(body: string, hmac: string): boolean {
    if (!this.integration.webhook_secret) return false;

    const hash = crypto
      .createHmac('sha256', this.integration.webhook_secret)
      .update(body, 'utf8')
      .digest('base64');

    return hash === hmac;
  }

  /**
   * Helper pour appeler l'API Shopify
   */
  private async shopifyAPI(method: string, path: string, body?: any): Promise<Response> {
    const url = `https://${this.config.shop_domain}/admin/api/${this.config.api_version}${path}`;

    return fetch(url, {
      method,
      headers: {
        'X-Shopify-Access-Token': this.config.access_token,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }
}
