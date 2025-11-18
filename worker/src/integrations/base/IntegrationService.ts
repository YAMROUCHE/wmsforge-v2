/**
 * Service abstrait pour toutes les intégrations
 * Chaque intégration (Shopify, Salesforce, etc.) doit étendre cette classe
 */

import { Context } from 'hono';

export interface Integration {
  id: number;
  name: string;
  type: 'ecommerce' | 'crm' | 'erp' | 'shipping' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'pending';
  config: string; // JSON
  webhook_secret?: string;
  sync_settings?: string; // JSON
  last_sync_at?: string;
  last_error?: string;
}

export interface IntegrationLog {
  integration_id: number;
  action: string;
  status: 'success' | 'error' | 'pending';
  entity_type?: string;
  entity_count?: number;
  details?: string; // JSON
  duration_ms?: number;
}

export interface SyncResult {
  success: boolean;
  entity_count: number;
  errors: string[];
  duration_ms: number;
}

export abstract class IntegrationService {
  protected db: D1Database;
  protected integration: Integration;

  constructor(db: D1Database, integration: Integration) {
    this.db = db;
    this.integration = integration;
  }

  /**
   * Méthodes à implémenter par chaque intégration
   */
  abstract authenticate(): Promise<void>;
  abstract syncOrders(): Promise<SyncResult>;
  abstract syncProducts(): Promise<SyncResult>;
  abstract handleWebhook(payload: any, headers: any): Promise<void>;

  /**
   * Méthodes communes
   */
  async logSync(log: IntegrationLog): Promise<void> {
    await this.db
      .prepare(
        `INSERT INTO integration_logs
        (integration_id, action, status, entity_type, entity_count, details, duration_ms)
        VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        log.integration_id,
        log.action,
        log.status,
        log.entity_type || null,
        log.entity_count || 0,
        log.details || null,
        log.duration_ms || null
      )
      .run();
  }

  async updateIntegrationStatus(status: Integration['status'], error?: string): Promise<void> {
    await this.db
      .prepare(
        `UPDATE integrations
        SET status = ?, last_error = ?, updated_at = datetime('now')
        WHERE id = ?`
      )
      .bind(status, error || null, this.integration.id)
      .run();
  }

  async updateLastSync(): Promise<void> {
    await this.db
      .prepare(
        `UPDATE integrations
        SET last_sync_at = datetime('now')
        WHERE id = ?`
      )
      .bind(this.integration.id)
      .run();
  }

  protected getConfig<T = any>(): T {
    return JSON.parse(this.integration.config || '{}');
  }

  protected getSyncSettings<T = any>(): T {
    return JSON.parse(this.integration.sync_settings || '{}');
  }
}
