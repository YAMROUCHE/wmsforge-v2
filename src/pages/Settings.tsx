import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Building, Bell, Palette, Save } from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  useSettings,
  useUpdateProfile,
  useUpdateOrganization,
  useUpdateNotifications,
  useUpdateAppearance
} from '../hooks/useSettings';
import { useNotifications } from '../contexts/NotificationContext';

type Tab = 'profile' | 'organization' | 'notifications' | 'appearance';

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { addNotification } = useNotifications();

  // React Query hooks
  const { data: settings, isLoading } = useSettings();
  const updateProfile = useUpdateProfile();
  const updateOrganization = useUpdateOrganization();
  const updateNotifications = useUpdateNotifications();
  const updateAppearance = useUpdateAppearance();

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

  // Synchroniser les formulaires avec les données React Query
  useEffect(() => {
    if (settings) {
      setProfileForm(settings.profile);
      setOrgForm(settings.organization);
      setNotifForm(settings.notifications);
      setAppearanceForm(settings.appearance);
    }
  }, [settings]);

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync(profileForm);
      addNotification({ type: 'success', title: '', message: 'Profil sauvegardé avec succès !' });
    } catch (error) {
      addNotification({ type: 'error', title: '', message: 'Erreur lors de la sauvegarde du profil' });
    }
  };

  const handleSaveOrganization = async () => {
    try {
      await updateOrganization.mutateAsync(orgForm);
      addNotification({ type: 'success', title: 'Succès', message: 'Organisation sauvegardée avec succès !' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Erreur', message: 'Erreur lors de la sauvegarde de l\'organisation' });
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await updateNotifications.mutateAsync(notifForm);
      addNotification({ type: 'success', title: 'Succès', message: 'Préférences de notifications sauvegardées avec succès !' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Erreur', message: 'Erreur lors de la sauvegarde des notifications' });
    }
  };

  const handleSaveAppearance = async () => {
    try {
      await updateAppearance.mutateAsync(appearanceForm);
      addNotification({ type: 'success', title: 'Succès', message: 'Préférences d\'apparence sauvegardées avec succès !' });
    } catch (error) {
      addNotification({ type: 'error', title: 'Erreur', message: 'Erreur lors de la sauvegarde des préférences d\'apparence' });
    }
  };

  const tabs = [
    { id: 'profile' as Tab, label: 'Profil', icon: User },
    { id: 'organization' as Tab, label: 'Organisation', icon: Building },
    { id: 'notifications' as Tab, label: 'Notifications', icon: Bell },
    { id: 'appearance' as Tab, label: 'Apparence', icon: Palette }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <SettingsIcon className="w-8 h-8 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Paramètres</h1>
            <p className="text-gray-600 dark:text-gray-400">Gérez vos préférences et paramètres</p>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar avec onglets */}
        <div className="w-64 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 h-fit">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          {/* Onglet Profil */}
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Profil utilisateur</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rôle</label>
                  <select
                    value={profileForm.role}
                    onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="Admin">Administrateur</option>
                    <option value="Manager">Manager</option>
                    <option value="Operator">Opérateur</option>
                  </select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfile.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Organisation */}
          {activeTab === 'organization' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Paramètres de l'organisation</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'organisation</label>
                  <input
                    type="text"
                    value={orgForm.name}
                    onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={orgForm.address}
                    onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={orgForm.phone}
                    onChange={(e) => setOrgForm({ ...orgForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email de contact</label>
                  <input
                    type="email"
                    value={orgForm.email}
                    onChange={(e) => setOrgForm({ ...orgForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveOrganization} disabled={updateOrganization.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateOrganization.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Notifications */}
          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Préférences de notifications</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Notifications par email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir des emails pour les événements importants</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.emailNotifications}
                      onChange={(e) => setNotifForm({ ...notifForm, emailNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Nouvelles commandes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Être notifié des nouvelles commandes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.orderNotifications}
                      onChange={(e) => setNotifForm({ ...notifForm, orderNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Alertes d'inventaire</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Être notifié des changements d'inventaire</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.inventoryAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, inventoryAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Stock faible</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alertes quand le stock est bas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifForm.lowStockAlerts}
                      onChange={(e) => setNotifForm({ ...notifForm, lowStockAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveNotifications} disabled={updateNotifications.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateNotifications.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Apparence */}
          {activeTab === 'appearance' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Préférences d'apparence</h2>
              <div className="space-y-4 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thème</label>
                  <select
                    value={appearanceForm.theme}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, theme: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="auto">Automatique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Langue</label>
                  <select
                    value={appearanceForm.language}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, language: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Format de date</label>
                  <select
                    value={appearanceForm.dateFormat}
                    onChange={(e) => setAppearanceForm({ ...appearanceForm, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value="dd/mm/yyyy">JJ/MM/AAAA</option>
                    <option value="mm/dd/yyyy">MM/JJ/AAAA</option>
                    <option value="yyyy-mm-dd">AAAA-MM-JJ</option>
                  </select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveAppearance} disabled={updateAppearance.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateAppearance.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
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
