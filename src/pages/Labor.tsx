import React from 'react';
import { Trophy } from 'lucide-react';
import LaborManagementPanel from '../components/LaborManagementPanel';
import { useLeaderboard, usePerformance, useTeamStats } from '../hooks/useLabor';

export default function Labor() {
  // For demo purposes - in a real app this would come from auth context
  const currentOperatorId = '1';
  const today = new Date().toISOString().split('T')[0];

  // Use React Query hooks with automatic refresh
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useLeaderboard(today);
  const { data: performances = [] } = usePerformance(today);
  const { data: teamStats } = useTeamStats(today);

  // Transform API data to component format
  const transformedLeaderboard = leaderboard.map((entry) => ({
    rank: entry.rank,
    operator_id: entry.operator_id.toString(),
    operator_name: entry.operator_name,
    score: entry.score,
    picks_per_hour: entry.picks_per_hour,
    accuracy_rate: entry.accuracy_rate,
    badges_count: entry.badges_count,
    trend: 'stable' as any, // API doesn't return trend yet
  }));

  const transformedPerformances = performances.map((perf) => ({
    operator_id: perf.operator_id.toString(),
    operator_name: perf.operator_name || 'Unknown',
    daily_score: perf.daily_score,
    picks_per_hour: perf.picks_per_hour,
    accuracy_rate: perf.accuracy_rate,
    efficiency_score: perf.efficiency_score,
    badges_earned: [], // Will be populated when we fetch badges
    goals: [], // Will be populated based on performance
  }));

  const transformedTeamStats = teamStats
    ? {
        total_operators: teamStats.total_operators || 0,
        total_picks: teamStats.total_picks || 0,
        avg_picks_per_hour: Math.round(teamStats.avg_picks_per_hour || 0),
        avg_accuracy: Math.round(teamStats.avg_accuracy || 0),
        avg_efficiency: Math.round(teamStats.avg_efficiency || 0),
        total_badges: teamStats.total_badges || 0,
      }
    : null;

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Labor Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Performance, gamification et leaderboard en temps réel
              </p>
            </div>
          </div>

          {/* Date selector could go here */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            📅 Aujourd'hui: {new Date().toLocaleDateString('fr-FR')}
          </div>
        </div>
      </div>

      {/* Labor Management Panel */}
      <LaborManagementPanel
        leaderboard={transformedLeaderboard}
        performances={transformedPerformances}
        currentOperatorId={currentOperatorId}
        teamStats={transformedTeamStats}
        loading={leaderboardLoading}
      />
    </div>
  );
}
