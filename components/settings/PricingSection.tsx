import { View } from 'react-native';
import { YStack, XStack, Text, Button, Card, Separator } from 'tamagui';
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
  onSelectSubscription: (type: 'monthly' | 'yearly') => void;
  onUpgrade: () => void;
}

export const PricingSection = ({
  selectedSubscription,
  onSelectSubscription,
  onUpgrade,
}: PricingSectionProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  return (
    <YStack gap="$4" marginBottom="$6">
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
          colors={gradients.primaryDark}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            opacity: 0.15,
          }}
        />

        <YStack padding="$5" gap="$4">
          <XStack alignItems="center" gap="$3">
            <View
              style={{
                backgroundColor: colors.tint,
                padding: 10,
                borderRadius: 20,
                shadowColor: colors.tint,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <FontAwesome5 name="crown" size={20} color="white" />
            </View>
            <YStack flex={1}>
              <Text fontSize="$6" fontWeight="800" color="$color">
                {t('pricing_upgrade_title')}
              </Text>
              <Text fontSize="$3" color="$color" opacity={0.7}>
                {t('pricing_upgrade_subtitle')}
              </Text>
            </YStack>
          </XStack>

          <Separator borderColor="$borderColor" opacity={0.5} />

          {/* Benefits List */}
          <YStack gap="$2.5">
            {PREMIUM_BENEFITS.slice(0, 4).map((benefit, index) => (
              <XStack key={index} alignItems="center" gap="$3">
                <FontAwesome5
                  name="check-circle"
                  size={14}
                  color={colors.tint}
                  solid
                />
                <Text fontSize="$3" color="$color" opacity={0.9}>
                  {benefit}
                </Text>
              </XStack>
            ))}
          </YStack>

          {/* Pricing Options */}
          <XStack gap="$3" marginTop="$2">
            {/* Monthly Option */}
            <Card
              flex={1}
              bordered
              animation="quick"
              pressStyle={{ scale: 0.97 }}
              onPress={() => {
                haptics.light();
                onSelectSubscription('monthly');
              }}
              backgroundColor={
                selectedSubscription === 'monthly' ? colors.tint : '$background'
              }
              borderColor={
                selectedSubscription === 'monthly'
                  ? colors.tint
                  : '$borderColor'
              }
              padding="$3"
            >
              <YStack alignItems="center" gap="$1">
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color={
                    selectedSubscription === 'monthly' ? 'white' : '$color'
                  }
                >
                  {t('pricing_monthly')}
                </Text>
                <Text
                  fontSize="$5"
                  fontWeight="800"
                  color={
                    selectedSubscription === 'monthly' ? 'white' : '$color'
                  }
                >
                  ${SUBSCRIPTION_PRICES.monthly}
                </Text>
              </YStack>
            </Card>

            {/* Yearly Option */}
            <Card
              flex={1}
              bordered
              animation="quick"
              pressStyle={{ scale: 0.97 }}
              onPress={() => {
                haptics.light();
                onSelectSubscription('yearly');
              }}
              backgroundColor={
                selectedSubscription === 'yearly' ? colors.tint : '$background'
              }
              borderColor={
                selectedSubscription === 'yearly' ? colors.tint : '$borderColor'
              }
              padding="$3"
              position="relative"
            >
              {/* Savings Badge */}
              <View
                style={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  backgroundColor: '#22c55e', // Success color (green)
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 10,
                  zIndex: 10,
                }}
              >
                <Text fontSize={10} fontWeight="800" color="white">
                  {t('pricing_save', {
                    amount: SUBSCRIPTION_PRICES.yearlySavings,
                  })}
                </Text>
              </View>

              <YStack alignItems="center" gap="$1">
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color={selectedSubscription === 'yearly' ? 'white' : '$color'}
                >
                  {t('pricing_yearly')}
                </Text>
                <Text
                  fontSize="$5"
                  fontWeight="800"
                  color={selectedSubscription === 'yearly' ? 'white' : '$color'}
                >
                  ${SUBSCRIPTION_PRICES.yearly}
                </Text>
              </YStack>
            </Card>
          </XStack>

          {/* Upgrade Button */}
          <Button
            size="$5"
            backgroundColor={colors.tint}
            hoverStyle={{ opacity: 0.9 }}
            pressStyle={{ opacity: 0.9, scale: 0.98 }}
            onPress={onUpgrade}
            icon={<FontAwesome5 name="star" size={14} color="white" />}
            marginTop="$2"
            elevate
            borderWidth={0}
          >
            <Text color="white" fontWeight="700" fontSize="$4">
              {t('pricing_get_premium')}
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
