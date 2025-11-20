#!/bin/bash

# Script de vérification - Application prête pour les tests
# Date: 18 janvier 2025

echo "🔍 Vérification de l'environnement de test WMSForge..."
echo ""

# Compteur d'erreurs
ERRORS=0

# 1. Vérifier Node.js
echo "1️⃣  Vérification Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js installé: $NODE_VERSION"
else
    echo "   ❌ Node.js non installé"
    ERRORS=$((ERRORS+1))
fi
echo ""

# 2. Vérifier npm
echo "2️⃣  Vérification npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm installé: v$NPM_VERSION"
else
    echo "   ❌ npm non installé"
    ERRORS=$((ERRORS+1))
fi
echo ""

# 3. Vérifier node_modules
echo "3️⃣  Vérification des dépendances..."
if [[ -d "node_modules" ]]; then
    echo "   ✅ node_modules existe"
else
    echo "   ❌ node_modules manquant - Exécuter: npm install"
    ERRORS=$((ERRORS+1))
fi
echo ""

# 4. Vérifier les migrations
echo "4️⃣  Vérification des migrations..."
EXPECTED_MIGRATIONS=(
    "0002_add_enterprise_features_v2.sql"
    "0003_add_testimonials.sql"
    "0004_add_integrations.sql"
    "0005_add_referrals.sql"
    "0006_eliminate_localstorage.sql"
)

MISSING_MIGRATIONS=0
for migration in "${EXPECTED_MIGRATIONS[@]}"; do
    if [[ -f "drizzle/migrations/$migration" ]]; then
        echo "   ✅ $migration"
    else
        echo "   ❌ $migration manquant"
        MISSING_MIGRATIONS=$((MISSING_MIGRATIONS+1))
    fi
done

if [[ $MISSING_MIGRATIONS -eq 0 ]]; then
    echo "   ✅ Toutes les migrations présentes"
else
    echo "   ❌ $MISSING_MIGRATIONS migration(s) manquante(s)"
    ERRORS=$((ERRORS+1))
fi
echo ""

# 5. Vérifier la base de données
echo "5️⃣  Vérification de la base de données..."
if [[ -f ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/4f114494537e4c318271079f3ee49dfed.sqlite" ]]; then
    echo "   ✅ Base de données locale existe"

    # Vérifier les tables critiques
    TABLES=$(npx wrangler d1 execute wmsforge-db --local --command="SELECT COUNT(*) as count FROM sqlite_master WHERE type='table';" 2>/dev/null | grep -o '"count":[0-9]*' | grep -o '[0-9]*')

    if [[ -n "$TABLES" && "$TABLES" -gt 20 ]]; then
        echo "   ✅ Base de données initialisée ($TABLES tables)"
    else
        echo "   ⚠️  Base de données existe mais semble vide"
        echo "      → Exécuter les migrations (voir GUIDE_TESTEUR.md)"
    fi
else
    echo "   ⚠️  Base de données locale non trouvée"
    echo "      → Exécuter les migrations (voir GUIDE_TESTEUR.md)"
fi
echo ""

# 6. Vérifier les fichiers de configuration
echo "6️⃣  Vérification des fichiers de configuration..."
CONFIG_FILES=(
    "package.json"
    "wrangler.toml"
    "vite.config.ts"
    "tsconfig.json"
)

for file in "${CONFIG_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file manquant"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# 7. Vérifier les routes principales
echo "7️⃣  Vérification des fichiers source critiques..."
CRITICAL_FILES=(
    "src/pages/Landing.tsx"
    "src/pages/Auth.tsx"
    "src/pages/Dashboard.tsx"
    "worker/src/index.ts"
    "worker/src/routes/auth.ts"
    "worker/src/routes/products.ts"
    "worker/src/routes/referrals.ts"
)

MISSING_FILES=0
for file in "${CRITICAL_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file manquant"
        MISSING_FILES=$((MISSING_FILES+1))
    fi
done

if [[ $MISSING_FILES -gt 0 ]]; then
    ERRORS=$((ERRORS+1))
fi
echo ""

# 8. Vérifier les guides de test
echo "8️⃣  Vérification des guides de test..."
TEST_DOCS=(
    "GUIDE_TESTEUR.md"
    "CHECKLIST_TESTS.md"
    "COMMENT_TESTER.md"
    "KNOWN_ISSUES.md"
)

for doc in "${TEST_DOCS[@]}"; do
    if [[ -f "$doc" ]]; then
        echo "   ✅ $doc"
    else
        echo "   ⚠️  $doc manquant"
    fi
done
echo ""

# 9. Vérifier si les serveurs tournent (optionnel)
echo "9️⃣  Vérification des serveurs (optionnel)..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "   ✅ Frontend accessible sur http://localhost:5173"
else
    echo "   ⚠️  Frontend non démarré"
    echo "      → Exécuter: npm run dev"
fi

if curl -s http://localhost:8787/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:8787/health)
    if [[ $HEALTH == *"ok"* ]]; then
        echo "   ✅ Backend accessible sur http://localhost:8787"
    else
        echo "   ⚠️  Backend répond mais status incorrect"
    fi
else
    echo "   ⚠️  Backend non démarré"
    echo "      → Exécuter: npm run dev:worker"
fi
echo ""

# Résumé final
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [[ $ERRORS -eq 0 ]]; then
    echo "✅ ENVIRONNEMENT PRÊT POUR LES TESTS"
    echo ""
    echo "📋 Prochaines étapes:"
    echo "   1. Démarrer le frontend: npm run dev"
    echo "   2. Démarrer le backend: npm run dev:worker"
    echo "   3. Ouvrir: http://localhost:5173"
    echo "   4. Consulter: GUIDE_TESTEUR.md"
    echo ""
    echo "🎯 Bon test !"
else
    echo "❌ $ERRORS ERREUR(S) DÉTECTÉE(S)"
    echo ""
    echo "⚠️  Corriger les erreurs avant de commencer les tests"
    echo "   Consulter GUIDE_TESTEUR.md pour l'installation"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

exit $ERRORS
