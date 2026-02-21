import React from 'react';
import { Pressable, ActivityIndicator, Platform } from 'react-native';
import { XStack, YStack, Text, Stack } from 'tamagui';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';

interface PlannerMealCardProps {
  mealType: string;
  mealName: string;
  activeDay: number;
  index: number;
  colors: any;
  t: (key: any) => string;
  onViewRecipe: (mealName: string) => void;
  generatingRecipe: string | null;
}

export const PlannerMealCard = ({
  mealType,
  mealName,
  activeDay,
  index,
  colors,
  t,
  onViewRecipe,
  generatingRecipe,
}: PlannerMealCardProps) => {
  const getTheme = () => {
    switch (mealType) {
      case 'breakfast':
        return {
          icon: 'coffee',
          color: '$orange10',
          iconBg: '$orange3',
          bg: ['#FFF8E1', '#FFFFFF'],
        };
      case 'lunch':
        return {
          icon: 'sun',
          color: '$yellow11',
          iconBg: '$yellow4',
          bg: ['#F9FBE7', '#FFFFFF'],
        };
      case 'dinner':
        return {
          icon: 'moon',
          color: '$blue10',
          iconBg: '$blue3',
          bg: ['#E3F2FD', '#FFFFFF'],
        };
      default:
        return {
          icon: 'utensils',
          color: colors.tint,
          iconBg: '$gray3',
          bg: ['#F3E5F5', '#FFFFFF'],
        };
    }
  };

  const theme = getTheme();

  // Cast icon name to FontAwesome5 standard names or allow string if dynamic
  const iconName = theme.icon as any;

  return (
    <Animated.View
      key={`${mealType}-${activeDay}`}
      entering={FadeInUp.delay(index * 150)
        .springify()
        .damping(50)
        .stiffness(200)}
    >
      <GlassCard
        variant="default"
        style={{ borderRadius: 16 }}
        contentContainerStyle={{ padding: 0 }}
      >
        {/* Header Strip */}
        <XStack
          padding="$3"
          alignItems="center"
          justifyContent="space-between"
          backgroundColor={`${theme.color.replace('$', '')}10`}
        >
          <XStack gap="$3" alignItems="center">
            <Stack
              backgroundColor={theme.iconBg}
              padding={8}
              borderRadius={100}
              width={34}
              height={34}
              alignItems="center"
              justifyContent="center"
              animation="bouncy"
              pressStyle={{ scale: 0.9 }}
            >
              <FontAwesome5 name={iconName} size={14} color={theme.color} />
            </Stack>
            <Text
              fontSize="$3"
              fontWeight="700"
              textTransform="uppercase"
              color={theme.color}
              letterSpacing={0.5}
            >
              {t(`common_meal_${mealType}` as any)}
            </Text>
          </XStack>

          {/* Actions Right */}
          <Pressable
            onPress={() => onViewRecipe(mealName)}
            disabled={generatingRecipe === mealName}
            hitSlop={10}
            android_ripple={{
              color: Platform.OS === 'android' ? `${colors.tint}30` : undefined,
              borderless: true,
              radius: 40,
            }}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <XStack gap="$1" alignItems="center">
              <Text fontSize="$2" fontWeight="600" color={colors.tint}>
                {t('planner_see_recipe')}
              </Text>
              <FontAwesome5
                name="chevron-right"
                size={10}
                color={colors.tint}
              />
            </XStack>
          </Pressable>
        </XStack>

        {/* Content Body */}
        <YStack paddingHorizontal="$4" paddingVertical="$4">
          {generatingRecipe === mealName ? (
            <XStack gap="$3" alignItems="center">
              <ActivityIndicator size="small" color={colors.tint} />
              <Text fontSize="$3" color="$gray10">
                {t('planner_preparing_recipe')}
              </Text>
            </XStack>
          ) : (
            <Text fontSize="$6" fontWeight="600" lineHeight={28}>
              {mealName}
            </Text>
          )}
        </YStack>
      </GlassCard>
    </Animated.View>
  );
};
