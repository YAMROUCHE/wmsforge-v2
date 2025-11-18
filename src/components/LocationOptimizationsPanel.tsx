import { MapPin, TrendingUp, ArrowRight, Zap, Clock, Target } from 'lucide-react';
import { LocationOptimization } from '../utils/locationOptimizer';

interface LocationOptimizationsPanelProps {
  optimizations: LocationOptimization[];
  loading?: boolean;
}

export default function LocationOptimizationsPanel({ optimizations, loading }: LocationOptimizationsPanelProps) {
  const getPriorityColor = (priority: LocationOptimization['priority']) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
          text: 'text-orange-900 dark:text-orange-300',
          icon: 'bg-orange-500'
        };
      case 'medium':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          text: 'text-blue-900 dark:text-blue-300',
          icon: 'bg-blue-500'
        };
      case 'low':
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
          text: 'text-gray-900 dark:text-gray-100',
          icon: 'bg-gray-500'
        };
    }
  };

  const getPriorityLabel = (priority: LocationOptimization['priority']) => {
    switch (priority) {
      case 'high':
        return 'Haute priorité';
      case 'medium':
        return 'Priorité moyenne';
      case 'low':
        return 'Info';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Optimisation Emplacements</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Analyse en cours...</div>
        </div>
      </div>
    );
  }

  if (optimizations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Optimisation Emplacements</h2>
        </div>
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Emplacements optimaux !</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Votre organisation est déjà efficace</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500 dark:bg-blue-400"></span>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Optimisation Emplacements</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{optimizations.length} opportunité{optimizations.length > 1 ? 's' : ''} détectée{optimizations.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">
          IA Optimisation
        </span>
      </div>

      <div className="space-y-3">
        {optimizations.map((optimization) => {
          const colors = getPriorityColor(optimization.priority);

          return (
            <div
              key={optimization.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md dark:hover:shadow-gray-700/50`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={`${colors.icon} p-2 rounded-lg flex-shrink-0`}>
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm ${colors.text} mb-1`}>
                      {optimization.product_name}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {optimization.reason}
                    </p>
                  </div>
                </div>
                <span className={`${colors.badge} text-xs font-medium px-2 py-0.5 rounded flex-shrink-0`}>
                  {getPriorityLabel(optimization.priority)}
                </span>
              </div>

              {/* Location Change */}
              {optimization.suggested_location && (
                <div className="flex items-center gap-2 mb-3 pl-11">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-900/50 px-3 py-1.5 rounded-lg flex-1">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {optimization.current_location}
                    </span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-lg flex-1">
                    <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {optimization.suggested_location}
                    </span>
                  </div>
                </div>
              )}

              {/* Metrics */}
              <div className="flex items-center justify-between pl-11">
                <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{optimization.metrics.picking_frequency} picks/mois</span>
                  </div>
                  {optimization.metrics.time_saved && optimization.metrics.time_saved > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="font-medium text-green-600 dark:text-green-400">
                        -{optimization.metrics.time_saved}s
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-gray-700 dark:text-gray-300">
                  <Zap className="w-3.5 h-3.5 text-yellow-500" />
                  <span>{optimization.impact}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {optimizations.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Appliquez les optimisations haute priorité en premier pour un impact maximal
          </p>
        </div>
      )}
    </div>
  );
}
