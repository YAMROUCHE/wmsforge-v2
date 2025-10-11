import { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, AlertTriangle, History } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getInventory, type InventoryItem } from '../lib/api';
import AppLayout from '../components/layout/AppLayout';
import AdjustStockModal from '../components/inventory/AdjustStockModal';

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Erreur chargement inventaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStockStatus = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return { label: 'Rupture', color: 'text-red-600 bg-red-50', icon: AlertTriangle };
    if (quantity <= reorderPoint) return { label: 'Faible', color: 'text-orange-600 bg-orange-50', icon: TrendingDown };
    return { label: 'Normal', color: 'text-green-600 bg-green-50', icon: TrendingUp };
  };

  const handleAdjust = (item: InventoryItem) => {
    setSelectedProduct(item);
    setShowAdjustModal(true);
  };

  const handleCloseModal = () => {
    setShowAdjustModal(false);
    setSelectedProduct(null);
    loadInventory();
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventaire</h1>
              <p className="mt-2 text-gray-600">
                Vue d'ensemble du stock en temps réel
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary">
                <History className="w-4 h-4 mr-2" />
                Historique
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total produits</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{inventory.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stock faible</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">
                  {inventory.filter(i => i.totalQuantity > 0 && i.totalQuantity <= i.reorderPoint).length}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rupture de stock</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {inventory.filter(i => i.totalQuantity === 0).length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, SKU ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {searchTerm && (
              <Button
                variant="ghost"
                onClick={() => setSearchTerm('')}
              >
                Réinitialiser
              </Button>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement...</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600">
                Commencez par ajouter des produits
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Point réappro.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map((item) => {
                  const status = getStockStatus(item.totalQuantity, item.reorderPoint);
                  const StatusIcon = status.icon;
                  
                  return (
                    <tr key={item.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.sku}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {item.totalQuantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.reorderPoint}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="ghost"
                          onClick={() => handleAdjust(item)}
                        >
                          Ajuster
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Stats */}
        {!isLoading && filteredInventory.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            Affichage de {filteredInventory.length} produit{filteredInventory.length > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Modal d'ajustement */}
      {showAdjustModal && selectedProduct && (
        <AdjustStockModal
          product={selectedProduct}
          onClose={() => setShowAdjustModal(false)}
          onSuccess={handleCloseModal}
        />
      )}
    </AppLayout>
  );
}
