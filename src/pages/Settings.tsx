import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Building, Bell, Palette, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';

type Tab = 'profile' | 'organization' | 'notifications' | 'appearance';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // États pour les formulaires
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    role: 'user'
  });

  const [orgForm, setOrgForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const [notifForm, setNotifForm] = useState({
    emailNotifications: true,
    orderNotifications: true,
    inventoryAlerts: true,
    lowStockAlerts: true
  });

  const [appearanceForm, setAppearanceForm] = useState({
    theme: 'light',
    language: 'fr',
    dateFormat: 'dd/mm/yyyy'
  });

  // Charger les settings au montage
  React.useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8787/api/settings');
      const data = await response.json();

      setProfileForm(data.profile);
      setOrgForm(data.organization);
      setNotifForm(data.notifications);
      setAppearanceForm(data.appearance);
    } catch (error) {
      console.error('Erreur chargement settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:8787/api/settings/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        alert('Profil sauvegardé avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrganization = async () => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:8787/api/settings/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgForm)
      });

      if (response.ok) {
        alert('Organisation sauvegardée avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde de l\'organisation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde de l\'organisation');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:8787/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifForm)
      });

      if (response.ok) {
        alert('Préférences de notifications sauvegardées avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde des notifications');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde des notifications');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = async () => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:8787/api/settings/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appearanceForm)
      });

      if (response.ok) {
        alert('Préférences d\'apparence sauvegardées avec succès !');
      } else {
        alert('Erreur lors de la sauvegarde des préférences d\'apparence');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde des préférences d\'apparence');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profil', icon: User },
    { id: 'organization' as Tab, label: 'Organisation', icon: Building },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Apparence', icon: Palette }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 rounded-lg">
            <SettingsIcon className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
            <p className="text-gray-600">Gérez vos préférences et paramètres</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar avec onglets */}
        <div className="w-64 bg-white rounded-lg border border-gray-200 p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 bg-white rounded-lg border border-gray-200 p-6">
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Profil utilisateur</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                  <select
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Admin">Administrateur</option>
                    <option value="Manager">Manager</option>
                    <option value="Operator">Opérateur</option>
                  </select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Organisation */}
          {activeTab === 'organization' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Paramètres de l'organisation</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'organisation</label>
                  <input
                    type="text"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={orgForm.address}
                    onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={orgForm.phone}
                    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email de contact</label>
                  <input
                    type="email"
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveOrganization} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Préférences de notifications</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Notifications par email</p>
                    <p className="text-sm text-gray-600">Recevoir des emails pour les événements importants</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.emailNotifications}
                      onChange={(e) => setNotifForm({ ...notifForm, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Nouvelles commandes</p>
                    <p className="text-sm text-gray-600">Être notifié des nouvelles commandes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.orderNotifications}
                      onChange={(e) => setNotifForm({ ...notifForm, orderNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Alertes d'inventaire</p>
                    <p className="text-sm text-gray-600">Être notifié des changements d'inventaire</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.inventoryAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, inventoryAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <p className="font-medium text-gray-900">Stock faible</p>
                    <p className="text-sm text-gray-600">Alertes quand le stock est bas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.lowStockAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, lowStockAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveNotifications} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Préférences d'apparence</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
                  <select
                    value={appearanceForm.theme}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
                  <select
                    value={appearanceForm.language}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Format de date</label>
                  <select
                    value={appearanceForm.dateFormat}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                    <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                    <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
                  </select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveAppearance} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
