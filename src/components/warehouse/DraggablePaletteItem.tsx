import { useDraggable } from '@dnd-kit/core';
import type { ComponentType } from '../../lib/warehouse';

interface DraggablePaletteItemProps {
  type: ComponentType;
  icon: any;
  label: string;
  description: string;
  color: string;
  depth: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function DraggablePaletteItem({
  type,
  icon: Icon,
  label,
  description,
  color,
  depth,
  isSelected,
  onClick,
}: DraggablePaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`w-full flex items-start p-3 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      } ${isDragging ? 'opacity-50' : ''}`}
      style={{
        marginLeft: `${depth * 8}px`,
      }}
    >
      <div className={`p-2 rounded-lg ${color} mr-3 flex-shrink-0`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className={`text-sm font-medium truncate ${
          isSelected ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
    </div>
  );
}
