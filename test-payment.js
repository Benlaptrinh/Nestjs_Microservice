const http = require('http');

// Test 1: Get plans
console.log('Testing GET /payment/plans...');
http.get('http://localhost:3008/payment/plans', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('✅ Plans response:', JSON.parse(data).length, 'plans');
    testCreateOrder();
  });
}).on('error', (err) => {
  console.error('❌ Plans error:', err.message);
  process.exit(1);
});

function testCreateOrder() {
  // First create user
  const registerData = JSON.stringify({
    fullName: 'Test User',
    email: `test_${Date.now()}@example.com`,
    password: 'Test123456',
    role: 'user'
  });

  console.log('\nCreating test user...');
  
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

  const req = http.request(registerOptions, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const response = JSON.parse(data);
      const token = response.access_token;
      
      if (!token) {
        console.error('❌ Failed to get token:', response);
        process.exit(1);
      }
      
      console.log('✅ User created, token received');
      
      // Now create order
      const orderData = JSON.stringify({ plan: 'BASIC' });
      
      console.log('\nCreating PayPal order...');
      
      const orderOptions = {
        hostname: 'localhost',
        port: 3008,
        path: '/payment/create-order',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Content-Length': orderData.length
        }
      };

      const orderReq = http.request(orderOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('\nOrder response:');
          console.log(JSON.parse(data));
          process.exit(0);
        });
      });

      orderReq.on('error', (err) => {
        console.error('❌ Order error:', err.message);
        process.exit(1);
      });

      orderReq.write(orderData);
      orderReq.end();
    });
  });

  req.on('error', (err) => {
    console.error('❌ Register error:', err.message);
    process.exit(1);
  });

  req.write(registerData);
  req.end();
}
