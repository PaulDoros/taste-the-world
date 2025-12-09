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

async function checkRecipeCount() {
  try {
    console.log('Querying recipe count...');
    const result = await callConvexQuery('recipes:countRecipes', {});
    console.log('Full result:', JSON.stringify(result, null, 2));
    console.log('Total recipes in database:', result.value);
  } catch (error) {
    console.error('Error checking count:', error.message);
  }
}

checkRecipeCount();
