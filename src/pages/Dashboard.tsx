import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { LogOut, User, Package, Building2, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <span className="text-xl font-semibold">wms.io</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue, {user?.name} ! 👋</h1>
          <p className="text-gray-600">Voici votre tableau de bord. Les fonctionnalités WMS seront ajoutées prochainement.</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations du compte
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nom complet</p>
              <p className="text-base font-medium text-gray-900">{user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-base font-medium text-gray-900">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ID Utilisateur</p>
              <p className="text-base font-medium text-gray-900">{user?.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">ID Organisation</p>
              <p className="text-base font-medium text-gray-900">{user?.organizationId}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Bientôt</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Produits</h3>
            <p className="text-sm text-gray-600 mb-4">Gérez votre catalogue de produits, fournisseurs et stocks.</p>
            <Button variant="secondary" className="w-full" disabled>Accéder</Button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="w-8 h-8 text-green-600" />
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Bientôt</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inventaire</h3>
            <p className="text-sm text-gray-600 mb-4">Suivez vos stocks en temps réel par emplacement.</p>
            <Button variant="secondary" className="w-full" disabled>Accéder</Button>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">Bientôt</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rapports</h3>
            <p className="text-sm text-gray-600 mb-4">Analysez vos données avec des rapports détaillés.</p>
            <Button variant="secondary" className="w-full" disabled>Accéder</Button>
          </div>
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">✅ Authentification fonctionnelle !</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Félicitations ! Votre système d'authentification fonctionne parfaitement. Vous êtes connecté et pouvez accéder à cette page protégée.</p>
                <p className="mt-2"><strong>Prochaines étapes :</strong> Développer les modules de gestion de produits, inventaire, commandes et rapports.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
