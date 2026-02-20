import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  saveGuestPurchase,
  getGuestUser,
  hasPendingPurchases,
} from '@/utils/guestUser';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook for handling guest purchases
 * Allows purchases without login, then links to account when created
 */
export function useGuestPurchase() {
  const { isAuthenticated, token } = useAuth();
  const updateSubscriptionMutation = useMutation(api.auth.updateSubscription);

  /**
   * Process a purchase (works for both guests and authenticated users)
   */
  const processPurchase = async (
    subscriptionType: 'monthly' | 'yearly',
    transactionId: string,
    amount: number
  ) => {
    if (isAuthenticated && token) {
      // User is logged in - process directly
      // This would typically go through a payment processor first
      // For now, we'll just update the subscription
      // In production, verify payment with your payment processor first!
      await updateSubscriptionMutation({
        token,
        subscriptionType,
        transactionId,
        amount,
      });
    } else {
      // Guest purchase - save for later linking
      await saveGuestPurchase(subscriptionType, transactionId, amount);
    }
  };

  /**
   * Check if user has pending guest purchases
   */
  const checkPendingPurchases = async () => {
    return await hasPendingPurchases();
  };

  /**
   * Get guest purchase data (for linking to account)
   */
  const getGuestPurchaseData = async () => {
    const guestData = await getGuestUser();
    return guestData?.pendingPurchases || [];
  };

  return {
    processPurchase,
    checkPendingPurchases,
    getGuestPurchaseData,
  };
}
