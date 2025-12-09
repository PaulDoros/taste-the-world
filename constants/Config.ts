/**
 * Configuration file for Taste the World
 * Contains API URLs, keys, and app settings
 */

// API Base URLs
export const API_URLS = {
  restCountries: 'https://restcountries.com/v3.1',
  mealDB: 'https://www.themealdb.com/api/json/v1/1',
  openWeather: 'https://api.openweathermap.org/data/2.5',
  unsplash: 'https://api.unsplash.com',
};

// Country Name to MealDB Area Mapping
// TheMealDB uses different area names than country names
export const COUNTRY_TO_AREA_MAP: { [key: string]: string } = {
  'United States': 'American',
  'United States of America': 'American',
  USA: 'American',
  'United Kingdom': 'British',
  'Great Britain': 'British',
  UK: 'British',
  Canada: 'Canadian',
  Australia: 'Australian',
  China: 'Chinese',
  Croatia: 'Croatian',
  Netherlands: 'Dutch',
  Egypt: 'Egyptian',
  Philippines: 'Filipino',
  France: 'French',
  Greece: 'Greek',
  India: 'Indian',
  Ireland: 'Irish',
  Italy: 'Italian',
  Jamaica: 'Jamaican',
  Japan: 'Japanese',
  Kenya: 'Kenyan',
  Malaysia: 'Malaysian',
  Mexico: 'Mexican',
  Morocco: 'Moroccan',
  Poland: 'Polish',
  Portugal: 'Portuguese',
  Russia: 'Russian',
  Spain: 'Spanish',
  Thailand: 'Thai',
  Tunisia: 'Tunisian',
  Turkey: 'Turkish',
  Ukraine: 'Ukrainian',
  Vietnam: 'Vietnamese',
};

// API Keys (we'll add these later when we sign up)
export const API_KEYS = {
  openWeather: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '',
  unsplash: process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY || '',
};

// App Configuration
export const APP_CONFIG = {
  // Free tier limits
  FREE_TIER: {
    maxCountries: 20, // Free users can browse 20 countries
    maxRecipesPerCountry: 3, // 3 recipes per country
    maxShoppingListRecipes: 3, // Max 3 recipes in shopping list
  },

  // Premium tier (unlimited)
  PREMIUM_TIER: {
    maxCountries: -1, // -1 means unlimited
    maxRecipesPerCountry: -1,
    maxShoppingListRecipes: -1,
  },

  // Featured countries for FREE users (20 countries)
  // Any country NOT in this list requires premium!
  FEATURED_COUNTRIES: [
    'United States',
    'Canada',
    'United Kingdom',
    'Spain',
    'Greece',
    'Turkey',
    'Egypt',
    'Morocco',
    'Brazil',
    'Argentina',
    'Jamaica',
    'Portugal',
    'Poland',
    'Russia',
    'Kenya',
    'Philippines',
    'Malaysia',
    'Australia',
    'Ireland',
    'Croatia',
  ],

  // Pagination
  ITEMS_PER_PAGE: 20,

  // Cache duration (in milliseconds)
  CACHE_DURATION: 1000 * 60 * 60 * 24, // 24 hours
};

// Helper function to check if a country requires premium
export const isPremiumCountry = (countryName: string): boolean => {
  return !APP_CONFIG.FEATURED_COUNTRIES.includes(countryName);
};

// Premium subscription prices (monthly/yearly)
export const SUBSCRIPTION_PRICES = {
  monthly: 4.99,
  yearly: 29.99,
  yearlySavings: '50% OFF!',
};

// Premium value proposition (for marketing)
export const PREMIUM_BENEFITS = [
  'Unlock ALL 195+ countries including Italy, France, Japan & more!',
  'Unlimited recipes from every country',
  'Advanced filters (vegetarian, vegan, difficulty)',
  'Save unlimited favorite recipes',
  'Weekly meal planner',
  'Smart shopping lists with categories',
  'Nutritional information',
  'Offline mode - download recipes',
  'Ad-free experience',
  'Priority customer support',
];

// Highlight some premium countries for marketing (not exhaustive)
export const FEATURED_PREMIUM_COUNTRIES = [
  'Italy',
  'France',
  'Japan',
  'Thailand',
  'India',
  'Mexico',
  'China',
  'Vietnam',
  'South Korea',
  'Lebanon',
  'Peru',
];
