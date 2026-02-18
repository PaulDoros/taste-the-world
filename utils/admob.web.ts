// Type definitions to match react-native-google-mobile-ads
// so we don't break TypeScript checks.

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
  REWARDED_INTERSTITIAL: 'mock-test-id',
};

// Mock implementation for Web
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
    console.log('[MockAd] Web: Loading ad...');
    setTimeout(() => {
      this._loaded = true;
      this._emit(RewardedAdEventType.LOADED);
      console.log('[MockAd] Web: Ad loaded.');
    }, 1500);
  }

  show() {
    console.log('[MockAd] Web: Showing ad...');
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

// Export Mock items for Web
export const RewardedInterstitialAd = MockRewardedInterstitialAd;

export const MobileAds = {
  initialize: async () => {
    console.log('[MockAd] Web: MobileAds initialized');
    return Promise.resolve();
  },
};
