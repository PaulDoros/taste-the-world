import { NativeModules } from 'react-native';

let isAdMobAvailable = !!NativeModules.RNGoogleMobileAdsModule;

let AdMob: any;

if (isAdMobAvailable) {
  try {
    AdMob = require('react-native-google-mobile-ads');
  } catch (error) {
    console.warn(
      'Failed to require react-native-google-mobile-ads, falling back to mock',
      error
    );
    isAdMobAvailable = false;
  }
}

if (!isAdMobAvailable) {
  // Mock Implementation for Expo Go
  console.warn('AdMob not available: Using Mock Implementation');

  const createMockAd = () => {
    let listeners: Record<string, Function[]> = {};
    const trigger = (event: string) => {
      if (listeners[event]) listeners[event].forEach((l) => l());
    };
    return {
      load: () => {
        console.log('[MockAd] Loading...');
        setTimeout(() => {
          console.log('[MockAd] Loaded');
          trigger('loaded');
        }, 1000);
      },
      show: () => {
        console.log('[MockAd] Show');
        setTimeout(() => {
          console.log('[MockAd] Earned Reward');
          trigger('earned_reward');
          setTimeout(() => {
            console.log('[MockAd] Closed');
            trigger('closed');
          }, 500);
        }, 2000);
      },
      addAdEventListener: (event: string, handler: () => void) => {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(handler);
        return () => {
          listeners[event] = listeners[event].filter((l) => l !== handler);
        };
      },
    };
  };

  AdMob = {
    BannerAd: ({ unitId, size, requestOptions }: any) => {
      // console.log('Mock BannerAd rendered');
      return null;
    },
    BannerAdSize: {
      ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
      BANNER: 'BANNER',
      FULL_BANNER: 'FULL_BANNER',
      LARGE_BANNER: 'LARGE_BANNER',
      LEADERBOARD: 'LEADERBOARD',
      MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
    },
    TestIds: {
      BANNER: 'ca-app-pub-3940256099942544/6300978111',
      INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
      REWARDED: 'ca-app-pub-3940256099942544/5224354917',
      REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544/5354046379',
    },
    AdEventType: {
      CLOSED: 'closed',
      ERROR: 'error',
      LOADED: 'loaded',
      OPENED: 'opened',
      CLICKED: 'clicked',
      EARNED_REWARD: 'earned_reward', // RewardedAdEventType mixed in mocks for simplicity
    },
    RewardedAdEventType: {
      LOADED: 'loaded',
      EARNED_REWARD: 'earned_reward',
    },
    RewardedInterstitialAd: {
      createForAdRequest: (adUnitId: string, requestOptions: any) =>
        createMockAd(),
    },
    InterstitialAd: {
      createForAdRequest: (adUnitId: string, requestOptions: any) =>
        createMockAd(),
    },
  };
}

export const {
  BannerAd,
  BannerAdSize,
  TestIds,
  AdEventType,
  RewardedAdEventType,
  RewardedInterstitialAd,
  InterstitialAd,
} = AdMob;
