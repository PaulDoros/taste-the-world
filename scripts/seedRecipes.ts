/**
 * Recipe Seeding Script
 * Loads recipes from data/recipes-seed.json into Convex database
 */

import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import recipeSeedData from '../data/recipes-seed.json';

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || '';

if (!CONVEX_URL) {
  console.error('❌ EXPO_PUBLIC_CONVEX_URL not found in environment');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

interface Recipe {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags?: string;
  ingredients: Array<{ name: string; measure: string }>;
}

async function seedRecipes() {
  console.log('🌍 Starting recipe seeding process...\n');

  const countries = Object.keys(recipeSeedData);
  console.log(`📊 Found ${countries.length} countries in seed file`);

  let totalRecipes = 0;
  let successCount = 0;
  let errorCount = 0;

  for (const country of countries) {
    const recipes = recipeSeedData[
      country as keyof typeof recipeSeedData
    ] as any[];

    if (!recipes || recipes.length === 0) {
      console.log(`⚠️  ${country}: No recipes found, skipping...`);
      continue;
    }

    // Sanitize recipes to match Convex schema
    const sanitizedRecipes = recipes.map((recipe) => ({
      idMeal: recipe.idMeal,
      strMeal: recipe.strMeal,
      strCategory: recipe.strCategory,
      strArea: recipe.strArea,
      strInstructions: recipe.strInstructions,
      strMealThumb: recipe.strMealThumb,
      // Convert nulls to undefined for optional fields
      strTags: recipe.strTags || undefined,
      strYoutube: recipe.strYoutube || undefined,
      strSource: recipe.strSource || undefined,
      ingredients: recipe.ingredients.map((ing: any) => ({
        name: ing.name,
        measure: ing.measure,
      })),
    }));

    console.log(`\n📍 ${country} (${recipes.length} recipes)`);
    totalRecipes += recipes.length;

    try {
      // Use the saveRecipes mutation from Convex
      await client.mutation(api.recipes.saveRecipes, {
        recipes: sanitizedRecipes,
      });
      successCount += recipes.length;
      console.log(`   ✅ Successfully saved ${recipes.length} recipes`);
    } catch (error) {
      errorCount += recipes.length;
      console.error(`   ❌ Error saving recipes:`, error);
    }

    // Rate limiting: small delay between countries
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(50));
  console.log('📈 SEEDING COMPLETE');
  console.log('='.repeat(50));
  console.log(`Total countries processed: ${countries.length}`);
  console.log(`Total recipes: ${totalRecipes}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('='.repeat(50) + '\n');
}

// Run the seeding
seedRecipes()
  .then(() => {
    console.log('✨ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  });
