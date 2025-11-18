import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  AlertTriangle,
  Zap,
  Info,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { Suggestion } from '../utils/suggestionsEngine';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  loading?: boolean;
}

export default function SuggestionsPanel({ suggestions, loading }: SuggestionsPanelProps) {
  const navigate = useNavigate();

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'urgent':
        return AlertTriangle;
      case 'warning':
        return AlertTriangle;
      case 'optimization':
        return TrendingUp;
      case 'info':
        return Info;
      default:
        return Lightbulb;
    }
  };

  const getColorClasses = (type: Suggestion['type']) => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          icon: 'bg-red-500',
          badge: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
          text: 'text-red-900 dark:text-red-300',
          button: 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          icon: 'bg-orange-500',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
          text: 'text-orange-900 dark:text-orange-300',
          button: 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50'
        };
      case 'optimization':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'bg-blue-500',
          badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
          text: 'text-blue-900 dark:text-blue-300',
          button: 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50'
        };
      case 'info':
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-200 dark:border-gray-700',
          icon: 'bg-gray-500',
          badge: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
          text: 'text-gray-900 dark:text-gray-100',
          button: 'text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
        };
      default:
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'bg-purple-500',
          badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
          text: 'text-purple-900 dark:text-purple-300',
          button: 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50'
        };
    }
  };

  const getPriorityLabel = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'high':
        return 'Haute priorité';
      case 'medium':
        return 'Priorité moyenne';
      case 'low':
        return 'Info';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggestions IA</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Analyse en cours...</div>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggestions IA</h2>
        </div>
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Tout est optimal !</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aucune action recommandée pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 dark:bg-purple-400"></span>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Suggestions IA</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{suggestions.length} recommandation{suggestions.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
          Powered by AI
        </span>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion) => {
          const Icon = getIcon(suggestion.type);
          const colors = getColorClasses(suggestion.type);

          return (
            <div
              key={suggestion.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md dark:hover:shadow-gray-700/50`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.icon} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-semibold text-sm ${colors.text}`}>
                      {suggestion.title}
                    </h3>
                    <span className={`${colors.badge} text-xs font-medium px-2 py-0.5 rounded flex-shrink-0`}>
                      {getPriorityLabel(suggestion.priority)}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {suggestion.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="font-medium">{suggestion.impact}</span>
                    </div>

                    {suggestion.action && (
                      <button
                        onClick={() => navigate(suggestion.action!.route)}
                        className={`${colors.button} px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1`}
                      >
                        {suggestion.action.label}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {suggestions.length > 3 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 Astuce : Traitez les suggestions par priorité pour un impact maximal
          </p>
        </div>
      )}
    </div>
  );
}
