import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { APP_CONFIG, isFreeCountry } from '@/constants/Config';
import { useAuthStore } from '@/store/authStore';

type FeatureType =
  | 'nutrition'
  | 'offline'
  | 'travel'
  | 'baby'
  | 'wallet'
  | 'planner';

export const useTierLimit = () => {
  const usageStatus = useQuery(api.monetization.getUsageStatus);
  const incrementUsageMutation = useMutation(api.monetization.incrementUsage);
  const { user } = useAuthStore();

  const isLoading = usageStatus === undefined;

  // Default values until loaded
  const tier = usageStatus?.tier || user?.tier || 'free';
  const unlockedCountries = usageStatus?.unlockedCountries || [];

  // Helper to check if a specific feature is accessible

  const canAccessFeature = (feature: FeatureType): boolean => {
    // Strict check for guest users
    const isGuest = tier === 'guest' || user?.email?.includes('@guest.local');

    if (isGuest) {
      // Guests have NO access to these premium features
      if (
        feature === 'wallet' ||
        feature === 'planner' ||
        feature === 'offline' ||
        feature === 'travel' ||
        feature === 'baby'
      ) {
        return false;
      }
    }

    switch (feature) {
      case 'nutrition':
        // Personal and PRO
        return tier === 'personal' || tier === 'pro';
      case 'offline':
        // PRO only
        return tier === 'pro';
      case 'baby':
        // PRO only
        return tier === 'pro';
      case 'travel':
        // Personal (limited) and PRO (unlimited)
        return tier === 'personal' || tier === 'pro';
      case 'wallet':
        // Personal and PRO
        return tier === 'personal' || tier === 'pro';
      case 'planner':
        // Personal and PRO
        return tier === 'personal' || tier === 'pro';
      default:
        return false;
    }
  };

  // Check if a country is unlocked
  const isCountryUnlocked = (
    countryName: string,
    countryCode: string
  ): boolean => {
    if (tier === 'personal' || tier === 'pro') return true;

    // Check if in default free list
    if (isFreeCountry(countryName)) return true;

    // Check if unlocked via ads
    return (
      unlockedCountries.includes(countryCode) ||
      unlockedCountries.includes(countryName)
    );
  };

  // Check AI limits
  const checkAiLimit = (): {
    allowed: boolean;
    remaining: number;
    limit: number;
  } => {
    if (!usageStatus) return { allowed: true, remaining: 3, limit: 3 }; // Optimistic default

    return {
      allowed: usageStatus.canUseAi,
      remaining: usageStatus.remainingAi,
      limit: usageStatus.aiLimit,
    };
  };

  const incrementAiUsage = async () => {
    await incrementUsageMutation({ type: 'ai' });
  };

  const incrementTravelUsage = async () => {
    await incrementUsageMutation({ type: 'travel' });
  };

  return {
    tier,
    isLoading,
    canAccessFeature,
    isCountryUnlocked,
    checkAiLimit,
    incrementAiUsage,
    incrementTravelUsage,
    usage: usageStatus,
  };
};
