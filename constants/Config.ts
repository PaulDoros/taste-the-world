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
  // Tier Limits
  TIERS: {
    free: {
      maxCountries: 20, // Plus earnable
      aiPromptsPerDay: 3,
      travelPromptsPerDay: 0,
      maxFavorites: 10,
      canAccessNutrition: false,
      canAccessWallet: false,
      canAccessPlanner: false,
      canDownloadOffline: false,
      hasAds: true,
    },
    personal: {
      maxCountries: -1, // Unlimited
      aiPromptsPerDay: 20,
      travelPromptsPerDay: 5,
      maxFavorites: -1,
      canAccessNutrition: true,
      canAccessWallet: true,
      canAccessPlanner: true,
      canDownloadOffline: false,
      hasAds: false,
    },
    pro: {
      maxCountries: -1,
      aiPromptsPerDay: -1,
      travelPromptsPerDay: -1,
      maxFavorites: -1,
      canAccessNutrition: true,
      canAccessWallet: true,
      canAccessPlanner: true,
      canDownloadOffline: true,
      hasAds: false,
    },
  },

  // Featured countries for FREE users (20 countries)
  // Any country NOT in this list requires unlock!
  FREE_COUNTRIES: [
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

// Helper function to check if a country is in the free list
export const isFreeCountry = (countryName: string): boolean => {
  return APP_CONFIG.FREE_COUNTRIES.includes(countryName);
};

export const PAYMENT_CONFIG = {
  currency: 'USD',
  currencySymbol: '$',
};

// Subscription Prices – fallback when RevenueCat offerings are unavailable
export const SUBSCRIPTION_PRICES = {
  personal: {
    weekly: 2.0,
    monthly: 5.99,
    yearly: 49.99,
    savings: '30%',
  },
  pro: {
    weekly: 3.5,
    monthly: 9.99,
    yearly: 89.99,
    savings: '37%',
  },
};

// Premium value proposition (for marketing)
export const PREMIUM_BENEFITS = [
  'premium_benefit_countries',
  'premium_benefit_ai',
  'premium_benefit_planner',
  'premium_benefit_recipes',

  'premium_benefit_favorites',
  'premium_benefit_shopping',
  'premium_benefit_nutri',
  'premium_benefit_offline',
  'premium_benefit_ads',
  'premium_benefit_support',
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
