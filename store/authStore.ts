import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export interface User {
  _id: string;
  email: string;
  name?: string;
  image?: string;
  subscriptionType: "free" | "monthly" | "yearly";
  subscriptionStartDate?: number;
  subscriptionEndDate?: number;
  createdAt: number;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  
  // Actions
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifySession: () => Promise<void>;
  updateUser: (user: User) => void;
}

/**
 * Auth Store
 * Manages user authentication state
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      signUp: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          // This will be called from component using useMutation
          // For now, just set loading state
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          // This will be called from component using useMutation
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signOut: async () => {
        const { token } = get();
        if (token) {
          // Call signOut mutation (will be done in component)
        }
        set({ token: null, user: null });
      },

      verifySession: async () => {
        const { token } = get();
        if (!token) {
          set({ user: null });
          return;
        }
        
        set({ isLoading: true });
        try {
          // This will be called from component using useQuery
          set({ isLoading: false });
        } catch (error) {
          set({ token: null, user: null, isLoading: false });
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ token: state.token }), // Only persist token, not user
    }
  )
);

/**
 * Hook to use authentication in components
 */
export function useAuth() {
  const { token, user, isLoading, signOut, updateUser } = useAuthStore();
  
  // Verify session on mount
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : "skip"
  );

  // Update user when query result changes
  if (currentUser && currentUser !== user) {
    updateUser(currentUser);
  }

  const isAuthenticated = !!token && !!user;
  const isPremium = user?.subscriptionType !== "free";

  return {
    token,
    user,
    isLoading: isLoading || (token && currentUser === undefined),
    isAuthenticated,
    isPremium,
    signOut,
  };
}

