import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { YStack, XStack, Text, Progress, Separator } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { BADGES } from '@/constants/Badges';
import { BadgeTile } from '@/components/gamification/BadgeTile';
import { AchievementRow } from '@/components/gamification/AchievementRow';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

import { useLanguage } from '@/context/LanguageContext';

export default function AchievementsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { token } = useAuth();
  const { t } = useLanguage();

  const [selectedBadge, setSelectedBadge] = React.useState<
    (typeof BADGES)[0] | null
  >(null);

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
        <Stack.Screen
          options={{ headerShown: true, title: t('gamification_title') }}
        />
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
        <Stack.Screen
          options={{ headerShown: true, title: t('gamification_title') }}
        />
        <Text color={colors.text} fontSize="$5" textAlign="center">
          {t('gamification_signin_view')}
        </Text>
      </View>
    );
  }

  const xpIntoLevel = stats.xp % 100;
  const progressPercent = Math.round((xpIntoLevel / 100) * 100);
  const unlockedIds = stats.badges || [];

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
          backgroundColor: 'rgba(0,0,0,0.6)', // Slightly lighter dim for glass effect
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: 20,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />

        {/* Modal Container */}
        <GlassCard
          backgroundColor={colors.background}
          backgroundOpacity={0.9}
          borderRadiusInside={0}
          borderRadius={24}
          style={{
            width: '90%',
            padding: 24,
            alignItems: 'stretch',
          }}
        >
          {/* Header for Modal */}
          <XStack
            justifyContent="space-between"
            alignItems="center"
            marginBottom="$4"
          >
            <Text fontSize="$6" fontWeight="800" color={colors.text}>
              {t('gamification_badge_details')}
            </Text>
            <GlassButton
              shadowRadius={3}
              icon="times"
              size="small"
              onPress={() => setSelectedBadge(null)}
              shadowOpacity={0}
              label=""
            />
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
            marginBottom="$4"
          >
            {isUnlocked
              ? t('gamification_congrats')
              : t('gamification_locked_desc')}
          </Text>

          <GlassButton
            shadowRadius={2}
            onPress={() => setSelectedBadge(null)}
            label={t('gamification_awesome')}
            size="medium"
            variant="active" // Use active variant (tint color usually)
          />
          <View style={{ height: 16 }} />
        </GlassCard>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('gamification_title'),
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
              {t('gamification_level')}
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
              {t('gamification_xp_to_level', {
                xp: 100 - xpIntoLevel,
                nextLevel: stats.level + 1,
              })}
            </Text>
          </YStack>
        </YStack>

        <Separator borderColor={colors.border} marginBottom="$4" />

        {/* Stats Summary */}
        <GlassCard
          borderRadiusInside={0}
          borderRadius={20}
          style={{ marginBottom: 24, padding: 16 }}
        >
          <XStack justifyContent="space-around">
            <YStack alignItems="center" gap="$1" width={80}>
              <LottieView
                source={require('@/assets/animations/fire.json')}
                autoPlay
                loop
                style={{ width: 50, height: 50 }}
              />
              <Text fontSize="$5" fontWeight="700" color={colors.text}>
                {stats.currentStreak}
              </Text>
              <Text
                fontSize="$2"
                display="flex"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                color={colors.text}
                opacity={0.6}
              >
                {t('gamification_day_streak')}
              </Text>
            </YStack>

            <YStack alignItems="center" gap="$1" width={80}>
              <LottieView
                source={require('@/assets/animations/Star.json')}
                autoPlay
                loop
                style={{ width: 50, height: 50 }}
              />
              <Text fontSize="$5" fontWeight="700" color={colors.text}>
                {stats.xp}
              </Text>
              <Text
                fontSize="$2"
                justifyContent="center"
                alignItems="center"
                color={colors.text}
                opacity={0.6}
              >
                {t('gamification_total_xp')}
              </Text>
            </YStack>

            <YStack alignItems="center" gap="$1" width={80}>
              <LottieView
                source={require('@/assets/animations/Medal.json')}
                autoPlay
                loop
                style={{ width: 50, height: 50 }}
              />
              <Text fontSize="$5" fontWeight="700" color={colors.text}>
                {unlockedIds.length}
              </Text>
              <Text fontSize="$2" color={colors.text} opacity={0.6}>
                {t('gamification_badges')}
              </Text>
            </YStack>
          </XStack>
        </GlassCard>

        <Text
          fontSize="$6"
          fontWeight="700"
          color={colors.text}
          marginBottom="$4"
        >
          {t('gamification_trophy_case')}
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
