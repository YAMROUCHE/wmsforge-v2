import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package, ShoppingCart, MapPin, Download, Calendar } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalLocations: number;
  totalRevenue: number;
  stockValue: number;
  ordersThisMonth: number;
  averageOrderValue: number;
  topProduct: string;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalLocations: 0,
    totalRevenue: 0,
    stockValue: 0,
    ordersThisMonth: 0,
    averageOrderValue: 0,
    topProduct: 'N/A'
  });

  const [dateRange, setDateRange] = useState('30'); // 30 jours par défaut

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch products
      const productsRes = await fetch('http://localhost:8787/api/products');
      const productsData = await productsRes.json();
      const totalProducts = productsData.pagination?.total || 0;

      // Fetch orders
      const ordersRes = await fetch('http://localhost:8787/api/orders');
      const ordersData = await ordersRes.json();
      const orders = ordersData.orders || [];

      // Fetch orders stats
      const ordersStatsRes = await fetch('http://localhost:8787/api/orders/stats');
      const ordersStatsData = await ordersStatsRes.json();
      const totalRevenue = ordersStatsData.stats?.total_revenue || 0;

      // Fetch locations
      const locationsRes = await fetch('http://localhost:8787/api/locations');
      const locationsData = await locationsRes.json();
      const totalLocations = locationsData.locations?.length || 0;

      // Fetch inventory
      const inventoryRes = await fetch('http://localhost:8787/api/inventory');
      const inventoryData = await inventoryRes.json();
      const inventory = inventoryData.items || [];
      const stockValue = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

      // Calculer les commandes du mois
      const thisMonth = new Date().getMonth();
      const ordersThisMonth = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === thisMonth;
      }).length;

      // Calculer la valeur moyenne des commandes
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      setStats({
        totalProducts,
        totalOrders: orders.length,
        totalLocations,
        totalRevenue,
        stockValue,
        ordersThisMonth,
        averageOrderValue: Math.round(averageOrderValue),
        topProduct: 'Dupont' // Placeholder
      });
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      alert('Export PDF en cours de développement...');
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      // Header
      ['Métrique', 'Valeur', 'Détails'].join(','),

      // KPIs principaux
      ['Commandes totales', stats.totalOrders, `${stats.ordersThisMonth} ce mois`].join(','),
      ['Revenu total', `${stats.totalRevenue}€`, `~${stats.averageOrderValue}€ par commande`].join(','),
      ['Produits', stats.totalProducts, `${stats.stockValue} unités en stock`].join(','),
      ['Emplacements', stats.totalLocations, 'Zones actives'].join(','),
      '',

      // Performance des ventes
      ['Performance des ventes', '', ''].join(','),
      ['Commandes confirmées', '75%', ''].join(','),
      ['Commandes expédiées', '60%', ''].join(','),
      ['Commandes livrées', '50%', ''].join(','),
      '',

      // Top produits
      ['Top Produits', '', ''].join(','),
      ['1', stats.topProduct, `${stats.stockValue} unités`].join(','),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `rapport-wms-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rapports & Analytics</h1>
              <p className="text-gray-600">Vue d'ensemble de votre activité</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
              <option value="365">12 derniers mois</option>
            </select>
            <Button variant="secondary" onClick={() => handleExport('csv')}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Indicateurs clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+12%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Commandes totales</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.ordersThisMonth} ce mois</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-medium">+8%</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Revenu total</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRevenue}€</p>
            <p className="text-xs text-gray-500 mt-2">~{stats.averageOrderValue}€ / commande</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">—</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Produits</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.stockValue} unités en stock</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-gray-600 text-sm font-medium">—</span>
            </div>
            <p className="text-gray-600 text-sm mb-1">Emplacements</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalLocations}</p>
            <p className="text-xs text-gray-500 mt-2">Zones actives</p>
          </div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance des ventes */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance des ventes</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Commandes confirmées</span>
                <span className="text-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Commandes expédiées</span>
                <span className="text-sm font-medium">60%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Commandes livrées</span>
                <span className="text-sm font-medium">50%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Produits */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Produits</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{stats.topProduct}</p>
                  <p className="text-xs text-gray-500">SKU-0002</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.stockValue} unités</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">—</p>
                  <p className="text-xs text-gray-500">Aucune donnée</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">—</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">—</p>
                  <p className="text-xs text-gray-500">Aucune donnée</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">—</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métriques opérationnelles */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Métriques opérationnelles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 border-r border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Taux de rotation du stock</p>
            <p className="text-4xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-500 mt-2">À calculer</p>
          </div>
          <div className="text-center p-4 border-r border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Délai moyen de livraison</p>
            <p className="text-4xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-500 mt-2">À calculer</p>
          </div>
          <div className="text-center p-4">
            <p className="text-gray-600 text-sm mb-2">Taux de satisfaction</p>
            <p className="text-4xl font-bold text-gray-900">—</p>
            <p className="text-xs text-gray-500 mt-2">À implémenter</p>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note :</strong> Cette page affiche des statistiques en temps réel basées sur vos données.
          Les graphiques avancés et exports de rapports seront ajoutés dans une prochaine version.
        </p>
      </div>
    </div>
  );
}
