import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Package, MapPin, Rocket } from 'lucide-react';
import { completeOnboarding } from '../lib/api';

const STEPS = [
  { id: 1, title: 'Bienvenue', icon: Rocket },
  { id: 2, title: 'Entrepôt', icon: MapPin },
  { id: 3, title: 'Premier Produit', icon: Package },
  { id: 4, title: 'Terminé', icon: CheckCircle2 },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [productData, setProductData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    unitPrice: '',
    reorderPoint: '10',
  });
  const { user } = useAuth();

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await completeOnboarding({
        warehouseName,
        product: productData,
      });
      
      // Forcer un rechargement complet pour mettre à jour le state
      window.location.href = '/dashboard';
    } catch (err: any) {
      console.error('Erreur lors de la complétion de l\'onboarding:', err);
      setError(err.message || 'Une erreur est survenue');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center">
              <span className="text-white font-bold text-lg">1</span>
            </div>
            <span className="text-xl font-semibold">wms.io</span>
          </div>
          <div className="text-sm text-gray-500">
            Étape {currentStep} sur {STEPS.length}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      currentStep >= step.id ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${
                      currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Erreur */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Step 1: Bienvenue */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Bienvenue sur 1wms.io, {user?.name} ! 👋
              </h2>
              <p className="text-gray-600 mb-6">
                Nous sommes ravis de vous accompagner dans la gestion de votre entrepôt.
                En quelques étapes simples, configurons ensemble votre espace de travail.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Ce processus prend environ 2 minutes</strong> et vous permettra de :
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 text-left list-disc list-inside">
                  <li>Configurer votre premier entrepôt</li>
                  <li>Ajouter votre premier produit</li>
                  <li>Découvrir les fonctionnalités essentielles</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Configuration Entrepôt */}
          {currentStep === 2 && (
            <div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Configurez votre entrepôt
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Donnez un nom à votre premier espace de stockage
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entrepôt *
                  </label>
                  <input
                    type="text"
                    value={warehouseName}
                    onChange={(e) => setWarehouseName(e.target.value)}
                    placeholder="Ex: Entrepôt Principal"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    💡 <strong>Conseil :</strong> Vous pourrez créer d'autres entrepôts et zones plus tard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Premier Produit */}
          {currentStep === 3 && (
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Ajoutez votre premier produit
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                Commencez à construire votre catalogue
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU / Référence *
                    </label>
                    <input
                      type="text"
                      value={productData.sku}
                      onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                      placeholder="Ex: PROD-001"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <input
                      type="text"
                      value={productData.category}
                      onChange={(e) => setProductData({ ...productData, category: e.target.value })}
                      placeholder="Ex: Électronique"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du produit *
                  </label>
                  <input
                    type="text"
                    value={productData.name}
                    onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                    placeholder="Ex: Ordinateur Portable Dell XPS 15"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={productData.description}
                    onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                    placeholder="Décrivez votre produit..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix unitaire (€)
                    </label>
                    <input
                      type="number"
                      value={productData.unitPrice}
                      onChange={(e) => setProductData({ ...productData, unitPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Point de réapprovisionnement
                    </label>
                    <input
                      type="number"
                      value={productData.reorderPoint}
                      onChange={(e) => setProductData({ ...productData, reorderPoint: e.target.value })}
                      placeholder="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Terminé */}
          {currentStep === 4 && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Félicitations ! 🎉
              </h2>
              <p className="text-gray-600 mb-6">
                Votre espace de travail est prêt. Vous pouvez maintenant accéder à toutes les fonctionnalités de 1wms.io.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-sm font-medium text-blue-900 mb-3">
                  Ce que vous pouvez faire maintenant :
                </p>
                <ul className="text-sm text-blue-800 space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Ajouter d'autres produits (manuellement ou par import CSV)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Gérer votre inventaire en temps réel</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Créer des commandes clients et fournisseurs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    <span>Suivre les mouvements de stock</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isLoading}
            >
              Précédent
            </Button>
            {currentStep < STEPS.length ? (
              <Button
                onClick={handleNext}
                disabled={
                  (currentStep === 2 && !warehouseName) ||
                  (currentStep === 3 && (!productData.sku || !productData.name)) ||
                  isLoading
                }
              >
                Suivant
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? 'Enregistrement...' : 'Accéder au Dashboard'}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
