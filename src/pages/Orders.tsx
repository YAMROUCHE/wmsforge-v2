import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Package, TrendingUp, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ExportButton from '../components/ExportButton';
import { useOrders, useOrderStats, useCreateOrder, useUpdateOrderStatus, useDeleteOrder } from '../hooks/useOrders';
import { useNotifications } from '../contexts/NotificationContext';
import { CreateOrderRequest } from '../services/api';
import { logger } from '@/lib/logger';

interface Product {
  id: number;
  sku: string;
  name: string;
  unit_price?: number;
}

interface OrderItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export default function Orders() {
  const { addNotification } = useNotifications();

  // React Query hooks
  const { data: orders = [], isLoading: ordersLoading } = useOrders();
  const { data: stats } = useOrderStats();
  const createOrder = useCreateOrder();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  // Données produits (on pourrait aussi créer un hook useProducts)
  const [products, setProducts] = useState<Product[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Formulaire de création de commande
  const [orderForm, setOrderForm] = useState<{
    type: 'purchase' | 'sales';
    customerName: string;
    customerEmail: string;
    items: OrderItem[];
  }>({
    type: 'sales',
    customerName: '',
    customerEmail: '',
    items: []
  });

  // Formulaire pour ajouter un item
  const [itemForm, setItemForm] = useState({
    productId: '',
    quantity: '',
    unitPrice: ''
  });

  // Charger les produits au montage
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('wms_auth_token');
      const API_URL = 'https://wmsforge-api.youssef-amrouche.workers.dev';
      const response = await fetch(`${API_URL}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data.items || []);
      }
    } catch (error) {
      logger.error('Erreur chargement produits:', error);
    }
  };

  const handleCreateOrder = async () => {
    try {
      const orderData: CreateOrderRequest = {
        type: orderForm.type,
        customerName: orderForm.customerName,
        customerEmail: orderForm.customerEmail,
        items: orderForm.items.map(item => ({
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice
        }))
      };

      await createOrder.mutateAsync(orderData);

      addNotification({
        type: 'success',
        title: 'Succès',
        message: 'Commande créée avec succès'
      });

      setShowCreateModal(false);
      setOrderForm({ type: 'sales', customerName: '', customerEmail: '', items: [] });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors de la création de la commande'
      });
    }
  };

  const handleAddItem = () => {
    if (!itemForm.productId || !itemForm.quantity || !itemForm.unitPrice) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez remplir tous les champs'
      });
      return;
    }

    const product = products.find(p => p.id === parseInt(itemForm.productId));
    const newItem: OrderItem = {
      productId: parseInt(itemForm.productId),
      productName: product?.name,
      quantity: parseInt(itemForm.quantity),
      unitPrice: parseFloat(itemForm.unitPrice)
    };

    setOrderForm({
      ...orderForm,
      items: [...orderForm.items, newItem]
    });

    setItemForm({ productId: '', quantity: '', unitPrice: '' });
  };

  const handleRemoveItem = (index: number) => {
    setOrderForm({
      ...orderForm,
      items: orderForm.items.filter((_, i) => i !== index)
    });
  };

  const handleChangeStatus = async (orderId: number, newStatus: string) => {
    try {
      await updateStatus.mutateAsync(
        { id: orderId, status: newStatus },
        {
          onSuccess: () => {
            addNotification({
              type: 'success',
              title: 'Succès',
              message: 'Statut mis à jour'
            });
          },
          onError: () => {
            addNotification({
              type: 'error',
              title: 'Erreur',
              message: 'Erreur lors de la mise à jour du statut'
            });
          }
        }
      );
    } catch (error) {
      // Error already handled by onError
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

    try {
      await deleteOrder.mutateAsync(orderId, {
        onSuccess: () => {
          addNotification({
            type: 'success',
            title: 'Succès',
            message: 'Commande supprimée'
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la suppression'
          });
        }
      });
    } catch (error) {
      // Error already handled by onError
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    const labels = {
      pending: 'En attente',
      confirmed: 'Confirmée',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const calculateTotal = () => {
    return orderForm.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-600 dark:text-gray-300">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <ShoppingCart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Commandes</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Gestion des commandes clients et fournisseurs</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <ExportButton type="orders" data={orders} />
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Commande
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_orders || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">En attente</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Confirmées</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.confirmed || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Expédiées</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.shipped || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Revenu</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{(stats?.total_revenue || 0).toFixed(2)} €</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Articles</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    Aucune commande pour le moment
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <span className={`px-2 py-1 text-xs rounded-full ${order.type === 'purchase' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {order.type === 'purchase' ? 'Achat' : 'Vente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.customer_name || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{order.items_count || 0}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{order.total_amount || 0} €</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleChangeStatus(order.id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-xs"
                          >
                            Confirmer
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleChangeStatus(order.id, 'shipped')}
                            className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-xs"
                          >
                            Expédier
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Création Commande */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Nouvelle Commande</h2>

            <div className="space-y-4">
              {/* Type de commande */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type de commande</label>
                <select
                  value={orderForm.type}
                  onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value as 'purchase' | 'sales' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="sales">Vente</option>
                  <option value="purchase">Achat</option>
                </select>
              </div>

              {/* Informations client */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom du client</label>
                  <input
                    type="text"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
                    placeholder="Ex: Entreprise ACME"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email du client</label>
                  <input
                    type="email"
                    value={orderForm.customerEmail}
                    onChange={(e) => setOrderForm({ ...orderForm, customerEmail: e.target.value })}
                    placeholder="client@example.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              {/* Articles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ajouter un article</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <select
                    value={itemForm.productId}
                    onChange={(e) => {
                      const productId = e.target.value;
                      const product = products.find(p => p.id === parseInt(productId));
                      setItemForm({
                        ...itemForm,
                        productId,
                        unitPrice: product?.unit_price ? product.unit_price.toString() : ''
                      });
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Produit</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Quantité"
                    value={itemForm.quantity}
                    onChange={(e) => setItemForm({ ...itemForm, quantity: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                  <input
                    type="number"
                    placeholder="Prix unitaire"
                    value={itemForm.unitPrice}
                    onChange={(e) => setItemForm({ ...itemForm, unitPrice: e.target.value })}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <Button onClick={handleAddItem} variant="secondary">
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>

              {/* Liste des items */}
              {orderForm.items.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Articles de la commande</h3>
                  <div className="space-y-2">
                    {orderForm.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{item.productName}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{item.quantity} × {item.unitPrice}€</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.quantity * item.unitPrice}€</span>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-xs"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-gray-100">Total</span>
                      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{calculateTotal()}€</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={handleCreateOrder}
                disabled={orderForm.items.length === 0 || createOrder.isPending}
              >
                {createOrder.isPending ? 'Création...' : 'Créer la commande'}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
