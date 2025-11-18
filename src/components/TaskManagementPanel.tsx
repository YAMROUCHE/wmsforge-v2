import { useState } from 'react';
import {
  ListChecks, Play, CheckCircle, XCircle, Clock, MapPin, Package,
  TrendingUp, User, ArrowRight
} from 'lucide-react';
import { Task, Operator, TaskMetrics } from '../utils/taskEngine';

interface TaskManagementPanelProps {
  tasks: Task[];
  operators?: Operator[];
  metrics?: TaskMetrics;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onCancelTask: (taskId: string) => void;
  operatorView?: boolean; // Vue opérateur ou gestionnaire
  currentOperatorId?: string;
  loading?: boolean;
}

export default function TaskManagementPanel({
  tasks,
  operators = [],
  metrics,
  onStartTask,
  onCompleteTask,
  onCancelTask,
  operatorView = false,
  currentOperatorId,
  loading = false
}: TaskManagementPanelProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | 'urgent' | 'high' | 'normal' | 'low'>('all');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');

  // Filtrer les tâches
  const filteredTasks = tasks.filter(task => {
    if (operatorView && currentOperatorId) {
      if (task.assigned_to !== currentOperatorId) return false;
    } else if (!operatorView && selectedOperator !== 'all') {
      if (task.assigned_to !== selectedOperator) return false;
    }

    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;

    return true;
  });

  const getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
      case 'pick': return '📦';
      case 'put_away': return '📥';
      case 'move': return '🚚';
      case 'count': return '🔢';
      case 'pack': return '📦';
      case 'receive': return '📥';
    }
  };

  const getTaskTypeLabel = (type: Task['type']) => {
    switch (type) {
      case 'pick': return 'Picking';
      case 'put_away': return 'Rangement';
      case 'move': return 'Déplacement';
      case 'count': return 'Comptage';
      case 'pack': return 'Emballage';
      case 'receive': return 'Réception';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500 text-white border-red-600';
      case 'high': return 'bg-orange-500 text-white border-orange-600';
      case 'normal': return 'bg-blue-500 text-white border-blue-600';
      case 'low': return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending':
      case 'assigned':
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-300 dark:border-gray-600',
          badge: 'bg-gray-500'
        };
      case 'in_progress':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-300 dark:border-orange-600',
          badge: 'bg-orange-500'
        };
      case 'completed':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-300 dark:border-green-600',
          badge: 'bg-green-500'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-300 dark:border-red-600',
          badge: 'bg-red-500'
        };
    }
  };

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'assigned': return 'Assignée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-300">Chargement des tâches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <ListChecks className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {operatorView ? 'Mes Tâches' : 'Gestion des Tâches'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Métriques rapides */}
          {metrics && (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                  {metrics.total_pending}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">En attente</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {metrics.total_in_progress}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">En cours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {metrics.total_completed}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Terminées</div>
              </div>
            </div>
          )}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          {!operatorView && operators.length > 0 && (
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="all">Tous les opérateurs</option>
              {operators.map(op => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          )}

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminées</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
          >
            <option value="all">Toutes priorités</option>
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 Haute</option>
            <option value="normal">🔵 Normale</option>
            <option value="low">⚪ Basse</option>
          </select>
        </div>
      </div>

      {/* Liste des tâches */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <ListChecks className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Aucune tâche
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {operatorView ? 'Vous n\'avez aucune tâche assignée pour le moment' : 'Aucune tâche ne correspond aux filtres sélectionnés'}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const colors = getStatusColor(task.status);
            const priorityColor = getPriorityColor(task.priority);

            return (
              <div
                key={task.id}
                className={`${colors.bg} ${colors.border} border-l-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  {/* Infos tâche */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getTaskTypeIcon(task.type)}</span>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {getTaskTypeLabel(task.type)} - {task.product_name}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${colors.badge} text-white`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </div>

                    {/* Détails */}
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>Qté: {task.quantity}</span>
                        </div>
                        {task.from_location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{task.from_location}</span>
                          </div>
                        )}
                        {task.to_location && (
                          <>
                            <ArrowRight className="w-4 h-4" />
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{task.to_location}</span>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>Estimé: {formatTime(task.estimated_time_seconds)}</span>
                        </div>
                        {task.actual_time_seconds && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>Réel: {formatTime(task.actual_time_seconds)}</span>
                          </div>
                        )}
                        {task.assigned_to && !operatorView && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{operators.find(o => o.id === task.assigned_to)?.name || task.assigned_to}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    {(task.status === 'pending' || task.status === 'assigned') && (
                      <button
                        onClick={() => onStartTask(task.id)}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Démarrer
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => onCompleteTask(task.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Terminer
                      </button>
                    )}
                    {task.status !== 'completed' && task.status !== 'cancelled' && (
                      <button
                        onClick={() => onCancelTask(task.id)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
