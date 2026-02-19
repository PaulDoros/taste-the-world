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

// Module-level lock — shared across ALL usePremium() instances
let _lastIdentifiedId: string | null = null;
let _isIdentifying = false;

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
        if (Platform.OS === 'web') {
          setIsReady(true);
          return;
        }

        const configured = await Purchases.isConfigured();
        if (!configured) {
          setIsReady(true);
          return;
        }

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

  // Identify user in RevenueCat (module-level lock prevents concurrent calls)
  useEffect(() => {
    const identify = async () => {
      if (user && user._id) {
        // Already identified with this ID or another call in progress
        if (_lastIdentifiedId === user._id || _isIdentifying) return;

        _isIdentifying = true;
        try {
          if (await Purchases.isConfigured()) {
            await Purchases.logIn(user._id);
            _lastIdentifiedId = user._id;
          }
        } catch (e) {
          console.warn('RC Login Error:', e);
        } finally {
          _isIdentifying = false;
        }
      } else if (!user && _lastIdentifiedId) {
        // Reset on logout
        _lastIdentifiedId = null;
      }
    };
    identify();
  }, [user?._id]);

  const purchasePackage = async (pack: PurchasesPackage) => {
    console.log(
      '[usePremium] Initiating purchase for:',
      pack.product.identifier
    );
    try {
      const configured = await Purchases.isConfigured();
      if (!configured) {
        Alert.alert(
          'Unavailable',
          'Purchases require a development build or RevenueCat Test Store key in Expo Go.'
        );
        return false;
      }

      setIsProcessing(true);
      const { customerInfo } = await Purchases.purchasePackage(pack);
      console.log(
        '[usePremium] Purchase result:',
        customerInfo.entitlements.active
      );

      // Check if user has ANY active entitlement
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
        // Sync with Convex
        console.log('[usePremium] Syncing with Convex...');
        await syncSubscriptionWithConvex(pack);
        return true;
      }
    } catch (e: any) {
      console.warn('[usePremium] Purchase error:', e);
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
      const configured = await Purchases.isConfigured();
      if (!configured) {
        Alert.alert(
          'Unavailable',
          'Purchases require a development build or RevenueCat Test Store key in Expo Go.'
        );
        return false;
      }

      const customerInfo = await Purchases.restorePurchases();
      if (Object.keys(customerInfo.entitlements.active).length > 0) {
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
