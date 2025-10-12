import { ChevronRight, Home, ArrowUp } from 'lucide-react';
import type { WarehouseComponent } from '../../lib/warehouse';

interface BreadcrumbNavProps {
  components: WarehouseComponent[];
  currentViewId: string | null;
  onNavigate: (id: string | null) => void;
}

export default function BreadcrumbNav({ components, currentViewId, onNavigate }: BreadcrumbNavProps) {
  // Construire le chemin du breadcrumb
  const buildPath = (): WarehouseComponent[] => {
    if (!currentViewId) return [];
    
    const path: WarehouseComponent[] = [];
    let current = components.find(c => c.id === currentViewId);
    
    while (current) {
      path.unshift(current);
      current = current.parentId ? components.find(c => c.id === current!.parentId) : undefined;
    }
    
    return path;
  };

  const path = buildPath();
  const currentComponent = currentViewId ? components.find(c => c.id === currentViewId) : null;

  const getLabel = (component: WarehouseComponent) => {
    switch (component.type) {
      case 'warehouse':
      case 'zone':
        return component.name;
      case 'aisle':
      case 'rack':
      case 'location':
        return component.code;
      case 'level':
        return `Niveau ${component.levelNumber}`;
      case 'pallet':
        return component.palletId;
    }
  };

  const canGoUp = currentViewId !== null;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center space-x-2">
      {/* Bouton Home */}
      <button
        onClick={() => onNavigate(null)}
        className={`p-2 rounded-lg transition-all ${
          !currentViewId
            ? 'bg-blue-100 text-blue-600'
            : 'text-gray-500 hover:bg-gray-100'
        }`}
        title="Vue racine"
      >
        <Home className="w-4 h-4" />
      </button>

      {/* Bouton Remonter */}
      {canGoUp && (
        <button
          onClick={() => {
            const parent = currentComponent?.parentId || null;
            onNavigate(parent);
          }}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all"
          title="Remonter d'un niveau"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      {/* Séparateur */}
      <div className="h-6 w-px bg-gray-300" />

      {/* Breadcrumb */}
      <div className="flex items-center space-x-1 overflow-x-auto">
        {path.length === 0 ? (
          <span className="text-sm text-gray-500 font-medium">Vue d'ensemble</span>
        ) : (
          <>
            {path.map((component, index) => (
              <div key={component.id} className="flex items-center space-x-1">
                <button
                  onClick={() => onNavigate(component.id)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    index === path.length - 1
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {getLabel(component)}
                </button>
                {index < path.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {/* Info contextuelle */}
      {currentComponent && (
        <div className="ml-auto flex items-center space-x-2 text-xs text-gray-500">
          <span>
            {components.filter(c => c.parentId === currentViewId).length} élément(s)
          </span>
        </div>
      )}
    </div>
  );
}
