import { useState } from 'react';
import { Plug, Plus, RefreshCw, Trash2, Check, X, Clock, ShoppingBag, Cloud, Package } from 'lucide-react';
import { useIntegrations, useSetupShopify, useSetupWooCommerce, useSetupSalesforce, useTriggerSync, useDeleteIntegration } from '../hooks/useIntegrations';
import { useNotifications } from '../contexts/NotificationContext';
import { Button } from '../components/ui/Button';

interface AvailableIntegration {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: string;
  tier: 'MVP' | 'Advanced' | 'Enterprise';
}

const AVAILABLE_INTEGRATIONS: AvailableIntegration[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    icon: ShoppingBag,
    description: 'Import automatique des commandes depuis votre boutique Shopify',
    category: 'E-commerce',
    tier: 'MVP'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: Cloud,
    description: 'Sync bidirectionnelle avec Salesforce CRM',
    category: 'CRM',
    tier: 'Enterprise'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    icon: Package,
    description: 'Connexion à votre boutique WooCommerce',
    category: 'E-commerce',
    tier: 'MVP'
  }
];

export default function Integrations() {
  const { addNotification } = useNotifications();
  const { data } = useIntegrations();
  const setupShopify = useSetupShopify();
  const setupWooCommerce = useSetupWooCommerce();
  const setupSalesforce = useSetupSalesforce();
  const triggerSync = useTriggerSync();
  const deleteIntegration = useDeleteIntegration();

  const [showShopifySetup, setShowShopifySetup] = useState(false);
  const [shopifyForm, setShopifyForm] = useState({ shop_domain: '', access_token: '' });

  const [showWooSetup, setShowWooSetup] = useState(false);
  const [wooForm, setWooForm] = useState({ store_url: '', consumer_key: '', consumer_secret: '' });

  const [showSalesforceSetup, setShowSalesforceSetup] = useState(false);
  const [salesforceForm, setSalesforceForm] = useState({
    instance_url: '',
    access_token: '',
    refresh_token: '',
    client_id: '',
    client_secret: ''
  });

  const handleSetupShopify = async () => {
    try {
      await setupShopify.mutateAsync(shopifyForm);
      addNotification({
        type: 'success',
        title: 'Shopify configuré',
        message: 'Votre boutique Shopify a été connectée avec succès !'
      });
      setShowShopifySetup(false);
      setShopifyForm({ shop_domain: '', access_token: '' });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de configurer Shopify. Vérifiez vos identifiants.'
      });
    }
  };

  const handleSetupWooCommerce = async () => {
    try {
      await setupWooCommerce.mutateAsync(wooForm);
      addNotification({
        type: 'success',
        title: 'WooCommerce configuré',
        message: 'Votre boutique WooCommerce a été connectée avec succès !'
      });
      setShowWooSetup(false);
      setWooForm({ store_url: '', consumer_key: '', consumer_secret: '' });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de configurer WooCommerce. Vérifiez vos identifiants.'
      });
    }
  };

  const handleSetupSalesforce = async () => {
    try {
      await setupSalesforce.mutateAsync(salesforceForm);
      addNotification({
        type: 'success',
        title: 'Salesforce configuré',
        message: 'Votre CRM Salesforce a été connecté avec succès !'
      });
      setShowSalesforceSetup(false);
      setSalesforceForm({
        instance_url: '',
        access_token: '',
        refresh_token: '',
        client_id: '',
        client_secret: ''
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de configurer Salesforce. Vérifiez vos identifiants.'
      });
    }
  };

  const handleSync = async (integrationId: number) => {
    try {
      await triggerSync.mutateAsync({ integrationId, entityType: 'orders' });
      addNotification({
        type: 'success',
        title: 'Synchronisation lancée',
        message: 'Les données sont en cours de synchronisation...'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Échec de la synchronisation'
      });
    }
  };

  const handleDelete = async (integrationId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette intégration ?')) return;

    try {
      await deleteIntegration.mutateAsync(integrationId);
      addNotification({
        type: 'success',
        title: 'Intégration supprimée',
        message: 'L\'intégration a été supprimée avec succès'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer l\'intégration'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      error: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    };

    const icons = {
      active: <Check className="w-3 h-3" />,
      error: <X className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status === 'active' ? 'Actif' : status === 'error' ? 'Erreur' : status === 'pending' ? 'En attente' : 'Inactif'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Plug className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Intégrations</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">Connectez vos outils et synchronisez vos données</p>
      </div>

      {/* Integrations actives */}
      {data?.integrations && data.integrations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Intégrations actives ({data.integrations.length})
          </h2>
          <div className="space-y-3">
            {data.integrations.map((integration: any) => (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{integration.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(integration.status)}
                        {integration.last_sync_at && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Dernière sync : {new Date(integration.last_sync_at).toLocaleString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleSync(integration.id)}
                      disabled={triggerSync.isPending}
                    >
                      <RefreshCw className={`w-4 h-4 mr-1 ${triggerSync.isPending ? 'animate-spin' : ''}`} />
                      Synchroniser
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(integration.id)}
                      disabled={deleteIntegration.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {integration.last_error && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-800 dark:text-red-300">
                    Erreur : {integration.last_error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Marketplace */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Marketplace</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_INTEGRATIONS.map((integration) => {
            const Icon = integration.icon;
            const isConnected = data?.integrations?.some((i: any) => i.name === integration.name);

            return (
              <div
                key={integration.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-700/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 font-medium">
                    {integration.tier}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{integration.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{integration.description}</p>

                {isConnected ? (
                  <Button variant="secondary" disabled className="w-full">
                    <Check className="w-4 h-4 mr-1" />
                    Connecté
                  </Button>
                ) : integration.id === 'shopify' ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowShopifySetup(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Connecter
                  </Button>
                ) : integration.id === 'woocommerce' ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowWooSetup(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Connecter
                  </Button>
                ) : integration.id === 'salesforce' ? (
                  <Button
                    variant="primary"
                    onClick={() => setShowSalesforceSetup(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Connecter
                  </Button>
                ) : (
                  <Button variant="secondary" disabled className="w-full">
                    Bientôt disponible
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Shopify Setup */}
      {showShopifySetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Configurer Shopify
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Domaine de la boutique
                </label>
                <input
                  type="text"
                  placeholder="example.myshopify.com"
                  value={shopifyForm.shop_domain}
                  onChange={(e) => setShopifyForm({ ...shopifyForm, shop_domain: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Token
                </label>
                <input
                  type="password"
                  placeholder="shpat_..."
                  value={shopifyForm.access_token}
                  onChange={(e) => setShopifyForm({ ...shopifyForm, access_token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowShopifySetup(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSetupShopify}
                disabled={!shopifyForm.shop_domain || !shopifyForm.access_token || setupShopify.isPending}
                className="flex-1"
              >
                {setupShopify.isPending ? 'Configuration...' : 'Connecter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal WooCommerce Setup */}
      {showWooSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Configurer WooCommerce
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL de la boutique
                </label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={wooForm.store_url}
                  onChange={(e) => setWooForm({ ...wooForm, store_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Consumer Key
                </label>
                <input
                  type="text"
                  placeholder="ck_..."
                  value={wooForm.consumer_key}
                  onChange={(e) => setWooForm({ ...wooForm, consumer_key: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Consumer Secret
                </label>
                <input
                  type="password"
                  placeholder="cs_..."
                  value={wooForm.consumer_secret}
                  onChange={(e) => setWooForm({ ...wooForm, consumer_secret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowWooSetup(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSetupWooCommerce}
                disabled={!wooForm.store_url || !wooForm.consumer_key || !wooForm.consumer_secret || setupWooCommerce.isPending}
                className="flex-1"
              >
                {setupWooCommerce.isPending ? 'Configuration...' : 'Connecter'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Salesforce Setup */}
      {showSalesforceSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">
              Configurer Salesforce
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instance URL
                </label>
                <input
                  type="text"
                  placeholder="https://yourinstance.salesforce.com"
                  value={salesforceForm.instance_url}
                  onChange={(e) => setSalesforceForm({ ...salesforceForm, instance_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Access Token <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  placeholder="00D..."
                  value={salesforceForm.access_token}
                  onChange={(e) => setSalesforceForm({ ...salesforceForm, access_token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Refresh Token (optionnel)
                </label>
                <input
                  type="password"
                  placeholder="5Aep..."
                  value={salesforceForm.refresh_token}
                  onChange={(e) => setSalesforceForm({ ...salesforceForm, refresh_token: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client ID (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="3MVG..."
                    value={salesforceForm.client_id}
                    onChange={(e) => setSalesforceForm({ ...salesforceForm, client_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Secret (optionnel)
                  </label>
                  <input
                    type="password"
                    placeholder="..."
                    value={salesforceForm.client_secret}
                    onChange={(e) => setSalesforceForm({ ...salesforceForm, client_secret: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button variant="secondary" onClick={() => setShowSalesforceSetup(false)} className="flex-1">
                Annuler
              </Button>
              <Button
                variant="primary"
                onClick={handleSetupSalesforce}
                disabled={!salesforceForm.instance_url || !salesforceForm.access_token || setupSalesforce.isPending}
                className="flex-1"
              >
                {setupSalesforce.isPending ? 'Configuration...' : 'Connecter'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
