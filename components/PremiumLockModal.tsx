import React from 'react';
import { Sheet, YStack, Text, Button, View, XStack } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';

interface PremiumLockModalProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureTitle?: string;
}

export const PremiumLockModal = ({
  isVisible,
  onClose,
  onUpgrade,
  featureTitle,
}: PremiumLockModalProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  // Animations
  const iconScale = useSharedValue(0.5);
  const iconRotate = useSharedValue(0);
  const buttonShimmer = useSharedValue(0);

  React.useEffect(() => {
    if (isVisible) {
      // Reset
      iconScale.value = 0.5;
      iconRotate.value = 0;
      buttonShimmer.value = 0;

      // Animate In Icon
      iconScale.value = withSpring(1, { damping: 10, stiffness: 90 });

      // Rotate effect on entry
      iconRotate.value = withSequence(
        withTiming(-10, { duration: 100 }),
        withTiming(10, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );

      // Continuous gentle pulse for icon
      setTimeout(() => {
        iconScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1500 }),
            withTiming(1, { duration: 1500 })
          ),
          -1,
          true
        );
      }, 500);

      // Continuous shimmer for button
      buttonShimmer.value = withRepeat(
        withTiming(1, { duration: 2000 }),
        -1,
        false
      );
    }
  }, [isVisible]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotate: `${iconRotate.value}deg` },
    ],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(buttonShimmer.value * 200 - 100, {
          duration: 0,
        }),
      },
    ], // Simple mock shimmer movement
    opacity: withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(0.3, { duration: 500 }),
      withTiming(0, { duration: 500 })
    ),
  }));

  const PRO_COLOR = colors.tint;
  const PRO_GRADIENT = [colors.tint, '#3B82F6', '#8B5CF6']; // Electric Gradient

  return (
    <Sheet
      open={isVisible}
      onOpenChange={(open: boolean) => !open && onClose()}
      snapPoints={[65]}
      position={0}
      zIndex={100_000}
      animation="medium"
    >
      <Sheet.Overlay
        animation="medium"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.6)" // Slightly darker overlay
      />
      <Sheet.Frame
        padding="$0"
        backgroundColor="$background"
        borderTopLeftRadius="$8" // More rounded
        borderTopRightRadius="$8"
        overflow="hidden"
      >
        <Sheet.Handle />

        {/* Main Content Container with subtle gradient bg */}
        <LinearGradient
          colors={[
            colorScheme === 'dark' ? '#1e1b4b' : '#eef2ff',
            colors.background,
          ]}
          style={{
            flex: 1,
            padding: 24,
            paddingBottom: 40,
            alignItems: 'center',
            justifyContent: 'space-evenly',
          }}
        >
          {/* Animated Lock Icon Container */}
          <Animated.View style={animatedIconStyle}>
            <View
              width={100} // Larger
              height={100}
              borderRadius={50}
              alignItems="center"
              justifyContent="center"
              shadowColor={PRO_COLOR}
              shadowRadius={20}
              shadowOpacity={0.3}
            >
              {/* Icon Background Gradient */}
              <LinearGradient
                colors={PRO_GRADIENT as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: 50,
                }}
              />

              {/* Inner White Circle for contrast */}
              <View
                width={96}
                height={96}
                borderRadius={48}
                backgroundColor={colorScheme === 'dark' ? '#0f172a' : 'white'}
                alignItems="center"
                justifyContent="center"
                opacity={0.9}
              >
                <FontAwesome5 name="lock" size={40} color={PRO_COLOR} />
              </View>
            </View>
          </Animated.View>

          <YStack alignItems="center" gap="$3" marginTop="$2">
            <Text
              fontSize="$8"
              fontWeight="900"
              textAlign="center"
              color={colors.text}
            >
              {featureTitle
                ? t('common_unlock_feature', { feature: featureTitle })
                : t('pricing_unlock_premium')}
            </Text>

            <Text
              fontSize="$4"
              textAlign="center"
              color="$gray10"
              maxWidth={280}
              lineHeight={24}
            >
              {t('premium_unlock_desc') ||
                'Upgrade to Taste the World Pro to access this feature and unlimited travel guides.'}
            </Text>
          </YStack>

          <YStack width="100%" gap="$4" marginTop="$6">
            {/* Get Premium Button with Gradient */}
            <Button
              size="$6" // Larger button
              pressStyle={{ scale: 0.98 }}
              onPress={() => {
                haptics.success();
                onUpgrade();
              }}
              padding={0} // Clear padding for gradient
              overflow="hidden"
              borderRadius="$6"
            >
              <LinearGradient
                colors={PRO_GRADIENT as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: '100%',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <FontAwesome5 name="store-alt" size={16} color="white" />
                <Text
                  color="white"
                  fontWeight="800"
                  fontSize="$5"
                  letterSpacing={0.5}
                >
                  {t('pricing_get_premium').toUpperCase()}
                </Text>
              </LinearGradient>
            </Button>

            {/* Cancel Button */}
            <Button
              size="$4"
              chromeless
              onPress={() => {
                haptics.light();
                onClose();
              }}
            >
              <Text color="$gray9" fontSize="$3" fontWeight="600">
                {t('common_maybe_later') || t('common_cancel')}
              </Text>
            </Button>
          </YStack>
        </LinearGradient>
      </Sheet.Frame>
    </Sheet>
  );
};
