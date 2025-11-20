import { useState } from 'react';
import { Waves, Play, CheckCircle, XCircle, Clock, Package, TrendingUp, MapPin, AlertCircle } from 'lucide-react';
import { Wave } from '../utils/waveEngine';

interface WaveManagementPanelProps {
  waves: Wave[];
  onReleaseWave: (waveId: string) => void;
  onStartWave: (waveId: string) => void;
  onCompleteWave: (waveId: string) => void;
  onCancelWave: (waveId: string) => void;
  loading?: boolean;
}

export default function WaveManagementPanel({
  waves,
  onReleaseWave,
  onStartWave,
  onCompleteWave,
  onCancelWave,
  loading = false
}: WaveManagementPanelProps) {
  const [selectedWave, setSelectedWave] = useState<string | null>(null);

  const getStatusColor = (status: Wave['status']) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          border: 'border-gray-300 dark:border-gray-600',
          text: 'text-gray-700 dark:text-gray-300',
          badge: 'bg-gray-500'
        };
      case 'released':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-700 dark:text-blue-300',
          badge: 'bg-blue-500'
        };
      case 'in_progress':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          text: 'text-orange-700 dark:text-orange-300',
          badge: 'bg-orange-500'
        };
      case 'completed':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-700 dark:text-green-300',
          badge: 'bg-green-500'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-700 dark:text-red-300',
          badge: 'bg-red-500'
        };
    }
  };

  const getPriorityColor = (priority: Wave['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'normal':
        return 'bg-blue-500 text-white';
      case 'low':
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: Wave['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'released': return 'Libérée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-300">Chargement des vagues...</div>
        </div>
      </div>
    );
  }

  if (waves.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Waves className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Aucune vague active
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Les vagues seront générées automatiquement à partir des commandes en attente
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Waves className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Gestion des Vagues
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {waves.length} vague{waves.length > 1 ? 's' : ''} active{waves.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {waves.filter(w => w.status === 'released').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Libérées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {waves.filter(w => w.status === 'in_progress').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">En cours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {waves.filter(w => w.status === 'completed').length}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Terminées</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des vagues */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {waves.map((wave) => {
          const colors = getStatusColor(wave.status);
          const isExpanded = selectedWave === wave.id;

          return (
            <div
              key={wave.id}
              className={`${colors.bg} ${colors.border} border-l-4 transition-all`}
            >
              <div
                role="button"
                tabIndex={0}
                className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setSelectedWave(isExpanded ? null : wave.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedWave(isExpanded ? null : wave.id);
                  }
                }}
                aria-label={`${isExpanded ? 'Réduire' : 'Développer'} les détails de ${wave.name}`}
                aria-expanded={isExpanded}
              >
                <div className="flex items-start justify-between">
                  {/* Infos principales */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {wave.name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(wave.priority)}`}>
                        {wave.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${colors.badge} text-white`}>
                        {getStatusLabel(wave.status)}
                      </span>
                      {wave.zone && (
                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          Zone {wave.zone}
                        </span>
                      )}
                    </div>

                    {/* Métriques */}
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>{wave.metrics.total_orders} commandes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{wave.metrics.total_lines} lignes</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>~{wave.metrics.estimated_time_minutes} min</span>
                      </div>
                      {wave.assigned_to && (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{wave.assigned_to}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {wave.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReleaseWave(wave.id);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        Libérer
                      </button>
                    )}
                    {wave.status === 'released' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartWave(wave.id);
                        }}
                        className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Play className="w-4 h-4" />
                        Démarrer
                      </button>
                    )}
                    {wave.status === 'in_progress' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCompleteWave(wave.id);
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Terminer
                      </button>
                    )}
                    {wave.status !== 'completed' && wave.status !== 'cancelled' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCancelWave(wave.id);
                        }}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Annuler
                      </button>
                    )}
                  </div>
                </div>

                {/* Timestamps */}
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex gap-4">
                  <span>Créée: {formatDate(wave.created_at)}</span>
                  {wave.released_at && <span>Libérée: {formatDate(wave.released_at)}</span>}
                  {wave.completed_at && <span>Terminée: {formatDate(wave.completed_at)}</span>}
                </div>
              </div>

              {/* Détails expandables */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                    Commandes ({wave.orders.length})
                  </h4>
                  <div className="space-y-2">
                    {wave.orders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-2 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700"
                      >
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            #{order.id} - {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {order.items?.length || 0} ligne{order.items && order.items.length > 1 ? 's' : ''}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {order.total_amount.toFixed(2)}€
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
