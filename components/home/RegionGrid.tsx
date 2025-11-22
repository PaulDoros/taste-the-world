import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { REGION_CONFIG } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RegionGridProps {
  getRegionCount: (regionName: string) => number;
  delay?: number;
}

/**
 * Region Grid Component
 * Displays clickable region cards with statistics
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
      <Animated.View entering={FadeInUp.delay(delay)} className="mt-10 px-6">
        <View className="flex-row items-center gap-3 mb-3">
          <View
            className="w-1 h-6 rounded-full"
            style={{ backgroundColor: colors.tint }}
            accessibilityHidden
          />
          <Text
            className="text-3xl font-extrabold"
            style={{ color: colors.text }}
            accessibilityRole="header"
          >
            Explore by Region
          </Text>
        </View>
        <Text
          className="text-sm mb-6 ml-4"
          style={{ color: colors.tabIconDefault }}
        >
          Discover cuisines by continent
        </Text>

        <View
          className="flex-row flex-wrap gap-3"
          accessibilityRole="list"
          accessibilityLabel="World regions"
        >
          {regionCards.map((region, index) => (
            <Animated.View
              key={region.name}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              accessibilityRole="listitem"
            >
              <Pressable
                onPress={() => handleRegionPress(region.name)}
                className="rounded-3xl p-6"
                style={{
                  backgroundColor:
                    colorScheme === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : '#FFFFFF',
                  width: (SCREEN_WIDTH - 48 - 12) / 2,
                  borderWidth: 1,
                  borderColor:
                    colorScheme === 'dark'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(0, 0, 0, 0.08)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.1,
                  shadowRadius: 12,
                  elevation: 4,
                }}
                accessibilityRole="button"
                accessibilityLabel={`Explore ${region.name} region`}
                accessibilityHint={`${region.count} countries available in ${region.name}`}
              >
                <View
                  className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                  style={{
                    backgroundColor: region.color + '20',
                    shadowColor: region.color,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                  accessibilityHidden
                >
                  <FontAwesome5
                    name={region.icon as any}
                    size={28}
                    color={region.color}
                  />
                </View>
                <Text
                  className="font-extrabold text-lg mb-2"
                  style={{ color: colors.text }}
                >
                  {region.name}
                </Text>
                <View className="flex-row items-center gap-1">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: region.color }}
                  >
                    {region.count}
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: colors.tabIconDefault }}
                  >
                    {region.count === 1 ? 'country' : 'countries'}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </Animated.View>
    );
  }
);

RegionGrid.displayName = 'RegionGrid';

