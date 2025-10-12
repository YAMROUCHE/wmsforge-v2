import { useState } from 'react';
import { X, Plus, Minus, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { adjustStock, type InventoryItem } from '../../lib/api';

interface AdjustStockModalProps {
  product: InventoryItem;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdjustStockModal({ product, onClose, onSuccess }: AdjustStockModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('in');
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [locationId] = useState(1); // ID de l'emplacement par défaut

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      setError('La quantité doit être supérieure à 0');
      return;
    }

    // Si c'est une sortie, la quantité doit être négative
    const adjustedQty = type === 'out' ? -qty : qty;

    setIsLoading(true);

    try {
      await adjustStock({
        productId: product.productId,
        locationId,
        quantity: adjustedQty,
        type,
        notes: notes || undefined,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const typeOptions = [
    { value: 'in', label: 'Entrée de stock', icon: Plus, description: 'Ajouter du stock' },
    { value: 'out', label: 'Sortie de stock', icon: Minus, description: 'Retirer du stock' },
    { value: 'adjustment', label: 'Ajustement', icon: RefreshCw, description: 'Corriger le stock' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Ajuster le stock</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Produit</p>
                  <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-600">Stock actuel</p>
                  <p className="text-xl font-bold text-gray-900">{product.totalQuantity}</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'opération
              </label>
              <div className="space-y-2">
                {typeOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value as any)}
                      className={`w-full flex items-center p-2.5 rounded-lg border-2 transition-colors ${
                        type === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${
                        type === option.value ? 'bg-blue-500' : 'bg-gray-200'
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          type === option.value ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="ml-2.5 text-left">
                        <p className={`text-sm font-medium ${
                          type === option.value ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 50"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Ajoutez une note sur cette opération..."
              />
            </div>

            {/* Preview */}
            {quantity && parseInt(quantity) > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-1">Aperçu</p>
                <p className="text-sm text-blue-800">
                  Stock actuel: <strong>{product.totalQuantity}</strong>
                  {' → '}
                  Nouveau stock: <strong>
                    {type === 'out' 
                      ? Math.max(0, product.totalQuantity - parseInt(quantity))
                      : product.totalQuantity + parseInt(quantity)
                    }
                  </strong>
                </p>
              </div>
            )}
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 bg-white">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Traitement...' : 'Confirmer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
