import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  FadeInDown,
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
  staggerDelay = 30, // Slightly increased for better visibility
}: StaggeredListItemProps) => {
  // Limit stagger effect to first 20 items for performance
  const delay = index < 20 ? index * staggerDelay : 0;

  return (
    <Animated.View 
      entering={FadeInDown.delay(delay).springify().damping(15).stiffness(120)}
      style={{ flex: 1, maxWidth: '48%' }}
    >
      {children}
    </Animated.View>
  );
};
