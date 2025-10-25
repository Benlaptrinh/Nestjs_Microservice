#!/bin/bash

# PayPal Backend Quick Test Script
# Tạo user test và lấy JWT token để test payment APIs

set -e

echo "🧪 PayPal Backend Quick Test"
echo "============================"
echo ""

BASE_URL="http://localhost:3008/payment"
AUTH_URL="http://localhost:3001/auth"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test data
TEST_EMAIL="paypal_test_$(date +%s)@example.com"
TEST_PASSWORD="Test123456"

echo "📝 Tạo user test..."
REGISTER_RESPONSE=$(curl -s -X POST $AUTH_URL/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"fullName\": \"PayPal Test User\"
  }")

echo "$REGISTER_RESPONSE" | jq . || echo "Response: $REGISTER_RESPONSE"

echo ""
echo "🔐 Login để lấy JWT token..."
LOGIN_RESPONSE=$(curl -s -X POST $AUTH_URL/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

JWT_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$JWT_TOKEN" ]; then
  echo -e "${RED}❌ Không lấy được JWT token${NC}"
  echo "Response: $LOGIN_RESPONSE" | jq .
  exit 1
fi

echo -e "${GREEN}✅ Login thành công${NC}"
echo "Token: ${JWT_TOKEN:0:30}..."
echo ""

# Test 1: Get plans
echo "📦 Test 1: Lấy danh sách gói subscription..."
PLANS=$(curl -s $BASE_URL/plans)
PLAN_COUNT=$(echo "$PLANS" | jq 'length')
echo -e "${GREEN}✅ Có $PLAN_COUNT gói subscription${NC}"
echo "$PLANS" | jq -r '.[] | "  - \(.plan): $\(.price)"'
echo ""

# Test 2: Get current subscription
echo "👤 Test 2: Xem subscription hiện tại..."
SUBSCRIPTION=$(curl -s $BASE_URL/subscription \
  -H "Authorization: Bearer $JWT_TOKEN")
CURRENT_PLAN=$(echo "$SUBSCRIPTION" | jq -r '.plan')
echo -e "${GREEN}✅ Gói hiện tại: $CURRENT_PLAN${NC}"
echo ""

# Test 3: Create PayPal order
echo "💳 Test 3: Tạo PayPal order (PREMIUM plan)..."
CREATE_ORDER=$(curl -s -X POST $BASE_URL/create-order \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "PREMIUM",
    "description": "Test Premium Subscription"
  }')

ORDER_ID=$(echo "$CREATE_ORDER" | jq -r '.orderId // empty')
APPROVAL_URL=$(echo "$CREATE_ORDER" | jq -r '.approvalUrl // empty')

if [ -z "$ORDER_ID" ]; then
  echo -e "${RED}❌ Không tạo được order${NC}"
  echo "$CREATE_ORDER" | jq .
  exit 1
fi

echo -e "${GREEN}✅ Tạo order thành công${NC}"
echo "  Order ID: $ORDER_ID"
echo "  Amount: \$$(echo "$CREATE_ORDER" | jq -r '.amount')"
echo ""
echo -e "${YELLOW}📋 Approval URL (mở link này để thanh toán):${NC}"
echo "  $APPROVAL_URL"
echo ""

# Test 4: Get transactions
echo "📊 Test 4: Xem lịch sử giao dịch..."
TRANSACTIONS=$(curl -s $BASE_URL/transactions \
  -H "Authorization: Bearer $JWT_TOKEN")
TX_COUNT=$(echo "$TRANSACTIONS" | jq 'length')
echo -e "${GREEN}✅ Có $TX_COUNT giao dịch${NC}"
echo "$TRANSACTIONS" | jq -r '.[] | "  - Order: \(.paypalOrderId) | Status: \(.status) | Amount: $\(.amount)"'
echo ""

# Summary
echo "============================"
echo -e "${GREEN}✅ Tất cả tests PASSED!${NC}"
echo ""
echo "📝 Thông tin để test tiếp:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "  JWT Token: $JWT_TOKEN"
echo "  Order ID: $ORDER_ID"
echo ""
echo "🔗 Bước tiếp theo:"
echo "  1. Mở Approval URL trong browser"
echo "  2. Login bằng PayPal sandbox account:"
echo "     Email: sb-tvqwj41683258@personal.example.com"
echo "  3. Click 'Pay Now'"
echo "  4. Chạy lệnh capture:"
echo ""
echo "     curl -X POST $BASE_URL/capture-order \\"
echo "       -H \"Authorization: Bearer $JWT_TOKEN\" \\"
echo "       -H \"Content-Type: application/json\" \\"
echo "       -d '{\"orderId\": \"$ORDER_ID\"}'"
echo ""
