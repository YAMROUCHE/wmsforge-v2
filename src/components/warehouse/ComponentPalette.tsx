import { Building2, Square, Minus, Layers, Package, MapPin, Box } from 'lucide-react';
import DraggablePaletteItem from './DraggablePaletteItem';
import type { ComponentType } from '../../lib/warehouse';
import { ZONE_COLORS } from '../../lib/warehouse';

interface ComponentPaletteProps {
  onSelectComponent: (type: ComponentType) => void;
  selectedType: ComponentType | null;
}

const COMPONENTS = [
  {
    type: 'warehouse' as ComponentType,
    icon: Building2,
    label: 'Entrepôt',
    description: 'Bâtiment principal',
    color: 'bg-gray-600',
    depth: 0,
  },
  {
    type: 'zone' as ComponentType,
    icon: Square,
    label: 'Zone',
    description: 'Réception, stockage, picking...',
    color: 'bg-blue-500',
    depth: 1,
  },
  {
    type: 'aisle' as ComponentType,
    icon: Minus,
    label: 'Allée',
    description: 'Couloir de circulation',
    color: 'bg-green-500',
    depth: 2,
  },
  {
    type: 'level' as ComponentType,
    icon: Layers,
    label: 'Niveau/Étage',
    description: 'Niveau de stockage',
    color: 'bg-purple-500',
    depth: 3,
  },
  {
    type: 'rack' as ComponentType,
    icon: Package,
    label: 'Étagère/Rack',
    description: 'Structure de rangement',
    color: 'bg-indigo-500',
    depth: 4,
  },
  {
    type: 'location' as ComponentType,
    icon: MapPin,
    label: 'Emplacement',
    description: 'Position de stockage',
    color: 'bg-orange-500',
    depth: 5,
  },
  {
    type: 'pallet' as ComponentType,
    icon: Box,
    label: 'Palette',
    description: 'Support de stockage',
    color: 'bg-amber-500',
    depth: 6,
  },
];

export default function ComponentPalette({ onSelectComponent, selectedType }: ComponentPaletteProps) {
  return (
    <div className="w-72 bg-white border-r border-gray-200 p-4 space-y-3 overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Composants</h3>
        <p className="text-xs text-gray-500">Glissez-déposez sur le canvas</p>
      </div>

      {/* Hiérarchie visuelle */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs font-medium text-blue-900 mb-2">📊 Hiérarchie</p>
        <div className="text-xs text-blue-700 space-y-0.5">
          <div>🏢 Entrepôt</div>
          <div className="ml-2">└─ 📦 Zone</div>
          <div className="ml-4">└─ 🚪 Allée</div>
          <div className="ml-6">└─ 📊 Niveau</div>
          <div className="ml-8">└─ 📚 Rack</div>
          <div className="ml-10">└─ 📍 Emplacement</div>
          <div className="ml-12">└─ 🎨 Palette</div>
        </div>
      </div>

      <div className="space-y-2">
        {COMPONENTS.map((component) => (
          <DraggablePaletteItem
            key={component.type}
            type={component.type}
            icon={component.icon}
            label={component.label}
            description={component.description}
            color={component.color}
            depth={component.depth}
            isSelected={selectedType === component.type}
            onClick={() => onSelectComponent(component.type)}
          />
        ))}
      </div>

      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-xs font-medium text-amber-900 mb-1">💡 Astuce</p>
          <p className="text-xs text-amber-700">
            Glissez un composant sur un parent compatible. Ex: Allée → Zone
          </p>
        </div>
      </div>

      {/* Zone types */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-900 mb-2">Types de zones</p>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: ZONE_COLORS.receiving }}></div>
            <span className="text-gray-700">Réception</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: ZONE_COLORS.storage }}></div>
            <span className="text-gray-700">Stockage</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: ZONE_COLORS.picking }}></div>
            <span className="text-gray-700">Picking</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: ZONE_COLORS.shipping }}></div>
            <span className="text-gray-700">Expédition</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded mr-2" style={{ backgroundColor: ZONE_COLORS.returns }}></div>
            <span className="text-gray-700">Retours</span>
          </div>
        </div>
      </div>
    </div>
  );
}
