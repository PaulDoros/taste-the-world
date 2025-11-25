import React from 'react';
import { Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card, XStack, YStack, Paragraph, Text } from 'tamagui';
import { Colors } from '@/constants/Colors';
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
  colors: typeof Colors.light;
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
  colors,
}: ShoppingListItemProps) => {
  return (
    <AnimatedCard
      entering={FadeInUp.delay(index * 30).springify()}
      marginBottom="$3"
      padding="$4"
      borderRadius="$5"
      bordered
      backgroundColor={
        item.checked
          ? 'rgba(200, 200, 200, 0.1)'
          : colors.card // Should be white or dark card color
      }
      borderColor={item.checked ? 'transparent' : '$borderColor'}
      opacity={item.checked ? 0.6 : 1}
      elevation={item.checked ? 0 : 2}
      // Glassmorphism
      style={
        {
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        } as any
      }
    >
      <XStack alignItems="center">
        {/* Checkbox */}
        <Pressable
          onPress={onToggle}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: item.checked ? colors.tint : colors.border,
            backgroundColor: item.checked ? colors.tint : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          {item.checked && (
            <FontAwesome5 name="check" size={14} color="white" />
          )}
        </Pressable>

        {/* Content */}
        <YStack flex={1} marginRight="$3">
          <Paragraph
            size="$4"
            fontWeight="600"
            color="$color"
            textDecorationLine={item.checked ? 'line-through' : 'none'}
            opacity={item.checked ? 0.6 : 1}
            marginBottom="$1"
          >
            {item.name}
          </Paragraph>
          
          <XStack alignItems="center" flexWrap="wrap">
            <Paragraph size="$3" color="$color" opacity={0.6}>
              {showConversion && canConvert(item.measure)
                ? getConvertedDisplay(item.measure)
                : item.measure}
            </Paragraph>
            
            {item.recipeName && item.recipeName !== 'Custom Item' && (
              <>
                <Paragraph size="$3" color="$color" opacity={0.4} marginHorizontal="$2">•</Paragraph>
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
              </>
            )}
          </XStack>
        </YStack>

        {/* Actions */}
        <XStack alignItems="center" space="$2">
          <Pressable
            onPress={onMoveToPantry}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5 name="box" size={16} color={colors.text} style={{ opacity: 0.4 }} />
          </Pressable>
          
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <FontAwesome5 name="trash-alt" size={16} color={colors.error} style={{ opacity: 0.6 }} />
          </Pressable>
        </XStack>
      </XStack>
    </AnimatedCard>
  );
};
