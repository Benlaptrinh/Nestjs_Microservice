const http = require('http');

// Lấy orderId từ command line hoặc dùng default
const orderId = process.argv[2] || '3T8668063H536251U';

console.log('=== Test Capture PayPal Payment ===\n');

// Step 1: Create user and get token
console.log('1. Creating test user and getting JWT token...');

const registerData = JSON.stringify({
  fullName: 'Test User',
  email: `test_${Date.now()}@example.com`,
  password: 'Test123456',
  role: 'user'
});

const registerOptions = {
  hostname: 'localhost',
  port: 3001,
  path: '/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': registerData.length
  }
};

const registerReq = http.request(registerOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const response = JSON.parse(data);
    const token = response.access_token;
    const userId = response.user.id;
    
    if (!token) {
      console.error('❌ Failed to get token:', response);
      process.exit(1);
    }
    
    console.log('✅ User created:', userId);
    console.log('✅ Token received\n');
    
    // Step 2: Create a new order to get fresh orderId
    console.log('2. Creating new PayPal order...');
    
    const createOrderData = JSON.stringify({ plan: 'BASIC' });
    
    const createOrderOptions = {
      hostname: 'localhost',
      port: 3008,
      path: '/payment/create-order',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': createOrderData.length
      }
    };

    const createOrderReq = http.request(createOrderOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const orderResponse = JSON.parse(data);
        
        if (!orderResponse.orderId) {
          console.error('❌ Failed to create order:', orderResponse);
          process.exit(1);
        }
        
        const newOrderId = orderResponse.orderId;
        console.log('✅ Order created:', newOrderId);
        console.log('✅ Approval URL:', orderResponse.approvalUrl);
        console.log('\n⚠️  IMPORTANT: You need to:');
        console.log('   1. Open the approval URL in browser');
        console.log('   2. Login to PayPal sandbox and approve payment');
        console.log('   3. After approval, PayPal will redirect to /payment/success');
        console.log('   4. Then run capture with the orderId\n');
        
        // Step 3: Try to capture (will fail if not approved yet)
        console.log('3. Attempting to capture payment...');
        console.log(`   Order ID: ${newOrderId}\n`);
        
        capturePayment(token, userId, newOrderId);
      });
    });

    createOrderReq.on('error', (err) => {
      console.error('❌ Create order error:', err.message);
      process.exit(1);
    });

    createOrderReq.write(createOrderData);
    createOrderReq.end();
  });
});

registerReq.on('error', (err) => {
  console.error('❌ Register error:', err.message);
  process.exit(1);
});

registerReq.write(registerData);
registerReq.end();

function capturePayment(token, userId, orderId) {
  const captureData = JSON.stringify({ orderId });
  
  const captureOptions = {
    hostname: 'localhost',
    port: 3008,
    path: '/payment/capture-order',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Content-Length': captureData.length
    }
  };

  const captureReq = http.request(captureOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('Capture response:');
      const response = JSON.parse(data);
      console.log(JSON.stringify(response, null, 2));
      
      if (response.status === 'COMPLETED') {
        console.log('\n✅ Payment captured successfully!');
        console.log('✅ Subscription activated:', response.subscription.plan);
        console.log('✅ Valid until:', response.subscription.endDate);
      } else if (response.statusCode === 404) {
        console.log('\n❌ Transaction not found');
        console.log('   This might be because the order was created by a different user');
        console.log('   Use the same token that created the order');
      } else if (response.message) {
        console.log('\n⚠️  Capture failed:', response.message);
        console.log('   Make sure you approved the payment on PayPal first');
      }
      
      process.exit(0);
    });
  });

  captureReq.on('error', (err) => {
    console.error('❌ Capture error:', err.message);
    process.exit(1);
  });

  captureReq.write(captureData);
  captureReq.end();
}
