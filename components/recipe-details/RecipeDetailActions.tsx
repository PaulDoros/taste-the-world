import React from 'react';
import { XStack } from 'tamagui';
import { GlassButton } from '@/components/ui/GlassButton';

interface RecipeDetailActionsProps {
  onAddToShoppingList: () => void;
  onAddToPantry: () => void;
  onCook: () => void;
  isLoading: boolean;
  colors: any;
  t: (key: any) => string;
}

export const RecipeDetailActions = ({
  onAddToShoppingList,
  onAddToPantry,
  onCook,
  isLoading,
  colors,
  t,
}: RecipeDetailActionsProps) => {
  return (
    <XStack gap="$3">
      <GlassButton
        style={{ flex: 1 }}
        icon="shopping-cart"
        label={t('recipe_detail_shopping_list_btn')}
        onPress={onAddToShoppingList}
        disabled={isLoading}
        backgroundColor={colors.tint}
        textColor="white"
      />
      <GlassButton
        style={{ flex: 1 }}
        icon="box"
        label={t('recipe_detail_pantry_btn')}
        onPress={onAddToPantry}
        disabled={isLoading}
        backgroundColor={colors.card}
        textColor={colors.text}
      />
      <GlassButton
        style={{ flex: 1 }}
        icon="fire-alt"
        label="Cooked!"
        onPress={onCook}
        disabled={isLoading}
        backgroundColor="#f97316" // Orange
        textColor="white"
      />
    </XStack>
  );
};
