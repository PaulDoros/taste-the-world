import fs from 'fs';
import path from 'path';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../convex/_generated/api';
import * as dotenv from 'dotenv';

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!CONVEX_URL) {
  console.error('❌ Error: EXPO_PUBLIC_CONVEX_URL is not set in .env');
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// File path for the recipes JSON
const RECIPES_FILE = path.join(__dirname, '../app/recipe/recipies.json');

/**
 * Robustly parses a malformed JSON file containing multiple country keys.
 * Uses Regex to identify country blocks e.g. "CountryName": [ ... ]
 */
async function main() {
  console.log('🚀 Starting recipe import (Regex Matcher Mode)...');

  // 1. Load Recipes File
  if (!fs.existsSync(RECIPES_FILE)) {
    console.error(`❌ Error: Recipes file not found at ${RECIPES_FILE}`);
    process.exit(1);
  }

  console.log('📖 Loading recipes.json...');
  let fileContent = fs.readFileSync(RECIPES_FILE, 'utf-8');

  // SANITIZATION: Fix unescaped newlines which break parsing
  fileContent = fileContent.replace(/[\r\n]+/g, ' ');

  // 2. Identify Country Blocks
  // Pattern: "CountryName": [ starts a block.
  // We will find all occurrences of this pattern and try to extract the array.

  const countryRegex = /"([\w\s.’'-]+)":\s*\[/g;
  let match;
  let totalImported = 0;

  while ((match = countryRegex.exec(fileContent)) !== null) {
    const countryName = match[1];
    const startIndex = match.index; // Start of "Country": [
    const arrayStartIndex = fileContent.indexOf('[', startIndex);

    // Find matching closing bracket for this array
    const arrayEndIndex = findBalancedClose(fileContent, arrayStartIndex);

    if (arrayEndIndex === -1) {
      console.warn(
        `⚠️ Could not find closing bracket for ${countryName}. Skipping.`
      );
      continue;
    }

    const jsonString = fileContent.substring(
      arrayStartIndex,
      arrayEndIndex + 1
    );

    try {
      const recipes = JSON.parse(jsonString);

      // VALIDATION: Check if this is actually a recipe array (must have 'idMeal')
      // The parser might pick up "ingredients": [ ... ] arrays which we must skip.
      if (
        Array.isArray(recipes) &&
        recipes.length > 0 &&
        !recipes[0].hasOwnProperty('idMeal')
      ) {
        // console.log(`⏩ Skipping block for ${countryName}: Not a recipe array (likely ingredients list).`);
        continue;
      }

      if (Array.isArray(recipes) && recipes.length > 0) {
        console.log(
          `\nProcessing ${countryName} (${recipes.length} recipes)...`
        );
        await importRecipes(countryName, recipes);
        totalImported += recipes.length;
      }
    } catch (e: any) {
      console.error(`❌ Failed to parse block for ${countryName}:`, e.message);
    }
  }

  console.log('\n=========================================');
  console.log(`🎉 Import Complete!`);
  console.log(`Total Recipes Processed: ${totalImported}`);
  console.log('=========================================\n');
}

/**
 * Finds the index of the closing ']' that balances the '[' at startIndex.
 */
function findBalancedClose(str: string, startIndex: number): number {
  let depth = 0;
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '[') depth++;
    else if (str[i] === ']') depth--;

    if (depth === 0) return i;
  }
  return -1;
}

async function importRecipes(country: string, recipes: any[]) {
  if (!Array.isArray(recipes) || recipes.length === 0) {
    return;
  }

  const preparedRecipes = recipes.map((r: any) => ({
    idMeal: r.idMeal,
    strMeal: r.strMeal,
    strCategory: r.strCategory,
    strArea: r.strArea || country, // Fallback to country key if area missing
    strInstructions: r.strInstructions,
    strMealThumb: r.strMealThumb,
    strTags: r.strTags || undefined,
    strYoutube: r.strYoutube || undefined,
    strSource: r.strSource || undefined,
    ingredients: (r.ingredients || []).map((i: any) => ({
      name: i.name,
      measure: i.measure,
    })),
  }));

  try {
    await client.mutation(api.recipes.saveRecipes, {
      recipes: preparedRecipes,
    });
    console.log(
      `  ✅ Imported/Updated ${preparedRecipes.length} recipes for ${country}`
    );
  } catch (error) {
    console.error(`  ❌ Failed to import ${country}:`, error);
  }
}

main().catch(console.error);
