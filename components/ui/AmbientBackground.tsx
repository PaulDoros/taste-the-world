import React, { useEffect, useMemo } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { useSettingsStore } from '@/store/settingsStore';
import { isAndroidLowPerf } from '@/constants/Performance';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const BUBBLE_CONFIG = {
  MIN_SIZE: 120,
  MAX_SIZE_VARIANCE: 220,
  MIN_DURATION: 4200,
  MAX_DURATION_VARIANCE: 3200,
  MIN_OPACITY: 0.1,
  MAX_OPACITY: 0.38,
  DENSITY_MULTIPLIER: 0.0000045,
  MAX_BUBBLE_COUNT: 10,
  MIN_BUBBLE_COUNT: 3,
  ANDROID_MAX_BUBBLE_COUNT: 6,
  ANDROID_LOW_PERF_STATIC_COUNT: 4,
};

const PALETTES = {
  DARK: [
    '#38bdf8',
    '#F59E0B',
    '#8B5CF6',
    '#22D3EE',
    '#A3E635',
    '#FB7185',
    '#34D399',
  ],
  LIGHT: [
    '#3b82f6',
    '#8B5CF6',
    '#38BDF8',
    '#A78BFA',
    '#F472B6',
    '#34D399',
  ],
};

interface BubbleDescriptor {
  id: number;
  top: number;
  left: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  maxOpacity: number;
}

interface AmbientBackgroundProps {
  scrollable?: boolean;
  height?: number;
}

const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 999.91) * 10000;
  return x - Math.floor(x);
};

const buildBubble = (
  id: number,
  containerWidth: number,
  containerHeight: number,
  palette: string[]
): BubbleDescriptor => {
  const size =
    BUBBLE_CONFIG.MIN_SIZE +
    seededRandom(id + 1) * BUBBLE_CONFIG.MAX_SIZE_VARIANCE;
  const left =
    -size * 0.25 + seededRandom(id + 2) * (containerWidth - size * 0.5);
  const top = seededRandom(id + 3) * Math.max(1, containerHeight - size);
  const color = palette[Math.floor(seededRandom(id + 4) * palette.length)];
  const duration =
    BUBBLE_CONFIG.MIN_DURATION +
    seededRandom(id + 5) * BUBBLE_CONFIG.MAX_DURATION_VARIANCE;
  const delay = seededRandom(id + 6) * 2200;
  const maxOpacity =
    BUBBLE_CONFIG.MIN_OPACITY +
    seededRandom(id + 7) * (BUBBLE_CONFIG.MAX_OPACITY - BUBBLE_CONFIG.MIN_OPACITY);

  return { id, top, left, size, color, duration, delay, maxOpacity };
};

const PulsingBubble = React.memo(({ bubble }: { bubble: BubbleDescriptor }) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      bubble.delay,
      withRepeat(
        withSequence(
          withTiming(bubble.maxOpacity, {
            duration: bubble.duration,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(bubble.maxOpacity * 0.45, {
            duration: bubble.duration * 0.85,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(opacity);
    };
  }, [bubble.delay, bubble.duration, bubble.maxOpacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: bubble.top,
          left: bubble.left,
          width: bubble.size,
          height: bubble.size,
          borderRadius: bubble.size / 2,
          backgroundColor: bubble.color,
        },
        animatedStyle,
      ]}
    />
  );
});

export const AmbientBackground = ({
  scrollable = false,
  height,
}: AmbientBackgroundProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { isAmbientBackgroundEnabled } = useSettingsStore();

  const effectiveHeight = scrollable ? height || 4000 : screenHeight;
  const palette = useMemo(
    () => (isDark ? PALETTES.DARK : PALETTES.LIGHT),
    [isDark]
  );

  const bubbleCount = useMemo(() => {
    const quantity = Math.floor(
      screenWidth * effectiveHeight * BUBBLE_CONFIG.DENSITY_MULTIPLIER
    );

    let count = Math.min(
      Math.max(quantity, BUBBLE_CONFIG.MIN_BUBBLE_COUNT),
      BUBBLE_CONFIG.MAX_BUBBLE_COUNT
    );

    if (Platform.OS === 'android') {
      count = Math.min(count, BUBBLE_CONFIG.ANDROID_MAX_BUBBLE_COUNT);
    }

    if (isAndroidLowPerf) {
      count = BUBBLE_CONFIG.ANDROID_LOW_PERF_STATIC_COUNT;
    }

    return count;
  }, [effectiveHeight]);

  const bubbles = useMemo(
    () =>
      Array.from({ length: bubbleCount }, (_, i) =>
        buildBubble(i, screenWidth, effectiveHeight, palette)
      ),
    [bubbleCount, effectiveHeight, palette]
  );

  if (!isAmbientBackgroundEnabled) return null;

  return (
    <View
      style={{
        height: effectiveHeight,
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        overflow: 'hidden',
      }}
      pointerEvents="none"
    >
      {isAndroidLowPerf
        ? bubbles.map((bubble) => (
            <View
              key={bubble.id}
              style={{
                position: 'absolute',
                top: bubble.top,
                left: bubble.left,
                width: bubble.size,
                height: bubble.size,
                borderRadius: bubble.size / 2,
                backgroundColor: bubble.color,
                opacity: 0.16,
              }}
            />
          ))
        : bubbles.map((bubble) => <PulsingBubble key={bubble.id} bubble={bubble} />)}
    </View>
  );
};
