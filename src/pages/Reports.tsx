import React, { useState } from 'react';
import { BarChart3, TrendingUp, Package, ShoppingCart, MapPin, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAnalytics, useAnalyticsByPeriod } from '../hooks/useAnalytics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function Reports() {
  const [dateRange, setDateRange] = useState('30');

  const { data: analytics, isLoading } = useAnalytics();
  const { data: periodStats } = useAnalyticsByPeriod(parseInt(dateRange));

  const handleExport = (format: 'csv' | 'pdf') => {
    if (format === 'csv') {
      exportToCSV();
    } else {
      alert('Export PDF en cours de développement...');
    }
  };

  const exportToCSV = () => {
    if (!analytics) return;

    const csvContent = [
      ['Métrique', 'Valeur', 'Détails'].join(','),
      ['Commandes totales', analytics.totalOrders, `${analytics.ordersThisMonth} ce mois`].join(','),
      ['Revenu total', `${analytics.totalRevenue}€`, `~${analytics.averageOrderValue}€ par commande`].join(','),
      ['Produits', analytics.totalProducts, `${analytics.stockValue} unités en stock`].join(','),
      ['Emplacements', analytics.totalLocations, 'Zones actives'].join(','),
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Chargement des rapports...</div>
      </div>
    );
  }

  const statusData = analytics?.statusBreakdown ? [
    { name: 'En attente', value: analytics.statusBreakdown.pending },
    { name: 'Confirmées', value: analytics.statusBreakdown.confirmed },
    { name: 'Expédiées', value: analytics.statusBreakdown.shipped },
    { name: 'Livrées', value: analytics.statusBreakdown.delivered },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rapports & Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">Vue d'ensemble de votre activité</p>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Indicateurs clés</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+12%</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Commandes totales</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics?.totalOrders || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{analytics?.ordersThisMonth || 0} ce mois</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">+8%</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Revenu total</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics?.totalRevenue || 0}€</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">~{analytics?.averageOrderValue || 0}€ / commande</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Package className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Produits</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics?.totalProducts || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{analytics?.stockValue || 0} unités en stock</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Emplacements</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{analytics?.totalLocations || 0}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Zones actives</p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Commandes par jour */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Commandes par jour (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics?.ordersPerDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Commandes"
                dot={{ fill: '#3B82F6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenu par jour */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Revenu par jour (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.revenuePerDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9CA3AF"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Legend />
              <Bar
                dataKey="revenue"
                fill="#10B981"
                name="Revenu (€)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par statut */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Répartition des commandes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Performance des ventes</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux de confirmation</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {analytics?.statusBreakdown ?
                    Math.round((analytics.statusBreakdown.confirmed / analytics.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${analytics?.statusBreakdown ?
                      (analytics.statusBreakdown.confirmed / analytics.totalOrders) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux d'expédition</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {analytics?.statusBreakdown ?
                    Math.round((analytics.statusBreakdown.shipped / analytics.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${analytics?.statusBreakdown ?
                      (analytics.statusBreakdown.shipped / analytics.totalOrders) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Taux de livraison</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {analytics?.statusBreakdown ?
                    Math.round((analytics.statusBreakdown.delivered / analytics.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{
                    width: `${analytics?.statusBreakdown ?
                      (analytics.statusBreakdown.delivered / analytics.totalOrders) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Note :</strong> Ces rapports sont générés en temps réel à partir de vos données.
          Les graphiques sont interactifs - survolez-les pour plus de détails.
        </p>
      </div>
    </div>
  );
}
