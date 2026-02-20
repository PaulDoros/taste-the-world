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
import { IS_ANDROID } from '@/constants/platform';

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
    const isAndroid = IS_ANDROID;
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
    const androidInsetBackground = isDark
      ? 'rgba(15, 23, 42, 0.82)'
      : 'rgba(248, 250, 252, 1)';
    const androidInsetFocusedBackground = isDark
      ? 'rgba(15, 23, 42, 0.92)'
      : 'rgba(255, 255, 255, 1)';
    const androidInsetBorder = isDark
      ? 'rgba(148, 163, 184, 0.28)'
      : 'rgba(15, 23, 42, 0.14)';
    const defaultAndroidBackground = isDark
      ? 'rgba(30, 41, 59, 0.72)'
      : 'rgba(255, 255, 255, 1)';
    const inactiveIconColor = isAndroid
      ? isDark
        ? 'rgba(148, 163, 184, 0.95)'
        : '#64748b'
      : theme.color11.val;
    const activeIconColor = theme.tint.val;

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
          borderWidth={isFocused && !isInset && !isAndroid ? 2 : 1}
          borderColor={getBorderColor()}
          backgroundColor={
            isInset
              ? isAndroid
                ? isFocused
                  ? androidInsetFocusedBackground
                  : androidInsetBackground
                : insetBaseBackground
              : isAndroid
                ? defaultAndroidBackground
                : '$background'
          }
          paddingHorizontal="$3"
          minHeight={52}
          style={
            isInset
              ? {
                  borderTopColor: error
                    ? theme.red10.val
                    : isAndroid
                      ? isFocused
                        ? activeIconColor
                        : androidInsetBorder
                      : insetTopEdge,
                  borderLeftColor: error
                    ? theme.red10.val
                    : isAndroid
                      ? isFocused
                        ? activeIconColor
                        : androidInsetBorder
                      : insetTopEdge,
                  borderBottomColor: error
                    ? theme.red10.val
                    : isAndroid
                      ? isFocused
                        ? activeIconColor
                        : androidInsetBorder
                      : insetBottomEdge,
                  borderRightColor: error
                    ? theme.red10.val
                    : isAndroid
                      ? isFocused
                        ? activeIconColor
                        : androidInsetBorder
                      : insetBottomEdge,
                  shadowColor:
                    !isAndroid && isDark
                      ? '#000000'
                      : !isAndroid
                        ? '#0f172a'
                        : undefined,
                  shadowOffset: !isAndroid
                    ? { width: 0, height: 1 }
                    : undefined,
                  shadowOpacity: !isAndroid ? (isDark ? 0.22 : 0.08) : 0,
                  shadowRadius: !isAndroid ? 2 : 0,
                  elevation: 0,
                }
              : undefined
          }
          // Animation for smooth focus transition
          animation={isAndroid ? undefined : 'quick'}
        >
          {leftIcon && (
            <FontAwesome5
              name={leftIcon}
              size={18}
              color={
                error
                  ? theme.red10.val
                  : isFocused
                    ? activeIconColor
                    : inactiveIconColor
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
            selectionColor={activeIconColor}
            underlineColorAndroid="transparent"
            style={style}
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
                      ? activeIconColor
                      : inactiveIconColor
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
