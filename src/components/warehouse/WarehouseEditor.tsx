import { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import ComponentPalette from './ComponentPalette';
import Toolbar from './Toolbar';
import WarehouseCanvas from './WarehouseCanvas';
import HierarchyPanel from './HierarchyPanel';
import BreadcrumbNav from './BreadcrumbNav';
import type { WarehouseComponent, ComponentType, WarehouseLayout } from '../../lib/warehouse';
import { generateId, snapToGrid, ZONE_COLORS, DEFAULT_SIZES, canBeChildOf, getDepth, generateCode, HIERARCHY_RULES } from '../../lib/warehouse';
import { useNotifications } from '@/contexts/NotificationContext';

interface WarehouseEditorProps {
  initialLayout?: WarehouseLayout;
  onSave: (layout: WarehouseLayout) => void;
}

export default function WarehouseEditor({ initialLayout, onSave }: WarehouseEditorProps) {
  // State
  const { addNotification } = useNotifications();
  const [components, setComponents] = useState<WarehouseComponent[]>(
    initialLayout?.components || []
  );
  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [draggedComponent, setDraggedComponent] = useState<WarehouseComponent | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [currentViewId, setCurrentViewId] = useState<string | null>(null);
  

  // Filtrer les composants selon la vue actuelle
  const getVisibleComponents = useCallback(() => {
    if (!currentViewId) {
      // Vue racine : afficher tous les composants sans parent
      return components.filter(c => !c.parentId);
    } else {
      // Vue d'un composant : afficher ses enfants directs
      return components.filter(c => c.parentId === currentViewId);
    }
  }, [components, currentViewId]);

  const visibleComponents = getVisibleComponents();


  // Filtrer les composants selon la vue actuelle


  // Undo/Redo
  const [history, setHistory] = useState<WarehouseComponent[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de mouvement avant d'activer le drag
      },
    })
  );

  // Save to history
  const saveToHistory = useCallback((newComponents: WarehouseComponent[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newComponents);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Create new component
  const createComponent = useCallback((
    type: ComponentType,
    x: number,
    y: number,
    parentId: string | null = null
  ): WarehouseComponent => {
    const id = generateId();
    const size = DEFAULT_SIZES[type];
    const count = components.filter(c => c.type === type).length;
    
    const baseComponent = {
      id,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${count + 1}`,
      position: { x: snapToGrid(x), y: snapToGrid(y) },
      size,
      rotation: 0,
      parentId,
      depth: getDepth(type),
    };

    switch (type) {
      case 'warehouse':
        return {
          ...baseComponent,
          type: 'warehouse',
          totalArea: size.width * size.height,
        };

      case 'zone':
        return {
          ...baseComponent,
          type: 'zone',
          color: ZONE_COLORS.storage,
          category: 'storage',
        };

      case 'aisle':
        return {
          ...baseComponent,
          type: 'aisle',
          code: generateCode('aisle', count),
          direction: 'horizontal',
          width: 100,
        };

      case 'level':
        return {
          ...baseComponent,
          type: 'level',
          levelNumber: count + 1,
          height: 250,
        };

      case 'rack':
        return {
          ...baseComponent,
          type: 'rack',
          code: generateCode('rack', count),
          bays: 3,
          depth: 80,
        };

      case 'location':
        return {
          ...baseComponent,
          type: 'location',
          code: generateCode('location', count),
          capacity: 1,
          occupied: false,
        };

      case 'pallet':
        return {
          ...baseComponent,
          type: 'pallet',
          palletId: generateCode('pallet', count),
          palletType: 'standard',
          status: 'empty',
        };

      default:
        return baseComponent as WarehouseComponent;
    }
  }, [components]);

  // Drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    // Si on drag depuis la palette (pas d'id existant)
    if (typeof active.id === 'string' && active.id.startsWith('palette-')) {
      const type = active.id.replace('palette-', '') as ComponentType;
      setSelectedType(type);
      setDraggedComponent(createComponent(type, 0, 0));
    } else {
      // On drag un composant existant
      const component = components.find(c => c.id === active.id);
      if (component) {
        setDraggedComponent(component);
      }
    }
  };

  // Helper: Calculate canvas drop position
  const calculateCanvasDropPosition = useCallback((event: DragEndEvent): { x: number; y: number } => {
    const canvasElement = document.querySelector('[data-canvas="true"]');
    if (!canvasElement) return { x: 0, y: 0 };

    const rect = canvasElement.getBoundingClientRect();
    const pointerEvent = event.activatorEvent as PointerEvent;

    return {
      x: (pointerEvent.clientX - rect.left) / zoom,
      y: (pointerEvent.clientY - rect.top) / zoom,
    };
  }, [zoom]);

  // Helper: Validate and get drop target
  interface DropTarget {
    valid: boolean;
    parentId: string | null;
    x: number;
    y: number;
  }

  const validateAndGetDropTarget = useCallback((
    overId: any,
    type: ComponentType,
    event: DragEndEvent
  ): DropTarget => {
    if (overId !== 'canvas') {
      const parent = components.find(c => c.id === overId);
      if (parent && canBeChildOf(type, parent.type)) {
        return {
          valid: true,
          parentId: parent.id,
          x: parent.position.x + 20,
          y: parent.position.y + 20,
        };
      }
      return { valid: false, parentId: null, x: 0, y: 0 };
    }

    const pos = calculateCanvasDropPosition(event);
    return { valid: true, parentId: null, x: pos.x, y: pos.y };
  }, [components, calculateCanvasDropPosition]);

  // Helper: Handle palette drop
  const handlePaletteDrop = useCallback((
    type: ComponentType,
    overId: any,
    event: DragEndEvent
  ) => {
    const dropTarget = validateAndGetDropTarget(overId, type, event);
    if (!dropTarget.valid) {
      setSelectedType(null);
      return;
    }

    const newComponent = createComponent(type, dropTarget.x, dropTarget.y, dropTarget.parentId);
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    saveToHistory(newComponents);
    setSelectedType(null);
    setSelectedId(newComponent.id);
  }, [components, validateAndGetDropTarget, saveToHistory]);

  // Helper: Update component position
  const updateComponentPosition = useCallback((
    componentId: string,
    newParentId: string | null,
    delta: { x: number; y: number }
  ) => {
    const newComponents = components.map(c => {
      if (c.id === componentId) {
        return {
          ...c,
          position: {
            x: snapToGrid(c.position.x + delta.x / zoom),
            y: snapToGrid(c.position.y + delta.y / zoom),
          },
          parentId: newParentId,
        };
      }
      return c;
    });
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [components, zoom, saveToHistory]);

  // Helper: Handle existing component drop
  const handleExistingComponentDrop = useCallback((
    componentId: string,
    overId: any,
    delta: { x: number; y: number }
  ) => {
    const component = components.find(c => c.id === componentId);
    if (!component) return;

    let newParentId = component.parentId;
    if (overId !== 'canvas' && overId !== componentId) {
      const parent = components.find(c => c.id === overId);
      if (parent && canBeChildOf(component.type, parent.type)) {
        newParentId = parent.id;
      }
    }

    updateComponentPosition(componentId, newParentId, delta);
  }, [components, updateComponentPosition]);

  // Drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    setDraggedComponent(null);

    if (!over) {
      setSelectedType(null);
      return;
    }

    if (typeof active.id === 'string' && active.id.startsWith('palette-')) {
      const type = active.id.replace('palette-', '') as ComponentType;
      handlePaletteDrop(type, over.id, event);
    } else {
      const componentId = active.id as string;
      handleExistingComponentDrop(componentId, over.id, delta);
    }
  };

  // Add component by click
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (!selectedType) return;

    const newComponent = createComponent(selectedType, x, y);
    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    saveToHistory(newComponents);
    setSelectedType(null);
    setSelectedId(newComponent.id);
  }, [selectedType, components, createComponent, saveToHistory]);


  // Double-clic pour entrer dans un composant
  const handleComponentDoubleClick = useCallback((id: string) => {
    const component = components.find(c => c.id === id);
    if (component && HIERARCHY_RULES[component.type]?.length > 0) {
      // Le composant peut avoir des enfants, on entre dedans
      setCurrentViewId(id);
      setSelectedId(null);
    }
  }, [components]);

  // Select component
  const handleComponentClick = useCallback((id: string) => {
    setSelectedId(id);
    setSelectedType(null);
  }, []);

  // Delete component
  const handleComponentDelete = useCallback((id: string) => {
    const newComponents = components.filter(c => c.id !== id);
    setComponents(newComponents);
    saveToHistory(newComponents);
    setSelectedId(null);
  }, [components, saveToHistory]);

  // Rotate component
  const handleComponentRotate = useCallback((id: string) => {
    const newComponents = components.map(c => {
      if (c.id === id) {
        return { ...c, rotation: (c.rotation + 90) % 360 };
      }
      return c;
    });
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [components, saveToHistory]);

  // Clear all
  const handleClear = useCallback(() => {
    if (components.length === 0) return;
    if (!window.confirm('Êtes-vous sûr de vouloir tout effacer ?')) return;
    
    const newComponents: WarehouseComponent[] = [];
    setComponents(newComponents);
    saveToHistory(newComponents);
    setSelectedId(null);
    setSelectedType(null);
  }, [components, saveToHistory]);

  // Export
  const handleExport = useCallback(() => {
    const layout: WarehouseLayout = {
      name: 'Mon Entrepôt',
      components,
      gridSize: 20,
      canvasSize: { width: 1200, height: 800 },
    };

    const json = JSON.stringify(layout, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `warehouse-layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [components]);

  // Import
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const layout = JSON.parse(event.target?.result as string) as WarehouseLayout;
          setComponents(layout.components);
          saveToHistory(layout.components);
          setSelectedId(null);
          setSelectedType(null);
        } catch (error) {
          addNotification({
            type: 'error',
            title: 'Erreur d\'import',
            message: 'Erreur lors de l\'import du fichier'
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [saveToHistory, addNotification]);

  // Save
  const handleSave = useCallback(() => {
    const layout: WarehouseLayout = {
      name: 'Mon Entrepôt',
      components,
      gridSize: 20,
      canvasSize: { width: 1200, height: 800 },
    };
    onSave(layout);
  }, [components, onSave]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(event) => setOverId(event.over?.id as string | null)}
    >
      <div className="h-screen flex flex-col">
        {/* Toolbar */}
        <Toolbar
          onUndo={handleUndo}
          onRedo={handleRedo}
          onZoomIn={() => setZoom(Math.min(2, zoom + 0.1))}
          onZoomOut={() => setZoom(Math.max(0.2, zoom - 0.1))}
          onExport={handleExport}
          onImport={handleImport}
          onSave={handleSave}
          onClear={handleClear}
          onToggleGrid={() => setShowGrid(!showGrid)}
          canUndo={historyIndex > 0}
          canRedo={historyIndex < history.length - 1}
          showGrid={showGrid}
          zoom={zoom}
        />

        {/* Breadcrumb Navigation */}
        <BreadcrumbNav
          components={visibleComponents}
          currentViewId={currentViewId}
          onNavigate={setCurrentViewId}
        />

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Palette */}
          <ComponentPalette
            onSelectComponent={setSelectedType}
            selectedType={selectedType}
          />

          {/* Canvas */}
          <WarehouseCanvas
            components={components}
            selectedId={selectedId}
            selectedType={selectedType}
            showGrid={showGrid}
            zoom={zoom}
            onZoomChange={setZoom}
            onComponentClick={handleComponentClick}
            onComponentDoubleClick={handleComponentDoubleClick}
            onCanvasClick={handleCanvasClick}
            onComponentDelete={handleComponentDelete}
            onComponentRotate={handleComponentRotate}
            draggedComponent={draggedComponent}
            overId={overId}
          />

          {/* Hierarchy Panel */}
          <HierarchyPanel
            components={components}
            selectedId={selectedId}
            onSelectComponent={handleComponentClick}
            onDeleteComponent={handleComponentDelete}
          />
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedComponent ? (
          <div
            style={{
              width: draggedComponent.size.width,
              height: draggedComponent.size.height,
              opacity: 0.7,
            }}
            className="bg-blue-200 border-2 border-blue-500 rounded-lg flex items-center justify-center"
          >
            <span className="text-sm font-medium text-blue-900">
              {draggedComponent.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
