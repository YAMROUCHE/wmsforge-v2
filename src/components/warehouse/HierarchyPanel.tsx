import { ChevronRight, ChevronDown, Building2, Square, Minus, Layers, Package, MapPin, Box, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import type { WarehouseComponent } from '../../lib/warehouse';

interface HierarchyPanelProps {
  components: WarehouseComponent[];
  selectedId: string | null;
  onSelectComponent: (id: string) => void;
  onDeleteComponent: (id: string) => void;
}

export default function HierarchyPanel({
  components,
  selectedId,
  onSelectComponent,
  onDeleteComponent,
}: HierarchyPanelProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(components.map(c => c.id)));

  // Construire l'arbre hiérarchique
  const buildTree = () => {
    const roots = components.filter(c => !c.parentId);
    
    const getChildren = (parentId: string): WarehouseComponent[] => {
      return components.filter(c => c.parentId === parentId);
    };

    const renderNode = (component: WarehouseComponent, depth: number = 0): JSX.Element => {
      const children = getChildren(component.id);
      const hasChildren = children.length > 0;
      const isExpanded = expanded.has(component.id);
      const isSelected = selectedId === component.id;

      const toggleExpand = () => {
        const newExpanded = new Set(expanded);
        if (isExpanded) {
          newExpanded.delete(component.id);
        } else {
          newExpanded.add(component.id);
        }
        setExpanded(newExpanded);
      };

      const getIcon = () => {
        const iconClass = "w-4 h-4";
        switch (component.type) {
          case 'warehouse': return <Building2 className={iconClass} />;
          case 'zone': return <Square className={iconClass} />;
          case 'aisle': return <Minus className={iconClass} />;
          case 'level': return <Layers className={iconClass} />;
          case 'rack': return <Package className={iconClass} />;
          case 'location': return <MapPin className={iconClass} />;
          case 'pallet': return <Box className={iconClass} />;
        }
      };

      const getLabel = () => {
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

      return (
        <div key={component.id}>
          <div
            className={`flex items-center px-2 py-1.5 hover:bg-gray-100 cursor-pointer rounded ${
              isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
            style={{ paddingLeft: `${depth * 16 + 8}px` }}
            onClick={() => onSelectComponent(component.id)}
          >
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand();
                }}
                className="mr-1 p-0.5 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-gray-500" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4 mr-1" />}
            
            <div className="text-gray-600 mr-2">{getIcon()}</div>
            
            <span className={`text-sm flex-1 truncate ${
              isSelected ? 'font-medium text-blue-900' : 'text-gray-700'
            }`}>
              {getLabel()}
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteComponent(component.id);
              }}
              className="p-1 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100"
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3 text-red-500" />
            </button>
          </div>

          {hasChildren && isExpanded && (
            <div>
              {children.map(child => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    return roots.map(root => renderNode(root));
  };

  return (
    <div className="w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Hiérarchie</h3>
        <p className="text-xs text-gray-500 mt-1">
          {components.length} composant{components.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="p-2">
        {components.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Aucun composant
          </div>
        ) : (
          <div className="space-y-0.5">
            {buildTree()}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-1">
          <p className="font-medium">💡 Navigation</p>
          <p>• Cliquez pour sélectionner</p>
          <p>• Chevrons pour replier/déplier</p>
          <p>• L'indentation montre la hiérarchie</p>
        </div>
      </div>
    </div>
  );
}
