import { Platform } from 'react-native';

const PLACEHOLDER_VALUES = new Set([
  'your_client_id',
  'your_ios_client_id',
  'your_android_client_id',
  'your_web_client_id',
]);

const cleanEnv = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) return undefined;
  if (trimmed.toLowerCase().includes('placeholder')) return undefined;
  return trimmed;
};

const genericClientId = cleanEnv(process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID);
const iosClientId = cleanEnv(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
const androidClientId = cleanEnv(
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID
);
const webClientId = cleanEnv(process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);

const fallbackClientId =
  genericClientId ?? webClientId ?? iosClientId ?? androidClientId;

const SAFE_FALLBACK_CLIENT_ID =
  '000000000000-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.apps.googleusercontent.com';

export const googleAuthRequestConfig = {
  clientId: genericClientId ?? webClientId ?? fallbackClientId,
  iosClientId: iosClientId ?? fallbackClientId ?? SAFE_FALLBACK_CLIENT_ID,
  androidClientId:
    androidClientId ?? fallbackClientId ?? SAFE_FALLBACK_CLIENT_ID,
  webClientId: webClientId ?? fallbackClientId ?? SAFE_FALLBACK_CLIENT_ID,
};

export const isGoogleOAuthConfigured =
  Platform.OS === 'android'
    ? Boolean(androidClientId ?? fallbackClientId)
    : Platform.OS === 'ios'
      ? Boolean(iosClientId ?? fallbackClientId)
      : Boolean(webClientId ?? fallbackClientId);

export const googleOAuthMissingConfigMessage =
  Platform.OS === 'android'
    ? 'Google sign-in is not configured for Android. Add EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID in EAS environment variables and rebuild.'
    : Platform.OS === 'ios'
      ? 'Google sign-in is not configured for iOS. Add EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID in EAS environment variables and rebuild.'
      : 'Google sign-in is not configured. Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID in EAS environment variables.';
