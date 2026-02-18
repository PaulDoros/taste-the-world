import { useAuth } from './useAuth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Purchases, {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';
import { useEffect, useState } from 'react';
import { Alert, Platform, Linking } from 'react-native';

export type SubscriptionType = 'free' | 'weekly' | 'monthly' | 'yearly';

export function usePremium() {
  const { user, isPremium: isPremiumAuth, isAuthenticated, token } = useAuth();
  const updateSubscriptionMutation = useMutation(api.auth.updateSubscription);
  const [offerings, setOfferings] = useState<PurchasesPackage[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize and fetch offerings
  useEffect(() => {
    const setup = async () => {
      try {
        if (Platform.OS === 'web') return;

        // Get offerings
        const offerings = await Purchases.getOfferings();
        if (
          offerings.current !== null &&
          offerings.current.availablePackages.length !== 0
        ) {
          setOfferings(offerings.current.availablePackages);
        }
        setIsReady(true);
      } catch (e) {
        console.error('Error fetching offerings', e);
      }
    };
    setup();
  }, []);

  // Identify user in RevenueCat
  useEffect(() => {
    const identify = async () => {
      if (user && user._id) {
        try {
          if (await Purchases.isConfigured()) {
            await Purchases.logIn(user._id);
          }
        } catch (e) {
          console.warn('RC Login Error:', e);
        }
      }
    };
    identify();
  }, [user?._id]);

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      setIsProcessing(true);
      const { customerInfo } = await Purchases.purchasePackage(pack);

      // Check if user is now entitled
      if (
        customerInfo.entitlements.active['premium_access'] !== undefined || // Personal
        customerInfo.entitlements.active['pro_access'] !== undefined // Pro
      ) {
        // Sync with Convex
        // Ideally this happens via webhook, but we do optimistic update here
        await syncSubscriptionWithConvex(pack);
        return true;
      }
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert('Error', e.message);
      }
    } finally {
      setIsProcessing(false);
    }
    return false;
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (
        customerInfo.entitlements.active['premium_access'] !== undefined ||
        customerInfo.entitlements.active['pro_access'] !== undefined
      ) {
        Alert.alert('Success', 'Purchases restored successfully!');
        // In a real app we would determine which plan it was
        return true;
      } else {
        Alert.alert('Info', 'No active subscriptions found to restore.');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
    return false;
  };

  const syncSubscriptionWithConvex = async (pack: PurchasesPackage) => {
    if (!token) return;

    // Map RevenueCat package to our internal types
    const identifier = pack.product.identifier;
    let type: SubscriptionType = 'monthly';
    let tier: 'personal' | 'pro' = 'personal';

    if (identifier.includes('weekly')) type = 'weekly';
    else if (identifier.includes('yearly')) type = 'yearly';

    if (identifier.includes('pro')) tier = 'pro';

    await updateSubscriptionMutation({
      token,
      subscriptionType: type,
      tier,
      amount: pack.product.price,
      transactionId: `rc_${Date.now()}`, // Temporary ID until webhook syncs
    });
  };

  const cancelSubscription = async () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('https://apps.apple.com/account/subscriptions');
    } else if (Platform.OS === 'android') {
      Linking.openURL('https://play.google.com/store/account/subscriptions');
    }
  };

  return {
    isPremium: !!isPremiumAuth, // convex is source of truth for UI
    subscriptionType: (user?.subscriptionType || 'free') as SubscriptionType,
    offerings,
    isReady,
    purchasePackage,
    restorePurchases,
    cancelSubscription,
    isAuthenticated,
    isProcessing,
  };
}
