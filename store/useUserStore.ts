import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserTier = 'guest' | 'free' | 'personal' | 'pro';

interface UserState {
  user: { email: string; name?: string } | null;
  isGuest: boolean;
  tier: UserTier;
  hasCompletedOnboarding: boolean;
  visitedCountries: string[]; // Array of cca2 codes
  bucketList: string[]; // Array of cca2 codes
  unlockedCountries: string[]; // Array of unlocked cca2 codes
  token: string | null;
  login: (
    user: { email: string; name?: string },
    tier?: UserTier,
    token?: string
  ) => void;
  loginAsGuest: () => void;
  logout: () => void;
  upgradeToPremium: () => void;
  completeOnboarding: () => void;
  toggleVisited: (countryCode: string) => void;
  toggleBucketList: (countryCode: string) => void;
  unlockCountry: (countryCode: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      isGuest: false,
      tier: 'guest' as UserTier,
      hasCompletedOnboarding: false,
      visitedCountries: [],
      bucketList: [],
      unlockedCountries: [
        'IT',
        'FR',
        'JP',
        'MX',
        'IN',
        'TH',
        'ES',
        'GR',
        'CN',
        'US',
      ], // Default unlocked
      token: null,
      login: (user, tier = 'free', token = '') =>
        set({ user, isGuest: false, tier, token }),
      loginAsGuest: () => set({ isGuest: true, user: null, tier: 'guest' }),
      logout: () =>
        set({
          user: null,
          isGuest: false,
          tier: 'guest',
          visitedCountries: [],
          bucketList: [],
          unlockedCountries: [
            'IT',
            'FR',
            'JP',
            'MX',
            'IN',
            'TH',
            'ES',
            'GR',
            'CN',
            'US',
          ],
          token: null,
        }),
      upgradeToPremium: () => set({ tier: 'personal' }),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
      toggleVisited: (code) =>
        set((state) => ({
          visitedCountries: state.visitedCountries.includes(code)
            ? state.visitedCountries.filter((c) => c !== code)
            : [...state.visitedCountries, code],
        })),
      toggleBucketList: (code) =>
        set((state) => ({
          bucketList: state.bucketList.includes(code)
            ? state.bucketList.filter((c) => c !== code)
            : [...state.bucketList, code],
        })),
      unlockCountry: (code) =>
        set((state) => ({
          unlockedCountries: state.unlockedCountries.includes(code)
            ? state.unlockedCountries
            : [...state.unlockedCountries, code],
        })),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tier: state.tier,
        // isGuest is NOT persisted so that we show welcome screen on every launch for guests
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        visitedCountries: state.visitedCountries,
        bucketList: state.bucketList,
        unlockedCountries: state.unlockedCountries,
        token: state.token,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from v0 to v1: Remove isGuest from persisted state
          const { isGuest, ...rest } = persistedState;
          return {
            ...rest,
            isGuest: false, // Ensure isGuest is false
          };
        }
        return persistedState;
      },
    }
  )
);
