/**
 * Labor Management System (LMS) Engine
 * Gamification, Productivité, Leaderboards
 * Game Changer pour motivation des équipes
 */

import { Task, Operator } from './taskEngine';

export interface OperatorPerformance {
  operator_id: string;
  operator_name: string;
  date: string;

  // Métriques principales
  tasks_completed: number;
  picks_per_hour: number;
  lines_per_hour: number;
  accuracy_rate: number; // % tâches sans erreur

  // Temps
  total_hours_worked: number;
  avg_task_time_seconds: number;
  efficiency_score: number; // % temps estimé vs réel

  // Gamification
  daily_score: number;
  badges_earned: Badge[];
  rank: number;
  streak_days: number; // Jours consécutifs avec objectifs atteints
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned_at: Date;
}

export interface DailyGoal {
  type: 'picks' | 'lines' | 'accuracy' | 'speed';
  target: number;
  current: number;
  achieved: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  operator_id: string;
  operator_name: string;
  score: number;
  picks_per_hour: number;
  accuracy_rate: number;
  badges_count: number;
  trend: 'up' | 'down' | 'stable';
}

export class LaborEngine {
  private static instance: LaborEngine;

  private constructor() {}

  static getInstance(): LaborEngine {
    if (!LaborEngine.instance) {
      LaborEngine.instance = new LaborEngine();
    }
    return LaborEngine.instance;
  }

  /**
   * Calcule la performance d'un opérateur pour une période
   */
  calculatePerformance(
    operator: Operator,
    tasks: Task[],
    date: Date = new Date()
  ): OperatorPerformance {
    const operatorTasks = tasks.filter(
      t => t.assigned_to === operator.id && t.status === 'completed'
    );

    if (operatorTasks.length === 0) {
      return this.emptyPerformance(operator, date);
    }

    // Calcul temps total travaillé (en heures)
    const totalSeconds = operatorTasks.reduce(
      (sum, t) => sum + (t.actual_time_seconds || 0),
      0
    );
    const total_hours_worked = totalSeconds / 3600;

    // Picks per hour
    const total_picks = operatorTasks.length;
    const picks_per_hour = total_hours_worked > 0 ? total_picks / total_hours_worked : 0;

    // Lines per hour (approximation: 1 task = 1 line)
    const lines_per_hour = picks_per_hour;

    // Accuracy rate (assume 100% if no errors tracked)
    const accuracy_rate = 100;

    // Average task time
    const avg_task_time_seconds =
      totalSeconds / operatorTasks.length;

    // Efficiency score (temps réel vs temps estimé)
    const totalEstimated = operatorTasks.reduce(
      (sum, t) => sum + t.estimated_time_seconds,
      0
    );
    const efficiency_score =
      totalEstimated > 0 ? (totalEstimated / totalSeconds) * 100 : 100;

    // Daily score (formule composite)
    const daily_score = this.calculateDailyScore(
      picks_per_hour,
      accuracy_rate,
      efficiency_score
    );

    // Badges
    const badges_earned = this.checkBadges(
      picks_per_hour,
      accuracy_rate,
      efficiency_score,
      total_picks
    );

    return {
      operator_id: operator.id,
      operator_name: operator.name,
      date: date.toISOString().split('T')[0],
      tasks_completed: total_picks,
      picks_per_hour: Math.round(picks_per_hour * 10) / 10,
      lines_per_hour: Math.round(lines_per_hour * 10) / 10,
      accuracy_rate: Math.round(accuracy_rate * 10) / 10,
      total_hours_worked: Math.round(total_hours_worked * 100) / 100,
      avg_task_time_seconds: Math.round(avg_task_time_seconds),
      efficiency_score: Math.round(efficiency_score * 10) / 10,
      daily_score: Math.round(daily_score),
      badges_earned,
      rank: 0, // Will be set by leaderboard
      streak_days: 0, // Would need historical data
    };
  }

  /**
   * Performance vide pour opérateur sans tâches
   */
  private emptyPerformance(operator: Operator, date: Date): OperatorPerformance {
    return {
      operator_id: operator.id,
      operator_name: operator.name,
      date: date.toISOString().split('T')[0],
      tasks_completed: 0,
      picks_per_hour: 0,
      lines_per_hour: 0,
      accuracy_rate: 100,
      total_hours_worked: 0,
      avg_task_time_seconds: 0,
      efficiency_score: 100,
      daily_score: 0,
      badges_earned: [],
      rank: 0,
      streak_days: 0,
    };
  }

  /**
   * Calcule le score quotidien (0-1000 points)
   */
  private calculateDailyScore(
    picks_per_hour: number,
    accuracy_rate: number,
    efficiency_score: number
  ): number {
    // Formule pondérée:
    // - 50% productivité (picks/h, max 40 picks/h = 500 pts)
    // - 30% précision (max 100% = 300 pts)
    // - 20% efficience (max 120% = 200 pts)

    const productivityPoints = Math.min((picks_per_hour / 40) * 500, 500);
    const accuracyPoints = (accuracy_rate / 100) * 300;
    const efficiencyPoints = Math.min((efficiency_score / 120) * 200, 200);

    return productivityPoints + accuracyPoints + efficiencyPoints;
  }

  /**
   * Vérifie et attribue les badges
   */
  private checkBadges(
    picks_per_hour: number,
    accuracy_rate: number,
    efficiency_score: number,
    total_picks: number
  ): Badge[] {
    const badges: Badge[] = [];
    const now = new Date();

    // Badge Speed Demon (>30 picks/h)
    if (picks_per_hour >= 30) {
      badges.push({
        id: 'speed-demon',
        name: 'Speed Demon',
        description: '+30 picks/heure',
        icon: '⚡',
        rarity: 'epic',
        earned_at: now,
      });
    }

    // Badge Perfect Accuracy (100%)
    if (accuracy_rate >= 100) {
      badges.push({
        id: 'perfect-accuracy',
        name: 'Perfect Accuracy',
        description: '100% de précision',
        icon: '🎯',
        rarity: 'rare',
        earned_at: now,
      });
    }

    // Badge Efficiency Master (>110%)
    if (efficiency_score >= 110) {
      badges.push({
        id: 'efficiency-master',
        name: 'Efficiency Master',
        description: '+110% efficacité',
        icon: '🏆',
        rarity: 'epic',
        earned_at: now,
      });
    }

    // Badge Century (100+ picks)
    if (total_picks >= 100) {
      badges.push({
        id: 'century',
        name: 'Century',
        description: '100+ tâches complétées',
        icon: '💯',
        rarity: 'legendary',
        earned_at: now,
      });
    }

    // Badge First Blood (première tâche du jour)
    if (total_picks >= 1) {
      badges.push({
        id: 'first-blood',
        name: 'First Blood',
        description: 'Première tâche du jour',
        icon: '🌅',
        rarity: 'common',
        earned_at: now,
      });
    }

    return badges;
  }

  /**
   * Génère le leaderboard (classement)
   */
  generateLeaderboard(performances: OperatorPerformance[]): LeaderboardEntry[] {
    // Trier par score décroissant
    const sorted = [...performances].sort((a, b) => b.daily_score - a.daily_score);

    // Attribuer les rangs
    return sorted.map((perf, index) => {
      const rank = index + 1;

      // Déterminer tendance (simplified, would need historical data)
      const trend: 'up' | 'down' | 'stable' = 'stable';

      return {
        rank,
        operator_id: perf.operator_id,
        operator_name: perf.operator_name,
        score: perf.daily_score,
        picks_per_hour: perf.picks_per_hour,
        accuracy_rate: perf.accuracy_rate,
        badges_count: perf.badges_earned.length,
        trend,
      };
    });
  }

  /**
   * Génère les objectifs quotidiens pour un opérateur
   */
  generateDailyGoals(performance: OperatorPerformance): DailyGoal[] {
    return [
      {
        type: 'picks',
        target: 50,
        current: performance.tasks_completed,
        achieved: performance.tasks_completed >= 50,
      },
      {
        type: 'accuracy',
        target: 98,
        current: performance.accuracy_rate,
        achieved: performance.accuracy_rate >= 98,
      },
      {
        type: 'speed',
        target: 25,
        current: performance.picks_per_hour,
        achieved: performance.picks_per_hour >= 25,
      },
    ];
  }

  /**
   * Calcule les statistiques d'équipe
   */
  calculateTeamStats(performances: OperatorPerformance[]) {
    if (performances.length === 0) {
      return {
        total_operators: 0,
        total_picks: 0,
        avg_picks_per_hour: 0,
        avg_accuracy: 0,
        avg_efficiency: 0,
        total_badges: 0,
      };
    }

    const total_picks = performances.reduce((sum, p) => sum + p.tasks_completed, 0);
    const avg_picks_per_hour =
      performances.reduce((sum, p) => sum + p.picks_per_hour, 0) / performances.length;
    const avg_accuracy =
      performances.reduce((sum, p) => sum + p.accuracy_rate, 0) / performances.length;
    const avg_efficiency =
      performances.reduce((sum, p) => sum + p.efficiency_score, 0) / performances.length;
    const total_badges = performances.reduce((sum, p) => sum + p.badges_earned.length, 0);

    return {
      total_operators: performances.length,
      total_picks,
      avg_picks_per_hour: Math.round(avg_picks_per_hour * 10) / 10,
      avg_accuracy: Math.round(avg_accuracy * 10) / 10,
      avg_efficiency: Math.round(avg_efficiency * 10) / 10,
      total_badges,
    };
  }
}

export const laborEngine = LaborEngine.getInstance();
