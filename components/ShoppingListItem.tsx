import React from 'react';
import { Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card, XStack, YStack, Paragraph } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { UnifiedShoppingListItem } from '@/hooks/useShoppingList';
import { canConvert, getConvertedDisplay } from '@/utils/measurementConverter';

interface ShoppingListItemProps {
  item: UnifiedShoppingListItem;
  index: number;
  showConversion: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onMoveToPantry: () => void;
  onNavigateToRecipe: () => void;
}

const AnimatedCard = Animated.createAnimatedComponent(Card);

export const ShoppingListItem = ({
  item,
  index,
  showConversion,
  onToggle,
  onDelete,
  onMoveToPantry,
  onNavigateToRecipe,
}: ShoppingListItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <AnimatedCard
      entering={FadeInUp.delay(index * 30).springify()}
      marginBottom="$3"
      padding="$4"
      borderRadius="$5"
      bordered
      backgroundColor={item.checked ? 'rgba(200, 200, 200, 0.1)' : colors.card}
      borderColor={item.checked ? 'transparent' : '$borderColor'}
      opacity={item.checked ? 0.6 : 1}
      elevation={item.checked ? 0 : 2}
      width="100%"
      // Glassmorphism
      style={
        {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        } as any
      }
    >
      <XStack alignItems="flex-start">
        {/* Checkbox */}
        <Pressable
          onPress={onToggle}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: item.checked ? colors.tint : colors.border,
            backgroundColor: item.checked ? colors.tint : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            marginTop: 2, // Align with text top
          }}
        >
          {item.checked && (
            <FontAwesome5 name="check" size={12} color="white" />
          )}
        </Pressable>

        {/* Content */}
        <YStack flex={1} marginRight="$2">
          <Paragraph
            size="$4"
            fontWeight="600"
            color="$color"
            textDecorationLine={item.checked ? 'line-through' : 'none'}
            opacity={item.checked ? 0.6 : 1}
            marginBottom="$1"
            lineHeight={24} // Ensure good line height for alignment
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
              <XStack alignItems="center">
                <Paragraph
                  size="$3"
                  color="$color"
                  opacity={0.4}
                  marginRight="$2"
                >
                  •
                </Paragraph>
                <Pressable onPress={onNavigateToRecipe}>
                  <Paragraph
                    size="$3"
                    color={colors.tint}
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
        <XStack alignItems="center" space="$1">
          <Pressable
            onPress={onMoveToPantry}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5
              name="box"
              size={14}
              color={colors.text}
              style={{ opacity: 0.4 }}
            />
          </Pressable>

          <Pressable
            onPress={onDelete}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5
              name="trash-alt"
              size={14}
              color={colors.error}
              style={{ opacity: 0.6 }}
            />
          </Pressable>
        </XStack>
      </XStack>
    </AnimatedCard>
  );
};
