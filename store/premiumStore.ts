import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Premium Subscription Type
 */
export type SubscriptionType = 'free' | 'weekly' | 'monthly' | 'yearly';

/**
 * Premium Store State
 */
interface PremiumStore {
  subscriptionType: SubscriptionType;
  isPremium: boolean;
  subscriptionStartDate: number | null;
  subscriptionEndDate: number | null;

  // Actions
  setSubscription: (type: SubscriptionType) => void;
  cancelSubscription: () => void;
  checkSubscriptionStatus: () => boolean;
}

/**
 * Premium Store
 * Manages premium subscription state
 */
export const usePremiumStore = create<PremiumStore>()(
  persist(
    (set, get) => ({
      subscriptionType: 'free',
      isPremium: false,
      subscriptionStartDate: null,
      subscriptionEndDate: null,

      // Set subscription
      setSubscription: (type: SubscriptionType) => {
        const now = Date.now();
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const oneMonth = 1000 * 60 * 60 * 24 * 30;
        const oneYear = 1000 * 60 * 60 * 24 * 365;

        set({
          subscriptionType: type,
          isPremium: type !== 'free',
          subscriptionStartDate: now,
          subscriptionEndDate:
            type === 'monthly'
              ? now + oneMonth
              : type === 'yearly'
                ? now + oneYear
                : null,
        });
      },

      // Cancel subscription
      cancelSubscription: () => {
        set({
          subscriptionType: 'free',
          isPremium: false,
          subscriptionStartDate: null,
          subscriptionEndDate: null,
        });
      },

      // Check if subscription is still valid
      checkSubscriptionStatus: () => {
        const state = get();

        if (state.subscriptionType === 'free') {
          return false;
        }

        if (
          state.subscriptionEndDate &&
          Date.now() > state.subscriptionEndDate
        ) {
          // Subscription expired
          set({
            subscriptionType: 'free',
            isPremium: false,
            subscriptionStartDate: null,
            subscriptionEndDate: null,
          });
          return false;
        }

        return state.isPremium;
      },
    }),
    {
      name: 'premium-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
