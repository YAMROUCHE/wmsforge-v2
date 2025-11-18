import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../services/api';

// Hook pour obtenir toutes les statistiques analytics
export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: async () => {
      // Récupérer les données de plusieurs sources
      const [ordersRes, ordersStatsRes, productsRes, inventoryRes, locationsRes] = await Promise.all([
        fetch('http://localhost:8787/api/orders'),
        fetch('http://localhost:8787/api/orders/stats'),
        fetch('http://localhost:8787/api/products'),
        fetch('http://localhost:8787/api/inventory'),
        fetch('http://localhost:8787/api/locations'),
      ]);

      const orders = (await ordersRes.json()).orders || [];
      const ordersStats = (await ordersStatsRes.json()).stats || {};
      const products = (await productsRes.json());
      const inventory = (await inventoryRes.json()).items || [];
      const locations = (await locationsRes.json()).locations || [];

      // Calculer les statistiques
      const now = new Date();
      const thisMonth = now.getMonth();
      const ordersThisMonth = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === thisMonth;
      }).length;

      const stockValue = inventory.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
      const averageOrderValue = orders.length > 0 ? ordersStats.total_revenue / orders.length : 0;

      // Calculer les tendances pour les graphiques
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const ordersPerDay = last7Days.map(date => {
        const count = orders.filter((order: any) =>
          order.created_at?.startsWith(date)
        ).length;
        return { date: date.split('-').slice(1).join('/'), orders: count };
      });

      const revenuePerDay = last7Days.map(date => {
        const dayOrders = orders.filter((order: any) =>
          order.created_at?.startsWith(date)
        );
        const revenue = dayOrders.reduce((sum: number, order: any) =>
          sum + (order.total_amount || 0), 0
        );
        return { date: date.split('-').slice(1).join('/'), revenue: Math.round(revenue) };
      });

      return {
        totalProducts: products.pagination?.total || 0,
        totalOrders: orders.length,
        totalLocations: locations.length,
        totalRevenue: ordersStats.total_revenue || 0,
        stockValue,
        ordersThisMonth,
        averageOrderValue: Math.round(averageOrderValue),
        ordersPerDay,
        revenuePerDay,
        statusBreakdown: {
          pending: ordersStats.pending || 0,
          confirmed: ordersStats.confirmed || 0,
          shipped: ordersStats.shipped || 0,
          delivered: ordersStats.delivered || 0,
        }
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

// Hook pour obtenir les statistiques par période
export function useAnalyticsByPeriod(days: number = 30) {
  return useQuery({
    queryKey: ['analytics', 'period', days],
    queryFn: async () => {
      const ordersRes = await fetch('http://localhost:8787/api/orders');
      const orders = (await ordersRes.json()).orders || [];

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filteredOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.created_at);
        return orderDate >= cutoffDate;
      });

      const totalRevenue = filteredOrders.reduce(
        (sum: number, order: any) => sum + (order.total_amount || 0),
        0
      );

      return {
        totalOrders: filteredOrders.length,
        totalRevenue: Math.round(totalRevenue),
        averageOrderValue: filteredOrders.length > 0
          ? Math.round(totalRevenue / filteredOrders.length)
          : 0,
      };
    },
    staleTime: 30000,
  });
}
