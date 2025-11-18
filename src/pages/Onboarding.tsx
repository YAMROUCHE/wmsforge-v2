import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Layers, Package, Check, ArrowRight, ArrowLeft, PackageOpen, Warehouse, Target, Truck, Snowflake } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface OnboardingData {
  warehouse: {
    name: string;
    address: string;
    totalArea: number;
    ceilingHeight: number;
  };
  zones: Array<{
    id: string;
    name: string;
    category: 'receiving' | 'storage' | 'picking' | 'shipping' | 'cold';
    area: number;
    aisleCount: number;
  }>;
  aisleConfig: {
    width: number;
    rackCount: number;
    levelsPerRack: number;
    locationsPerLevel: number;
  };
}

const ZONE_CATEGORIES = [
  { value: 'receiving', label: 'Réception', color: 'bg-blue-500', Icon: PackageOpen },
  { value: 'storage', label: 'Stockage', color: 'bg-green-500', Icon: Warehouse },
  { value: 'picking', label: 'Picking', color: 'bg-yellow-500', Icon: Target },
  { value: 'shipping', label: 'Expédition', color: 'bg-orange-500', Icon: Truck },
  { value: 'cold', label: 'Zone froide', color: 'bg-cyan-500', Icon: Snowflake },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    warehouse: {
      name: '',
      address: '',
      totalArea: 0,
      ceilingHeight: 0,
    },
    zones: [],
    aisleConfig: {
      width: 3,
      rackCount: 20,
      levelsPerRack: 4,
      locationsPerLevel: 2,
    },
  });

  useEffect(() => {
    const stored = localStorage.getItem('warehouseConfig');
    if (stored) {
      const config = JSON.parse(stored);
      setData(config);
    }
  }, []);

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Terminer l'onboarding et aller au dashboard
      localStorage.setItem('warehouseConfig', JSON.stringify(data));
      localStorage.setItem('onboardingCompleted', 'true');
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    navigate('/dashboard');
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addZone = () => {
    setData({
      ...data,
      zones: [
        ...data.zones,
        {
          id: `zone-${Date.now()}`,
          name: `Zone ${data.zones.length + 1}`,
          category: 'storage',
          area: 0,
          aisleCount: 0,
        },
      ],
    });
  };

  const removeZone = (id: string) => {
    setData({
      ...data,
      zones: data.zones.filter(z => z.id !== id),
    });
  };

  const updateZone = (id: string, field: string, value: any) => {
    setData({
      ...data,
      zones: data.zones.map(z => 
        z.id === id ? { ...z, [field]: value } : z
      ),
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.warehouse.name && data.warehouse.totalArea > 0;
      case 2:
        return data.zones.length > 0 && data.zones.every(z => z.area > 0 && z.aisleCount > 0);
      case 3:
        return data.aisleConfig.width > 0 && data.aisleConfig.rackCount > 0;
      case 4:
        return data.aisleConfig.levelsPerRack > 0 && data.aisleConfig.locationsPerLevel > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Building2 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Informations générales</h2>
              <p className="text-gray-600 mt-2">Commençons par les informations de base de votre entrepôt</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'entrepôt *
              </label>
              <input
                type="text"
                value={data.warehouse.name}
                onChange={(e) => setData({ ...data, warehouse: { ...data.warehouse, name: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Entrepôt Principal Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={data.warehouse.address}
                onChange={(e) => setData({ ...data, warehouse: { ...data.warehouse, address: e.target.value } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 123 Rue de l'Industrie, 75001 Paris"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Surface totale (m²) *
                </label>
                <input
                  type="number"
                  value={data.warehouse.totalArea || ''}
                  onChange={(e) => setData({ ...data, warehouse: { ...data.warehouse, totalArea: Number(e.target.value) } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Hauteur sous plafond (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.warehouse.ceilingHeight || ''}
                  onChange={(e) => setData({ ...data, warehouse: { ...data.warehouse, ceilingHeight: Number(e.target.value) } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MapPin className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Zones de l'entrepôt</h2>
              <p className="text-gray-600 mt-2">Définissez les différentes zones de votre entrepôt</p>
            </div>

            <div className="space-y-4">
              {data.zones.map((zone) => (
                <div key={zone.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la zone</label>
                      <input
                        type="text"
                        value={zone.name}
                        onChange={(e) => updateZone(zone.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Zone Réception"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                      <select
                        value={zone.category}
                        onChange={(e) => updateZone(zone.id, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {ZONE_CATEGORIES.map(cat => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Surface (m²)</label>
                      <input
                        type="number"
                        value={zone.area || ''}
                        onChange={(e) => updateZone(zone.id, 'area', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nombre d'allées</label>
                      <input
                        type="number"
                        value={zone.aisleCount || ''}
                        onChange={(e) => updateZone(zone.id, 'aisleCount', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="8"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => removeZone(zone.id)}
                    className="mt-3 text-sm text-red-600 hover:text-red-800"
                  >
                    Supprimer cette zone
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={addZone}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              + Ajouter une zone
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Layers className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Configuration des allées</h2>
              <p className="text-gray-600 mt-2">Définissez la structure de vos allées</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Largeur de passage (m)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={data.aisleConfig.width}
                  onChange={(e) => setData({ ...data, aisleConfig: { ...data.aisleConfig, width: Number(e.target.value) } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="3"
                />
                <p className="text-xs text-gray-500 mt-1">Largeur typique : 2.5-3.5m</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Racks par allée
                </label>
                <input
                  type="number"
                  value={data.aisleConfig.rackCount}
                  onChange={(e) => setData({ ...data, aisleConfig: { ...data.aisleConfig, rackCount: Number(e.target.value) } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="20"
                />
                <p className="text-xs text-gray-500 mt-1">Nombre de racks de chaque côté</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Package className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Racks et emplacements</h2>
              <p className="text-gray-600 mt-2">Définissez la capacité de stockage</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveaux par rack
                </label>
                <input
                  type="number"
                  value={data.aisleConfig.levelsPerRack}
                  onChange={(e) => setData({ ...data, aisleConfig: { ...data.aisleConfig, levelsPerRack: Number(e.target.value) } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="4"
                />
                <p className="text-xs text-gray-500 mt-1">Nombre d'étages de stockage</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Emplacements par niveau
                </label>
                <input
                  type="number"
                  value={data.aisleConfig.locationsPerLevel}
                  onChange={(e) => setData({ ...data, aisleConfig: { ...data.aisleConfig, locationsPerLevel: Number(e.target.value) } })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2"
                />
                <p className="text-xs text-gray-500 mt-1">Palettes par niveau</p>
              </div>
            </div>

            {/* Calcul automatique */}
            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-4">Capacité totale estimée</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Emplacements par allée :</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.aisleConfig.rackCount * 2 * data.aisleConfig.levelsPerRack * data.aisleConfig.locationsPerLevel}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Capacité totale :</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {data.zones.reduce((sum, z) => sum + z.aisleCount, 0) * 
                     data.aisleConfig.rackCount * 2 * data.aisleConfig.levelsPerRack * data.aisleConfig.locationsPerLevel} palettes
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        const totalCapacity = data.zones.reduce((sum, z) => sum + z.aisleCount, 0) * 
          data.aisleConfig.rackCount * 2 * data.aisleConfig.levelsPerRack * data.aisleConfig.locationsPerLevel;

        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Check className="w-16 h-16 mx-auto text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Récapitulatif</h2>
              <p className="text-gray-600 mt-2">Vérifiez les informations avant de finaliser</p>
            </div>

            <div className="space-y-4">
              {/* Entrepôt */}
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  {data.warehouse.name}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Surface totale</p>
                    <p className="font-medium">{data.warehouse.totalArea} m²</p>
                  </div>
                  {data.warehouse.ceilingHeight > 0 && (
                    <div>
                      <p className="text-gray-600">Hauteur plafond</p>
                      <p className="font-medium">{data.warehouse.ceilingHeight} m</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Zones */}
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">{data.zones.length} Zone(s)</h3>
                <div className="space-y-3">
                  {data.zones.map((zone) => {
                    const cat = ZONE_CATEGORIES.find(c => c.value === zone.category);
                    const IconComponent = cat?.Icon;
                    return (
                      <div key={zone.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium flex items-center gap-2">
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {zone.name}
                        </span>
                        <span className="text-gray-600">
                          {zone.area} m² • {zone.aisleCount} allées
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Capacité */}
              <div className="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-4">Capacité totale</h3>
                <p className="text-4xl font-bold text-green-900">{totalCapacity.toLocaleString()}</p>
                <p className="text-green-700 mt-1">emplacements de palettes</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with Skip button */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Configuration de votre entrepôt
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Passer cette étape →
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Étape {step} sur {totalSteps}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {Math.round((step / totalSteps) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Précédent
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              {step === totalSteps ? (
                <>
                  Terminer
                  <Check className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
