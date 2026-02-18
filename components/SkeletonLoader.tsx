import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { YStack, useTheme, View } from 'tamagui';

/**
 * Skeleton Loader Component
 * Beautiful loading placeholders like Facebook/LinkedIn
 * Shimmer effect for premium feel
 */

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) => {
  const theme = useTheme();
  const shimmer = useSharedValue(0);

  // Dynamic Colors based on Theme
  // Light: bg=$color3 (light grey), shimmer=white/transparent
  // Dark: bg=$color3 (dark grey), shimmer=lighter grey/transparent
  const baseColor = theme.color3?.val || '#e2e8f0';
  const highlightColor = theme.color5?.val || '#f8fafc';

  // Create gradient colors based on theme brightness
  // We use opacity to blend with the base color
  const gradientColors = [
    'transparent',
    theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.6)',
    'transparent',
  ] as [string, string, string];

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, {
        duration: 1500,
      }),
      -1, // Infinite
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // Cast width to number if it's a number, otherwise assume standard width for interpolation
    // Using a fixed large number for width interpolation if string to ensure movement across component
    const interpWidth = typeof width === 'number' ? width : 300;

    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-interpWidth, interpWidth]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <YStack
      width={width}
      height={height}
      borderRadius={borderRadius}
      backgroundColor={baseColor}
      overflow="hidden"
      style={style}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </YStack>
  );
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CONTAINER_PADDING = 16;
// Calculate exact card width: (Screen Width - Padding*2 - Gap) / 2
// const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING * 2 - CARD_GAP) / 2;

export const CountryCardSkeleton = () => {
  return (
    <YStack
      flex={1}
      borderRadius={20}
      overflow="hidden"
      backgroundColor="$surface"
      marginBottom="$4"
      shadowColor="$shadow"
      shadowOffset={{ width: 0, height: 8 }}
      shadowOpacity={0.12}
      shadowRadius={16}
      elevation={8}
    >
      {/* Flag skeleton */}
      <YStack height={200} position="relative">
        <Skeleton width="100%" height={200} borderRadius={0} />

        {/* Overlay Content Skeletons (Name & Region) */}
        <YStack position="absolute" bottom={16} left={16} right={16}>
          {/* Country Name */}
          <Skeleton
            width="70%"
            height={24}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
          {/* Region Tag */}
          <Skeleton width={60} height={20} borderRadius={12} />
        </YStack>
      </YStack>

      {/* Info Section */}
      <YStack padding="$3">
        {/* Capital Row */}
        <YStack flexDirection="row" alignItems="center" marginBottom="$3">
          {/* Icon Circle */}
          <Skeleton
            width={28}
            height={28}
            borderRadius={14}
            style={{ marginRight: 8 }}
          />
          {/* Text Lines */}
          <YStack flex={1}>
            <Skeleton
              width="40%"
              height={10}
              borderRadius={4}
              style={{ marginBottom: 4 }}
            />
            <Skeleton width="70%" height={14} borderRadius={4} />
          </YStack>
        </YStack>

        {/* Population Row */}
        <YStack
          flexDirection="row"
          alignItems="center"
          paddingTop="$2.5"
          borderTopWidth={1}
          borderTopColor="$borderColor"
        >
          <Skeleton
            width={12}
            height={12}
            borderRadius={6}
            style={{ marginRight: 6 }}
          />
          <Skeleton width="50%" height={12} borderRadius={4} />
        </YStack>
      </YStack>
    </YStack>
  );
};

export const RecipeCardSkeleton = () => {
  return (
    <YStack
      flex={1}
      borderRadius={20}
      overflow="hidden"
      backgroundColor="$surface"
      marginBottom="$4"
      shadowColor="$shadow"
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.1}
      shadowRadius={12}
      elevation={5}
    >
      {/* Image Area */}
      <YStack height={180} position="relative">
        <Skeleton width="100%" height={180} borderRadius={0} />

        {/* Title Overlay Placeholder */}
        <YStack position="absolute" bottom={12} left={12} right={12}>
          <Skeleton
            width="80%"
            height={20}
            borderRadius={4}
            style={{ marginBottom: 4 }}
          />
          <Skeleton width="50%" height={20} borderRadius={4} />
        </YStack>

        {/* Category Badge Placeholder */}
        <YStack position="absolute" top={12} right={12}>
          <Skeleton width={60} height={24} borderRadius={12} />
        </YStack>
      </YStack>

      {/* Bottom Info Area */}
      <YStack padding="$3" backgroundColor="$surface">
        <YStack flexDirection="row" alignItems="center">
          <Skeleton width={80} height={24} borderRadius={8} />
        </YStack>
      </YStack>
    </YStack>
  );
};

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <YStack paddingHorizontal={CONTAINER_PADDING}>
      {Array.from({ length: Math.ceil(count / 2) }).map((_, rowIndex) => (
        <YStack
          key={rowIndex}
          flexDirection="row"
          gap={CARD_GAP}
          marginBottom="$0" // No extra bottom margin
        >
          <YStack flex={1}>
            <CountryCardSkeleton />
          </YStack>
          {rowIndex * 2 + 1 < count && (
            <YStack flex={1}>
              <CountryCardSkeleton />
            </YStack>
          )}
        </YStack>
      ))}
    </YStack>
  );
};

export const RecipeSkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <YStack paddingHorizontal={CONTAINER_PADDING}>
      {Array.from({ length: Math.ceil(count / 2) }).map((_, rowIndex) => (
        <YStack key={rowIndex} flexDirection="row" gap={CARD_GAP}>
          <YStack flex={1}>
            <RecipeCardSkeleton />
          </YStack>
          {rowIndex * 2 + 1 < count && (
            <YStack flex={1}>
              <RecipeCardSkeleton />
            </YStack>
          )}
        </YStack>
      ))}
    </YStack>
  );
};

export const ExploreHeaderSkeleton = () => {
  return (
    <YStack marginBottom="$5">
      {/* Search Bar Skeleton */}
      <YStack marginHorizontal="$4">
        <Skeleton width="100%" height={50} borderRadius={16} />
      </YStack>
    </YStack>
  );
};

export const SkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <YStack padding="$4" gap="$3">
      {Array.from({ length: count }).map((_, index) => (
        <YStack
          key={index}
          flexDirection="row"
          alignItems="center"
          padding="$4"
          backgroundColor="$surface"
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
        >
          <Skeleton
            width={24}
            height={24}
            borderRadius={12}
            style={{ marginRight: 12 }}
          />
          <YStack flex={1}>
            <Skeleton
              width="60%"
              height={16}
              borderRadius={4}
              style={{ marginBottom: 6 }}
            />
            <Skeleton width="40%" height={12} borderRadius={4} />
          </YStack>
        </YStack>
      ))}
    </YStack>
  );
};

export const DetailSkeleton = () => {
  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Hero Image */}
      <Skeleton width="100%" height={300} borderRadius={0} />

      <YStack paddingHorizontal="$5" marginTop={-20}>
        {/* Title Card */}
        <YStack
          backgroundColor="$surface"
          borderRadius="$6"
          padding="$6"
          marginBottom="$5"
          shadowColor="$shadow"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.1}
          shadowRadius={12}
          elevation={5}
        >
          <Skeleton
            width="80%"
            height={32}
            borderRadius={8}
            style={{ marginBottom: 12 }}
          />
          <Skeleton width="50%" height={16} borderRadius={4} />
        </YStack>

        {/* Info Blocks */}
        <YStack gap="$3">
          {[1, 2, 3, 4].map((i) => (
            <YStack
              key={i}
              flexDirection="row"
              alignItems="center"
              padding="$5"
              borderRadius="$5"
              backgroundColor="$color2" // Slightly darker/lighter than surface
            >
              <Skeleton
                width={48}
                height={48}
                borderRadius={24}
                style={{ marginRight: 16 }}
              />
              <YStack flex={1}>
                <Skeleton
                  width="30%"
                  height={12}
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton width="60%" height={16} borderRadius={4} />
              </YStack>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </YStack>
  );
};
