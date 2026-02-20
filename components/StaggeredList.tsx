import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { isAndroidAnimationsDisabled } from '@/constants/Performance';

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
  if (isAndroidAnimationsDisabled) {
    return <View style={{ flex: 1, width: '100%' }}>{children}</View>;
  }

  // Limit stagger effect to first 20 items for performance
  const delay = index < 20 ? index * staggerDelay : 0;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(15).stiffness(120)}
      style={{ flex: 1, width: '100%' }}
    >
      {children}
    </Animated.View>
  );
};
