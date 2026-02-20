import { Platform } from 'react-native';

export const PLATFORM_OS = Platform.OS;
export const PLATFORM_VERSION = Platform.Version;

export const IS_ANDROID = PLATFORM_OS === 'android';
export const IS_IOS = PLATFORM_OS === 'ios';
export const IS_WEB = PLATFORM_OS === 'web';

export const IS_NATIVE_MOBILE = IS_ANDROID || IS_IOS;

export const IS_ANDROID_API_28_PLUS =
  IS_ANDROID && typeof PLATFORM_VERSION === 'number' && PLATFORM_VERSION >= 28;
