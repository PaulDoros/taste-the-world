import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserTier = 'guest' | 'free' | 'premium';

interface UserState {
  user: { email: string; name?: string } | null;
  isGuest: boolean;
  tier: UserTier;
  hasCompletedOnboarding: boolean;
  visitedCountries: string[]; // Array of cca2 codes
  bucketList: string[]; // Array of cca2 codes
  login: (user: { email: string; name?: string }, tier?: UserTier) => void;
  loginAsGuest: () => void;
  logout: () => void;
  upgradeToPremium: () => void;
  completeOnboarding: () => void;
  toggleVisited: (countryCode: string) => void;
  toggleBucketList: (countryCode: string) => void;
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
      login: (user, tier = 'free') => set({ user, isGuest: false, tier }),
      loginAsGuest: () => set({ isGuest: true, user: null, tier: 'guest' }),
      logout: () =>
        set({
          user: null,
          isGuest: false,
          tier: 'guest',
          visitedCountries: [],
          bucketList: [],
        }),
      upgradeToPremium: () => set({ tier: 'premium' }),
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
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
