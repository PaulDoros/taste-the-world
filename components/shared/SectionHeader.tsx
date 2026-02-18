import React, { useCallback } from 'react';
import { XStack, YStack, Heading, Paragraph, Button, useTheme } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { haptics } from '@/utils/haptics';

import { GlassCard } from '@/components/ui/GlassCard';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  onSeeAll?: () => void;
  seeAllText?: string;
}

export const SectionHeader = React.memo<SectionHeaderProps>(
  ({ title, subtitle, onSeeAll, seeAllText }) => {
    const theme = useTheme();

    const handleSeeAll = useCallback(() => {
      haptics.light();
      onSeeAll?.();
    }, [onSeeAll]);

    return (
      <GlassCard
        borderRadius={24}
        shadowRadius={8}
        style={{ marginBottom: 24, marginHorizontal: 20 }}
      >
        <XStack alignItems="center" justifyContent="space-between" padding="$4">
          <YStack flex={1}>
            <XStack alignItems="center" space="$3" marginBottom="$1">
              {/* Accent bar */}
              <YStack
                width={4}
                height={24}
                borderRadius="$10"
                backgroundColor="$tint"
              />
              <Heading size="$8" fontWeight="900" color="$color">
                {title}
              </Heading>
            </XStack>
            {subtitle && (
              <Paragraph
                size="$3"
                marginLeft="$4"
                color="$color11"
                opacity={0.8}
              >
                {subtitle}
              </Paragraph>
            )}
          </YStack>

          {/* See All Button */}
          {onSeeAll && (
            <Button
              onPress={handleSeeAll}
              size="$3"
              circular
              chromeless
              width={44}
              height={44}
              pressStyle={{ scale: 0.9, opacity: 0.7 }}
              icon={
                <FontAwesome5
                  name="arrow-right"
                  size={14}
                  color={theme.tint.get()}
                />
              }
            />
          )}
        </XStack>
      </GlassCard>
    );
  }
);
