import React from 'react';
import { YStack, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassButton } from '@/components/ui/GlassButton';

interface RecipeBookEmptyStateProps {
  hasRecipes: boolean; // true if total recipes > 0 but filtered == 0
  loading: boolean;
  onCreate: () => void;
  colors: any;
  message?: string;
}

export const RecipeBookEmptyState = ({
  hasRecipes,
  loading,
  onCreate,
  colors,
  message,
}: RecipeBookEmptyStateProps) => {
  if (loading) return null; // Defer to parent spinner

  return (
    <YStack
      flex={1}
      justifyContent="center"
      alignItems="center"
      gap="$3"
      marginTop="$10"
    >
      <FontAwesome5
        name="book-open"
        size={48}
        color={colors.text}
        opacity={0.2}
      />
      <Text fontSize="$4" color={colors.text} textAlign="center" opacity={0.6}>
        {message ||
          (hasRecipes
            ? 'No matching recipes found.'
            : 'Your recipe book is empty.')}
      </Text>
      {!hasRecipes && (
        <GlassButton
          size="medium"
          label="Create Your First Recipe"
          onPress={onCreate}
          backgroundColor={colors.tint}
          textColor="white"
        />
      )}
    </YStack>
  );
};
