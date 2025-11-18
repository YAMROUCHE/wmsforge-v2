# 📖 Guide d'Utilisation WMSForge - Pour les Nuls

## 🎯 Introduction

Bienvenue dans WMSForge, votre système de gestion d'entrepôt (WMS). Ce guide vous explique comment utiliser l'application étape par étape, même si vous n'avez aucune expérience technique.

---

## 🚀 Démarrage Rapide

### Étape 1 : Démarrer l'application

1. **Ouvrez votre terminal** (l'application en ligne de commande)
2. **Naviguez vers le dossier du projet** :
   ```bash
   cd /Users/amrouche.7/wmsforge-v2
   ```
3. **Démarrez le backend** (dans un premier terminal) :
   ```bash
   npm run dev:worker
   ```
   ✅ Vous devriez voir : `Ready on http://localhost:8787`

4. **Démarrez le frontend** (dans un second terminal) :
   ```bash
   npm run dev
   ```
   ✅ Vous devriez voir : `Local: http://localhost:5173/`

### Étape 2 : Accéder à l'application

Ouvrez votre navigateur et allez sur : **http://localhost:5173/**

---

## 🔐 Première Connexion

### Créer un compte (S'inscrire)

1. **Allez sur** : http://localhost:5173/auth?mode=register
2. **Remplissez le formulaire** :
   - **Nom complet** : Votre nom (ex: Jean Dupont)
   - **Email** : Votre adresse email (ex: jean@monentreprise.com)
   - **Mot de passe** : Minimum 6 caractères
   - **Nom de l'organisation** : Le nom de votre entreprise (ex: Ma Super Entreprise)
3. **Cliquez sur "S'inscrire"**
4. ✅ Vous êtes automatiquement connecté et redirigé vers l'onboarding

### Se Connecter (Login)

1. **Allez sur** : http://localhost:5173/auth
2. **Entrez vos identifiants** :
   - Email
   - Mot de passe
3. **Cliquez sur "Se connecter"**
4. ✅ Vous êtes redirigé vers le dashboard

---

## 📦 Modules de l'Application

### 1️⃣ **Dashboard** (Tableau de bord)

**URL** : http://localhost:5173/dashboard

**Que fait ce module ?**
- Vue d'ensemble de votre entrepôt
- Statistiques en temps réel
- Graphiques de performance

**Comment l'utiliser ?**
- Consultez les KPIs (indicateurs clés)
- Visualisez l'activité du jour
- Accédez rapidement aux autres modules

---

### 2️⃣ **Produits** (Catalogue)

**URL** : http://localhost:5173/products

**Que fait ce module ?**
- Gestion du catalogue produits
- Ajout/modification/suppression de produits
- Import CSV de produits en masse

**Comment l'utiliser ?**

#### **Ajouter un produit**
1. Cliquez sur le bouton **"+ Nouveau Produit"**
2. Remplissez les champs :
   - **SKU** : Code unique du produit (ex: PROD-001)
   - **Nom** : Nom du produit (ex: Chaise de bureau)
   - **Description** : Description détaillée
   - **Catégorie** : Type de produit (ex: Mobilier)
   - **Prix unitaire** : Prix de vente (ex: 150.00)
   - **Point de réapprovisionnement** : Quantité minimum (ex: 10)
3. Cliquez sur **"Créer"**
4. ✅ Le produit apparaît dans la liste

#### **Modifier un produit**
1. Trouvez le produit dans la liste
2. Cliquez sur l'icône **crayon** (éditer)
3. Modifiez les champs souhaités
4. Cliquez sur **"Enregistrer"**

#### **Supprimer un produit**
1. Trouvez le produit dans la liste
2. Cliquez sur l'icône **poubelle** (supprimer)
3. Confirmez la suppression
4. ✅ Le produit est supprimé

#### **Importer des produits en masse (CSV)**
1. Préparez un fichier CSV avec les colonnes : `sku,name,description,category,unitPrice,reorderPoint`
2. Cliquez sur **"Importer CSV"**
3. Sélectionnez votre fichier
4. Vérifiez l'aperçu
5. Cliquez sur **"Importer"**
6. ✅ Tous les produits sont créés

---

### 3️⃣ **Inventaire** (Stock)

**URL** : http://localhost:5173/inventory

**Que fait ce module ?**
- Suivi des stocks en temps réel
- Gestion des mouvements de stock
- Ajustements de quantités

**Comment l'utiliser ?**

#### **Recevoir du stock**
1. Cliquez sur **"Recevoir du stock"**
2. Sélectionnez :
   - **Produit** : Le produit à réceptionner
   - **Emplacement** : Où stocker le produit
   - **Quantité** : Combien d'unités reçues
3. Cliquez sur **"Recevoir"**
4. ✅ Le stock est mis à jour

#### **Ajuster le stock**
1. Trouvez le produit dans la liste
2. Cliquez sur **"Ajuster"**
3. Choisissez :
   - **Type** : Entrée / Sortie / Ajustement
   - **Quantité** : Nombre d'unités
   - **Notes** : Raison de l'ajustement
4. Cliquez sur **"Valider"**
5. ✅ L'inventaire est ajusté

#### **Consulter les mouvements**
1. Allez dans l'onglet **"Mouvements"**
2. Consultez l'historique de tous les mouvements de stock
3. Filtrez par :
   - Date
   - Produit
   - Type de mouvement

---

### 4️⃣ **Emplacements** (Zones de stockage)

**URL** : http://localhost:5173/locations

**Que fait ce module ?**
- Gestion de la topologie de l'entrepôt
- Création de zones, allées, racks, étagères
- Optimisation du rangement

**Comment l'utiliser ?**

#### **Créer un emplacement**
1. Cliquez sur **"+ Nouvel Emplacement"**
2. Remplissez :
   - **Code** : Code unique (ex: A-01-01)
   - **Nom** : Nom descriptif (ex: Allée A - Rack 1 - Étagère 1)
   - **Type** : zone / aisle / rack / shelf
   - **Capacité** : Nombre d'unités max
3. Cliquez sur **"Créer"**
4. ✅ L'emplacement est créé

---

### 5️⃣ **Commandes** (Orders)

**URL** : http://localhost:5173/orders

**Que fait ce module ?**
- Gestion des commandes clients
- Préparation de commandes
- Suivi du statut

**Comment l'utiliser ?**

#### **Créer une commande**
1. Cliquez sur **"+ Nouvelle Commande"**
2. Remplissez :
   - **Numéro de commande** : Référence unique (ex: CMD-001)
   - **Client** : Nom du client
   - **Priorité** : normal / high / urgent
3. Ajoutez des **lignes de commande** :
   - Produit
   - Quantité
4. Cliquez sur **"Créer"**
5. ✅ La commande est créée avec le statut "pending"

#### **Modifier le statut d'une commande**
1. Trouvez la commande
2. Cliquez sur le menu déroulant **Statut**
3. Sélectionnez le nouveau statut :
   - **pending** : En attente
   - **processing** : En cours de traitement
   - **picked** : Préparée
   - **packed** : Emballée
   - **shipped** : Expédiée
   - **delivered** : Livrée
4. ✅ Le statut est mis à jour

---

### 6️⃣ **Vagues** (Wave Picking)

**URL** : http://localhost:5173/waves

**Que fait ce module ?**
- Regroupement de commandes en vagues
- Optimisation du picking
- Suivi de performance

**Comment l'utiliser ?**

#### **Créer une vague**
1. Cliquez sur **"+ Nouvelle Vague"**
2. Remplissez :
   - **Nom** : Nom de la vague (ex: Vague Matin 17/11)
   - **Priorité** : normal / high / urgent
   - **Zone** : Zone de picking (optionnel)
3. Sélectionnez les **commandes** à inclure
4. Cliquez sur **"Créer"**
5. ✅ La vague est créée

#### **Lancer une vague**
1. Trouvez la vague
2. Cliquez sur **"Lancer"**
3. Le statut passe à **"released"**
4. ✅ Les tâches de picking sont générées

---

### 7️⃣ **Tâches** (Task Management)

**URL** : http://localhost:5173/tasks

**Que fait ce module ?**
- Gestion des tâches opérationnelles
- Attribution aux opérateurs
- Suivi de progression

**Comment l'utiliser ?**

#### **Créer une tâche**
1. Cliquez sur **"+ Nouvelle Tâche"**
2. Remplissez :
   - **Type** : pick / pack / move / count / receive
   - **Priorité** : normal / high / urgent
   - **Produit** : Produit concerné
   - **Quantité** : Nombre d'unités
   - **De** : Emplacement source
   - **Vers** : Emplacement destination
3. Attribuez à un **opérateur** (optionnel)
4. Cliquez sur **"Créer"**
5. ✅ La tâche est créée

#### **Suivre les tâches**
1. Consultez la liste des tâches
2. Filtrez par :
   - Statut (pending / in_progress / completed)
   - Opérateur
   - Type de tâche
3. Visualisez les métriques :
   - Total de tâches
   - Tâches en attente
   - Tâches en cours
   - Tâches complétées

---

### 8️⃣ **Performance** (Labor Management)

**URL** : http://localhost:5173/labor

**Que fait ce module ?**
- Gestion des opérateurs
- Suivi des performances individuelles
- Leaderboard et gamification

**Comment l'utiliser ?**

#### **Ajouter un opérateur**
1. Cliquez sur **"+ Nouvel Opérateur"**
2. Remplissez :
   - **Nom** : Nom de l'opérateur
   - **ID Employé** : Numéro unique
3. Cliquez sur **"Créer"**
4. ✅ L'opérateur est ajouté

#### **Consulter les performances**
1. Sélectionnez une **date**
2. Consultez le **leaderboard** du jour
3. Visualisez les métriques :
   - Picks par heure
   - Taux de précision
   - Score quotidien
   - Badges obtenus

---

### 9️⃣ **Rapports** (Reports)

**URL** : http://localhost:5173/reports

**Que fait ce module ?**
- Génération de rapports
- Analyses et statistiques
- Export de données

**Comment l'utiliser ?**

1. Sélectionnez un **type de rapport** :
   - Rapport d'inventaire
   - Rapport de commandes
   - Rapport de performance
2. Choisissez une **période**
3. Cliquez sur **"Générer"**
4. Consultez le rapport
5. Cliquez sur **"Exporter"** pour télécharger en PDF/Excel

---

### 🔟 **Intégrations**

**URL** : http://localhost:5173/integrations

**Que fait ce module ?**
- Connexion avec d'autres systèmes
- APIs et webhooks
- Import/Export de données

**Intégrations disponibles** :
- Shopify (e-commerce)
- WooCommerce (e-commerce)
- Amazon FBA (marketplace)
- QuickBooks (comptabilité)

---

## 🎮 Scénario d'Utilisation Complet

### Scénario : "Gérer une journée d'entrepôt"

**Matin - Réception de stock**
1. Allez dans **Inventaire**
2. Cliquez sur **"Recevoir du stock"**
3. Sélectionnez le produit "Chaise de bureau"
4. Emplacement : A-01-01
5. Quantité : 50
6. ✅ Stock reçu

**Midi - Création de commandes**
1. Allez dans **Commandes**
2. Créez 3 commandes clients
3. Ajoutez des produits à chaque commande
4. ✅ Commandes en attente

**Après-midi - Création d'une vague**
1. Allez dans **Vagues**
2. Créez une vague "Vague AM"
3. Ajoutez les 3 commandes
4. Lancez la vague
5. ✅ Tâches de picking générées

**Fin de journée - Suivi des performances**
1. Allez dans **Performance**
2. Consultez le leaderboard
3. Vérifiez les métriques des opérateurs
4. ✅ Journée terminée !

---

## 🔒 Multi-Tenant : Isolation des Données

### Qu'est-ce que le multi-tenant ?

Chaque organisation (entreprise) a ses propres données **complètement isolées**. 

**Exemple** :
- Organisation 1 : "Ma Super Entreprise"
  - Voit uniquement SES produits
  - Voit uniquement SES commandes
  - Voit uniquement SES opérateurs

- Organisation 2 : "Autre Entreprise"
  - Voit uniquement SES produits (différents)
  - Voit uniquement SES commandes (différentes)
  - Voit uniquement SES opérateurs (différents)

### Comment ça fonctionne ?

Quand vous créez un compte avec `npm run dev`, vous créez automatiquement une **nouvelle organisation**.

Tous vos produits, commandes, stock, etc. sont **automatiquement filtrés** par votre organisation grâce au **JWT token** dans le header `Authorization`.

---

## ❓ FAQ (Questions Fréquentes)

### Comment réinitialiser la base de données ?

```bash
cd /Users/amrouche.7/wmsforge-v2
rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject
npm run dev:worker
```

### Comment créer des données de test ?

Utilisez le script de seed :
```bash
./seed-demo-data.sh
```

### Comment se déconnecter ?

Cliquez sur l'icône utilisateur en haut à droite → **Déconnexion**

### Mot de passe oublié ?

Pour le moment, il n'y a pas de fonction "mot de passe oublié". Vous devez créer un nouveau compte ou réinitialiser la base de données.

---

## 🐛 Résolution de Problèmes

### Le frontend ne démarre pas

**Erreur** : `ERR_CONNECTION_REFUSED` sur localhost:5173

**Solution** :
```bash
cd /Users/amrouche.7/wmsforge-v2
npm run dev
```

### Le worker ne démarre pas

**Erreur** : `Address already in use` sur port 8787

**Solution** :
```bash
pkill -f wrangler
sleep 2
npm run dev:worker
```

### Erreur "Token invalide"

**Cause** : Le JWT a expiré (après 7 jours)

**Solution** : Reconnectez-vous via `/auth`

### Les données ne s'affichent pas

**Cause** : Vous n'êtes pas connecté ou le token est invalide

**Solution** :
1. Vérifiez que vous êtes connecté (icône utilisateur en haut à droite)
2. Ouvrez la console du navigateur (F12) pour voir les erreurs
3. Reconnectez-vous si nécessaire

---

## 📞 Support

- **Documentation technique** : Consultez les fichiers .md dans le projet
- **Problèmes GitHub** : https://github.com/votre-repo/issues
- **Email** : support@wmsforge.io

---

**Version** : 2.0.0  
**Dernière mise à jour** : 17 novembre 2025  
**Auteur** : WMSForge Team
