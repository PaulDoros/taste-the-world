import { UserTier } from '../store/useUserStore';

/**
 * User Tier Configuration
 */
export const TIER_LIMITS = {
  guest: {
    countries: 10,
    offlineMaps: 0,
    aiRecipes: 0,
    hasAds: true,
    adTypes: ['banner', 'interstitial'] as const,
  },
  free: {
    countries: 22,
    offlineMaps: 3,
    aiRecipes: 5, // per day
    hasAds: true,
    adTypes: ['banner'] as const,
  },
  premium: {
    countries: Infinity,
    offlineMaps: Infinity,
    aiRecipes: Infinity,
    hasAds: false,
    adTypes: [] as const,
  },
};

/**
 * Check if user can access a country based on their tier
 */
export function canAccessCountry(
  tier: UserTier,
  countryIndex: number
): boolean {
  const limit = TIER_LIMITS[tier].countries;
  return countryIndex < limit;
}

/**
 * Check if user has access to a specific feature
 */
export function hasFeatureAccess(
  tier: UserTier,
  feature: 'offlineMaps' | 'aiRecipes' | 'cameraPantry' | 'communitySubmit'
): boolean {
  switch (feature) {
    case 'offlineMaps':
      return TIER_LIMITS[tier].offlineMaps > 0;
    case 'aiRecipes':
      return TIER_LIMITS[tier].aiRecipes > 0;
    case 'cameraPantry':
      return tier !== 'guest';
    case 'communitySubmit':
      return tier !== 'guest';
    default:
      return false;
  }
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: UserTier): string {
  return {
    guest: 'Guest',
    free: 'Free',
    premium: 'Premium',
  }[tier];
}

/**
 * Get tier badge color
 */
export function getTierColor(tier: UserTier): string {
  return {
    guest: '#9CA3AF', // gray
    free: '#3B82F6', // blue
    premium: '#F59E0B', // gold
  }[tier];
}

/**
 * Check if user should see ads
 */
export function shouldShowAds(tier: UserTier): boolean {
  return TIER_LIMITS[tier].hasAds;
}

/**
 * Get allowed ad types for tier
 */
export function getAllowedAdTypes(tier: UserTier): readonly string[] {
  return TIER_LIMITS[tier].adTypes;
}
