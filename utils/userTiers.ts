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
  personal: {
    countries: Infinity,
    offlineMaps: Infinity,
    aiRecipes: Infinity,
    hasAds: false,
    adTypes: [] as const,
  },
  pro: {
    countries: Infinity,
    offlineMaps: Infinity,
    aiRecipes: Infinity,
    hasAds: false,
    adTypes: [] as const,
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
  // Fallback to free if tier not found (safety)
  const limits = TIER_LIMITS[tier] || TIER_LIMITS.free;
  const limit = limits.countries;
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
    personal: 'Personal',
    pro: 'Pro',
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
    personal: '#8B5CF6', // violet
    pro: '#8B5CF6', // violet
    premium: '#F59E0B', // gold
  }[tier];
}

/**
 * Check if user should see ads
 */
export function shouldShowAds(tier: UserTier): boolean {
  // Safe access with fallback
  return TIER_LIMITS[tier]?.hasAds ?? true;
}

/**
 * Get allowed ad types for tier
 */
export function getAllowedAdTypes(tier: UserTier): readonly string[] {
  // Safe access with fallback
  return TIER_LIMITS[tier]?.adTypes ?? ['banner'];
}
