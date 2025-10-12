import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WarehouseEditor from '../components/warehouse/WarehouseEditor';
import type { WarehouseLayout } from '../lib/warehouse';

export default function WarehouseEditorTest() {
  const navigate = useNavigate();
  const [savedLayout, setSavedLayout] = useState<WarehouseLayout | null>(null);

  const handleSave = (layout: WarehouseLayout) => {
    setSavedLayout(layout);
    alert(`Layout sauvegardé avec ${layout.components.length} composants !`);
    console.log('Layout saved:', layout);
  };

  return (
    <div className="h-screen flex flex-col">
      <WarehouseEditor onSave={handleSave} />
    </div>
  );
}
