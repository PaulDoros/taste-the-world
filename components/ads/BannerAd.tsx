import React from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from '@/utils/admob';
import { usePremium } from '@/hooks/usePremium';
import { YStack } from 'tamagui';
import { IS_ANDROID, IS_IOS } from '@/constants/platform';

const productionAdUnitId = IS_IOS
  ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
  : IS_ANDROID
    ? process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID
    : undefined;

const adUnitId = __DEV__
  ? TestIds.BANNER
  : productionAdUnitId || TestIds.BANNER;

export function AppBannerAd() {
  const { isPremium } = usePremium();

  // Don't show ads to premium users
  if (isPremium) {
    return null;
  }

  return (
    <YStack ai="center" jc="center" py="$2" backgroundColor="$color2">
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdFailedToLoad={(error) => {
          console.error('Ad failed to load: ', error);
        }}
      />
    </YStack>
  );
}
