
import { ListChecks } from 'lucide-react';
import TaskManagementPanel from '../components/TaskManagementPanel';
import { useTasks, useTaskMetrics, useUpdateTaskStatus } from '../hooks/useTasks';
import { useOperators } from '../hooks/useLabor';
import { useNotifications } from '../contexts/NotificationContext';

export default function Tasks() {
  const { addNotification } = useNotifications();

  // Use React Query hooks for automatic caching
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: operators = [] } = useOperators();
  const { data: metricsData } = useTaskMetrics();
  const updateStatus = useUpdateTaskStatus();

  const metrics = metricsData
    ? {
        total_pending: metricsData.pending || 0,
        total_in_progress: metricsData.in_progress || 0,
        total_completed: metricsData.completed || 0,
        avg_completion_time: metricsData.avg_time || 0,
        tasks_by_priority: {
          urgent: 0,
          high: 0,
          normal: 0,
          low: 0,
        },
      }
    : null;

  // Handle task status changes with optimistic updates
  const handleStartTask = async (taskId: string) => {
    updateStatus.mutate(
      { id: Number(taskId), status: 'in_progress' },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Tâche démarrée',
            message: 'Tâche démarrée',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du démarrage de la tâche',
          });
        },
      }
    );
  };

  const handleCompleteTask = async (taskId: string) => {
    // Calculate actual time (for demo, using a random value)
    const actualTime = Math.floor(Math.random() * 300) + 60; // 60-360 seconds
    updateStatus.mutate(
      { id: Number(taskId), status: 'completed', actualTimeSeconds: actualTime },
      {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Tâche terminée',
            message: 'Tâche terminée avec succès',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la finalisation de la tâche',
          });
        },
      }
    );
  };

  const handleCancelTask = async (taskId: string) => {
    updateStatus.mutate(
      { id: Number(taskId), status: 'cancelled' },
      {
        onSuccess: () => {
          addNotification({
            type: 'info',
            title: 'Tâche annulée',
            message: 'Tâche annulée',
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'annulation de la tâche',
          });
        },
      }
    );
  };

  // Transform API data to component format
  const transformedTasks = tasks.map((task) => ({
    id: task.id.toString(),
    type: task.type as any,
    priority: task.priority as any,
    status: task.status as any,
    product_id: task.product_id,
    product_name: task.product_name,
    quantity: task.quantity,
    from_location: task.from_location_id?.toString(),
    to_location: task.to_location_id?.toString(),
    assigned_to: task.assigned_to?.toString(),
    estimated_time_seconds: task.estimated_time_seconds,
    actual_time_seconds: task.actual_time_seconds || undefined,
    created_at: task.created_at ? new Date(task.created_at) : new Date(),
  }));

  const transformedOperators = operators.map((op) => ({
    id: op.id.toString(),
    name: op.name,
    zone: op.current_zone,
    status: op.status as any,
    productivity_score: op.productivity_score,
    assigned_tasks: [],
    completed_today: 0,
  }));

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
            <ListChecks className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Task Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gérez et suivez les tâches d'entrepôt avec INTERLEAVING
            </p>
          </div>
        </div>
      </div>

      {/* Task Management Panel */}
      <TaskManagementPanel
        tasks={transformedTasks}
        operators={transformedOperators}
        metrics={metrics || undefined}
        onStartTask={handleStartTask}
        onCompleteTask={handleCompleteTask}
        onCancelTask={handleCancelTask}
        loading={tasksLoading}
      />
    </div>
  );
}
