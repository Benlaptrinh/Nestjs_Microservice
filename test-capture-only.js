const http = require('http');

// Get orderId and token from command line
const orderId = process.argv[2];
const userToken = process.argv[3];

if (!orderId || !userToken) {
  console.error('Usage: node test-capture-only.js <orderId> <token>');
  process.exit(1);
}

console.log('=== Capturing PayPal Payment ===\n');
console.log(`Order ID: ${orderId}`);
console.log('Sending capture request...\n');

const data = JSON.stringify({ orderId });

const options = {
  hostname: 'localhost',
  port: 3008,
  path: '/payment/capture-order',
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
    
    console.log('📦 Capture Response:\n');
    console.log(JSON.stringify(response, null, 2));
    console.log('');
    
    if (response.success) {
      console.log('✅ PAYMENT CAPTURED SUCCESSFULLY!\n');
      console.log('💳 Transaction Details:');
      console.log(`   - Transaction ID: ${response.transaction.id}`);
      console.log(`   - Order ID: ${response.transaction.orderId}`);
      console.log(`   - Capture ID: ${response.transaction.captureId}`);
      console.log(`   - Amount: $${response.transaction.amount} ${response.transaction.currency}`);
      console.log(`   - Status: ${response.transaction.status}`);
      if (response.transaction.payerEmail) {
        console.log(`   - Payer Email: ${response.transaction.payerEmail}`);
      }
      if (response.transaction.payerName) {
        console.log(`   - Payer Name: ${response.transaction.payerName}`);
      }
      console.log(`   - Completed At: ${response.transaction.completedAt}`);
      
      console.log('\n🎉 Subscription Activated:');
      console.log(`   - Plan: ${response.subscription.plan}`);
      console.log(`   - Status: ${response.subscription.status}`);
      console.log(`   - Start Date: ${response.subscription.startDate}`);
      console.log(`   - End Date: ${response.subscription.endDate}`);
      console.log(`   - Price: $${response.subscription.price}`);
      
      console.log('\n✅ User now has access to premium features!');
    } else {
      console.log('❌ CAPTURE FAILED');
      console.log(`Error: ${response.message || 'Unknown error'}`);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
  process.exit(1);
});

req.write(data);
req.end();
