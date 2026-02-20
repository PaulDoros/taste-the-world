import React from 'react';
import { View, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { XStack, YStack, Paragraph, useTheme } from 'tamagui';
import { PantryItem } from '@/store/pantryStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

interface PantryItemCardProps {
  item: PantryItem;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
}

export const PantryItemCard = ({
  item,
  index,
  onToggle,
  onDelete,
}: PantryItemCardProps) => {
  const theme = useTheme();
  const isChecked = Boolean(item.isChecked);

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={{ marginBottom: 12 }}
    >
      <GlassCard
        borderRadius={16}
        shadowRadius={6}
        backgroundColor={isChecked ? theme.tint.get() : undefined}
        backgroundOpacity={isChecked ? 0.08 : undefined}
      >
        <XStack padding="$4" alignItems="center" justifyContent="space-between">
          <Pressable
            onPress={onToggle}
            hitSlop={6}
            style={{ flex: 1, marginRight: 12 }}
          >
            <XStack alignItems="center" gap="$3" flex={1}>
              {/* Toggle Icon */}
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.tint.get() + (isChecked ? '22' : '15'),
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome5
                  name={isChecked ? 'check-circle' : 'circle'}
                  size={18}
                  color={theme.tint.get()}
                  solid={isChecked}
                />
              </View>

              {/* Item Info */}
              <YStack flex={1}>
                <Paragraph
                  size="$4"
                  fontWeight="600"
                  color="$color"
                  textDecorationLine={isChecked ? 'line-through' : 'none'}
                  opacity={isChecked ? 0.65 : 1}
                >
                  {item.displayName}
                </Paragraph>
                <Paragraph
                  size="$3"
                  color="$tint"
                  fontWeight="600"
                  opacity={isChecked ? 0.55 : 0.8}
                >
                  {item.measure}
                </Paragraph>
              </YStack>
            </XStack>
          </Pressable>

          {/* Delete Button */}
          <GlassButton
            shadowRadius={2}
            icon="trash-alt"
            onPress={onDelete}
            size="small"
            backgroundColor={theme.red10?.get()}
            backgroundOpacity={0.1}
            label="" // Icon only
            iconComponent={
              <FontAwesome5
                name="trash-alt"
                size={14}
                color={theme.red10?.get()}
              />
            }
          />
        </XStack>
      </GlassCard>
    </Animated.View>
  );
};
