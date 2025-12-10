import { View, LayoutChangeEvent } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { YStack, XStack, Text, Button, Card, Separator } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { SUBSCRIPTION_PRICES, PREMIUM_BENEFITS } from '@/constants/Config';
import { haptics } from '@/utils/haptics';
import { gradients } from '@/theme/gradients';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';

interface PricingSectionProps {
  selectedSubscription: 'monthly' | 'yearly';
  selectedTier: 'personal' | 'pro';
  onSelectSubscription: (type: 'monthly' | 'yearly') => void;
  onSelectTier: (tier: 'personal' | 'pro') => void;
  onUpgrade: () => void;
}

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
  const [showAllBenefits, setShowAllBenefits] = useState(false);

  const isYearly = selectedSubscription === 'yearly';
  const isPro = selectedTier === 'pro';
  const currentPrices = SUBSCRIPTION_PRICES[selectedTier];

  // Memoize benefits filtering to avoid re-calculation on every render
  const filteredBenefits = useMemo(() => {
    return PREMIUM_BENEFITS.filter((benefit) => {
      if (selectedTier === 'personal' && benefit.includes('offline'))
        return false;
      return true;
    });
  }, [selectedTier]);

  // New PRO color (Indigo/Violet) instead of Yellow
  const PRO_COLOR = '#6366f1';
  const PRO_ICON_COLOR = '#4f46e5';

  // Pulse Animation for CTA
  const pulseScale = useSharedValue(1);

  // Savings Badge Animation
  const badgeScale = useSharedValue(1);
  const badgeRotate = useSharedValue(0);

  // Tab Switcher Animation
  const [tabWidth, setTabWidth] = useState(0);
  const tabPosition = useSharedValue(0);

  // Tab Switcher Logic
  useEffect(() => {
    // 0 = Personal, 1 = Pro
    // Smoother spring config: Snappy but not too stiff
    tabPosition.value = withSpring(selectedTier === 'pro' ? 1 : 0, {
      damping: 150,
      stiffness: 150,
      mass: 1,
    });
  }, [selectedTier]);

  const animatedTabStyle = useAnimatedStyle(() => {
    const translateX = tabWidth * tabPosition.value;
    return {
      transform: [{ translateX }],
      width: tabWidth,
    };
  });

  // Badge Animation Loop (Heartbeat-like)
  useEffect(() => {
    const interval = setInterval(() => {
      // Gentle pop
      badgeScale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      // Subtle wiggle
      badgeRotate.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }, 4000); // Every 4 seconds
    return () => clearInterval(interval);
  }, []);

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotateZ: `${badgeRotate.value}deg` },
    ],
  }));

  // CTA Pulse Loop
  useState(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1, // Infinite
      true // Reverse
    );
  });

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    if (e.nativeEvent.layout.width > 0 && tabWidth === 0) {
      setTabWidth((e.nativeEvent.layout.width - 8) / 2); // 8 is padding compensation
    }
  };

  return (
    <YStack gap="$5" marginBottom="$6">
      {/* Premium Banner Card */}
      <Card
        bordered
        elevate
        size="$4"
        overflow="hidden"
        backgroundColor="$background"
        borderColor="$borderColor"
        padding={0}
      >
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

        <YStack padding="$5" gap="$4">
          <XStack alignItems="center" gap="$3">
            <View
              style={{
                backgroundColor: isPro ? PRO_COLOR : colors.tint,
                padding: 12,
                borderRadius: 25,
                shadowColor: isPro ? PRO_COLOR : colors.tint,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
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

          {/* Animated Tier Toggle */}
          <View
            onLayout={handleLayout}
            style={{
              backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#f1f5f9',
              borderRadius: 12, // More rounded for modern feel
              padding: 4,
              flexDirection: 'row',
              position: 'relative',
              height: 48,
            }}
          >
            {/* Sliding Indicator */}
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
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  },
                  animatedTabStyle,
                ]}
              />
            )}

            {/* Touch Targets */}
            <Button
              flex={1}
              size="$3"
              chromeless
              backgroundColor="transparent"
              onPress={() => {
                haptics.selection();
                onSelectTier('personal');
              }}
            >
              <Text
                fontWeight={!isPro ? '800' : '600'}
                color={
                  !isPro
                    ? colorScheme === 'dark'
                      ? 'black'
                      : 'black'
                    : '$gray10'
                }
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
                haptics.selection();
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

          {/* Benefits List */}
          <YStack gap="$3" marginTop="$2">
            {filteredBenefits
              .slice(0, showAllBenefits ? undefined : 4)
              .map((benefit, index) => (
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
                      color={isPro ? PRO_ICON_COLOR : colors.tint}
                    />
                  </View>
                  <Text fontSize="$3" color="$color" opacity={0.9} flex={1}>
                    {benefit === 'premium_benefit_ai' && !isPro
                      ? t('premium_benefit_ai_personal' as any)
                      : benefit === 'premium_benefit_planner' && !isPro
                        ? t('premium_benefit_planner_personal' as any)
                        : t(benefit as any)}
                  </Text>
                </XStack>
              ))}

            {/* Show More / Show Less Toggle */}
            <Button
              size="$2"
              backgroundColor="$background"
              opacity={0.8}
              color="$color"
              onPress={() => {
                haptics.selection();
                setShowAllBenefits(!showAllBenefits);
              }}
              iconAfter={
                <FontAwesome5
                  name={showAllBenefits ? 'chevron-up' : 'chevron-down'}
                  size={10}
                  color={colors.text}
                />
              }
              chromeless
            >
              <Text fontSize="$2" fontStyle="italic" color="$color">
                {showAllBenefits ? 'Show Less' : 'Show More...'}
              </Text>
            </Button>
          </YStack>

          {/* Pricing Options Toggle */}
          <XStack gap="$3" marginTop="$2">
            {/* Monthly Option */}
            <Card
              flex={1}
              bordered
              pressStyle={{ scale: 0.95 }}
              onPress={() => {
                haptics.light();
                onSelectSubscription('monthly');
              }}
              backgroundColor={
                !isYearly ? (isPro ? PRO_COLOR : colors.tint) : '$background'
              }
              borderColor={
                !isYearly ? (isPro ? PRO_COLOR : colors.tint) : '$borderColor'
              }
              padding="$3"
              borderWidth={!isYearly ? 2 : 1}
              animation="quick"
            >
              <YStack alignItems="center" gap="$1">
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color={!isYearly ? 'white' : '$color'}
                  opacity={!isYearly ? 1 : 0.7}
                >
                  {t('pricing_monthly')}
                </Text>
                <Text
                  fontSize="$5"
                  fontWeight="800"
                  color={!isYearly ? 'white' : '$color'}
                >
                  ${currentPrices.monthly}
                </Text>
              </YStack>
            </Card>

            {/* Yearly Option - Featured */}
            <Card
              flex={1}
              bordered
              pressStyle={{ scale: 0.95 }}
              onPress={() => {
                haptics.light();
                onSelectSubscription('yearly');
              }}
              backgroundColor={
                isYearly ? (isPro ? PRO_COLOR : colors.tint) : '$background'
              }
              borderColor={
                isYearly ? (isPro ? PRO_COLOR : colors.tint) : '$borderColor'
              }
              padding="$3"
              borderWidth={isYearly ? 2 : 1}
              position="relative"
              overflow="visible"
              animation="quick"
            >
              {/* Savings Badge Animation */}
              <Animated.View
                style={[
                  { position: 'absolute', top: -12, right: -10, zIndex: 10 },
                  animatedBadgeStyle,
                ]}
              >
                <YStack>
                  <LinearGradient
                    colors={['#22c55e', '#16a34a']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 4,
                      elevation: 3,
                    }}
                  >
                    <Text fontSize={11} fontWeight="800" color="white">
                      {currentPrices.savings} OFF
                    </Text>
                  </LinearGradient>
                </YStack>
              </Animated.View>

              <YStack alignItems="center" gap="$1">
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color={isYearly ? 'white' : '$color'}
                  opacity={isYearly ? 1 : 0.7}
                >
                  {t('pricing_yearly')}
                </Text>
                <Text
                  fontSize="$5"
                  fontWeight="800"
                  color={isYearly ? 'white' : '$color'}
                >
                  ${currentPrices.yearly}
                </Text>
                <Text
                  fontSize={10}
                  color={isYearly ? 'white' : '$gray9'}
                  opacity={0.8}
                >
                  (${(currentPrices.yearly / 12).toFixed(2)}/mo)
                </Text>
              </YStack>
            </Card>
          </XStack>

          {/* Upgrade Button - CTA */}
          <Animated.View style={animatedButtonStyle}>
            <Button
              size="$5"
              themeInverse
              backgroundColor={isPro ? PRO_COLOR : colors.tint}
              hoverStyle={{ opacity: 0.9 }}
              pressStyle={{ opacity: 0.9 }}
              onPress={() => {
                haptics.success();
                onUpgrade();
              }}
              icon={<FontAwesome5 name="star" size={14} color="white" />}
              marginTop="$2"
              elevate
              bordered
              borderColor="white"
            >
              <Text
                color="white"
                fontWeight="800"
                fontSize="$4"
                letterSpacing={0.5}
              >
                {t('pricing_get_premium').toUpperCase()}
              </Text>
            </Button>
          </Animated.View>

          <Text textAlign="center" fontSize="$2" opacity={0.5} marginTop="$1">
            {t('pricing_cancel_anytime')}
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
};
