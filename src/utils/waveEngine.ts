/**
 * Wave Management Engine
 * Intelligence de regroupement des commandes en vagues optimisées
 * Inspiré des systèmes enterprise (Manhattan, Blue Yonder)
 */

export interface Order {
  id: number;
  customer_name: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total_amount: number;
  created_at: string;
  priority?: 'urgent' | 'normal' | 'low';
  shipping_method?: 'express' | 'standard' | 'economy';
  items?: OrderItem[];
}

export interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  location?: string;
}

export interface Wave {
  id: string;
  name: string;
  status: 'pending' | 'released' | 'in_progress' | 'completed' | 'cancelled';
  orders: Order[];
  created_at: Date;
  released_at?: Date;
  completed_at?: Date;
  priority: 'urgent' | 'normal' | 'low';
  zone?: string;
  assigned_to?: string;
  metrics: WaveMetrics;
}

export interface WaveMetrics {
  total_orders: number;
  total_lines: number;
  total_units: number;
  estimated_picks: number;
  estimated_time_minutes: number;
  zones_involved: string[];
}

export interface WaveConfig {
  max_orders_per_wave: number;
  max_lines_per_wave: number;
  max_time_minutes: number;
  group_by_zone: boolean;
  group_by_priority: boolean;
  group_by_shipping: boolean;
  auto_release: boolean;
}

const DEFAULT_CONFIG: WaveConfig = {
  max_orders_per_wave: 20,
  max_lines_per_wave: 100,
  max_time_minutes: 60,
  group_by_zone: true,
  group_by_priority: true,
  group_by_shipping: false,
  auto_release: false,
};

export class WaveEngine {
  private static instance: WaveEngine;
  private config: WaveConfig;

  private constructor(config?: Partial<WaveConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<WaveConfig>): WaveEngine {
    if (!WaveEngine.instance) {
      WaveEngine.instance = new WaveEngine(config);
    }
    return WaveEngine.instance;
  }

  /**
   * Génère des vagues optimisées à partir d'une liste de commandes
   */
  generateWaves(orders: Order[]): Wave[] {
    // Filtrer uniquement les commandes pending
    const pendingOrders = orders.filter(o => o.status === 'pending');

    if (pendingOrders.length === 0) {
      return [];
    }

    // Trier par priorité, puis date de création
    const sortedOrders = this.sortOrders(pendingOrders);

    // Grouper les commandes selon la configuration
    const groups = this.groupOrders(sortedOrders);

    // Créer les vagues pour chaque groupe
    const waves: Wave[] = [];
    groups.forEach((groupOrders, groupKey) => {
      const wavesBatch = this.createWavesFromGroup(groupOrders, groupKey);
      waves.push(...wavesBatch);
    });

    return waves;
  }

  /**
   * Trie les commandes par priorité et date
   */
  private sortOrders(orders: Order[]): Order[] {
    const priorityOrder = { urgent: 0, normal: 1, low: 2 };

    return [...orders].sort((a, b) => {
      // D'abord par priorité
      const priorityA = priorityOrder[a.priority || 'normal'];
      const priorityB = priorityOrder[b.priority || 'normal'];

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Puis par date de création (plus ancien en premier)
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }

  /**
   * Groupe les commandes selon critères configurés
   */
  private groupOrders(orders: Order[]): Map<string, Order[]> {
    const groups = new Map<string, Order[]>();

    orders.forEach(order => {
      const groupKey = this.getGroupKey(order);
      const existing = groups.get(groupKey) || [];
      groups.set(groupKey, [...existing, order]);
    });

    return groups;
  }

  /**
   * Génère la clé de groupement pour une commande
   */
  private getGroupKey(order: Order): string {
    const parts: string[] = [];

    if (this.config.group_by_priority) {
      parts.push(order.priority || 'normal');
    }

    if (this.config.group_by_zone && order.items && order.items.length > 0) {
      // Extraire la zone de la première location
      const location = order.items[0].location || 'UNKNOWN';
      const zone = location.split('-')[0]; // Ex: "A-01-02" → "A"
      parts.push(zone);
    }

    if (this.config.group_by_shipping) {
      parts.push(order.shipping_method || 'standard');
    }

    return parts.join('_') || 'default';
  }

  /**
   * Crée des vagues à partir d'un groupe de commandes
   */
  private createWavesFromGroup(orders: Order[], groupKey: string): Wave[] {
    const waves: Wave[] = [];
    let currentBatch: Order[] = [];
    let currentLines = 0;
    let waveNumber = 1;

    orders.forEach(order => {
      const orderLines = order.items?.reduce((sum, item) => sum + 1, 0) || 1;

      // Si le batch actuel est plein, créer une vague AVANT d'ajouter la nouvelle commande
      if (currentBatch.length >= this.config.max_orders_per_wave ||
          (currentBatch.length > 0 && currentLines + orderLines > this.config.max_lines_per_wave)) {
        // Créer vague avec le batch actuel
        waves.push(this.createWave(currentBatch, groupKey, waveNumber));
        waveNumber++;
        // Commencer nouveau batch
        currentBatch = [];
        currentLines = 0;
      }

      // Ajouter la commande au batch actuel
      currentBatch.push(order);
      currentLines += orderLines;
    });

    // Créer dernière vague avec les commandes restantes
    if (currentBatch.length > 0) {
      waves.push(this.createWave(currentBatch, groupKey, waveNumber));
    }

    return waves;
  }

  /**
   * Crée une vague à partir d'un batch de commandes
   */
  private createWave(orders: Order[], groupKey: string, waveNumber: number): Wave {
    const priority = orders[0].priority || 'normal';
    const zone = groupKey.split('_').find(p => p.length === 1) || '';

    const metrics = this.calculateMetrics(orders);

    return {
      id: `wave-${Date.now()}-${waveNumber}`,
      name: `Vague ${zone}${waveNumber} - ${priority.toUpperCase()}`,
      status: this.config.auto_release ? 'released' : 'pending',
      orders,
      created_at: new Date(),
      released_at: this.config.auto_release ? new Date() : undefined,
      priority,
      zone: zone || undefined,
      metrics,
    };
  }

  /**
   * Calcule les métriques d'une vague
   */
  private calculateMetrics(orders: Order[]): WaveMetrics {
    let total_lines = 0;
    let total_units = 0;
    const zones = new Set<string>();

    orders.forEach(order => {
      if (order.items) {
        total_lines += order.items.length;
        order.items.forEach(item => {
          total_units += item.quantity;
          if (item.location) {
            const zone = item.location.split('-')[0];
            zones.add(zone);
          }
        });
      }
    });

    // Estimation temps: 30 secondes par ligne en moyenne
    const estimated_time_minutes = Math.ceil((total_lines * 0.5) / 60);

    // Estimation picks: généralement = nombre de lignes
    const estimated_picks = total_lines;

    return {
      total_orders: orders.length,
      total_lines,
      total_units,
      estimated_picks,
      estimated_time_minutes,
      zones_involved: Array.from(zones),
    };
  }

  /**
   * Libère une vague (la rend disponible pour picking)
   */
  releaseWave(wave: Wave): Wave {
    return {
      ...wave,
      status: 'released',
      released_at: new Date(),
    };
  }

  /**
   * Démarre une vague
   */
  startWave(wave: Wave, assignedTo?: string): Wave {
    return {
      ...wave,
      status: 'in_progress',
      assigned_to: assignedTo,
    };
  }

  /**
   * Complète une vague
   */
  completeWave(wave: Wave): Wave {
    return {
      ...wave,
      status: 'completed',
      completed_at: new Date(),
    };
  }

  /**
   * Annule une vague
   */
  cancelWave(wave: Wave): Wave {
    return {
      ...wave,
      status: 'cancelled',
    };
  }
}

export const waveEngine = WaveEngine.getInstance();
