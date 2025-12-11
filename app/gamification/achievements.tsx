import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { YStack, XStack, Text, Progress, Separator } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BADGES } from '@/constants/Badges';
import { BadgeTile } from '@/components/gamification/BadgeTile';
import { AchievementRow } from '@/components/gamification/AchievementRow';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';

import { Pressable } from 'react-native';

export default function AchievementsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();

  const stats = useQuery(api.gamification.getStats, {
    token: token || undefined,
  });

  // Loading state
  if (stats === undefined) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Stack.Screen options={{ headerShown: true, title: 'Achievements' }} />
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  // Handle explicitly null stats (e.g. unauthenticated)
  if (stats === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}
      >
        <Stack.Screen options={{ headerShown: true, title: 'Achievements' }} />
        <Text color={colors.text} fontSize="$5" textAlign="center">
          Please sign in to view your achievements.
        </Text>
      </View>
    );
  }

  const xpIntoLevel = stats.xp % 100;
  const progressPercent = Math.round((xpIntoLevel / 100) * 100);
  const unlockedIds = stats.badges || [];

  const [selectedBadge, setSelectedBadge] = React.useState<
    (typeof BADGES)[0] | null
  >(null);

  const renderBadgeDetails = () => {
    if (!selectedBadge) return null;
    const isUnlocked = unlockedIds.includes(selectedBadge.id);

    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 20,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View
          style={{
            width: '90%',
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 24,
            alignItems: 'stretch',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 10,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          {/* Header for Modal */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$4"
          >
            <Text fontSize="$6" fontWeight="800" color={colors.text}>
              Badge Details
            </Text>
            <Pressable onPress={() => setSelectedBadge(null)}>
              <FontAwesome5
                name="times"
                size={20}
                color={colors.text}
                opacity={0.5}
              />
            </Pressable>
          </XStack>

          {/* Detail Content using AchievementRow reuse */}
          <AchievementRow
            badge={selectedBadge}
            isUnlocked={isUnlocked}
            userStats={stats}
          />

          {/* Status Message */}
          <Text
            textAlign="center"
            color={colors.text}
            opacity={0.6}
            fontSize="$3"
            marginTop="$4"
          >
            {isUnlocked
              ? "Congratulations! You've mastered this achievement."
              : 'Keep cooking to unlock this badge!'}
          </Text>

          <Pressable
            onPress={() => setSelectedBadge(null)}
            style={{
              marginTop: 24,
              paddingVertical: 14,
              backgroundColor: colors.tint,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <Text color="#FFF" fontWeight="700" fontSize="$4">
              Awesome
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Achievements',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />

      {renderBadgeDetails()}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Stats */}
        <YStack alignItems="center" marginBottom="$6" marginTop="$4">
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 8,
              borderColor: `${colors.tint}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <Text fontSize="$8" fontWeight="800" color={colors.tint}>
              {stats.level}
            </Text>
            <Text
              fontSize="$3"
              color={colors.text}
              opacity={0.6}
              fontWeight="600"
            >
              LEVEL
            </Text>
          </View>

          <YStack width="80%" alignItems="center" gap="$2">
            <Text fontSize="$4" fontWeight="600" color={colors.text}>
              {xpIntoLevel} / 100 XP
            </Text>
            <Progress
              value={progressPercent}
              size="$2"
              backgroundColor={`${colors.text}10`}
            >
              <Progress.Indicator
                animation="bouncy"
                backgroundColor={colors.tint}
              />
            </Progress>
            <Text
              fontSize="$2"
              color={colors.text}
              opacity={0.6}
              textAlign="center"
              marginTop="$1"
            >
              {100 - xpIntoLevel} XP to Level {stats.level + 1}
            </Text>
          </YStack>
        </YStack>

        <Separator borderColor={colors.border} marginBottom="$4" />

        {/* Stats Summary */}
        <XStack justifyContent="space-around" marginBottom="$6">
          <YStack alignItems="center" gap="$1">
            <FontAwesome5 name="fire" size={24} color="#f59e0b" />
            <Text fontSize="$5" fontWeight="700" color={colors.text}>
              {stats.currentStreak}
            </Text>
            <Text fontSize="$2" color={colors.text} opacity={0.6}>
              Day Streak
            </Text>
          </YStack>
          <YStack alignItems="center" gap="$1">
            <FontAwesome5 name="star" size={24} color="#fbbf24" />
            <Text fontSize="$5" fontWeight="700" color={colors.text}>
              {stats.xp}
            </Text>
            <Text fontSize="$2" color={colors.text} opacity={0.6}>
              Total XP
            </Text>
          </YStack>
          <YStack alignItems="center" gap="$1">
            <FontAwesome5 name="medal" size={24} color="#8b5cf6" />
            <Text fontSize="$5" fontWeight="700" color={colors.text}>
              {unlockedIds.length}
            </Text>
            <Text fontSize="$2" color={colors.text} opacity={0.6}>
              Badges
            </Text>
          </YStack>
        </XStack>

        <Text
          fontSize="$6"
          fontWeight="700"
          color={colors.text}
          marginBottom="$4"
        >
          Trophy Case
        </Text>

        {/* Badge Grid Gallery */}
        <XStack flexWrap="wrap" gap="$3" justifyContent="flex-start">
          {BADGES.map((badge) => (
            <BadgeTile
              key={badge.id}
              badge={badge}
              isUnlocked={unlockedIds.includes(badge.id)}
              userStats={stats}
              onPress={(b) => {
                haptics.selection();
                setSelectedBadge(b);
              }}
            />
          ))}
        </XStack>
      </ScrollView>
    </View>
  );
}
