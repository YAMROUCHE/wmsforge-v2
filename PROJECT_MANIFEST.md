# 📦 MANIFESTE DE PROJET - 1wms.io
## Document de continuité pour reprise de développement

**Date de création** : 10 octobre 2025  
**Version** : 2.0.0  
**Développeur** : Amrouche (Débutant)  
**Repository GitHub** : https://github.com/YAMROUCHE/wmsforge-v2  
**Statut actuel** : Phase 1 terminée - Landing page fonctionnelle

---

## 🎯 CONTEXTE DU PROJET

### Objectif
Créer une application SaaS complète de gestion d'entrepôt (WMS) appelée **1wms.io**, 
déployée sur Cloudflare avec une architecture moderne et scalable.

### Historique
- **Projet initial** : WmsForge développé sur Replit (architecture Node.js classique)
- **Projet actuel** : Refonte complète pour Cloudflare (wmsforge-v2)
- **Raison du changement** : Architecture Replit incompatible avec Cloudflare Workers

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technique Définie

**Frontend**
- React 18.3.1 avec TypeScript
- Vite 5.3.4 comme bundler
- Tailwind CSS 3.4.7 pour le styling
- React Router 6.26.0
- TanStack Query pour la gestion d'état
- Lucide React pour les icônes

**Backend (À développer)**
- Cloudflare Workers avec Hono 4.5.0
- TypeScript strict
- Architecture RESTful API

**Base de données (À configurer)**
- Cloudflare D1 (SQLite)
- Drizzle ORM 0.33.0
- ID de base existante : `4f114494-537e-4c31-8271-79f3ee49dfed`

**Stockage (À configurer)**
- Cloudflare R2 pour les fichiers
- Bucket name : `wmsforge-uploads`

**Authentification (À développer)**
- JWT tokens
- Hash bcrypt des mots de passe

---

## 📁 STRUCTURE DU PROJET

```
wmsforge-v2/
├── src/
│   ├── components/
│   │   ├── ui/                    ✅ Button.tsx, Input.tsx
│   │   ├── layout/                ✅ Header.tsx
│   │   └── dashboard/             ❌ À créer
│   ├── pages/
│   │   ├── Landing.tsx            ✅ Terminé
│   │   ├── Auth.tsx               ❌ À créer (Login/Register)
│   │   ├── Dashboard.tsx          ❌ À créer
│   │   ├── Products.tsx           ❌ À créer
│   │   ├── Inventory.tsx          ❌ À créer
│   │   ├── Orders.tsx             ❌ À créer
│   │   ├── Locations.tsx          ❌ À créer
│   │   └── Reports.tsx            ❌ À créer
│   ├── hooks/                     ❌ À créer
│   ├── lib/
│   │   └── utils.ts               ✅ Terminé
│   ├── App.tsx                    ✅ Routing basique
│   ├── main.tsx                   ✅ Terminé
│   └── index.css                  ✅ Tailwind + Style Claude.ai
│
├── worker/                        ❌ TOUT À CRÉER
│   └── src/
│       ├── index.ts
│       ├── routes/
│       ├── middleware/
│       └── utils/
│
├── db/                            ❌ À créer
│   ├── schema.ts
│   └── migrations/
│
├── wrangler.toml                  ✅ Configuré (IDs vides)
├── package.json                   ✅ Dépendances installées
└── README.md                      ❌ À créer
```

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
```

### Composants UI Standards
```typescript
Button variants:
- primary: bg-blue-600 text-white
- secondary: bg-white text-black border-black
- ghost: text-gray-700 hover:bg-gray-100

Input:
- border-gray-300
- focus:ring-blue-500
- Label en gray-700
```

### Logo et Branding
- Logo: Carré noir 32x32px avec "1" blanc centré
- Texte: "wms.io" en minuscules, font-semibold
- Le "1" du logo représente visuellement "1wms.io"

---

## ✅ ÉTAT D'AVANCEMENT

### Phase 1 : Configuration et Landing Page ✅ TERMINÉ
- [x] Initialisation du projet
- [x] Configuration Vite + React + TypeScript
- [x] Configuration Tailwind CSS
- [x] Création composants UI de base (Button, Input)
- [x] Création Header avec navigation
- [x] Page Landing fonctionnelle
- [x] Style Claude.ai appliqué
- [x] Dépôt GitHub créé et synchronisé
- [x] Branding 1wms.io appliqué

### Phase 2 : Authentification ❌ À FAIRE
- [ ] Page Auth (Login/Register)
- [ ] Backend Auth avec JWT
- [ ] Middleware de protection
- [ ] Context Auth React
- [ ] Hook useAuth

### Phase 3 : Dashboard ❌ À FAIRE
- [ ] Page Dashboard
- [ ] KPI Cards
- [ ] Graphiques
- [ ] Activités récentes
- [ ] Alertes

### Phase 4 : Gestion Produits ❌ À FAIRE
- [ ] Liste produits
- [ ] Formulaire création/édition
- [ ] Upload images (R2)
- [ ] Import CSV
- [ ] Routes API backend

### Phase 5 : Inventaire ❌ À FAIRE
- [ ] Vue stock en temps réel
- [ ] Mouvements de stock
- [ ] Ajustements
- [ ] Scanner codes-barres

### Phase 6 : Autres modules ❌ À FAIRE
- [ ] Commandes
- [ ] Emplacements
- [ ] Rapports
- [ ] Exports

### Phase 7 : Déploiement ❌ À FAIRE
- [ ] Configuration D1 en production
- [ ] Configuration R2
- [ ] Déploiement Cloudflare Pages
- [ ] Tests de production

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES

### Tables Principales (À créer avec Drizzle)

```sql
-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_price REAL,
  reorder_point INTEGER DEFAULT 10,
  image_url TEXT,
  supplier_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, sku)
);

-- Suppliers
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT
);

-- Locations
CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT,
  parent_id INTEGER,
  capacity INTEGER,
  UNIQUE(organization_id, code)
);

-- Inventory
CREATE TABLE inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, location_id)
);

-- Stock Movements
CREATE TABLE stock_movements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  location_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  type TEXT NOT NULL,
  reference TEXT,
  notes TEXT,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id INTEGER NOT NULL,
  order_number TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING',
  customer_name TEXT,
  total_amount REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, order_number)
);

-- Order Items
CREATE TABLE order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL
);
```

---

## 🚀 COMMANDES ESSENTIELLES

### Développement Local
```bash
npm run dev              # Lancer frontend (port 5173)
npm run dev:worker       # Lancer worker (port 8787)
npm run build            # Build production
npm run preview          # Preview build
```

### Base de données
```bash
npm run db:generate      # Générer migrations
npm run db:migrate       # Appliquer migrations en production
wrangler d1 migrations apply wmsforge-db --local  # Local
```

### Git
```bash
git add .
git commit -m "message"
git push
```

### Cloudflare
```bash
npx wrangler d1 create wmsforge-db           # Créer base D1
npx wrangler r2 bucket create wmsforge-uploads  # Créer bucket R2
npx wrangler pages deploy dist               # Déployer
```

---

## ⚠️ PROBLÈMES CONNUS ET SOLUTIONS

### Problème 1 : Architecture Node.js vs Workers
**Cause** : Le projet initial (WmsForge) était en Node.js classique  
**Solution** : Refonte complète avec architecture Workers  
**Statut** : Résolu par création wmsforge-v2

### Problème 2 : Erreur "border-border" Tailwind
**Cause** : Classe CSS non existante dans index.css  
**Solution** : Remplacer par `border-color: theme('colors.gray.200')`  
**Statut** : Résolu

### Problème 3 : tsconfig.node.json manquant
**Cause** : Configuration Vite incomplète  
**Solution** : Créer tsconfig.node.json avec config Vite  
**Statut** : Résolu

---

## 📝 PROCHAINES ÉTAPES RECOMMANDÉES

### Priorité Immédiate (Prochaine session)
1. **Créer la page Auth** (Login/Register)
2. **Développer le backend Auth** dans worker/
3. **Configurer D1** et créer le schéma avec Drizzle
4. **Tester le flow d'authentification** complet

### Ordre de développement suggéré
```
Phase 2: Auth → Phase 3: Dashboard → Phase 4: Produits → 
Phase 5: Inventaire → Phase 6: Autres modules → Phase 7: Déploiement
```

---

## 🔐 INFORMATIONS SENSIBLES

### IDs Cloudflare (Dans wrangler.toml)
```toml
database_id = "4f114494-537e-4c31-8271-79f3ee49dfed"  # D1 Database
bucket_name = "wmsforge-uploads"                       # R2 Bucket
```

### Variables d'environnement à définir
```bash
JWT_SECRET=           # À générer (32+ caractères aléatoires)
NODE_ENV=production   # Déjà dans wrangler.toml
```

---

## 👨‍💻 NOTES DÉVELOPPEUR

### Niveau de compétence
**Débutant** - Nécessite accompagnement pas à pas détaillé

### Préférences de style
- Commentaires en français
- Explications détaillées pour chaque étape
- Validation fréquente des résultats
- Style visuel : Claude.ai (minimaliste, blanc/gris/bleu)

### Méthode de travail efficace
1. Donner une commande à la fois
2. Attendre la validation avant de continuer
3. Expliquer le "pourquoi" de chaque action
4. Faire des commits Git réguliers

---

## 📚 RESSOURCES UTILES

### Documentation
- React: https://react.dev
- Vite: https://vitejs.dev
- Tailwind: https://tailwindcss.com
- Cloudflare Workers: https://developers.cloudflare.com/workers
- Drizzle ORM: https://orm.drizzle.team
- Hono: https://hono.dev

### Commandes de dépannage
```bash
# Réinstaller dépendances
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache Vite
rm -rf .vite

# Vérifier TypeScript
npx tsc --noEmit

# Linter
npx eslint src/
```

---

## 🎯 OBJECTIF FINAL

Application SaaS complète 1wms.io :
- ✅ Authentification multi-utilisateurs
- ✅ Multi-tenant (organizations)
- ✅ Gestion complète produits, inventaire, commandes
- ✅ Import/Export CSV
- ✅ Upload images (R2)
- ✅ Rapports détaillés
- ✅ Design minimaliste style Claude.ai
- ✅ Déployé sur Cloudflare (Pages + Workers + D1 + R2)
- ✅ Performance et scalabilité

---

**FIN DU MANIFESTE**

Pour reprendre le développement, commencez par:
1. Lire ce manifeste
2. Cloner le repo: `git clone https://github.com/YAMROUCHE/wmsforge-v2.git`
3. Installer: `npm install`
4. Lancer: `npm run dev`
5. Continuer avec Phase 2 (Authentification)
