import { View, LayoutChangeEvent, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { YStack, XStack, Text, Button, Separator } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
  interpolateColor,
  cancelAnimation,
} from 'react-native-reanimated';
import { PREMIUM_BENEFITS, SUBSCRIPTION_PRICES } from '@/constants/Config';
import { haptics } from '@/utils/haptics';
import { gradients } from '@/theme/gradients';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { usePremium } from '@/hooks/usePremium';
import { PurchasesPackage } from 'react-native-purchases';
import { isAndroidLowPerf } from '@/constants/Performance';
import { useIsFocused } from '@react-navigation/native';

interface PricingSectionProps {
  selectedSubscription: 'monthly' | 'yearly';
  selectedTier: 'personal' | 'pro';
  onSelectSubscription: (type: 'monthly' | 'yearly') => void;
  onSelectTier: (tier: 'personal' | 'pro') => void;
  onUpgrade: (pack?: PurchasesPackage) => void;
}

const AnimatedPricingCard = ({
  isSelected,
  activeColor,
  inactiveColor,
  children,
  onPress,
  style,
}: {
  isSelected: boolean;
  activeColor: string;
  inactiveColor: string;
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) => {
  const progress = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, {
      duration: 220,
    });
  }, [isSelected]);

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [inactiveColor, activeColor]
      ),
    };
  });

  const animatedBorderStyle = useAnimatedStyle(() => {
    return {
      borderWidth: 1,
      borderColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', activeColor]
      ),
      borderRadius: 16,
    };
  });

  return (
    <GlassCard
      style={[{ flex: 1 }, style]}
      contentContainerStyle={{ flex: 1 }}
      backgroundColor="transparent"
      borderRadius={16}
      borderRadiusInside={16}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedBgStyle]} />

      <Animated.View
        style={[StyleSheet.absoluteFill, animatedBorderStyle]}
        pointerEvents="none"
      />

      <Pressable
        style={({ pressed }) => ({
          flex: 1,
          padding: 12,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.9 : 1,
        })}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </GlassCard>
  );
};

export const PricingSection = ({
  selectedSubscription,
  selectedTier,
  onSelectSubscription,
  onSelectTier,
  onUpgrade,
}: PricingSectionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const isFocused = useIsFocused();
  const isPerformanceMode = isAndroidLowPerf;
  const androidShadowBase = colorScheme === 'dark' ? '#000000' : '#0f172a';
  const androidBorderSoft =
    colorScheme === 'dark'
      ? 'rgba(148, 163, 184, 0.2)'
      : 'rgba(15, 23, 42, 0.08)';
  const [showAllBenefits, setShowAllBenefits] = useState(false);
  const { offerings } = usePremium();

  const [hasInteracted, setHasInteracted] = useState(false);

  const isYearly = selectedSubscription === 'yearly';
  const isPro = selectedTier === 'pro';

  const findPackage = useCallback(
    (tier: string, period: string) => {
      const term = period.toLowerCase();
      const tierName = tier.toLowerCase();

      const knownIds: string[] = [];

      if (tierName === 'personal') {
        if (term === 'monthly') knownIds.push('personal-monthly-base');
        if (term === 'yearly') knownIds.push('personal-yearly-base');
        if (term === 'weekly') knownIds.push('personal-weekly');
      }

      if (tierName === 'pro') {
        knownIds.push(`${tierName}-${term}`);
      }

      knownIds.push(`${tierName}_${term}`);
      knownIds.push(`${tierName}-${term}`);

      const exact = offerings.find((o) =>
        knownIds.includes(o.product.identifier.toLowerCase())
      );
      if (exact) return exact;

      if (tierName === 'personal' || tierName === 'free') {
        const simpleMatch = offerings.find(
          (o) => o.product.identifier.toLowerCase() === term
        );
        if (simpleMatch) return simpleMatch;
      }

      return (
        offerings.find((o) => {
          const id = o.product.identifier.toLowerCase();
          return id.includes(tierName) && id.includes(term);
        }) ||
        offerings.find((o) => o.product.identifier.toLowerCase().includes(term))
      );
    },
    [offerings]
  );

  const currentPackage = findPackage(selectedTier, selectedSubscription);
  const fallbackPrices = SUBSCRIPTION_PRICES[selectedTier];

  const monthlyPrice =
    findPackage(selectedTier, 'monthly')?.product.priceString ??
    `$${fallbackPrices.monthly.toFixed(2)}`;
  const yearlyPrice =
    findPackage(selectedTier, 'yearly')?.product.priceString ??
    `$${fallbackPrices.yearly.toFixed(2)}`;

  const filteredBenefits = useMemo(() => {
    return PREMIUM_BENEFITS.filter((benefit) => {
      if (selectedTier === 'personal' && benefit.includes('offline'))
        return false;
      return true;
    });
  }, [selectedTier]);

  const PRO_COLOR = '#6366f1';
  const ACTIVE_COLOR = isPro ? PRO_COLOR : colors.tint;
  const INACTIVE_COLOR =
    colorScheme === 'dark'
      ? isAndroidLowPerf
        ? 'rgba(30, 41, 59, 0.55)'
        : 'rgba(30, 41, 59, 0.45)'
      : isAndroidLowPerf
        ? 'rgba(255, 255, 255, 0.6)'
        : 'rgba(255, 255, 255, 0.5)';

  const pulseScale = useSharedValue(1);
  const badgeScale = useSharedValue(1);
  const badgeRotate = useSharedValue(0);
  const [tabWidth, setTabWidth] = useState(0);
  const tabPosition = useSharedValue(0);

  useEffect(() => {
    tabPosition.value = withSpring(selectedTier === 'pro' ? 1 : 0, {
      damping: isPerformanceMode ? 36 : 24,
      stiffness: isPerformanceMode ? 240 : 180,
      mass: 1,
    });
  }, [selectedTier, isPerformanceMode]);

  const animatedTabStyle = useAnimatedStyle(() => {
    const translateX = tabWidth * tabPosition.value;
    return {
      transform: [{ translateX }],
      width: tabWidth,
    };
  });

  useEffect(() => {
    if (hasInteracted || isPerformanceMode || !isFocused) {
      return;
    }

    const interval = setInterval(() => {
      onSelectTier(selectedTier === 'pro' ? 'personal' : 'pro');
    }, 6000);

    return () => clearInterval(interval);
  }, [hasInteracted, selectedTier, onSelectTier, isPerformanceMode, isFocused]);

  useEffect(() => {
    if (isPerformanceMode || !isFocused) {
      badgeScale.value = 1;
      badgeRotate.value = 0;
      return;
    }

    const interval = setInterval(() => {
      badgeScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      badgeRotate.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isPerformanceMode, isFocused]);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotateZ: `${badgeRotate.value}deg` },
    ],
  }));

  useEffect(() => {
    if (isPerformanceMode || !isFocused) {
      pulseScale.value = 1;
      cancelAnimation(pulseScale);
      return;
    }

    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1100 }),
        withTiming(1, { duration: 1100 })
      ),
      -1,
      true
    );

    return () => {
      cancelAnimation(pulseScale);
      pulseScale.value = 1;
    };
  }, [isPerformanceMode, isFocused]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.width > 0 && tabWidth === 0) {
      setTabWidth((e.nativeEvent.layout.width - 8) / 2);
    }
  };

  const stopAutoToggle = () => {
    if (!hasInteracted) {
      if (!isPerformanceMode) {
        haptics.selection();
      }
      setHasInteracted(true);
    }
  };

  return (
    <YStack gap="$5" marginBottom="$6">
      <GlassCard borderRadius={16} borderRadiusInside={16} intensity={60}>
        <LinearGradient
          colors={isPro ? [PRO_COLOR, '#4338ca'] : gradients.primaryDark}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.1,
          }}
        />

        <YStack padding="$5" gap="$4" backgroundColor="$backgroundTransparent">
          <XStack alignItems="center" gap="$3">
            <View
              style={{
                backgroundColor: isPro ? PRO_COLOR : colors.tint,
                padding: 12,
                borderRadius: 25,
              }}
            >
              <FontAwesome5
                name={isPro ? 'crown' : 'gem'}
                size={24}
                color="white"
              />
            </View>
            <YStack flex={1}>
              <Text fontSize="$7" fontWeight="900" color="$color">
                {isPro ? t('pricing_pro_title') : t('pricing_personal_title')}
              </Text>
              <Text fontSize="$3" color="$color" opacity={0.7} lineHeight={20}>
                {isPro
                  ? t('pricing_pro_subtitle')
                  : t('pricing_personal_subtitle')}
              </Text>
            </YStack>
          </XStack>

          <Separator borderColor="$borderColor" opacity={0.5} />

          <View
            onLayout={handleLayout}
            style={{
              backgroundColor: isAndroidLowPerf
                ? colorScheme === 'dark'
                  ? 'rgba(30, 41, 59, 0.6)'
                  : 'rgba(248, 250, 252, 0.82)'
                : colorScheme === 'dark'
                  ? '#1e293b'
                  : '#f1f5f9',
              borderRadius: 12,
              padding: 4,
              flexDirection: 'row',
              position: 'relative',
              height: 48,
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
                    backgroundColor: isPro ? PRO_COLOR : 'white',
                    borderWidth: 1,
                    borderColor: androidBorderSoft,
                  },
                  animatedTabStyle,
                ]}
              />
            )}

            <Button
              flex={1}
              size="$3"
              chromeless
              backgroundColor="transparent"
              onPress={() => {
                stopAutoToggle();
                onSelectTier('personal');
              }}
            >
              <Text
                fontWeight={!isPro ? '800' : '600'}
                color={!isPro ? 'black' : '$gray10'}
                fontSize="$3"
              >
                Personal
              </Text>
            </Button>
            <Button
              flex={1}
              size="$3"
              chromeless
              backgroundColor="transparent"
              onPress={() => {
                stopAutoToggle();
                onSelectTier('pro');
              }}
            >
              <Text
                fontWeight={isPro ? '800' : '600'}
                color={isPro ? 'white' : '$gray10'}
                fontSize="$3"
              >
                PRO
              </Text>
            </Button>
          </View>

          <YStack gap="$3" marginTop="$2">
            {filteredBenefits
              .slice(0, showAllBenefits ? undefined : 4)
              .map((benefit) => (
                <XStack key={benefit} alignItems="center" gap="$3">
                  <View
                    style={{
                      backgroundColor: (isPro ? PRO_COLOR : colors.tint) + '20',
                      padding: 6,
                      borderRadius: 15,
                    }}
                  >
                    <FontAwesome5
                      name="check"
                      size={10}
                      color={isPro ? '#4f46e5' : colors.tint}
                    />
                  </View>
                  <Text fontSize="$3" color="$color" opacity={0.9} flex={1}>
                    {benefit === 'premium_benefit_ai' && !isPro
                      ? t('premium_benefit_ai_personal' as any)
                      : benefit === 'premium_benefit_planner' && !isPro
                        ? t('premium_benefit_planner_personal')
                        : t(benefit as any)}
                  </Text>
                </XStack>
              ))}

            <GlassButton
              label={
                showAllBenefits
                  ? t('pricing_show_less')
                  : t('pricing_show_more')
              }
              onPress={() => {
                haptics.selection();
                setShowAllBenefits(!showAllBenefits);
              }}
              size="small"
              icon={showAllBenefits ? 'chevron-up' : 'chevron-down'}
              backgroundColor={undefined}
              backgroundOpacity={0}
              textColor={colors.text}
            />
          </YStack>

          <XStack gap="$3" marginTop="$2">
            <View style={{ flex: 1, height: 120 }}>
              <AnimatedPricingCard
                isSelected={!isYearly}
                activeColor={ACTIVE_COLOR}
                inactiveColor={INACTIVE_COLOR}
                onPress={() => {
                  stopAutoToggle();
                  onSelectSubscription('monthly');
                }}
              >
                <YStack alignItems="center" gap="$1">
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={!isYearly ? '#ffffff' : colors.text}
                    opacity={!isYearly ? 1 : 0.7}
                  >
                    {t('pricing_monthly')}
                  </Text>

                  <Text
                    fontSize="$5"
                    fontWeight="800"
                    color={!isYearly ? '#ffffff' : colors.text}
                  >
                    {monthlyPrice}
                  </Text>
                </YStack>
              </AnimatedPricingCard>
            </View>

            <View style={{ flex: 1, height: 120 }}>
              <AnimatedPricingCard
                isSelected={isYearly}
                activeColor={ACTIVE_COLOR}
                inactiveColor={INACTIVE_COLOR}
                onPress={() => {
                  stopAutoToggle();
                  onSelectSubscription('yearly');
                }}
              >
                <Animated.View
                  style={[
                    { position: 'absolute', top: -4, right: -4, zIndex: 10 },
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
                      <Text
                        paddingRight={10}
                        paddingTop={4}
                        fontSize={10}
                        fontWeight="800"
                        color="#fff"
                      >
                        {t('pricing_save_percent', { percent: 17 })}
                      </Text>
                    </LinearGradient>
                  </GlassCard>
                </Animated.View>

                <YStack alignItems="center" gap="$1" marginTop="$2">
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={isYearly ? '#ffffff' : colors.text}
                    opacity={isYearly ? 1 : 0.7}
                  >
                    {t('pricing_yearly')}
                  </Text>
                  <Text
                    fontSize="$5"
                    fontWeight="800"
                    color={isYearly ? '#ffffff' : colors.text}
                  >
                    {yearlyPrice}
                  </Text>
                </YStack>
              </AnimatedPricingCard>
            </View>
          </XStack>

          <Animated.View style={animatedButtonStyle}>
            <GlassButton
              label={
                currentPackage
                  ? `${t('pricing_get_premium').toUpperCase()} ${currentPackage.product.priceString}`
                  : `${t('pricing_get_premium').toUpperCase()} ${isYearly ? yearlyPrice : monthlyPrice}`
              }
              onPress={() => {
                haptics.success();
                if (currentPackage) {
                  onUpgrade(currentPackage);
                } else {
                  onUpgrade();
                }
              }}
              size="large"
              icon="star"
              backgroundColor={isPro ? PRO_COLOR : colors.tint}
              textColor="white"
              backgroundOpacity={1}
            />
          </Animated.View>

          <Text textAlign="center" fontSize="$2" opacity={0.5} marginTop="$1">
            {t('pricing_cancel_anytime')}
          </Text>
        </YStack>
      </GlassCard>
    </YStack>
  );
};
