import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
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

  androidFallbackBase?: string;
  androidBorderColor?: string;
  androidOverlayOpacity?: number;
  androidElevation?: number;

  androidShadowDistance?: number;
  androidShadowOffsetY?: number;
  androidShadowOpacity?: number;
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
  shadowRadius = 2,
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
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const isActive = variant === 'active';

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
  } as const;

  const currentSize = sizes[size];
  const r = currentSize.borderRadius;

  const shadowHeight = useSharedValue(4);
  const shadowOpacityVal = useSharedValue(shadowOpacity ?? glass.shadowOpacity);
  const shadowRadiusVal = useSharedValue(shadowRadius ?? 12);

  const innerPressedOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
    shadowOffset: { width: 0, height: shadowHeight.value },
    shadowOpacity: shadowOpacityVal.value,
    shadowRadius: shadowRadiusVal.value,
  }));

  const innerPressedStyle = useAnimatedStyle(() => ({
    opacity: innerPressedOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });
    translateY.value = withTiming(2, { duration: 150 });
    shadowHeight.value = withTiming(0, { duration: 150 });
    shadowRadiusVal.value = withTiming(0, { duration: 150 });
    shadowOpacityVal.value = withTiming(0, { duration: 150 });
    innerPressedOpacity.value = withTiming(1, { duration: 150 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    translateY.value = withTiming(0, { duration: 450 });
    shadowHeight.value = withTiming(4, { duration: 450 });
    shadowRadiusVal.value = withTiming(shadowRadius ?? 12, { duration: 450 });
    shadowOpacityVal.value = withTiming(shadowOpacity ?? glass.shadowOpacity, {
      duration: 450,
    });
    innerPressedOpacity.value = withTiming(0, { duration: 200 });
  };

  const handlePress = () => {
    if (disabled) return;
    haptics.selection();
    onPress();
  };

  const activeBg =
    theme.tint?.get() ??
    (isDark ? 'rgba(59,130,246,0.9)' : 'rgba(37,99,235,0.9)');

  const baseColor = backgroundColor || (isActive ? activeBg : undefined);

  const safeDefaultOverlay = isDark
    ? 'rgba(255,255,255,0.10)'
    : 'rgba(255,255,255,0.55)';

  const glassOverlayColor =
    baseColor ||
    (typeof glass.overlay === 'string' ? glass.overlay : safeDefaultOverlay) ||
    safeDefaultOverlay;

  const overlayOpacity = backgroundOpacity ?? (baseColor ? 0.8 : undefined);

  const finalTextColor =
    customTextColor ||
    (baseColor ? '#FFFFFF' : theme.color?.get() || '#000000');

  const borderColorIOS = baseColor ? 'transparent' : glass.border;

  const insetDark = isDark ? 'rgba(0,0,0,0.50)' : 'rgba(0,0,0,0.35)';
  const insetLight = isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(255,255,255,0.20)';

  return (
    <Animated.View
      style={[
        animatedStyle,
        {
          borderRadius: r,
          backgroundColor: 'transparent',
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
          borderRadius: r,
          gap: 8,
        }}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: r, overflow: 'hidden' },
          ]}
        >
          <BlurView
            intensity={intensity ?? glass.blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />

          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: glassOverlayColor,
                opacity: overlayOpacity,
                borderWidth: 1,
                borderColor: borderColorIOS,
                borderRadius: r,
              },
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              innerPressedStyle,
              { borderRadius: r },
            ]}
          >
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: r,
                borderTopWidth: 4,
                borderLeftWidth: 3,
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderTopColor: insetDark,
                borderLeftColor: insetDark,
                borderRightColor: insetDark,
                borderBottomColor: insetDark,
              }}
            />
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: r,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 3,
                borderBottomWidth: 3,
                borderTopColor: 'transparent',
                borderLeftColor: 'transparent',
                borderRightColor: insetLight,
                borderBottomColor: insetLight,
              }}
            />
          </Animated.View>
        </View>

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
