import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { useSettingsStore } from '@/store/settingsStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// --- Configuration Constants ---
const BUBBLE_CONFIG = {
  MIN_SIZE: 100,
  MAX_SIZE_VARIANCE: 300,

  MIN_DURATION: 8000,
  MAX_DURATION_VARIANCE: 12000,

  // Opacity
  MIN_OPACITY: 0.1,
  MAX_OPACITY_VARIANCE: 0.7,

  // Density
  DENSITY_MULTIPLIER: 0.00001,
  MAX_BUBBLE_COUNT: 20,
  MIN_BUBBLE_COUNT: 3,
};

// --- Color Palettes ---
// Add or remove colors here to change the theme
const PALETTES = {
  DARK: [
    '#38bdf8', // Existing Blue
    '#F59E0B', // Existing Amber
    '#8B5CF6', // Existing Purple
    '#22D3EE', // Cyan-400
    '#A3E635', // Lime-400
    '#FB7185', // Rose-400
    '#34D399', // Emerald-400
    '#0EA5E9', // Sky-500
    '#F97316', // Orange-500
    '#60A5FA', // Blue-400 (Soft Neon)
    '#2DD4BF', // Teal-400
  ],
  LIGHT: [
    '#3b82f6', // Existing Blue
    '#8B5CF6', // Existing Purple
    '#38BDF8', // Sky-400
    '#A78BFA', // Violet-400
    '#F472B6', // Pink-400
    '#34D399', // Emerald-400
    '#FDBA74', // Orange-300 (Warm Glow)
    '#FDE047', // Yellow-300 (Sunlight)
    '#67E8F9', // Cyan-300
    '#C4B5FD', // Violet-300 (Aurora)
  ],
};

interface SmartBubbleProps {
  containerWidth: number;
  containerHeight: number;
  palette: string[];
  initialSide: 'left' | 'right';
}

// A smart bubble that moves to a new random position every time it fades out
const SmartBubble = React.memo(
  ({
    containerWidth,
    containerHeight,
    palette,
    initialSide,
  }: SmartBubbleProps) => {
    // Shared values for fully dynamic properties
    const opacity = useSharedValue(0);
    const top = useSharedValue(0);
    const left = useSharedValue(0);
    const size = useSharedValue(0);

    const [color, setColor] = useState(palette[0]);

    const side = initialSide;

    const randomizeAndAnimate = () => {
      // 1. Randomize properties while invisible
      const newSize =
        Math.floor(Math.random() * BUBBLE_CONFIG.MAX_SIZE_VARIANCE) +
        BUBBLE_CONFIG.MIN_SIZE;

      let minLeft, maxLeft;

      // Logic for Sides with Overlap
      if (side === 'left') {
        minLeft = -newSize * 0.8;
        maxLeft = containerWidth * 0.6 - newSize * 0.2;
      } else {
        minLeft = containerWidth * 0.4;
        maxLeft = containerWidth - newSize * 0.2;
      }

      const newLeft = minLeft + Math.random() * (maxLeft - minLeft);
      const newTop = Math.random() * (containerHeight - newSize);

      // JS updates
      const newColor = palette[Math.floor(Math.random() * palette.length)];
      setColor(newColor);

      // Update Shared Values (Instant)
      top.value = newTop;
      left.value = newLeft;
      size.value = newSize;

      // 2. Determine Timing
      const duration =
        BUBBLE_CONFIG.MIN_DURATION +
        Math.random() * BUBBLE_CONFIG.MAX_DURATION_VARIANCE;

      const maxOpacity =
        BUBBLE_CONFIG.MIN_OPACITY +
        Math.random() * BUBBLE_CONFIG.MAX_OPACITY_VARIANCE;

      // 3. Start Animation Sequence
      opacity.value = withSequence(
        // Fade In
        withTiming(maxOpacity, {
          duration: duration * 0.4,
          easing: Easing.inOut(Easing.ease),
        }),
        // Hold
        withTiming(maxOpacity, { duration: duration * 0.4 }),
        // Fade Out
        withTiming(
          0,
          {
            duration: duration * 0.2,
            easing: Easing.inOut(Easing.ease),
          },
          (finished) => {
            if (finished) {
              runOnJS(randomizeAndAnimate)();
            }
          }
        )
      );
    };

    useEffect(() => {
      // Initial random start delay to desynchronize
      const initialDelay = Math.random() * 8000;
      const timeout = setTimeout(() => {
        randomizeAndAnimate();
      }, initialDelay);

      return () => {
        clearTimeout(timeout);
        cancelAnimation(opacity);
      };
    }, [containerHeight]);

    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      top: top.value,
      left: left.value,
      width: size.value,
      height: size.value,
      borderRadius: size.value / 2,
    }));

    return (
      <Animated.View
        style={[
          { position: 'absolute', backgroundColor: color },
          animatedStyle,
        ]}
      />
    );
  }
);

interface AmbientBackgroundProps {
  scrollable?: boolean;
  height?: number;
}

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

  // Determine count based on area
  const count = useMemo(() => {
    const quantity = Math.floor(
      screenWidth * effectiveHeight * BUBBLE_CONFIG.DENSITY_MULTIPLIER
    );
    const safeQuantity = Math.min(
      Math.max(quantity, BUBBLE_CONFIG.MIN_BUBBLE_COUNT),
      BUBBLE_CONFIG.MAX_BUBBLE_COUNT
    );
    return safeQuantity;
  }, [effectiveHeight]);

  // Generate stable index array
  const bubbles = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
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
      {bubbles.map((i) => (
        <SmartBubble
          key={i}
          containerWidth={screenWidth}
          containerHeight={effectiveHeight}
          palette={palette}
          initialSide={i % 2 === 0 ? 'left' : 'right'}
        />
      ))}
    </View>
  );
};
