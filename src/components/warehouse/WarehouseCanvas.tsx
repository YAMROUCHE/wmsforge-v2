import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import DraggableComponent from './DraggableComponent';
import type { WarehouseComponent, ComponentType } from '../../lib/warehouse';
import { GRID_SIZE, snapToGrid } from '../../lib/warehouse';

interface WarehouseCanvasProps {
  components: WarehouseComponent[];
  selectedId: string | null;
  selectedType: ComponentType | null;
  showGrid: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onComponentClick: (id: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onComponentDelete: (id: string) => void;
  onComponentRotate: (id: string) => void;
}

export default function WarehouseCanvas({
  components,
  selectedId,
  selectedType,
  showGrid,
  zoom,
  onZoomChange,
  onComponentClick,
  onCanvasClick,
  onComponentDelete,
  onComponentRotate,
}: WarehouseCanvasProps) {
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = snapToGrid((e.clientX - rect.left) / zoom);
      const y = snapToGrid((e.clientY - rect.top) / zoom);
      onCanvasClick(x, y);
    }
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <TransformWrapper
        initialScale={zoom}
        minScale={0.2}
        maxScale={2}
        onZoom={(ref) => onZoomChange(ref.state.scale)}
        wheel={{ step: 0.05 }}
        panning={{ velocityDisabled: true }}
        doubleClick={{ disabled: true }}
      >
        <TransformComponent
          wrapperStyle={{
            width: '100%',
            height: '100%',
          }}
          contentStyle={{
            width: '100%',
            height: '100%',
          }}
        >
          <div
            onClick={handleCanvasClick}
            className="relative w-full h-full min-h-[800px] min-w-[1200px]"
            style={{
              backgroundImage: showGrid
                ? `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
                `
                : 'none',
              backgroundSize: showGrid ? `${GRID_SIZE}px ${GRID_SIZE}px` : 'auto',
            }}
          >
            {/* Render all components */}
            {components.map((component) => (
              <DraggableComponent
                key={component.id}
                component={component}
                isSelected={selectedId === component.id}
                onClick={() => onComponentClick(component.id)}
                onDelete={() => onComponentDelete(component.id)}
                onRotate={() => onComponentRotate(component.id)}
                zoom={zoom}
              />
            ))}

            {/* Cursor indicator when a type is selected */}
            {selectedType && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
                Cliquez sur le canvas pour placer : {selectedType === 'zone' ? 'Zone' : selectedType === 'aisle' ? 'Allée' : 'Emplacement'}
              </div>
            )}

            {/* Instructions */}
            {components.length === 0 && !selectedType && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-400 text-lg font-medium mb-2">Canvas vide</p>
                  <p className="text-gray-500 text-sm">
                    Sélectionnez un composant dans la palette puis cliquez pour le placer
                  </p>
                </div>
              </div>
            )}
          </div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
