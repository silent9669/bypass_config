// Test harness for mazii.js - simulates Shadowrocket environment
const fs = require('fs');
const path = require('path');

const testCases = [
  {
    name: "Mazii Mobile App - User Profile Response",
    url: "https://api.mazii.net/api/user/profile",
    response: {
      success: true,
      data: {
        userId: "123456",
        username: "testuser",
        email: "test@mazii.net",
        avatar: "https://cdn.mazii.net/avatar/default.png",
        is_premium: false,
        premium: 0,
        expire_date: "2024-01-01",
        ads: 1,
        type: 0
      }
    },
    shouldPatch: true
  },
  {
    name: "Mazii Mobile App - Subscription Status",
    url: "https://api.mazii.net/api/subscription/status",
    response: {
      status: "active",
      data: {
        subscription: {
          plan: "free",
          is_vip: false,
          vip_level: 0,
          expired_date: "2024-01-01",
          auto_renew: false
        }
      }
    },
    shouldPatch: true
  },
  {
    name: "Mazii API - Get User Info",
    url: "https://api.mazii.net/api/me",
    response: {
      result: {
        user: {
          id: 123,
          name: "Test User",
          premium_status: 0,
          is_lifetime: false,
          lifetime: 0
        }
      }
    },
    shouldPatch: true
  },
  {
    name: "Mazii Web - Dictionary API (should NOT patch)",
    url: "https://api.mazii.net/api/word/search",
    response: {
      data: [
        { word: "hello", meaning: "xin chào" }
      ]
    },
    shouldPatch: false
  },
  {
    name: "Mazii Subscription API - /api/subs (ACTUAL FROM CAPTURE)",
    url: "https://api.mazii.net/api/subs",
    response: {
      success: true,
      data: {
        active: false,
        expiredAt: null,
        productId: null,
        platform: "ios"
      }
    },
    shouldPatch: true
  }
];

let passed = 0;
let failed = 0;

console.log("🧪 Testing Mazii Premium Unlocker\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  URL: ${testCase.url}`);

  // Set up mock environment
  const $request = { url: testCase.url };
  let resultBody = null;
  const $done = function(res) {
    resultBody = res.body;
    return res;
  };

  try {
    // Create function from script
    const script = fs.readFileSync(path.join(__dirname, '../js/mazii.js'), 'utf8');
    const scriptFunc = new Function('$request', '$response', '$done', script);
    
    const $response = { body: JSON.stringify(testCase.response) };
    
    // Execute script
    scriptFunc($request, $response, $done);
    
    // Verify result
    if (resultBody) {
      const result = JSON.parse(resultBody);
      let isPremium = false;
      
      // Check various premium indicators
      function checkPremium(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (obj.is_premium === true || obj.is_premium === 1) isPremium = true;
        if (obj.premium === true || obj.premium === 1) isPremium = true;
        if (obj.is_vip === true || obj.is_vip === 1) isPremium = true;
        if (obj.vip === true || obj.vip === 1) isPremium = true;
        if (obj.type === 1) isPremium = true;
        
        // Check nested
        if (obj.data && typeof obj.data === 'object') checkPremium(obj.data);
        if (obj.result && typeof obj.result === 'object') checkPremium(obj.result);
        if (obj.user && typeof obj.user === 'object') checkPremium(obj.user);
        if (obj.subscription && typeof obj.subscription === 'object') checkPremium(obj.subscription);
      }
      
      checkPremium(result);
      
      if (testCase.shouldPatch && isPremium) {
        console.log(`  ✅ PASS - Premium unlocked`);
        passed++;
      } else if (!testCase.shouldPatch && !isPremium) {
        console.log(`  ✅ PASS - Non-profile API correctly ignored`);
        passed++;
      } else {
        console.log(`  ❌ FAIL - Expected patch: ${testCase.shouldPatch}, Got premium: ${isPremium}`);
        console.log(`  Result: ${JSON.stringify(result, null, 2).substring(0, 200)}`);
        failed++;
      }
    } else {
      console.log(`  ❌ FAIL - No response body`);
      failed++;
    }
  } catch (e) {
    console.log(`  ❌ ERROR: ${e.message}`);
    failed++;
  }
  
  console.log("");
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
