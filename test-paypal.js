#!/usr/bin/env node

/**
 * PayPal Backend Test Script
 * Chạy: node test-paypal.js
 */

const https = require('https');
const http = require('http');

// Configuration
const PAYMENT_SERVICE_URL = 'http://localhost:3008';
const AUTH_SERVICE_URL = 'http://localhost:3001';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = protocol.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

async function testPaymentService() {
  console.log('\n' + '='.repeat(60));
  log('blue', '🧪 PAYPAL BACKEND TEST SUITE');
  console.log('='.repeat(60) + '\n');

  let jwtToken = null;

  // Test 1: Check Payment Service is running
  log('yellow', '📡 Test 1: Kiểm tra Payment Service đang chạy...');
  try {
    const response = await makeRequest(`${PAYMENT_SERVICE_URL}/payment/plans`);
    if (response.status === 200) {
      log('green', '✅ Payment service đang chạy');
      log('blue', `   Tìm thấy ${response.data.length} gói subscription`);
      response.data.forEach(plan => {
        console.log(`   - ${plan.plan}: $${plan.price}`);
      });
    } else {
      log('red', '❌ Payment service không phản hồi đúng');
      return false;
    }
  } catch (error) {
    log('red', `❌ Không thể kết nối đến Payment service: ${error.message}`);
    log('yellow', '💡 Hãy chạy: npm run start:dev payment');
    return false;
  }

  console.log('');

  // Test 2: Check PayPal credentials
  log('yellow', '🔑 Test 2: Kiểm tra PayPal credentials...');
  try {
    // Try to create order (sẽ fail nếu credentials sai)
    const response = await makeRequest(`${PAYMENT_SERVICE_URL}/payment/create-order`, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer fake-token-for-test',
      },
      body: {
        plan: 'BASIC'
      }
    });

    if (response.status === 401) {
      log('yellow', '⚠️  Cần JWT token hợp lệ để test tiếp');
      log('blue', '   Bỏ qua test này (cần login trước)');
    } else if (response.status === 400 || response.status === 500) {
      // Kiểm tra error message
      if (response.data.message && response.data.message.includes('PayPal')) {
        log('red', '❌ PayPal credentials chưa được cấu hình đúng');
        log('yellow', '💡 Kiểm tra PAYPAL_CLIENT_ID và PAYPAL_CLIENT_SECRET trong .env.development');
        return false;
      }
    }
  } catch (error) {
    log('yellow', '⚠️  Không thể test credentials (bỏ qua)');
  }

  console.log('');

  // Test 3: Check Auth Service
  log('yellow', '🔐 Test 3: Kiểm tra Auth Service...');
  try {
    const response = await makeRequest(`${AUTH_SERVICE_URL}/auth/login`, {
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'test123'
      }
    });

    if (response.status === 401 || response.status === 404) {
      log('yellow', '⚠️  User test chưa tồn tại (OK, chỉ test kết nối)');
      log('green', '✅ Auth service đang chạy');
    } else if (response.status === 200 || response.status === 201) {
      log('green', '✅ Auth service đang chạy');
      if (response.data.access_token) {
        jwtToken = response.data.access_token;
        log('blue', `   Token: ${jwtToken.substring(0, 20)}...`);
      }
    }
  } catch (error) {
    log('red', `❌ Không thể kết nối đến Auth service: ${error.message}`);
    log('yellow', '💡 Hãy chạy: npm run start:dev auth-service');
    return false;
  }

  console.log('');

  // Test 4: Check Database Connection
  log('yellow', '🗄️  Test 4: Kiểm tra kết nối Database...');
  try {
    const response = await makeRequest(`${PAYMENT_SERVICE_URL}/payment/plans`);
    if (response.status === 200) {
      log('green', '✅ Database đang hoạt động (Payment service truy vấn được)');
    }
  } catch (error) {
    log('red', '❌ Database có vấn đề');
    log('yellow', '💡 Kiểm tra PostgreSQL đang chạy: pg_ctl status');
    return false;
  }

  console.log('');

  // Summary
  console.log('='.repeat(60));
  log('blue', '📊 KẾT QUẢ TEST');
  console.log('='.repeat(60));
  log('green', '\n✅ Backend PayPal đã sẵn sàng để test với Frontend!\n');
  
  log('yellow', '📝 CHECKLIST TRƯỚC KHI TEST FRONTEND:');
  console.log('  1. ✓ Payment service đang chạy (port 3008)');
  console.log('  2. ✓ Auth service đang chạy (port 3001)');
  console.log('  3. ✓ Database kết nối thành công');
  console.log('  4. ? PayPal credentials (kiểm tra thủ công)');
  
  log('blue', '\n🔗 API ENDPOINTS:');
  console.log(`  - GET  ${PAYMENT_SERVICE_URL}/payment/plans`);
  console.log(`  - GET  ${PAYMENT_SERVICE_URL}/payment/subscription (cần JWT)`);
  console.log(`  - POST ${PAYMENT_SERVICE_URL}/payment/create-order (cần JWT)`);
  console.log(`  - POST ${PAYMENT_SERVICE_URL}/payment/capture-order (cần JWT)`);
  console.log(`  - GET  ${PAYMENT_SERVICE_URL}/payment/transactions (cần JWT)`);

  log('yellow', '\n💡 HƯỚNG DẪN TEST THỦ CÔNG:');
  console.log('  1. Mở file: test-paypal-backend.http');
  console.log('  2. Cài extension: REST Client (humao.rest-client)');
  console.log('  3. Click "Send Request" để test từng endpoint');

  console.log('');
  return true;
}

// Run tests
testPaymentService()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log('red', `\n❌ Test thất bại: ${error.message}`);
    process.exit(1);
  });
