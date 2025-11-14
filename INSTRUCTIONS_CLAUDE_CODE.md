# 🚀 INSTRUCTIONS POUR CLAUDE CODE

**Date** : 18 octobre 2025  
**Projet** : 1wms.io - Warehouse Management System  
**Développeur** : Amrouche (Débutant)

---

## 📋 MESSAGE À COPIER DANS CLAUDE CODE
```
Bonjour Claude ! Je reprends le développement de 1wms.io sur Claude Code.

📦 CONTEXTE DU PROJET :
Application SaaS de gestion d'entrepôt (WMS) construite avec :
- Frontend : React 18 + TypeScript + Tailwind CSS + Vite
- Backend : Cloudflare Workers + Hono + JWT
- Database : Cloudflare D1 (SQLite)
- Repository : https://github.com/YAMROUCHE/wmsforge-v2

📊 ÉTAT ACTUEL :
✅ Phase 1-6 terminées (67% du projet)
✅ Module Inventory 100% fonctionnel (réception, mouvements, ajustements)
✅ Sidebar de navigation créé (style Claude.ai)
✅ 4 pages placeholder créées : Orders, Locations, Reports, Settings

⚠️ CE QUI RESTE À FAIRE :
- Finaliser routes dans App.tsx pour les 4 nouvelles pages
- Phase 7 : Module Commandes (priorité)
- Phases 8-14 : Voir TODO - Vision Game Changer.md

📋 DOCUMENTS IMPORTANTS À LIRE :
1. MANIFESTE 1wms.io v2.2.3 - 18 octobre 2025.md (état complet du projet)
2. TODO - Vision Game Changer.md (feuille de route)
3. INSTRUCTIONS_STRICTES.md (méthodologie de travail)

🎯 MÉTHODOLOGIE STRICTE :
- ❌ NE JAMAIS modifier du code sans demander d'abord
- ✅ TOUJOURS utiliser `cat > fichier << 'EOF'` avec code COMPLET
- ✅ TOUJOURS faire `wc -l fichier` après création
- ✅ Commits fréquents : git add . && git commit -m "..." && git push
- ✅ Je suis DÉBUTANT : explications détaillées requises

🚀 OBJECTIF IMMÉDIAT :
Continuer le développement où on s'est arrêté. 
Peux-tu d'abord lire les 3 documents mentionnés et me dire ce que tu comprends de l'état du projet ?
```

---

## 🔧 COMMANDES ESSENTIELLES

### Démarrage
```bash
cd ~/wmsforge-v2
npm run dev              # Frontend sur port 5174
npm run dev:worker       # Backend sur port 8787
```

### Base de données
```bash
# Appliquer migrations
npx wrangler d1 migrations apply wmsforge-db --local

# Inspecter tables
npx wrangler d1 execute wmsforge-db --local --command "SELECT * FROM inventory"
npx wrangler d1 execute wmsforge-db --local --command "PRAGMA table_info(stock_movements)"
```

### Git
```bash
git status
git add .
git commit -m "type: description"
git push
```

---

## 📂 STRUCTURE DU PROJET
```
wmsforge-v2/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Input
│   │   └── layout/          # Sidebar ✅, Header
│   ├── pages/
│   │   ├── Landing.tsx      ✅ Page d'accueil
│   │   ├── Auth.tsx         ✅ Login/Register
│   │   ├── Dashboard.tsx    ✅ Dashboard principal
│   │   ├── Products.tsx     ✅ Gestion produits
│   │   ├── Inventory.tsx    ✅ Gestion inventaire (100%)
│   │   ├── Orders.tsx       ⚠️ Placeholder "Bientôt"
│   │   ├── Locations.tsx    ⚠️ Placeholder "Bientôt"
│   │   ├── Reports.tsx      ⚠️ Placeholder "Bientôt"
│   │   ├── Settings.tsx     ⚠️ Placeholder "Bientôt"
│   │   ├── Onboarding.tsx   ✅ Wizard configuration
│   │   └── WarehouseDashboard.tsx ✅ Vue 3D entrepôt
│   ├── contexts/
│   │   └── AuthContext.tsx  ✅ Context authentification
│   ├── hooks/
│   │   └── useAuth.ts       ✅ Hook authentification
│   └── App.tsx              ✅ Routes principales
│
├── worker/
│   └── src/
│       ├── index.ts         ✅ Point d'entrée Hono
│       └── routes/
│           ├── auth.ts      ✅ Routes authentification
│           ├── products.ts  ✅ Routes produits
│           ├── inventory.ts ✅ Routes inventaire (71 lignes)
│           └── locations.ts ✅ Routes emplacements
│
├── db/
│   ├── schema.ts            ✅ Schéma Drizzle (106 lignes)
│   └── migrations/          ✅ Migrations SQL
│
└── DOCS/
    ├── MANIFESTE 1wms.io v2.2.3.md
    ├── TODO - Vision Game Changer.md
    └── INSTRUCTIONS_STRICTES.md
```

---

## 🎯 PROCHAINES TÂCHES (Phase 7)

### 1. Backend - Routes Orders (2-3 jours)

**Fichier** : `worker/src/routes/orders.ts`
```typescript
// Routes à créer
GET    /api/orders              // Liste commandes
POST   /api/orders              // Créer commande
GET    /api/orders/:id          // Détails
PUT    /api/orders/:id/status   // Changer statut
DELETE /api/orders/:id          // Supprimer
POST   /api/orders/:id/items    // Ajouter lignes
GET    /api/orders/stats        // Statistiques
```

**Schéma BDD** : Tables `orders` et `order_items` déjà créées dans migration 0000

### 2. Frontend - Page Orders (2-3 jours)

**Fichier** : `src/pages/Orders.tsx` (remplacer placeholder)

**Composants nécessaires** :
- Liste commandes (tableau filtrable)
- Modal création commande
- Modal détails commande
- Statuts visuels (badges colorés)

### 3. Tests End-to-End (1 jour)

- Créer une commande
- Ajouter des produits
- Changer le statut
- Vérifier impact sur stock

---

## ⚠️ PIÈGES À ÉVITER

### 1. Schéma BDD vs Drizzle
Le schéma `db/schema.ts` ne correspond pas toujours à la BDD réelle.
**Solution** : Toujours vérifier avec `PRAGMA table_info(table_name)`

### 2. Drizzle + D1 = Problèmes
Drizzle ORM ne fonctionne pas toujours bien avec D1.
**Solution** : Utiliser SQL brut si besoin

### 3. Ports
- Frontend : 5174 (pas 5173, déjà pris)
- Backend : 8787 (CRITIQUE, ne pas changer)

### 4. Modifications partielles
Ne JAMAIS utiliser `sed`, `awk`, etc.
**Solution** : TOUJOURS `cat > fichier << 'EOF'` avec code complet

---

## 🔐 INFORMATIONS TECHNIQUES

### API Endpoints Fonctionnels
```
✅ POST /auth/register
✅ POST /auth/login
✅ GET  /auth/me

✅ GET    /api/products
✅ POST   /api/products
✅ PUT    /api/products/:id
✅ DELETE /api/products/:id

✅ GET  /api/inventory
✅ GET  /api/inventory/movements
✅ POST /api/inventory/receive      (testé : 100 unités)
✅ POST /api/inventory/move
✅ POST /api/inventory/adjust

✅ GET  /api/locations
✅ POST /api/locations
```

### Données de Test en BDD
```sql
-- 1 organisation
INSERT INTO organizations VALUES (1, 'Mon Entrepôt', ...);

-- 1 utilisateur
INSERT INTO users VALUES (1, 1, 'Amrouche', 'amrouche@test.com', ...);

-- 1 produit
INSERT INTO products VALUES (1, 1, 'SKU001', 'Dupont', ...);

-- 2 emplacements
INSERT INTO locations VALUES (1, 1, 'A-01-01', ...);
INSERT INTO locations VALUES (2, 1, 'A-01-02', ...);

-- 2 lignes de stock (138 unités total)
INSERT INTO inventory VALUES (1, 1, 1, 1, 38, ...);
INSERT INTO inventory VALUES (2, 1, 1, 2, 100, ...);
```

---

## 📚 RESSOURCES UTILES

### Documentation
- Cloudflare Workers : https://developers.cloudflare.com/workers
- Hono Framework : https://hono.dev
- Drizzle ORM : https://orm.drizzle.team
- React Router : https://reactrouter.com

### Design Inspiration
- Linear : https://linear.app (UX keyboard-first)
- Claude.ai : https://claude.ai (sidebar navigation)
- Notion : https://notion.so (editor experience)

---

## 🎨 DESIGN SYSTEM

### Couleurs
```css
Background: #FFFFFF
Text primary: #000000
Text secondary: #6B7280
Accent: #2563EB (bleu)
Border: #E5E7EB
Hover: #F3F4F6
Success: #10B981 (vert)
Error: #EF4444 (rouge)
Warning: #F59E0B (orange)
```

### Composants UI
- `Button` : variants (primary, secondary, ghost)
- `Input` : avec label et validation
- `Sidebar` : collapsible avec icônes

### Spacing
- Padding : p-4 (1rem), p-6 (1.5rem)
- Margin : m-4, m-6
- Gap : gap-4, gap-6

---

## 🚀 TIPS POUR CLAUDE CODE

### 1. Terminal Intégré
Claude Code a accès direct au terminal. Il peut :
- Exécuter des commandes
- Lire des fichiers
- Créer des fichiers
- Faire des commits Git

### 2. Context Complet
Claude Code voit toute l'arborescence du projet.
Lui demander : "Montre-moi la structure" ou "Liste les fichiers dans src/pages"

### 3. Multi-fichiers
Claude Code peut modifier plusieurs fichiers d'un coup.
Pratique pour : backend + frontend + types en même temps

### 4. Debugging
Il peut :
- Lire les logs
- Analyser les erreurs
- Proposer des fixes

### 5. Tests
Il peut lancer les tests et interpréter les résultats.

---

## ✅ CHECKLIST AVANT DE COMMENCER

- [ ] Claude Code installé
- [ ] Dossier wmsforge-v2 ouvert dans Claude Code
- [ ] Les 3 documents lus (MANIFESTE, TODO, INSTRUCTIONS_STRICTES)
- [ ] Git à jour (dernier commit : "feat: ajouter sidebar navigation...")
- [ ] npm run dev et npm run dev:worker fonctionnent

---

## 🎯 PREMIER OBJECTIF AVEC CLAUDE CODE

**Tâche** : Créer le module Commandes (Phase 7)

**Étapes** :
1. Backend : Routes orders (worker/src/routes/orders.ts)
2. Frontend : Page Orders fonctionnelle (src/pages/Orders.tsx)
3. Tests : Créer une commande end-to-end
4. Commit + Push

**Durée estimée** : 1-2 jours

---

## 📞 SUPPORT

En cas de blocage :
- Relire MANIFESTE 1wms.io v2.2.3.md
- Relire TODO - Vision Game Changer.md
- Vérifier git status
- Demander à Claude Code d'expliquer l'erreur

---

**Bonne chance ! 🚀**

_"Ship fast, ship quality, delight users."_
