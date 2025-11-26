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
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const CONTAINER_PADDING = 16;
// Calculate exact card width: (Screen Width - Padding*2 - Gap) / 2
const CARD_WIDTH = (SCREEN_WIDTH - CONTAINER_PADDING * 2 - CARD_GAP) / 2;

export const CountryCardSkeleton = () => {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'white',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      {/* Flag skeleton */}
      <View style={{ height: 200, position: 'relative' }}>
        <Skeleton width="100%" height={200} borderRadius={0} />

        {/* Overlay Content Skeletons (Name & Region) */}
        <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
          {/* Country Name */}
          <Skeleton
            width="70%"
            height={24}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
          {/* Region Tag */}
          <Skeleton width={60} height={20} borderRadius={12} />
        </View>
      </View>

      {/* Info Section */}
      <View style={{ padding: 12 }}>
        {/* Capital Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          {/* Icon Circle */}
          <Skeleton
            width={28}
            height={28}
            borderRadius={14}
            style={{ marginRight: 8 }}
          />
          {/* Text Lines */}
          <View style={{ flex: 1 }}>
            <Skeleton
              width="40%"
              height={10}
              borderRadius={4}
              style={{ marginBottom: 4 }}
            />
            <Skeleton width="70%" height={14} borderRadius={4} />
          </View>
        </View>

        {/* Population Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: '#f1f5f9',
          }}
        >
          <Skeleton
            width={12}
            height={12}
            borderRadius={6}
            style={{ marginRight: 6 }}
          />
          <Skeleton width="50%" height={12} borderRadius={4} />
        </View>
      </View>
    </View>
  );
};

/**
 * Grid of skeleton cards
 * Must match FlatList columnWrapperStyle exactly to prevent layout shift
 */
export const SkeletonGrid = ({ count = 6 }: { count?: number }) => {
  return (
    <View
      style={{
        paddingHorizontal: CONTAINER_PADDING,
      }}
    >
      {Array.from({ length: Math.ceil(count / 2) }).map((_, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            gap: CARD_GAP,
            marginBottom: rowIndex < Math.ceil(count / 2) - 1 ? 0 : 0, // No extra bottom margin
          }}
        >
          <View style={{ flex: 1 }}>
            <CountryCardSkeleton />
          </View>
          {rowIndex * 2 + 1 < count && (
            <View style={{ flex: 1 }}>
              <CountryCardSkeleton />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

/**
 * Explore Header Skeleton
 * Simple Search Bar Only
 */
export const ExploreHeaderSkeleton = () => {
  return (
    <View style={{ marginBottom: 20 }}>
      {/* Search Bar Skeleton */}
      <View style={{ marginHorizontal: 16 }}>
        <Skeleton width="100%" height={50} borderRadius={16} />
      </View>
    </View>
  );
};

/**
 * List Item Skeleton
 * For Shopping List
 */
export const SkeletonList = ({ count = 5 }: { count?: number }) => {
  return (
    <View style={{ padding: 16, gap: 12 }}>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            backgroundColor: '#f8fafc',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#e2e8f0',
          }}
        >
          <Skeleton
            width={24}
            height={24}
            borderRadius={12}
            style={{ marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Skeleton
              width="60%"
              height={16}
              borderRadius={4}
              style={{ marginBottom: 6 }}
            />
            <Skeleton width="40%" height={12} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
};

/**
 * Detail Screen Skeleton
 * For Country and Recipe details
 */
export const DetailSkeleton = () => {
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Hero Image */}
      <Skeleton width="100%" height={300} borderRadius={0} />

      <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
        {/* Title Card */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: 24,
            padding: 24,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
          }}
        >
          <Skeleton
            width="80%"
            height={32}
            borderRadius={8}
            style={{ marginBottom: 12 }}
          />
          <Skeleton width="50%" height={16} borderRadius={4} />
        </View>

        {/* Info Blocks */}
        <View style={{ gap: 12 }}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                borderRadius: 20,
                backgroundColor: '#f8fafc',
              }}
            >
              <Skeleton
                width={48}
                height={48}
                borderRadius={24}
                style={{ marginRight: 16 }}
              />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width="30%"
                  height={12}
                  borderRadius={4}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton width="60%" height={16} borderRadius={4} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
