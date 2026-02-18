import React, { useState } from 'react';
import { TextInputProps, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  YStack,
  XStack,
  Input as TamaguiInput,
  Text,
  styled,
  GetProps,
  useTheme,
} from 'tamagui';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof FontAwesome5.glyphMap;
  rightIcon?: keyof typeof FontAwesome5.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: GetProps<typeof YStack>; // Allow Tamagui style overrides
}

export const Input = React.forwardRef<any, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      style,
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    // Determine border color based on state
    const getBorderColor = () => {
      if (error) return '$red10'; // or '$error' if defined, defaulting to a standard red token
      if (isFocused) return '$tint';
      return '$borderColor';
    };

    return (
      <YStack space="$2" {...containerStyle}>
        {label && (
          <Text
            fontSize="$3"
            fontWeight="600"
            color={error ? '$red10' : '$color'}
            marginBottom="$1"
          >
            {label}
          </Text>
        )}

        <XStack
          alignItems="center"
          borderRadius="$4"
          borderWidth={isFocused ? 2 : 1}
          borderColor={getBorderColor()}
          backgroundColor="$background" // or '$surface' depending on design
          paddingHorizontal="$3"
          minHeight={52}
          // Animation for smooth focus transition
          animation="quick"
        >
          {leftIcon && (
            <FontAwesome5
              name={leftIcon}
              size={18}
              color={
                error
                  ? theme.red10.val
                  : isFocused
                    ? theme.tint.val
                    : theme.color11.val
              }
              style={{ marginRight: 12 }}
            />
          )}

          <TamaguiInput
            ref={ref}
            flex={1}
            unstyled // Remove default Tamagui Input styles to let XStack handle the specific "box" look
            backgroundColor="transparent"
            color="$color"
            fontSize="$4"
            paddingVertical="$3"
            placeholderTextColor="$color11"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />

          {rightIcon && (
            <Pressable
              onPress={onRightIconPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome5
                name={rightIcon}
                size={18}
                color={
                  error
                    ? theme.red10.val
                    : isFocused
                      ? theme.tint.val
                      : theme.color11.val
                }
                style={{ marginLeft: 12 }}
              />
            </Pressable>
          )}
        </XStack>

        {error && (
          <Text
            fontSize="$2"
            marginTop="$1"
            marginLeft="$1"
            color="$red10"
            fontWeight="500"
          >
            {error}
          </Text>
        )}
      </YStack>
    );
  }
);

Input.displayName = 'Input';
