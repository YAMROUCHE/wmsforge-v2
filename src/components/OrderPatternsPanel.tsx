import { TrendingUp, Package, Layers, MapPin, Sparkles, ShoppingBag, Link2 } from 'lucide-react';
import { OrderPattern, ProductAssociation } from '../utils/orderPatternsAnalyzer';

interface OrderPatternsPanelProps {
  patterns: OrderPattern[];
  associations: ProductAssociation[];
  loading?: boolean;
}

export default function OrderPatternsPanel({ patterns, associations, loading }: OrderPatternsPanelProps) {
  const getPatternIcon = (type: OrderPattern['pattern_type']) => {
    switch (type) {
      case 'frequent_pair':
        return Link2;
      case 'bundle_opportunity':
        return Layers;
      case 'location_proximity':
        return MapPin;
      default:
        return Package;
    }
  };

  const getPatternColor = (type: OrderPattern['pattern_type']) => {
    switch (type) {
      case 'frequent_pair':
        return {
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          icon: 'bg-purple-500',
          text: 'text-purple-900 dark:text-purple-300'
        };
      case 'bundle_opportunity':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          icon: 'bg-green-500',
          text: 'text-green-900 dark:text-green-300'
        };
      case 'location_proximity':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          icon: 'bg-blue-500',
          text: 'text-blue-900 dark:text-blue-300'
        };
    }
  };

  const getAssociationStrength = (association: ProductAssociation) => {
    if (association.type === 'strong') {
      return { label: 'Fort', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' };
    } else if (association.type === 'moderate') {
      return { label: 'Modéré', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' };
    } else {
      return { label: 'Faible', color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 animate-pulse" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Patterns de Commandes</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500 dark:text-gray-400">Analyse des patterns...</div>
        </div>
      </div>
    );
  }

  if (patterns.length === 0 && associations.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Patterns de Commandes</h2>
        </div>
        <div className="text-center py-8">
          <ShoppingBag className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">Pas assez de données</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plus de commandes nécessaires pour détecter les patterns</p>
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 dark:bg-purple-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 dark:bg-purple-400"></span>
            </span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Patterns de Commandes</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{patterns.length} pattern{patterns.length > 1 ? 's' : ''} détecté{patterns.length > 1 ? 's' : ''}</p>
          </div>
        </div>
        <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">
          Machine Learning
        </span>
      </div>

      {/* Patterns actionnables */}
      <div className="space-y-3 mb-6">
        {patterns.map((pattern) => {
          const Icon = getPatternIcon(pattern.pattern_type);
          const colors = getPatternColor(pattern.pattern_type);

          return (
            <div
              key={pattern.id}
              className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md dark:hover:shadow-gray-700/50`}
            >
              <div className="flex items-start gap-3">
                <div className={`${colors.icon} p-2 rounded-lg flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-sm ${colors.text} mb-1`}>
                    {pattern.title}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {pattern.description}
                  </p>

                  {/* Produits */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {pattern.products.map((product, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-900/50 rounded text-xs font-medium text-gray-700 dark:text-gray-300"
                      >
                        <Package className="w-3 h-3" />
                        {product}
                      </span>
                    ))}
                  </div>

                  {/* Métriques et action */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>{pattern.frequency}x observé</span>
                      </div>
                      <div className="font-medium text-purple-600 dark:text-purple-400">
                        {pattern.impact}
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900/50 px-2 py-1 rounded">
                      💡 {pattern.action}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top associations */}
      {associations.length > 0 && (
        <>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Associations détectées ({associations.length})
            </h3>
          </div>

          <div className="space-y-2">
            {associations.slice(0, 5).map((assoc) => {
              const strength = getAssociationStrength(assoc);

              return (
                <div
                  key={assoc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/70 transition-colors"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Link2 className="w-4 h-4 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                    <div className="flex items-center gap-1 text-sm min-w-0">
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {assoc.productA}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500">+</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {assoc.productB}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`${strength.color} text-xs font-medium px-2 py-0.5 rounded`}>
                      {strength.label}
                    </span>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Lift: <span className="font-semibold">{assoc.lift}x</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {associations.length > 5 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                +{associations.length - 5} autres associations découvertes
              </p>
            </div>
          )}
        </>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          🧠 Analyse basée sur l'algorithme Market Basket Analysis
        </p>
      </div>
    </div>
  );
}
