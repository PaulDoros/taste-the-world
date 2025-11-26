/**
 * Recipe Coverage Checker
 * Checks which countries have recipes and which need manual curation
 */

import { COUNTRY_TO_AREA_MAP } from '../constants/Config';

const API_NINJAS_KEY = process.env.EXPO_PUBLIC_API_NINJAS_KEY || '';

interface CountryRecipeStatus {
  country: string;
  mealDBCount: number;
  apiNinjasCount: number;
  totalCount: number;
  status: 'good' | 'warning' | 'critical';
}

async function checkCountryRecipes(
  countryName: string,
  area: string
): Promise<CountryRecipeStatus> {
  let mealDBCount = 0;
  let apiNinjasCount = 0;

  // 1. Check TheMealDB
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`
    );
    if (response.ok) {
      const data = await response.json();
      mealDBCount = data.meals?.length || 0;
    }
  } catch (error) {
    console.error(`Error checking MealDB for ${countryName}:`, error);
  }

  // 2. Check API-Ninjas (if we have few results)
  if (mealDBCount < 5 && API_NINJAS_KEY) {
    try {
      const response = await fetch(
        `https://api.api-ninjas.com/v1/recipe?query=${encodeURIComponent(countryName)}&limit=10`,
        { headers: { 'X-Api-Key': API_NINJAS_KEY.trim() } }
      );
      if (response.ok) {
        const data = await response.json();
        apiNinjasCount = data.length || 0;
      }
    } catch (error) {
      console.error(`Error checking API-Ninjas for ${countryName}:`, error);
    }
  }

  const totalCount = mealDBCount + apiNinjasCount;
  const status =
    totalCount >= 5 ? 'good' : totalCount > 0 ? 'warning' : 'critical';

  return {
    country: countryName,
    mealDBCount,
    apiNinjasCount,
    totalCount,
    status,
  };
}

async function getAllCountries() {
  const response = await fetch(
    'https://restcountries.com/v3.1/all?fields=name'
  );
  const data = await response.json();
  return data.map((c: any) => c.name.common);
}

async function main() {
  console.log('🔍 Starting Recipe Coverage Check...\n');

  const countries = await getAllCountries();
  console.log(`📊 Found ${countries.length} countries\n`);

  const results: CountryRecipeStatus[] = [];

  // Check each country
  for (let i = 0; i < countries.length; i++) {
    const country = countries[i];
    const area = COUNTRY_TO_AREA_MAP[country] || country;

    process.stdout.write(
      `[${i + 1}/${countries.length}] Checking ${country}...`
    );

    const result = await checkCountryRecipes(country, area);
    results.push(result);

    console.log(` ${result.totalCount} recipes (${result.status})`);

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Generate report
  console.log('\n📈 REPORT\n');

  const good = results.filter((r) => r.status === 'good');
  const warning = results.filter((r) => r.status === 'warning');
  const critical = results.filter((r) => r.status === 'critical');

  console.log(`✅ Good (5+ recipes): ${good.length}`);
  console.log(`⚠️  Warning (1-4 recipes): ${warning.length}`);
  console.log(`❌ Critical (0 recipes): ${critical.length}\n`);

  console.log('Countries needing attention (0-4 recipes):\n');
  [...critical, ...warning]
    .sort((a, b) => a.totalCount - b.totalCount)
    .forEach((r) => {
      console.log(`  ${r.country.padEnd(30)} ${r.totalCount} recipes`);
    });

  // Save to JSON
  const fs = await import('fs');
  fs.writeFileSync(
    'recipe-coverage-report.json',
    JSON.stringify({ good, warning, critical }, null, 2)
  );

  console.log('\n💾 Report saved to recipe-coverage-report.json');
}

main().catch(console.error);
