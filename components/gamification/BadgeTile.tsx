import React from 'react';
import { View, Pressable, Dimensions } from 'react-native';
import { Text, Progress } from 'tamagui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
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

export const BadgeTile = ({
  badge,
  isUnlocked,
  userStats,
  onPress,
}: BadgeTileProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
      <View
        style={{
          flex: 1,
          borderRadius: 16,
          backgroundColor: colors.card,
          shadowColor: isUnlocked ? badge.color : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isUnlocked ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: isUnlocked ? 5 : 1,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={
            isUnlocked
              ? [badge.color, `${badge.color}60`]
              : [colors.card, colors.card]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: isUnlocked ? 0 : 1,
            borderColor: isUnlocked ? 'transparent' : colors.border,
          }}
        >
          {/* Icon Container */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: isUnlocked
                ? 'rgba(255,255,255,0.2)'
                : `${colors.text}05`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12, // Increased spacing
              position: 'relative',
            }}
          >
            {/* If unlocked and has Lottie, show animation. Else show Icon */}
            {isUnlocked && badge.lottieSource ? (
              <LottieView
                autoPlay
                loop
                source={badge.lottieSource}
                style={{ width: 64, height: 64 }}
              />
            ) : (
              <MaterialCommunityIcons
                name={badge.icon as any}
                size={36}
                color={isUnlocked ? '#FFF' : colors.text}
                // If locked, just a bit visible under the lock
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
                  backgroundColor: 'rgba(0,0,0,0.3)', // Slight dark overlay on the circle
                  borderRadius: 36,
                }}
              >
                <MaterialCommunityIcons
                  name="lock"
                  size={24}
                  color="#FFF"
                  style={{ opacity: 0.9 }}
                />
              </View>
            )}
          </View>

          {/* Title - Ensure it pushes down or container is centered */}
          <Text
            fontSize={11}
            fontWeight="700"
            color={isUnlocked ? '#FFF' : colors.text}
            textAlign="center"
            numberOfLines={2}
            opacity={isUnlocked ? 1 : 0.6}
            marginBottom={4}
          >
            {badge.title}
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
                <Progress.Indicator
                  backgroundColor={badge.color}
                  opacity={0.5}
                />
              </Progress>
            </View>
          )}
        </LinearGradient>
      </View>
    </Pressable>
  );
};
