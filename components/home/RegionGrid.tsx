import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { YStack, XStack, Heading, Paragraph, Card } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { REGION_CONFIG } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RegionGridProps {
  getRegionCount: (regionName: string) => number;
  delay?: number;
}

/**
 * Region Grid Component
 * Modern Tamagui-powered region explorer with premium glassmorphism
 */
export const RegionGrid = React.memo<RegionGridProps>(
  ({ getRegionCount, delay = 600 }) => {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { t } = useLanguage();

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

    // Calculate card width for 3 columns with gaps
    // Screen padding: $6 (approx 24px) * 2 = 48px
    // Gap: $3 (approx 12px) * 2 = 24px
    // Total available width = SCREEN_WIDTH - 48 - 24
    const cardWidth = (SCREEN_WIDTH - 48 - 24) / 3;

    return (
      <Animated.View entering={FadeInUp.delay(delay).springify()}>
        <YStack paddingHorizontal="$2" marginTop="$4" paddingBottom="$4">
          <XStack alignItems="center" space="$3" marginBottom="$4">
            <YStack
              width={4}
              height={24}
              borderRadius="$10"
              backgroundColor={colors.tint}
            />
            <Heading size="$8" fontWeight="900" color="$color">
              {t('home_explore_by_region')}
            </Heading>
          </XStack>
          <Paragraph
            size="$3"
            color="$color11"
            opacity={0.8}
            marginBottom="$4"
            marginLeft="$4"
          >
            {t('home_region_subtitle')}
          </Paragraph>

          <XStack
            flexWrap="wrap"
            gap="$3"
            justifyContent="center"
            alignItems="center"
            width="100%"
          >
            {regionCards.map((region, index) => (
              <Animated.View
                key={region.name}
                entering={FadeInDown.delay(delay + 100 + index * 50)}
              >
                <Card
                  elevate
                  bordered
                  onPress={() => handleRegionPress(region.name)}
                  padding="$3"
                  borderRadius="$5"
                  width={cardWidth}
                  minHeight={130}
                  backgroundColor={
                    colorScheme === 'dark'
                      ? 'rgba(30, 30, 30, 0.7)'
                      : 'rgba(255, 255, 255, 0.7)'
                  }
                  borderColor={
                    colorScheme === 'dark'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'rgba(0, 0, 0, 0.05)'
                  }
                  shadowColor={colorScheme === 'dark' ? '#000' : colors.tint}
                  shadowOffset={{ width: 0, height: 4 }}
                  shadowOpacity={colorScheme === 'dark' ? 0.3 : 0.1}
                  shadowRadius={8}
                  pressStyle={{ scale: 0.96, opacity: 0.9 }}
                  hoverStyle={{
                    backgroundColor:
                      colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(255, 255, 255, 0.8)',
                  }}
                  animation="quick"
                  overflow="hidden"
                >
                  <BlurView
                    intensity={20}
                    tint={colorScheme === 'dark' ? 'dark' : 'light'}
                    style={StyleSheet.absoluteFill}
                  />

                  <YStack
                    width={40}
                    height={40}
                    borderRadius="$4"
                    alignItems="center"
                    justifyContent="center"
                    marginBottom="$3"
                    backgroundColor={region.color + '25'}
                  >
                    <FontAwesome5
                      name={region.icon as any}
                      size={18}
                      color={region.color}
                    />
                  </YStack>

                  <Heading
                    size="$3"
                    fontWeight="800"
                    marginBottom="$1"
                    color="$color"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {region.name}
                  </Heading>

                  <XStack alignItems="center" space="$1.5">
                    <Paragraph size="$2" fontWeight="700" color={region.color}>
                      {region.count}
                    </Paragraph>
                    <Paragraph size="$1" color="$color11" opacity={0.6}>
                      {region.count === 1
                        ? t('home_loc_single')
                        : t('home_loc_plural')}
                    </Paragraph>
                  </XStack>
                </Card>
              </Animated.View>
            ))}
          </XStack>
        </YStack>
      </Animated.View>
    );
  }
);

RegionGrid.displayName = 'RegionGrid';
