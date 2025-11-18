# 🧪 Guide Rapide - Pour le Testeur

**Version** : 2.3.0
**Date** : 18 janvier 2025
**Durée estimée** : 1h30-2h00

---

## ⚡ Démarrage Ultra-Rapide (5 min)

### 1. Vérifier l'environnement
```bash
./verify-test-ready.sh
```

### 2. Démarrer l'application

**Terminal 1 - Frontend :**
```bash
npm run dev
```
✅ Attendre : `Local: http://localhost:5173/`

**Terminal 2 - Backend :**
```bash
npm run dev:worker
```
✅ Attendre : `Ready on http://localhost:8787`

### 3. Ouvrir l'application
```
http://localhost:5173
```

---

## 📚 Documentation

| Fichier | Description | Priorité |
|---------|-------------|----------|
| **GUIDE_TESTEUR.md** | Guide complet avec tous les scénarios de test | 🔴 PRIORITAIRE |
| CHECKLIST_TESTS.md | Checklist exhaustive par module | 🟠 Important |
| COMMENT_TESTER.md | Tests des fonctionnalités Enterprise | 🟡 Optionnel |
| KNOWN_ISSUES.md | Bugs connus (1 bug mineur non-bloquant) | 🟢 Info |

---

## 🎯 Tests Prioritaires (45 min)

### ✅ Test 1 : Parcours Complet (20 min)
1. S'inscrire (testeur1@test.com)
2. Configurer l'entrepôt
3. Créer produit, emplacement, stock
4. Créer commande
5. Créer vague et générer tâches
6. Compléter les tâches

➡️ **Objectif** : Valider le flux de bout en bout

### ✅ Test 2 : Multi-Tenant (10 min)
1. Créer 2 comptes (2 organisations différentes)
2. Vérifier isolation des données
3. Confirmer qu'aucune fuite de données

➡️ **Objectif** : CRITIQUE - Sécurité multi-tenant

### ✅ Test 3 : Fonctionnalités Enterprise (15 min)
1. Wave Management (vagues optimisées)
2. Task Management (génération automatique)
3. Labor Management (leaderboard, badges)

➡️ **Objectif** : Valider les 3 features clés

---

## 🐛 Bug Connu

**1 bug mineur non-bloquant** : Certaines vagues peuvent dépasser légèrement la limite configurée.
- Impact : Faible
- Workaround : Aucun nécessaire
- Détails : voir KNOWN_ISSUES.md

---

## ✅ Checklist Avant de Commencer

- [ ] Node.js v18+ installé
- [ ] `npm install` exécuté
- [ ] Script `./verify-test-ready.sh` réussi
- [ ] Les 2 serveurs démarrés (frontend + backend)
- [ ] http://localhost:5173 accessible
- [ ] http://localhost:8787/health retourne `{"status":"ok"}`
- [ ] Console navigateur ouverte (F12)

---

## 📊 Rapport de Test

À remplir dans **GUIDE_TESTEUR.md** (section "Rapport de Test")

**Format** :
- Tests réussis / échoués par module
- Liste des bugs trouvés avec sévérité
- Appréciation générale (interface, performance, UX)

---

## 🆘 Support

**En cas de problème** :
1. Vérifier la console navigateur (F12)
2. Vérifier les logs du terminal backend
3. Relancer `./verify-test-ready.sh`
4. Consulter GUIDE_TESTEUR.md section "Support"

---

## 🚀 C'est Parti !

1. ✅ Exécuter `./verify-test-ready.sh`
2. ✅ Démarrer les serveurs
3. ✅ Ouvrir **GUIDE_TESTEUR.md**
4. ✅ Commencer les tests !

**Bon test ! 🎯**
