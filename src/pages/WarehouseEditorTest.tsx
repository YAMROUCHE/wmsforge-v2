import { useState } from 'react';
import WarehouseEditor from '../components/warehouse/WarehouseEditor';
import type { WarehouseLayout } from '../lib/warehouse';
import { logger } from '@/lib/logger';
import { useNotifications } from '@/contexts/NotificationContext';

export default function WarehouseEditorTest() {
  const { addNotification } = useNotifications();
  const [_savedLayout, setSavedLayout] = useState<WarehouseLayout | null>(null);

  const handleSave = (layout: WarehouseLayout) => {
    setSavedLayout(layout);
    addNotification({
      type: 'success',
      title: 'Layout sauvegardé',
      message: `Layout sauvegardé avec ${layout.components.length} composants !`
    });
    logger.info('Layout saved:', layout);
  };

  return (
    <div className="h-screen flex flex-col">
      <WarehouseEditor onSave={handleSave} />
    </div>
  );
}
