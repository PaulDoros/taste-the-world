import { ConvexHttpClient } from 'convex/browser';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env.local' });

const client = new ConvexHttpClient(process.env.CONVEX_URL!);

async function seedRecipes() {
  const recipesPath = path.join(__dirname, '../app/recipe/recipies.json');
  console.log(`Reading recipes from ${recipesPath}...`);

  const rawData = fs.readFileSync(recipesPath, 'utf-8');
  // The file format seems to be: • { "Country": [ ... ] }
  // We need to clean it up to be valid JSON if it has that bullet point
  const cleanedData = rawData.replace(/^•\s*/, '');
  const recipesByCountry = JSON.parse(cleanedData);

  let allRecipes: any[] = [];

  for (const [country, recipes] of Object.entries(recipesByCountry)) {
    if (Array.isArray(recipes)) {
      allRecipes = allRecipes.concat(recipes);
    }
  }

  console.log(`Found ${allRecipes.length} recipes to seed.`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < allRecipes.length; i += BATCH_SIZE) {
    const batch = allRecipes.slice(i, i + BATCH_SIZE);
    console.log(
      `Seeding batch ${i / BATCH_SIZE + 1} (${batch.length} recipes)...`
    );

    try {
      // Use string path to avoid importing generated api.js which causes CJS/ESM issues
      await client.mutation('recipes:saveRecipes' as any, { recipes: batch });
    } catch (error) {
      console.error(`Error seeding batch ${i / BATCH_SIZE + 1}:`, error);
    }
  }

  console.log('Seeding complete!');
}

seedRecipes().catch(console.error);
