import React from 'react';
import { View } from 'react-native';
import { YStack, XStack, Text, Progress, Card } from 'tamagui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { LottieAnimation } from '@/components/shared/LottieAnimation';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BadgeDef } from '@/constants/Badges';
import { Doc } from '@/convex/_generated/dataModel';
import { getBadgeProgress } from '@/utils/badgeUtils';

interface AchievementRowProps {
  badge: BadgeDef;
  isUnlocked: boolean;
  userStats: NonNullable<Doc<'users'>['gamification']>;
}

import { useLanguage } from '@/context/LanguageContext';

export const AchievementRow = ({
  badge,
  isUnlocked,
  userStats,
}: AchievementRowProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  // Helper to calculate progress percentage and text for locked badges
  const { percent, text } = getBadgeProgress(badge, userStats, isUnlocked);

  return (
    <GlassCard
      borderRadiusInside={0}
      borderRadius={20}
      shadowRadius={2}
      intensity={isUnlocked ? 40 : 20}
      backgroundColor={isUnlocked ? badge.color : undefined}
      backgroundOpacity={isUnlocked ? 0.15 : 0.05}
      shadowColor={isUnlocked ? badge.color : '#000'}
      shadowOpacity={isUnlocked ? 0.3 : 0.1}
      style={{
        marginBottom: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: isUnlocked ? `${badge.color}40` : colors.border,
      }}
    >
      <XStack gap="$4" alignItems="center">
        {/* Icon Circle */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: isUnlocked
              ? `${badge.color}20`
              : `${colors.text}10`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isUnlocked && badge.lottieSource ? (
            <LottieAnimation
              autoPlay
              loop
              source={badge.lottieSource}
              style={{ width: 48, height: 48 }}
            />
          ) : (
            <MaterialCommunityIcons
              name={isUnlocked ? (badge.icon as any) : 'lock'}
              size={28}
              color={isUnlocked ? badge.color : colors.text}
              style={{ opacity: isUnlocked ? 1 : 0.5 }}
            />
          )}
        </View>

        {/* Text Content */}
        <YStack flex={1} gap="$1">
          <XStack justifyContent="space-between" alignItems="center">
            <Text
              fontSize="$5"
              fontWeight="800"
              color={colors.text}
              opacity={isUnlocked ? 1 : 0.6}
            >
              {t(badge.titleKey as any)}
            </Text>
            {isUnlocked && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={20}
                color={badge.color}
                style={{ opacity: 0.9 }}
              />
            )}
          </XStack>

          <Text
            fontSize="$3"
            color={colors.text}
            opacity={isUnlocked ? 0.9 : 0.6}
            fontWeight={isUnlocked ? '500' : '400'}
          >
            {t(badge.descriptionKey as any)}
          </Text>

          {/* Progress Bar (Visible even if unlocked? Maybe just text if unlocked) */}
          {!isUnlocked && (
            <YStack marginTop="$3" gap="$1.5">
              <XStack justifyContent="space-between">
                <Text
                  fontSize={10}
                  color={colors.text}
                  opacity={0.5}
                  fontWeight="700"
                  letterSpacing={1}
                >
                  PROGRESS
                </Text>
                <Text
                  fontSize={10}
                  color={colors.text}
                  opacity={0.5}
                  fontWeight="600"
                >
                  {text}
                </Text>
              </XStack>
              <Progress
                value={percent}
                size="$1"
                backgroundColor={`${colors.text}15`}
              >
                <Progress.Indicator
                  animation="bouncy"
                  backgroundColor={badge.color} // Use badge color for progress
                  opacity={0.8}
                />
              </Progress>
            </YStack>
          )}
        </YStack>
      </XStack>
    </GlassCard>
  );
};
