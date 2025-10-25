#!/bin/bash

echo "=== Test PayPal Payment Service ==="
echo ""

# Test 1: Check service
echo "1. Checking if payment service is running..."
PLANS=$(curl -s http://localhost:3008/payment/plans)
if [ -z "$PLANS" ]; then
  echo "❌ Payment service not responding"
  exit 1
fi
echo "✅ Service is running"
echo ""

# Test 2: Create user and get token
echo "2. Creating test user..."
TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@example.com"

REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Test User\",\"email\":\"${EMAIL}\",\"password\":\"Test123456\",\"role\":\"user\"}")

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Failed to create user"
  echo "$REGISTER_RESPONSE" | jq
  exit 1
fi

echo "✅ User created: $EMAIL"
echo "✅ Token received"
echo ""

# Test 3: Create PayPal order
echo "3. Creating PayPal order for BASIC plan..."
ORDER_RESPONSE=$(curl -s -X POST http://localhost:3008/payment/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"plan":"BASIC"}')

echo "$ORDER_RESPONSE" | jq

ORDER_ID=$(echo $ORDER_RESPONSE | jq -r '.orderId')
if [ "$ORDER_ID" == "null" ] || [ -z "$ORDER_ID" ]; then
  echo "❌ Failed to create order"
else
  echo "✅ Order created: $ORDER_ID"
fi
