import { useState, useCallback } from 'react';
import ComponentPalette from './ComponentPalette';
import Toolbar from './Toolbar';
import WarehouseCanvas from './WarehouseCanvas';
import type { WarehouseComponent, ComponentType, WarehouseLayout } from '../../lib/warehouse';
import { generateId, snapToGrid, ZONE_COLORS } from '../../lib/warehouse';

interface WarehouseEditorProps {
  initialLayout?: WarehouseLayout;
  onSave: (layout: WarehouseLayout) => void;
}

export default function WarehouseEditor({ initialLayout, onSave }: WarehouseEditorProps) {
  // State
  const [components, setComponents] = useState<WarehouseComponent[]>(
    initialLayout?.components || []
  );
  const [selectedType, setSelectedType] = useState<ComponentType | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [zoom, setZoom] = useState(1);
  
  // Undo/Redo
  const [history, setHistory] = useState<WarehouseComponent[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  // Add component
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (!selectedType) return;

    let newComponent: WarehouseComponent;
    const id = generateId();

    switch (selectedType) {
      case 'zone':
        newComponent = {
          id,
          type: 'zone',
          name: `Zone ${components.filter(c => c.type === 'zone').length + 1}`,
          position: { x, y },
          size: { width: 200, height: 150 },
          rotation: 0,
          color: ZONE_COLORS.storage,
          category: 'storage',
        };
        break;

      case 'aisle':
        newComponent = {
          id,
          type: 'aisle',
          name: `Allée ${String.fromCharCode(65 + components.filter(c => c.type === 'aisle').length)}`,
          code: `A${components.filter(c => c.type === 'aisle').length + 1}`,
          position: { x, y },
          size: { width: 100, height: 20 },
          rotation: 0,
          zoneId: null,
          direction: 'horizontal',
        };
        break;

      case 'location':
        newComponent = {
          id,
          type: 'location',
          name: `Emplacement ${components.filter(c => c.type === 'location').length + 1}`,
          code: `L${String(components.filter(c => c.type === 'location').length + 1).padStart(3, '0')}`,
          position: { x, y },
          size: { width: 40, height: 40 },
          rotation: 0,
          aisleId: null,
          capacity: 1,
          occupied: false,
        };
        break;
    }

    const newComponents = [...components, newComponent];
    setComponents(newComponents);
    saveToHistory(newComponents);
    setSelectedType(null);
    setSelectedId(newComponent.id);
  }, [selectedType, components, saveToHistory]);

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
          alert('Erreur lors de l\'import du fichier');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [saveToHistory]);

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
          onCanvasClick={handleCanvasClick}
          onComponentDelete={handleComponentDelete}
          onComponentRotate={handleComponentRotate}
        />
      </div>
    </div>
  );
}
