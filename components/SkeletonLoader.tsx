import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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
  const shimmer = useSharedValue(0);

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
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-width as number, width as number]
    );

    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#e2e8f0',
          overflow: 'hidden',
        },
        style,
      ]}
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
          colors={['transparent', 'rgba(255, 255, 255, 0.5)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Country Card Skeleton
 * Matches the CountryCard layout
 */
export const CountryCardSkeleton = () => {
  return (
    <View
      style={{
        flex: 1,
        maxWidth: '48%',
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#f1f5f9',
        marginBottom: 16,
        padding: 12,
      }}
    >
      {/* Flag skeleton */}
      <Skeleton
        width="100%"
        height={200}
        borderRadius={16}
        style={{ marginBottom: 12 }}
      />

      {/* Text skeletons */}
      <Skeleton
        width="80%"
        height={18}
        borderRadius={4}
        style={{ marginBottom: 8 }}
      />
      <Skeleton
        width="60%"
        height={14}
        borderRadius={4}
        style={{ marginBottom: 8 }}
      />
      <Skeleton width="40%" height={12} borderRadius={4} />
    </View>
  );
};

/**
 * Grid of skeleton cards
 */
export const SkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <CountryCardSkeleton key={index} />
      ))}
    </View>
  );
};
