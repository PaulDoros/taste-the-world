import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  LayoutChangeEvent,
  Alert,
} from 'react-native';
import { YStack, XStack, Heading, Text, Button, ScrollView } from 'tamagui';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePremium } from '@/hooks/usePremium';
import { haptics } from '@/utils/haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { useLanguage } from '@/context/LanguageContext';
import { SUBSCRIPTION_PRICES } from '@/constants/Config';
import { useMemo } from 'react';

interface SplashOfferProps {
  visible: boolean;
  onClose: () => void;
}

export const SplashOffer = ({ visible, onClose }: SplashOfferProps) => {
  const {
    purchasePackage,
    offerings,
    isProcessing: isSubmitting,
  } = usePremium();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  // State for Personal vs Pro Tab
  const [selectedTier, setSelectedTier] = useState<'personal' | 'pro'>(
    'personal'
  );
  const isPro = selectedTier === 'pro';

  // Find a package by tier + period — computed fresh every render
  const findPackage = (
    tier: 'personal' | 'pro',
    period: 'weekly' | 'monthly' | 'yearly'
  ) => {
    const compoundId = `${tier}_${period}`;
    const compoundIdAlt = `${tier}-${period}`;

    // 1. Exact compound match
    const exact = offerings.find((o) => {
      const id = o.product.identifier.toLowerCase();
      return (
        id === compoundId ||
        id === compoundIdAlt ||
        id.startsWith(compoundId) ||
        id.startsWith(compoundIdAlt)
      );
    });
    if (exact) return exact;

    // 2. Fuzzy: contains both the tier and period
    const fuzzy = offerings.find((o) => {
      const id = o.product.identifier.toLowerCase();
      return id.includes(tier) && id.includes(period);
    });
    if (fuzzy) return fuzzy;

    return null;
  };

  // Derive current packages directly (no memoization — always fresh)
  const weeklyPkg = findPackage(selectedTier, 'weekly');
  const yearlyPkg = findPackage(selectedTier, 'yearly');

  // Fallback prices from config — these also change per tier
  const fallback = SUBSCRIPTION_PRICES[selectedTier];
  const weeklyPrice =
    weeklyPkg?.product.priceString ?? `$${fallback.weekly.toFixed(2)}`;
  const yearlyPrice =
    yearlyPkg?.product.priceString ?? `$${fallback.yearly.toFixed(2)}`;

  // Interaction State
  const [hasInteracted, setHasInteracted] = useState(false);

  // Pricing Colors
  const PRO_COLOR = '#6366f1'; // Indigo
  const PERSONAL_COLOR = colors.tint; // Blue

  const accentColor = isPro ? PRO_COLOR : PERSONAL_COLOR;

  // Animated Tab Switcher
  const [tabWidth, setTabWidth] = useState(0);
  const tabPosition = useSharedValue(0);

  // Savings Badge Pulse Animation
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    tabPosition.value = withSpring(selectedTier === 'pro' ? 1 : 0, {
      damping: 15,
      stiffness: 150,
    });
  }, [selectedTier]);

  // Auto-Toggle Loop
  useEffect(() => {
    if (hasInteracted) return;

    const interval = setInterval(() => {
      setSelectedTier((prev) => (prev === 'personal' ? 'pro' : 'personal'));
    }, 7000); // Switch every 5 seconds

    return () => clearInterval(interval);
  }, [hasInteracted]);

  const animatedTabStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: tabPosition.value * tabWidth }],
      width: tabWidth,
    };
  });

  const handleLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.width > 0 && tabWidth === 0) {
      setTabWidth((e.nativeEvent.layout.width - 8) / 2);
    }
  };

  // Clean close handler
  const handleClose = () => {
    haptics.light();
    onClose();
  };

  const handleSubscribe = async (type: 'monthly' | 'yearly' | 'weekly') => {
    // User interacted
    setHasInteracted(true);
    haptics.selection();

    // Find the correct package using robust identifier matching
    const packageToBuy = findPackage(selectedTier, type);

    if (packageToBuy) {
      console.log('[SplashOffer] Purchasing:', packageToBuy.product.identifier);
      const success = await purchasePackage(packageToBuy);
      if (success) {
        haptics.success();
        onClose();
      }
    } else {
      haptics.error();
      if (!offerings.length) {
        Alert.alert(
          'Store Not Ready',
          'No subscription offerings were found. Please check your internet connection or try again later.'
        );
      } else {
        const ids = offerings.map((o) => o.product.identifier).join(', ');
        Alert.alert(
          'Package Not Found',
          `Could not match a package for "${selectedTier} ${type}".\n\nAvailable IDs: ${ids}`
        );
      }
    }
  };

  const handleTabPress = (tier: 'personal' | 'pro') => {
    haptics.selection();
    setHasInteracted(true);
    setSelectedTier(tier);
  };

  if (!visible) return null;

  // Features List - Dynamic based on Tier
  const features = isPro
    ? [
        t('splash_feature_scanning'),
        t('splash_feature_offline') + ' (PRO)', // Explicitly mark PRO features
        t('splash_feature_recipes'),
        t('splash_feature_itinerary') + ' (Unlimited)',
      ]
    : [
        t('splash_feature_scanning'),
        t('splash_feature_recipes'),
        t('splash_feature_itinerary'),
        'Standard Support',
      ];

  // Dynamic pricing from offerings (fallback if not loaded)

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Image / Animation */}
          <View style={{ height: 350, width: '100%', position: 'relative' }}>
            <LinearGradient
              colors={[accentColor, isPro ? '#4338ca' : '#2563EB']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 40,
              }}
            >
              <LottieView
                source={require('../../assets/animations/travel.json')}
                autoPlay
                loop
                style={{ width: 280, height: 280 }}
              />
            </View>

            {/* Close Button */}
            <View style={{ position: 'absolute', top: 50, right: 20 }}>
              <GlassButton
                label=""
                onPress={handleClose}
                size="small"
                icon="times"
                backgroundColor="rgba(0,0,0,0.3)"
                textColor="white"
                backgroundOpacity={1}
              />
            </View>
          </View>

          <YStack
            flex={1}
            backgroundColor="$background"
            borderTopLeftRadius={30}
            borderTopRightRadius={30}
            marginTop={-30}
            padding="$5"
            paddingTop="$6"
            gap="$5"
          >
            <YStack alignItems="center" gap="$2">
              <Heading
                size="$9"
                textAlign="center"
                fontWeight="900"
                color={colors.text}
              >
                {t('splash_unlock_title')}
              </Heading>

              {/* Tier Toggle Switcher */}
              <View
                onLayout={handleLayout}
                style={{
                  marginTop: 10,
                  backgroundColor:
                    colorScheme === 'dark' ? '#1e293b' : '#f1f5f9',
                  borderRadius: 12,
                  padding: 4,
                  flexDirection: 'row',
                  position: 'relative',
                  height: 48,
                  width: '100%',
                }}
              >
                {tabWidth > 0 && (
                  <Animated.View
                    style={[
                      {
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        height: 40,
                        borderRadius: 10,
                        backgroundColor: accentColor,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      },
                      animatedTabStyle,
                    ]}
                  />
                )}
                <Pressable
                  onPress={() => handleTabPress('personal')}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text
                    fontWeight={!isPro ? '800' : '600'}
                    color={!isPro ? 'white' : '$gray10'}
                  >
                    Personal
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleTabPress('pro')}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1,
                  }}
                >
                  <Text
                    fontWeight={isPro ? '800' : '600'}
                    color={isPro ? 'white' : '$gray10'}
                  >
                    PRO
                  </Text>
                </Pressable>
              </View>
            </YStack>

            {/* Features */}
            <YStack gap="$3">
              {features.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(300 + index * 100)}
                >
                  <XStack alignItems="center" gap="$3">
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: `${accentColor}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome5
                        name="check"
                        size={12}
                        color={accentColor}
                      />
                    </View>
                    <Text fontSize="$4" fontWeight="600" color={colors.text}>
                      {feature}
                    </Text>
                  </XStack>
                </Animated.View>
              ))}
            </YStack>

            {/* Pricing Cards */}
            <YStack gap="$3" marginTop="$2">
              {/* Weekly Special Offer */}
              <Animated.View entering={FadeInUp.delay(600).springify()}>
                <GlassCard
                  borderRadius={16}
                  borderRadiusInside={16}
                  intensity={20}
                >
                  <Pressable
                    onPress={() => handleSubscribe('weekly' as any)} // Cast as any if 'weekly' isn't in main type yet, or just map to monthly/weekly
                    style={({ pressed }) => ({
                      padding: 16,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Heading size="$5" color={colors.text}>
                          {t('splash_weekly_pass')}
                        </Heading>
                        <Text color={colors.text} opacity={0.7} fontSize="$3">
                          {weeklyPrice} / week
                        </Text>
                      </YStack>
                      <YStack alignItems="flex-end">
                        <Heading size="$6" color={accentColor}>
                          {weeklyPrice}
                        </Heading>
                        <Text fontSize="$2" color={colors.text} opacity={0.7}>
                          / week
                        </Text>
                      </YStack>
                    </XStack>
                  </Pressable>
                </GlassCard>
              </Animated.View>

              {/* Yearly - Best Value */}
              <Animated.View entering={FadeInUp.delay(700).springify()}>
                <View>
                  <GlassCard
                    borderRadius={16}
                    borderRadiusInside={16}
                    intensity={40}
                    backgroundColor={`${accentColor}10`}
                    style={{ overflow: 'hidden' }}
                  >
                    <Pressable
                      onPress={() => handleSubscribe('yearly')}
                      style={({ pressed }) => ({
                        padding: 16,
                        opacity: pressed ? 0.9 : 1,
                        borderWidth: 2,
                        borderColor: accentColor,
                        borderRadius: 16,
                      })}
                    >
                      <XStack
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <YStack>
                          <Text
                            color={accentColor}
                            fontWeight="800"
                            fontSize="$3"
                            textTransform="uppercase"
                            marginBottom="$1"
                          >
                            Best Value
                          </Text>
                          <Heading size="$6" color={colors.text}>
                            {t('pricing_yearly')}
                          </Heading>
                          <Text color={colors.text} opacity={0.7} fontSize="$3">
                            {yearlyPrice} / year
                          </Text>
                        </YStack>
                        <YStack alignItems="flex-end">
                          <Heading size="$6" color={accentColor}>
                            {yearlyPrice}
                          </Heading>
                          <Text fontSize="$2" color={colors.text} opacity={0.7}>
                            / year
                          </Text>
                        </YStack>
                      </XStack>
                    </Pressable>
                  </GlassCard>

                  {/* Savings Badge Animation (Popped Out) */}
                  <Animated.View
                    style={[
                      { position: 'absolute', top: -8, right: -4, zIndex: 10 },
                      animatedBadgeStyle,
                    ]}
                  >
                    <GlassCard shadowRadius={2}>
                      <LinearGradient
                        colors={['#22c55e', '#16a34a']}
                        start={[0, 0]}
                        end={[1, 1]}
                        style={{
                          paddingHorizontal: 8,
                          paddingVertical: 6,
                          borderRadius: 12,
                        }}
                      >
                        <Text fontSize={10} fontWeight="800" color="#fff">
                          SAVE 30%
                        </Text>
                      </LinearGradient>
                    </GlassCard>
                  </Animated.View>
                </View>
              </Animated.View>
            </YStack>

            <GlassButton
              label={t('splash_continue_limited')}
              onPress={handleClose}
              size="small"
              backgroundColor={undefined}
              backgroundOpacity={0}
              textColor={colors.text}
            />
          </YStack>
        </ScrollView>
      </View>
    </Modal>
  );
};
