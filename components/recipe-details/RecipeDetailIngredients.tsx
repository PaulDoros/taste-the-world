import React from 'react';
import { YStack, XStack, Text, H4 } from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';

interface Ingredient {
  name: string;
  measure: string;
}

interface RecipeDetailIngredientsProps {
  ingredients: Ingredient[];
  colors: any;
  t: (key: any, params?: any) => string;
}

export const RecipeDetailIngredients = ({
  ingredients,
  colors,
  t,
}: RecipeDetailIngredientsProps) => {
  return (
    <YStack gap="$3">
      <H4 color={colors.text} fontWeight="bold">
        {t('recipe_ingredients_title')}
      </H4>
      <GlassCard
        contentContainerStyle={{ padding: 0 }}
        intensity={20}
        borderRadius={16}
      >
        <YStack padding="$3">
          {ingredients.map((ing, i) => (
            <XStack
              key={i}
              justifyContent="space-between"
              paddingVertical="$2"
              borderBottomWidth={i < ingredients.length - 1 ? 1 : 0}
              borderColor="$borderColor"
            >
              <Text
                color={colors.text}
                fontSize="$3"
                fontWeight="600"
                textTransform="capitalize"
              >
                {ing.name}
              </Text>
              <Text color={colors.text} fontSize="$3" opacity={0.7}>
                {ing.measure}
              </Text>
            </XStack>
          ))}
        </YStack>
      </GlassCard>
    </YStack>
  );
};
