import { Building2, Square, Minus, Layers, Package, MapPin, Box, Trash2, RotateCw } from 'lucide-react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { WarehouseComponent } from '../../lib/warehouse';
import { getDepth, HIERARCHY_RULES, ZONE_COLORS } from '../../lib/warehouse';

interface DraggableComponentProps {
  component: WarehouseComponent;
  isSelected: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  onDelete: () => void;
  onRotate: () => void;
  zoom: number;
  isDraggedOver?: boolean;
}

export default function DraggableComponent({
  component,
  isSelected,
  onClick,
  onDoubleClick,
  onDelete,
  onRotate,
  zoom,
  isDraggedOver = false,
}: DraggableComponentProps) {
  const { attributes, listeners, setNodeRef: setDragRef, isDragging } = useDraggable({
    id: component.id,
    data: component,
  });

  const canHaveChildren = HIERARCHY_RULES[component.type]?.length > 0;
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: component.id,
    disabled: !canHaveChildren,
    data: { type: component.type, component },
  });

  const setRefs = (element: HTMLDivElement | null) => {
    setDragRef(element);
    if (canHaveChildren) {
      setDropRef(element);
    }
  };

  const getColor = () => {
    switch (component.type) {
      case 'warehouse': return { bg: '#F3F4F6', border: '#6B7280' };
      case 'zone': return { bg: ZONE_COLORS[component.category] + '20', border: ZONE_COLORS[component.category] };
      case 'aisle': return { bg: '#10B98120', border: '#10B981' };
      case 'level': return { bg: '#8B5CF620', border: '#8B5CF6' };
      case 'rack': return { bg: '#6366F120', border: '#6366F1' };
      case 'location': 
        const loc = component;
        return { bg: loc.occupied ? '#EF444420' : '#F59E0B20', border: loc.occupied ? '#EF4444' : '#F59E0B' };
      case 'pallet': return { bg: '#F59E0B30', border: '#F59E0B' };
    }
  };

  const renderIcon = () => {
    const iconClass = "text-gray-600";
    const size = 18;
    
    switch (component.type) {
      case 'warehouse': return <Building2 className={iconClass} size={size} />;
      case 'zone': return <Square className={iconClass} size={size} />;
      case 'aisle': return <Minus className={iconClass} size={size} />;
      case 'level': return <Layers className={iconClass} size={size} />;
      case 'rack': return <Package className={iconClass} size={size} />;
      case 'location': return <MapPin className={iconClass} size={size} />;
      case 'pallet': return <Box className={iconClass} size={size} />;
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
        return `N${component.levelNumber}`;
      case 'pallet':
        return component.palletId;
      default:
        return component.name;
    }
  };

  const colors = getColor();
  const hasChildren = canHaveChildren;

  return (
    <div
      ref={setRefs}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onDoubleClick) onDoubleClick();
      }}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        width: component.size.width,
        height: component.size.height,
        transform: `rotate(${component.rotation}deg)`,
        cursor: isDragging ? 'grabbing' : hasChildren ? 'pointer' : 'grab',
        zIndex: isSelected ? 100 : 10 + getDepth(component.type) * 5,
        backgroundColor: colors.bg,
        border: `${(isOver || isDraggedOver) ? '4' : isSelected ? '3' : '2'}px solid ${(isOver || isDraggedOver) ? '#10B981' : colors.border}`,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={`rounded-lg flex flex-col items-center justify-center relative transition-all
        ${isSelected ? 'shadow-lg' : 'shadow'}
        ${hasChildren ? 'hover:shadow-md' : ''}
      `}
    >
      {/* Icône */}
      <div className="mb-1">
        {renderIcon()}
      </div>

      {/* Label */}
      <div className="text-sm font-medium text-gray-800 truncate max-w-full px-2">
        {getLabel()}
      </div>

      {/* Badge "Double-clic" si a des enfants */}
      {hasChildren && !isDragging && (
        <div className="absolute bottom-1 right-1 text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full opacity-70">
          ⏎
        </div>
      )}

      {/* Drop indicator */}
      {(isOver || isDraggedOver) && hasChildren && (
        <div className="absolute inset-0 flex items-center justify-center bg-green-400 bg-opacity-20 rounded-lg border-4 border-green-400 border-dashed">
          <div className="text-sm font-bold text-green-900 bg-green-100 px-3 py-1 rounded-full">
            Déposer ici
          </div>
        </div>
      )}

      {/* Actions */}
      {isSelected && (
        <div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white rounded-lg shadow-xl p-1 border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            title="Pivoter 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
