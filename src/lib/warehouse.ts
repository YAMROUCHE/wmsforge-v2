// Types professionnels pour WMS complet

export type ComponentType = 
  | 'warehouse'   // Entrepôt
  | 'zone'        // Zone (réception, stockage, expédition, picking, returns)
  | 'aisle'       // Allée
  | 'level'       // Niveau/Étage
  | 'rack'        // Étagère/Rack
  | 'location'    // Emplacement/Bin
  | 'pallet';     // Palette (optionnel)

export type ZoneCategory = 
  | 'receiving'   // Réception
  | 'storage'     // Stockage
  | 'picking'     // Picking
  | 'shipping'    // Expédition
  | 'returns'     // Retours
  | 'quarantine'  // Quarantaine
  | 'staging'     // Zone de transit
  | 'custom';     // Personnalisé

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseComponent {
  id: string;
  type: ComponentType;
  name: string;
  position: Position;
  size: Size;
  rotation: number; // 0, 90, 180, 270
  parentId: string | null; // ID du parent dans la hiérarchie
  depth: number; // Profondeur dans la hiérarchie (0 = warehouse, 1 = zone, etc.)
}

// Entrepôt (niveau 0)
export interface Warehouse extends BaseComponent {
  type: 'warehouse';
  totalArea: number; // Surface totale en m²
  address?: string;
  ceilingHeight?: number; // Hauteur sous plafond en m
  usableArea?: number; // Surface utile en m²
}

// Zone (niveau 1)
export interface Zone extends BaseComponent {
  type: 'zone';
  category: ZoneCategory;
  color: string;
  capacity?: number; // Capacité en palettes ou unités
  physicalWidth?: number; // Largeur réelle en m
  physicalDepth?: number; // Profondeur réelle en m
  temperature?: number; // Température en °C (pour zones froides)
}

// Allée (niveau 2)
export interface Aisle extends BaseComponent {
  type: 'aisle';
  code: string; // Ex: "A", "B", "C"
  direction: 'horizontal' | 'vertical';
  width: number; // Largeur de passage en cm
  physicalLength?: number; // Longueur réelle en m
  flowDirection?: 'bidirectional' | 'oneway'; // Sens de circulation
}

// Niveau/Étage (niveau 3)
export interface Level extends BaseComponent {
  type: 'level';
  levelNumber: number; // 1, 2, 3, etc.
  height: number; // Hauteur en cm
  maxWeight?: number; // Poids max en kg
  physicalHeight?: number; // Hauteur physique réelle en cm
}

// Étagère/Rack (niveau 4)
export interface Rack extends BaseComponent {
  type: 'rack';
  code: string; // Ex: "R01", "R02"
  bays: number; // Nombre de baies
  depth: number; // Profondeur en cm
  physicalWidth?: number; // Largeur réelle en cm
  physicalDepth?: number; // Profondeur réelle en cm
  physicalHeight?: number; // Hauteur réelle en cm
  loadCapacity?: number; // Capacité de charge en kg
}

// Emplacement/Bin (niveau 5)
export interface Location extends BaseComponent {
  type: 'location';
  code: string; // Ex: "A-01-01-01"
  capacity: number;
  occupied: boolean;
  barcode?: string;
  physicalWidth?: number; // Largeur en cm (ex: 120cm pour palette euro)
  physicalDepth?: number; // Profondeur en cm (ex: 80cm)
  physicalHeight?: number; // Hauteur disponible en cm
  weightCapacity?: number; // Capacité en kg
}

// Palette (niveau 6 - optionnel)
export interface Pallet extends BaseComponent {
  type: 'pallet';
  palletId: string;
  palletType: 'standard' | 'euro' | 'custom';
  status: 'empty' | 'partial' | 'full';
  physicalWidth?: number; // 120cm pour euro, 100x120 pour standard
  physicalDepth?: number; // 80cm pour euro
  physicalHeight?: number; // Hauteur de la marchandise
  weight?: number; // Poids actuel en kg
}

export type WarehouseComponent = 
  | Warehouse 
  | Zone 
  | Aisle 
  | Level 
  | Rack 
  | Location 
  | Pallet;

export interface WarehouseLayout {
  id?: number;
  name: string;
  components: WarehouseComponent[];
  gridSize: number;
  canvasSize: { width: number; height: number };
  createdAt?: string;
  updatedAt?: string;
}

// Hiérarchie permise (parent -> enfants autorisés)
export const HIERARCHY_RULES: Record<ComponentType | 'root', ComponentType[]> = {
  root: ['warehouse'], // Racine : peut contenir des entrepôts
  warehouse: ['zone'], // Entrepôt : contient des zones
  zone: ['aisle'], // Zone : contient des allées
  aisle: ['level'], // Allée : contient des niveaux
  level: ['rack'], // Niveau : contient des racks
  rack: ['location'], // Rack : contient des emplacements
  location: ['pallet'], // Emplacement : peut contenir une palette
  pallet: [], // Palette : ne contient rien
};

// Couleurs par type de zone
export const ZONE_COLORS: Record<ZoneCategory, string> = {
  receiving: '#3B82F6', // Bleu
  storage: '#10B981', // Vert
  picking: '#F59E0B', // Orange
  shipping: '#8B5CF6', // Violet
  returns: '#EF4444', // Rouge
  quarantine: '#F59E0B', // Orange
  staging: '#6B7280', // Gris
  custom: '#6B7280', // Gris
};

// Tailles par défaut par type
export const DEFAULT_SIZES: Record<ComponentType, Size> = {
  warehouse: { width: 400, height: 300 },
  zone: { width: 200, height: 150 },
  aisle: { width: 100, height: 20 },
  level: { width: 80, height: 15 },
  rack: { width: 60, height: 40 },
  location: { width: 40, height: 40 },
  pallet: { width: 30, height: 30 },
};

// Helpers
export const GRID_SIZE = 20;
export const SNAP_THRESHOLD = 10;

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const generateCode = (type: ComponentType, index: number): string => {
  switch (type) {
    case 'aisle':
      return String.fromCharCode(65 + index); // A, B, C...
    case 'level':
      return `N${index + 1}`; // N1, N2, N3...
    case 'rack':
      return `R${String(index + 1).padStart(2, '0')}`; // R01, R02...
    case 'location':
      return `L${String(index + 1).padStart(3, '0')}`; // L001, L002...
    case 'pallet':
      return `P${String(index + 1).padStart(4, '0')}`; // P0001, P0002...
    default:
      return `${type.toUpperCase()}-${index + 1}`;
  }
};

// Vérifier si un composant peut être enfant d'un autre
export const canBeChildOf = (childType: ComponentType, parentType: ComponentType | null): boolean => {
  if (parentType === null) {
    return HIERARCHY_RULES.root.includes(childType);
  }
  return HIERARCHY_RULES[parentType]?.includes(childType) || false;
};

// Calculer la profondeur dans la hiérarchie
export const getDepth = (type: ComponentType): number => {
  const depths: Record<ComponentType, number> = {
    warehouse: 0,
    zone: 1,
    aisle: 2,
    level: 3,
    rack: 4,
    location: 5,
    pallet: 6,
  };
  return depths[type];
};
