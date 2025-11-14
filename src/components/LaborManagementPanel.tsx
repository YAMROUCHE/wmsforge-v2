import React, { useState } from 'react';
import {
  Trophy, TrendingUp, TrendingDown, Minus, Star, Target, Award,
  Zap, Clock, CheckCircle, Activity, Users
} from 'lucide-react';
import { OperatorPerformance, LeaderboardEntry, Badge, DailyGoal } from '../utils/laborEngine';

interface LaborManagementPanelProps {
  leaderboard: LeaderboardEntry[];
  performances: OperatorPerformance[];
  currentOperatorId?: string;
  teamStats?: any;
  loading?: boolean;
}

export default function LaborManagementPanel({
  leaderboard,
  performances,
  currentOperatorId,
  teamStats,
  loading = false
}: LaborManagementPanelProps) {
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'personal' | 'team'>('leaderboard');

  const currentPerformance = performances.find(p => p.operator_id === currentOperatorId);

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500 text-white'; // Gold
    if (rank === 2) return 'bg-gray-400 text-white'; // Silver
    if (rank === 3) return 'bg-orange-600 text-white'; // Bronze
    return 'bg-blue-500 text-white';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      case 'stable': return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getBadgeColor = (rarity: Badge['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
      case 'rare': return 'bg-blue-200 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'epic': return 'bg-purple-200 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'legendary': return 'bg-yellow-200 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
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
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Labor Management
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Performance & Gamification
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('leaderboard')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedTab === 'leaderboard'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              🏆 Leaderboard
            </button>
            {currentPerformance && (
              <button
                onClick={() => setSelectedTab('personal')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  selectedTab === 'personal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                👤 Ma Performance
              </button>
            )}
            <button
              onClick={() => setSelectedTab('team')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                selectedTab === 'team'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              👥 Équipe
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Leaderboard Tab */}
        {selectedTab === 'leaderboard' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🏆 Classement du Jour
            </h3>
            {leaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                Aucune donnée de performance disponible
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((entry) => {
                  const isCurrentUser = entry.operator_id === currentOperatorId;

                  return (
                    <div
                      key={entry.operator_id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                        isCurrentUser
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 shadow-md'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:shadow-md'
                      }`}
                    >
                      {/* Rank & Name */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${getRankColor(entry.rank)}`}>
                          {getRankIcon(entry.rank)}
                        </div>

                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            {entry.operator_name}
                            {isCurrentUser && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <span>{entry.picks_per_hour} picks/h</span>
                            <span>•</span>
                            <span>{entry.accuracy_rate}% précision</span>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                            {entry.score}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {entry.badges_count}
                          </span>
                        </div>

                        {getTrendIcon(entry.trend)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Personal Tab */}
        {selectedTab === 'personal' && currentPerformance && (
          <div className="space-y-6">
            {/* Score & Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 p-6 rounded-xl border border-yellow-300 dark:border-yellow-700">
                <div className="text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                  <div className="text-4xl font-bold text-yellow-900 dark:text-yellow-100 mb-1">
                    {currentPerformance.daily_score}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Score du jour</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-300 dark:border-purple-700">
                <div className="text-center">
                  <Award className="w-12 h-12 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                  <div className="text-4xl font-bold text-purple-900 dark:text-purple-100 mb-1">
                    {currentPerformance.badges_earned.length}
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Badges gagnés</div>
                </div>
              </div>
            </div>

            {/* Badges */}
            {currentPerformance.badges_earned.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Badges débloqués aujourd'hui
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {currentPerformance.badges_earned.map((badge) => (
                    <div
                      key={badge.id}
                      className={`p-4 rounded-lg border ${getBadgeColor(badge.rarity)}`}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="font-semibold mb-1">{badge.name}</div>
                      <div className="text-xs opacity-75">{badge.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Métriques */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Métriques de performance
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Picks/Heure</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {currentPerformance.picks_per_hour}
                  </div>
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-sm text-green-700 dark:text-green-300 mb-1">Précision</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {currentPerformance.accuracy_rate}%
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                  <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Efficacité</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {currentPerformance.efficiency_score}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {selectedTab === 'team' && teamStats && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Statistiques d'équipe
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Opérateurs actifs</div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {teamStats.total_operators}
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-300 mb-1">Total picks</div>
                <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                  {teamStats.total_picks}
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                <div className="text-sm text-purple-700 dark:text-purple-300 mb-1">Badges gagnés</div>
                <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  {teamStats.total_badges}
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Moy. picks/h</div>
                <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                  {teamStats.avg_picks_per_hour}
                </div>
              </div>

              <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="text-sm text-orange-700 dark:text-orange-300 mb-1">Moy. précision</div>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {teamStats.avg_accuracy}%
                </div>
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/20 p-6 rounded-lg border border-pink-200 dark:border-pink-800">
                <div className="text-sm text-pink-700 dark:text-pink-300 mb-1">Moy. efficacité</div>
                <div className="text-3xl font-bold text-pink-900 dark:text-pink-100">
                  {teamStats.avg_efficiency}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
