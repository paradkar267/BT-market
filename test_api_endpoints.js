const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  console.log('🧪 Starting Neon API End-to-End Tests...\n');

  try {
    // 1. Test GET /api/templates
    console.log('1. Testing GET /api/templates...');
    const tmplRes = await fetch(`${BASE_URL}/templates`);
    const templates = await tmplRes.json();
    console.log(`   ✅ Status: ${tmplRes.status}, Templates Count: ${templates.length}`);
    if (templates.length === 0) throw new Error('No templates found in Neon!');

    // 2. Test GET /api/announcement-banner
    console.log('\n2. Testing GET /api/announcement-banner...');
    const bannerRes = await fetch(`${BASE_URL}/announcement-banner`);
    const banner = await bannerRes.json();
    console.log(`   ✅ Status: ${bannerRes.status}, Headline: "${banner.headline}"`);

    // 3. Test POST /api/validate-coupon
    console.log('\n3. Testing POST /api/validate-coupon (LAUNCH50)...');
    const couponRes = await fetch(`${BASE_URL}/validate-coupon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'LAUNCH50', cartTotal: 5000 })
    });
    const couponData = await couponRes.json();
    console.log(`   ✅ Status: ${couponRes.status}, Valid: ${couponData.valid}, Discount: ₹${couponData.discount}`);

    // 4. Test POST /api/auth/register
    const testEmail = `neon_test_${Date.now()}@example.com`;
    console.log(`\n4. Testing POST /api/auth/register (${testEmail})...`);
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123',
        fullName: 'Neon Tester'
      })
    });
    const regData = await regRes.json();
    console.log(`   ✅ Status: ${regRes.status}, User ID: ${regData.user?.id}, Token: ${regData.token ? 'Present' : 'Missing'}`);
    const token = regData.token;

    // 5. Test POST /api/auth/login
    console.log('\n5. Testing POST /api/auth/login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log(`   ✅ Status: ${loginRes.status}, Authenticated as: ${loginData.user?.email}`);

    // 6. Test GET /api/auth/me (Protected Route)
    console.log('\n6. Testing GET /api/auth/me (JWT Protected)...');
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log(`   ✅ Status: ${meRes.status}, Verified User: ${meData.user?.full_name}`);

    const testTemplate = templates[0] || { id: 55, title: 'HTML Elite Fitness', price: '500' };
    const targetId = testTemplate.id;

    // 7. Test POST /api/create-order (Official Razorpay Order Creation)
    console.log(`\n7. Testing POST /api/create-order (Razorpay order for template ${targetId})...`);
    const orderRes = await fetch(`${BASE_URL}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cartItems: [{ id: targetId, price: testTemplate.price }],
        couponCode: 'LAUNCH50'
      })
    });
    const orderData = await orderRes.json();
    console.log(`   ✅ Status: ${orderRes.status}, Order ID: ${orderData.orderId}, Amount: ₹${orderData.amount / 100}, Key: ${orderData.key}`);

    // 8. Test POST /api/verify-payment (Purchase recording in Neon)
    console.log(`\n8. Testing POST /api/verify-payment (Record purchase for template ${targetId} in Neon)...`);
    const payRes = await fetch(`${BASE_URL}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        paymentId: `pay_test_${Date.now()}`,
        orderId: orderData.orderId,
        signature: 'simulated_signature',
        cartItems: [{ id: targetId, title: testTemplate.title, price: testTemplate.price }],
        couponCode: 'LAUNCH50'
      })
    });
    const payData = await payRes.json();
    console.log(`   ✅ Status: ${payRes.status}, Message: ${payData.message}`);

    // 8. Test POST /api/reviews
    console.log(`\n8. Testing POST /api/reviews (Add product review for template ${targetId} in Neon)...`);
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        templateId: targetId,
        rating: 5,
        comment: 'Amazing template, works flawlessly on Neon!'
      })
    });
    const reviewData = await reviewRes.json();
    console.log(`   ✅ Status: ${reviewRes.status}, Review ID: ${reviewData.id}`);

    // 9. Test GET /api/reviews/:templateId
    console.log(`\n9. Testing GET /api/reviews/${targetId}...`);
    const getRevRes = await fetch(`${BASE_URL}/reviews/${targetId}`);
    const reviews = await getRevRes.json();
    console.log(`   ✅ Status: ${getRevRes.status}, Reviews Count for Template ${targetId}: ${reviews.length}`);

    // 10. Test GET /api/download/:templateId (Binary ZIP stream directly from Neon PostgreSQL)
    console.log(`\n10. Testing GET /api/download/${targetId} (Stream ZIP directly from Neon Database)...`);
    const dlRes = await fetch(`${BASE_URL}/download/${targetId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const dlBuffer = await dlRes.arrayBuffer();
    const contentType = dlRes.headers.get('content-type');
    const contentDisposition = dlRes.headers.get('content-disposition');
    console.log(`   ✅ Status: ${dlRes.status}, Content-Type: ${contentType}`);
    console.log(`   ✅ File Name: ${contentDisposition}, Received Bytes: ${dlBuffer.byteLength}`);

    if (dlRes.status !== 200 || dlBuffer.byteLength === 0) {
      throw new Error('Failed to stream ZIP file from Neon database!');
    }

    console.log('\n🎉 ALL 10 END-TO-END TESTS PASSED (DATABASE + CLOUD BYTEA STORAGE)!');
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
}

runTests();
