import { Square, Minus, MapPin, Trash2, RotateCw } from 'lucide-react';
import type { WarehouseComponent } from '../../lib/warehouse';
import { ZONE_COLORS } from '../../lib/warehouse';

interface DraggableComponentProps {
  component: WarehouseComponent;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onRotate: () => void;
  zoom: number;
}

export default function DraggableComponent({
  component,
  isSelected,
  onClick,
  onDelete,
  onRotate,
  zoom,
}: DraggableComponentProps) {
  const renderComponent = () => {
    switch (component.type) {
      case 'zone': {
        const zone = component;
        return (
          <div
            style={{
              width: zone.size.width,
              height: zone.size.height,
              backgroundColor: ZONE_COLORS[zone.category] + '20',
              border: `2px solid ${ZONE_COLORS[zone.category]}`,
            }}
            className="rounded-lg flex items-center justify-center relative group"
          >
            <Square className="w-6 h-6 text-gray-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">{zone.name}</span>
            </div>
          </div>
        );
      }

      case 'aisle': {
        const aisle = component;
        return (
          <div
            style={{
              width: aisle.size.width,
              height: aisle.size.height,
              backgroundColor: '#10B98120',
              border: '2px solid #10B981',
            }}
            className="rounded flex items-center justify-center relative group"
          >
            <Minus className="w-4 h-4 text-gray-400" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-700">{aisle.code}</span>
            </div>
          </div>
        );
      }

      case 'location': {
        const location = component;
        return (
          <div
            style={{
              width: location.size.width,
              height: location.size.height,
              backgroundColor: location.occupied ? '#EF444420' : '#F59E0B20',
              border: `2px solid ${location.occupied ? '#EF4444' : '#F59E0B'}`,
            }}
            className="rounded flex items-center justify-center relative group"
          >
            <MapPin className="w-3 h-3 text-gray-400" />
            <div className="absolute -bottom-5 left-0 right-0 flex justify-center">
              <span className="text-[10px] font-medium text-gray-600 bg-white px-1 rounded">
                {location.code}
              </span>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        position: 'absolute',
        left: component.position.x,
        top: component.position.y,
        transform: `rotate(${component.rotation}deg)`,
        cursor: 'pointer',
        zIndex: isSelected ? 10 : 1,
      }}
      className={`transition-all ${
        isSelected ? 'ring-4 ring-blue-500 ring-opacity-50' : 'hover:ring-2 hover:ring-blue-300'
      }`}
    >
      {renderComponent()}

      {/* Actions (visible on selection) */}
      {isSelected && (
        <div
          className="absolute -top-10 left-0 right-0 flex items-center justify-center space-x-1"
          style={{ transform: `scale(${1 / zoom})` }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRotate();
            }}
            className="p-1.5 bg-white border border-gray-300 rounded hover:bg-gray-50"
            title="Pivoter 90°"
          >
            <RotateCw className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 bg-white border border-red-300 rounded hover:bg-red-50 text-red-600"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
