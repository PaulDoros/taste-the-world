import React from 'react';
import { Pressable, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { XStack, YStack, Paragraph, useTheme } from 'tamagui';
import { UnifiedShoppingListItem } from '@/hooks/useShoppingList';
import { canConvert, getConvertedDisplay } from '@/utils/measurementConverter';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { playSound } from '@/utils/sounds';

interface ShoppingListItemProps {
  item: UnifiedShoppingListItem;
  index: number;
  showConversion: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveToPantry: () => void;
  onNavigateToRecipe: () => void;
}

export const ShoppingListItem = ({
  item,
  index,
  showConversion,
  onToggle,
  onDelete,
  onMoveToPantry,
  onNavigateToRecipe,
}: ShoppingListItemProps) => {
  const theme = useTheme();

  const handleToggle = () => {
    // Play scratch sound when checking off (if not already checked)
    if (!item.checked) {
      playSound('scratch');
    }
    // No sound on uncheck as requested: "scratch only when true"
    onToggle();
  };

  const handleMoveToPantry = () => {
    playSound('pop');
    onMoveToPantry();
  };

  const handleDelete = () => {
    playSound('trash');
    onDelete();
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={{ marginBottom: 12 }}
    >
      <GlassCard
        borderRadius={12}
        shadowRadius={5}
        intensity={item.checked ? 20 : 50} // Dim glass when checked
        contentContainerStyle={{ opacity: item.checked ? 0.6 : 1 }}
      >
        <XStack padding="$4" alignItems="flex-start" gap="$3">
          {/* Checkbox */}
          <Pressable
            onPress={handleToggle}
            hitSlop={8}
            android_ripple={{
              color:
                Platform.OS === 'android' ? `${theme.tint.get()}30` : undefined,
              borderless: true,
              radius: 20,
            }}
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              borderWidth: 2,
              borderColor: item.checked
                ? theme.tint.get()
                : theme.borderColor?.get() || '#ccc',
              backgroundColor: item.checked ? theme.tint.get() : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: 2,
            }}
          >
            {item.checked && (
              <FontAwesome5 name="check" size={12} color="white" />
            )}
          </Pressable>

          {/* Content */}
          <YStack flex={1} gap="$1">
            <Paragraph
              size="$4"
              fontWeight="600"
              color="$color"
              textDecorationLine={item.checked ? 'line-through' : 'none'}
              lineHeight={24}
            >
              {item.name}
            </Paragraph>

            <XStack alignItems="center" flexWrap="wrap" gap="$2">
              <Paragraph size="$3" color="$color" opacity={0.6}>
                {showConversion && canConvert(item.measure)
                  ? getConvertedDisplay(item.measure)
                  : item.measure}
              </Paragraph>

              {item.recipeName && item.recipeName !== 'Custom Item' && (
                <XStack alignItems="center" gap="$2">
                  <Paragraph size="$3" color="$color" opacity={0.4}>
                    •
                  </Paragraph>
                  <Pressable
                    onPress={onNavigateToRecipe}
                    android_ripple={{
                      color:
                        Platform.OS === 'android'
                          ? `${theme.tint.get()}20`
                          : undefined,
                      borderless: true,
                      radius: 100,
                    }}
                  >
                    <Paragraph
                      size="$3"
                      color="$tint"
                      fontWeight="500"
                      numberOfLines={1}
                    >
                      {item.recipeName}
                    </Paragraph>
                  </Pressable>
                </XStack>
              )}
            </XStack>
          </YStack>

          {/* Actions */}
          <XStack alignItems="center" gap="$2">
            <GlassButton
              shadowRadius={2}
              onPress={handleMoveToPantry}
              size="small"
              backgroundColor={theme.color?.get()}
              backgroundOpacity={0.05}
              label=""
              iconComponent={
                <FontAwesome5
                  name="box"
                  size={14}
                  color={theme.color?.get()}
                  style={{ opacity: 0.6 }}
                />
              }
            />

            <GlassButton
              shadowRadius={2}
              onPress={handleDelete}
              size="small"
              backgroundColor={theme.red10?.get()}
              backgroundOpacity={0.1}
              label=""
              iconComponent={
                <FontAwesome5
                  name="trash-alt"
                  size={14}
                  color={theme.red10?.get()}
                />
              }
            />
          </XStack>
        </XStack>
      </GlassCard>
    </Animated.View>
  );
};
