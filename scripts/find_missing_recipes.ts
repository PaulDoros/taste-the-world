import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { COUNTRY_TO_AREA_MAP } from '../constants/Config';

// Define paths
const COUNTRIES_FILE = path.join(__dirname, '../assets/countries.json');

async function main() {
  console.log('🌍 checksMissingRecipes Script Started');

  // 1. Load Countries
  console.log('📖 Loading countries from assets...');
  if (!fs.existsSync(COUNTRIES_FILE)) {
    console.error(`❌ Error: Countries file not found at ${COUNTRIES_FILE}`);
    process.exit(1);
  }

  const countriesData = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  const countries = countriesData.features || [];
  console.log(`✅ Loaded ${countries.length} countries.`);

  // 2. Fetch Existing Recipe Areas from Convex
  console.log('📡 Fetching existing recipe areas from Convex...');
  let existingAreas: string[] = [];
  try {
    // Run convex command strictly to get JSON output if possible, but 'convex run' outputs generic text.
    // We'll parse the output. output is usually "Result: ["Area1", "Area2"]"
    const output = execSync('npx convex run recipes:getAllRecipeAreas', {
      encoding: 'utf-8',
    });

    // Parse the array from the output string
    // Output format is typically: "Result: [ ... ]" or just the JSON if piped used?
    // Let's assume standard output format "Result: [...]"
    // We will look for the first '[' and last ']'
    const startIndex = output.indexOf('[');
    const endIndex = output.lastIndexOf(']');

    if (startIndex !== -1 && endIndex !== -1) {
      const jsonStr = output.substring(startIndex, endIndex + 1);
      existingAreas = JSON.parse(jsonStr);
      console.log(
        `✅ Found ${existingAreas.length} active recipe areas in database.`
      );
    } else {
      console.error('❌ Failed to parse Convex output:', output);
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error running convex command:', error);
    process.exit(1);
  }

  // 3. Compare and Identify Missing
  console.log('🔍 Analyzing coverage...');

  const missingCountries: { name: string; expectedArea: string }[] = [];
  const coveredCountries: string[] = [];

  // Create a Set of normalized existing areas for case-insensitive check
  const existingSet = new Set(existingAreas.map((a) => a.toLowerCase()));

  for (const feature of countries) {
    const countryName = feature.properties?.NAME;
    if (!countryName) continue;

    // Determine the expected area name
    // 1. Check mapping
    // 2. Fallback to Country Name (some API areas match country names exactly)
    let expectedArea = COUNTRY_TO_AREA_MAP[countryName];

    // Logic: If mapped, we check the mapped area.
    // If NOT mapped, we assume the area might be the country name itself
    // BUT TheMealDB uses demonyms strictly (American, British, Canadian).
    // If a country is not in our map, it likely doesn't have a mapped area.
    // However, we should check if the country name ITSELF exists in the DB (just in case).

    let isCovered = false;

    if (expectedArea) {
      if (existingSet.has(expectedArea.toLowerCase())) {
        isCovered = true;
      }
    } else {
      // No explicit mapping. Check if country name works as area (e.g. "Kenya" -> "Kenyan" might fail without map)
      // But maybe "Kenya" exists in DB?
      if (existingSet.has(countryName.toLowerCase())) {
        isCovered = true;
        expectedArea = countryName; // It matched directly
      }
    }

    if (isCovered) {
      coveredCountries.push(countryName);
    } else {
      missingCountries.push({
        name: countryName,
        expectedArea:
          expectedArea ||
          "(No mapping found - needs 'American/British' style demonym)",
      });
    }
  }

  // 4. Output Results
  console.log('\n=========================================');
  console.log(`📊 COVERAGE REPORT`);
  console.log('=========================================');
  console.log(`✅ Covered Countries: ${coveredCountries.length}`);
  console.log(`❌ Missing Countries: ${missingCountries.length}`);
  console.log('=========================================\n');

  if (missingCountries.length > 0) {
    console.log('❌ MISSING COUNTRIES LIST:');
    missingCountries.forEach((c) => {
      console.log(`- ${c.name} (Expected Area: ${c.expectedArea})`);
    });

    // Save to file
    const outputPath = path.join(__dirname, 'missing_recipes.json');
    fs.writeFileSync(outputPath, JSON.stringify(missingCountries, null, 2));
    console.log(`\n💾 Saved missing list to ${outputPath}`);
  } else {
    console.log('🎉 Amazing! All countries have recipes!');
  }
}

main().catch(console.error);
