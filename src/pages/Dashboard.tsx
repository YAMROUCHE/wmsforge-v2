import { TrendingUp, TrendingDown, Package, ShoppingCart, Activity, AlertTriangle } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

const stats = [
  {
    name: 'Produits en stock',
    value: '1247',
    change: '+12.5%',
    trend: 'up',
    icon: Package,
    color: 'bg-blue-500',
  },
  {
    name: 'Commandes en attente',
    value: '23',
    change: '-8.3%',
    trend: 'down',
    icon: ShoppingCart,
    color: 'bg-purple-500',
  },
  {
    name: 'Mouvements de stock',
    value: '156',
    change: '+23.1%',
    trend: 'up',
    icon: Activity,
    color: 'bg-green-500',
  },
  {
    name: 'Alertes stock faible',
    value: '8',
    change: 'Action requise',
    trend: 'urgent',
    icon: AlertTriangle,
    color: 'bg-red-500',
  },
];

const activities = [
  { id: 1, type: 'success', message: 'Connexion réussie', time: 'Il y a quelques instants' },
  { id: 2, type: 'success', message: 'Compte créé avec succès', time: "Aujourd'hui" },
  { id: 3, type: 'info', message: 'Organisation configurée', time: "Aujourd'hui" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue, Jean ! 👋</h1>
          <p className="mt-2 text-gray-600">
            Voici un aperçu de votre activité et de vos indicateurs clés.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  {stat.trend === 'urgent' ? (
                    <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                      Urgent
                    </span>
                  ) : null}
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.name}</h3>
                <div className="flex items-baseline justify-between">
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  {stat.trend !== 'urgent' && (
                    <div className="flex items-center">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">ce mois</span>
                    </div>
                  )}
                </div>
                {stat.trend === 'urgent' && (
                  <p className="text-sm text-red-600 mt-2 font-medium">{stat.change}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activités récentes</h2>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
