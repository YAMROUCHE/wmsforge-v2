import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, BarChart3, Boxes, Truck, Users, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold">1</span>
              </div>
              <span className="ml-2 text-xl font-semibold">wms.io</span>
            </div>
            <nav className="flex space-x-8">
              <Link to="/products" className="text-gray-700 hover:text-gray-900">
                Produits
              </Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/auth">
                <Button>Connexion</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Le WMS nouvelle génération
            <br />
            <span className="text-blue-600">à la hauteur des géants</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            De la PME à l'Enterprise, bénéficiez de l'intelligence
            des solutions premium mondiales, sans la complexité ni le prix.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/auth">
              <Button size="lg" className="flex items-center gap-2">
                Démarrer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/warehouse-dashboard">
              <Button variant="secondary" size="lg">
                Voir la démo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Fonctionnalités enterprise-grade
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Boxes className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Classification ABC</h3>
              <p className="text-gray-600">
                Optimisation automatique du slotting selon la vélocité des produits
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Zap className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Streaming</h3>
              <p className="text-gray-600">
                Priorisation dynamique des commandes selon SLA et urgence
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <BarChart3 className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Analytics temps réel</h3>
              <p className="text-gray-600">
                KPIs et métriques de performance en temps réel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Horizons */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Une évolution en 3 horizons
          </h2>
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">MVP PME</h3>
                <p className="text-gray-600">
                  Start simple : Gestion de stock, picking basique, 50-500 commandes/jour
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">WMS Avancé</h3>
                <p className="text-gray-600">
                  Scale up : Order streaming, slotting ABC, 500-2000 commandes/jour
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enterprise Premium</h3>
                <p className="text-gray-600">
                  Au niveau des géants : WES, IA/ML, Digital Twin, 2000+ commandes/jour
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à transformer votre entrepôt ?
          </h2>
          <p className="text-gray-400 mb-8">
            Commencez gratuitement, évoluez à votre rythme
          </p>
          <Link to="/auth">
            <Button size="lg" variant="primary" className="bg-white text-black hover:bg-gray-100">
              Démarrer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600">
          <p>© 2025 1wms.io - Du MVP à l'Enterprise</p>
        </div>
      </footer>
    </div>
  );
}
