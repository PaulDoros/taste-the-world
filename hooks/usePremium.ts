import { useAuth } from './useAuth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export type SubscriptionType = 'free' | 'monthly' | 'yearly';

export function usePremium() {
  const { user, isPremium, isAuthenticated, token } = useAuth();
  const updateSubscriptionMutation = useMutation(api.auth.updateSubscription);

  const setSubscription = async (type: SubscriptionType) => {
    if (!token) {
        // Handle guest/local state if needed, or just return
        return;
    }
    
    await updateSubscriptionMutation({
        token,
        subscriptionType: type,
        // In a real app, we'd handle payment here and pass transactionId/amount
        amount: type === 'monthly' ? 499 : type === 'yearly' ? 2999 : 0,
        transactionId: `demo_${Date.now()}`,
    });
  };

  const cancelSubscription = async () => {
      await setSubscription('free');
  };

  return {
    isPremium: !!isPremium,
    subscriptionType: (user?.subscriptionType || 'free') as SubscriptionType,
    setSubscription,
    cancelSubscription,
    isAuthenticated
  };
}
