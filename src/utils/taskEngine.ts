/**
 * Task Management Engine
 * Gestion intelligente des tâches opérateurs en temps réel
 * Features: Priorisation dynamique, Interleaving, Optimisation trajets
 */

export type TaskType = 'pick' | 'put_away' | 'move' | 'count' | 'pack' | 'receive';
export type TaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type TaskPriority = 'urgent' | 'high' | 'normal' | 'low';

export interface Task {
  id: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  product_name: string;
  product_id: number;
  quantity: number;
  from_location?: string;
  to_location?: string;
  wave_id?: string;
  order_id?: number;
  assigned_to?: string;
  created_at: Date;
  assigned_at?: Date;
  started_at?: Date;
  completed_at?: Date;
  estimated_time_seconds: number;
  actual_time_seconds?: number;
  zone?: string;
}

export interface Operator {
  id: string;
  name: string;
  current_location?: string;
  current_zone?: string;
  status: 'available' | 'busy' | 'break' | 'offline';
  assigned_tasks: Task[];
  completed_today: number;
  productivity_score: number; // picks per hour
}

export interface TaskMetrics {
  total_pending: number;
  total_in_progress: number;
  total_completed: number;
  avg_completion_time: number;
  tasks_by_priority: {
    urgent: number;
    high: number;
    normal: number;
    low: number;
  };
}

export class TaskEngine {
  private static instance: TaskEngine;

  private constructor() {}

  static getInstance(): TaskEngine {
    if (!TaskEngine.instance) {
      TaskEngine.instance = new TaskEngine();
    }
    return TaskEngine.instance;
  }

  /**
   * Génère des tâches à partir d'une commande/vague
   */
  generateTasks(orders: any[], waveId?: string): Task[] {
    const tasks: Task[] = [];

    orders.forEach(order => {
      if (!order.items) return;

      order.items.forEach((item: any) => {
        // Générer tâche de picking
        const pickTask: Task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'pick',
          priority: this.determinePriority(order),
          status: 'pending',
          product_name: item.product_name,
          product_id: item.product_id,
          quantity: item.quantity,
          from_location: item.location || 'A-01-01',
          to_location: 'STAGING',
          wave_id: waveId,
          order_id: order.id,
          created_at: new Date(),
          estimated_time_seconds: this.estimatePickTime(item.quantity),
          zone: item.location?.split('-')[0] || 'A',
        };

        tasks.push(pickTask);
      });
    });

    return tasks;
  }

  /**
   * Détermine la priorité d'une tâche basée sur la commande
   */
  private determinePriority(order: any): TaskPriority {
    if (order.priority === 'urgent') return 'urgent';
    if (order.shipping_method === 'express') return 'high';

    const orderAge = Date.now() - new Date(order.created_at).getTime();
    const hoursOld = orderAge / (1000 * 60 * 60);

    if (hoursOld > 24) return 'high';
    if (hoursOld > 12) return 'normal';
    return 'low';
  }

  /**
   * Estime le temps de picking (en secondes)
   */
  private estimatePickTime(quantity: number): number {
    // Base: 20s pour aller à la location
    // + 5s par unité à picker
    return 20 + (quantity * 5);
  }

  /**
   * Assigne des tâches intelligemment aux opérateurs
   * Avec Interleaving: combine pick + put_away dans même trajet
   */
  assignTasks(
    tasks: Task[],
    operators: Operator[],
    enableInterleaving: boolean = true
  ): Map<string, Task[]> {
    const assignments = new Map<string, Task[]>();

    // Initialiser les assignments
    operators.forEach(op => {
      if (op.status === 'available' || op.status === 'busy') {
        assignments.set(op.id, []);
      }
    });

    // Trier les tâches par priorité
    const sortedTasks = this.sortTasksByPriority(tasks.filter(t => t.status === 'pending'));

    sortedTasks.forEach(task => {
      // Trouver le meilleur opérateur
      const bestOperator = this.findBestOperator(task, operators, assignments, enableInterleaving);

      if (bestOperator) {
        const operatorTasks = assignments.get(bestOperator.id) || [];

        // Interleaving: chercher opportunité de combiner avec put_away
        if (enableInterleaving && task.type === 'pick') {
          const putAwayTask = this.findInterleaveOpportunity(task, sortedTasks);
          if (putAwayTask) {
            operatorTasks.push(task);
            operatorTasks.push(putAwayTask);
            // Marquer putAwayTask comme assignée pour ne pas la réassigner
            putAwayTask.status = 'assigned';
          } else {
            operatorTasks.push(task);
          }
        } else {
          operatorTasks.push(task);
        }

        task.status = 'assigned';
        task.assigned_to = bestOperator.id;
        task.assigned_at = new Date();
        assignments.set(bestOperator.id, operatorTasks);
      }
    });

    return assignments;
  }

  /**
   * Trouve le meilleur opérateur pour une tâche
   */
  private findBestOperator(
    task: Task,
    operators: Operator[],
    currentAssignments: Map<string, Task[]>,
    enableZoneOptimization: boolean
  ): Operator | null {
    const availableOperators = operators.filter(
      op => op.status === 'available' || op.status === 'busy'
    );

    if (availableOperators.length === 0) return null;

    // Calculer un score pour chaque opérateur
    let bestOperator: Operator | null = null;
    let bestScore = -Infinity;

    availableOperators.forEach(operator => {
      let score = 0;

      // Favoriser opérateurs déjà dans la même zone
      if (enableZoneOptimization && operator.current_zone === task.zone) {
        score += 100;
      }

      // Favoriser opérateurs avec moins de tâches assignées
      const assignedTasks = currentAssignments.get(operator.id) || [];
      score -= assignedTasks.length * 10;

      // Favoriser opérateurs plus productifs
      score += operator.productivity_score;

      if (score > bestScore) {
        bestScore = score;
        bestOperator = operator;
      }
    });

    return bestOperator;
  }

  /**
   * Cherche opportunité d'interleaving (pick + put_away dans même zone)
   */
  private findInterleaveOpportunity(pickTask: Task, allTasks: Task[]): Task | undefined {
    return allTasks.find(
      task =>
        task.type === 'put_away' &&
        task.status === 'pending' &&
        task.zone === pickTask.zone &&
        task.id !== pickTask.id
    );
  }

  /**
   * Trie les tâches par priorité et date
   */
  private sortTasksByPriority(tasks: Task[]): Task[] {
    const priorityOrder: Record<TaskPriority, number> = {
      urgent: 0,
      high: 1,
      normal: 2,
      low: 3,
    };

    return [...tasks].sort((a, b) => {
      // D'abord par priorité
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Puis par date de création (plus ancien en premier)
      return a.created_at.getTime() - b.created_at.getTime();
    });
  }

  /**
   * Démarre une tâche
   */
  startTask(task: Task): Task {
    return {
      ...task,
      status: 'in_progress',
      started_at: new Date(),
    };
  }

  /**
   * Complète une tâche
   */
  completeTask(task: Task): Task {
    const completedAt = new Date();
    const actualTime = task.started_at
      ? (completedAt.getTime() - task.started_at.getTime()) / 1000
      : task.estimated_time_seconds;

    return {
      ...task,
      status: 'completed',
      completed_at: completedAt,
      actual_time_seconds: actualTime,
    };
  }

  /**
   * Calcule les métriques des tâches
   */
  calculateMetrics(tasks: Task[]): TaskMetrics {
    const metrics: TaskMetrics = {
      total_pending: 0,
      total_in_progress: 0,
      total_completed: 0,
      avg_completion_time: 0,
      tasks_by_priority: {
        urgent: 0,
        high: 0,
        normal: 0,
        low: 0,
      },
    };

    let totalCompletionTime = 0;
    let completedCount = 0;

    tasks.forEach(task => {
      // Count by status
      if (task.status === 'pending' || task.status === 'assigned') {
        metrics.total_pending++;
      } else if (task.status === 'in_progress') {
        metrics.total_in_progress++;
      } else if (task.status === 'completed') {
        metrics.total_completed++;
        if (task.actual_time_seconds) {
          totalCompletionTime += task.actual_time_seconds;
          completedCount++;
        }
      }

      // Count by priority
      metrics.tasks_by_priority[task.priority]++;
    });

    metrics.avg_completion_time =
      completedCount > 0 ? Math.round(totalCompletionTime / completedCount) : 0;

    return metrics;
  }

  /**
   * Génère tâche de comptage (cycle counting)
   */
  generateCountTask(location: string, products: any[]): Task[] {
    return products.map((product, index) => ({
      id: `count-${Date.now()}-${index}`,
      type: 'count' as TaskType,
      priority: 'normal' as TaskPriority,
      status: 'pending' as TaskStatus,
      product_name: product.name,
      product_id: product.id,
      quantity: 0, // À compter
      from_location: location,
      created_at: new Date(),
      estimated_time_seconds: 60, // 1 min par comptage
      zone: location.split('-')[0],
    }));
  }
}

export const taskEngine = TaskEngine.getInstance();
