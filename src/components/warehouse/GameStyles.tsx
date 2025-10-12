import type { ComponentType } from '../../lib/warehouse';

// Patterns CSS pour les textures "jeu vidéo"
export const getGameTexture = (type: ComponentType): string => {
  switch (type) {
    case 'warehouse':
      // Sol en béton avec lignes
      return `
        repeating-linear-gradient(
          90deg,
          #e5e7eb 0px,
          #e5e7eb 2px,
          #f3f4f6 2px,
          #f3f4f6 20px
        ),
        repeating-linear-gradient(
          0deg,
          #e5e7eb 0px,
          #e5e7eb 2px,
          #f3f4f6 2px,
          #f3f4f6 20px
        )
      `;
    
    case 'zone':
      // Zone avec damier
      return `
        repeating-conic-gradient(
          from 45deg,
          #3B82F620 0deg 90deg,
          #3B82F610 90deg 180deg
        )
      `;
    
    case 'aisle':
      // Allée avec lignes de circulation
      return `
        linear-gradient(
          90deg,
          #10B98140 0%,
          #10B98120 10%,
          #10B98120 90%,
          #10B98140 100%
        ),
        repeating-linear-gradient(
          0deg,
          transparent 0px,
          transparent 8px,
          #ffffff30 8px,
          #ffffff30 10px
        )
      `;
    
    case 'level':
      // Niveau avec planches horizontales
      return `
        repeating-linear-gradient(
          0deg,
          #8B5CF630 0px,
          #8B5CF630 8px,
          #8B5CF620 8px,
          #8B5CF620 10px
        )
      `;
    
    case 'rack':
      // Rack avec structure métallique
      return `
        linear-gradient(90deg, #6366F140 0%, #6366F120 50%, #6366F140 100%),
        repeating-linear-gradient(
          90deg,
          transparent 0px,
          transparent 18px,
          #6366F160 18px,
          #6366F160 20px
        )
      `;
    
    case 'location':
      // Emplacement avec motif de palette
      return `
        repeating-linear-gradient(
          90deg,
          #F59E0B30 0px,
          #F59E0B30 6px,
          transparent 6px,
          transparent 8px
        )
      `;
    
    case 'pallet':
      // Palette en bois
      return `
        repeating-linear-gradient(
          90deg,
          #D97706 0px,
          #D97706 10px,
          #B45309 10px,
          #B45309 12px
        )
      `;
    
    default:
      return 'none';
  }
};

// Ombre portée pour effet 3D
export const getGameShadow = (type: ComponentType, isSelected: boolean): string => {
  const baseDepth = {
    warehouse: 0,
    zone: 2,
    aisle: 4,
    level: 6,
    rack: 8,
    location: 10,
    pallet: 12,
  }[type];

  if (isSelected) {
    return `
      0 ${baseDepth + 4}px ${baseDepth * 2}px rgba(59, 130, 246, 0.3),
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 -2px 4px rgba(0, 0, 0, 0.1)
    `;
  }

  return `
    0 ${baseDepth}px ${baseDepth * 2}px rgba(0, 0, 0, 0.15),
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1)
  `;
};

// Bordure style "jeu vidéo"
export const getGameBorder = (type: ComponentType, isSelected: boolean, isDraggedOver: boolean): string => {
  if (isDraggedOver) {
    return '4px solid #10B981';
  }

  const colors = {
    warehouse: '#6B7280',
    zone: '#3B82F6',
    aisle: '#10B981',
    level: '#8B5CF6',
    rack: '#6366F1',
    location: '#F59E0B',
    pallet: '#D97706',
  };

  const width = isSelected ? '3px' : '2px';
  return `${width} solid ${colors[type]}`;
};

// Effet de survol
export const getGameHoverEffect = (): string => {
  return `
    filter: brightness(1.1) contrast(1.05);
    transform: translateY(-2px);
  `;
};
