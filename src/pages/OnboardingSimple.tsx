import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Warehouse, Package, Check, Rocket, ArrowRight, Building, Building2, Factory, Lightbulb } from 'lucide-react';

const WAREHOUSE_TYPES = [
  {
    id: 'small',
    name: 'Petit entrepôt',
    description: '~500m² • 3 zones • ~100 emplacements',
    Icon: Building,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'medium',
    name: 'Entrepôt moyen',
    description: '~2000m² • 5 zones • ~500 emplacements',
    Icon: Building2,
    color: 'from-purple-500 to-purple-600',
    recommended: true,
  },
  {
    id: 'large',
    name: 'Grand entrepôt',
    description: '~5000m² • 8 zones • ~2000 emplacements',
    Icon: Factory,
    color: 'from-orange-500 to-orange-600',
  },
];

export default function OnboardingSimple() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedTemplate, setSelectedTemplate] = useState('medium');
  const [product, setProduct] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    quantity: '100',
  });

  const handleComplete = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8787/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template: selectedTemplate,
          product: product.name ? product : null,
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de l\'onboarding');

      // Marquer comme complété en local
      localStorage.setItem('onboardingCompleted', 'true');

      // Rediriger vers le dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="text-center space-y-8">
      <div>
        <Warehouse className="w-20 h-20 mx-auto mb-4 text-blue-600" />
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Bienvenue sur WMSForge
        </h1>
        <p className="text-xl text-gray-600">
          Configurons votre entrepôt en 2 minutes
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Quel type d'entrepôt gérez-vous?
        </h2>
        <div className="grid gap-4 max-w-2xl mx-auto">
          {WAREHOUSE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedTemplate(type.id)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                selectedTemplate === type.id
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {type.recommended && (
                <span className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold rounded-full">
                  Recommandé
                </span>
              )}
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-16 h-16 flex items-center justify-center rounded-lg bg-gradient-to-br ${type.color}`}>
                  <type.Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {type.name}
                  </h3>
                  <p className="text-gray-600">
                    {type.description}
                  </p>
                </div>
                {selectedTemplate === type.id && (
                  <Check className="flex-shrink-0 w-6 h-6 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setStep(2)}
        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 mx-auto"
      >
        Continuer
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Package className="w-20 h-20 mx-auto mb-4 text-purple-600" />
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Ajouter un premier produit (optionnel)
        </h2>
        <p className="text-gray-600">
          Vous pourrez en ajouter d'autres plus tard
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom du produit
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Laptop Dell XPS 15"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              SKU / Référence
            </label>
            <input
              type="text"
              value={product.sku}
              onChange={(e) => setProduct({ ...product, sku: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="LAPTOP-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Catégorie
            </label>
            <input
              type="text"
              value={product.category}
              onChange={(e) => setProduct({ ...product, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Électronique"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prix unitaire (€)
            </label>
            <input
              type="number"
              value={product.price}
              onChange={(e) => setProduct({ ...product, price: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quantité initiale
            </label>
            <input
              type="number"
              value={product.quantity}
              onChange={(e) => setProduct({ ...product, quantity: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setStep(1)}
          className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 transition-all"
        >
          Retour
        </button>
        <button
          onClick={() => setStep(3)}
          className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all"
        >
          Passer cette étape
        </button>
        <button
          onClick={() => setStep(3)}
          disabled={!product.name}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Continuer
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const selectedType = WAREHOUSE_TYPES.find(t => t.id === selectedTemplate);

    return (
      <div className="text-center space-y-8">
        <div>
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <Check className="w-16 h-16 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            C'est prêt
          </h2>
          <p className="text-xl text-gray-600">
            Votre entrepôt est configuré et prêt à l'emploi
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-left">
            <h3 className="font-semibold text-blue-900 mb-3">Ce qui a été créé:</h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>{selectedType?.name}</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>{WAREHOUSE_TEMPLATES[selectedTemplate as keyof typeof WAREHOUSE_TEMPLATES]?.zones} zones de stockage</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span>~{WAREHOUSE_TEMPLATES[selectedTemplate as keyof typeof WAREHOUSE_TEMPLATES]?.locations} emplacements</span>
              </li>
              {product.name && (
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>1 produit: {product.name}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-start gap-2">
            <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div><strong>Conseil:</strong> Explorez le dashboard pour découvrir toutes les fonctionnalités</div>
          </div>
        </div>

        <button
          onClick={handleComplete}
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-lg hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl disabled:opacity-50 transition-all flex items-center gap-2 mx-auto text-lg"
        >
          {loading ? (
            'Configuration en cours...'
          ) : (
            <>
              <Rocket className="w-6 h-6" />
              Accéder au dashboard
            </>
          )}
        </button>

        <button
          onClick={() => setStep(2)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          ← Retour
        </button>
      </div>
    );
  };

  // Import des templates pour affichage
  const WAREHOUSE_TEMPLATES = {
    small: { zones: 3, locations: 100 },
    medium: { zones: 5, locations: 500 },
    large: { zones: 8, locations: 2000 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  num <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-center text-sm text-gray-600">
            Étape {step} sur 3
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Skip button */}
        {step < 3 && (
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              Configurer plus tard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
