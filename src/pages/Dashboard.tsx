import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, ShoppingCart, Activity, AlertTriangle, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

interface DashboardStats {
  totalProducts: number;
  totalInventory: number;
  pendingOrders: number;
  totalMovements: number;
  lowStockAlerts: number;
  totalLocations: number;
  totalRevenue: number;
}

interface Movement {
  id: number;
  product_name: string;
  type: string;
  quantity: number;
  created_at: string;
  location_name?: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalInventory: 0,
    pendingOrders: 0,
    totalMovements: 0,
    lowStockAlerts: 0,
    totalLocations: 0,
    totalRevenue: 0
  });
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch en parallèle de toutes les APIs
      const [productsRes, inventoryRes, ordersRes, ordersStatsRes, movementsRes, locationsRes, settingsRes] = await Promise.all([
        fetch('http://localhost:8787/api/products'),
        fetch('http://localhost:8787/api/inventory'),
        fetch('http://localhost:8787/api/orders'),
        fetch('http://localhost:8787/api/orders/stats'),
        fetch('http://localhost:8787/api/inventory/movements'),
        fetch('http://localhost:8787/api/locations'),
        fetch('http://localhost:8787/api/settings')
      ]);

      const products = await productsRes.json();
      const inventory = await inventoryRes.json();
      const orders = await ordersRes.json();
      const ordersStats = await ordersStatsRes.json();
      const movements = await movementsRes.json();
      const locations = await locationsRes.json();
      const settings = await settingsRes.json();

      // Calculer le stock total
      const totalInventory = inventory.items?.reduce((sum: number, item: any) =>
        sum + (item.quantity || 0), 0) || 0;

      // Compter les alertes stock faible (quantité < 10)
      const lowStockAlerts = inventory.items?.filter((item: any) =>
        (item.quantity || 0) < 10).length || 0;

      // Compter les commandes en attente
      const pendingOrders = orders.orders?.filter((order: any) =>
        order.status === 'pending').length || 0;

      setStats({
        totalProducts: products.pagination?.total || 0,
        totalInventory,
        pendingOrders,
        totalMovements: movements.movements?.length || 0,
        lowStockAlerts,
        totalLocations: locations.locations?.length || 0,
        totalRevenue: ordersStats.stats?.total_revenue || 0
      });

      // Récupérer les 5 derniers mouvements
      const latestMovements = movements.movements?.slice(0, 5) || [];
      setRecentMovements(latestMovements);

      // Récupérer le nom de l'utilisateur
      setUserName(settings.profile?.name || 'Utilisateur');
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'receive': 'Réception',
      'move': 'Déplacement',
      'adjust': 'Ajustement',
      'ship': 'Expédition'
    };
    return types[type] || type;
  };

  const getMovementTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'receive': 'bg-green-500',
      'move': 'bg-blue-500',
      'adjust': 'bg-yellow-500',
      'ship': 'bg-purple-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays > 0) {
        return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
      } else if (diffInHours > 0) {
        return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
      } else {
        return 'Il y a quelques instants';
      }
    } catch {
      return "Aujourd'hui";
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Chargement du dashboard...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue, {userName} ! 👋</h1>
          <p className="mt-2 text-gray-600">
            Voici un aperçu de votre activité et de vos indicateurs clés.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {/* Produits en stock */}
          <div
            onClick={() => navigate('/products')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-500 p-3 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Produits en stock</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">{stats.totalInventory}</p>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.totalProducts} produits distincts</p>
          </div>

          {/* Commandes en attente */}
          <div
            onClick={() => navigate('/orders')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-500 p-3 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              {stats.pendingOrders > 0 && (
                <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  {stats.pendingOrders} en attente
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Commandes</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">{stats.pendingOrders}</p>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">Revenu total: {stats.totalRevenue}€</p>
          </div>

          {/* Mouvements de stock */}
          <div
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-500 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Mouvements</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">{stats.totalMovements}</p>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{stats.totalLocations} emplacements actifs</p>
          </div>

          {/* Alertes stock faible */}
          <div
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              {stats.lowStockAlerts > 0 && (
                <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded">
                  Urgent
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Alertes stock faible</h3>
            <div className="flex items-baseline justify-between">
              <p className="text-3xl font-bold text-gray-900">{stats.lowStockAlerts}</p>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            {stats.lowStockAlerts > 0 && (
              <p className="text-sm text-red-600 mt-2 font-medium">Action requise</p>
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Mouvements récents</h2>
            <button
              onClick={() => navigate('/inventory')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
            >
              Voir tout
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentMovements.length > 0 ? (
            <div className="space-y-4">
              {recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className={`w-2 h-2 mt-2 rounded-full ${getMovementTypeColor(movement.type)}`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-900 font-medium">
                          {getMovementTypeLabel(movement.type)} - {movement.product_name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Quantité: {movement.quantity} {movement.location_name && `• ${movement.location_name}`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimeAgo(movement.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Aucun mouvement récent</p>
              <button
                onClick={() => navigate('/inventory')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Créer un mouvement
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
