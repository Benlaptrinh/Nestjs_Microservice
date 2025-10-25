const http = require('http');

console.log('=== Test Full Payment Flow ===\n');

let userToken = '';
let userId = '';
let orderId = '';

// Step 1: Register user
function registerUser() {
  console.log('📝 Step 1: Registering new user...');
  
  const data = JSON.stringify({
    fullName: 'Test Payment User',
    email: `payment_test_${Date.now()}@example.com`,
    password: 'Test123456',
    role: 'user'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      const response = JSON.parse(responseData);
      userToken = response.access_token;
      userId = response.user.id;
      
      console.log(`✅ User created: ${response.user.email}`);
      console.log(`✅ User ID: ${userId}\n`);
      
      // Step 2: Create PayPal order
      createOrder();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Register error:', err.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

// Step 2: Create order
function createOrder() {
  console.log('💰 Step 2: Creating PayPal order for PREMIUM plan...');
  
  const data = JSON.stringify({ plan: 'PREMIUM' });

  const options = {
    hostname: 'localhost',
    port: 3008,
    path: '/payment/create-order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`,
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      const response = JSON.parse(responseData);
      orderId = response.orderId;
      
      console.log(`✅ Order created: ${orderId}`);
      console.log(`✅ Amount: $${response.amount} ${response.currency}`);
      console.log(`✅ Approval URL: ${response.approvalUrl}\n`);
      
      console.log('⚠️  MANUAL STEP REQUIRED:');
      console.log('   1. Open the approval URL in browser');
      console.log('   2. Login to PayPal sandbox');
      console.log('   3. Approve the payment');
      console.log('   4. After approval, run this command to capture:\n');
      console.log(`   node test-capture-only.js ${orderId} ${userToken}\n`);
      
      // Step 3: Check transactions (should have 1 PENDING)
      checkTransactions('after creating order');
    });
  });

  req.on('error', (err) => {
    console.error('❌ Create order error:', err.message);
    process.exit(1);
  });

  req.write(data);
  req.end();
}

// Step 3: Check transaction history
function checkTransactions(step) {
  console.log(`📋 Step 3: Checking transaction history (${step})...`);
  
  const options = {
    hostname: 'localhost',
    port: 3008,
    path: '/payment/transactions',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', chunk => responseData += chunk);
    res.on('end', () => {
      const transactions = JSON.parse(responseData);
      
      console.log(`✅ Found ${transactions.length} transaction(s):\n`);
      
      transactions.forEach((tx, index) => {
        console.log(`   Transaction #${index + 1}:`);
        console.log(`   - ID: ${tx.id}`);
        console.log(`   - Order ID: ${tx.orderId}`);
        console.log(`   - Amount: $${tx.amount} ${tx.currency}`);
        console.log(`   - Plan: ${tx.plan}`);
        console.log(`   - Status: ${tx.status}`);
        console.log(`   - Payment Method: ${tx.paymentMethod}`);
        console.log(`   - Description: ${tx.description}`);
        if (tx.payerEmail) console.log(`   - Payer Email: ${tx.payerEmail}`);
        if (tx.payerName) console.log(`   - Payer Name: ${tx.payerName}`);
        console.log(`   - Created At: ${tx.createdAt}`);
        if (tx.completedAt) console.log(`   - Completed At: ${tx.completedAt}`);
        if (tx.errorMessage) console.log(`   - Error: ${tx.errorMessage}`);
        console.log('');
      });
      
      console.log('✅ Test completed successfully!\n');
      console.log('📝 Summary:');
      console.log(`   - User ID: ${userId}`);
      console.log(`   - Order ID: ${orderId}`);
      console.log(`   - Token saved for capture step\n`);
    });
  });

  req.on('error', (err) => {
    console.error('❌ Get transactions error:', err.message);
    process.exit(1);
  });

  req.end();
}

// Start the flow
registerUser();
