#!/bin/bash

# Script to test and populate Enterprise Features API
# Run with: bash test-api.sh

API_URL="http://localhost:8787"

echo "🧪 Testing Enterprise Features API..."
echo "======================================"
echo ""

# Test 1: Create operators via SQL (bypass foreign keys)
echo "✅ Test 1: Checking operators..."
curl -s "$API_URL/api/labor/operators" | jq '.'
echo ""

# Test 2: Get waves
echo "✅ Test 2: Checking waves..."
curl -s "$API_URL/api/waves" | jq '.'
echo ""

# Test 3: Get tasks
echo "✅ Test 3: Checking tasks..."
curl -s "$API_URL/api/tasks" | jq '.'
echo ""

# Test 4: Get task metrics
echo "✅ Test 4: Checking task metrics..."
curl -s "$API_URL/api/tasks/metrics" | jq '.'
echo ""

# Test 5: Get performance data
echo "✅ Test 5: Checking performance..."
curl -s "$API_URL/api/labor/performance" | jq '.'
echo ""

# Test 6: Get leaderboard
echo "✅ Test 6: Checking leaderboard..."
curl -s "$API_URL/api/labor/leaderboard" | jq '.'
echo ""

# Test 7: Get team stats
echo "✅ Test 7: Checking team stats..."
curl -s "$API_URL/api/labor/team-stats" | jq '.'
echo ""

# Test 8: Get badges
echo "✅ Test 8: Checking badges..."
curl -s "$API_URL/api/labor/badges" | jq '.'
echo ""

echo ""
echo "✅ API tests complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Open browser to http://localhost:5175/waves"
echo "  2. Open browser to http://localhost:5175/tasks"
echo "  3. Open browser to http://localhost:5175/labor"
echo ""
