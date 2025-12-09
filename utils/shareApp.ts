import { Share, Platform } from 'react-native';
import { haptics } from './haptics';

/**
 * Share App Utility
 * Allows users to share the app with friends
 */

const APP_NAME = 'Taste the World';
const APP_DESCRIPTION = 'Explore cuisines from 195+ countries! 🌍🍴';

// App Store URLs (update these when app is published)
// App Store URLs (update these when app is published)
const IOS_APP_URL = 'https://apps.apple.com/app/taste-the-world/id000000000';
const ANDROID_APP_URL =
  'https://play.google.com/store/apps/details?id=com.tastetheworld';

export const shareApp = async (): Promise<boolean> => {
  try {
    const appUrl = Platform.OS === 'ios' ? IOS_APP_URL : ANDROID_APP_URL;

    const shareMessage = Platform.select({
      ios: `${APP_DESCRIPTION}\n\nDownload now: ${appUrl}`,
      android: `${APP_DESCRIPTION}\n\nDownload now: ${appUrl}`,
      default: `Check out ${APP_NAME} - ${APP_DESCRIPTION}`,
    });

    const result = await Share.share(
      {
        message: shareMessage,
        title: APP_NAME,
        url: Platform.OS === 'ios' ? appUrl : undefined, // iOS can share URL separately
      },
      {
        dialogTitle: `Share ${APP_NAME}`,
        subject: `Check out ${APP_NAME}!`, // For email sharing
      }
    );

    if (result.action === Share.sharedAction) {
      haptics.success();
      return true;
    } else if (result.action === Share.dismissedAction) {
      // User dismissed the share dialog
      return false;
    }

    return false;
  } catch (error) {
    console.error('Error sharing app:', error);
    haptics.error();
    return false;
  }
};

/**
 * Get the appropriate app store URL for the current platform
 */
export const getAppStoreUrl = (): string => {
  return Platform.OS === 'ios' ? IOS_APP_URL : ANDROID_APP_URL;
};
