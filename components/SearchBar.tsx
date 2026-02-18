import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { YStack, XStack, Input, useTheme, View } from 'tamagui';

/**
 * SearchBar Component
 * Modern search input with animated focus states
 * Follows iOS & Material Design patterns
 */

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Search...',
}: SearchBarProps) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const clearSearch = () => {
    onChangeText('');
  };

  return (
    <YStack
      marginHorizontal="$4"
      marginBottom="$4"
      animation="quick"
      scale={isFocused ? 1.01 : 1}
    >
      <XStack
        alignItems="center"
        backgroundColor="$surface" // was colors.card
        borderRadius="$6"
        paddingHorizontal="$4"
        paddingVertical="$2.5"
        borderWidth={2}
        borderColor={isFocused ? '$tint' : 'transparent'}
        shadowColor="$shadow"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={isFocused ? 0.08 : 0.03}
        shadowRadius={isFocused ? 12 : 4}
        elevation={isFocused ? 4 : 2} // Android elevation
      >
        {/* Search Icon */}
        <FontAwesome5
          name="search"
          size={16}
          color={isFocused ? theme.tint.val : theme.color.val}
          style={{ opacity: isFocused ? 1 : 0.4, marginRight: 12 }}
        />

        {/* Text Input */}
        <Input
          flex={1}
          unstyled
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="$color11"
          backgroundColor="transparent"
          fontSize="$4"
          color="$color"
          fontWeight="500"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="words"
        />

        {/* Clear Button */}
        {value.length > 0 && (
          <Pressable onPress={clearSearch} hitSlop={8}>
            <View
              backgroundColor="$tint"
              opacity={0.15}
              borderRadius="$4"
              padding="$1.5"
            >
              <FontAwesome5 name="times" size={12} color={theme.tint.val} />
            </View>
          </Pressable>
        )}
      </XStack>
    </YStack>
  );
};
