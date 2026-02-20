import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthStore } from '@/store/authStore';
import { useState, useEffect } from 'react';
import { getGuestUser, clearGuestData } from '@/utils/guestUser';
import { useShoppingListStore } from '@/store/shoppingListStore';
import { Id } from '@/convex/_generated/dataModel';
import * as WebBrowser from 'expo-web-browser';
import { useUserStore } from '@/store/useUserStore';
import { IS_WEB } from '@/constants/platform';

// Complete OAuth session for web
if (IS_WEB) {
  WebBrowser.maybeCompleteAuthSession();
}

/**
 * Parse Convex error to extract user-friendly message
 * Strips away technical details like stack traces and request IDs
 */
function parseConvexError(error: any): string {
  if (!error) return 'An error occurred';

  // Get the error message
  let message = error.message || error.toString();

  // Remove Convex-specific prefixes like "[CONVEX M(auth:signIn)] [Request ID: ...] Server Error"
  message = message.replace(/\[CONVEX [^\]]+\]\s*/g, '');
  message = message.replace(/\[Request ID: [^\]]+\]\s*/g, '');
  message = message.replace(/^Server Error\s*/i, '');
  message = message.replace(/^Uncaught Error:\s*/i, '');

  // Remove stack trace (everything after "at handler" or similar)
  const stackStart = message.indexOf('\n    at ');
  if (stackStart !== -1) {
    message = message.substring(0, stackStart);
  }

  return message.trim();
}

/**
 * Custom hook for authentication
 * Provides sign up, sign in, sign out, and session management
 */
export function useAuth() {
  const { token, user, updateUser, signOut: storeSignOut } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token && !!user;
  const isPremium = !!user && user.subscriptionType !== 'free';

  // Mutations
  const signUpMutation = useMutation(api.auth.signUp);
  const signInMutation = useMutation(api.auth.signIn);
  const signOutMutation = useMutation(api.auth.signOut);
  const signUpWithOAuthMutation = useMutation(api.oauth.signUpWithOAuth);

  // Query current user
  const currentUser = useQuery(
    api.auth.getCurrentUser,
    token ? { token } : 'skip'
  );

  // Update user when query result changes
  // Update user when query result changes
  useEffect(() => {
    // Only update if query has finished loading (not undefined)
    if (currentUser !== undefined) {
      // If currentUser is null (invalid session) or different from stored user
      if (
        currentUser === null ||
        JSON.stringify(currentUser) !== JSON.stringify(user)
      ) {
        updateUser(currentUser);

        // Sync with useUserStore used by ExploreScreen
        if (currentUser) {
          useUserStore
            .getState()
            .login(
              { email: currentUser.email, name: currentUser.name },
              currentUser.tier,
              token || ''
            );
        }
      }
    }
  }, [currentUser, user, updateUser, token]);

  // Merge guest shopping list on auth
  const addMultipleShoppingListItems = useMutation(
    api.shoppingList.addMultipleShoppingListItems
  );

  useEffect(() => {
    const mergeShoppingList = async () => {
      if (isAuthenticated && user) {
        const localItems = useShoppingListStore.getState().items;
        if (localItems.length > 0) {
          try {
            const itemsToMerge = localItems.map((item) => ({
              name: item.name,
              measure: item.measure,
              recipeId: item.recipeId || 'custom',
              recipeName: item.recipeName || 'Custom Item',
            }));

            await addMultipleShoppingListItems({
              userId: user._id as Id<'users'>,
              items: itemsToMerge,
            });

            useShoppingListStore.getState().clearAllItems();
          } catch (e) {
            console.error('Failed to merge shopping list', e);
          }
        }
      }
    };

    mergeShoppingList();
  }, [isAuthenticated, user]);

  /**
   * Sign up a new user
   * Automatically links guest purchases and data if available
   */
  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check for guest data to link
      const guestData = await getGuestUser();
      const guestPurchases = guestData?.pendingPurchases || [];
      const guestDataToLink = guestData?.pendingData || {};

      const result = await signUpMutation({
        email,
        password,
        name,
        guestPurchases: guestPurchases.length > 0 ? guestPurchases : undefined,
        guestData:
          Object.keys(guestDataToLink).length > 0 ? guestDataToLink : undefined,
      });

      useAuthStore.setState({
        token: result.token,
        user: result.user,
      });

      // Clear guest data after successful linking
      if (guestData) {
        await clearGuestData();
      }
    } catch (err: any) {
      const errorMessage =
        parseConvexError(err) || 'Failed to sign up. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInMutation({ email, password });
      useAuthStore.setState({
        token: result.token,
        user: result.user,
      });
    } catch (err: any) {
      const errorMessage =
        parseConvexError(err) || 'Failed to sign in. Please try again.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Sign out current user
   */
  const signOut = async () => {
    if (token) {
      try {
        await signOutMutation({ token });
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    useAuthStore.setState({ token: null, user: null });
  };

  /**
   * Sign in/up with OAuth provider
   */
  const signInWithOAuth = async (
    provider: 'google' | 'apple' | 'facebook',
    oauthId: string,
    email: string,
    name?: string,
    image?: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      // Check for guest data to link
      const guestData = await getGuestUser();
      const guestPurchases = guestData?.pendingPurchases || [];
      const guestDataToLink = guestData?.pendingData || {};

      const result = await signUpWithOAuthMutation({
        provider,
        oauthId,
        email,
        name,
        image,
        guestPurchases: guestPurchases.length > 0 ? guestPurchases : undefined,
        guestData:
          Object.keys(guestDataToLink).length > 0 ? guestDataToLink : undefined,
      });

      useAuthStore.setState({
        token: result.token,
        user: result.user,
      });

      // Clear guest data after successful linking
      if (guestData) {
        await clearGuestData();
      }
    } catch (err: any) {
      const errorMessage =
        parseConvexError(err) ||
        `Failed to sign in with ${provider}. Please try again.`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    token,
    user,
    // Only show loading if we have a token but NO user data yet (and waiting for server)
    // If we have a user (persisted), we are optimistically authenticated
    isLoading: isLoading || (!!token && !user && currentUser === undefined),
    error,
    isAuthenticated,
    tier: user?.tier || 'guest',
    subscriptionType: user?.subscriptionType || 'free',
    isPremium,
    signUp,
    signIn,
    signOut,
    signInWithOAuth,
    clearError: () => setError(null),
  };
}
