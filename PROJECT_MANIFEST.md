# 📦 MANIFESTE DE PROJET - 1wms.io

**Date de création** : 10 octobre 2025  
**Version** : 2.1.0  
**Développeur** : Amrouche (Débutant)  
**Repository GitHub** : https://github.com/YAMROUCHE/wmsforge-v2  
**Statut actuel** : ✅ **Phase Onboarding TERMINÉE** - Dashboard visuel fonctionnel !

---

## 🚨 CONSIGNES STRICTES DE DÉVELOPPEMENT

Ces règles DOIVENT être respectées à chaque étape :

1. ✅ **Respect absolu du manifeste** : Toujours suivre l'architecture et les instructions définies
2. ✅ **Pas de modification sans accord** : Ne JAMAIS modifier le code sans en parler d'abord
3. ✅ **Sauvegardes systématiques** :
   - Sauvegarde locale : `git add . && git commit -m "message"`
   - Sauvegarde GitHub : `git push`
   - Fréquence : Après chaque fonctionnalité complète
4. ✅ **Méthode CAT obligatoire** : Toujours utiliser `cat > fichier << 'EOF'` avec le code COMPLET
5. ✅ **Vérification du nombre de lignes** : Toujours compter les lignes avant déploiement avec `wc -l fichier`
6. ✅ **Mise à jour du manifeste** : Mettre à jour ce document après chaque phase complétée

---

## 🎯 OBJECTIF DU PROJET

Créer une application SaaS complète de gestion d'entrepôt (WMS) appelée **1wms.io**, déployée sur Cloudflare avec une architecture moderne et scalable.

**Concept clé** : Le client décrit son entrepôt via un **wizard d'onboarding**, puis peut suivre son workflow de manière globale, optimiser son entreposage, ses entrées et sorties.

---

## 🏗 ARCHITECTURE TECHNIQUE

### Stack Technique

**Frontend**
- React 18.3.1 avec TypeScript
- Vite 5.3.4 comme bundler
- Tailwind CSS 3.4.7 pour le styling
- React Router 6.26.0
- TanStack Query pour la gestion d'état
- Lucide React pour les icônes

**Backend** ✅ FONCTIONNEL
- Cloudflare Workers avec Hono 4.5.0
- TypeScript strict
- Architecture RESTful API
- JWT pour l'authentification (implémentation custom Web Crypto)
- SHA-256 pour le hash des mots de passe
- Routes : `/auth/register`, `/auth/login`, `/auth/me`

**Base de données** ✅ CONFIGURÉE
- Cloudflare D1 (SQLite)
- Drizzle ORM 0.33.0
- ID de base : `4f114494-537e-4c31-8271-79f3ee49dfed`
- 9 tables créées (organizations, users, products, suppliers, locations, inventory, stock_movements, orders, order_items)
- Migrations appliquées en local

**Stockage**
- Cloudflare R2 pour les fichiers
- Bucket name : `wmsforge-uploads`

---

## 📁 STRUCTURE DU PROJET
wmsforge-v2/
├── src/
│   ├── components/
│   │   ├── ui/ ✅ Button.tsx, Input.tsx
│   │   ├── layout/ ✅ Header.tsx
│   │   └── warehouse/ ✅ Système complet d'éditeur
│   ├── pages/
│   │   ├── Landing.tsx ✅ Terminé
│   │   ├── Auth.tsx ✅ Terminé (Login/Register UI)
│   │   ├── Onboarding.tsx ✅ Wizard 5 étapes TERMINÉ
│   │   ├── WarehouseDashboard.tsx ✅ Dashboard visuel TERMINÉ
│   │   ├── Dashboard.tsx ❌ À refactoriser
│   │   ├── Products.tsx ❌ À créer
│   │   ├── Inventory.tsx ❌ À créer
│   │   ├── Orders.tsx ❌ À créer
│   │   ├── Locations.tsx ❌ À créer
│   │   └── Reports.tsx ❌ À créer
│   ├── hooks/ ✅ useAuth
│   ├── contexts/ ✅ AuthContext
│   ├── lib/
│   │   ├── utils.ts ✅ Terminé
│   │   └── api.ts ❌ À créer
│   ├── App.tsx ✅ Routes complètes
│   ├── main.tsx ✅ Terminé
│   └── index.css ✅ Tailwind + Style Claude.ai
│
├── worker/ ✅ COMPLET ET TESTÉ
│   ├── src/
│   │   ├── index.ts ✅ Point d'entrée Hono (41 lignes)
│   │   ├── routes/
│   │   │   └── auth.ts ✅ Register + Login + Me (202 lignes)
│   │   └── utils/
│   │       ├── jwt.ts ✅ Création/Vérification JWT (76 lignes)
│   │       └── password.ts ✅ Hash + Validation (36 lignes)
│   └── tsconfig.json ✅ Config TypeScript Worker
│
├── db/
│   ├── schema.ts ✅ Schéma Drizzle complet (106 lignes)
│   └── migrations/ ✅ Migration SQL appliquée
│       └── 0000_boring_mattie_franklin.sql
│
├── wrangler.toml ✅ Configuré (migrations_dir corrigé)
├── drizzle.config.ts ✅ Config Drizzle
├── package.json ✅ Dépendances installées
├── PROJECT_MANIFEST.md ✅ Ce fichier
└── README.md ❌ À créer

---

## 🎨 DESIGN SYSTEM (Style Claude.ai)

### Palette de couleurs
```css
Background: Blanc (#FFFFFF)
Text primary: Noir (#000000)
Text secondary: Gris (#6B7280)
Accent: Bleu (#2563EB)
Border: Gris clair (#E5E7EB)
Hover: Gris très clair (#F3F4F6)
Composants UI Standards
typescriptButton variants:
- primary: bg-blue-600 text-white
- secondary: bg-white text-black border-black
- ghost: text-gray-700 hover:bg-gray-100

Input:
- border-gray-300
- focus:ring-blue-500
- Label en gray-700
Logo et Branding

Logo : Carré noir 32x32px avec "1" blanc centré
Texte : "wms.io" en minuscules, font-semibold
Le "1" du logo représente visuellement "1wms.io"


✅ ÉTAT D'AVANCEMENT
Phase 1 : Configuration et Landing Page ✅ TERMINÉ

 Initialisation du projet
 Configuration Vite + React + TypeScript
 Configuration Tailwind CSS
 Création composants UI de base (Button, Input)
 Création Header avec navigation
 Page Landing fonctionnelle
 Style Claude.ai appliqué
 Dépôt GitHub créé et synchronisé
 Branding 1wms.io appliqué

Phase 2 : Authentification ✅ TERMINÉ (100%)

 Page Auth (Login/Register) - Frontend
 Schéma de base de données (Drizzle) - 9 tables
 Backend Auth avec JWT (Worker Hono)
 Routes /auth/register et /auth/login
 Hash des mots de passe (SHA-256)
 Validation des données
 Migrations générées et appliquées en local
 Tests réussis (Register + Login)
 Context Auth React
 Hook useAuth
 Middleware de protection des routes

Phase 3 : Onboarding ✅ TERMINÉ (100%)

 Wizard d'onboarding (5 étapes)

 Étape 1 : Informations générales (nom, adresse, surface, hauteur)
 Étape 2 : Zones de l'entrepôt (type, surface, allées)
 Étape 3 : Configuration des allées (largeur, racks)
 Étape 4 : Racks et emplacements (niveaux, capacité)
 Étape 5 : Récapitulatif avec calcul de capacité


 Sauvegarde dans localStorage
 Pré-remplissage des données si modification
 Progression visuelle (barre de progression)
 Validation des champs à chaque étape

Phase 4 : Dashboard Visuel ✅ TERMINÉ (90%)

 Vue d'ensemble de l'entrepôt
 4 cartes de statistiques :

Surface totale
Nombre de zones
Capacité totale (calculée automatiquement)
Taux d'occupation (0% pour l'instant)


 Grille de zones colorées par type :

📦 Réception (bleu)
🏢 Stockage (vert)
🎯 Picking (jaune)
🚚 Expédition (orange)
❄️ Zone froide (cyan)


 Calcul automatique des capacités par zone
 Sélection de zone (bordure bleue)
 Détails de zone (en bas de page - à améliorer)
 Drawer latéral pour détails (WIP - cassé, à réparer)
 Bouton "Modifier" fonctionnel
 Flèche retour vers dashboard (bug à corriger)

Phase 5 : Dashboard Principal ❌ À REFACTORISER

 Dashboard principal après authentification
 Intégration avec WarehouseDashboard
 KPI Cards globaux
 Graphiques
 Activités récentes
 Alertes

Phase 6 : Gestion Produits ❌ À FAIRE

 Liste produits
 Formulaire création/édition
 Upload images (R2)
 Import CSV
 Routes API backend

Phase 7 : Inventaire ❌ À FAIRE

 Vue stock en temps réel
 Mouvements de stock
 Ajustements
 Scanner codes-barres

Phase 8 : Autres modules ❌ À FAIRE

 Commandes
 Emplacements
 Rapports
 Exports

Phase 9 : Déploiement ❌ À FAIRE

 Configuration D1 en production
 Configuration R2
 Déploiement Cloudflare Pages
 Tests de production


🗄 SCHÉMA DE BASE DE DONNÉES ✅ CRÉÉ
Tables Créées et Testées

organizations - Organisations (multi-tenant) ✅
users - Utilisateurs avec hash de mot de passe ✅
products - Catalogue produits ✅
suppliers - Fournisseurs ✅
locations - Emplacements d'entrepôt ✅
inventory - Stock par produit et emplacement ✅
stock_movements - Historique des mouvements ✅
orders - Commandes clients/fournisseurs ✅
order_items - Lignes de commande ✅


🚀 COMMANDES ESSENTIELLES
Développement Local
bashnpm run dev              # Lancer frontend (port 5173)
npm run dev:worker       # Lancer worker (port 8787)
npm run build            # Build frontend
npm run build:worker     # Build worker
npm run preview          # Preview build
Base de données
bashnpm run db:generate      # Générer migrations Drizzle
npm run db:migrate       # Appliquer migrations en production
npx wrangler d1 migrations apply wmsforge-db --local  # Migrations locales ✅ FAIT
Tests API ✅ TESTÉS
bash# Health check
curl http://localhost:8787/health

# Register
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"pass123","organizationName":"Org"}'

# Login
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
Git
bashgit add .
git commit -m "message"
git push
Cloudflare
bashnpx wrangler d1 create wmsforge-db              # Créer base D1
npx wrangler r2 bucket create wmsforge-uploads  # Créer bucket R2
npx wrangler pages deploy dist                  # Déployer

⚠️ PROBLÈMES RÉSOLUS
Problème 1 : Architecture Node.js vs Workers

Cause : Le projet initial (WmsForge) était en Node.js classique
Solution : Refonte complète avec architecture Workers
Statut : ✅ Résolu

Problème 2 : Erreur "border-border" Tailwind

Cause : Classe CSS non existante dans index.css
Solution : Remplacer par border-color: theme('colors.gray.200')
Statut : ✅ Résolu

Problème 3 : tsconfig.node.json manquant

Cause : Configuration Vite incomplète
Solution : Créer tsconfig.node.json avec config Vite
Statut : ✅ Résolu

Problème 4 : migrations_dir mal placé dans wrangler.toml

Cause : migrations_dir au niveau racine au lieu de [[d1_databases]]
Solution : Déplacer dans la section [[d1_databases]]
Statut : ✅ Résolu

Problème 5 : Tables non créées (no such table: users)

Cause : Migrations générées mais pas appliquées
Solution : npx wrangler d1 migrations apply wmsforge-db --local
Statut : ✅ Résolu

Problème 6 : Imports dupliqués dans WarehouseEditor

Cause : Copier/coller de code a créé des doublons
Solution : Scripts Node.js pour supprimer les doublons
Statut : ✅ Résolu

Problème 7 : Route /warehouse-dashboard 404

Cause : Route non ajoutée dans App.tsx (structure avec ProtectedRoute)
Solution : Ajout manuel de la route
Statut : ✅ Résolu

Problème 8 : Drawer latéral JSX cassé

Cause : Remplacement automatique mal géré les balises imbriquées
Solution : git checkout pour revenir à la version qui marche
Statut : ⚠️ À réparer dans prochaine session


📝 PROCHAINES ÉTAPES RECOMMANDÉES
Priorité Immédiate (Prochaine session)

Réparer le drawer latéral (panneau de détails de zone)

Recréer proprement le fichier WarehouseDashboard.tsx
Ajouter l'overlay + panneau qui slide depuis la droite
Animation fluide


Corriger la flèche retour

Dashboard → /dashboard au lieu de /


Améliorer l'UX

Transitions plus fluides
Meilleur feedback visuel


Intégration Backend

Créer API pour sauvegarder la config en BDD
Remplacer localStorage par API



Ordre de développement suggéré
Phase Onboarding (✅ terminée) → Phase Dashboard visuel (90%) → Phase Dashboard principal → Phase Produits → Phase Inventaire → Phase Autres modules → Phase Déploiement

🔐 INFORMATIONS SENSIBLES
IDs Cloudflare (Dans wrangler.toml)
tomldatabase_id = "4f114494-537e-4c31-8271-79f3ee49dfed"  # D1 Database
bucket_name = "wmsforge-uploads"                      # R2 Bucket
JWT_SECRET = "whsec_a8f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5"  # JWT Secret
migrations_dir = "db/migrations"                       # Chemin migrations

🔌 API ENDPOINTS ✅ FONCTIONNELS
Authentification

POST /auth/register - Créer un compte ✅ TESTÉ
POST /auth/login - Se connecter ✅ TESTÉ
GET /auth/me - Vérifier le token (À implémenter complètement)

Santé

GET /health - Health check ✅ TESTÉ


📊 STATISTIQUES DU CODE
Backend Worker : ~500 lignes au total

worker/src/index.ts : 41 lignes
worker/src/routes/auth.ts : 202 lignes
worker/src/utils/jwt.ts : 76 lignes
worker/src/utils/password.ts : 36 lignes
db/schema.ts : 106 lignes
drizzle.config.ts : 13 lignes
worker/tsconfig.json : 14 lignes

Frontend : ~2000 lignes

Pages :

Landing.tsx : ~200 lignes
Auth.tsx : ~150 lignes
Onboarding.tsx : 497 lignes ✅ NOUVEAU
WarehouseDashboard.tsx : 290 lignes ✅ NOUVEAU
Autres pages : ~400 lignes


Composants :

Warehouse Editor : ~800 lignes
UI Components : ~100 lignes
Layout : ~50 lignes



Total projet : ~2500 lignes de code ✅ ÉNORME PROGRÈS !

👨‍💻 NOTES DÉVELOPPEUR
Niveau de compétence
Débutant - Nécessite accompagnement pas à pas détaillé
Préférences de style

Commentaires en français
Explications détaillées pour chaque étape
Validation fréquente des résultats
Style visuel : Claude.ai (minimaliste, blanc/gris/bleu)

Méthode de travail efficace

Donner une commande à la fois
Attendre la validation avant de continuer
Expliquer le "pourquoi" de chaque action
Faire des commits Git réguliers


📚 RESSOURCES UTILES
Documentation

React: https://react.dev
Vite: https://vitejs.dev
Tailwind: https://tailwindcss.com
Cloudflare Workers: https://developers.cloudflare.com/workers
Drizzle ORM: https://orm.drizzle.team
Hono: https://hono.dev

Commandes de dépannage
bash# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Vite
rm -rf .vite

# Vérifier TypeScript
npx tsc --noEmit

# Lister les fichiers
tree -L 3 -I 'node_modules|dist'

🎯 OBJECTIF FINAL
Application SaaS complète 1wms.io :

✅ Onboarding wizard guidé
✅ Dashboard visuel de l'entrepôt
✅ Authentification multi-utilisateurs
✅ Multi-tenant (organizations)
❌ Gestion complète produits, inventaire, commandes
❌ Import/Export CSV
❌ Upload images (R2)
❌ Rapports détaillés
✅ Design minimaliste style Claude.ai
❌ Déployé sur Cloudflare (Pages + Workers + D1 + R2)
❌ Performance et scalabilité


DERNIÈRE MISE À JOUR : 12 octobre 2025 - 19h35
Phase actuelle : Onboarding + Dashboard visuel ✅ TERMINÉS (90%)
PROCHAIN OBJECTIF : Réparer le drawer latéral + Intégration backend

FIN DU MANIFESTE
