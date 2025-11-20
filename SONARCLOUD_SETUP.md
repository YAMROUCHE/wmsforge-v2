# Guide de Configuration SonarCloud pour WMSForge

## 📋 Prérequis

- Compte GitHub avec le dépôt WMSForge
- Compte SonarCloud (gratuit pour projets open source)

## 🚀 Étapes de Configuration

### 1. Créer un compte SonarCloud

1. Allez sur https://sonarcloud.io/
2. Cliquez sur **"Sign up"** ou **"Log in"**
3. Connectez-vous avec votre compte GitHub
4. Autorisez SonarCloud à accéder à vos repositories

### 2. Importer votre projet

1. Une fois connecté, cliquez sur **"+"** en haut à droite
2. Sélectionnez **"Analyze new project"**
3. Choisissez votre organisation GitHub
4. Sélectionnez le repository **wmsforge-v2**
5. Cliquez sur **"Set up"**

### 3. Configurer l'organisation

1. SonarCloud vous demandera de créer une organisation
2. Notez votre **Organization Key** (ex: `your-username` ou `your-org`)
3. Mettez à jour les fichiers suivants avec votre org key :
   - `sonar-project.properties` : ligne `sonar.organization=`
   - `.github/workflows/sonarcloud.yml` : ligne `-Dsonar.organization=`

### 4. Générer le token SONAR_TOKEN

1. Allez sur : https://sonarcloud.io/account/security/
2. Cliquez sur **"Generate Tokens"**
3. Nom du token : `WMSForge GitHub Actions`
4. Type : **User Token**
5. Expiration : **No expiration** (ou selon vos besoins)
6. Cliquez sur **"Generate"**
7. **COPIEZ LE TOKEN** (vous ne pourrez plus le revoir)

### 5. Ajouter le token aux secrets GitHub

1. Allez sur votre repository GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Cliquez sur **"New repository secret"**
4. Name : `SONAR_TOKEN`
5. Value : Collez le token copié à l'étape 4
6. Cliquez sur **"Add secret"**

### 6. Mettre à jour sonar-project.properties

Editez `sonar-project.properties` et remplacez :
```properties
sonar.projectKey=wmsforge-v2
sonar.organization=YOUR_ORG_KEY  # ← Remplacez par votre organization key
```

### 7. Pousser les changements sur GitHub

```bash
git add .
git commit -m "feat: add SonarCloud integration"
git push origin main
```

### 8. Vérifier l'analyse

1. GitHub Actions se déclenchera automatiquement
2. Allez sur https://sonarcloud.io/projects
3. Vous devriez voir votre projet **wmsforge-v2**
4. Cliquez dessus pour voir les résultats de l'analyse

## 📊 Badges pour le README

Une fois configuré, vous pouvez ajouter ces badges à votre README.md :

```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=wmsforge-v2&metric=alert_status)](https://sonarcloud.io/dashboard?id=wmsforge-v2)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=wmsforge-v2&metric=security_rating)](https://sonarcloud.io/dashboard?id=wmsforge-v2)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=wmsforge-v2&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=wmsforge-v2)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=wmsforge-v2&metric=coverage)](https://sonarcloud.io/dashboard?id=wmsforge-v2)
```

## 🔍 Métriques analysées

SonarCloud analysera automatiquement :

- **Bugs** : Erreurs potentielles dans le code
- **Vulnerabilities** : Failles de sécurité
- **Code Smells** : Problèmes de maintenabilité
- **Coverage** : Couverture de code par les tests
- **Duplications** : Code dupliqué
- **Security Hotspots** : Points sensibles de sécurité

## 🎯 Objectifs de qualité recommandés

- **Quality Gate** : PASSED
- **Coverage** : > 80%
- **Duplications** : < 3%
- **Maintainability Rating** : A
- **Security Rating** : A
- **Reliability Rating** : A

## 📝 Notes

- L'analyse se déclenche automatiquement sur chaque push vers `main` et `develop`
- L'analyse se déclenche aussi sur chaque Pull Request
- Les résultats sont visibles dans l'interface SonarCloud et dans les PR GitHub
