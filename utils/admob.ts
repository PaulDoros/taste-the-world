// Type definitions to match react-native-google-mobile-ads
// so we don't break TypeScript checks even if using checks at runtime.

export const AdEventType = {
  CLOSED: 'closed',
  OPENED: 'opened',
  CLICKED: 'clicked',
  LOADED: 'loaded',
  ERROR: 'error',
};

export const RewardedAdEventType = {
  LOADED: 'loaded',
  EARNED_REWARD: 'earned_reward',
};

export const TestIds = {
  REWARDED_INTERSTITIAL: 'ca-app-pub-3940256099942544~3347511713',
};

// Mock implementation for Expo Go / Non-native builds
class MockRewardedInterstitialAd {
  _loaded = false;
  _listeners: Record<string, Array<() => void>> = {};

  static createForAdRequest(adUnitId: string, requestOptions?: any) {
    return new MockRewardedInterstitialAd();
  }

  addAdEventListener(eventType: string, listener: () => void) {
    if (!this._listeners[eventType]) {
      this._listeners[eventType] = [];
    }
    this._listeners[eventType].push(listener);
    return () => {
      this._listeners[eventType] = this._listeners[eventType].filter(
        (l) => l !== listener
      );
    };
  }

  load() {
    console.log('[MockAd] Loading ad...');
    setTimeout(() => {
      this._loaded = true;
      this._emit(RewardedAdEventType.LOADED);
      console.log('[MockAd] Ad loaded.');
    }, 1500);
  }

  show() {
    console.log('[MockAd] Showing ad...');
    setTimeout(() => {
      this._emit(RewardedAdEventType.EARNED_REWARD);
      // Then close
      setTimeout(() => {
        this._emit(AdEventType.CLOSED);
      }, 500);
    }, 2000); // Simulate watching
  }

  _emit(eventType: string) {
    if (this._listeners[eventType]) {
      this._listeners[eventType].forEach((l) => l());
    }
  }
}

// Try to import the specific native module to check existence
// This is safer than importing the whole text
let RNGoogleMobileAds;
try {
  // Use require so it doesn't crash statically?
  // Actually standard import might crash.
  // We will assume that if we are here and valid, it works.
  // BUT the user's error says "Invariant Violation".
  // This means the JS code WAS imported, but it checked for Native Module and failed.

  // So we interpret: If we alias this file to 'react-native-google-mobile-ads' in imports? No.
  // We just have to use *this* file instead of the real library in our components.

  // We can try to import the real one dynamically?
  RNGoogleMobileAds = require('react-native-google-mobile-ads');
} catch (e) {
  console.warn('Google Mobile Ads Native Module not found. Using Mock.');
  RNGoogleMobileAds = null;
}

// Export the "Real" items if available, else Mock items
export const RewardedInterstitialAd =
  RNGoogleMobileAds?.RewardedInterstitialAd || MockRewardedInterstitialAd;

// Fallback for constants if module is missing (though constants usually pure JS?)
// Yes, constants like RewardedAdEventType are usually exported from JS.
// But if the package entry point does `NativeModules.RNGoogleMobileAdsModule`, it crashes.
// So we must rely on our local definitions if the require failed.
export const MobileAds = RNGoogleMobileAds?.MobileAds;
