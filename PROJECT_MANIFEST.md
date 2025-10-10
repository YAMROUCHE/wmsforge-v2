# 📦 MANIFESTE DE PROJET - 1wms.io
## Document de continuité pour reprise de développement

**Date de création** : 10 octobre 2025  
**Version** : 2.0.2  
**Développeur** : Amrouche (Débutant)  
**Repository GitHub** : https://github.com/YAMROUCHE/wmsforge-v2  
**Statut actuel** : Phase 2 terminée - Backend Auth 100% fonctionnel ✅

---

## 🚨 CONSIGNES STRICTES DE DÉVELOPPEMENT

**Ces règles DOIVENT être respectées à chaque étape :**

1. ✅ **Respect absolu du manifeste** : Toujours suivre l'architecture et les instructions définies
2. ✅ **Pas de modification sans accord** : Ne JAMAIS modifier le code sans en parler d'abord
3. ✅ **Sauvegardes systématiques** : 
   - Sauvegarde locale : `git add . && git commit -m "message"`
   - Sauvegarde GitHub : `git push`
   - Fréquence : Après chaque fonctionnalité complète
4. ✅ **Méthode CAT obligatoire** : Toujours utiliser `cat > fichier << 'EOF'` avec le code COMPLET
5. ✅ **Vérification du nombre de lignes** : Toujours compter les lignes avant déploiement avec `wc -l fichier`
6. ✅ **Monitoring des tokens** : 
   - Afficher le nombre de tokens restants régulièrement
   - Alerter si < 20,000 tokens restants
7. ✅ **Mise à jour du manifeste** : Mettre à jour ce document après chaque phase complétée

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

### Stack Technique

**Frontend**
- React 18.3.1 avec TypeScript
- Vite 5.3.4 comme bundler
- Tailwind CSS 3.4.7 pour le styling
- React Router 6.26.0
- TanStack Query pour la gestion d'état
- Lucide React pour les icônes

**Backend ✅ FONCTIONNEL**
- Cloudflare Workers avec Hono 4.5.0
- TypeScript strict
- Architecture RESTful API
- JWT pour l'authentification (implémentation custom Web Crypto)
- SHA-256 pour le hash des mots de passe
- Routes : /auth/register, /auth/login, /auth/me

**Base de données ✅ CONFIGURÉE**
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

```
wmsforge-v2/
├── src/
│   ├── components/
│   │   ├── ui/                    ✅ Button.tsx, Input.tsx
│   │   ├── layout/                ✅ Header.tsx
│   │   └── dashboard/             ❌ À créer
│   ├── pages/
│   │   ├── Landing.tsx            ✅ Terminé
│   │   ├── Auth.tsx               ✅ Terminé (Login/Register UI)
│   │   ├── Dashboard.tsx          ❌ À créer
│   │   ├── Products.tsx           ❌ À créer
│   │   ├── Inventory.tsx          ❌ À créer
│   │   ├── Orders.tsx             ❌ À créer
│   │   ├── Locations.tsx          ❌ À créer
│   │   └── Reports.tsx            ❌ À créer
│   ├── hooks/                     ❌ À créer (useAuth)
│   ├── lib/
│   │   ├── utils.ts               ✅ Terminé
│   │   └── api.ts                 ❌ À créer
│   ├── App.tsx                    ✅ Routes Landing + Auth
│   ├── main.tsx                   ✅ Terminé
│   └── index.css                  ✅ Tailwind + Style Claude.ai
│
├── worker/                        ✅ COMPLET ET TESTÉ
│   ├── src/
│   │   ├── index.ts               ✅ Point d'entrée Hono (41 lignes)
│   │   ├── routes/
│   │   │   └── auth.ts            ✅ Register + Login + Me (202 lignes)
│   │   └── utils/
│   │       ├── jwt.ts             ✅ Création/Vérification JWT (76 lignes)
│   │       └── password.ts        ✅ Hash + Validation (36 lignes)
│   └── tsconfig.json              ✅ Config TypeScript Worker
│
├── db/
│   ├── schema.ts                  ✅ Schéma Drizzle complet (106 lignes)
│   └── migrations/                ✅ Migration SQL appliquée
│       └── 0000_boring_mattie_franklin.sql
│
├── wrangler.toml                  ✅ Configuré (migrations_dir corrigé)
├── drizzle.config.ts              ✅ Config Drizzle
├── package.json                   ✅ Dépendances installées
├── PROJECT_MANIFEST.md            ✅ Ce fichier
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
- [x] Consignes strictes intégrées au manifeste

### Phase 2 : Authentification ✅ TERMINÉ (100%)
- [x] Page Auth (Login/Register) - Frontend
- [x] Schéma de base de données (Drizzle) - 9 tables
- [x] Backend Auth avec JWT (Worker Hono)
- [x] Routes /auth/register et /auth/login
- [x] Hash des mots de passe (SHA-256)
- [x] Validation des données
- [x] Migrations générées et appliquées en local
- [x] Tests réussis (Register + Login)
- [ ] Connecter le frontend au backend ⬅️ PROCHAIN
- [ ] Context Auth React
- [ ] Hook useAuth
- [ ] Middleware de protection des routes
- [ ] Page Dashboard basique pour tester l'auth

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

## 🗄️ SCHÉMA DE BASE DE DONNÉES ✅ CRÉÉ

### Tables Créées et Testées

**organizations** - Organisations (multi-tenant) ✅  
**users** - Utilisateurs avec hash de mot de passe ✅  
**products** - Catalogue produits ✅  
**suppliers** - Fournisseurs ✅  
**locations** - Emplacements d'entrepôt ✅  
**inventory** - Stock par produit et emplacement ✅  
**stock_movements** - Historique des mouvements ✅  
**orders** - Commandes clients/fournisseurs ✅  
**order_items** - Lignes de commande ✅

---

## 🚀 COMMANDES ESSENTIELLES

### Développement Local
```bash
npm run dev              # Lancer frontend (port 5173)
npm run dev:worker       # Lancer worker (port 8787)
npm run build            # Build frontend
npm run build:worker     # Build worker
npm run preview          # Preview build
```

### Base de données
```bash
npm run db:generate      # Générer migrations Drizzle
npm run db:migrate       # Appliquer migrations en production
npx wrangler d1 migrations apply wmsforge-db --local  # Migrations locales ✅ FAIT
```

### Tests API ✅ TESTÉS
```bash
# Health check
curl http://localhost:8787/health

# Register
curl -X POST http://localhost:8787/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"User","email":"user@test.com","password":"pass123","organizationName":"Org"}'

# Login
curl -X POST http://localhost:8787/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"pass123"}'
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

## ⚠️ PROBLÈMES RÉSOLUS

### Problème 1 : Architecture Node.js vs Workers
**Cause** : Le projet initial (WmsForge) était en Node.js classique  
**Solution** : Refonte complète avec architecture Workers  
**Statut** : ✅ Résolu

### Problème 2 : Erreur "border-border" Tailwind
**Cause** : Classe CSS non existante dans index.css  
**Solution** : Remplacer par `border-color: theme('colors.gray.200')`  
**Statut** : ✅ Résolu

### Problème 3 : tsconfig.node.json manquant
**Cause** : Configuration Vite incomplète  
**Solution** : Créer tsconfig.node.json avec config Vite  
**Statut** : ✅ Résolu

### Problème 4 : migrations_dir mal placé dans wrangler.toml
**Cause** : migrations_dir au niveau racine au lieu de [[d1_databases]]  
**Solution** : Déplacer dans la section [[d1_databases]]  
**Statut** : ✅ Résolu

### Problème 5 : Tables non créées (no such table: users)
**Cause** : Migrations générées mais pas appliquées  
**Solution** : `npx wrangler d1 migrations apply wmsforge-db --local`  
**Statut** : ✅ Résolu

---

## 📝 PROCHAINES ÉTAPES RECOMMANDÉES

### Priorité Immédiate (Prochaine session)
1. **Créer le client API** (src/lib/api.ts)
2. **Créer le Context Auth** pour gérer l'état de connexion globalement
3. **Créer le hook useAuth** pour accéder facilement à l'auth
4. **Connecter la page Auth** au backend
5. **Créer une page Dashboard simple** pour tester l'authentification complète
6. **Tester le flow complet** : Register → Login → Dashboard → Logout

### Ordre de développement suggéré
```
Phase 2: Auth (finaliser) → Phase 3: Dashboard → Phase 4: Produits → 
Phase 5: Inventaire → Phase 6: Autres modules → Phase 7: Déploiement
```

---

## 🔐 INFORMATIONS SENSIBLES

### IDs Cloudflare (Dans wrangler.toml)
```toml
database_id = "4f114494-537e-4c31-8271-79f3ee49dfed"  # D1 Database
bucket_name = "wmsforge-uploads"                       # R2 Bucket
JWT_SECRET = "whsec_a8f3b2c1d4e5f6g7h8i9j0k1l2m3n4o5" # JWT Secret
migrations_dir = "db/migrations"                       # Chemin migrations
```

---

## 🔌 API ENDPOINTS ✅ FONCTIONNELS

### Authentification
- `POST /auth/register` - Créer un compte ✅ TESTÉ
- `POST /auth/login` - Se connecter ✅ TESTÉ
- `GET /auth/me` - Vérifier le token (À implémenter complètement)

### Santé
- `GET /health` - Health check ✅ TESTÉ

---

## 📊 STATISTIQUES DU CODE

**Backend Worker :** 488 lignes au total
- worker/src/index.ts : 41 lignes
- worker/src/routes/auth.ts : 202 lignes
- worker/src/utils/jwt.ts : 76 lignes
- worker/src/utils/password.ts : 36 lignes
- db/schema.ts : 106 lignes
- drizzle.config.ts : 13 lignes
- worker/tsconfig.json : 14 lignes

**Frontend :** ~400 lignes
- Pages (Landing, Auth)
- Composants UI (Button, Input, Header)

**Total projet :** ~900 lignes de code

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

# Lister les fichiers
tree -L 3 -I 'node_modules|dist'
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

**DERNIÈRE MISE À JOUR** : 10 octobre 2025 - Phase 2 TERMINÉE (100%) ✅

**FIN DU MANIFESTE**
