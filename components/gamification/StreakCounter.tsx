import React, { useEffect } from 'react';
import { View } from 'react-native';
import { XStack, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export const StreakCounter = () => {
  const stats = useQuery(api.gamification.getStats);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!stats) return null;

  return (
    <XStack
      backgroundColor="$background"
      paddingHorizontal="$3"
      paddingVertical="$2"
      borderRadius="$4"
      alignItems="center"
      gap="$2"
      borderWidth={1}
      borderColor="$borderColor"
      elevation={2}
    >
      <Animated.View style={animatedStyle}>
        <FontAwesome5 name="fire" size={20} color="#F59E0B" />
      </Animated.View>
      <Text fontSize="$5" fontWeight="800" color="$color">
        {stats.currentStreak}
      </Text>
    </XStack>
  );
};
