import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Layers, Box, Grid3x3, Maximize, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

interface Location {
  id: number;
  organization_id: number;
  code: string;
  name: string;
  type: 'zone' | 'aisle' | 'rack' | 'shelf';
  parent_id?: number;
  capacity?: number;
  created_at: string;
}

interface Stats {
  total_locations: number;
  zones: number;
  aisles: number;
  racks: number;
  shelves: number;
  total_capacity: number;
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_locations: 0,
    zones: 0,
    aisles: 0,
    racks: 0,
    shelves: 0,
    total_capacity: 0
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Formulaire de création/édition
  const [locationForm, setLocationForm] = useState({
    code: '',
    name: '',
    type: 'rack' as 'zone' | 'aisle' | 'rack' | 'shelf',
    capacity: ''
  });

  useEffect(() => {
    fetchLocations();
    fetchStats();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8787/api/locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data.locations || []);
      }
    } catch (error) {
      console.error('Erreur chargement emplacements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8787/api/locations/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const handleCreateLocation = async () => {
    if (!locationForm.code || !locationForm.name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetch('http://localhost:8787/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: locationForm.code,
          name: locationForm.name,
          type: locationForm.type,
          capacity: locationForm.capacity ? parseInt(locationForm.capacity) : null
        })
      });

      if (response.ok) {
        alert('Emplacement créé avec succès !');
        setShowCreateModal(false);
        setLocationForm({ code: '', name: '', type: 'rack', capacity: '' });
        fetchLocations();
        fetchStats();
      } else {
        alert('Erreur lors de la création de l\'emplacement');
      }
    } catch (error) {
      console.error('Erreur création emplacement:', error);
      alert('Erreur lors de la création de l\'emplacement');
    }
  };

  const handleEditLocation = async () => {
    if (!selectedLocation || !locationForm.code || !locationForm.name) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8787/api/locations/${selectedLocation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: locationForm.code,
          name: locationForm.name,
          type: locationForm.type,
          capacity: locationForm.capacity ? parseInt(locationForm.capacity) : null
        })
      });

      if (response.ok) {
        alert('Emplacement modifié avec succès !');
        setShowEditModal(false);
        setSelectedLocation(null);
        setLocationForm({ code: '', name: '', type: 'rack', capacity: '' });
        fetchLocations();
        fetchStats();
      } else {
        alert('Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur modification emplacement:', error);
      alert('Erreur lors de la modification');
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emplacement ?')) return;

    try {
      const response = await fetch(`http://localhost:8787/api/locations/${locationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Emplacement supprimé !');
        fetchLocations();
        fetchStats();
      } else {
        alert('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur suppression emplacement:', error);
    }
  };

  const openEditModal = (location: Location) => {
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
      zone: 'bg-purple-100 text-purple-800',
      aisle: 'bg-blue-100 text-blue-800',
      rack: 'bg-green-100 text-green-800',
      shelf: 'bg-orange-100 text-orange-800'
    };

    const labels = {
      zone: 'Zone',
      aisle: 'Allée',
      rack: 'Rack',
      shelf: 'Étagère'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${styles[type as keyof typeof styles]}`}>
        {getTypeIcon(type)}
        {labels[type as keyof typeof labels]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Emplacements</h1>
              <p className="text-gray-600">Gestion des emplacements de l'entrepôt</p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nouvel Emplacement
          </Button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total_locations || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Zones</p>
                <p className="text-2xl font-bold text-purple-600">{stats.zones || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Grid3x3 className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Allées</p>
                <p className="text-2xl font-bold text-blue-600">{stats.aisles || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Box className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Racks</p>
                <p className="text-2xl font-bold text-green-600">{stats.racks || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3">
              <Maximize className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Capacité</p>
                <p className="text-2xl font-bold text-orange-600">{stats.total_capacity || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des emplacements */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Aucun emplacement pour le moment
                  </td>
                </tr>
              ) : (
                locations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{location.code}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{location.name}</td>
                    <td className="px-6 py-4 text-sm">{getTypeBadge(location.type)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{location.capacity || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {location.created_at ? new Date(location.created_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(location)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="text-red-600 hover:text-red-800 p-1"
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Nouvel Emplacement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                <input
                  type="text"
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  placeholder="Ex: A-01-01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  placeholder="Ex: Zone A - Allée 1 - Rack 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={locationForm.type}
                  onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as 'zone' | 'aisle' | 'rack' | 'shelf' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="zone">Zone</option>
                  <option value="aisle">Allée</option>
                  <option value="rack">Rack</option>
                  <option value="shelf">Étagère</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
                <input
                  type="number"
                  value={locationForm.capacity}
                  onChange={(e) => setLocationForm({ ...locationForm, capacity: e.target.value })}
                  placeholder="Ex: 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleCreateLocation}>
                Créer
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Modifier l'Emplacement</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
                <input
                  type="text"
                  value={locationForm.code}
                  onChange={(e) => setLocationForm({ ...locationForm, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                <input
                  type="text"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={locationForm.type}
                  onChange={(e) => setLocationForm({ ...locationForm, type: e.target.value as 'zone' | 'aisle' | 'rack' | 'shelf' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="zone">Zone</option>
                  <option value="aisle">Allée</option>
                  <option value="rack">Rack</option>
                  <option value="shelf">Étagère</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
                <input
                  type="number"
                  value={locationForm.capacity}
                  onChange={(e) => setLocationForm({ ...locationForm, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button onClick={handleEditLocation}>
                Modifier
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
