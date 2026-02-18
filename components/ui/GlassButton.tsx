import React from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text, useTheme } from 'tamagui';
import { haptics } from '@/utils/haptics';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';

interface GlassButtonProps {
  onPress: () => void;
  icon?: string;
  iconComponent?: React.ReactNode;
  label?: string | React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'active';
  disabled?: boolean;
  backgroundColor?: string;
  backgroundOpacity?: number;
  intensity?: number;
  shadowOpacity?: number;
  shadowColor?: string;
  shadowRadius?: number;
  textColor?: string;
  style?: any;
  rightIcon?: React.ReactNode;
  solid?: boolean;
}

export const GlassButton = ({
  onPress,
  icon,
  iconComponent,
  label,
  size = 'medium',
  variant = 'default',
  disabled = false,
  backgroundColor,
  backgroundOpacity,
  intensity,
  shadowOpacity,
  shadowColor,
  shadowRadius,
  textColor: customTextColor,
  style,
  rightIcon,
  solid,
}: GlassButtonProps) => {
  const theme = useTheme();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const glass = glassTokens[isDark ? 'dark' : 'light'];

  const scale = useSharedValue(1);
  const opacity = useSharedValue(1); // Standard button opacity (disabled state)

  const isActive = variant === 'active';

  // Size configurations
  const sizes = {
    small: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 12,
      iconSize: 12,
      borderRadius: 12,
    },
    medium: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 14,
      iconSize: 14,
      borderRadius: 16,
    },
    large: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      fontSize: 16,
      iconSize: 16,
      borderRadius: 20,
    },
  };

  const currentSize = sizes[size];

  // Animation Shared Values
  const translateY = useSharedValue(0);
  const shadowHeight = useSharedValue(4);
  const shadowOpacityVal = useSharedValue(shadowOpacity ?? glass.shadowOpacity);
  const shadowRadiusVal = useSharedValue(shadowRadius ?? 3);

  // Inner Shadow Opacity Shared Value
  const innerShadowOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
    shadowOffset: { width: 0, height: shadowHeight.value },
    shadowOpacity: shadowOpacityVal.value,
    shadowRadius: shadowRadiusVal.value,
    elevation: withTiming(shadowHeight.value, { duration: 50 }),
  }));

  const innerShadowStyle = useAnimatedStyle(() => ({
    opacity: innerShadowOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });
    translateY.value = withTiming(2, { duration: 150 });

    // Outer Shadow disappears (pressed in)
    shadowHeight.value = withTiming(0, { duration: 150 });
    shadowRadiusVal.value = withTiming(0, { duration: 150 });
    shadowOpacityVal.value = withTiming(0, { duration: 150 });

    // Inner Shadow appears
    innerShadowOpacity.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    translateY.value = withTiming(0, { duration: 450 });

    // Outer Shadow returns
    shadowHeight.value = withTiming(4, { duration: 450 });
    shadowRadiusVal.value = withTiming(shadowRadius ?? 12, { duration: 450 });
    shadowOpacityVal.value = withTiming(shadowOpacity ?? glass.shadowOpacity, {
      duration: 450,
    });

    // Inner Shadow disappears
    innerShadowOpacity.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    if (disabled) return;
    haptics.selection();
    onPress();
  };

  // Determine Background Colors
  const activeBg = theme.tint?.get() || '$tint';

  // Base Color: Custom -> Active Variant -> Fallback (undefined) leads to default overlay
  const baseColor = backgroundColor || (isActive ? activeBg : undefined);

  // Overlay Color: Uses baseColor if present, else standard glass overlay
  const glassOverlayColor = baseColor || glass.overlay;

  // Opacity: Custom -> Active (0.8) -> Default (undefined, falls back to style logic)
  const overlayOpacity = backgroundOpacity ?? (baseColor ? 0.8 : undefined);

  const finalTextColor =
    customTextColor ||
    (baseColor ? '#FFFFFF' : theme.color?.get() || '#000000');
  const borderColor = baseColor ? 'transparent' : glass.border;

  return (
    <Animated.View
      style={[
        animatedStyle,
        disabled && { opacity: 0.5 },
        {
          borderRadius: currentSize.borderRadius,
          shadowColor: shadowColor ?? '#000',
          // shadowRadius, shadowOffset, shadowOpacity handled by animatedStyle
          backgroundColor: 'transparent', // Container is transparent
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: currentSize.borderRadius,
          gap: 8,
        }}
      >
        {/* Glass Background Layer (Absolute) */}
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: currentSize.borderRadius, overflow: 'hidden' },
          ]}
        >
          <BlurView
            intensity={intensity ?? glass.blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          {/* Color/Overlay Layer */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: glassOverlayColor,
                opacity: overlayOpacity,
                borderWidth: 1,
                borderColor: borderColor,
                borderRadius: currentSize.borderRadius,
              },
            ]}
          />
          {/* Simulated Inner Shadow Layer */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              innerShadowStyle,
              {
                borderRadius: currentSize.borderRadius,
                borderTopWidth: 4, // Top shadow
                borderLeftWidth: 3, // Left shadow
                borderRightWidth: 1, // Right shadow
                borderBottomWidth: 1, // Bottom shadow
                borderTopColor: 'rgba(0, 0, 0, 0.5)',
                borderLeftColor: 'rgba(0, 0, 0, 0.5)',
                borderRightColor: 'rgba(0, 0, 0, 0.5)',
                borderBottomColor: 'rgba(0, 0, 0, 0.5)', // Darker bottom shadow
                backgroundColor: 'transparent',
              },
            ]}
          />
        </View>

        {/* Content (Z-Index implicit by order) */}
        {iconComponent ? (
          iconComponent
        ) : icon ? (
          <FontAwesome5
            name={icon}
            size={currentSize.iconSize}
            color={finalTextColor}
            solid={solid}
          />
        ) : null}
        {typeof label === 'string' ? (
          label ? (
            <Text
              color={finalTextColor}
              fontSize={currentSize.fontSize}
              fontWeight="600"
            >
              {label}
            </Text>
          ) : null
        ) : (
          label
        )}
        {rightIcon}
      </Pressable>
    </Animated.View>
  );
};
