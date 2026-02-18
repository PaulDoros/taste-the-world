import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Text, Progress } from 'tamagui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';
import { LottieAnimation } from '@/components/shared/LottieAnimation';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { BadgeDef } from '@/constants/Badges';
import { Doc } from '@/convex/_generated/dataModel';
import { getBadgeProgress } from '@/utils/badgeUtils';

const SCREEN_WIDTH = Dimensions.get('window').width;
const COLUMN_COUNT = 2;
const GAP = 16;
const PADDING = 16;
const ITEM_WIDTH =
  (SCREEN_WIDTH - PADDING * 2 - (COLUMN_COUNT - 1) * GAP) / COLUMN_COUNT;

interface BadgeTileProps {
  badge: BadgeDef;
  isUnlocked: boolean;
  userStats: NonNullable<Doc<'users'>['gamification']>;
  onPress: (badge: BadgeDef) => void;
}

import { useLanguage } from '@/context/LanguageContext';

export const BadgeTile = ({
  badge,
  isUnlocked,
  userStats,
  onPress,
}: BadgeTileProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const { percent, text } = getBadgeProgress(badge, userStats, isUnlocked);

  return (
    <Pressable
      onPress={() => onPress(badge)}
      style={({ pressed }) => ({
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.35,
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.96 : 1 }],
      })}
    >
      <GlassCard
        borderRadius={16}
        intensity={isUnlocked ? 40 : 20}
        backgroundColor={isUnlocked ? badge.color : undefined}
        backgroundOpacity={isUnlocked ? 0.15 : 0.05}
        shadowColor={isUnlocked ? badge.color : '#000'}
        shadowOpacity={isUnlocked ? 0.3 : 0.1}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          borderWidth: isUnlocked ? 1 : 1,
          borderColor: isUnlocked ? `${badge.color}40` : colors.border,
        }}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Icon Container */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: isUnlocked
              ? `${badge.color}20` // Subtle tint matching badge
              : `${colors.text}05`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
            position: 'relative',
          }}
        >
          {/* If unlocked and has Lottie, show animation. Else show Icon */}
          {isUnlocked && badge.lottieSource ? (
            <LottieAnimation
              autoPlay
              loop
              source={badge.lottieSource}
              style={{ width: 64, height: 64 }}
            />
          ) : (
            <MaterialCommunityIcons
              name={badge.icon as any}
              size={36}
              color={isUnlocked ? badge.color : colors.text} // Use badge color for icon if unlocked
              style={{ opacity: isUnlocked ? 1 : 0.4 }}
            />
          )}

          {/* Lock Overlay if Locked */}
          {!isUnlocked && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: 36,
              }}
            >
              <MaterialCommunityIcons
                name="lock"
                size={24}
                color={colors.text}
                style={{ opacity: 0.5 }}
              />
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          fontSize={11}
          fontWeight="700"
          color={colors.text}
          textAlign="center"
          numberOfLines={2}
          opacity={isUnlocked ? 1 : 0.6}
          marginBottom={4}
        >
          {t(badge.titleKey as any)}
        </Text>

        {/* Progress Bar for Locked Items */}
        {!isUnlocked && (
          <View style={{ width: '100%', marginTop: 8 }}>
            <Text
              fontSize={9}
              color={colors.text}
              opacity={0.5}
              textAlign="center"
              marginBottom={2}
            >
              {percent}%
            </Text>
            <Progress
              value={percent}
              size="$1"
              backgroundColor={`${colors.text}10`}
              height={3}
            >
              <Progress.Indicator backgroundColor={badge.color} opacity={0.5} />
            </Progress>
          </View>
        )}
      </GlassCard>
    </Pressable>
  );
};
