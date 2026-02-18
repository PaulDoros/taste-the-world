import React, { useCallback, useMemo } from 'react';
import { Dimensions, StyleSheet, Pressable } from 'react-native';
import { YStack, XStack, Heading, Paragraph, useTheme } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { REGION_CONFIG } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';

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
    const theme = useTheme();
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

    const cardWidth = (SCREEN_WIDTH - 48 - 24) / 3;

    return (
      <Animated.View entering={FadeInUp.delay(delay).springify()}>
        <YStack paddingHorizontal="$2" marginTop="$4" paddingBottom="$4">
          <GlassCard
            borderRadius={24}
            shadowOpacity={0.3}
            shadowRadius={8}
            style={{ marginBottom: 24, marginHorizontal: 20 }}
          >
            <YStack padding="$4">
              <XStack alignItems="center" space="$3" marginBottom="$2">
                <YStack
                  width={4}
                  height={24}
                  borderRadius="$10"
                  backgroundColor="$tint"
                />
                <Heading size="$8" fontWeight="900" color="$color">
                  {t('home_explore_by_region')}
                </Heading>
              </XStack>
              <Paragraph size="$3" color="$color11" opacity={0.8}>
                {t('home_region_subtitle')}
              </Paragraph>
            </YStack>
          </GlassCard>

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
                <Pressable
                  onPress={() => handleRegionPress(region.name)}
                  style={{ borderRadius: 20 }}
                >
                  {({ pressed }) => (
                    <GlassCard
                      borderRadius={24}
                      shadowOpacity={0.3}
                      shadowRadius={8}
                      contentContainerStyle={{ alignItems: 'center' }}
                      style={{
                        width: cardWidth,
                        minHeight: 140,
                        padding: 12,
                        paddingBottom: 28, // Increased bottom padding to prevent clipping
                        opacity: pressed ? 0.8 : 1,
                        transform: [{ scale: pressed ? 0.96 : 1 }],
                      }}
                    >
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
                        color={theme.color.val}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {region.name}
                      </Heading>

                      <XStack alignItems="center" space="$1.5">
                        <Paragraph
                          size="$2"
                          fontWeight="700"
                          color={region.color}
                        >
                          {region.count}
                        </Paragraph>
                        <Paragraph size="$1" color="$color11" opacity={0.6}>
                          {region.count === 1
                            ? t('home_loc_single')
                            : t('home_loc_plural')}
                        </Paragraph>
                      </XStack>
                    </GlassCard>
                  )}
                </Pressable>
              </Animated.View>
            ))}
          </XStack>
        </YStack>
      </Animated.View>
    );
  }
);

RegionGrid.displayName = 'RegionGrid';
