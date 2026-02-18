import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { XStack, YStack, Text } from 'tamagui';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';

import { useLanguage } from '@/context/LanguageContext';

import { useAuth } from '@/hooks/useAuth';
import { BADGES } from '@/constants/Badges';

export const AchievementToast = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const gamification = (user as any)?.gamification;

  // TODO: Implement logic to track new badges and set currentToast
  const currentToast = null;

  const badgeInfo = BADGES.find((b) => b.id === currentToast);
  if (!badgeInfo) return null;

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(15)}
      exiting={SlideOutUp}
      style={styles.container}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: 'rgba(0,0,0,0.85)', borderColor: '#FFD700' },
        ]}
      >
        <XStack alignItems="center" gap="$3">
          <View style={styles.lottieContainer}>
            {/* Use mapped animation or default */}
            <LottieView
              source={
                badgeInfo.lottieSource ||
                require('@/assets/animations/Trophy.json')
              }
              autoPlay
              loop={false}
              style={{ width: 60, height: 60 }}
            />
          </View>
          <YStack flex={1}>
            <Text
              color="#FFD700"
              fontWeight="bold"
              fontSize="$3"
              textTransform="uppercase"
            >
              Achievement Unlocked!
            </Text>
            <Text color="white" fontWeight="600" fontSize="$5">
              {t(badgeInfo.titleKey as any)}
            </Text>
            <Text color="#ccc" fontSize="$2">
              {t(badgeInfo.descriptionKey as any)}
            </Text>
          </YStack>
        </XStack>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Ensure it's below status bar/notch (adjust as needed)
    left: 20,
    right: 20,
    zIndex: 9999, // On top of everything
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  lottieContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
