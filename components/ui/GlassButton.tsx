import React from 'react';
import { Pressable, StyleSheet, View, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { Text, useTheme } from 'tamagui';
import { haptics } from '@/utils/haptics';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';
import { isAndroidLowPerf, shouldUseGlassBlur } from '@/constants/Performance';

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

const isTranslucentColor = (color?: string) => {
  if (!color) return false;

  if (/^#[0-9a-fA-F]{8}$/.test(color)) {
    return color.slice(7, 9).toLowerCase() !== 'ff';
  }

  const rgbaMatch = color.match(
    /rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([0-9.]+)\s*\)/i
  );
  if (rgbaMatch) {
    const alpha = Number(rgbaMatch[1]);
    return !Number.isNaN(alpha) && alpha < 1;
  }

  return false;
};

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
  shadowOpacity = 0.8,
  shadowColor,
  shadowRadius = 2,
  textColor: customTextColor,
  style,
  rightIcon,
  solid,
}: GlassButtonProps) => {
  const theme = useTheme();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';
  const useBlur = shouldUseGlassBlur;
  const glass = glassTokens[isDark ? 'dark' : 'light'];

  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const innerShadowOpacity = useSharedValue(0);

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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  const innerShadowStyle = useAnimatedStyle(() => ({
    opacity: innerShadowOpacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    if (isAndroidLowPerf) {
      scale.value = 1;
      translateY.value = 0;
      innerShadowOpacity.value = 0;
      return;
    }

    scale.value = withTiming(0.97, {
      duration: isAndroid ? 80 : 120,
    });
    translateY.value = withTiming(isAndroid ? 1 : 2, {
      duration: isAndroid ? 80 : 120,
    });

    if (!isAndroid) {
      innerShadowOpacity.value = withTiming(1, { duration: 120 });
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    if (isAndroidLowPerf) {
      scale.value = 1;
      translateY.value = 0;
      innerShadowOpacity.value = 0;
      return;
    }

    scale.value = withTiming(1, { duration: isAndroid ? 100 : 180 });
    translateY.value = withTiming(0, { duration: isAndroid ? 100 : 200 });

    if (!isAndroid) {
      innerShadowOpacity.value = withTiming(0, { duration: 140 });
    }
  };

  const handlePress = () => {
    if (disabled) return;
    if (!isAndroidLowPerf) {
      haptics.selection();
    }
    onPress();
  };

  // Determine Background Colors
  const activeBg = theme.tint?.get() || '$tint';

  // Base Color: Custom -> Active Variant -> Fallback (undefined) leads to default overlay
  const baseColor = backgroundColor || (isActive ? activeBg : undefined);
  const isGhost = !baseColor && backgroundOpacity === 0;

  // Overlay Color: Uses baseColor if present, else standard glass overlay
  const androidSurface = isDark
    ? 'rgba(15, 23, 42, 0.78)'
    : 'rgba(255, 255, 255, 0.8)';
  const androidBorder = isDark
    ? 'rgba(148, 163, 184, 0.24)'
    : 'rgba(15, 23, 42, 0.12)';
  const glassOverlayColor =
    baseColor || (isAndroidLowPerf ? androidSurface : glass.overlay);

  const hasTranslucentBase = isTranslucentColor(baseColor);

  // Opacity: Custom -> Active (0.8) -> Default (undefined, falls back to style logic)
  const overlayOpacity =
    backgroundOpacity ??
    (isAndroidLowPerf
      ? baseColor
        ? 0.92
        : 0.82
      : baseColor
        ? 0.86
        : undefined);
  const effectiveOverlayOpacity = isGhost ? 0 : overlayOpacity;

  const supportsAndroidBoxShadow =
    isAndroid && typeof Platform.Version === 'number' && Platform.Version >= 28;
  const isChip = size === 'small';
  const isSolidSurface = !!baseColor && !hasTranslucentBase;
  const defaultAndroidShadowStrength = isChip
    ? 0.12
    : isSolidSurface
      ? 0.2
      : 0.14;
  const androidShadowStrength = Math.max(
    0,
    Math.min(1, shadowOpacity ?? defaultAndroidShadowStrength)
  );
  const androidShadowColor = isDark
    ? `rgba(0, 0, 0, ${(0.5 * androidShadowStrength).toFixed(3)})`
    : `rgba(15, 23, 42, ${(0.22 * androidShadowStrength).toFixed(3)})`;
  const androidShadowRadius = isChip
    ? 4
    : isSolidSurface
      ? isAndroidLowPerf
        ? 8
        : 10
      : isAndroidLowPerf
        ? 6
        : 7;
  const androidShadowYOffset = isChip ? 1 : 3;
  const androidElevation = isChip
    ? 2
    : isSolidSurface
      ? isAndroidLowPerf
        ? 4
        : 5
      : isAndroidLowPerf
        ? 3
        : 3;
  const androidBoxShadow = isGhost
    ? undefined
    : `0px ${androidShadowYOffset}px ${androidShadowRadius}px 0px ${androidShadowColor}`;
  const androidDefaultBorder = isDark
    ? 'rgba(148, 163, 184, 0.22)'
    : 'rgba(15, 23, 42, 0.1)';

  const finalTextColor =
    customTextColor ||
    (baseColor && !hasTranslucentBase
      ? '#FFFFFF'
      : theme.color?.get() || '#000000');
  const borderColor = isGhost
    ? 'transparent'
    : baseColor
      ? isAndroidLowPerf && hasTranslucentBase
        ? androidBorder
        : 'transparent'
      : isAndroid
        ? androidDefaultBorder
        : isAndroidLowPerf
          ? androidBorder
          : glass.border;

  return (
    <Animated.View
      style={[
        animatedStyle,
        disabled && { opacity: 0.5 },
        {
          borderRadius: currentSize.borderRadius,
          boxShadow: supportsAndroidBoxShadow ? androidBoxShadow : undefined,
          shadowColor: shadowColor ?? (isDark ? '#000000' : '#0f172a'),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isAndroid
            ? supportsAndroidBoxShadow
              ? 0
              : isGhost
                ? 0
                : Math.min(0.22, androidShadowStrength * (isDark ? 0.28 : 0.2))
            : (shadowOpacity ?? glass.shadowOpacity),
          shadowRadius: isAndroid
            ? supportsAndroidBoxShadow
              ? 0
              : isGhost
                ? 0
                : androidShadowRadius
            : (shadowRadius ?? 12),
          elevation: isAndroid
            ? supportsAndroidBoxShadow
              ? 0
              : isGhost
                ? 0
                : androidElevation
            : 6,
          backgroundColor: 'transparent', // Container is transparent
        },
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        android_ripple={
          isAndroid
            ? { color: 'rgba(255,255,255,0.08)', borderless: false }
            : undefined
        }
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: currentSize.paddingVertical,
          paddingHorizontal: currentSize.paddingHorizontal,
          borderRadius: currentSize.borderRadius,
          overflow: 'hidden',
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
          {useBlur && (
            <BlurView
              intensity={intensity ?? glass.blurIntensity}
              tint={isDark ? 'dark' : 'light'}
              experimentalBlurMethod={isAndroid ? 'dimezisBlurView' : undefined}
              style={StyleSheet.absoluteFill}
            />
          )}
          {/* Color/Overlay Layer */}
          {!isGhost && (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: glassOverlayColor,
                  opacity: effectiveOverlayOpacity,
                  borderWidth: 1,
                  borderColor: borderColor,
                  borderRadius: currentSize.borderRadius,
                },
              ]}
            />
          )}
          {!isAndroid && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                innerShadowStyle,
                {
                  borderRadius: currentSize.borderRadius,
                  borderTopWidth: 4,
                  borderLeftWidth: 3,
                  borderRightWidth: 1,
                  borderBottomWidth: 1,
                  borderTopColor: 'rgba(0, 0, 0, 0.5)',
                  borderLeftColor: 'rgba(0, 0, 0, 0.5)',
                  borderRightColor: 'rgba(0, 0, 0, 0.5)',
                  borderBottomColor: 'rgba(0, 0, 0, 0.5)',
                  backgroundColor: 'transparent',
                },
              ]}
            />
          )}
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
