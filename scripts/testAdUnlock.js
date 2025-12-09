const fs = require('fs');
const path = require('path');
const https = require('https');

// Load .env.local manually
const envPath = path.join(__dirname, '../.env.local');
let CONVEX_URL = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/CONVEX_URL=(.*)/);
  if (match) {
    CONVEX_URL = match[1].trim();
  }
}

if (!CONVEX_URL) {
  console.error('Could not find CONVEX_URL in .env.local');
  process.exit(1);
}

console.log('Using Convex URL:', CONVEX_URL);

function callConvexMutation(mutationPath, args) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${CONVEX_URL}/api/mutation`);
    const body = JSON.stringify({
      path: mutationPath,
      args: args,
      format: 'json',
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
}

function callConvexQuery(queryPath, args) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${CONVEX_URL}/api/query`);
    const body = JSON.stringify({
      path: queryPath,
      args: args,
      format: 'json',
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.write(body);
    req.end();
  });
}

async function testAdUnlock() {
  try {
    console.log('1. Creating a guest user...');
    const createResult = await callConvexMutation('auth:createGuestUser', {});
    const { token, userId } = createResult.value;
    console.log('   User created:', userId);
    console.log('   Token:', token.substring(0, 10) + '...');

    console.log('\n2. Checking initial unlocked countries...');
    const user = await callConvexQuery('auth:getCurrentUser', { token });
    console.log('   Unlocked:', user.value.unlockedCountries || []);

    const targetCountry = 'JP'; // Japan
    console.log(`\n3. Attempting to unlock country: ${targetCountry}...`);
    const unlockResult = await callConvexMutation('users:unlockCountry', {
      token,
      countryCode: targetCountry,
    });
    console.log('   Result:', unlockResult.value);

    console.log('\n4. Verifying unlock status...');
    const updatedUser = await callConvexQuery('auth:getCurrentUser', { token });
    const unlocked = updatedUser.value.unlockedCountries || [];
    console.log('   Unlocked:', unlocked);

    if (unlocked.includes(targetCountry)) {
      console.log('\n✅ SUCCESS: Country was successfully unlocked!');
    } else {
      console.error('\n❌ FAILURE: Country was NOT unlocked.');
    }

    console.log(
      '\n5. Attempting to unlock the same country again (idempotency)...'
    );
    const unlockResult2 = await callConvexMutation('users:unlockCountry', {
      token,
      countryCode: targetCountry,
    });
    console.log('   Result:', unlockResult2.value);
  } catch (error) {
    console.error('\n❌ Error during test:', error.message);
  }
}

testAdUnlock();
