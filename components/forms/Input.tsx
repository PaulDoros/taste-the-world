import React, { useState } from 'react';
import { TextInput, TextInputProps, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { YStack, XStack, Text } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof FontAwesome5.glyphMap;
  rightIcon?: keyof typeof FontAwesome5.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: object;
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

/**
 * iOS-style Input Component
 * Clean, modern design with proper focus states and icons
 */
export const Input = React.forwardRef<TextInput, InputProps>(
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
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [isFocused, setIsFocused] = useState(false);

    return (
      <AnimatedYStack
        entering={FadeInDown.delay(100)}
        space="$2"
        style={containerStyle}
      >
        {label && (
          <Text
            fontSize="$3"
            fontWeight="600"
            color={error ? colors.error : '$color'}
            mb="$1"
          >
            {label}
          </Text>
        )}
        <XStack
          ai="center"
          borderRadius="$4"
          borderWidth={isFocused ? 2 : 1.5}
          minHeight={52}
          backgroundColor={
            colorScheme === 'dark'
              ? 'rgba(44,44,46,0.6)'
              : 'rgba(242,242,247,1)'
          }
          borderColor={
            error
              ? colors.error
              : isFocused
                ? colors.tint
                : colorScheme === 'dark'
                  ? 'rgba(255,255,255,0.15)'
                  : 'rgba(0,0,0,0.12)'
          }
          px="$3.5"
        >
          {leftIcon && (
            <FontAwesome5
              name={leftIcon}
              size={18}
              color={
                error
                  ? colors.error
                  : isFocused
                    ? colors.tint
                    : colors.tabIconDefault
              }
              style={{ marginRight: 12 }}
            />
          )}
          <TextInput
            ref={ref}
            style={{
              flex: 1,
              fontSize: 17,
              color: colors.text,
              paddingVertical: 14,
              fontWeight: '400',
            }}
            placeholderTextColor={
              colorScheme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
            }
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
                    ? colors.error
                    : isFocused
                      ? colors.tint
                      : colors.tabIconDefault
                }
                style={{ marginLeft: 12 }}
              />
            </Pressable>
          )}
        </XStack>
        {error && (
          <Text
            fontSize="$2"
            mt="$1"
            ml="$1"
            color={colors.error}
            fontWeight="500"
          >
            {error}
          </Text>
        )}
      </AnimatedYStack>
    );
  }
);

Input.displayName = 'Input';
