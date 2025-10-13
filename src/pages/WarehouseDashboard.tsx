import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, Home, MapPin, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ZoneData {
  id: string;
  name: string;
  category: 'reception' | 'storage' | 'picking' | 'shipping' | 'cold';
  surface: number;
  height: number;
  aisleCount?: number;
  aisleWidth?: number;
  racksPerAisle?: number;
  levelsPerRack?: number;
  slotsPerLevel?: number;
  maxWeightPerSlot?: number;
  totalCapacity?: number;
}

const ZONE_COLORS = {
  reception: 'bg-blue-100 hover:bg-blue-200 border-blue-300',
  storage: 'bg-green-100 hover:bg-green-200 border-green-300',
  picking: 'bg-yellow-100 hover:bg-yellow-200 border-yellow-300',
  shipping: 'bg-orange-100 hover:bg-orange-200 border-orange-300',
  cold: 'bg-cyan-100 hover:bg-cyan-200 border-cyan-300',
};

const ZONE_ICONS = {
  reception: '📦',
  storage: '🏢',
  picking: '🎯',
  shipping: '🚚',
  cold: '❄️',
};

const ZONE_LABELS = {
  reception: 'Zone de réception',
  storage: 'Zone de stockage',
  picking: 'Zone de picking',
  shipping: 'Zone d\'expédition',
  cold: 'Zone froide',
};

export default function WarehouseDashboard() {
  const navigate = useNavigate();
  const [warehouseData, setWarehouseData] = useState<any>(null);
  const [zonesData, setZonesData] = useState<ZoneData[]>([]);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  useEffect(() => {
    const savedWarehouse = localStorage.getItem('warehouseConfig');
    const savedZones = localStorage.getItem('zonesConfig');
    
    if (savedWarehouse) {
      setWarehouseData(JSON.parse(savedWarehouse));
    }
    
    if (savedZones) {
      const zones = JSON.parse(savedZones);
      const processedZones = zones.map((zone: any) => {
        let totalCapacity = 0;
        
        if (zone.category === 'storage' || zone.category === 'picking') {
          const slotsPerRack = (zone.levelsPerRack || 0) * (zone.slotsPerLevel || 0);
          const totalRacks = (zone.aisleCount || 0) * (zone.racksPerAisle || 0);
          totalCapacity = totalRacks * slotsPerRack;
        } else if (zone.category === 'cold') {
          totalCapacity = Math.floor(zone.surface * 0.6);
        } else {
          totalCapacity = Math.floor(zone.surface * 0.8);
        }
        
        return {
          ...zone,
          totalCapacity
        };
      });
      setZonesData(processedZones);
    }
  }, []);

  const getTotalCapacity = () => {
    return zonesData.reduce((total, zone) => total + (zone.totalCapacity || 0), 0);
  };

  const getZoneCount = () => {
    return zonesData.length;
  };

  const selectedZoneData = zonesData.find(zone => zone.id === selectedZone);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vue de l'entrepôt</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {warehouseData?.name || 'Mon Entrepôt'}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/onboarding')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier la configuration
            </button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Home className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {warehouseData?.surface || 0} m²
            </div>
            <div className="text-sm text-gray-600 mt-1">Surface totale</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Zones</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getZoneCount()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Zones configurées</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Capacité</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {getTotalCapacity()}
            </div>
            <div className="text-sm text-gray-600 mt-1">Emplacements totaux</div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-gray-400" />
              <span className="text-xs text-gray-500">Taux</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">0%</div>
            <div className="text-sm text-gray-600 mt-1">Occupation</div>
          </div>
        </div>

        {/* Warehouse Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan de l'entrepôt</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {zonesData.map((zone) => (
              <div
                key={zone.id}
                onClick={() => setSelectedZone(zone.id)}
                className={`
                  relative p-4 rounded-lg border-2 cursor-pointer transition-all
                  ${ZONE_COLORS[zone.category]}
                  ${selectedZone === zone.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                `}
              >
                <div className="text-3xl mb-2">{ZONE_ICONS[zone.category]}</div>
                <div className="font-semibold text-gray-900">{zone.name}</div>
                <div className="text-sm text-gray-600 mt-1">
                  {zone.surface} m²
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Capacité: {zone.totalCapacity || 0}
                </div>
                {selectedZone === zone.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            ))}
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
            <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
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
                {/* Informations générales */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Informations générales
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Type de zone</span>
                      <span className="font-medium text-gray-900">
                        {ZONE_LABELS[selectedZoneData.category]}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Surface</span>
                      <span className="font-medium text-gray-900">{selectedZoneData.surface} m²</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Hauteur</span>
                      <span className="font-medium text-gray-900">{selectedZoneData.height} m</span>
                    </div>
                  </div>
                </div>

                {/* Configuration de stockage */}
                {(selectedZoneData.category === 'storage' || selectedZoneData.category === 'picking') && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Configuration de stockage
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nombre d'allées</span>
                        <span className="font-medium text-gray-900">{selectedZoneData.aisleCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Largeur des allées</span>
                        <span className="font-medium text-gray-900">{selectedZoneData.aisleWidth || 0} m</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Racks par allée</span>
                        <span className="font-medium text-gray-900">{selectedZoneData.racksPerAisle || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Niveaux par rack</span>
                        <span className="font-medium text-gray-900">{selectedZoneData.levelsPerRack || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Emplacements par niveau</span>
                        <span className="font-medium text-gray-900">{selectedZoneData.slotsPerLevel || 0}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Capacité */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                    Capacité totale
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-3xl font-bold text-blue-600">
                      {selectedZoneData.totalCapacity || 0}
                    </div>
                    <div className="text-sm text-blue-700 mt-1">emplacements disponibles</div>
                  </div>
                </div>

                {/* Visualisation */}
                {selectedZoneData.aisleCount && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
                      Visualisation des allées
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from({ length: Math.min(selectedZoneData.aisleCount, 9) }).map((_, i) => (
                        <div key={i} className="bg-gray-100 rounded p-2 text-center text-xs text-gray-600">
                          Allée {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => navigate('/onboarding')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Modifier cette zone
                  </button>
                  <button
                    onClick={() => setSelectedZone(null)}
                    className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
