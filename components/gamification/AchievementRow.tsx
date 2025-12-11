import React from 'react';
import { View } from 'react-native';
import { YStack, XStack, Text, Progress, Card } from 'tamagui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
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

export const AchievementRow = ({
  badge,
  isUnlocked,
  userStats,
}: AchievementRowProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Helper to calculate progress percentage and text for locked badges
  const { percent, text } = getBadgeProgress(badge, userStats, isUnlocked);

  return (
    <View
      style={{
        marginBottom: 12,
        borderRadius: 20,
        backgroundColor: colors.card, // Fallback
        shadowColor: isUnlocked ? badge.color : '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isUnlocked ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: isUnlocked ? 6 : 2,
      }}
    >
      <LinearGradient
        colors={
          isUnlocked
            ? [badge.color, `${badge.color}80`] // Dynamic gradient based on badge color
            : [colors.card, colors.card]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20,
          padding: 16,
          // If unlocked, we might want a subtle border or just rely on the gradient
          borderWidth: isUnlocked ? 0 : 1,
          borderColor: isUnlocked ? 'transparent' : colors.border,
          opacity: isUnlocked ? 1 : 0.7, // Keep locked ones dimmer
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
                ? 'rgba(255,255,255,0.2)'
                : `${colors.text}10`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: isUnlocked ? 'rgba(255,255,255,0.4)' : 'transparent',
            }}
          >
            {isUnlocked && badge.lottieSource ? (
              <LottieView
                autoPlay
                loop
                source={badge.lottieSource}
                style={{ width: 48, height: 48 }}
              />
            ) : (
              <MaterialCommunityIcons
                name={isUnlocked ? (badge.icon as any) : 'lock'}
                size={28}
                color={isUnlocked ? '#FFF' : colors.text}
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
                color={isUnlocked ? '#FFF' : colors.text} // White text if unlocked (on gradient)
                opacity={isUnlocked ? 1 : 0.6}
              >
                {badge.title}
              </Text>
              {isUnlocked && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={20}
                  color="#FFF"
                />
              )}
            </XStack>

            <Text
              fontSize="$3"
              color={isUnlocked ? '#FFF' : colors.text}
              opacity={isUnlocked ? 0.9 : 0.6}
              fontWeight={isUnlocked ? '500' : '400'}
            >
              {badge.description}
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
      </LinearGradient>
    </View>
  );
};
