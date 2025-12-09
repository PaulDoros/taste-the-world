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

async function seedRecipes() {
  const recipesPath = path.join(__dirname, '../app/recipe/recipies.json');
  console.log(`Reading recipes from ${recipesPath}...`);

  const rawData = fs.readFileSync(recipesPath, 'utf-8');

  // Split by bullet point which seems to mark the start of each batch
  const chunks = rawData.split('•');

  let allRecipes = [];

  console.log(`Found ${chunks.length} potential chunks.`);

  for (let i = 0; i < chunks.length; i++) {
    let chunk = chunks[i];

    // Find the first '{' and last '}'
    const firstBrace = chunk.indexOf('{');
    const lastBrace = chunk.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      // Skip chunks that don't look like JSON objects (e.g. empty start)
      continue;
    }

    // Extract just the JSON part
    const jsonContent = chunk.substring(firstBrace, lastBrace + 1);

    // Fix broken newlines
    const fixedJson = fixJson(jsonContent);

    try {
      const recipesByCountry = JSON.parse(fixedJson);
      let count = 0;
      for (const [country, recipes] of Object.entries(recipesByCountry)) {
        if (Array.isArray(recipes)) {
          const recipesWithCountry = recipes.map((r) => ({
            ...r,
            strArea: r.strArea || country,
          }));
          allRecipes = allRecipes.concat(recipesWithCountry);
          count += recipes.length;
        }
      }
      console.log(`Chunk ${i}: Parsed ${count} recipes.`);
    } catch (e) {
      console.error(`Error parsing chunk ${i}:`, e.message);
      // Attempt to show where it failed
      if (e.message.includes('position')) {
        const match = e.message.match(/position (\d+)/);
        if (match) {
          const pos = parseInt(match[1]);
          console.error('Context around error:');
          console.error(
            fixedJson.substring(
              Math.max(0, pos - 50),
              Math.min(fixedJson.length, pos + 50)
            )
          );
        }
      }
    }
  }

  console.log(`Total found: ${allRecipes.length} recipes to seed.`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < allRecipes.length; i += BATCH_SIZE) {
    const batch = allRecipes.slice(i, i + BATCH_SIZE);
    console.log(
      `Seeding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allRecipes.length / BATCH_SIZE)} (${batch.length} recipes)...`
    );

    try {
      await callConvexMutation('recipes:saveRecipes', { recipes: batch });
    } catch (error) {
      console.error(
        `Error seeding batch ${Math.floor(i / BATCH_SIZE) + 1}:`,
        error.message
      );
    }
  }

  console.log('Seeding complete!');
}

function fixJson(jsonString) {
  const lines = jsonString.split(/\r?\n/);
  const fixedLines = [];
  let currentLine = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Remove control characters (0-31) but keep newlines (though split removes them)
    const trimmed = line.replace(/[\x00-\x1F]/g, ' ').trim();

    if (!trimmed) continue; // Skip empty lines

    if (currentLine) {
      currentLine += ' ' + trimmed;
    } else {
      currentLine = trimmed;
    }

    // Check if we have an even number of quotes (ignoring escaped ones)
    // This tells us if we are currently inside a string
    const quoteCount = (currentLine.match(/(?<!\\)"/g) || []).length;
    const isInsideString = quoteCount % 2 === 1;

    if (!isInsideString) {
      // If not inside a string, check if it looks like a valid end of line
      const currentTrimmed = currentLine.trim();
      const endsWithValid = /([\[\{\}\]\"]|true|false|null|[0-9]+),?$/.test(
        currentTrimmed
      );

      if (endsWithValid) {
        fixedLines.push(currentLine);
        currentLine = '';
      }
    }
  }

  if (currentLine) {
    fixedLines.push(currentLine);
  }

  return fixedLines.join('\n');
}

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

seedRecipes().catch(console.error);
