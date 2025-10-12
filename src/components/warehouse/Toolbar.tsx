import { Undo, Redo, ZoomIn, ZoomOut, Download, Upload, Save, Trash2, Grid3x3 } from 'lucide-react';
import { Button } from '../ui/Button';

interface ToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onExport: () => void;
  onImport: () => void;
  onSave: () => void;
  onClear: () => void;
  onToggleGrid: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  zoom: number;
}

export default function Toolbar({
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onExport,
  onImport,
  onSave,
  onClear,
  onToggleGrid,
  canUndo,
  canRedo,
  showGrid,
  zoom,
}: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Undo/Redo */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Annuler (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Rétablir (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center space-x-1 border-r border-gray-200 pr-2">
          <button
            onClick={onZoomOut}
            className="p-2 rounded hover:bg-gray-100"
            title="Dézoomer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-2 rounded hover:bg-gray-100"
            title="Zoomer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Grid */}
        <div className="border-r border-gray-200 pr-2">
          <button
            onClick={onToggleGrid}
            className={`p-2 rounded hover:bg-gray-100 ${showGrid ? 'bg-blue-50 text-blue-600' : ''}`}
            title="Afficher/Masquer la grille"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onImport}
            className="p-2 rounded hover:bg-gray-100"
            title="Importer un layout"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={onExport}
            className="p-2 rounded hover:bg-gray-100"
            title="Exporter en JSON"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded hover:bg-red-50 text-red-600"
            title="Tout effacer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Button onClick={onSave} className="flex items-center space-x-2">
          <Save className="w-4 h-4" />
          <span>Enregistrer</span>
        </Button>
      </div>
    </div>
  );
}
