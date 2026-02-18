import React from 'react';
import { Input } from 'tamagui';

interface RecipeBookSearchProps {
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
  placeholder?: string;
}

export const RecipeBookSearch = ({
  value,
  onChangeText,
  colors,
  placeholder = 'Search recipes...',
}: RecipeBookSearchProps) => {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      backgroundColor={colors.card}
      color={colors.text}
      marginBottom="$4"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      size="$4"
    />
  );
};
