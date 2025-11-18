import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, BarChart3, ShoppingCart, Box, MapPin, Settings, Layers, Clipboard, Users, FileText, Zap, Bell, CheckCircle2, TrendingUp, Star, Clock, Truck, Archive, ChevronDown, Shield, Headphones, Globe, Award } from 'lucide-react';

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState('dashboard');
  const [userInteracted, setUserInteracted] = useState(false);

  // States pour les animations
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentStat1, setCurrentStat1] = useState(0);
  const [currentStat2, setCurrentStat2] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const statsRef = useRef<HTMLDivElement>(null);

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

  // Animation des compteurs de stats (Intersection Observer)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsVisible) {
          setStatsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [statsVisible]);

  // Compteur animé pour stat 1 (40%)
  useEffect(() => {
    if (statsVisible && currentStat1 < 40) {
      const timer = setTimeout(() => {
        setCurrentStat1((prev) => Math.min(prev + 1, 40));
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [statsVisible, currentStat1]);

  // Compteur animé pour stat 2 (95%)
  useEffect(() => {
    if (statsVisible && currentStat2 < 95) {
      const timer = setTimeout(() => {
        setCurrentStat2((prev) => Math.min(prev + 2, 95));
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [statsVisible, currentStat2]);

  // Animation des témoignages (rotation automatique)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animation du workflow (étapes)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorkflowStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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

      {/* Advanced Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Fonctionnalités puissantes, interface simple
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Des outils professionnels pensés pour gagner du temps au quotidien.
              Sans formation complexe, sans manuel de 200 pages.
            </p>
          </div>

          {/* Grid des fonctionnalités */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Wave Picking</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Groupez jusqu'à 50 commandes en une seule vague. Réduisez vos déplacements de 60%.
                  Un préparateur peut traiter 3x plus de commandes par heure.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Multi-emplacements intelligents</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Organisez votre entrepôt avec une précision à l'étagère. Trouvez n'importe quel
                  produit en 10 secondes. Zones, allées, racks, étagères.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Alertes automatiques</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ne tombez plus jamais en rupture. Alertes automatiques quand vos stocks
                  atteignent le seuil critique. Par email ou dans l'app.
                </p>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Export & API</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Exportez toutes vos données en un clic. Compatible avec Excel, Google Sheets,
                  votre ERP. API REST pour les développeurs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Animated */}
      <section ref={statsRef} className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="transition-all duration-500 transform hover:scale-105">
              <p className="text-5xl font-medium text-gray-900 mb-2">
                <span className="inline-block transition-all duration-300">
                  {currentStat1}
                </span>
                <span className="text-green-600">%</span>
              </p>
              <p className="text-sm text-gray-600 font-medium">Productivité en plus</p>
              <p className="text-xs text-gray-500 mt-1">vs. gestion manuelle</p>
            </div>
            <div className="transition-all duration-500 transform hover:scale-105">
              <p className="text-5xl font-medium text-gray-900 mb-2">
                <span className="inline-block transition-all duration-300">
                  {currentStat2}
                </span>
                <span className="text-blue-600">%</span>
              </p>
              <p className="text-sm text-gray-600 font-medium">Erreurs en moins</p>
              <p className="text-xs text-gray-500 mt-1">grâce à l'automatisation</p>
            </div>
            <div className="transition-all duration-500 transform hover:scale-105">
              <p className="text-5xl font-medium text-gray-900 mb-2">
                <span className="text-purple-600">5</span> min
              </p>
              <p className="text-sm text-gray-600 font-medium">Configuration</p>
              <p className="text-xs text-gray-500 mt-1">pour démarrer</p>
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

      {/* Workflow Animé */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              De la réception à l'expédition en 4 clics
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un workflow fluide qui guide vos équipes à chaque étape.
              Plus de formation complexe, tout est intuitif.
            </p>
          </div>

          <div className="relative">
            {/* Timeline horizontale */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div
              className="absolute top-12 left-0 h-0.5 bg-gray-900 transition-all duration-500"
              style={{ width: `${(activeWorkflowStep + 1) * 25}%` }}
            ></div>

            <div className="grid md:grid-cols-4 gap-8 relative">
              {/* Étape 1: Réception */}
              <div className={`text-center transition-all duration-500 ${activeWorkflowStep >= 0 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                  activeWorkflowStep >= 0 ? 'bg-gray-900 shadow-lg' : 'bg-gray-200'
                }`}>
                  <Package className={`w-10 h-10 ${activeWorkflowStep >= 0 ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Réception</h3>
                <p className="text-sm text-gray-600">
                  Scannez les produits entrants, assignez automatiquement les emplacements
                </p>
                <p className="text-xs text-gray-500 mt-2">~30 sec/article</p>
              </div>

              {/* Étape 2: Stockage */}
              <div className={`text-center transition-all duration-500 ${activeWorkflowStep >= 1 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                  activeWorkflowStep >= 1 ? 'bg-gray-900 shadow-lg' : 'bg-gray-200'
                }`}>
                  <Archive className={`w-10 h-10 ${activeWorkflowStep >= 1 ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Stockage</h3>
                <p className="text-sm text-gray-600">
                  Optimisation automatique des emplacements, zones chaudes/froides
                </p>
                <p className="text-xs text-gray-500 mt-2">Gain 40% d'espace</p>
              </div>

              {/* Étape 3: Picking */}
              <div className={`text-center transition-all duration-500 ${activeWorkflowStep >= 2 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                  activeWorkflowStep >= 2 ? 'bg-gray-900 shadow-lg' : 'bg-gray-200'
                }`}>
                  <Clipboard className={`w-10 h-10 ${activeWorkflowStep >= 2 ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Picking</h3>
                <p className="text-sm text-gray-600">
                  Wave picking intelligent, regroupement de 50 commandes simultanées
                </p>
                <p className="text-xs text-gray-500 mt-2">3x plus rapide</p>
              </div>

              {/* Étape 4: Expédition */}
              <div className={`text-center transition-all duration-500 ${activeWorkflowStep >= 3 ? 'opacity-100 scale-100' : 'opacity-50 scale-95'}`}>
                <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-500 ${
                  activeWorkflowStep >= 3 ? 'bg-gray-900 shadow-lg' : 'bg-gray-200'
                }`}>
                  <Truck className={`w-10 h-10 ${activeWorkflowStep >= 3 ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Expédition</h3>
                <p className="text-sm text-gray-600">
                  Étiquettes automatiques, tracking clients, synchronisation transporteurs
                </p>
                <p className="text-xs text-gray-500 mt-2">95% satisfaction</p>
              </div>
            </div>

            {/* Indicateur d'étape */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Étape {activeWorkflowStep + 1}/4 • Animation automatique
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Simple et clair */}
      <section className="py-20 px-6 bg-white">
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

      {/* Timeline de déploiement */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Du premier scan au ROI en une semaine
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pas de projet IT de 6 mois. Vous êtes opérationnel immédiatement.
            </p>
          </div>

          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>

            <div className="space-y-8">
              {/* Jour 0 */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center z-10">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">5 minutes • Inscription</h3>
                  <p className="text-gray-600">
                    Créez votre compte, configurez votre entrepôt. Pas de carte bancaire requise.
                  </p>
                </div>
              </div>

              {/* 1 heure */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center z-10">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">1 heure • Premier scan</h3>
                  <p className="text-gray-600">
                    Importez vos produits (CSV ou API), créez vos emplacements. Premier article scanné.
                  </p>
                </div>
              </div>

              {/* 1 jour */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center z-10">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">1 jour • Équipe formée</h3>
                  <p className="text-gray-600">
                    Interface intuitive, pas besoin de formation. Vos équipes sont autonomes immédiatement.
                  </p>
                </div>
              </div>

              {/* 1 semaine */}
              <div className="relative flex items-start gap-6">
                <div className="flex-shrink-0 w-16 h-16 bg-green-600 rounded-full flex items-center justify-center z-10 shadow-lg">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-xl font-medium text-gray-900 mb-2">1 semaine • ROI positif</h3>
                  <p className="text-gray-600">
                    40% de productivité en plus, 95% d'erreurs en moins. Le retour sur investissement est immédiat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages en rotation */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Ils ont transformé leur entrepôt
            </h2>
            <p className="text-gray-600">
              Des résultats concrets, pas des promesses
            </p>
          </div>

          <div className="relative min-h-[300px]">
            {/* Témoignage 1 */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              currentTestimonial === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}>
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xl text-gray-900 mb-6 leading-relaxed">
                  "En 2 semaines, nous avons réduit nos erreurs de préparation de 87%.
                  L'équipe ne veut plus revenir aux anciennes méthodes."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">MR</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Marie Rousseau</p>
                    <p className="text-sm text-gray-600">Directrice Logistique • LogisPro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Témoignage 2 */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              currentTestimonial === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}>
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xl text-gray-900 mb-6 leading-relaxed">
                  "Le wave picking nous a permis de traiter 3x plus de commandes avec la même équipe.
                  Le ROI a été immédiat."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">JD</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Jean Dupont</p>
                    <p className="text-sm text-gray-600">CEO • FastShip</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Témoignage 3 */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              currentTestimonial === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
            }`}>
              <div className="bg-gray-50 rounded-2xl p-12 text-center">
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-xl text-gray-900 mb-6 leading-relaxed">
                  "Interface ultra simple, équipe formée en 1 journée.
                  Fini les fichiers Excel et les erreurs d'inventaire."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">SL</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Sophie Laurent</p>
                    <p className="text-sm text-gray-600">Responsable Stock • EcoMarket</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Indicateurs */}
          <div className="flex justify-center gap-2 mt-8">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentTestimonial === index ? 'bg-gray-900 w-8' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Comparaison Avant/Après */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Avant / Après 1WMS
            </h2>
            <p className="text-gray-600">
              La différence est spectaculaire
            </p>
          </div>

          <div className="relative overflow-hidden bg-white rounded-2xl border border-gray-200">
            <div className="grid md:grid-cols-2">
              {/* Avant */}
              <div className={`p-8 transition-all duration-300 ${sliderPosition > 50 ? 'opacity-100' : 'opacity-50'}`}>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
                    ❌ Sans 1WMS
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-gray-600">Fichiers Excel partout, versions obsolètes</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-gray-600">Erreurs d'inventaire régulières, clients insatisfaits</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-gray-600">Préparateurs perdent 60% de leur temps en déplacements</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-gray-600">Ruptures de stock fréquentes, aucune alerte</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-red-600 text-sm">✕</span>
                    </div>
                    <p className="text-gray-600">Impossible de suivre les performances en temps réel</p>
                  </div>
                </div>
              </div>

              {/* Après */}
              <div className={`p-8 bg-gray-50 transition-all duration-300 ${sliderPosition < 50 ? 'opacity-100' : 'opacity-50'}`}>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                    ✓ Avec 1WMS
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-900 font-medium">Données centralisées, synchronisées en temps réel</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-900 font-medium">95% d'erreurs en moins, clients ravis</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-900 font-medium">Wave picking : 3x plus de commandes préparées/heure</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-900 font-medium">Alertes automatiques, réapprovisionnement optimisé</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-900 font-medium">Dashboard live, KPIs à jour à la seconde</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slider interactif */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${sliderPosition}%, #10b981 ${sliderPosition}%, #10b981 100%)`
                  }}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Sans 1WMS</span>
                  <span>Avec 1WMS</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Chiffres clés */}
      <section className="py-16 px-6 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-2">
              Utilisé par des centaines d'entrepôts
            </h2>
            <p className="text-gray-600">Des résultats prouvés, chaque jour</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-medium text-gray-900">200+</p>
              <p className="text-sm text-gray-600">Entrepôts actifs</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-medium text-gray-900">12K+</p>
              <p className="text-sm text-gray-600">Commandes/jour</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-medium text-gray-900">4.8/5</p>
              <p className="text-sm text-gray-600">Note moyenne</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-medium text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600">Uptime</p>
            </div>
          </div>

          {/* Logos clients (placeholders) */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 opacity-40">
            <div className="text-2xl font-bold text-gray-400">E-Commerce Pro</div>
            <div className="text-2xl font-bold text-gray-400">LogisFast</div>
            <div className="text-2xl font-bold text-gray-400">StockMaster</div>
            <div className="text-2xl font-bold text-gray-400">ShipQuick</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 space-y-3">
            <h2 className="text-3xl font-medium text-gray-900">
              Questions fréquentes
            </h2>
            <p className="text-gray-600">
              Tout ce que vous devez savoir avant de commencer
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Combien de temps prend la migration depuis Excel/autre système ?
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openFaqIndex === 0 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === 0 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">
                  En moyenne 1-2 heures. Importez vos produits via CSV, créez vos emplacements,
                  et c'est terminé. Pas besoin de développeur ni de migration complexe.
                  Notre équipe support vous guide gratuitement lors de la mise en route.
                </div>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Mes données sont-elles sécurisées ?
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openFaqIndex === 1 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === 1 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">
                  Absolument. Hébergement en Europe (RGPD compliant), chiffrement SSL,
                  sauvegardes quotidiennes automatiques. Vos données vous appartiennent :
                  export complet en 1 clic à tout moment. Nous ne vendons jamais vos données.
                </div>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Que se passe-t-il après les 14 jours d'essai ?
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openFaqIndex === 2 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === 2 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">
                  Aucune carte bancaire requise pour l'essai. Après 14 jours, choisissez votre plan
                  ou votre compte passe simplement en mode lecture seule. Vos données restent accessibles,
                  rien n'est supprimé. Réactivation en 1 clic si vous changez d'avis.
                </div>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Le support est-il en français ?
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openFaqIndex === 3 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === 3 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">
                  Oui ! Support en français par email (réponse sous 2h en moyenne) et chat en direct
                  pendant les heures ouvrées. Documentation complète en français. Pour les plans Pro/Enterprise,
                  support téléphonique dédié.
                </div>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Puis-je importer mes produits existants ?
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openFaqIndex === 4 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === 4 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">
                  Absolument. Import CSV massif en 1 clic (jusqu'à 10,000 produits à la fois).
                  Format Excel standard accepté. API disponible pour synchronisation automatique
                  depuis votre ERP ou e-commerce. Import depuis Shopify/WooCommerce intégré.
                </div>
              </div>
            </div>

            {/* FAQ 6 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === 5 ? null : 5)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">
                  Compatible avec mon système actuel ?
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    openFaqIndex === 5 ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openFaqIndex === 5 ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-4 text-gray-600">
                  1WMS fonctionne sur n'importe quel navigateur moderne (Chrome, Safari, Firefox, Edge).
                  Compatible mobile (iOS/Android) pour scanner en déplacement. API REST complète
                  pour intégration avec votre ERP, CRM, ou e-commerce. Webhooks disponibles.
                </div>
              </div>
            </div>
          </div>

          {/* Contact pour autres questions */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Vous avez une autre question ?</p>
            <Link to="/auth">
              <button className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-colors">
                <Headphones className="w-4 h-4" />
                Contactez notre équipe
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA avec Trust Badges */}
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

          {/* Trust Badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto pt-8 border-t border-gray-100">
            <div className="flex flex-col items-center gap-2 text-center">
              <Shield className="w-8 h-8 text-green-600" />
              <p className="text-xs text-gray-600">RGPD<br />Compliant</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Globe className="w-8 h-8 text-blue-600" />
              <p className="text-xs text-gray-600">Hébergé<br />en EU</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Headphones className="w-8 h-8 text-purple-600" />
              <p className="text-xs text-gray-600">Support<br />7j/7</p>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <Award className="w-8 h-8 text-orange-600" />
              <p className="text-xs text-gray-600">Annulation<br />en 1 clic</p>
            </div>
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
