import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';

/**
 * StaggeredList Component
 * Animates children with a staggered entrance effect
 * Like Instagram feed loading animation
 */

interface StaggeredListItemProps {
  children: React.ReactNode;
  index: number;
  staggerDelay?: number;
}

export const StaggeredListItem = ({
  children,
  index,
  staggerDelay = 15, // Reduced from 50ms to 15ms for snappier feel
}: StaggeredListItemProps) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(12); // Reduced from 20 to 12 for subtler effect

  useEffect(() => {
    // Limit stagger effect to first 20 items for performance
    const effectiveDelay = index < 20 ? index * staggerDelay : 0;
    
    // Stagger animation based on index
    opacity.value = withDelay(
      effectiveDelay,
      withSpring(1, {
        damping: 15, // More responsive (was 20)
        stiffness: 120, // Faster animation (was 90)
      })
    );

    translateY.value = withDelay(
      effectiveDelay,
      withSpring(0, {
        damping: 15,
        stiffness: 120,
      })
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1, maxWidth: '48%' }, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
