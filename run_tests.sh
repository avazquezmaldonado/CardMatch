#!/bin/bash
# Comprehensive test suite for CardMatch project
# Tests all major features: API endpoints, validation, recommendations

echo "=========================================="
echo "CardMatch Comprehensive Test Suite"
echo "=========================================="
echo ""

# Test 1: Health check
echo "Test 1: Health Check"
curl -s http://localhost:4000/ | jq . 2>/dev/null && echo "PASS" || echo "FAIL"
echo ""

# Test 2: Get all cards
echo "Test 2: List All Cards"
CARDS=$(curl -s http://localhost:4000/api/cards | jq 'length')
echo "Found $CARDS cards: $([ "$CARDS" -gt 0 ] && echo "PASS" || echo "FAIL")"
echo ""

# Test 3: Get specific card
echo "Test 3: Get Specific Card (ID: 1)"
CARD=$(curl -s http://localhost:4000/api/cards/1 | jq '.name')
echo "Card name: $CARD"
[ "$CARD" != "null" ] && echo "PASS" || echo "FAIL"
echo ""

# Test 4: Recommendation with valid data
echo "Test 4: Valid Recommendation Request"
RESULT=$(curl -s -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {
      "creditScore": 720,
      "accountsOpened24": 1,
      "isStudent": false,
      "ecosystem": "none",
      "travelFrequency": "rarely",
      "rewardPreference": "general"
    },
    "spending": {
      "dining": 300,
      "groceries": 400,
      "gas": 200,
      "travel": 100,
      "other": 200
    }
  }')
BEST_OVERALL=$(echo "$RESULT" | jq '.bestOverall | length')
echo "Returned $BEST_OVERALL recommended cards: $([ "$BEST_OVERALL" -gt 0 ] && echo "PASS" || echo "FAIL")"
echo ""

# Test 5: Validation - Low credit score
echo "Test 5: Validation - Credit Score Too Low (250)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{"profile":{"creditScore":250},"spending":{"dining":100}}')
echo "HTTP Status: $STATUS (expected 400): $([ "$STATUS" = "400" ] && echo "PASS" || echo "FAIL")"
echo ""

# Test 6: Validation - High credit score
echo "Test 6: Validation - Credit Score Too High (900)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{"profile":{"creditScore":900},"spending":{"dining":100}}')
echo "HTTP Status: $STATUS (expected 400): $([ "$STATUS" = "400" ] && echo "PASS" || echo "FAIL")"
echo ""

# Test 7: Validation - Negative spending
echo "Test 7: Validation - Negative Spending (-100)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "profile": {"creditScore":700,"accountsOpened24":0,"isStudent":false,"ecosystem":"none","travelFrequency":"rarely","rewardPreference":"general"},
    "spending": {"dining":-100,"groceries":200,"gas":0,"travel":0,"other":0}
  }')
echo "HTTP Status: $STATUS (expected 400): $([ "$STATUS" = "400" ] && echo "PASS" || echo "FAIL")"
echo ""

# Test 8: Validation - Missing profile
echo "Test 8: Validation - Missing Profile"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4000/api/cards/recommend \
  -H "Content-Type: application/json" \
  -d '{"spending":{"dining":100}}')
echo "HTTP Status: $STATUS (expected 400): $([ "$STATUS" = "400" ] && echo "PASS" || echo "FAIL")"
echo ""

# Test 9: Not found - Invalid card ID
echo "Test 9: Not Found - Invalid Card ID (999)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/api/cards/999)
echo "HTTP Status: $STATUS (expected 404): $([ "$STATUS" = "404" ] && echo "PASS" || echo "FAIL")"
echo ""

echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
