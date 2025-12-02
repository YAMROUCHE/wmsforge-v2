import { useState, useEffect } from 'react';
import { Package, Plus, ArrowRight, RefreshCw, TrendingUp, Box } from 'lucide-react';
import { Button } from '../components/ui/Button';
import ExportButton from '../components/ExportButton';
import { logger } from '@/lib/logger';
import { fetchAPI } from '@/lib/api';

interface InventoryItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  locationId: number;
  locationCode: string;
  quantityOnHand: number;
  quantityAvailable: number;
  quantityReserved: number;
  status: string;
  lotNumber?: string;
  lastMovementDate?: string;
}

interface Product {
  id: number;
  sku: string;
  name: string;
}

interface Location {
  id: number;
  code: string;
  name: string;
}

interface Movement {
  id: number;
  type: string;
  productName: string;
  productSku: string;
  quantity: number;
  reason: string;
  createdAt: string;
}

export default function Inventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  
  // Formulaires
  const [receiveForm, setReceiveForm] = useState({
    productId: '',
    locationId: '',
    quantity: '',
    lotNumber: '',
    reference: ''
  });

  const [moveForm, setMoveForm] = useState({
    fromInventoryId: '',
    toLocationId: '',
    quantity: '',
    reason: ''
  });

  const [adjustForm, setAdjustForm] = useState({
    inventoryId: '',
    newQuantity: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchInventory();
    fetchProducts();
    fetchLocations();
    fetchMovements();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await fetchAPI<{ items: InventoryItem[] }>('/api/inventory');
      setInventory(data.items || []);
    } catch (error) {
      logger.error('Erreur chargement inventaire:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await fetchAPI<{ items: Product[] }>('/api/products?limit=1000');
      setProducts(data.items || []);
    } catch (error) {
      logger.error('Erreur chargement produits:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await fetchAPI<{ locations: Location[] }>('/api/locations');
      setLocations(data.locations || []);
    } catch (error) {
      logger.error('Erreur chargement emplacements:', error);
    }
  };

  const fetchMovements = async () => {
    try {
      const data = await fetchAPI<{ movements: Movement[] }>('/api/inventory/movements');
      setMovements(data.movements || []);
    } catch (error) {
      logger.error('Erreur chargement mouvements:', error);
    }
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/api/inventory/receive', {
        method: 'POST',
        body: JSON.stringify({
          productId: parseInt(receiveForm.productId),
          locationId: parseInt(receiveForm.locationId),
          quantity: parseInt(receiveForm.quantity),
          lotNumber: receiveForm.lotNumber,
          reference: receiveForm.reference
        })
      });

      setShowReceiveModal(false);
      setReceiveForm({ productId: '', locationId: '', quantity: '', lotNumber: '', reference: '' });
      fetchInventory();
      fetchMovements();
    } catch (error) {
      logger.error('Erreur réception:', error);
    }
  };

  const handleMove = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/api/inventory/move', {
        method: 'POST',
        body: JSON.stringify({
          fromInventoryId: parseInt(moveForm.fromInventoryId),
          toLocationId: parseInt(moveForm.toLocationId),
          quantity: parseInt(moveForm.quantity),
          reason: moveForm.reason
        })
      });

      setShowMoveModal(false);
      setMoveForm({ fromInventoryId: '', toLocationId: '', quantity: '', reason: '' });
      fetchInventory();
      fetchMovements();
    } catch (error: any) {
      logger.error('Erreur déplacement:', error);
      alert(error.message || 'Erreur lors du déplacement du stock');
    }
  };

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          inventoryId: parseInt(adjustForm.inventoryId),
          newQuantity: parseInt(adjustForm.newQuantity),
          reason: adjustForm.reason,
          notes: adjustForm.notes
        })
      });

      setShowAdjustModal(false);
      setAdjustForm({ inventoryId: '', newQuantity: '', reason: '', notes: '' });
      fetchInventory();
      fetchMovements();
    } catch (error) {
      logger.error('Erreur ajustement:', error);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'RECEIVE': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'MOVE': return <ArrowRight className="w-4 h-4 text-blue-600" />;
      case 'ADJUST': return <RefreshCw className="w-4 h-4 text-orange-600" />;
      default: return <Box className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'RECEIVE': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'MOVE': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'ADJUST': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalStock = inventory.reduce((sum, item) => sum + (item.quantityOnHand || 0), 0);
  const totalAvailable = inventory.reduce((sum, item) => sum + (item.quantityAvailable || 0), 0);
  const totalReserved = inventory.reduce((sum, item) => sum + (item.quantityReserved || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Package className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gestion d'Inventaire</h1>
            </div>
            <div className="flex space-x-3">
              <ExportButton type="inventory" data={inventory} />
              <Button
                variant="secondary"
                onClick={() => setShowMoveModal(true)}
                className="flex items-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Déplacer Stock
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowAdjustModal(true)}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Ajuster Stock
              </Button>
              <Button
                onClick={() => setShowReceiveModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Réception
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalStock}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-green-600">{totalAvailable}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Disponible</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-orange-600">{totalReserved}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Réservé</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-2xl font-bold text-blue-600">{locations.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Emplacements</div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Stock par Emplacement</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Chargement...</div>
          ) : inventory.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Aucun stock. Commencez par une réception !
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produit
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Emplacement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Disponible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Réservé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Lot
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:divide-gray-700">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.productName}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.productSku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {item.locationCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {(item.quantityOnHand || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {(item.quantityAvailable || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                        {0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {item.lotNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Movements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mouvements Récents</h2>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {movements.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">Aucun mouvement</div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {movements.map((movement) => (
                  <div key={movement.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      {getMovementIcon(movement.type)}
                      <div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMovementBadge(movement.type)}`}>
                          {movement.type}
                        </span>
                        <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                          {movement.productName} ({movement.productSku})
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {movement.quantity} unités
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(movement.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Réception */}
      {showReceiveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Réception de Marchandise</h2>
            </div>
            
            <form onSubmit={handleReceive} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Produit *
                </label>
                <select
                  required
                  value={receiveForm.productId}
                  onChange={(e) => setReceiveForm({...receiveForm, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Emplacement *
                </label>
                <select
                  required
                  value={receiveForm.locationId}
                  onChange={(e) => setReceiveForm({...receiveForm, locationId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={receiveForm.quantity}
                  onChange={(e) => setReceiveForm({...receiveForm, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Numéro de Lot
                </label>
                <input
                  type="text"
                  value={receiveForm.lotNumber}
                  onChange={(e) => setReceiveForm({...receiveForm, lotNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Référence (PO/ASN)
                </label>
                <input
                  type="text"
                  value={receiveForm.reference}
                  onChange={(e) => setReceiveForm({...receiveForm, reference: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowReceiveModal(false);
                    setReceiveForm({ productId: '', locationId: '', quantity: '', lotNumber: '', reference: '' });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Recevoir
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Déplacement */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Déplacement de Stock</h2>
            </div>
            
            <form onSubmit={handleMove} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Source *
                </label>
                <select
                  required
                  value={moveForm.fromInventoryId}
                  onChange={(e) => setMoveForm({...moveForm, fromInventoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  {inventory.filter(i => i.quantityAvailable > 0).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.productName} @ {item.locationCode} ({(item.quantityAvailable || 0)} disponibles)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Vers Emplacement *
                </label>
                <select
                  required
                  value={moveForm.toLocationId}
                  onChange={(e) => setMoveForm({...moveForm, toLocationId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantité *
                  {moveForm.fromInventoryId && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Max: {inventory.find(i => i.id === parseInt(moveForm.fromInventoryId))?.quantityAvailable || 0})
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={moveForm.fromInventoryId ? inventory.find(i => i.id === parseInt(moveForm.fromInventoryId))?.quantityAvailable : undefined}
                  value={moveForm.quantity}
                  onChange={(e) => setMoveForm({...moveForm, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Raison
                </label>
                <input
                  type="text"
                  value={moveForm.reason}
                  onChange={(e) => setMoveForm({...moveForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowMoveModal(false);
                    setMoveForm({ fromInventoryId: '', toLocationId: '', quantity: '', reason: '' });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Déplacer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajustement */}
      {showAdjustModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Ajustement d'Inventaire</h2>
            </div>
            
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock à Ajuster *
                </label>
                <select
                  required
                  value={adjustForm.inventoryId}
                  onChange={(e) => setAdjustForm({...adjustForm, inventoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.productName} @ {item.locationCode} (Actuel: {(item.quantityOnHand || 0)})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nouvelle Quantité *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={adjustForm.newQuantity}
                  onChange={(e) => setAdjustForm({...adjustForm, newQuantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Raison *
                </label>
                <select
                  required
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({...adjustForm, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Sélectionner</option>
                  <option value="Comptage cyclique">Comptage cyclique</option>
                  <option value="Écart inventaire">Écart inventaire</option>
                  <option value="Produit endommagé">Produit endommagé</option>
                  <option value="Correction erreur">Correction erreur</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({...adjustForm, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustForm({ inventoryId: '', newQuantity: '', reason: '', notes: '' });
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit">
                  Ajuster
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
