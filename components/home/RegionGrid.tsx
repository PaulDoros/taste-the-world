import React, { useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { YStack, XStack, Heading, Paragraph, Card } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { REGION_CONFIG } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedCard = Animated.createAnimatedComponent(Card);

interface RegionGridProps {
  getRegionCount: (regionName: string) => number;
  delay?: number;
}

/**
 * Region Grid Component
 * Modern Tamagui-powered region explorer
 */
export const RegionGrid = React.memo<RegionGridProps>(
  ({ getRegionCount, delay = 600 }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const handleRegionPress = useCallback(
      (regionName: string) => {
        haptics.light();
        router.push({
          pathname: '/(tabs)/explore',
          params: { region: regionName },
        } as any);
      },
      [router]
    );

    const regionCards = useMemo(
      () =>
        REGION_CONFIG.map((region) => ({
          ...region,
          count: getRegionCount(region.name),
        })),
      [getRegionCount]
    );

    return (
      <AnimatedYStack entering={FadeInUp.delay(delay)} marginTop="$10" paddingHorizontal="$6">
        {/* Section Header */}
        <XStack alignItems="center" space="$3" marginBottom="$3">
          <YStack
            width={4}
            height={24}
            borderRadius="$10"
            backgroundColor={colors.tint}
          />
          <Heading size="$8" fontWeight="900" color="$color">
            Explore by Region
          </Heading>
        </XStack>
        <Paragraph
          size="$3"
          marginBottom="$6"
          marginLeft="$4"
          color="$color11"
          opacity={0.8}
        >
          Discover cuisines by continent
        </Paragraph>

        {/* Region Cards Grid - 3 columns for better layout */}
        <YStack flexDirection="row" flexWrap="wrap" gap="$3">
          {regionCards.map((region, index) => (
            <AnimatedCard
              key={region.name}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              elevate
              bordered
              onPress={() => handleRegionPress(region.name)}
              padding="$5"
              borderRadius="$6"
              width={(SCREEN_WIDTH - 48 - 24) / 3}
              minHeight={140}
              backgroundColor={
                colorScheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(255, 255, 255, 0.7)'
              }
              borderColor={
                colorScheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(255, 255, 255, 0.8)'
              }
              pressStyle={{ scale: 0.95, opacity: 0.8 }}
              hoverStyle={{
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : 'rgba(255, 255, 255, 0.9)',
              }}
              animation="quick"
              // Glassmorphism
              style={{
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
              }}
            >
              {/* Icon Container */}
              <YStack
                width={44}
                height={44}
                borderRadius="$4"
                alignItems="center"
                justifyContent="center"
                marginBottom="$3"
                backgroundColor={region.color + '15'}
              >
                <FontAwesome5
                  name={region.icon as any}
                  size={20}
                  color={region.color}
                />
              </YStack>

              {/* Region Name */}
              <Heading size="$4" fontWeight="900" marginBottom="$1.5" color="$color">
                {region.name}
              </Heading>

              {/* Count */}
              <XStack alignItems="center" space="$1">
                <Paragraph size="$2" fontWeight="700" color={region.color}>
                  {region.count}
                </Paragraph>
                <Paragraph size="$1" color="$color11" opacity={0.6}>
                  {region.count === 1 ? 'country' : 'countries'}
                </Paragraph>
              </XStack>
            </AnimatedCard>
          ))}
        </YStack>
      </AnimatedYStack>
    );
  }
);

RegionGrid.displayName = 'RegionGrid';

