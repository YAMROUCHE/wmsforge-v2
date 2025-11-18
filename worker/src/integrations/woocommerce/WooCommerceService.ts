/**
 * WooCommerce Integration Service
 * Gère l'authentification, sync bidirectionnel, et webhooks
 */

import { IntegrationService, Integration, SyncResult } from '../base/IntegrationService';
import crypto from 'crypto';

interface WooCommerceConfig {
  store_url: string;           // https://example.com
  consumer_key: string;
  consumer_secret: string;
}

interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  date_created: string;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
  };
  line_items: Array<{
    id: number;
    name: string;
    quantity: number;
    price: string;
    sku?: string;
  }>;
}

interface WooCommerceProduct {
  id: number;
  name: string;
  sku: string;
  price: string;
  stock_quantity: number;
}

export class WooCommerceService extends IntegrationService {
  private config: WooCommerceConfig;

  constructor(db: D1Database, integration: Integration) {
    super(db, integration);
    this.config = this.getConfig<WooCommerceConfig>();
  }

  /**
   * Vérifie que les credentials sont valides
   */
  async authenticate(): Promise<void> {
    try {
      const response = await this.wooAPI('GET', '/products?per_page=1');
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      await this.updateIntegrationStatus('active');
    } catch (error) {
      await this.updateIntegrationStatus('error', (error as Error).message);
      throw error;
    }
  }

  /**
   * Sync des commandes WooCommerce → WMS
   */
  async syncOrders(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let entityCount = 0;

    try {
      const lastSync = this.integration.last_sync_at || '2024-01-01T00:00:00';

      // Fetch orders depuis WooCommerce
      const response = await this.wooAPI(
        'GET',
        `/orders?after=${lastSync}&per_page=100`
      );

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      const orders: WooCommerceOrder[] = await response.json();

      // Import chaque commande
      for (const wooOrder of orders) {
        try {
          await this.importOrder(wooOrder);
          entityCount++;
        } catch (error) {
          errors.push(`Order ${wooOrder.number}: ${(error as Error).message}`);
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
   * Sync des produits WooCommerce → WMS
   */
  async syncProducts(): Promise<SyncResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    let entityCount = 0;

    try {
      const response = await this.wooAPI('GET', '/products?per_page=100');

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      const products: WooCommerceProduct[] = await response.json();

      for (const wooProduct of products) {
        try {
          await this.importProduct(wooProduct);
          entityCount++;
        } catch (error) {
          errors.push(`Product ${wooProduct.id}: ${(error as Error).message}`);
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
   * Handler pour les webhooks WooCommerce
   */
  async handleWebhook(payload: any, headers: any): Promise<void> {
    const signature = headers['x-wc-webhook-signature'];

    // Vérifier la signature
    if (!this.verifyWebhook(JSON.stringify(payload), signature)) {
      throw new Error('Invalid webhook signature');
    }

    // Ajouter à la queue
    await this.db.prepare(
      `INSERT INTO webhook_queue (integration_id, webhook_type, payload, headers, status)
       VALUES (?, ?, ?, ?, 'pending')`
    ).bind(
      this.integration.id,
      headers['x-wc-webhook-topic'],
      JSON.stringify(payload),
      JSON.stringify(headers)
    ).run();

    // Process immédiatement
    const topic = headers['x-wc-webhook-topic'];
    await this.processWebhook(topic, payload);
  }

  /**
   * Process webhook selon le type
   */
  private async processWebhook(topic: string, payload: any): Promise<void> {
    switch (topic) {
      case 'order.created':
      case 'order.updated':
        await this.importOrder(payload);
        break;

      case 'product.created':
      case 'product.updated':
        await this.importProduct(payload);
        break;

      default:
        console.log(`Unhandled webhook: ${topic}`);
    }
  }

  /**
   * Import une commande WooCommerce dans WMS
   */
  private async importOrder(wooOrder: WooCommerceOrder): Promise<void> {
    // Vérifier si déjà importée (utilise shopify_mappings car pas de table woocommerce_mappings séparée)
    const existing = await this.db.prepare(
      `SELECT wms_entity_id FROM shopify_mappings
       WHERE integration_id = ? AND shopify_id = ? AND wms_entity_type = 'order'`
    ).bind(this.integration.id, wooOrder.id.toString()).first();

    if (existing) {
      // Update existant
      await this.db.prepare(
        `UPDATE orders SET
          total_amount = ?,
          status = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        parseFloat(wooOrder.total),
        this.mapOrderStatus(wooOrder.status),
        existing.wms_entity_id
      ).run();

      return;
    }

    // Créer nouvelle commande
    const orderResult = await this.db.prepare(
      `INSERT INTO orders (order_number, customer_name, customer_email, total_amount, status, source, created_at)
       VALUES (?, ?, ?, ?, ?, 'woocommerce', ?)`
    ).bind(
      wooOrder.number,
      `${wooOrder.billing.first_name} ${wooOrder.billing.last_name}`,
      wooOrder.billing.email,
      parseFloat(wooOrder.total),
      this.mapOrderStatus(wooOrder.status),
      wooOrder.date_created
    ).run();

    const wmsOrderId = orderResult.meta.last_row_id;

    // Créer le mapping
    await this.db.prepare(
      `INSERT INTO shopify_mappings (integration_id, wms_entity_type, wms_entity_id, shopify_id)
       VALUES (?, 'order', ?, ?)`
    ).bind(
      this.integration.id,
      wmsOrderId,
      wooOrder.id.toString()
    ).run();

    // Import line items
    for (const item of wooOrder.line_items) {
      await this.db.prepare(
        `INSERT INTO order_items (order_id, product_name, quantity, unit_price, sku)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        wmsOrderId,
        item.name,
        item.quantity,
        parseFloat(item.price),
        item.sku || null
      ).run();
    }
  }

  /**
   * Import un produit WooCommerce dans WMS
   */
  private async importProduct(wooProduct: WooCommerceProduct): Promise<void> {
    const existing = await this.db.prepare(
      `SELECT wms_entity_id FROM shopify_mappings
       WHERE integration_id = ? AND shopify_id = ? AND wms_entity_type = 'product'`
    ).bind(this.integration.id, wooProduct.id.toString()).first();

    if (existing) {
      // Update
      await this.db.prepare(
        `UPDATE products SET
          name = ?,
          price = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        wooProduct.name,
        parseFloat(wooProduct.price),
        existing.wms_entity_id
      ).run();
      return;
    }

    // Créer nouveau produit
    const productResult = await this.db.prepare(
      `INSERT INTO products (name, sku, price, category, created_at)
       VALUES (?, ?, ?, 'E-commerce', datetime('now'))`
    ).bind(
      wooProduct.name,
      wooProduct.sku || `WOO-${wooProduct.id}`,
      parseFloat(wooProduct.price)
    ).run();

    const wmsProductId = productResult.meta.last_row_id;

    // Mapping
    await this.db.prepare(
      `INSERT INTO shopify_mappings (integration_id, wms_entity_type, wms_entity_id, shopify_id)
       VALUES (?, 'product', ?, ?)`
    ).bind(
      this.integration.id,
      wmsProductId,
      wooProduct.id.toString()
    ).run();
  }

  /**
   * Map WooCommerce status to WMS status
   */
  private mapOrderStatus(wooStatus: string): string {
    const statusMap: Record<string, string> = {
      'pending': 'pending',
      'processing': 'processing',
      'on-hold': 'pending',
      'completed': 'shipped',
      'cancelled': 'cancelled',
      'refunded': 'cancelled',
      'failed': 'cancelled'
    };
    return statusMap[wooStatus] || 'pending';
  }

  /**
   * Vérifier la signature HMAC du webhook
   */
  private verifyWebhook(body: string, signature: string): boolean {
    if (!this.integration.webhook_secret) return false;

    const hash = crypto
      .createHmac('sha256', this.integration.webhook_secret)
      .update(body, 'utf8')
      .digest('base64');

    return hash === signature;
  }

  /**
   * Helper pour appeler l'API WooCommerce
   */
  private async wooAPI(method: string, path: string, body?: any): Promise<Response> {
    const url = `${this.config.store_url}/wp-json/wc/v3${path}`;

    // WooCommerce utilise Basic Auth avec consumer_key:consumer_secret
    const auth = Buffer.from(`${this.config.consumer_key}:${this.config.consumer_secret}`).toString('base64');

    return fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }
}
