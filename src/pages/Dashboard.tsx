import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { 
  LogOut, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Données simulées pour les KPI (en attendant la vraie API)
  const stats = {
    productsInStock: 1247,
    productsChange: +12.5,
    pendingOrders: 23,
    ordersChange: -8.3,
    todayMovements: 156,
    movementsChange: +23.1,
    stockAlerts: 8,
    alertsLevel: 'high'
  };

  const recentActivities = [
    {
      id: 1,
      type: 'success',
      title: 'Connexion réussie',
      time: 'Il y a quelques instants',
      color: 'blue'
    },
    {
      id: 2,
      type: 'info',
      title: 'Compte créé avec succès',
      time: 'Aujourd\'hui',
      color: 'green'
    },
    {
      id: 3,
      type: 'update',
      title: 'Organisation configurée',
      time: 'Aujourd\'hui',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <span className="text-xl font-semibold">wms.io</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue, {user?.name} ! 👋
          </h1>
          <p className="text-gray-600">
            Voici un aperçu de votre activité et de vos indicateurs clés.
          </p>
        </div>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1: Produits en stock */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Produits en stock</p>
                <p className="text-3xl font-bold text-gray-900">{stats.productsInStock.toLocaleString()}</p>
                <div className="flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">+{stats.productsChange}%</span>
                  <span className="text-gray-500 ml-1">ce mois</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Commandes en attente */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-purple-600" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  En cours
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Commandes en attente</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
                <div className="flex items-center text-sm">
                  <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                  <span className="text-red-600 font-medium">{stats.ordersChange}%</span>
                  <span className="text-gray-500 ml-1">vs hier</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Mouvements aujourd'hui */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Clock className="w-3 h-3 mr-1" />
                  Aujourd'hui
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Mouvements de stock</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayMovements}</p>
                <div className="flex items-center text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">+{stats.movementsChange}%</span>
                  <span className="text-gray-500 ml-1">vs moyenne</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Alertes stock */}
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Urgent
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600">Alertes stock faible</p>
                <p className="text-3xl font-bold text-gray-900">{stats.stockAlerts}</p>
                <p className="text-sm text-red-600 font-medium">
                  Action requise
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Activités récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className={`w-2 h-2 bg-${activity.color}-600 rounded-full mt-2 mr-3`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 font-medium">{activity.title}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Système</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-green-900">Statut</p>
                      <p className="text-xs text-green-700">Opérationnel</p>
                    </div>
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-1">Base de données</p>
                    <p className="text-xs text-blue-700">Connectée • D1</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 mb-1">Stockage</p>
                    <p className="text-xs text-purple-700">Prêt • R2 Bucket</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">✅ Système opérationnel !</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Votre application 1wms.io est maintenant prête à l'emploi. Tous les systèmes fonctionnent correctement.</p>
                <p className="mt-2"><strong>Prochaines étapes :</strong> Activer les modules de gestion (Produits, Inventaire, Commandes).</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
