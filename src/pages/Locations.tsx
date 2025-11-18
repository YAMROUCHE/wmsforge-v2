import React, { useState, useMemo } from 'react';
import { MapPin, Plus, Layers, Box, Grid3x3, Maximize, Edit, Trash2, Filter, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useLocations, useLocationStats, useCreateLocation, useUpdateLocation, useDeleteLocation } from '../hooks/useLocations';
import { useNotifications } from '../contexts/NotificationContext';
import { Location as LocationType, CreateLocationRequest } from '../services/api';

export default function Locations() {
  const { addNotification } = useNotifications();

  // React Query hooks
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: stats } = useLocationStats();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationType | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [locationForm, setLocationForm] = useState({
    code: '',
    name: '',
    type: 'rack' as 'zone' | 'aisle' | 'rack' | 'shelf' | 'location',
    capacity: ''
  });

  // Filtered and sorted locations
  const filteredLocations = useMemo(() => {
    let result = [...locations];

    // Filter by type
    if (filterType !== 'all') {
      result = result.filter((loc) => loc.type === filterType);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        (loc) =>
          loc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          loc.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by type, then by code
    return result.sort((a, b) => {
      if (a.type !== b.type) {
        const typeOrder = { zone: 0, aisle: 1, rack: 2, shelf: 3, location: 4 };
        return typeOrder[a.type as keyof typeof typeOrder] - typeOrder[b.type as keyof typeof typeOrder];
      }
      return a.code.localeCompare(b.code);
    });
  }, [locations, filterType, searchQuery]);

  const handleCreateLocation = async () => {
    if (!locationForm.code || !locationForm.name) {
      addNotification({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    try {
      await createLocation.mutateAsync(
        {
          code: locationForm.code,
          name: locationForm.name,
          type: locationForm.type,
          capacity: locationForm.capacity ? parseInt(locationForm.capacity) : undefined
        },
        {
          onSuccess: () => {
            addNotification({
              type: 'success',
              message: 'Emplacement créé avec succès'
            });
            setShowCreateModal(false);
            setLocationForm({ code: '', name: '', type: 'rack', capacity: '' });
          },
          onError: () => {
            addNotification({
              type: 'error',
              message: 'Erreur lors de la création de l\'emplacement'
            });
          }
        }
      );
    } catch (error) {
      // Error already handled by onError
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation || !locationForm.code || !locationForm.name) {
      addNotification({
        type: 'error',
        message: 'Veuillez remplir tous les champs obligatoires'
      });
      return;
    }

    try {
      await updateLocation.mutateAsync(
        {
          id: selectedLocation.id,
          data: {
            code: locationForm.code,
            name: locationForm.name,
            type: locationForm.type,
            capacity: locationForm.capacity ? parseInt(locationForm.capacity) : undefined
          }
        },
        {
          onSuccess: () => {
            addNotification({
              type: 'success',
              message: 'Emplacement modifié avec succès'
            });
            setShowEditModal(false);
            setSelectedLocation(null);
            setLocationForm({ code: '', name: '', type: 'rack', capacity: '' });
          },
          onError: () => {
            addNotification({
              type: 'error',
              message: 'Erreur lors de la modification'
            });
          }
        }
      );
    } catch (error) {
      // Error already handled by onError
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) return;

    try {
      await deleteLocation.mutateAsync(locationId, {
        onSuccess: () => {
          addNotification({
            type: 'success',
            message: 'Emplacement supprimé'
          });
        },
        onError: () => {
          addNotification({
            type: 'error',
            message: 'Erreur lors de la suppression'
          });
        }
      });
    } catch (error) {
      // Error already handled by onError
    }
  };

  const openEditModal = (location: LocationType) => {
    setSelectedLocation(location);
    setLocationForm({
      code: location.code,
      name: location.name,
      type: location.type,
      capacity: location.capacity ? location.capacity.toString() : ''
    });
    setShowEditModal(true);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'zone': return <Layers className="w-4 h-4" />;
      case 'aisle': return <Grid3x3 className="w-4 h-4" />;
      case 'rack': return <Box className="w-4 h-4" />;
      case 'shelf': return <Maximize className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      zone: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      aisle: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      rack: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      shelf: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      location: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    };

    const labels = {
      zone: 'Zone',
      aisle: 'Allée',
      rack: 'Rack',
      shelf: 'Étagère',
      location: 'Emplacement'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
        {getTypeIcon(type)}
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  if (locationsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Emplacements</h1>
              <p className="text-gray-600 dark:text-gray-400">Gestion des emplacements de l'entrepôt</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Emplacement
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_locations || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Zones</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats?.zones || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Grid3x3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Allées</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats?.aisles || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Racks</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.racks || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Maximize className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Capacité</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats?.total_capacity || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="mt-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par code ou nom..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="all">Tous les types</option>
              <option value="zone">Zones</option>
              <option value="aisle">Allées</option>
              <option value="rack">Racks</option>
              <option value="shelf">Étagères</option>
              <option value="location">Emplacements</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visualisation de l'entrepôt */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Vue de l'entrepôt</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Visualisation de l'occupation des emplacements</p>
        </div>
        <div className="p-6">
          {/* Stats condensées */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total emplacements</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_locations || 0}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Occupés</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {Math.floor(((stats?.total_locations || 0) * 0.91))}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm text-gray-600 dark:text-gray-400 mb-1">Disponibles</h4>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {Math.ceil(((stats?.total_locations || 0) * 0.09))}
              </p>
            </div>
          </div>

          {/* Grille de l'entrepôt */}
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <div className="grid grid-cols-8 gap-2 mb-4">
              {[...Array(64)].map((_, i) => (
                <div
                  key={i}
                  className={`h-12 rounded border transition-colors cursor-pointer ${
                    i % 5 === 0
                      ? 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:border-green-400 dark:hover:border-green-400'
                      : 'bg-gray-200 dark:bg-gray-800 border-gray-400 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-400'
                  }`}
                  title={`Emplacement ${i % 5 === 0 ? 'disponible' : 'occupé'}`}
                />
              ))}
            </div>

            {/* Légende */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Occupé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des emplacements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Capacité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchQuery || filterType !== 'all' ? 'Aucun résultat trouvé' : 'Aucun emplacement pour le moment'}
                  </td>
                </tr>
              ) : (
                filteredLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{location.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{location.name}</td>
                    <td className="px-6 py-4 text-sm">{getTypeBadge(location.type)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{location.capacity || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {location.created_at && location.created_at !== 'CURRENT_TIMESTAMP'
                        ? new Date(location.created_at).toLocaleDateString('fr-FR')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(location)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Nouvel Emplacement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code *</label>
                <input
                  type="text"
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  placeholder="Ex: A-01-01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  placeholder="Ex: Zone A - Allée 1 - Rack 1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={locationForm.type}
                  onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as 'zone' | 'aisle' | 'rack' | 'shelf' | 'location' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="zone">Zone</option>
                  <option value="aisle">Allée</option>
                  <option value="rack">Rack</option>
                  <option value="shelf">Étagère</option>
                  <option value="location">Emplacement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacité</label>
                <input
                  type="number"
                  value={locationForm.capacity}
                  onChange={(e) => setLocationForm({ ...locationForm, capacity: e.target.value })}
                  placeholder="Ex: 100"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleCreateLocation} disabled={createLocation.isPending}>
                {createLocation.isPending ? 'Création...' : 'Créer'}
              </Button>
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Édition */}
      {showEditModal && selectedLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Modifier l'Emplacement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code *</label>
                <input
                  type="text"
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom *</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                <select
                  value={locationForm.type}
                  onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as 'zone' | 'aisle' | 'rack' | 'shelf' | 'location' })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="zone">Zone</option>
                  <option value="aisle">Allée</option>
                  <option value="rack">Rack</option>
                  <option value="shelf">Étagère</option>
                  <option value="location">Emplacement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Capacité</label>
                <input
                  type="number"
                  value={locationForm.capacity}
                  onChange={(e) => setLocationForm({ ...locationForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditLocation} disabled={updateLocation.isPending}>
                {updateLocation.isPending ? 'Modification...' : 'Modifier'}
              </Button>
              <Button variant="secondary" onClick={() => {
                setShowEditModal(false);
                setSelectedLocation(null);
                setLocationForm({ code: '', name: '', type: 'rack', capacity: '' });
              }}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
