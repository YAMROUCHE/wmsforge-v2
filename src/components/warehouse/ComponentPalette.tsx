import { Square, Minus, MapPin } from 'lucide-react';
import type { ComponentType } from '../../lib/warehouse';

interface ComponentPaletteProps {
  onSelectComponent: (type: ComponentType) => void;
  selectedType: ComponentType | null;
}

const COMPONENTS = [
  {
    type: 'zone' as ComponentType,
    icon: Square,
    label: 'Zone',
    description: 'Grande surface (réception, stockage...)',
    color: 'bg-blue-500',
  },
  {
    type: 'aisle' as ComponentType,
    icon: Minus,
    label: 'Allée',
    description: 'Couloir entre les zones',
    color: 'bg-green-500',
  },
  {
    type: 'location' as ComponentType,
    icon: MapPin,
    label: 'Emplacement',
    description: 'Position de stockage précise',
    color: 'bg-orange-500',
  },
];

export default function ComponentPalette({ onSelectComponent, selectedType }: ComponentPaletteProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-3">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Composants</h3>
        <p className="text-xs text-gray-500">Cliquez pour sélectionner</p>
      </div>

      <div className="space-y-2">
        {COMPONENTS.map((component) => {
          const Icon = component.icon;
          const isSelected = selectedType === component.type;

          return (
            <button
              key={component.type}
              onClick={() => onSelectComponent(component.type)}
              className={`w-full flex items-start p-3 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${component.color} mr-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {component.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{component.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 mt-4 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-900 mb-1">💡 Astuce</p>
          <p className="text-xs text-blue-700">
            Sélectionnez un composant puis cliquez sur le canvas pour le placer
          </p>
        </div>
      </div>
    </div>
  );
}
