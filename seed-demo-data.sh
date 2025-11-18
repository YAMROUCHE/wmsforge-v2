#!/bin/bash

# Script pour créer des données de démonstration
# via les API endpoints (évite les problèmes de foreign keys)

API_URL="http://localhost:8787"

echo "🌱 Seeding demo data via API..."
echo "================================"
echo ""

# 1. Créer des vagues de démonstration
echo "📦 Creating demo waves..."

curl -s -X POST "$API_URL/api/waves" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wave A1 - HIGH",
    "priority": "high",
    "zone": "A",
    "orderIds": []
  }' | jq '.'

curl -s -X POST "$API_URL/api/waves" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wave B1 - NORMAL",
    "priority": "normal",
    "zone": "B",
    "orderIds": []
  }' | jq '.'

curl -s -X POST "$API_URL/api/waves" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wave C1 - LOW",
    "priority": "low",
    "zone": "C",
    "orderIds": []
  }' | jq '.'

echo ""
echo "✅ Waves created!"
echo ""

# 2. Créer des tâches de démonstration
echo "📋 Creating demo tasks..."

curl -s -X POST "$API_URL/api/tasks" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "type": "pick",
      "priority": "high",
      "productId": 1,
      "productName": "Laptop Dell XPS 15",
      "quantity": 10,
      "estimatedTimeSeconds": 180,
      "zone": "A"
    },
    {
      "type": "pick",
      "priority": "normal",
      "productId": 2,
      "productName": "iPhone 15 Pro",
      "quantity": 25,
      "estimatedTimeSeconds": 240,
      "zone": "B"
    },
    {
      "type": "pick",
      "priority": "normal",
      "productId": 3,
      "productName": "Samsung Galaxy S24",
      "quantity": 15,
      "estimatedTimeSeconds": 200,
      "zone": "B"
    },
    {
      "type": "put_away",
      "priority": "low",
      "productId": 4,
      "productName": "AirPods Pro",
      "quantity": 50,
      "estimatedTimeSeconds": 300,
      "zone": "C"
    },
    {
      "type": "move",
      "priority": "high",
      "productId": 5,
      "productName": "MacBook Pro M3",
      "quantity": 8,
      "estimatedTimeSeconds": 150,
      "zone": "A"
    },
    {
      "type": "count",
      "priority": "normal",
      "productId": 6,
      "productName": "iPad Air",
      "quantity": 30,
      "estimatedTimeSeconds": 220,
      "zone": "B"
    }
  ]' | jq '.'

echo ""
echo "✅ Tasks created!"
echo ""

# 3. Vérifier les résultats
echo "📊 Summary:"
echo "-----------"

WAVES_COUNT=$(curl -s "$API_URL/api/waves" | jq '.waves | length')
TASKS_COUNT=$(curl -s "$API_URL/api/tasks" | jq '.tasks | length')
BADGES_COUNT=$(curl -s "$API_URL/api/labor/badges" | jq '.badges | length')

echo "Waves: $WAVES_COUNT"
echo "Tasks: $TASKS_COUNT"
echo "Badges: $BADGES_COUNT"
echo ""

echo "🎉 Demo data seeded successfully!"
echo ""
echo "📱 Open your browser:"
echo "  - http://localhost:5175/waves"
echo "  - http://localhost:5175/tasks"
echo "  - http://localhost:5175/labor"
echo ""
