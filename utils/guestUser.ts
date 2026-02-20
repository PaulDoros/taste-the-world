import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Generate a unique guest ID
 */
function generateGuestId(): string {
  return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Guest User Utility
 * Manages guest user sessions and data linking
 */

export interface GuestUser {
  guestId: string;
  createdAt: number;
  pendingPurchases: Array<{
    subscriptionType: 'monthly' | 'yearly';
    transactionId: string;
    amount: number;
    purchaseDate: number;
  }>;
  pendingData: {
    favorites?: string[];
    shoppingList?: any[];
    pantry?: any[];
    recipeHistory?: any[];
  };
}

const GUEST_STORAGE_KEY = 'guest-user-data';

/**
 * Generate or retrieve guest ID
 */
export async function getGuestId(): Promise<string> {
  try {
    const guestData = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
    if (guestData) {
      const parsed: GuestUser = JSON.parse(guestData);
      return parsed.guestId;
    }

    // Create new guest user
    const newGuest: GuestUser = {
      guestId: generateGuestId(),
      createdAt: Date.now(),
      pendingPurchases: [],
      pendingData: {},
    };

    await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newGuest));
    return newGuest.guestId;
  } catch (error) {
    console.error('Error getting guest ID:', error);
    // Fallback: generate a simple ID
    return `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Get full guest user data
 */
export async function getGuestUser(): Promise<GuestUser | null> {
  try {
    const guestData = await AsyncStorage.getItem(GUEST_STORAGE_KEY);
    if (guestData) {
      return JSON.parse(guestData);
    }
    return null;
  } catch (error) {
    console.error('Error getting guest user:', error);
    return null;
  }
}

/**
 * Save guest purchase (to be linked when account is created)
 */
export async function saveGuestPurchase(
  subscriptionType: 'monthly' | 'yearly',
  transactionId: string,
  amount: number
): Promise<void> {
  try {
    const guestData = await getGuestUser();
    if (!guestData) {
      const guestId = await getGuestId();
      const newGuest: GuestUser = {
        guestId,
        createdAt: Date.now(),
        pendingPurchases: [
          {
            subscriptionType,
            transactionId,
            amount,
            purchaseDate: Date.now(),
          },
        ],
        pendingData: {},
      };
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newGuest));
      return;
    }

    guestData.pendingPurchases.push({
      subscriptionType,
      transactionId,
      amount,
      purchaseDate: Date.now(),
    });

    await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
  } catch (error) {
    console.error('Error saving guest purchase:', error);
  }
}

/**
 * Save guest data (favorites, shopping list, etc.)
 */
export async function saveGuestData(
  data: Partial<GuestUser['pendingData']>
): Promise<void> {
  try {
    const guestData = await getGuestUser();
    if (!guestData) {
      const guestId = await getGuestId();
      const newGuest: GuestUser = {
        guestId,
        createdAt: Date.now(),
        pendingPurchases: [],
        pendingData: data,
      };
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(newGuest));
      return;
    }

    guestData.pendingData = {
      ...guestData.pendingData,
      ...data,
    };

    await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestData));
  } catch (error) {
    console.error('Error saving guest data:', error);
  }
}

/**
 * Clear guest data (after successful account linking)
 */
export async function clearGuestData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(GUEST_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing guest data:', error);
  }
}

/**
 * Check if user has pending guest purchases
 */
export async function hasPendingPurchases(): Promise<boolean> {
  try {
    const guestData = await getGuestUser();
    return guestData ? guestData.pendingPurchases.length > 0 : false;
  } catch (error) {
    return false;
  }
}
