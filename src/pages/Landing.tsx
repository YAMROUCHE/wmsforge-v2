import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Package, Warehouse, BarChart3 } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <span className="text-xl font-semibold">wms.io</span>
            </div>
            <div className="space-x-3">
              <Link to="/auth">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="primary">Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-gray-900">
            Gestion d'entrepôt simplifiée
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            1wms.io vous aide à gérer votre inventaire, vos commandes et vos emplacements
            avec une interface simple et moderne.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth?mode=register">
              <Button variant="primary" className="text-lg px-8 py-3">
                Démarrer gratuitement
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="secondary" className="text-lg px-8 py-3">
                En savoir plus
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
              <Package size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold">Gestion des produits</h3>
            <p className="text-gray-600">
              Gérez votre catalogue produit avec SKU, catégories et fournisseurs
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
              <Warehouse size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold">Suivi d'inventaire</h3>
            <p className="text-gray-600">
              Suivez vos stocks en temps réel avec alertes de stock bas
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
              <BarChart3 size={32} className="text-gray-700" />
            </div>
            <h3 className="text-xl font-semibold">Rapports détaillés</h3>
            <p className="text-gray-600">
              Analysez vos données avec des rapports complets et exports
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
