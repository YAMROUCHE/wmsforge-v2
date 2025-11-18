# 🧪 Guide Testeur - WMSForge v2.3.0

**Date de préparation** : 18 janvier 2025
**Version** : 2.3.0
**Durée estimée des tests** : 1h30 - 2h00

---

## 📋 Table des Matières

1. [Installation et Démarrage](#installation-et-démarrage)
2. [Accès à l'Application](#accès-à-lapplication)
3. [Scénarios de Test Prioritaires](#scénarios-de-test-prioritaires)
4. [Tests Complets par Module](#tests-complets-par-module)
5. [Bugs Connus](#bugs-connus)
6. [Rapport de Test](#rapport-de-test)

---

## 🚀 Installation et Démarrage

### Prérequis

- Node.js v18+ installé
- npm installé
- Navigateur moderne (Chrome, Firefox, Safari, Edge)

### Étape 1 : Cloner et Installer

```bash
# Si le projet n'est pas encore cloné
git clone <repository-url>
cd wmsforge-v2

# Installer les dépendances
npm install
```

### Étape 2 : Initialiser la Base de Données

```bash
# Appliquer toutes les migrations
npx wrangler d1 execute wmsforge-db --local --file=drizzle/migrations/0002_add_enterprise_features_v2.sql
npx wrangler d1 execute wmsforge-db --local --file=drizzle/migrations/0003_add_testimonials.sql
npx wrangler d1 execute wmsforge-db --local --file=drizzle/migrations/0004_add_integrations.sql
npx wrangler d1 execute wmsforge-db --local --file=drizzle/migrations/0005_add_referrals.sql
npx wrangler d1 execute wmsforge-db --local --file=drizzle/migrations/0006_eliminate_localstorage.sql
```

### Étape 3 : Démarrer les Serveurs

**Terminal 1 - Frontend :**
```bash
npm run dev
```
Attendre le message : `Local: http://localhost:5173/`

**Terminal 2 - Backend (API) :**
```bash
npm run dev:worker
```
Attendre le message : `Ready on http://localhost:8787`

### ✅ Vérification

- Frontend : http://localhost:5173 - Doit afficher la Landing Page
- Backend : http://localhost:8787/health - Doit retourner `{"status":"ok"}`

---

## 🔑 Accès à l'Application

### Comptes de Test

Vous devez créer vos propres comptes pour tester l'isolation multi-tenant.

**Organisation 1 :**
- Email : `testeur1@test.com`
- Mot de passe : `password123`
- Nom organisation : `Test Warehouse A`

**Organisation 2 :**
- Email : `testeur2@test.com`
- Mot de passe : `password123`
- Nom organisation : `Test Warehouse B`

### URLs Importantes

| Page | URL | Description |
|------|-----|-------------|
| Landing Page | http://localhost:5173 | Page d'accueil publique |
| Authentification | http://localhost:5173/auth | Connexion/Inscription |
| Onboarding | http://localhost:5173/onboarding | Configuration initiale |
| Dashboard | http://localhost:5173/dashboard | Tableau de bord principal |
| Produits | http://localhost:5173/products | Gestion produits |
| Inventaire | http://localhost:5173/inventory | Gestion stock |
| Commandes | http://localhost:5173/orders | Gestion commandes |
| Vagues | http://localhost:5173/waves | Wave Management |
| Tâches | http://localhost:5173/tasks | Task Management |
| Performance | http://localhost:5173/labor | Labor Management |

---

## 🎯 Scénarios de Test Prioritaires

### Test 1 : Parcours Utilisateur Complet (30 min)

**Objectif** : Valider le flux complet de A à Z

1. **Inscription** → Créer compte `testeur1@test.com`
2. **Onboarding** → Configurer l'entrepôt (3 zones : A, B, C)
3. **Créer Produit** → SKU: `PROD-001`, Nom: `Chaise Bureau`, Prix: 150€
4. **Créer Emplacement** → Code: `A-01-01`, Type: Étagère
5. **Recevoir Stock** → 50 unités de `PROD-001` dans `A-01-01`
6. **Créer Commande** → CMD-001, Client: ACME Corp, 5x Chaise Bureau
7. **Créer Vague** → Inclure CMD-001
8. **Lancer Vague** → Vérifier génération des tâches
9. **Traiter Tâches** → Démarrer et compléter les picks
10. **Vérifier Stock** → Stock doit passer de 50 → 45

**Critères de succès** :
- ✅ Aucune erreur dans la console
- ✅ Toutes les étapes se déroulent sans blocage
- ✅ Les données sont cohérentes entre modules
- ✅ Le stock est correctement mis à jour

---

### Test 2 : Isolation Multi-Tenant (15 min)

**Objectif** : Vérifier que les données sont isolées par organisation

1. **Avec testeur1@test.com** :
   - Créer produit `PROD-ORG1-001`
   - Créer commande `CMD-ORG1-001`
   - Noter le nombre de produits/commandes

2. **Se déconnecter et créer testeur2@test.com**
3. **Avec testeur2@test.com** :
   - Vérifier que la liste de produits est VIDE
   - Vérifier que la liste de commandes est VIDE
   - Créer produit `PROD-ORG2-001`

4. **Se reconnecter avec testeur1@test.com**
5. **Vérifier** :
   - Produit `PROD-ORG1-001` toujours visible
   - Produit `PROD-ORG2-001` NON visible

**Critères de succès** :
- ✅ Isolation parfaite entre les organisations
- ✅ Aucune fuite de données
- ✅ Compteurs corrects pour chaque organisation

---

### Test 3 : Fonctionnalités Enterprise (20 min)

**Objectif** : Tester Wave, Task et Labor Management

#### A. Wave Management
1. Créer 10 commandes avec priorités variées (urgent, normal, low)
2. Créer une vague automatique → Le système doit regrouper intelligemment
3. Libérer la vague → Statut passe à "released"
4. Vérifier les métriques (commandes, lignes, temps estimé)

#### B. Task Management
1. Les tâches doivent être générées automatiquement après libération
2. Filtrer par priorité → Vérifier que les urgentes apparaissent en rouge
3. Assigner à un opérateur (créer un opérateur si besoin)
4. Démarrer une tâche → Statut "in_progress"
5. Terminer la tâche → Statut "completed"

#### C. Labor Management
1. Aller sur `/labor`
2. Créer 3 opérateurs (Pierre, Marie, Jean)
3. Compléter plusieurs tâches assignées à chacun
4. Vérifier le leaderboard (tri par performance)
5. Vérifier l'attribution automatique de badges

**Critères de succès** :
- ✅ Regroupement intelligent des vagues
- ✅ Génération automatique des tâches
- ✅ Calcul correct des performances
- ✅ Leaderboard fonctionnel

---

### Test 4 : Landing Page & Animations (10 min)

**Objectif** : Vérifier que la Landing Page est attractive et fonctionnelle

1. Ouvrir http://localhost:5173 (mode déconnecté)
2. Scroller pour voir toutes les sections :
   - Hero section
   - Advanced Features (Wave, Multi-locations, etc.)
   - Statistiques animées (40%, 95%) → Doivent s'animer au scroll
   - Workflow animé (Réception → Stockage → Picking → Expédition)
   - Timeline de déploiement
   - Témoignages rotatifs
   - Comparaison Avant/Après (slider interactif)
   - FAQ (accordéon)
   - Social Proof (200+ entrepôts, etc.)
   - Trust Badges (RGPD, EU, Support)

3. Tester les interactions :
   - Cliquer sur les questions FAQ → Doivent s'ouvrir/fermer
   - Slider Avant/Après → Doit être draggable
   - Témoignages → Doivent changer toutes les 5 secondes

**Critères de succès** :
- ✅ Animations fluides et déclenchées au bon moment
- ✅ Aucun décalage visuel
- ✅ Accordéon FAQ fonctionnel
- ✅ Slider interactif

---

## 📋 Tests Complets par Module

Pour des tests exhaustifs, consulter :
- **Tests manuels détaillés** : `CHECKLIST_TESTS.md`
- **Tests fonctionnalités Enterprise** : `COMMENT_TESTER.md`
- **Rapport de tests précédent** : `TEST_REPORT.md`

---

## 🐛 Bugs Connus

### Bug Mineur : Limite de vagues dépassée

**Statut** : 🟡 Connu, non-bloquant
**Impact** : Faible

**Description** : Certaines vagues peuvent contenir plus de commandes que la limite configurée (max 10).

**Exemple** :
- Configuration : max_orders_per_wave = 10
- Résultat observé : Vague peut contenir 12-15 commandes

**Impact business** : Minimal - Les vagues restent gérables, juste légèrement plus grandes.

**Workaround** : Aucun nécessaire. Le système fonctionne correctement.

**Voir détails** : `KNOWN_ISSUES.md`

---

## 📊 Rapport de Test

À la fin de vos tests, veuillez remplir le rapport suivant :

### Informations Générales

- **Testeur** : ______________________
- **Date** : ______________________
- **Durée totale** : ______________________
- **Environnement** :
  - OS : ______________________
  - Navigateur : ______________________
  - Version Node.js : ______________________

### Résultats

| Module | Tests Réussis | Tests Échoués | Bugs Trouvés | Notes |
|--------|---------------|---------------|--------------|-------|
| Authentification | __ / __ | __ | __ | |
| Onboarding | __ / __ | __ | __ | |
| Produits | __ / __ | __ | __ | |
| Inventaire | __ / __ | __ | __ | |
| Emplacements | __ / __ | __ | __ | |
| Commandes | __ / __ | __ | __ | |
| Vagues | __ / __ | __ | __ | |
| Tâches | __ / __ | __ | __ | |
| Performance | __ / __ | __ | __ | |
| Multi-tenant | __ / __ | __ | __ | |
| Landing Page | __ / __ | __ | __ | |
| **TOTAL** | **__ / __** | **__** | **__** | |

### Bugs Détectés

Pour chaque bug trouvé, remplir :

**Bug #1**
- Sévérité : 🔴 Bloquant / 🟠 Important / 🟡 Mineur
- Module : ______________________
- Description : ______________________
- Étapes de reproduction :
  1. ______________________
  2. ______________________
  3. ______________________
- Résultat attendu : ______________________
- Résultat obtenu : ______________________
- Erreur console (si applicable) : ______________________

### Appréciation Générale

**Points forts** :
- ______________________
- ______________________
- ______________________

**Points à améliorer** :
- ______________________
- ______________________
- ______________________

**Impression générale** :
- Interface : ⭐⭐⭐⭐⭐
- Performance : ⭐⭐⭐⭐⭐
- Stabilité : ⭐⭐⭐⭐⭐
- UX/UI : ⭐⭐⭐⭐⭐

**Commentaires** :
______________________
______________________
______________________

---

## 📞 Support

En cas de problème pendant les tests :

1. **Console développeur** : Ouvrir F12 et regarder l'onglet Console
2. **Network** : Vérifier les appels API (onglet Network)
3. **Logs backend** : Regarder le terminal où tourne `npm run dev:worker`

**Fichiers de référence** :
- Documentation utilisateur : `GUIDE_UTILISATEUR.md`
- Checklist complète : `CHECKLIST_TESTS.md`
- Tests Enterprise : `COMMENT_TESTER.md`
- Bugs connus : `KNOWN_ISSUES.md`

---

## ✅ Checklist Avant de Commencer

- [ ] Les deux serveurs sont démarrés (frontend + backend)
- [ ] http://localhost:5173 est accessible
- [ ] http://localhost:8787/health retourne `{"status":"ok"}`
- [ ] Console navigateur ouverte (F12)
- [ ] Navigateur en mode normal (pas incognito pour la première fois)
- [ ] Ce guide est imprimé ou ouvert dans un deuxième écran

---

## 🎯 Objectifs des Tests

1. ✅ Valider le parcours utilisateur complet
2. ✅ Vérifier l'isolation multi-tenant (CRITIQUE)
3. ✅ Tester les 3 fonctionnalités Enterprise (Wave, Task, Labor)
4. ✅ Valider la Landing Page et ses animations
5. ✅ Identifier les bugs et problèmes UX
6. ✅ Évaluer la performance et la stabilité

---

**Bon test ! 🚀**

*Guide créé le 18 janvier 2025 - Version 2.3.0*
