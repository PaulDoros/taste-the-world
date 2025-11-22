/**
 * Home Screen Configuration
 * Centralized constants for home page layout and content
 */

export const REGION_CONFIG = [
  { name: 'Africa', icon: 'globe-africa', color: '#F59E0B' },
  { name: 'Americas', icon: 'globe-americas', color: '#10B981' },
  { name: 'Asia', icon: 'globe-asia', color: '#EF4444' },
  { name: 'Europe', icon: 'globe-europe', color: '#3B82F6' },
  { name: 'Oceania', icon: 'globe', color: '#8B5CF6' },
] as const;

export const HOME_STATS = {
  RECIPES: '1000+',
  REGIONS: 5,
} as const;

export const CARD_DIMENSIONS = {
  FEATURED_COUNTRY_WIDTH: 0.7, // 70% of screen width
  FEATURED_RECIPE_WIDTH: 0.6, // 60% of screen width
} as const;

