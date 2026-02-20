import React, { useState } from 'react';
import { TextInputProps, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  YStack,
  XStack,
  Input as TamaguiInput,
  Text,
  GetProps,
  useTheme,
} from 'tamagui';
import { useColorScheme } from '@/components/useColorScheme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'inset';
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
      variant = 'default',
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
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isFocused, setIsFocused] = useState(false);
    const isInset = variant === 'inset';

    // Determine border color based on state
    const getBorderColor = () => {
      if (error) return theme.red10.val;
      if (isFocused) return theme.tint.val;
      return theme.borderColor.val;
    };

    const insetBaseBackground = isDark
      ? 'rgba(15, 23, 42, 0.28)'
      : 'rgba(148, 163, 184, 0.12)';
    const insetTopEdge = isDark
      ? 'rgba(2, 6, 23, 0.75)'
      : 'rgba(15, 23, 42, 0.12)';
    const insetBottomEdge = isDark
      ? 'rgba(148, 163, 184, 0.24)'
      : 'rgba(255, 255, 255, 0.92)';

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
          borderWidth={isFocused && !isInset ? 2 : 1}
          borderColor={getBorderColor()}
          backgroundColor={isInset ? insetBaseBackground : '$background'}
          paddingHorizontal="$3"
          minHeight={52}
          style={
            isInset
              ? {
                  borderTopColor: error ? theme.red10.val : insetTopEdge,
                  borderLeftColor: error ? theme.red10.val : insetTopEdge,
                  borderBottomColor: error ? theme.red10.val : insetBottomEdge,
                  borderRightColor: error ? theme.red10.val : insetBottomEdge,
                  shadowColor: isDark ? '#000000' : '#0f172a',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: isDark ? 0.22 : 0.08,
                  shadowRadius: 2,
                  elevation: 1,
                }
              : undefined
          }
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
