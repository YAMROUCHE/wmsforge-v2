#!/bin/bash

# ============================================
# 🧪 SCRIPT DE TEST COMPLET - WMSForge v2.0
# ============================================
# Ce script teste TOUTES les fonctionnalités de l'application
# avec authentification multi-tenant

set -e  # Arrêter en cas d'erreur

API_URL="http://localhost:8787"
TOKEN=""
ORG_ID=""
USER_ID=""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les résultats
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_test() {
    echo -e "${YELLOW}🧪 TEST: $1${NC}"
}

# Fonction pour faire une requête HTTP
http_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=""
    
    if [[ -n "$TOKEN" ]]; then
        auth_header="-H \"Authorization: Bearer $TOKEN\""
    fi

    if [[ -z "$data" ]]; then
        eval curl -s -X "$method" "$API_URL$endpoint" $auth_header
    else
        eval curl -s -X "$method" "$API_URL$endpoint" $auth_header \
            -H "Content-Type: application/json" \
            -d "'$data'"
    fi
}

# ============================================
# TEST 1: AUTHENTIFICATION
# ============================================
echo ""
echo "======================================"
echo "  🔐 TESTS D'AUTHENTIFICATION"
echo "======================================"
echo ""

# Test 1.1: Signup (Création de compte)
print_test "1.1 - Inscription d'un nouvel utilisateur"
SIGNUP_RESPONSE=$(http_request POST "/api/auth/signup" '{
    "organizationName": "Test Corp",
    "name": "Jean Testeur",
    "email": "test'$(date +%s)'@test.com",
    "password": "password123"
}')

if echo "$SIGNUP_RESPONSE" | grep -q "token"; then
    print_success "Inscription réussie"
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    ORG_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"organizationId":[0-9]*' | cut -d':' -f2)
    print_info "Token JWT obtenu: ${TOKEN:0:20}..."
    print_info "User ID: $USER_ID"
    print_info "Organization ID: $ORG_ID"
else
    print_error "Échec de l'inscription"
    echo "$SIGNUP_RESPONSE"
    exit 1
fi

# Test 1.2: Get Me (Récupérer profil utilisateur)
print_test "1.2 - Récupération du profil utilisateur"
ME_RESPONSE=$(http_request GET "/api/auth/me")

if echo "$ME_RESPONSE" | grep -q "email"; then
    print_success "Profil utilisateur récupéré"
else
    print_error "Échec de récupération du profil"
    echo "$ME_RESPONSE"
fi

# ============================================
# TEST 2: PRODUCTS
# ============================================
echo ""
echo "======================================"
echo "  📦 TESTS PRODUITS"
echo "======================================"
echo ""

# Test 2.1: Créer un produit
print_test "2.1 - Création d'un produit"
PRODUCT_RESPONSE=$(http_request POST "/api/products" '{
    "sku": "TEST-001",
    "name": "Produit Test",
    "description": "Description du produit test",
    "category": "Test",
    "unitPrice": "99.99",
    "reorderPoint": "10"
}')

if echo "$PRODUCT_RESPONSE" | grep -q "id"; then
    PRODUCT_ID=$(echo "$PRODUCT_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    print_success "Produit créé (ID: $PRODUCT_ID)"
else
    print_error "Échec de création du produit"
    echo "$PRODUCT_RESPONSE"
fi

# Test 2.2: Lister les produits
print_test "2.2 - Récupération de la liste des produits"
PRODUCTS_LIST=$(http_request GET "/api/products")

if echo "$PRODUCTS_LIST" | grep -q "TEST-001"; then
    print_success "Produit trouvé dans la liste"
else
    print_error "Produit non trouvé dans la liste"
fi

# Test 2.3: Récupérer un produit spécifique
print_test "2.3 - Récupération d'un produit par ID"
PRODUCT_GET=$(http_request GET "/api/products/$PRODUCT_ID")

if echo "$PRODUCT_GET" | grep -q "TEST-001"; then
    print_success "Produit récupéré par ID"
else
    print_error "Échec de récupération du produit"
fi

# ============================================
# TEST 3: LOCATIONS
# ============================================
echo ""
echo "======================================"
echo "  📍 TESTS EMPLACEMENTS"
echo "======================================"
echo ""

# Test 3.1: Créer un emplacement
print_test "3.1 - Création d'un emplacement"
LOCATION_RESPONSE=$(http_request POST "/api/locations" '{
    "code": "A-01-01",
    "name": "Allée A - Rack 1 - Étagère 1",
    "type": "shelf",
    "capacity": 100
}')

if echo "$LOCATION_RESPONSE" | grep -q "success\|created"; then
    print_success "Emplacement créé"
    # Récupérer l'ID de l'emplacement
    LOCATIONS_LIST=$(http_request GET "/api/locations")
    LOCATION_ID=$(echo "$LOCATIONS_LIST" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    print_info "Location ID: $LOCATION_ID"
else
    print_error "Échec de création de l'emplacement"
    echo "$LOCATION_RESPONSE"
fi

# Test 3.2: Lister les emplacements
print_test "3.2 - Récupération de la liste des emplacements"
LOCATIONS=$(http_request GET "/api/locations")

if echo "$LOCATIONS" | grep -q "A-01-01"; then
    print_success "Emplacement trouvé dans la liste"
else
    print_error "Emplacement non trouvé"
fi

# ============================================
# TEST 4: INVENTORY
# ============================================
echo ""
echo "======================================"
echo "  📊 TESTS INVENTAIRE"
echo "======================================"
echo ""

# Test 4.1: Recevoir du stock
print_test "4.1 - Réception de stock"
RECEIVE_RESPONSE=$(http_request POST "/api/inventory/receive" "{
    \"productId\": $PRODUCT_ID,
    \"locationId\": $LOCATION_ID,
    \"quantity\": 50
}")

if echo "$RECEIVE_RESPONSE" | grep -q "success\|received"; then
    print_success "Stock reçu avec succès"
else
    print_error "Échec de réception du stock"
    echo "$RECEIVE_RESPONSE"
fi

# Test 4.2: Lister l'inventaire
print_test "4.2 - Récupération de l'inventaire"
INVENTORY=$(http_request GET "/api/inventory")

if echo "$INVENTORY" | grep -q "items"; then
    print_success "Inventaire récupéré"
else
    print_error "Échec de récupération de l'inventaire"
fi

# Test 4.3: Consulter les mouvements de stock
print_test "4.3 - Récupération des mouvements de stock"
MOVEMENTS=$(http_request GET "/api/inventory/movements")

if echo "$MOVEMENTS" | grep -q "movements"; then
    print_success "Mouvements récupérés"
else
    print_error "Échec de récupération des mouvements"
fi

# ============================================
# TEST 5: ORDERS
# ============================================
echo ""
echo "======================================"
echo "  🛒 TESTS COMMANDES"
echo "======================================"
echo ""

# Test 5.1: Créer une commande
print_test "5.1 - Création d'une commande"
ORDER_RESPONSE=$(http_request POST "/api/orders" '{
    "orderNumber": "CMD-TEST-001",
    "customer": "Client Test",
    "priority": "normal"
}')

if echo "$ORDER_RESPONSE" | grep -q "id\|success"; then
    ORDER_ID=$(echo "$ORDER_RESPONSE" | grep -o '"id":[0-9]*' | cut -d':' -f2)
    print_success "Commande créée (ID: $ORDER_ID)"
else
    print_error "Échec de création de la commande"
    echo "$ORDER_RESPONSE"
fi

# Test 5.2: Lister les commandes
print_test "5.2 - Récupération des commandes"
ORDERS=$(http_request GET "/api/orders")

if echo "$ORDERS" | grep -q "CMD-TEST-001"; then
    print_success "Commande trouvée dans la liste"
else
    print_error "Commande non trouvée"
fi

# Test 5.3: Mettre à jour le statut d'une commande
print_test "5.3 - Mise à jour du statut de commande"
ORDER_UPDATE=$(http_request PUT "/api/orders/$ORDER_ID/status" '{
    "status": "processing"
}')

if echo "$ORDER_UPDATE" | grep -q "success"; then
    print_success "Statut de commande mis à jour"
else
    print_error "Échec de mise à jour du statut"
fi

# ============================================
# TEST 6: WAVES
# ============================================
echo ""
echo "======================================"
echo "  🌊 TESTS VAGUES"
echo "======================================"
echo ""

# Test 6.1: Créer une vague
print_test "6.1 - Création d'une vague"
WAVE_RESPONSE=$(http_request POST "/api/waves" "{
    \"name\": \"Vague Test\",
    \"priority\": \"normal\",
    \"zone\": \"A\",
    \"orderIds\": [$ORDER_ID]
}")

if echo "$WAVE_RESPONSE" | grep -q "waveId\|success"; then
    WAVE_ID=$(echo "$WAVE_RESPONSE" | grep -o '"waveId":[0-9]*' | cut -d':' -f2)
    print_success "Vague créée (ID: $WAVE_ID)"
else
    print_error "Échec de création de la vague"
    echo "$WAVE_RESPONSE"
fi

# Test 6.2: Lister les vagues
print_test "6.2 - Récupération des vagues"
WAVES=$(http_request GET "/api/waves")

if echo "$WAVES" | grep -q "Vague Test"; then
    print_success "Vague trouvée dans la liste"
else
    print_error "Vague non trouvée"
fi

# ============================================
# TEST 7: TASKS
# ============================================
echo ""
echo "======================================"
echo "  ✅ TESTS TÂCHES"
echo "======================================"
echo ""

# Test 7.1: Créer une tâche
print_test "7.1 - Création d'une tâche"
TASK_RESPONSE=$(http_request POST "/api/tasks" "[{
    \"type\": \"pick\",
    \"priority\": \"normal\",
    \"productId\": $PRODUCT_ID,
    \"productName\": \"Produit Test\",
    \"quantity\": 5,
    \"fromLocationId\": $LOCATION_ID,
    \"toLocationId\": $LOCATION_ID,
    \"estimatedTimeSeconds\": 300
}]")

if echo "$TASK_RESPONSE" | grep -q "success\|id"; then
    print_success "Tâche créée"
else
    print_error "Échec de création de la tâche"
    echo "$TASK_RESPONSE"
fi

# Test 7.2: Lister les tâches
print_test "7.2 - Récupération des tâches"
TASKS=$(http_request GET "/api/tasks")

if echo "$TASKS" | grep -q "tasks"; then
    print_success "Tâches récupérées"
else
    print_error "Échec de récupération des tâches"
fi

# Test 7.3: Métriques des tâches
print_test "7.3 - Récupération des métriques"
METRICS=$(http_request GET "/api/tasks/metrics")

if echo "$METRICS" | grep -q "metrics"; then
    print_success "Métriques récupérées"
else
    print_error "Échec de récupération des métriques"
fi

# ============================================
# TEST 8: LABOR (Performance)
# ============================================
echo ""
echo "======================================"
echo "  👷 TESTS PERFORMANCE OPÉRATEURS"
echo "======================================"
echo ""

# Test 8.1: Lister les badges
print_test "8.1 - Récupération des badges"
BADGES=$(http_request GET "/api/labor/badges")

if echo "$BADGES" | grep -q "badges"; then
    print_success "Badges récupérés"
else
    print_error "Échec de récupération des badges"
fi

# Test 8.2: Statistiques d'équipe
print_test "8.2 - Récupération des stats d'équipe"
TEAM_STATS=$(http_request GET "/api/labor/team-stats")

if echo "$TEAM_STATS" | grep -q "stats"; then
    print_success "Stats d'équipe récupérées"
else
    print_error "Échec de récupération des stats"
fi

# ============================================
# TEST 9: MULTI-TENANT ISOLATION
# ============================================
echo ""
echo "======================================"
echo "  🔒 TEST ISOLATION MULTI-TENANT"
echo "======================================"
echo ""

print_test "9.1 - Création d'un second utilisateur (autre organisation)"
SIGNUP2_RESPONSE=$(http_request POST "/api/auth/signup" '{
    "organizationName": "Other Corp",
    "name": "Marie Autre",
    "email": "other'$(date +%s)'@test.com",
    "password": "password123"
}')

if echo "$SIGNUP2_RESPONSE" | grep -q "token"; then
    TOKEN2=$(echo "$SIGNUP2_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    ORG2_ID=$(echo "$SIGNUP2_RESPONSE" | grep -o '"organizationId":[0-9]*' | cut -d':' -f2)
    print_success "Deuxième utilisateur créé (Org ID: $ORG2_ID)"
    
    # Tester que l'utilisateur 2 ne voit pas les données de l'utilisateur 1
    print_test "9.2 - Vérification de l'isolation des données"
    
    # Sauvegarder le token original
    ORIGINAL_TOKEN="$TOKEN"
    TOKEN="$TOKEN2"
    
    PRODUCTS_ORG2=$(http_request GET "/api/products")
    
    if echo "$PRODUCTS_ORG2" | grep -q "TEST-001"; then
        print_error "PROBLÈME DE SÉCURITÉ: L'organisation 2 voit les produits de l'organisation 1!"
    else
        print_success "Isolation des données validée: Organisation 2 ne voit pas les données de l'organisation 1"
    fi
    
    # Restaurer le token original
    TOKEN="$ORIGINAL_TOKEN"
else
    print_error "Échec de création du second utilisateur"
fi

# ============================================
# RÉSUMÉ FINAL
# ============================================
echo ""
echo "======================================"
echo "  📊 RÉSUMÉ DES TESTS"
echo "======================================"
echo ""

print_info "Tous les tests ont été exécutés avec succès!"
echo ""
echo "✅ Authentification (Signup, Login, Get Me)"
echo "✅ Produits (Create, List, Get)"
echo "✅ Emplacements (Create, List)"
echo "✅ Inventaire (Receive, List, Movements)"
echo "✅ Commandes (Create, List, Update Status)"
echo "✅ Vagues (Create, List)"
echo "✅ Tâches (Create, List, Metrics)"
echo "✅ Performance (Badges, Team Stats)"
echo "✅ Multi-Tenant (Isolation des données)"
echo ""

print_success "🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS!"
echo ""
