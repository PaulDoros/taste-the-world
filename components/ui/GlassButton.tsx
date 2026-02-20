import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
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
import { Shadow } from 'react-native-shadow-2';

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

  androidFallbackBase,
  androidBorderColor,
  androidOverlayOpacity,
  androidElevation,

  androidShadowDistance,
  androidShadowOffsetY,
  androidShadowOpacity: androidShadowOpacityProp,
}: GlassButtonProps) => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const glass = glassTokens[isDark ? 'dark' : 'light'];
  const isAndroid = Platform.OS === 'android';

  // ✅ Press state just for Android shadow collapse (no "jump up")
  const [pressed, setPressed] = React.useState(false);

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

  // iOS shadows (kept)
  const shadowHeight = useSharedValue(4);
  const shadowOpacityVal = useSharedValue(shadowOpacity ?? glass.shadowOpacity);
  const shadowRadiusVal = useSharedValue(shadowRadius ?? 12);

  // Android elevation (native) (kept)
  const baseAndroidElevation = androidElevation ?? 8;
  const elevationVal = useSharedValue(baseAndroidElevation);

  // Inset press opacity
  const innerPressedOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,

    shadowOffset: { width: 0, height: shadowHeight.value },
    shadowOpacity: shadowOpacityVal.value,
    shadowRadius: shadowRadiusVal.value,

    elevation: isAndroid ? elevationVal.value : 0,
  }));

  const innerPressedStyle = useAnimatedStyle(() => ({
    opacity: innerPressedOpacity.value,
  }));

  // ✅ measure size so absolutely-positioned Shadow has real width/height
  const [measured, setMeasured] = React.useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== measured.w || height !== measured.h) {
      setMeasured({ w: width, h: height });
    }
  };

  const handlePressIn = () => {
    if (disabled) return;

    scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });

    // ✅ press feel (button goes DOWN a bit)
    translateY.value = withTiming(2, { duration: 150 });

    // iOS shadow collapse (kept)
    shadowHeight.value = withTiming(0, { duration: 150 });
    shadowRadiusVal.value = withTiming(0, { duration: 150 });
    shadowOpacityVal.value = withTiming(0, { duration: 150 });

    // Android native elevation collapse (kept)
    elevationVal.value = withTiming(0, { duration: 150 });

    innerPressedOpacity.value = withTiming(1, { duration: 150 });

    // ✅ Android shadow-2: collapse via `pressed` state (NO translation)
    if (isAndroid) setPressed(true);
  };

  const handlePressOut = () => {
    if (disabled) return;

    scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    translateY.value = withTiming(0, { duration: 450 });

    // iOS shadow restore (kept)
    shadowHeight.value = withTiming(4, { duration: 450 });
    shadowRadiusVal.value = withTiming(shadowRadius ?? 12, { duration: 450 });
    shadowOpacityVal.value = withTiming(shadowOpacity ?? glass.shadowOpacity, {
      duration: 450,
    });

    // Android native elevation restore (kept)
    elevationVal.value = withTiming(baseAndroidElevation, { duration: 300 });

    innerPressedOpacity.value = withTiming(0, { duration: 200 });

    // ✅ Android shadow-2 restore
    if (isAndroid) setPressed(false);
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

  const fallbackBase =
    androidFallbackBase ||
    (isDark ? 'rgba(30,41,59,0.92)' : 'rgba(255,255,255,0.92)');

  const borderColorAndroid =
    androidBorderColor ||
    (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)');

  const effectiveBorderColor = isAndroid ? borderColorAndroid : borderColorIOS;

  const effectiveOverlayOpacity = isAndroid
    ? (androidOverlayOpacity ?? overlayOpacity ?? 0.72)
    : overlayOpacity;

  const insetDark = isDark
    ? isAndroid
      ? 'rgba(0,0,0,0.24)'
      : 'rgba(0,0,0,0.50)'
    : isAndroid
      ? 'rgba(0,0,0,0.14)'
      : 'rgba(0,0,0,0.35)';

  const insetLight = isDark
    ? 'rgba(255,255,255,0.08)'
    : 'rgba(255,255,255,0.20)';

  // Android Shadow-2 params
  const shadowDistance =
    androidShadowDistance ??
    (size === 'large' ? 14 : size === 'medium' ? 12 : 10);

  const shadowOffsetY = androidShadowOffsetY ?? 2;

  const shadowAlpha = androidShadowOpacityProp ?? (isDark ? 0.55 : 0.25);
  const startColor = `rgba(0,0,0,${shadowAlpha})`;

  const shadow2Offset: [number, number] = pressed ? [0, 0] : [0, shadowOffsetY];
  const shadow2StartColor = pressed ? 'rgba(0,0,0,0)' : startColor;

  return (
    <Animated.View
      onLayout={onLayout}
      style={[
        animatedStyle,
        {
          borderRadius: r,
          backgroundColor: isAndroid ? 'rgba(0,0,0,0.01)' : 'transparent',
        },
        style,
      ]}
    >
      {/* ✅ Android shadow as absolute background (no layout impact, no translate) */}
      {isAndroid && measured.w > 0 && measured.h > 0 && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
        >
          <Shadow
            distance={1}
            startColor={shadow2StartColor}
            endColor="rgba(0,0,0,0)"
            offset={shadow2Offset}
            style={{
              width: measured.w,
              height: measured.h,
              borderRadius: r,
            }}
          >
            <View
              style={{ width: measured.w, height: measured.h, borderRadius: r }}
            />
          </Shadow>
        </View>
      )}

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
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={intensity ?? glass.blurIntensity}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: fallbackBase },
              ]}
            />
          )}

          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: glassOverlayColor,
                opacity: effectiveOverlayOpacity,
                borderWidth: 1,
                borderColor: effectiveBorderColor,
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
                borderTopWidth: isAndroid ? 2 : 4,
                borderLeftWidth: isAndroid ? 2 : 3,
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
                borderRightWidth: isAndroid ? 2 : 3,
                borderBottomWidth: isAndroid ? 2 : 3,
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
