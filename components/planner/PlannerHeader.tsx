import React from 'react';
import { BlurView } from 'expo-blur';
import { XStack, YStack, Heading, Paragraph, Stack } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { EdgeInsets } from 'react-native-safe-area-context';

interface PlannerHeaderProps {
  colorScheme: 'light' | 'dark' | null | undefined;
  insets: EdgeInsets;
  colors: any;
  t: (key: any) => string;
  onHistoryPress: () => void;
}

export const PlannerHeader = ({
  colorScheme,
  insets,
  colors,
  t,
  onHistoryPress,
}: PlannerHeaderProps) => {
  return (
    <GlassCard
      intensity={80}
      borderRadius={0}
      style={{ zIndex: 10 }}
      contentContainerStyle={{
        overflow: 'hidden',
        borderBottomWidth: 1,
        borderBottomColor:
          colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      }}
    >
      <XStack
        paddingHorizontal="$4"
        paddingTop={insets.top + 12}
        paddingBottom="$3"
        alignItems="center"
        justifyContent="space-between"
      >
        <XStack alignItems="center" gap="$3">
          <Stack backgroundColor={colors.tint} padding={8} borderRadius={12}>
            <FontAwesome5 name="calendar-alt" size={20} color="white" />
          </Stack>
          <YStack>
            <Heading fontSize="$5" fontWeight="800">
              {t('meal_planner')}
            </Heading>
            <Paragraph fontSize="$2" opacity={0.6} color="$color11">
              {t('planner_subtitle')}
            </Paragraph>
          </YStack>
        </XStack>

        <GlassButton
          size="small"
          onPress={onHistoryPress}
          icon="history"
          backgroundColor={undefined}
          backgroundOpacity={0}
          textColor={colors.text}
          label=""
        />
      </XStack>
    </GlassCard>
  );
};
