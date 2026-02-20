import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Pressable,
  LayoutChangeEvent,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { YStack, XStack, Heading, Text } from 'tamagui';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const isUltraCompactDevice = screenHeight < 680 || screenWidth < 350;
  const isVeryCompactDevice =
    isUltraCompactDevice || screenHeight < 700 || screenWidth < 360;
  const isCompactDevice =
    isVeryCompactDevice || screenHeight < 760 || screenWidth < 370;
  const headerHeight = isUltraCompactDevice
    ? 190
    : isVeryCompactDevice
      ? 220
      : isCompactDevice
        ? 260
        : 350;
  const lottieSize = isUltraCompactDevice
    ? 150
    : isVeryCompactDevice
      ? 180
      : isCompactDevice
        ? 210
        : 280;
  const contentOverlap = isUltraCompactDevice
    ? 118
    : isVeryCompactDevice
      ? 96
      : isCompactDevice
        ? 72
        : 30;
  const contentPadding = isVeryCompactDevice
    ? isUltraCompactDevice
      ? '$2'
      : '$3'
    : isCompactDevice
      ? '$4'
      : '$5';
  const contentPaddingTop = isVeryCompactDevice
    ? isUltraCompactDevice
      ? '$1'
      : '$3'
    : isCompactDevice
      ? '$4'
      : '$6';
  const cardSpacing = isVeryCompactDevice
    ? isUltraCompactDevice
      ? '$2'
      : '$3'
    : isCompactDevice
      ? '$4'
      : '$5';
  const pricingCardPadding = isVeryCompactDevice
    ? isUltraCompactDevice
      ? 8
      : 10
    : isCompactDevice
      ? 12
      : 16;
  const toggleHeight = isUltraCompactDevice
    ? 38
    : isVeryCompactDevice
      ? 42
      : 48;
  const toggleThumbHeight = isUltraCompactDevice
    ? 30
    : isVeryCompactDevice
      ? 34
      : 40;
  const featureIconSize = isUltraCompactDevice ? 20 : 24;
  const featureIconRadius = isUltraCompactDevice ? 10 : 12;
  const featureCheckSize = isUltraCompactDevice ? 11 : 12;
  const featureTextSize = isUltraCompactDevice
    ? '$2'
    : isVeryCompactDevice
      ? '$3'
      : '$4';
  const priceTitleSize = isUltraCompactDevice ? '$4' : '$5';
  const priceValueSize = isUltraCompactDevice ? '$5' : '$6';
  const sheetBottomPadding = isCompactDevice
    ? Math.max(insets.bottom, 6)
    : Math.max(insets.bottom + 12, 16);
  const contentStackLift = isUltraCompactDevice
    ? 56
    : isVeryCompactDevice
      ? 34
      : isCompactDevice
        ? 18
        : 0;
  const [contentStackHeight, setContentStackHeight] = useState(0);
  const minSheetTop = insets.top + (isUltraCompactDevice ? 4 : 10);
  const baseSheetTop = headerHeight - (contentOverlap + contentStackLift);
  const baseSheetHeight = screenHeight - baseSheetTop;
  const requiredLift = Math.max(0, contentStackHeight - baseSheetHeight);
  const maxLift = Math.max(0, baseSheetTop - minSheetTop);
  const appliedLift = Math.min(requiredLift, maxLift);
  const sheetTop = Math.max(minSheetTop, baseSheetTop - appliedLift);

  // State for Personal vs Pro Tab
  const [selectedTier, setSelectedTier] = useState<'personal' | 'pro'>(
    'personal'
  );
  const isPro = selectedTier === 'pro';

  // Debug: What packages are ACTUALLY available to SplashOffer?
  useEffect(() => {
    if (offerings.length > 0) {
      console.log(
        '[SplashOffer] Available Packages:',
        offerings.map((o) => o.product.identifier)
      );
    } else {
      console.log('[SplashOffer] No offerings loaded yet.');
    }
  }, [offerings]);

  // Find a package by tier + period — computed fresh every render
  const findPackage = (
    tier: 'personal' | 'pro',
    period: 'weekly' | 'monthly' | 'yearly'
  ) => {
    const compoundId = `${tier}_${period}`;
    const compoundIdAlt = `${tier}-${period}`;

    // 1. Explicit known formats based on RevenueCat setup
    const knownIds: string[] = [];

    // Personal tier special cases
    if (tier === 'personal') {
      if (period === 'yearly') knownIds.push('personal-yearly-base');
      if (period === 'weekly') knownIds.push('personal-weekly'); // no base matching screenshot
    }

    // Pro tier uses standard dash format
    if (tier === 'pro') {
      knownIds.push(`${tier}-${period}`);
    }

    // Universal fallbacks
    knownIds.push(`${tier}_${period}`);
    knownIds.push(`${tier}-${period}`);

    const exact = offerings.find((o) =>
      knownIds.includes(o.product.identifier.toLowerCase())
    );
    if (exact) return exact;

    // 2. Fuzzy: contains both the tier and period
    return offerings.find((o) => {
      const id = o.product.identifier.toLowerCase();
      return id.includes(tier) && id.includes(period);
    });
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
  const visibleFeatures = isVeryCompactDevice ? features.slice(0, 3) : features;

  // Dynamic pricing from offerings (fallback if not loaded)

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header Image / Animation */}
        <View
          style={{
            height: headerHeight,
            width: '100%',
            position: 'relative',
          }}
        >
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
              paddingTop: isUltraCompactDevice
                ? 8
                : isVeryCompactDevice
                  ? 14
                  : isCompactDevice
                    ? 20
                    : 40,
            }}
          >
            <LottieView
              source={require('../../assets/animations/travel.json')}
              autoPlay
              loop
              style={{ width: lottieSize, height: lottieSize }}
            />
          </View>

          {/* Close Button */}
          <View
            style={{
              position: 'absolute',
              top:
                insets.top +
                (isUltraCompactDevice ? 4 : isCompactDevice ? 8 : 12),
              right: isUltraCompactDevice ? 10 : isCompactDevice ? 14 : 20,
            }}
          >
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
          position="absolute"
          left={0}
          right={0}
          bottom={0}
          top={sheetTop}
          backgroundColor="$background"
          borderTopLeftRadius={isVeryCompactDevice ? 24 : 30}
          borderTopRightRadius={isVeryCompactDevice ? 24 : 30}
          overflow="hidden"
        >
          <YStack
            onLayout={(event) => {
              const nextHeight = Math.ceil(event.nativeEvent.layout.height);
              if (nextHeight !== contentStackHeight) {
                setContentStackHeight(nextHeight);
              }
            }}
            padding={contentPadding}
            paddingTop={contentPaddingTop}
            paddingBottom={sheetBottomPadding}
            gap={cardSpacing}
          >
            <YStack alignItems="center" gap="$2">
              <Heading
                size={
                  isUltraCompactDevice
                    ? '$6'
                    : isVeryCompactDevice
                      ? '$7'
                      : isCompactDevice
                        ? '$8'
                        : '$9'
                }
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
                  height: toggleHeight,
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
                        height: toggleThumbHeight,
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
            <YStack gap={isUltraCompactDevice ? '$2' : '$3'}>
              {visibleFeatures.map((feature, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(300 + index * 100)}
                >
                  <XStack
                    alignItems="center"
                    gap={isUltraCompactDevice ? '$2' : '$3'}
                  >
                    <View
                      style={{
                        width: featureIconSize,
                        height: featureIconSize,
                        borderRadius: featureIconRadius,
                        backgroundColor: `${accentColor}20`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome5
                        name="check"
                        size={featureCheckSize}
                        color={accentColor}
                      />
                    </View>
                    <Text
                      fontSize={featureTextSize}
                      fontWeight="600"
                      color={colors.text}
                    >
                      {feature}
                    </Text>
                  </XStack>
                </Animated.View>
              ))}
            </YStack>

            {/* Pricing Cards */}
            <YStack
              gap={isUltraCompactDevice ? '$2' : '$3'}
              marginTop={isUltraCompactDevice ? '$1' : '$2'}
            >
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
                      padding: pricingCardPadding,
                      opacity: pressed ? 0.9 : 1,
                    })}
                  >
                    <XStack justifyContent="space-between" alignItems="center">
                      <YStack>
                        <Heading size={priceTitleSize} color={colors.text}>
                          {t('splash_weekly_pass')}
                        </Heading>
                        <Text
                          color={colors.text}
                          opacity={0.7}
                          fontSize={isUltraCompactDevice ? '$2' : '$3'}
                        >
                          {weeklyPrice} / week
                        </Text>
                      </YStack>
                      <YStack alignItems="flex-end">
                        <Heading size={priceValueSize} color={accentColor}>
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
                        padding: pricingCardPadding,
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
                            fontSize={isUltraCompactDevice ? '$2' : '$3'}
                            textTransform="uppercase"
                            marginBottom="$1"
                          >
                            Best Value
                          </Text>
                          <Heading size={priceValueSize} color={colors.text}>
                            {t('pricing_yearly')}
                          </Heading>
                          <Text
                            color={colors.text}
                            opacity={0.7}
                            fontSize={isUltraCompactDevice ? '$2' : '$3'}
                          >
                            {yearlyPrice} / year
                          </Text>
                        </YStack>
                        <YStack alignItems="flex-end">
                          <Heading size={priceValueSize} color={accentColor}>
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
                      {
                        position: 'absolute',
                        top: -8,
                        right: -4,
                        zIndex: 10,
                      },
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
        </YStack>
      </View>
    </Modal>
  );
};
