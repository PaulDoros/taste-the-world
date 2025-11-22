import React from 'react';
import {
  View,
  Pressable,
  Text,
  ActivityIndicator,
  PressableProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  disabled,
  leftIcon,
  rightIcon,
  style,
  onPress,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getButtonStyle = () => {
    const baseStyle = {
      backgroundColor:
        variant === 'primary'
          ? colors.tint
          : variant === 'secondary'
            ? colors.card
            : 'transparent',
      borderWidth: variant === 'outline' ? 2 : 0,
      borderColor: variant === 'outline' ? colors.tint : 'transparent',
    };

    const sizeStyle = {
      paddingVertical: size === 'small' ? 12 : size === 'medium' ? 16 : 20,
      paddingHorizontal: size === 'small' ? 20 : size === 'medium' ? 24 : 32,
      minHeight: size === 'small' ? 44 : size === 'medium' ? 56 : 64,
    };

    return [baseStyle, sizeStyle];
  };

  const getTextStyle = () => {
    return {
      color:
        variant === 'primary'
          ? '#FFFFFF'
          : variant === 'secondary'
            ? colors.text
            : colors.tint,
      fontSize: size === 'small' ? 14 : size === 'medium' ? 16 : 18,
      fontWeight: '600' as const,
    };
  };

  const sizeClasses = {
    small: 'py-3 px-5 min-h-[44px]',
    medium: 'py-4 px-6 min-h-[56px]',
    large: 'py-5 px-8 min-h-[64px]',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(200)}
      className={`rounded-xl items-center justify-center flex-row ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''}`}
      style={[getButtonStyle(), animatedStyle, style]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : colors.tint}
          size="small"
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`text-center font-semibold ${textSizeClasses[size]}`}
            style={getTextStyle()}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </AnimatedPressable>
  );
};
