import { useAuth } from './useAuth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export type SubscriptionType = 'free' | 'monthly' | 'yearly';

export function usePremium() {
  const { user, isPremium, isAuthenticated, token } = useAuth();
  const updateSubscriptionMutation = useMutation(api.auth.updateSubscription);

  const setSubscription = async (
    type: SubscriptionType,
    tier?: 'personal' | 'pro'
  ) => {
    if (!token) {
      // Handle guest/local state if needed, or just return
      return;
    }

    // Determine amount based on tier and type
    let amount = 0;
    if (tier === 'pro') {
      amount = type === 'monthly' ? 1199 : 8999;
    } else {
      // Default to personal
      amount = type === 'monthly' ? 599 : 4999;
    }

    await updateSubscriptionMutation({
      token,
      subscriptionType: type,
      tier: tier || 'personal',
      // In a real app, we'd handle payment here and pass transactionId/amount
      amount,
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
    isAuthenticated,
  };
}
