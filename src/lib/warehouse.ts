// Types pour l'éditeur d'entrepôt

export type ComponentType = 'zone' | 'aisle' | 'location';

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
}

export interface Zone extends BaseComponent {
  type: 'zone';
  color: string;
  category: 'receiving' | 'storage' | 'shipping' | 'returns' | 'custom';
}

export interface Aisle extends BaseComponent {
  type: 'aisle';
  zoneId: string | null;
  code: string;
  direction: 'horizontal' | 'vertical';
}

export interface Location extends BaseComponent {
  type: 'location';
  aisleId: string | null;
  code: string;
  capacity: number;
  occupied: boolean;
}

export type WarehouseComponent = Zone | Aisle | Location;

export interface WarehouseLayout {
  id?: number;
  name: string;
  components: WarehouseComponent[];
  gridSize: number; // Taille de la grille (ex: 20px)
  canvasSize: { width: number; height: number };
  createdAt?: string;
  updatedAt?: string;
}

// Templates pré-définis
export interface WarehouseTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  layout: WarehouseLayout;
}

// Helpers
export const GRID_SIZE = 20;
export const SNAP_THRESHOLD = 10;

export const ZONE_COLORS = {
  receiving: '#3B82F6',
  storage: '#10B981',
  shipping: '#F59E0B',
  returns: '#EF4444',
  custom: '#6B7280',
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const snapToGrid = (value: number, gridSize: number = GRID_SIZE): number => {
  return Math.round(value / gridSize) * gridSize;
};

export const generateLocationCode = (aisleCode: string, index: number): string => {
  const level = Math.floor(index / 10) + 1;
  const position = (index % 10) + 1;
  return `${aisleCode}-${String(level).padStart(2, '0')}-${String(position).padStart(2, '0')}`;
};
