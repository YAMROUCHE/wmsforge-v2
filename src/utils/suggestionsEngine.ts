/**
 * 🤖 Moteur de Suggestions Intelligentes - 1WMS.io
 *
 * Analyse les données de l'entrepôt et génère des suggestions automatiques
 * pour optimiser les opérations, anticiper les problèmes et améliorer l'efficacité.
 */

export interface Suggestion {
  id: string;
  type: 'warning' | 'optimization' | 'urgent' | 'info';
  title: string;
  description: string;
  action?: {
    label: string;
    route: string;
  };
  priority: 'high' | 'medium' | 'low';
  impact: string;
}

interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  location_id: number;
  location_name?: string;
}

interface Order {
  id: number;
  status: string;
  created_at: string;
  total_amount: number;
  customer_name?: string;
}

interface Location {
  id: number;
  name: string;
  type: string;
  capacity: number | null;
}

interface AnalysisData {
  inventory: InventoryItem[];
  orders: Order[];
  locations: Location[];
  totalProducts: number;
}

export class SuggestionsEngine {
  private suggestions: Suggestion[] = [];

  /**
   * Analyse toutes les données et génère des suggestions
   */
  analyze(data: AnalysisData): Suggestion[] {
    this.suggestions = [];

    // 1. Analyser le stock faible
    this.analyzeLowStock(data.inventory);

    // 2. Analyser les commandes urgentes
    this.analyzeUrgentOrders(data.orders);

    // 3. Analyser la saturation des emplacements
    this.analyzeLocationSaturation(data.inventory, data.locations);

    // 4. Détecter les opportunités d'optimisation
    this.detectOptimizations(data);

    // 5. Suggestions proactives
    this.generateProactiveSuggestions(data);

    // Trier par priorité (high → medium → low)
    return this.suggestions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * 🔴 Détection stock faible - CRITIQUE
   */
  private analyzeLowStock(inventory: InventoryItem[]) {
    const lowStockItems = inventory.filter(item => item.quantity > 0 && item.quantity < 10);
    const outOfStockItems = inventory.filter(item => item.quantity === 0);

    if (outOfStockItems.length > 0) {
      this.suggestions.push({
        id: 'rupture-stock',
        type: 'urgent',
        title: `${outOfStockItems.length} produit${outOfStockItems.length > 1 ? 's' : ''} en rupture de stock !`,
        description: `Stock épuisé pour : ${outOfStockItems.slice(0, 3).map(i => i.product_name).join(', ')}${outOfStockItems.length > 3 ? '...' : ''}`,
        action: {
          label: 'Réapprovisionner',
          route: '/inventory'
        },
        priority: 'high',
        impact: 'Risque de perte de ventes'
      });
    }

    if (lowStockItems.length > 0) {
      this.suggestions.push({
        id: 'stock-faible',
        type: 'warning',
        title: `${lowStockItems.length} produit${lowStockItems.length > 1 ? 's' : ''} avec stock faible`,
        description: `Moins de 10 unités pour : ${lowStockItems.slice(0, 2).map(i => i.product_name).join(', ')}`,
        action: {
          label: 'Voir les alertes',
          route: '/inventory'
        },
        priority: 'high',
        impact: 'Commander avant rupture'
      });
    }
  }

  /**
   * 🟠 Détection commandes urgentes
   */
  private analyzeUrgentOrders(orders: Order[]) {
    const pendingOrders = orders.filter(o => o.status === 'pending');
    const oldPendingOrders = pendingOrders.filter(o => {
      const orderDate = new Date(o.created_at);
      const now = new Date();
      const diffInHours = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
      return diffInHours > 24; // Commandes en attente depuis plus de 24h
    });

    if (oldPendingOrders.length > 0) {
      this.suggestions.push({
        id: 'commandes-urgentes',
        type: 'urgent',
        title: `${oldPendingOrders.length} commande${oldPendingOrders.length > 1 ? 's' : ''} en attente depuis +24h`,
        description: 'Ces commandes nécessitent une action rapide pour éviter les retards',
        action: {
          label: 'Traiter les commandes',
          route: '/orders'
        },
        priority: 'high',
        impact: 'Satisfaction client'
      });
    }

    if (pendingOrders.length > 5) {
      this.suggestions.push({
        id: 'volume-commandes',
        type: 'warning',
        title: `${pendingOrders.length} commandes en attente de traitement`,
        description: 'Volume élevé de commandes à traiter',
        action: {
          label: 'Gérer les commandes',
          route: '/orders'
        },
        priority: 'medium',
        impact: 'Prioriser le picking'
      });
    }
  }

  /**
   * 🟡 Analyse saturation des emplacements
   */
  private analyzeLocationSaturation(inventory: InventoryItem[], locations: Location[]) {
    // Grouper inventory par location
    const locationStock: { [key: number]: number } = {};
    inventory.forEach(item => {
      if (!locationStock[item.location_id]) {
        locationStock[item.location_id] = 0;
      }
      locationStock[item.location_id] += item.quantity;
    });

    // Vérifier les locations proches de la capacité
    locations.forEach(location => {
      if (location.capacity) {
        const currentStock = locationStock[location.id] || 0;
        const usagePercent = (currentStock / location.capacity) * 100;

        if (usagePercent > 90) {
          this.suggestions.push({
            id: `saturation-${location.id}`,
            type: 'warning',
            title: `${location.name} saturé à ${Math.round(usagePercent)}%`,
            description: `Capacité presque atteinte (${currentStock}/${location.capacity} unités)`,
            action: {
              label: 'Réorganiser',
              route: '/locations'
            },
            priority: 'medium',
            impact: 'Réorganiser avant saturation'
          });
        }
      }
    });
  }

  /**
   * 💡 Détection opportunités d'optimisation
   */
  private detectOptimizations(data: AnalysisData) {
    // Suggestion si peu d'emplacements utilisés
    if (data.locations.length < 3) {
      this.suggestions.push({
        id: 'creer-emplacements',
        type: 'info',
        title: 'Optimisez votre organisation',
        description: 'Créez plus d\'emplacements pour mieux organiser votre stock',
        action: {
          label: 'Créer des zones',
          route: '/locations'
        },
        priority: 'low',
        impact: 'Meilleure organisation'
      });
    }

    // Suggestion si pas de mouvements récents
    if (data.inventory.length > 0 && data.orders.length === 0) {
      this.suggestions.push({
        id: 'premiere-commande',
        type: 'info',
        title: 'Créez votre première commande',
        description: 'Commencez à gérer vos commandes pour suivre vos ventes',
        action: {
          label: 'Nouvelle commande',
          route: '/orders'
        },
        priority: 'low',
        impact: 'Suivi des ventes'
      });
    }
  }

  /**
   * 🎯 Suggestions proactives basées sur patterns
   */
  private generateProactiveSuggestions(data: AnalysisData) {
    // Suggestion d'inventaire tournant si beaucoup de produits
    if (data.totalProducts > 5 && data.inventory.length > 0) {
      const avgQuantity = data.inventory.reduce((sum, item) => sum + item.quantity, 0) / data.inventory.length;

      if (avgQuantity > 50) {
        this.suggestions.push({
          id: 'inventaire-tournant',
          type: 'optimization',
          title: 'Inventaire tournant recommandé',
          description: `Stock moyen élevé (${Math.round(avgQuantity)} unités/produit). Un inventaire régulier améliore la précision.`,
          action: {
            label: 'Planifier inventaire',
            route: '/inventory'
          },
          priority: 'medium',
          impact: 'Précision du stock +15%'
        });
      }
    }

    // Suggestion exports de rapports
    if (data.orders.length > 3) {
      this.suggestions.push({
        id: 'exporter-rapports',
        type: 'optimization',
        title: 'Analysez vos performances',
        description: 'Exportez vos rapports pour analyser vos tendances de vente',
        action: {
          label: 'Voir les rapports',
          route: '/reports'
        },
        priority: 'low',
        impact: 'Meilleure visibilité'
      });
    }
  }
}

/**
 * Instance singleton du moteur de suggestions
 */
export const suggestionsEngine = new SuggestionsEngine();
