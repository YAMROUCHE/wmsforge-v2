import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, TrendingUp, Package, ArrowLeft, Settings } from 'lucide-react';

interface ZoneData {
  id: string;
  name: string;
  category: 'receiving' | 'storage' | 'picking' | 'shipping' | 'cold';
  area: number;
  aisleCount: number;
}

interface WarehouseConfig {
  warehouse: {
    name: string;
    address: string;
    totalArea: number;
    ceilingHeight: number;
  };
  zones: ZoneData[];
  aisleConfig: {
    width: number;
    rackCount: number;
    levelsPerRack: number;
    locationsPerLevel: number;
  };
}

const ZONE_STYLES = {
  receiving: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-900', icon: '📦' },
  storage: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-900', icon: '🏢' },
  picking: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-900', icon: '🎯' },
  shipping: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-900', icon: '🚚' },
  cold: { bg: 'bg-cyan-100', border: 'border-cyan-400', text: 'text-cyan-900', icon: '❄️' },
};

const ZONE_LABELS = {
  receiving: 'Réception',
  storage: 'Stockage',
  picking: 'Picking',
  shipping: 'Expédition',
  cold: 'Zone froide',
};

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<WarehouseConfig | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('warehouseConfig');
    if (stored) {
      setConfig(JSON.parse(stored));
    } else {
      navigate('/onboarding');
    }
  }, [navigate]);

  if (!config) return null;

  const totalCapacity = config.zones.reduce((sum, z) => sum + z.aisleCount, 0) * 
    config.aisleConfig.rackCount * 2 * config.aisleConfig.levelsPerRack * config.aisleConfig.locationsPerLevel;

  const selectedZoneData = selectedZone ? config.zones.find(z => z.id === selectedZone) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Building2 className="w-6 h-6 mr-2 text-blue-600" />
                  {config.warehouse.name}
                </h1>
                {config.warehouse.address && (
                  <p className="text-sm text-gray-600 mt-1">{config.warehouse.address}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Modifier</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Surface totale</p>
                <p className="text-3xl font-bold text-gray-900">{config.warehouse.totalArea.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">m²</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Zones</p>
                <p className="text-3xl font-bold text-gray-900">{config.zones.length}</p>
                <p className="text-sm text-gray-500 mt-1">configurées</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Capacité totale</p>
                <p className="text-3xl font-bold text-gray-900">{totalCapacity.toLocaleString()}</p>
                <p className="text-sm text-gray-500 mt-1">emplacements</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taux d'occupation</p>
                <p className="text-3xl font-bold text-green-600">0%</p>
                <p className="text-sm text-gray-500 mt-1">vide pour l'instant</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Vue d'ensemble */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vue d'ensemble de l'entrepôt</h2>
          
          <div className="grid grid-cols-3 gap-6">
            {config.zones.map((zone) => {
              const style = ZONE_STYLES[zone.category];
              const locationsPerAisle = config.aisleConfig.rackCount * 2 * config.aisleConfig.levelsPerRack * config.aisleConfig.locationsPerLevel;
              const totalLocations = zone.aisleCount * locationsPerAisle;

              return (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    selectedZone === zone.id 
                      ? `${style.border} ${style.bg} scale-105 shadow-lg` 
                      : `border-gray-200 hover:border-gray-300 hover:shadow-md`
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-3xl mb-2">{style.icon}</div>
                      <h3 className={`text-lg font-bold ${selectedZone === zone.id ? style.text : 'text-gray-900'}`}>
                        {zone.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{ZONE_LABELS[zone.category]}</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Surface</span>
                      <span className="font-semibold text-gray-900">{zone.area} m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Allées</span>
                      <span className="font-semibold text-gray-900">{zone.aisleCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacité</span>
                      <span className="font-semibold text-gray-900">{totalLocations.toLocaleString()} empl.</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer pour les détails de la zone */}
        {selectedZoneData && (
          <>
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
              onClick={() => setSelectedZone(null)}
            />
            
            {/* Drawer Panel */}
            <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedZoneData.name}</h2>
                  <p className="text-sm text-gray-600">{ZONE_LABELS[selectedZoneData.category]}</p>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Détails : {selectedZoneData.name}
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Nombre d'allées</span>
                    <span className="font-semibold">{selectedZoneData.aisleCount}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Largeur de passage</span>
                    <span className="font-semibold">{config.aisleConfig.width} m</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Racks par allée</span>
                    <span className="font-semibold">{config.aisleConfig.rackCount} × 2</span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Niveaux par rack</span>
                    <span className="font-semibold">{config.aisleConfig.levelsPerRack}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Représentation visuelle</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="space-y-2">
                    {Array.from({ length: Math.min(selectedZoneData.aisleCount, 5) }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <div className="flex-1 bg-green-200 rounded px-3 py-2 text-center text-sm font-medium">
                          Allée {String.fromCharCode(65 + i)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {config.aisleConfig.rackCount * 2 * config.aisleConfig.levelsPerRack * config.aisleConfig.locationsPerLevel} empl.
                        </div>
                      </div>
                    ))}
                    {selectedZoneData.aisleCount > 5 && (
                      <div className="text-center text-sm text-gray-500 py-2">
                        ... et {selectedZoneData.aisleCount - 5} autres allées
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
