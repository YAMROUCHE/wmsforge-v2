/**
 * 🎯 Moteur d'Optimisation des Emplacements - 1WMS.io
 *
 * Analyse les patterns de picking et suggère les emplacements optimaux
 * pour minimiser les temps de déplacement et maximiser l'efficacité.
 */

export interface LocationOptimization {
  id: string;
  product_id: number;
  product_name: string;
  current_location: string;
  current_location_id: number;
  suggested_location?: string;
  suggested_location_id?: number;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  impact: string;
  metrics: {
    picking_frequency: number; // Nombre de fois pické par mois
    movement_count: number; // Nombre total de mouvements
    current_distance: number; // Distance actuelle (simulée)
    suggested_distance?: number; // Distance suggérée
    time_saved?: number; // Temps économisé en secondes
  };
}

interface Movement {
  id: number;
  product_id: number;
  product_name: string;
  type: string;
  quantity: number;
  created_at: string;
  location_id: number;
  location_name?: string;
}

interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  location_id: number;
  location_name?: string;
}

interface Location {
  id: number;
  name: string;
  type: string;
  zone?: string;
  capacity: number | null;
}

interface Order {
  id: number;
  status: string;
  created_at: string;
}

interface AnalysisData {
  movements: Movement[];
  inventory: InventoryItem[];
  locations: Location[];
  orders: Order[];
}

export class LocationOptimizer {
  /**
   * Analyse les données et génère des recommandations d'optimisation
   */
  optimize(data: AnalysisData): LocationOptimization[] {
    const optimizations: LocationOptimization[] = [];

    // 1. Calculer la fréquence de picking par produit
    const pickingFrequency = this.calculatePickingFrequency(data.movements);

    // 2. Identifier les produits à forte rotation (top 20%)
    const highRotationProducts = this.identifyHighRotationProducts(
      pickingFrequency,
      data.inventory
    );

    // 3. Identifier les produits à faible rotation (bottom 20%)
    const lowRotationProducts = this.identifyLowRotationProducts(
      pickingFrequency,
      data.inventory
    );

    // 4. Générer des suggestions pour les produits à forte rotation
    highRotationProducts.forEach(product => {
      const optimization = this.optimizeHighRotationProduct(product, data);
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    // 5. Générer des suggestions pour les produits à faible rotation
    lowRotationProducts.forEach(product => {
      const optimization = this.optimizeLowRotationProduct(product, data);
      if (optimization) {
        optimizations.push(optimization);
      }
    });

    // 6. Détecter les produits mal placés (forte rotation en zone éloignée)
    const misplacedProducts = this.detectMisplacedProducts(data);
    optimizations.push(...misplacedProducts);

    // Trier par priorité (high → medium → low)
    return optimizations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Calcule la fréquence de picking (mouvements de type 'ship') par produit
   */
  private calculatePickingFrequency(movements: Movement[]): Map<number, number> {
    const frequency = new Map<number, number>();

    movements
      .filter(m => m.type === 'ship') // Uniquement les expéditions
      .forEach(movement => {
        const current = frequency.get(movement.product_id) || 0;
        frequency.set(movement.product_id, current + 1);
      });

    return frequency;
  }

  /**
   * Identifie les produits à forte rotation (top 20%)
   */
  private identifyHighRotationProducts(
    frequency: Map<number, number>,
    inventory: InventoryItem[]
  ): InventoryItem[] {
    const threshold = this.calculateRotationThreshold(frequency, 0.8); // Top 20%

    return inventory.filter(item => {
      const freq = frequency.get(item.product_id) || 0;
      return freq >= threshold && freq > 0;
    });
  }

  /**
   * Identifie les produits à faible rotation (bottom 20%)
   */
  private identifyLowRotationProducts(
    frequency: Map<number, number>,
    inventory: InventoryItem[]
  ): InventoryItem[] {
    const threshold = this.calculateRotationThreshold(frequency, 0.2); // Bottom 20%

    return inventory.filter(item => {
      const freq = frequency.get(item.product_id) || 0;
      return freq <= threshold && freq >= 0;
    });
  }

  /**
   * Calcule le seuil de rotation (percentile)
   */
  private calculateRotationThreshold(
    frequency: Map<number, number>,
    percentile: number
  ): number {
    const frequencies = Array.from(frequency.values()).sort((a, b) => a - b);
    if (frequencies.length === 0) return 0;

    const index = Math.floor(frequencies.length * percentile);
    return frequencies[index] || 0;
  }

  /**
   * Optimise un produit à forte rotation
   * Suggestion : placer en zone de picking rapide (proche expédition)
   */
  private optimizeHighRotationProduct(
    product: InventoryItem,
    data: AnalysisData
  ): LocationOptimization | null {
    const currentLocation = data.locations.find(l => l.id === product.location_id);
    if (!currentLocation) return null;

    // Vérifier si le produit est déjà dans une zone optimale (PICK, FAST, A)
    const isOptimalZone = currentLocation.type === 'pick' ||
      currentLocation.name.toLowerCase().includes('pick') ||
      currentLocation.name.toLowerCase().includes('fast') ||
      currentLocation.zone === 'A';

    if (isOptimalZone) return null; // Déjà optimal

    // Chercher une zone de picking rapide disponible
    const optimalLocation = data.locations.find(l =>
      (l.type === 'pick' ||
       l.name.toLowerCase().includes('pick') ||
       l.name.toLowerCase().includes('fast') ||
       l.zone === 'A') &&
      l.id !== product.location_id
    );

    if (!optimalLocation) return null;

    const movementCount = this.getProductMovementCount(product.product_id, data.movements);

    return {
      id: `optimize-high-${product.id}`,
      product_id: product.product_id,
      product_name: product.product_name,
      current_location: currentLocation.name,
      current_location_id: currentLocation.id,
      suggested_location: optimalLocation.name,
      suggested_location_id: optimalLocation.id,
      priority: 'high',
      reason: `Produit à forte rotation (${movementCount} mouvements)`,
      impact: 'Réduction temps picking -40%',
      metrics: {
        picking_frequency: movementCount,
        movement_count: movementCount,
        current_distance: 100, // Simulé
        suggested_distance: 30, // Simulé
        time_saved: 45 // Simulé en secondes
      }
    };
  }

  /**
   * Optimise un produit à faible rotation
   * Suggestion : placer en zone de stockage profond (zone C, reserve)
   */
  private optimizeLowRotationProduct(
    product: InventoryItem,
    data: AnalysisData
  ): LocationOptimization | null {
    const currentLocation = data.locations.find(l => l.id === product.location_id);
    if (!currentLocation) return null;

    // Vérifier si le produit est dans une zone premium (PICK, FAST, A)
    const isPremiumZone = currentLocation.type === 'pick' ||
      currentLocation.name.toLowerCase().includes('pick') ||
      currentLocation.name.toLowerCase().includes('fast') ||
      currentLocation.zone === 'A';

    if (!isPremiumZone) return null; // Déjà dans une zone appropriée

    // Chercher une zone de stockage profond
    const storageLocation = data.locations.find(l =>
      (l.type === 'storage' ||
       l.name.toLowerCase().includes('reserve') ||
       l.name.toLowerCase().includes('storage') ||
       l.zone === 'C') &&
      l.id !== product.location_id
    );

    if (!storageLocation) return null;

    const movementCount = this.getProductMovementCount(product.product_id, data.movements);

    return {
      id: `optimize-low-${product.id}`,
      product_id: product.product_id,
      product_name: product.product_name,
      current_location: currentLocation.name,
      current_location_id: currentLocation.id,
      suggested_location: storageLocation.name,
      suggested_location_id: storageLocation.id,
      priority: 'medium',
      reason: `Produit à faible rotation (${movementCount} mouvements)`,
      impact: 'Libère espace premium',
      metrics: {
        picking_frequency: movementCount,
        movement_count: movementCount,
        current_distance: 30,
        suggested_distance: 100,
        time_saved: 0
      }
    };
  }

  /**
   * Détecte les produits mal placés
   */
  private detectMisplacedProducts(data: AnalysisData): LocationOptimization[] {
    const misplaced: LocationOptimization[] = [];
    const frequency = this.calculatePickingFrequency(data.movements);

    data.inventory.forEach(item => {
      const pickFreq = frequency.get(item.product_id) || 0;
      const location = data.locations.find(l => l.id === item.location_id);

      if (!location || pickFreq === 0) return;

      // Produit très actif dans une zone éloignée
      if (pickFreq >= 5 && location.zone === 'C') {
        const optimalLoc = data.locations.find(l => l.zone === 'A');
        if (optimalLoc) {
          misplaced.push({
            id: `misplaced-${item.id}`,
            product_id: item.product_id,
            product_name: item.product_name,
            current_location: location.name,
            current_location_id: location.id,
            suggested_location: optimalLoc.name,
            suggested_location_id: optimalLoc.id,
            priority: 'high',
            reason: `Produit actif en zone C (${pickFreq} picks/mois)`,
            impact: 'Économie 2min par picking',
            metrics: {
              picking_frequency: pickFreq,
              movement_count: pickFreq,
              current_distance: 150,
              suggested_distance: 25,
              time_saved: 120
            }
          });
        }
      }
    });

    return misplaced;
  }

  /**
   * Compte le nombre de mouvements pour un produit
   */
  private getProductMovementCount(productId: number, movements: Movement[]): number {
    return movements.filter(m => m.product_id === productId && m.type === 'ship').length;
  }
}

/**
 * Instance singleton du moteur d'optimisation
 */
export const locationOptimizer = new LocationOptimizer();
