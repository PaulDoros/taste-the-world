import { View } from 'react-native';
import { useState } from 'react';
import {
  YStack,
  XStack,
  Text,
  Button,
  Card,
  Separator,
  AnimatePresence,
} from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const filteredBenefits = PREMIUM_BENEFITS.filter((benefit) => {
    if (selectedTier === 'personal' && benefit.includes('offline'))
      return false;
    return true;
  });

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
        animation="medium"
        scale={0.98}
        hoverStyle={{ scale: 1 }}
        pressStyle={{ scale: 0.97 }}
      >
        <LinearGradient
          colors={isPro ? gradients.gold : gradients.primaryDark}
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
                backgroundColor: isPro ? '#fbbf24' : colors.tint,
                padding: 12,
                borderRadius: 25,
                shadowColor: isPro ? '#fbbf24' : colors.tint,
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

          {/* Tier Toggle */}
          <XStack backgroundColor="$bg2" padding="$1" borderRadius="$4">
            <Button
              flex={1}
              size="$3"
              chromeless={isPro}
              backgroundColor={!isPro ? '$background' : 'transparent'}
              onPress={() => {
                haptics.selection();
                onSelectTier('personal');
              }}
              animation="quick"
            >
              <Text
                fontWeight={!isPro ? '700' : '500'}
                color="$color"
                fontSize="$3"
              >
                Personal
              </Text>
            </Button>
            <Button
              flex={1}
              size="$3"
              chromeless={!isPro}
              backgroundColor={isPro ? '$background' : 'transparent'}
              onPress={() => {
                haptics.selection();
                onSelectTier('pro');
              }}
              animation="quick"
            >
              <Text
                fontWeight={isPro ? '700' : '500'}
                color="$color"
                fontSize="$3"
              >
                PRO
              </Text>
            </Button>
          </XStack>

          {/* Benefits List - Enhanced */}
          <YStack gap="$3">
            <AnimatePresence>
              {filteredBenefits
                .slice(0, showAllBenefits ? undefined : 4)
                .map((benefit, index) => (
                  <XStack
                    key={benefit} // Use benefit string as key for better animation tracking
                    alignItems="center"
                    gap="$3"
                    animation="quick"
                    enterStyle={{ opacity: 0, scale: 0.9, y: -5 }}
                    exitStyle={{ opacity: 0, scale: 0.9, y: -5 }}
                    opacity={1}
                    scale={1}
                    y={0}
                  >
                    <View
                      style={{
                        backgroundColor:
                          (isPro ? '#fbbf24' : colors.tint) + '20',
                        padding: 6,
                        borderRadius: 15,
                      }}
                    >
                      <FontAwesome5
                        name="check"
                        size={10}
                        color={isPro ? '#d97706' : colors.tint}
                      />
                    </View>
                    <Text fontSize="$3" color="$color" opacity={0.9} flex={1}>
                      {t(benefit as any)}
                    </Text>
                  </XStack>
                ))}
            </AnimatePresence>

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
              animation="quick"
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
              animation="quick"
              pressStyle={{ scale: 0.95 }}
              onPress={() => {
                haptics.light();
                onSelectSubscription('monthly');
              }}
              backgroundColor={
                !isYearly ? (isPro ? '#fbbf24' : colors.tint) : '$background'
              }
              borderColor={
                !isYearly ? (isPro ? '#fbbf24' : colors.tint) : '$borderColor'
              }
              padding="$3"
              borderWidth={!isYearly ? 2 : 1}
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
                  €{currentPrices.monthly}
                </Text>
              </YStack>
            </Card>

            {/* Yearly Option - Featured */}
            <Card
              flex={1}
              bordered
              animation="quick"
              pressStyle={{ scale: 0.95 }}
              onPress={() => {
                haptics.light();
                onSelectSubscription('yearly');
              }}
              backgroundColor={
                isYearly ? (isPro ? '#fbbf24' : colors.tint) : '$background'
              }
              borderColor={
                isYearly ? (isPro ? '#fbbf24' : colors.tint) : '$borderColor'
              }
              padding="$3"
              borderWidth={isYearly ? 2 : 1}
              position="relative"
              overflow="visible"
            >
              {/* Savings Badge Animation */}
              <AnimatePresence>
                <YStack
                  position="absolute"
                  top={-12}
                  right={-10}
                  zIndex={10}
                  animation="bouncy"
                  enterStyle={{ opacity: 0, scale: 0.5, y: 10 }}
                  exitStyle={{ opacity: 0, scale: 0.5, y: 10 }}
                >
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
              </AnimatePresence>

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
                  €{currentPrices.yearly}
                </Text>
                <Text
                  fontSize={10}
                  color={isYearly ? 'white' : '$gray9'}
                  opacity={0.8}
                >
                  (€{(currentPrices.yearly / 12).toFixed(2)}/mo)
                </Text>
              </YStack>
            </Card>
          </XStack>

          {/* Upgrade Button - CTA */}
          <Button
            size="$5"
            themeInverse
            backgroundColor={isPro ? '#fbbf24' : colors.tint}
            hoverStyle={{ opacity: 0.9, scale: 1.02 }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
            onPress={() => {
              haptics.success();
              onUpgrade();
            }}
            icon={<FontAwesome5 name="star" size={14} color="white" />}
            marginTop="$2"
            elevate
            bordered
            borderColor="white"
            animation="quick"
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

          <Text textAlign="center" fontSize="$2" opacity={0.5} marginTop="$1">
            {t('pricing_cancel_anytime')}
          </Text>
        </YStack>
      </Card>
    </YStack>
  );
};
