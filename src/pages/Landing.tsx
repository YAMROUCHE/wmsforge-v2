import React from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  ArrowRight,
  BarChart3,
  Boxes,
  Truck,
  Zap,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  Smartphone,
  CheckCircle,
  Star,
  Users,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function Landing() {
  const features = [
    {
      icon: Sparkles,
      title: 'Suggestions IA',
      description: 'Notre IA analyse vos données et suggère des optimisations en temps réel',
      color: 'text-purple-600 bg-purple-100'
    },
    {
      icon: BarChart3,
      title: 'Analytics Temps Réel',
      description: 'Dashboard complet avec graphiques et KPIs pour piloter votre activité',
      color: 'text-blue-600 bg-blue-100'
    },
    {
      icon: Package,
      title: 'Gestion Stock',
      description: 'Réceptions, mouvements, ajustements - tout votre inventaire centralisé',
      color: 'text-green-600 bg-green-100'
    },
    {
      icon: Truck,
      title: 'Commandes',
      description: 'Workflow complet de la commande à la livraison avec suivi temps réel',
      color: 'text-orange-600 bg-orange-100'
    },
    {
      icon: Boxes,
      title: 'Emplacements',
      description: 'Organisez votre entrepôt en zones, allées, racks et étagères',
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      icon: AlertTriangle,
      title: 'Alertes Proactives',
      description: 'Soyez averti avant les ruptures de stock et problèmes critiques',
      color: 'text-red-600 bg-red-100'
    }
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime garanti' },
    { value: '<100ms', label: 'Temps de réponse' },
    { value: '7/7', label: 'Support disponible' },
    { value: '0€', label: 'Pour démarrer' }
  ];

  const testimonials = [
    {
      name: 'Sophie Martin',
      role: 'Responsable Logistique',
      company: 'LogiPro',
      content: 'Nous avons réduit nos erreurs de stock de 85% en 3 mois. L\'IA nous alerte avant même qu\'un problème survienne.',
      rating: 5
    },
    {
      name: 'Thomas Dubois',
      role: 'CEO',
      company: 'StockExpress',
      content: 'Simple, rapide et efficace. Exactement ce qu\'on cherchait pour digitaliser notre entrepôt sans se ruiner.',
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                wms.io
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-gray-900 transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors">
                Tarifs
              </a>
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
              <Link to="/auth">
                <Button className="shadow-lg hover:shadow-xl transition-all">
                  Démarrer gratuitement
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20 px-4">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-8 shadow-lg">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Propulsé par l'IA • Version 2.3.0
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Le WMS le plus
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              simple & intelligent
            </span>
            <br />
            du marché
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Gérez votre entrepôt avec des suggestions IA, analytics temps réel
            et une expérience digne de Manhattan WMS. <span className="font-semibold">À une fraction du coût.</span>
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link to="/auth">
              <Button size="lg" className="shadow-2xl hover:shadow-3xl transition-all text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Zap className="w-5 h-5 mr-2" />
                Essai gratuit - 0€
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all">
                <Activity className="w-5 h-5 mr-2" />
                Voir la démo
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600">
              7 modules complets, 0 configuration complexe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <div className="flex items-center justify-center gap-2 text-yellow-500">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">4.9/5 sur 47 avis</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl transition-all"
              >
                <div className="flex items-center gap-1 mb-4 text-yellow-500">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">
                    {testimonial.role} • {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tarification simple et transparente
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Commencez gratuitement, évoluez à votre rythme
          </p>

          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
            <div className="text-6xl font-black mb-4">0€</div>
            <p className="text-2xl mb-8 opacity-90">Pour toujours • Sans limite</p>
            <ul className="space-y-4 mb-8 text-left max-w-md mx-auto">
              {[
                'Tous les modules inclus',
                'Suggestions IA illimitées',
                'Analytics temps réel',
                'Support par email',
                'Mises à jour automatiques',
                'Données sécurisées'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                  <span className="text-lg">{item}</span>
                </li>
              ))}
            </ul>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl text-lg px-8 py-6">
                <Zap className="w-5 h-5 mr-2" />
                Commencer maintenant
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Prêt à transformer votre entrepôt ?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Rejoignez les entreprises qui optimisent déjà leur logistique avec 1wms.io
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl text-lg px-8 py-6">
              <Zap className="w-5 h-5 mr-2" />
              Démarrer gratuitement
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-gray-600">
          <p className="mb-2">© 2025 1wms.io - Propulsé par Cloudflare Workers & IA</p>
          <p className="text-sm">Made with ❤️ by Claude Code</p>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
