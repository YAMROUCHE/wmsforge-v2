import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, BarChart3, ShoppingCart, Box, MapPin, Settings, Layers, Clipboard, Users, FileText, Zap } from 'lucide-react';

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState('dashboard');
  const [userInteracted, setUserInteracted] = useState(false);

  // Liste des sections pour l'animation automatique
  const demoSections = ['dashboard', 'products', 'inventory', 'orders', 'locations', 'waves', 'tasks', 'labor', 'reports', 'settings'];

  // Animation automatique en boucle
  useEffect(() => {
    if (userInteracted) return; // Arrêter si l'utilisateur a cliqué

    const interval = setInterval(() => {
      setActiveDemo((current) => {
        const currentIndex = demoSections.indexOf(current);
        const nextIndex = (currentIndex + 1) % demoSections.length;
        return demoSections[nextIndex];
      });
    }, 3500); // Change toutes les 3.5 secondes

    return () => clearInterval(interval);
  }, [userInteracted]);

  // Fonction pour gérer les clics utilisateur
  const handleDemoClick = (section: string) => {
    setUserInteracted(true); // Arrêter l'animation
    setActiveDemo(section);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Header - Minimal et épuré */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Package className="w-5 h-5 text-gray-900" />
              <span className="text-base font-medium text-gray-900">1WMS</span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-8">
              <Link
                to="/auth"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/auth?mode=register"
                className="text-sm font-medium text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Démarrer
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Minimaliste */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-medium text-gray-900 tracking-tight leading-tight">
              Gérez votre entrepôt
              <br />
              avec simplicité
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Un système de gestion d'entrepôt moderne qui booste votre productivité
              et réduit vos erreurs.
            </p>

            <div className="pt-4">
              <Link to="/auth?mode=register">
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Essayer gratuitement
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 pt-2">
              Gratuit pendant 14 jours · Sans carte bancaire
            </p>
          </div>

          {/* Hero Visual - Mockup Interactif Section 1 */}
          <div className="mt-20 space-y-8">
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg">
              <div className="aspect-[16/9] relative bg-gray-50">
                {/* Sidebar gauche cliquable */}
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gray-900 border-r border-gray-700 flex flex-col items-start pt-4 gap-1 px-2">
                  <div className="w-12 h-10 mb-2 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>

                  <button
                    onClick={() => handleDemoClick('dashboard')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'dashboard' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Dashboard"
                  >
                    <BarChart3 className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('products')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'products' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Produits"
                  >
                    <Box className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('inventory')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'inventory' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Inventaire"
                  >
                    <Layers className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('orders')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'orders' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Commandes"
                  >
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('locations')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'locations' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Emplacements"
                  >
                    <MapPin className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('waves')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'waves' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Vagues"
                  >
                    <Zap className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('tasks')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'tasks' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Tâches"
                  >
                    <Clipboard className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('labor')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'labor' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Main d'œuvre"
                  >
                    <Users className="w-5 h-5 text-white" />
                  </button>

                  <button
                    onClick={() => handleDemoClick('reports')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors ${
                      activeDemo === 'reports' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Rapports"
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </button>

                  <div className="flex-1"></div>

                  <button
                    onClick={() => handleDemoClick('settings')}
                    className={`w-12 h-10 rounded-md flex items-center justify-center transition-colors mb-2 ${
                      activeDemo === 'settings' ? 'bg-gray-700' : 'hover:bg-gray-800'
                    }`}
                    title="Paramètres"
                  >
                    <Settings className="w-5 h-5 text-white" />
                  </button>
                </div>

                {/* Main Content Dynamique */}
                <div className="absolute left-16 right-0 top-0 bottom-0 p-6 flex flex-col">
                  {/* Dashboard View */}
                  {activeDemo === 'dashboard' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                        <div className="mb-4">
                          <h2 className="text-lg font-bold text-gray-900">Dashboard</h2>
                          <p className="text-xs text-gray-600">Vue d'ensemble de votre activité</p>
                        </div>

                        <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center mb-2">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <Package className="w-4 h-4 text-gray-700" />
                            </div>
                          </div>
                          <h3 className="text-xs text-gray-600 mb-1">Produits en stock</h3>
                          <p className="text-xl font-bold text-gray-900">1,543</p>
                          <p className="text-xs text-gray-500 mt-1">127 produits distincts</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <ArrowRight className="w-4 h-4 text-gray-700 transform -rotate-45" />
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">12</span>
                          </div>
                          <h3 className="text-xs text-gray-600 mb-1">Commandes</h3>
                          <p className="text-xl font-bold text-gray-900">12</p>
                          <p className="text-xs text-gray-500 mt-1">Revenu: 24,850€</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center mb-2">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <ArrowRight className="w-4 h-4 text-gray-700 transform rotate-90" />
                            </div>
                          </div>
                          <h3 className="text-xs text-gray-600 mb-1">Mouvements</h3>
                          <p className="text-xl font-bold text-gray-900">89</p>
                          <p className="text-xs text-gray-500 mt-1">15 emplacements actifs</p>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="bg-gray-100 p-2 rounded-lg">
                              <ArrowRight className="w-4 h-4 text-gray-700 transform rotate-180" />
                            </div>
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">3</span>
                          </div>
                          <h3 className="text-xs text-gray-600 mb-1">Alertes stock faible</h3>
                          <p className="text-xl font-bold text-gray-900">3</p>
                          <p className="text-xs text-gray-500 mt-1">À réapprovisionner</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                          <h3 className="text-xs font-medium text-gray-700">Mouvements récents</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                          <div className="px-3 py-2 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-xs text-gray-900 flex-1">Réception - Produit A</span>
                            <span className="text-xs text-gray-500">+50</span>
                          </div>
                          <div className="px-3 py-2 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-xs text-gray-900 flex-1">Déplacement - Produit B</span>
                            <span className="text-xs text-gray-500">20</span>
                          </div>
                          <div className="px-3 py-2 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                            <span className="text-xs text-gray-900 flex-1">Expédition - Produit C</span>
                            <span className="text-xs text-gray-500">-15</span>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Visualisez en temps réel toute votre activité : stocks, commandes, mouvements et alertes. Prenez des décisions éclairées grâce à des KPIs actualisés.
                        </p>
                      </div>
                      </div>
                    </>
                  )}

                  {/* Products View */}
                  {activeDemo === 'products' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Produits</h2>
                        <p className="text-xs text-gray-600">Gérez votre catalogue de produits</p>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="text-xs font-medium text-gray-700">Liste des produits (127)</h3>
                          <button className="text-xs bg-gray-900 text-white px-2 py-1 rounded">+ Nouveau</button>
                        </div>
                        <div>
                          <div className="grid grid-cols-5 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-medium text-gray-600">SKU</span>
                            <span className="text-xs font-medium text-gray-600">Nom</span>
                            <span className="text-xs font-medium text-gray-600">Catégorie</span>
                            <span className="text-xs font-medium text-gray-600">Stock</span>
                            <span className="text-xs font-medium text-gray-600">Statut</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">SKU-001</span>
                              <span className="text-xs text-gray-700">Chaise Bureau Pro</span>
                              <span className="text-xs text-gray-600">Mobilier</span>
                              <span className="text-xs text-gray-900">245</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Actif</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">SKU-002</span>
                              <span className="text-xs text-gray-700">Bureau Ajustable</span>
                              <span className="text-xs text-gray-600">Mobilier</span>
                              <span className="text-xs text-gray-900">89</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Actif</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">SKU-003</span>
                              <span className="text-xs text-gray-700">Lampe LED</span>
                              <span className="text-xs text-gray-600">Éclairage</span>
                              <span className="text-xs text-gray-900">12</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Stock bas</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">SKU-004</span>
                              <span className="text-xs text-gray-700">Clavier Mécanique</span>
                              <span className="text-xs text-gray-600">Accessoires</span>
                              <span className="text-xs text-gray-900">156</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Actif</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">SKU-005</span>
                              <span className="text-xs text-gray-700">Souris Sans Fil</span>
                              <span className="text-xs text-gray-600">Accessoires</span>
                              <span className="text-xs text-gray-900">342</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Actif</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Gérez votre catalogue complet avec SKU, catégories, stock et statuts. Créez, modifiez et suivez tous vos produits depuis une interface unique.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Orders View */}
                  {activeDemo === 'orders' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                        <div className="mb-4">
                          <h2 className="text-lg font-bold text-gray-900">Commandes</h2>
                          <p className="text-xs text-gray-600">Gérez vos commandes clients</p>
                        </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="text-xs font-medium text-gray-700">Commandes en cours (12)</h3>
                          <button className="text-xs bg-gray-900 text-white px-2 py-1 rounded">+ Nouvelle</button>
                        </div>
                        <div>
                          <div className="grid grid-cols-6 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-medium text-gray-600">N° Commande</span>
                            <span className="text-xs font-medium text-gray-600">Client</span>
                            <span className="text-xs font-medium text-gray-600">Date</span>
                            <span className="text-xs font-medium text-gray-600">Articles</span>
                            <span className="text-xs font-medium text-gray-600">Total</span>
                            <span className="text-xs font-medium text-gray-600">Statut</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            <div className="grid grid-cols-6 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">#ORD-1247</span>
                              <span className="text-xs text-gray-700">Entreprise A</span>
                              <span className="text-xs text-gray-600">17/11/2025</span>
                              <span className="text-xs text-gray-900">8</span>
                              <span className="text-xs text-gray-900">3,245€</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En préparation</span>
                            </div>
                            <div className="grid grid-cols-6 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">#ORD-1246</span>
                              <span className="text-xs text-gray-700">Client B</span>
                              <span className="text-xs text-gray-600">17/11/2025</span>
                              <span className="text-xs text-gray-900">3</span>
                              <span className="text-xs text-gray-900">1,890€</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Expédiée</span>
                            </div>
                            <div className="grid grid-cols-6 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">#ORD-1245</span>
                              <span className="text-xs text-gray-700">Société C</span>
                              <span className="text-xs text-gray-600">16/11/2025</span>
                              <span className="text-xs text-gray-900">15</span>
                              <span className="text-xs text-gray-900">8,765€</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En préparation</span>
                            </div>
                            <div className="grid grid-cols-6 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">#ORD-1244</span>
                              <span className="text-xs text-gray-700">Entreprise D</span>
                              <span className="text-xs text-gray-600">16/11/2025</span>
                              <span className="text-xs text-gray-900">22</span>
                              <span className="text-xs text-gray-900">12,450€</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Livrée</span>
                            </div>
                            <div className="grid grid-cols-6 gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer">
                              <span className="text-xs text-gray-900 font-medium">#ORD-1243</span>
                              <span className="text-xs text-gray-700">Client E</span>
                              <span className="text-xs text-gray-600">15/11/2025</span>
                              <span className="text-xs text-gray-900">5</span>
                              <span className="text-xs text-gray-900">2,340€</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En préparation</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Centralisez la gestion de toutes vos commandes clients : numéros, dates, articles, montants et statuts. Suivez la préparation et l'expédition en temps réel.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Locations View */}
                  {activeDemo === 'locations' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Emplacements</h2>
                        <p className="text-xs text-gray-600">Organisation de votre entrepôt</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Total emplacements</h3>
                          <p className="text-2xl font-bold text-gray-900">156</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Occupés</h3>
                          <p className="text-2xl font-bold text-gray-900">142</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Disponibles</h3>
                          <p className="text-2xl font-bold text-gray-900">14</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                          <h3 className="text-xs font-medium text-gray-700">Structure de l'entrepôt</h3>
                        </div>
                        <div className="p-3">
                          <div className="grid grid-cols-8 gap-1.5">
                            {[...Array(64)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-8 rounded border ${
                                  i % 5 === 0
                                    ? 'bg-gray-50 border-gray-200'
                                    : 'bg-gray-100 border-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs">
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                              <span className="text-gray-600">Occupé</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
                              <span className="text-gray-600">Disponible</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Visualisez l'organisation complète de votre entrepôt avec une grille interactive. Optimisez l'occupation et identifiez les emplacements disponibles.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Inventory View */}
                  {activeDemo === 'inventory' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Inventaire</h2>
                        <p className="text-xs text-gray-600">Suivi des stocks en temps réel</p>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Stock total</h3>
                          <p className="text-xl font-bold text-gray-900">1,543</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Produits actifs</h3>
                          <p className="text-xl font-bold text-gray-900">127</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Stock bas</h3>
                          <p className="text-xl font-bold text-gray-900">3</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Valeur totale</h3>
                          <p className="text-xl font-bold text-gray-900">142K€</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                          <h3 className="text-xs font-medium text-gray-700">Inventaire par emplacement</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-medium text-gray-900">Zone A - Allée 1</span>
                              <p className="text-xs text-gray-600">SKU-001 • Chaise Bureau Pro</p>
                            </div>
                            <span className="text-xs font-bold text-gray-900">245 unités</span>
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-medium text-gray-900">Zone A - Allée 2</span>
                              <p className="text-xs text-gray-600">SKU-002 • Bureau Ajustable</p>
                            </div>
                            <span className="text-xs font-bold text-gray-900">89 unités</span>
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-medium text-gray-900">Zone B - Allée 1</span>
                              <p className="text-xs text-gray-600">SKU-003 • Lampe LED</p>
                            </div>
                            <span className="text-xs font-bold text-gray-900">12 unités</span>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Suivez votre stock en temps réel par emplacement. Identifiez les produits en stock faible et optimisez la valeur de votre inventaire.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Waves View */}
                  {activeDemo === 'waves' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                        <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Vagues de préparation</h2>
                        <p className="text-xs text-gray-600">Optimisation des préparations</p>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200 flex items-center justify-between">
                          <h3 className="text-xs font-medium text-gray-700">Vagues actives (3)</h3>
                          <button className="text-xs bg-gray-900 text-white px-2 py-1 rounded">+ Nouvelle vague</button>
                        </div>
                        <div>
                          <div className="grid grid-cols-5 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-medium text-gray-600">Vague</span>
                            <span className="text-xs font-medium text-gray-600">Commandes</span>
                            <span className="text-xs font-medium text-gray-600">Articles</span>
                            <span className="text-xs font-medium text-gray-600">Progression</span>
                            <span className="text-xs font-medium text-gray-600">Statut</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5">
                              <span className="text-xs text-gray-900 font-medium">WAVE-2025-001</span>
                              <span className="text-xs text-gray-700">8 commandes</span>
                              <span className="text-xs text-gray-700">42 articles</span>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 bg-gray-200 h-1.5 rounded">
                                  <div className="bg-gray-700 h-1.5 rounded" style={{width: '65%'}}></div>
                                </div>
                                <span className="text-xs text-gray-600">65%</span>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En cours</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5">
                              <span className="text-xs text-gray-900 font-medium">WAVE-2025-002</span>
                              <span className="text-xs text-gray-700">5 commandes</span>
                              <span className="text-xs text-gray-700">28 articles</span>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 bg-gray-200 h-1.5 rounded">
                                  <div className="bg-gray-700 h-1.5 rounded" style={{width: '30%'}}></div>
                                </div>
                                <span className="text-xs text-gray-600">30%</span>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En cours</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5">
                              <span className="text-xs text-gray-900 font-medium">WAVE-2025-003</span>
                              <span className="text-xs text-gray-700">12 commandes</span>
                              <span className="text-xs text-gray-700">67 articles</span>
                              <div className="flex items-center gap-1">
                                <div className="flex-1 bg-gray-200 h-1.5 rounded">
                                  <div className="bg-gray-700 h-1.5 rounded" style={{width: '100%'}}></div>
                                </div>
                                <span className="text-xs text-gray-600">100%</span>
                              </div>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Terminée</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Regroupez vos commandes en vagues de préparation pour optimiser les déplacements. Suivez la progression en temps réel avec des indicateurs visuels.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Tasks View */}
                  {activeDemo === 'tasks' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Tâches</h2>
                        <p className="text-xs text-gray-600">Gestion des tâches d'entrepôt</p>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                          <h3 className="text-xs font-medium text-gray-700">Tâches en cours (8)</h3>
                        </div>
                        <div>
                          <div className="grid grid-cols-5 gap-3 px-3 py-2 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-medium text-gray-600">Tâche</span>
                            <span className="text-xs font-medium text-gray-600">Type</span>
                            <span className="text-xs font-medium text-gray-600">Assignée à</span>
                            <span className="text-xs font-medium text-gray-600">Priorité</span>
                            <span className="text-xs font-medium text-gray-600">Statut</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5">
                              <span className="text-xs text-gray-900 font-medium">PICK-1247</span>
                              <span className="text-xs text-gray-700">Picking</span>
                              <span className="text-xs text-gray-700">Jean D.</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Haute</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En cours</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5">
                              <span className="text-xs text-gray-900 font-medium">PACK-1248</span>
                              <span className="text-xs text-gray-700">Emballage</span>
                              <span className="text-xs text-gray-700">Marie L.</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Moyenne</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En attente</span>
                            </div>
                            <div className="grid grid-cols-5 gap-3 px-3 py-2.5">
                              <span className="text-xs text-gray-900 font-medium">RECV-1249</span>
                              <span className="text-xs text-gray-700">Réception</span>
                              <span className="text-xs text-gray-700">Paul M.</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">Normale</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded w-fit">En cours</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Assignez et suivez toutes les tâches opérationnelles : picking, emballage, réception. Gérez les priorités et les affectations par employé.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Labor View */}
                  {activeDemo === 'labor' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Main d'œuvre</h2>
                        <p className="text-xs text-gray-600">Performance et productivité</p>
                      </div>

                      <div className="grid grid-cols-4 gap-3 mb-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Employés actifs</h3>
                          <p className="text-xl font-bold text-gray-900">12</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Tâches/heure</h3>
                          <p className="text-xl font-bold text-gray-900">24.5</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Heures totales</h3>
                          <p className="text-xl font-bold text-gray-900">96h</p>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-3">
                          <h3 className="text-xs text-gray-600 mb-1">Productivité</h3>
                          <p className="text-xl font-bold text-gray-900">94%</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200">
                        <div className="px-3 py-2 border-b border-gray-200">
                          <h3 className="text-xs font-medium text-gray-700">Performance individuelle</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-xs font-medium text-gray-900">Jean Dupont</span>
                              <p className="text-xs text-gray-600">Préparateur</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-gray-900">28 tâches</span>
                              <p className="text-xs text-gray-600">8h travaillées</p>
                            </div>
                          </div>
                          <div className="px-3 py-2 flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-xs font-medium text-gray-900">Marie Laurent</span>
                              <p className="text-xs text-gray-600">Emballeuse</p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-gray-900">32 tâches</span>
                              <p className="text-xs text-gray-600">8h travaillées</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Analysez la performance de votre équipe avec des métriques précises : tâches par heure, heures travaillées et productivité individuelle.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Reports View */}
                  {activeDemo === 'reports' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Rapports</h2>
                        <p className="text-xs text-gray-600">Analytics et statistiques</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="text-xs text-gray-600 mb-3">Commandes par jour</h3>
                          <div className="flex items-end justify-between gap-1 h-20">
                            {[45, 62, 58, 71, 68, 82, 76].map((height, i) => (
                              <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{height: `${height}%`}}></div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-xs text-gray-500">Lun</span>
                            <span className="text-xs text-gray-500">Dim</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="text-xs text-gray-600 mb-3">Performance picking</h3>
                          <div className="flex items-center justify-center h-20">
                            <div className="relative w-24 h-24">
                              <svg className="transform -rotate-90 w-24 h-24">
                                <circle cx="48" cy="48" r="40" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                                <circle cx="48" cy="48" r="40" stroke="#374151" strokeWidth="8" fill="none"
                                  strokeDasharray="251.2" strokeDashoffset="62.8" />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xl font-bold text-gray-900">75%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <h3 className="text-xs font-medium text-gray-700 mb-3">Rapports disponibles</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-900">Rapport mensuel - Octobre 2025</span>
                            <button className="text-xs text-gray-600">Télécharger</button>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-xs text-gray-900">Performance équipe - S47</span>
                            <button className="text-xs text-gray-600">Télécharger</button>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Générez des rapports détaillés et visualisez vos données avec des graphiques. Prenez des décisions basées sur des analytics temps réel.
                        </p>
                      </div>
                    </>
                  )}

                  {/* Settings View */}
                  {activeDemo === 'settings' && (
                    <>
                      <div className="flex-1 overflow-y-auto">
                      <div className="mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Paramètres</h2>
                        <p className="text-xs text-gray-600">Configuration de l'application</p>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Organisation</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Nom de l'entreprise</span>
                              <span className="text-xs text-gray-900 font-medium">ACME Logistique</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Plan actuel</span>
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">Pro</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Préférences</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Langue</span>
                              <span className="text-xs text-gray-900">Français</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Fuseau horaire</span>
                              <span className="text-xs text-gray-900">Europe/Paris</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Mode sombre</span>
                              <div className="w-8 h-4 bg-gray-200 rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Email</span>
                              <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">Alertes stock faible</span>
                              <div className="w-8 h-4 bg-gray-900 rounded-full relative">
                                <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      </div>

                      {/* Description */}
                      <div className="mt-auto pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          Configurez votre organisation, vos préférences et vos notifications. Personnalisez l'application selon vos besoins spécifiques.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Second Mockup - Vue élargie avec sidebar */}
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-lg">
              <div className="aspect-[16/9] relative bg-gray-50">
                {/* Sidebar gauche élargie */}
                <div className="absolute left-0 top-0 bottom-0 w-48 bg-gray-900 border-r border-gray-700 flex flex-col p-4">
                  <div className="flex items-center gap-2 mb-6">
                    <Package className="w-5 h-5 text-white" />
                    <span className="text-sm font-medium text-white">1WMS</span>
                  </div>

                  <nav className="space-y-1 flex-1">
                    <div className="flex items-center gap-3 px-3 py-2 text-white bg-gray-800 rounded-md">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <Box className="w-4 h-4" />
                      <span className="text-sm">Produits</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <Layers className="w-4 h-4" />
                      <span className="text-sm">Inventaire</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">Commandes</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Emplacements</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">Vagues</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <Clipboard className="w-4 h-4" />
                      <span className="text-sm">Tâches</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Main d'œuvre</span>
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">Rapports</span>
                    </div>
                  </nav>

                  <div className="border-t border-gray-700 pt-3">
                    <div className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors">
                      <Settings className="w-4 h-4" />
                      <span className="text-sm">Paramètres</span>
                    </div>
                  </div>
                </div>

                {/* Main Content - Vue Rapports / Analytique */}
                <div className="absolute left-48 right-0 top-0 bottom-0 p-6 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Rapports & Analytique</h2>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Graphique des performances */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Volume de commandes</h3>
                      <div className="flex items-end gap-2 h-32">
                        <div className="flex-1 bg-gray-200 rounded-t" style={{height: '60%'}}></div>
                        <div className="flex-1 bg-gray-300 rounded-t" style={{height: '75%'}}></div>
                        <div className="flex-1 bg-gray-400 rounded-t" style={{height: '45%'}}></div>
                        <div className="flex-1 bg-gray-500 rounded-t" style={{height: '85%'}}></div>
                        <div className="flex-1 bg-gray-600 rounded-t" style={{height: '95%'}}></div>
                        <div className="flex-1 bg-gray-700 rounded-t" style={{height: '70%'}}></div>
                        <div className="flex-1 bg-gray-800 rounded-t" style={{height: '80%'}}></div>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-gray-500">Lun</span>
                        <span className="text-xs text-gray-500">Mar</span>
                        <span className="text-xs text-gray-500">Mer</span>
                        <span className="text-xs text-gray-500">Jeu</span>
                        <span className="text-xs text-gray-500">Ven</span>
                        <span className="text-xs text-gray-500">Sam</span>
                        <span className="text-xs text-gray-500">Dim</span>
                      </div>
                    </div>

                    {/* KPIs */}
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="text-xs text-gray-600">Taux de précision</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">99.2%</div>
                        <div className="text-xs text-green-600 mt-1">↑ +2.1% vs mois dernier</div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-3">
                        <div className="text-xs text-gray-600">Temps moyen de picking</div>
                        <div className="text-2xl font-bold text-gray-900 mt-1">4.2 min</div>
                        <div className="text-xs text-green-600 mt-1">↓ -12% vs mois dernier</div>
                      </div>
                    </div>

                    {/* Activité récente */}
                    <div className="col-span-2 bg-white rounded-lg border border-gray-200 p-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-3">Activité récente</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                          <span className="text-gray-600">14:32</span>
                          <span className="text-gray-900">Commande #2451 expédiée</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          <span className="text-gray-600">14:18</span>
                          <span className="text-gray-900">Nouvelle commande #2452 reçue</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                          <span className="text-gray-600">13:55</span>
                          <span className="text-gray-900">Alerte stock faible: Produit SKU-789</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-auto pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                      Navigation complète avec tous les modules accessibles. Tableau de bord analytique en temps réel pour suivre vos performances.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Sobre et clair */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                Inventaire temps réel
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Suivez vos stocks en temps réel avec une précision totale.
                Fini les erreurs d'inventaire.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                Picking optimisé
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Réduisez vos déplacements et accélérez vos préparations
                grâce à l'optimisation des parcours.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-gray-900">
                Rapports intelligents
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Prenez des décisions éclairées avec des analytics
                et des tableaux de bord en temps réel.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <p className="text-4xl font-medium text-gray-900 mb-2">40%</p>
              <p className="text-sm text-gray-600">Productivité en plus</p>
            </div>
            <div>
              <p className="text-4xl font-medium text-gray-900 mb-2">95%</p>
              <p className="text-sm text-gray-600">Erreurs en moins</p>
            </div>
            <div>
              <p className="text-4xl font-medium text-gray-900 mb-2">5 min</p>
              <p className="text-sm text-gray-600">Configuration</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Connectez votre boutique en un clic
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Synchronisez automatiquement vos commandes depuis vos plateformes e-commerce.
              Plus de saisie manuelle, tout est automatisé.
            </p>
          </div>

          {/* Logos des intégrations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Shopify</div>
                <p className="text-xs text-gray-500">E-commerce</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">WooCommerce</div>
                <p className="text-xs text-gray-500">WordPress</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Amazon</div>
                <p className="text-xs text-gray-500">Marketplace</p>
              </div>
            </div>
            <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">Prestashop</div>
                <p className="text-xs text-gray-500">E-commerce</p>
              </div>
            </div>
          </div>

          {/* Bénéfices */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Synchronisation automatique</h3>
              <p className="text-sm text-gray-600">
                Les commandes arrivent directement dans 1WMS. Aucune intervention manuelle nécessaire.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Mise à jour du stock en temps réel</h3>
              <p className="text-sm text-gray-600">
                Vos stocks sont synchronisés automatiquement sur toutes vos plateformes.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-medium text-gray-900">Configuration en 5 minutes</h3>
              <p className="text-sm text-gray-600">
                Connectez vos boutiques en quelques clics. Pas besoin de développeur.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Link to="/auth?mode=register">
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Voir toutes les intégrations
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing - Simple et clair */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Tarifs simples
            </h2>
            <p className="text-gray-600">
              Choisissez le plan adapté à vos besoins
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Starter</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-medium text-gray-900">299€</span>
                    <span className="text-gray-600">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-600">
                  <li>1 entrepôt</li>
                  <li>5 utilisateurs</li>
                  <li>Support email</li>
                  <li>Toutes les fonctionnalités</li>
                </ul>

                <Link to="/auth?mode=register" className="block">
                  <button className="w-full py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Commencer
                  </button>
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-gray-900 text-white rounded-xl p-8 shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Pro</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-medium">699€</span>
                    <span className="text-gray-400">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-300">
                  <li>3 entrepôts</li>
                  <li>20 utilisateurs</li>
                  <li>Support prioritaire</li>
                  <li>API complète</li>
                </ul>

                <Link to="/auth?mode=register" className="block">
                  <button className="w-full py-2 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors">
                    Commencer
                  </button>
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Enterprise</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-medium text-gray-900">Custom</span>
                  </div>
                </div>

                <ul className="space-y-3 text-sm text-gray-600">
                  <li>Entrepôts illimités</li>
                  <li>Utilisateurs illimités</li>
                  <li>Support dédié 24/7</li>
                  <li>Développements sur mesure</li>
                </ul>

                <Link to="/auth" className="block">
                  <button className="w-full py-2 text-sm font-medium text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Nous contacter
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-12">
            14 jours d'essai gratuit · Sans engagement
          </p>
        </div>
      </section>

      {/* Final CTA - Minimaliste */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-medium text-gray-900">
            Prêt à commencer ?
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=register">
              <button className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Essayer gratuitement
              </button>
            </Link>
            <Link to="/auth">
              <button className="px-6 py-3 text-gray-900 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Planifier une démo
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="border-t border-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">1WMS</span>
            </div>

            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Documentation</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Confidentialité</a>
            </div>

            <p className="text-sm text-gray-500">
              © 2025 1WMS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
