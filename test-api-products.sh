#!/bin/bash

# Test des API Produits pour 1wms.io
API_URL="http://localhost:8787"

echo "🧪 Test des API Produits"
echo "========================"

# 1. Health Check
echo -e "\n📋 Test 1: Health Check"
curl -s "$API_URL/health" | python3 -m json.tool

# 2. Créer un produit
echo -e "\n📋 Test 2: Créer un produit"
curl -X POST "$API_URL/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "SKU-001",
    "name": "iPhone 15 Pro",
    "description": "Smartphone Apple dernière génération",
    "weight": 0.187,
    "abcClass": "A",
    "minStock": 5,
    "price": 1299,
    "category": "Electronics",
    "fragile": true,
    "status": "active"
  }' 

# 3. Lister les produits
echo -e "\n📋 Test 3: Lister les produits"
curl -s "$API_URL/api/products?page=1&limit=10"

# 4. Rechercher par SKU
echo -e "\n📋 Test 4: Rechercher par SKU"
curl -s "$API_URL/api/products/sku/SKU-001"

# 5. Import en masse
echo -e "\n📋 Test 5: Import en masse"
curl -X POST "$API_URL/api/products/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "products": [
      {
        "sku": "SKU-002",
        "name": "MacBook Pro 14",
        "category": "Electronics",
        "abcClass": "A",
        "weight": 1.6,
        "price": 2499
      },
      {
        "sku": "SKU-003",
        "name": "AirPods Pro 2",
        "category": "Electronics",
        "abcClass": "B",
        "weight": 0.05,
        "price": 279
      }
    ]
  }'

echo -e "\n✅ Tests terminés !"
