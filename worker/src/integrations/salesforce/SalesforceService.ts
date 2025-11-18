/**
 * Salesforce Integration Service
 * Gère OAuth 2.0, sync bidirectionnel avec CRM, et Platform Events
 */

import { IntegrationService, Integration, SyncResult } from '../base/IntegrationService';

interface SalesforceConfig {
  instance_url: string;        // https://yourinstance.salesforce.com
  access_token: string;
  refresh_token?: string;
  client_id?: string;
  client_secret?: string;
}

interface SalesforceAccount {
  Id: string;
  Name: string;
  BillingStreet?: string;
  BillingCity?: string;
  BillingState?: string;
  BillingPostalCode?: string;
  BillingCountry?: string;
  Phone?: string;
  Website?: string;
}

interface SalesforceContact {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone?: string;
  AccountId?: string;
}

interface SalesforceOpportunity {
  Id: string;
  Name: string;
  Amount: number;
  StageName: string;
  CloseDate: string;
  AccountId?: string;
}

export class SalesforceService extends IntegrationService {
  private config: SalesforceConfig;
  private apiVersion = 'v59.0';

  constructor(db: D1Database, integration: Integration) {
    super(db, integration);
    this.config = this.getConfig<SalesforceConfig>();
  }

  /**
   * Vérifie que l'access token est valide
   */
  async authenticate(): Promise<void> {
    try {
      const response = await this.salesforceAPI('GET', '/services/data/' + this.apiVersion);
      if (!response.ok) {
        // Try to refresh token if we have refresh_token
        if (this.config.refresh_token && response.status === 401) {
          await this.refreshAccessToken();
          // Retry
          const retryResponse = await this.salesforceAPI('GET', '/services/data/' + this.apiVersion);
          if (!retryResponse.ok) {
            throw new Error('Invalid access token after refresh');
          }
        } else {
          throw new Error('Invalid access token');
        }
      }
      await this.updateIntegrationStatus('active');
    } catch (error) {
      await this.updateIntegrationStatus('error', (error as Error).message);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.config.refresh_token || !this.config.client_id || !this.config.client_secret) {
      throw new Error('Missing OAuth credentials for token refresh');
    }

    const tokenUrl = `${this.config.instance_url}/services/oauth2/token`;
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.config.refresh_token,
      client_id: this.config.client_id,
      client_secret: this.config.client_secret
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const data = await response.json();
    this.config.access_token = data.access_token;

    // Update config in database
    await this.db.prepare(
      `UPDATE integrations SET config = ? WHERE id = ?`
    ).bind(JSON.stringify(this.config), this.integration.id).run();
  }

  /**
   * Sync des Accounts Salesforce → WMS (comme clients)
   */
  async syncOrders(): Promise<SyncResult> {
    // Pour Salesforce, on sync les Opportunities comme "orders"
    const startTime = Date.now();
    const errors: string[] = [];
    let entityCount = 0;

    try {
      const lastSync = this.integration.last_sync_at || '2024-01-01T00:00:00Z';

      // SOQL query pour récupérer les Opportunities
      const query = `SELECT Id, Name, Amount, StageName, CloseDate, AccountId
                     FROM Opportunity
                     WHERE LastModifiedDate > ${lastSync.replace(/\.\d{3}Z$/, 'Z')}
                     LIMIT 200`;

      const response = await this.salesforceAPI(
        'GET',
        `/services/data/${this.apiVersion}/query?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status}`);
      }

      const data = await response.json();
      const opportunities: SalesforceOpportunity[] = data.records || [];

      // Import chaque opportunity
      for (const opp of opportunities) {
        try {
          await this.importOpportunity(opp);
          entityCount++;
        } catch (error) {
          errors.push(`Opportunity ${opp.Name}: ${(error as Error).message}`);
        }
      }

      // Log du sync
      await this.logSync({
        integration_id: this.integration.id,
        action: 'sync_opportunities',
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
        action: 'sync_opportunities',
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
   * Sync des Accounts Salesforce → WMS (comme produits/clients)
   */
  async syncProducts(): Promise<SyncResult> {
    // Pour Salesforce, on peut sync les Accounts comme "clients" dans le WMS
    const startTime = Date.now();
    const errors: string[] = [];
    let entityCount = 0;

    try {
      const query = `SELECT Id, Name, BillingStreet, BillingCity, BillingState,
                            BillingPostalCode, BillingCountry, Phone, Website
                     FROM Account
                     LIMIT 200`;

      const response = await this.salesforceAPI(
        'GET',
        `/services/data/${this.apiVersion}/query?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error(`Salesforce API error: ${response.status}`);
      }

      const data = await response.json();
      const accounts: SalesforceAccount[] = data.records || [];

      for (const account of accounts) {
        try {
          await this.importAccount(account);
          entityCount++;
        } catch (error) {
          errors.push(`Account ${account.Name}: ${(error as Error).message}`);
        }
      }

      await this.logSync({
        integration_id: this.integration.id,
        action: 'sync_accounts',
        status: errors.length > 0 ? 'error' : 'success',
        entity_type: 'account',
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
   * Handler pour les webhooks/Platform Events Salesforce
   */
  async handleWebhook(payload: any, headers: any): Promise<void> {
    // Salesforce utilise Platform Events ou Streaming API
    // Pour simplifier, on accepte les webhooks via un endpoint custom

    // Ajouter à la queue
    await this.db.prepare(
      `INSERT INTO webhook_queue (integration_id, webhook_type, payload, headers, status)
       VALUES (?, ?, ?, ?, 'pending')`
    ).bind(
      this.integration.id,
      payload.event?.type || 'unknown',
      JSON.stringify(payload),
      JSON.stringify(headers)
    ).run();

    // Process le webhook
    const eventType = payload.event?.type;
    if (eventType === 'OpportunityUpdated' && payload.data) {
      await this.importOpportunity(payload.data);
    } else if (eventType === 'AccountUpdated' && payload.data) {
      await this.importAccount(payload.data);
    }
  }

  /**
   * Import une Opportunity Salesforce dans WMS (comme commande)
   */
  private async importOpportunity(opp: SalesforceOpportunity): Promise<void> {
    // Vérifier si déjà importée
    const existing = await this.db.prepare(
      `SELECT wms_entity_id FROM salesforce_mappings
       WHERE integration_id = ? AND salesforce_id = ? AND wms_entity_type = 'opportunity'`
    ).bind(this.integration.id, opp.Id).first();

    if (existing) {
      // Update existant
      await this.db.prepare(
        `UPDATE orders SET
          total_amount = ?,
          status = ?,
          updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        opp.Amount || 0,
        this.mapOpportunityStage(opp.StageName),
        existing.wms_entity_id
      ).run();

      return;
    }

    // Créer nouvelle commande
    const orderResult = await this.db.prepare(
      `INSERT INTO orders (order_number, customer_name, customer_email, total_amount, status, source, created_at)
       VALUES (?, ?, ?, ?, ?, 'salesforce', datetime('now'))`
    ).bind(
      opp.Id.substring(0, 10), // Use SF ID as order number
      opp.Name,
      'salesforce@example.com', // Placeholder
      opp.Amount || 0,
      this.mapOpportunityStage(opp.StageName)
    ).run();

    const wmsOrderId = orderResult.meta.last_row_id;

    // Créer le mapping
    await this.db.prepare(
      `INSERT INTO salesforce_mappings (integration_id, wms_entity_type, wms_entity_id, salesforce_id)
       VALUES (?, 'opportunity', ?, ?)`
    ).bind(
      this.integration.id,
      wmsOrderId,
      opp.Id
    ).run();
  }

  /**
   * Import un Account Salesforce dans WMS
   */
  private async importAccount(account: SalesforceAccount): Promise<void> {
    const existing = await this.db.prepare(
      `SELECT wms_entity_id FROM salesforce_mappings
       WHERE integration_id = ? AND salesforce_id = ? AND wms_entity_type = 'account'`
    ).bind(this.integration.id, account.Id).first();

    if (existing) {
      // Update (on pourrait mettre à jour une table customers si elle existait)
      return;
    }

    // Pour l'instant, on stocke juste le mapping
    // Dans un vrai système, on créerait une table customers
    await this.db.prepare(
      `INSERT INTO salesforce_mappings (integration_id, wms_entity_type, wms_entity_id, salesforce_id)
       VALUES (?, 'account', ?, ?)`
    ).bind(
      this.integration.id,
      0, // Placeholder - dans un vrai système, ce serait l'ID du customer
      account.Id
    ).run();
  }

  /**
   * Map Salesforce Opportunity Stage to WMS status
   */
  private mapOpportunityStage(stage: string): string {
    const stageMap: Record<string, string> = {
      'Prospecting': 'pending',
      'Qualification': 'pending',
      'Needs Analysis': 'pending',
      'Value Proposition': 'processing',
      'Id. Decision Makers': 'processing',
      'Perception Analysis': 'processing',
      'Proposal/Price Quote': 'processing',
      'Negotiation/Review': 'processing',
      'Closed Won': 'completed',
      'Closed Lost': 'cancelled'
    };
    return stageMap[stage] || 'pending';
  }

  /**
   * Helper pour appeler l'API Salesforce
   */
  private async salesforceAPI(method: string, path: string, body?: any): Promise<Response> {
    const url = `${this.config.instance_url}${path}`;

    return fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.config.access_token}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }
}
