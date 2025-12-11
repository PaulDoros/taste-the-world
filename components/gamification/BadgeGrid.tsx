import React from 'react';
import { View, Pressable } from 'react-native';
import { YStack, XStack, Text, Card } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BADGES } from '@/constants/Badges';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { useAlertDialog } from '@/hooks/useAlertDialog';

import { useAuth } from '@/hooks/useAuth';

export const BadgeGrid = () => {
  const { token } = useAuth();
  const stats = useQuery(api.gamification.getStats, {
    token: token || undefined,
  });
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { showConfirm } = useAlertDialog();

  if (!stats) return null;

  const unlockedIds = stats.badges || [];

  const getBadgeProgress = (badgeId: string) => {
    if (!stats) return '';

    switch (badgeId) {
      case 'streak_3':
        return `Current Streak: ${stats.currentStreak}/3 days`;
      case 'streak_7':
        return `Current Streak: ${stats.currentStreak}/7 days`;
      case 'level_5':
        return `Current Level: ${stats.level}/5`;
      case 'first_cook':
        return stats.xp > 0 ? 'Almost there!' : 'Start cooking to unlock';
      case 'explorer':
        return 'Visit different countries to progress';
      default:
        return '';
    }
  };

  const handlePressBadge = (badge: (typeof BADGES)[0], isUnlocked: boolean) => {
    haptics.light();
    const progress = !isUnlocked ? `\n\n${getBadgeProgress(badge.id)}` : '';

    showConfirm(
      {
        title: badge.title + (isUnlocked ? ' (Unlocked)' : ' (Locked)'),
        message:
          badge.description +
          (isUnlocked ? '\n\nGreat job!' : '\n\nKeep going to unlock!') +
          progress,
        confirmText: isUnlocked ? 'Awesome' : 'Got it',
      },
      () => {}
    );
  };

  return (
    <YStack gap="$3" marginTop="$4">
      <Text fontSize="$5" fontWeight="700" color="$color" paddingHorizontal={4}>
        Achievements ({unlockedIds.length}/{BADGES.length})
      </Text>

      <XStack flexWrap="wrap" gap="$3">
        {BADGES.map((badge) => {
          const isUnlocked = unlockedIds.includes(badge.id);

          return (
            <Pressable
              key={badge.id}
              onPress={() => handlePressBadge(badge, isUnlocked)}
              style={({ pressed }) => ({
                width: '30%', // roughly 3 per row
                aspectRatio: 1,
                marginBottom: 8,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              })}
            >
              <Card
                flex={1}
                alignItems="center"
                justifyContent="center"
                backgroundColor={isUnlocked ? badge.color + '15' : colors.card}
                borderColor={isUnlocked ? badge.color : colors.border}
                borderWidth={1}
                borderRadius="$4"
                padding="$2"
                opacity={isUnlocked ? 1 : 0.5}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: isUnlocked ? badge.color : '#ccc',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <FontAwesome5
                    name={isUnlocked ? (badge.icon as any) : 'lock'}
                    size={16}
                    color="white"
                  />
                </View>

                <Text
                  fontSize="$2"
                  fontWeight="600"
                  textAlign="center"
                  color={isUnlocked ? colors.text : colors.tabIconDefault}
                  numberOfLines={2}
                >
                  {badge.title}
                </Text>
              </Card>
            </Pressable>
          );
        })}
      </XStack>
    </YStack>
  );
};
