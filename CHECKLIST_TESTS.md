# ✅ Checklist de Tests Manuels - WMSForge

## 🎯 Objectif
Cette checklist vous permet de tester **manuellement** toutes les fonctionnalités de l'application via l'interface utilisateur.

**Durée estimée** : 30-45 minutes pour l'ensemble des tests

---

## 📋 Pré-requis

- [ ] Les serveurs sont démarrés (frontend + backend)
- [ ] Frontend accessible sur http://localhost:5173
- [ ] Backend accessible sur http://localhost:8787
- [ ] Navigateur ouvert (Chrome, Firefox, Safari recommandé)
- [ ] Console développeur ouverte (F12) pour voir les erreurs éventuelles

---

## 🔐 1. AUTHENTIFICATION

### Test 1.1 : Inscription d'un nouvel utilisateur

- [ ] **Action** : Aller sur http://localhost:5173/auth?mode=register
- [ ] **Vérifier** : Le formulaire d'inscription s'affiche correctement
- [ ] **Action** : Remplir le formulaire :
  - Nom complet : `Jean Dupont`
  - Email : `jean.dupont@test.com`
  - Mot de passe : `password123`
  - Nom de l'organisation : `Test Enterprise`
- [ ] **Action** : Cliquer sur "S'inscrire"
- [ ] **Résultat attendu** : 
  - Message de succès affiché
  - Redirection automatique vers `/onboarding`
  - Vous êtes connecté (icône utilisateur en haut à droite)

### Test 1.2 : Déconnexion

- [ ] **Action** : Cliquer sur l'icône utilisateur en haut à droite
- [ ] **Action** : Cliquer sur "Déconnexion"
- [ ] **Résultat attendu** : 
  - Redirection vers `/auth`
  - Vous n'êtes plus connecté

### Test 1.3 : Connexion

- [ ] **Action** : Sur la page `/auth`, entrer les identifiants :
  - Email : `jean.dupont@test.com`
  - Mot de passe : `password123`
- [ ] **Action** : Cliquer sur "Se connecter"
- [ ] **Résultat attendu** :
  - Message de succès
  - Redirection vers `/dashboard`
  - Vous êtes connecté

### Test 1.4 : Protection des routes

- [ ] **Action** : Se déconnecter
- [ ] **Action** : Essayer d'accéder à http://localhost:5173/products
- [ ] **Résultat attendu** : Redirection automatique vers `/auth`

---

## 📦 2. PRODUITS

### Test 2.1 : Créer un produit

- [ ] **Action** : Se connecter et aller sur `/products`
- [ ] **Action** : Cliquer sur "+ Nouveau Produit"
- [ ] **Action** : Remplir le formulaire :
  - SKU : `PROD-001`
  - Nom : `Chaise de bureau`
  - Description : `Chaise ergonomique avec accoudoirs`
  - Catégorie : `Mobilier`
  - Prix unitaire : `150.00`
  - Point de réapprovisionnement : `10`
- [ ] **Action** : Cliquer sur "Créer"
- [ ] **Résultat attendu** :
  - Message de succès
  - Le produit apparaît dans la liste
  - Les détails sont corrects

### Test 2.2 : Rechercher un produit

- [ ] **Action** : Dans la barre de recherche, taper `PROD-001`
- [ ] **Résultat attendu** : Le produit "Chaise de bureau" apparaît

### Test 2.3 : Modifier un produit

- [ ] **Action** : Cliquer sur l'icône crayon du produit
- [ ] **Action** : Modifier le prix : `175.00`
- [ ] **Action** : Cliquer sur "Enregistrer"
- [ ] **Résultat attendu** :
  - Message de succès
  - Le prix est mis à jour dans la liste

### Test 2.4 : Supprimer un produit (optionnel)

- [ ] **Action** : Créer un deuxième produit `PROD-002`
- [ ] **Action** : Cliquer sur l'icône poubelle
- [ ] **Action** : Confirmer la suppression
- [ ] **Résultat attendu** :
  - Le produit disparaît de la liste

---

## 📍 3. EMPLACEMENTS

### Test 3.1 : Créer un emplacement

- [ ] **Action** : Aller sur `/locations`
- [ ] **Action** : Cliquer sur "+ Nouvel Emplacement"
- [ ] **Action** : Remplir le formulaire :
  - Code : `A-01-01`
  - Nom : `Allée A - Rack 1 - Étagère 1`
  - Type : `shelf`
  - Capacité : `100`
- [ ] **Action** : Cliquer sur "Créer"
- [ ] **Résultat attendu** :
  - Message de succès
  - L'emplacement apparaît dans la liste

### Test 3.2 : Consulter les statistiques

- [ ] **Action** : Aller dans l'onglet "Statistiques"
- [ ] **Résultat attendu** :
  - Total d'emplacements : 1
  - Type "shelf" : 1

---

## 📊 4. INVENTAIRE

### Test 4.1 : Recevoir du stock

- [ ] **Action** : Aller sur `/inventory`
- [ ] **Action** : Cliquer sur "Recevoir du stock"
- [ ] **Action** : Remplir le formulaire :
  - Produit : `Chaise de bureau`
  - Emplacement : `A-01-01`
  - Quantité : `50`
- [ ] **Action** : Cliquer sur "Recevoir"
- [ ] **Résultat attendu** :
  - Message de succès
  - Quantité mise à jour dans l'inventaire

### Test 4.2 : Consulter les mouvements de stock

- [ ] **Action** : Aller dans l'onglet "Mouvements"
- [ ] **Résultat attendu** :
  - Le mouvement "RECEIVE" apparaît
  - Quantité : 50
  - Produit : Chaise de bureau

### Test 4.3 : Ajuster le stock (sortie)

- [ ] **Action** : Retour à l'onglet "Inventaire"
- [ ] **Action** : Cliquer sur "Ajuster" pour le produit
- [ ] **Action** : Type : `Sortie`, Quantité : `10`, Notes : `Vente client`
- [ ] **Action** : Cliquer sur "Valider"
- [ ] **Résultat attendu** :
  - Quantité en stock : 40
  - Nouveau mouvement dans l'historique

---

## 🛒 5. COMMANDES

### Test 5.1 : Créer une commande

- [ ] **Action** : Aller sur `/orders`
- [ ] **Action** : Cliquer sur "+ Nouvelle Commande"
- [ ] **Action** : Remplir :
  - Numéro : `CMD-001`
  - Client : `ACME Corp`
  - Priorité : `normal`
- [ ] **Action** : Ajouter une ligne :
  - Produit : `Chaise de bureau`
  - Quantité : `5`
- [ ] **Action** : Cliquer sur "Créer"
- [ ] **Résultat attendu** :
  - Commande créée avec statut "pending"
  - Apparaît dans la liste

### Test 5.2 : Modifier le statut d'une commande

- [ ] **Action** : Cliquer sur le menu déroulant "Statut"
- [ ] **Action** : Sélectionner "processing"
- [ ] **Résultat attendu** :
  - Statut mis à jour immédiatement
  - Badge de couleur change

### Test 5.3 : Consulter les métriques

- [ ] **Action** : Regarder les statistiques en haut de la page
- [ ] **Résultat attendu** :
  - Total commandes : 1
  - En attente : 0 (si statut changé en processing)

---

## 🌊 6. VAGUES

### Test 6.1 : Créer une vague

- [ ] **Action** : Aller sur `/waves`
- [ ] **Action** : Cliquer sur "+ Nouvelle Vague"
- [ ] **Action** : Remplir :
  - Nom : `Vague Matin 17/11`
  - Priorité : `normal`
  - Zone : `A`
- [ ] **Action** : Sélectionner la commande `CMD-001`
- [ ] **Action** : Cliquer sur "Créer"
- [ ] **Résultat attendu** :
  - Vague créée avec statut "pending"
  - 1 commande incluse

### Test 6.2 : Lancer une vague

- [ ] **Action** : Cliquer sur "Lancer" pour la vague
- [ ] **Résultat attendu** :
  - Statut passe à "released"
  - Des tâches sont générées (vérifier dans `/tasks`)

---

## ✅ 7. TÂCHES

### Test 7.1 : Consulter les tâches générées

- [ ] **Action** : Aller sur `/tasks`
- [ ] **Résultat attendu** :
  - Des tâches de type "pick" apparaissent
  - Statut : "pending"

### Test 7.2 : Créer une tâche manuelle

- [ ] **Action** : Cliquer sur "+ Nouvelle Tâche"
- [ ] **Action** : Remplir :
  - Type : `move`
  - Priorité : `high`
  - Produit : `Chaise de bureau`
  - Quantité : `10`
  - De : `A-01-01`
  - Vers : `A-01-01` (même emplacement pour test)
- [ ] **Action** : Cliquer sur "Créer"
- [ ] **Résultat attendu** :
  - Tâche créée et visible dans la liste

### Test 7.3 : Mettre à jour le statut d'une tâche

- [ ] **Action** : Cliquer sur une tâche
- [ ] **Action** : Changer le statut à "in_progress"
- [ ] **Résultat attendu** :
  - Statut mis à jour
  - Métriques actualisées (tâches en cours +1)

---

## 👷 8. PERFORMANCE

### Test 8.1 : Ajouter un opérateur

- [ ] **Action** : Aller sur `/labor`
- [ ] **Action** : Cliquer sur "+ Nouvel Opérateur"
- [ ] **Action** : Remplir :
  - Nom : `Pierre Martin`
  - ID Employé : `EMP-001`
- [ ] **Action** : Cliquer sur "Créer"
- [ ] **Résultat attendu** :
  - Opérateur ajouté à la liste

### Test 8.2 : Consulter le leaderboard

- [ ] **Action** : Aller dans l'onglet "Leaderboard"
- [ ] **Résultat attendu** :
  - La page s'affiche (peut être vide si pas de performances enregistrées)

### Test 8.3 : Consulter les badges

- [ ] **Action** : Aller dans l'onglet "Badges"
- [ ] **Résultat attendu** :
  - Liste des badges disponibles affichée
  - Différents niveaux de rareté

---

## 🎨 9. INTERFACE & UX

### Test 9.1 : Mode sombre

- [ ] **Action** : Cliquer sur l'icône de mode sombre (lune/soleil)
- [ ] **Résultat attendu** :
  - Toute l'interface passe en mode sombre
  - Aucun texte n'est invisible (contraste correct)

### Test 9.2 : Sidebar

- [ ] **Action** : Cliquer sur l'icône de collapse de la sidebar
- [ ] **Résultat attendu** :
  - Sidebar se réduit
  - Icônes toujours visibles

### Test 9.3 : Navigation

- [ ] **Action** : Tester tous les liens de navigation
- [ ] **Résultat attendu** :
  - Chaque page se charge correctement
  - Pas d'erreur 404

---

## 🔒 10. MULTI-TENANT

### Test 10.1 : Créer une deuxième organisation

- [ ] **Action** : Se déconnecter
- [ ] **Action** : Créer un nouveau compte :
  - Email : `marie@autre.com`
  - Nom organisation : `Autre Entreprise`
- [ ] **Résultat attendu** :
  - Nouveau compte créé
  - Vous êtes connecté à cette nouvelle organisation

### Test 10.2 : Vérifier l'isolation des données

- [ ] **Action** : Aller sur `/products`
- [ ] **Résultat attendu** :
  - La liste de produits est VIDE
  - Vous ne voyez PAS les produits de "Test Enterprise"

- [ ] **Action** : Aller sur `/orders`
- [ ] **Résultat attendu** :
  - La liste de commandes est VIDE
  - Vous ne voyez PAS les commandes de "Test Enterprise"

### Test 10.3 : Créer des données dans la nouvelle organisation

- [ ] **Action** : Créer un produit `PROD-ORG2-001`
- [ ] **Action** : Se déconnecter
- [ ] **Action** : Se reconnecter avec le premier compte (`jean.dupont@test.com`)
- [ ] **Action** : Aller sur `/products`
- [ ] **Résultat attendu** :
  - Vous voyez `PROD-001` (votre produit)
  - Vous ne voyez PAS `PROD-ORG2-001` (produit de l'autre organisation)

### ✅ RÉSULTAT : Isolation multi-tenant fonctionnelle !

---

## 📱 11. RESPONSIVE (Optionnel)

### Test 11.1 : Mobile

- [ ] **Action** : Réduire la fenêtre du navigateur (< 768px)
- [ ] **Résultat attendu** :
  - Sidebar se transforme en menu hamburger
  - Tableaux s'adaptent (scroll horizontal si nécessaire)
  - Boutons accessibles

### Test 11.2 : Tablet

- [ ] **Action** : Taille moyenne (768px - 1024px)
- [ ] **Résultat attendu** :
  - Layout s'adapte correctement
  - Pas de débordement

---

## 🐛 12. GESTION D'ERREURS

### Test 12.1 : Formulaire incomplet

- [ ] **Action** : Essayer de créer un produit sans remplir le SKU
- [ ] **Résultat attendu** :
  - Message d'erreur affiché
  - Le formulaire ne se soumet pas

### Test 12.2 : Connexion échouée

- [ ] **Action** : Essayer de se connecter avec un mauvais mot de passe
- [ ] **Résultat attendu** :
  - Message d'erreur "Email ou mot de passe invalide"
  - Vous restez sur la page de connexion

### Test 12.3 : Token expiré (simuler)

- [ ] **Action** : Ouvrir la console navigateur (F12)
- [ ] **Action** : `localStorage.removeItem('wms_auth_token')`
- [ ] **Action** : Rafraîchir la page
- [ ] **Action** : Essayer d'accéder à `/products`
- [ ] **Résultat attendu** :
  - Redirection vers `/auth`

---

## ✅ RÉSULTAT FINAL

### Statistiques

- **Tests réussis** : __ / __
- **Tests échoués** : __
- **Bugs trouvés** : __

### Notes et Observations

```
Notez ici vos observations :
- ...
- ...
- ...
```

### Actions correctives

```
Si des bugs sont trouvés :
1. Décrire le bug
2. Reproduire les étapes
3. Vérifier la console développeur (erreurs JS)
4. Créer un ticket GitHub
```

---

**Date du test** : ___________  
**Testeur** : ___________  
**Version** : 2.0.0

🎉 **Félicitations ! Vous avez terminé tous les tests manuels !**
