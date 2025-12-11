import React from 'react';
import { View } from 'react-native';
import { YStack, XStack, Text, Progress } from 'tamagui';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { XP_PER_LEVEL } from '@/convex/shared';

import { useAuth } from '@/hooks/useAuth';

export const XPProgress = () => {
  const { token } = useAuth();
  const stats = useQuery(api.gamification.getStats, {
    token: token || undefined,
  });

  if (!stats) return null;

  // Calculate progress within current level
  // Level 1: 0-99. Level 2: 100-199.
  // Current XP: 150 -> Level 2. Progress: (150 % 100) = 50.
  // Wait, my simple logic in backend was floor(xp / 100) + 1.
  // So effective "XP into level" is stats.xp % 100.
  // But let's define it properly.

  // We'll duplicate the constant here for now or import it if compatible (it is).
  const xpIntoLevel = stats.xp % 100; // Assuming 100 per level
  const percent = (xpIntoLevel / 100) * 100;

  return (
    <YStack gap="$1" width={120}>
      <XStack justifyContent="space-between">
        <Text fontSize="$2" fontWeight="700" color="$gray10">
          Lvl {stats.level}
        </Text>
        <Text fontSize="$2" color="$gray9">
          {xpIntoLevel}/100 XP
        </Text>
      </XStack>
      <Progress value={percent} size="$2">
        <Progress.Indicator animation="bouncy" backgroundColor="$tint" />
      </Progress>
    </YStack>
  );
};
