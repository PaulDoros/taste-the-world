import * as StoreReview from 'expo-store-review';
import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { haptics } from './haptics';

/**
 * Rate App Utility
 * Prompts users to rate the app in the App Store/Play Store
 */

const RATED_KEY = '@taste_the_world:has_rated';
const RATE_PROMPT_COUNT_KEY = '@taste_the_world:rate_prompt_count';

// App Store URLs (update these when app is published)
// App Store URLs (update these when app is published)
const IOS_APP_URL = 'https://apps.apple.com/app/taste-the-world/id000000000';
const ANDROID_APP_URL =
  'https://play.google.com/store/apps/details?id=com.tastetheworld';

/**
 * Check if the user has already rated the app
 */
export const hasUserRated = async (): Promise<boolean> => {
  try {
    const rated = await AsyncStorage.getItem(RATED_KEY);
    return rated === 'true';
  } catch (error) {
    console.error('Error checking if user has rated:', error);
    return false;
  }
};

/**
 * Mark that the user has rated the app
 */
const markAsRated = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(RATED_KEY, 'true');
  } catch (error) {
    console.error('Error marking app as rated:', error);
  }
};

/**
 * Get the number of times the user has been prompted to rate
 */
export const getRatePromptCount = async (): Promise<number> => {
  try {
    const count = await AsyncStorage.getItem(RATE_PROMPT_COUNT_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting rate prompt count:', error);
    return 0;
  }
};

/**
 * Increment the rate prompt counter
 */
const incrementRatePromptCount = async (): Promise<void> => {
  try {
    const count = await getRatePromptCount();
    await AsyncStorage.setItem(RATE_PROMPT_COUNT_KEY, (count + 1).toString());
  } catch (error) {
    console.error('Error incrementing rate prompt count:', error);
  }
};

/**
 * Request the user to rate the app
 * Uses in-app review on supported devices, falls back to store URL
 */
export const requestRating = async (): Promise<void> => {
  try {
    // Check if user has already rated
    const hasRated = await hasUserRated();
    if (hasRated) {
      Alert.alert(
        '❤️ Thank You!',
        "You've already rated Taste the World. We appreciate your support!",
        [{ text: 'OK', onPress: () => haptics.light() }]
      );
      return;
    }

    // Increment prompt count
    await incrementRatePromptCount();

    // Check if in-app review is available
    const isAvailable = await StoreReview.isAvailableAsync();

    if (isAvailable) {
      try {
        // Use in-app review (iOS 10.3+, Android 5.0+)
        // Note: This only works on production builds from App Store/Play Store
        await StoreReview.requestReview();
        await markAsRated();
        haptics.success();
      } catch (reviewError) {
        // In-app review failed (common in development)
        // Fall back to opening store URL
        console.log(
          'In-app review not available, falling back to store URL:',
          reviewError
        );
        await openStoreForRating();
      }
    } else {
      // Fallback to opening store URL
      await openStoreForRating();
    }
  } catch (error) {
    console.error('Error requesting rating:', error);
    haptics.error();
    Alert.alert(
      'Rate Taste the World',
      'Would you like to rate us? We appreciate your feedback!',
      [
        {
          text: 'Not Now',
          style: 'cancel',
          onPress: () => haptics.light(),
        },
        {
          text: 'Rate Now',
          onPress: async () => {
            await openStoreForRating();
          },
        },
      ]
    );
  }
};

/**
 * Open the app store for rating (fallback method)
 */
const openStoreForRating = async (): Promise<void> => {
  const storeUrl = Platform.OS === 'ios' ? IOS_APP_URL : ANDROID_APP_URL;

  Alert.alert(
    '⭐ Rate Taste the World',
    'Would you like to rate us on the App Store? Your feedback helps us improve!',
    [
      {
        text: 'Not Now',
        style: 'cancel',
        onPress: () => haptics.light(),
      },
      {
        text: 'Rate Now',
        onPress: async () => {
          try {
            const supported = await Linking.canOpenURL(storeUrl);
            if (supported) {
              await Linking.openURL(storeUrl);
              await markAsRated();
              haptics.success();
            } else {
              Alert.alert('Error', 'Unable to open the App Store');
              haptics.error();
            }
          } catch (error) {
            console.error('Error opening store URL:', error);
            haptics.error();
          }
        },
      },
    ]
  );
};

/**
 * Check if we should prompt the user to rate
 * Based on usage patterns (e.g., after X app opens or Y actions)
 */
export const shouldPromptForRating = async (
  minAppOpens: number = 5,
  maxPrompts: number = 3
): Promise<boolean> => {
  try {
    const hasRated = await hasUserRated();
    if (hasRated) return false;

    const promptCount = await getRatePromptCount();
    if (promptCount >= maxPrompts) return false;

    // You can add more sophisticated logic here
    // For example, check app open count, days since install, etc.

    return true;
  } catch (error) {
    console.error('Error checking if should prompt for rating:', error);
    return false;
  }
};
