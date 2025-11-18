import { Waves as WavesIcon, Plus } from 'lucide-react';
import WaveManagementPanel from '../components/WaveManagementPanel';
import { useWaves, useUpdateWaveStatus } from '../hooks/useWaves';
import { useNotifications } from '../contexts/NotificationContext';

export default function Waves() {
  const { addNotification } = useNotifications();

  // Use React Query hook for automatic caching and state management
  const { data: waves = [], isLoading } = useWaves();
  const updateStatus = useUpdateWaveStatus();

  // Handle wave status changes with optimistic updates
  const handleReleaseWave = async (waveId: string) => {
    updateStatus.mutate(
      { id: Number(waveId), status: 'released' },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Vague libérée',
            message: 'Vague libérée avec succès',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la libération de la vague',
          });
        },
      }
    );
  };

  const handleStartWave = async (waveId: string) => {
    updateStatus.mutate(
      { id: Number(waveId), status: 'in_progress' },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Vague démarrée',
            message: 'Vague démarrée avec succès',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du démarrage de la vague',
          });
        },
      }
    );
  };

  const handleCompleteWave = async (waveId: string) => {
    updateStatus.mutate(
      { id: Number(waveId), status: 'completed' },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Vague terminée',
            message: 'Vague terminée avec succès',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la finalisation de la vague',
          });
        },
      }
    );
  };

  const handleCancelWave = async (waveId: string) => {
    updateStatus.mutate(
      { id: Number(waveId), status: 'cancelled' },
      {
        onSuccess: () => {
          addNotification({
            type: 'info',
            title: 'Vague annulée',
            message: 'Vague annulée',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'annulation de la vague',
          });
        },
      }
    );
  };

  // Transform API Wave to component Wave format
  const transformedWaves = waves.map((wave) => ({
    id: wave.id.toString(),
    name: wave.name,
    status: wave.status as any,
    priority: wave.priority as any,
    zone: wave.zone || undefined,
    orders: wave.orders || [],
    metrics: {
      total_orders: wave.total_orders,
      total_lines: wave.total_lines,
      total_units: wave.total_units,
      estimated_picks: wave.total_lines || 0,
      estimated_time_minutes: wave.estimated_time_minutes,
      zones_involved: wave.zone ? [wave.zone] : [],
    },
    created_at: wave.created_at ? new Date(wave.created_at) : new Date(),
    released_at: wave.released_at ? new Date(wave.released_at) : undefined,
    completed_at: wave.completed_at ? new Date(wave.completed_at) : undefined,
  }));

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <WavesIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Wave Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gérez vos vagues de picking pour optimiser les opérations
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              addNotification({
                type: 'info',
                title: 'En développement',
                message: 'Fonctionnalité de création de vagues en développement',
              });
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Créer une vague
          </button>
        </div>
      </div>

      {/* Wave Management Panel */}
      <WaveManagementPanel
        waves={transformedWaves}
        onReleaseWave={handleReleaseWave}
        onStartWave={handleStartWave}
        onCompleteWave={handleCompleteWave}
        onCancelWave={handleCancelWave}
        loading={isLoading}
      />
    </div>
  );
}
