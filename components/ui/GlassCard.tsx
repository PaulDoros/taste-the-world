import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ViewProps,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Shadow } from 'react-native-shadow-2';
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';
import { shouldUseGlassBlur } from '@/constants/Performance';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  borderRadius?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'thin';
  shadowOpacity?: number; // iOS only
  shadowColor?: string; // iOS only
  shadowRadius?: number; // iOS only
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderRadiusInside?: number;

  // Android-specific
  androidFallbackBase?: string;

  // Android Shadow-2 tuning (optional)
  androidShadowDistance?: number;
  androidShadowOffsetY?: number;
  androidShadowOpacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentContainerStyle,
  borderRadius = 28,
  intensity,
  shadowOpacity,
  shadowColor,
  shadowRadius = 12,
  variant = 'default',
  backgroundColor,
  backgroundOpacity,
  borderRadiusInside = 25,
  androidFallbackBase,
  androidShadowDistance,
  androidShadowOffsetY,
  androidShadowOpacity: androidShadowOpacityProp,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';
  const glass = glassTokens[isDark ? 'dark' : 'light'];

  const blurIntensity = intensity ?? glass.blurIntensity;
  const isThin = variant === 'thin';
  const isTransparentSurface = backgroundColor === 'transparent';

  // Background/overlay colors
  const activeBackgroundColor =
    backgroundColor ||
    (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)');

  const overlayOpacity = backgroundOpacity ?? (isTransparentSurface ? 0 : 0.8);

  const activeBorderColor = isDark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(0,0,0,0.06)';

  const fallbackBase =
    androidFallbackBase ||
    (isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)');

  const allowIOSBlur = Platform.OS === 'ios' && shouldUseGlassBlur;

  // --- Android absolute shadow sizing ---
  const [measured, setMeasured] = React.useState({ w: 0, h: 0 });
  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== measured.w || height !== measured.h)
      setMeasured({ w: width, h: height });
  };

  const shadowAlpha =
    androidShadowOpacityProp ??
    (isThin ? (isDark ? 0.35 : 0.18) : isDark ? 0.5 : 0.25);
  const startColor = `rgba(0,0,0,${shadowAlpha})`;
  const resolvedAndroidShadowDistance =
    androidShadowDistance ?? (isThin ? 3 : 3);
  const resolvedAndroidShadowOffsetY = androidShadowOffsetY ?? (isThin ? 1 : 3);

  return (
    <View
      onLayout={isAndroid ? onLayout : undefined}
      style={[
        {
          borderRadius,
          backgroundColor: 'transparent',
          ...(Platform.OS === 'ios'
            ? {
                shadowColor: shadowColor ?? (isDark ? '#000' : '#0f172a'),
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: shadowOpacity ?? glass.shadowOpacity,
                shadowRadius,
              }
            : null),
        },
        style,
      ]}
      {...props}
    >
      {/* ✅ Android: absolute Shadow-2 layer (NO layout impact) */}
      {isAndroid && measured.w > 0 && measured.h > 0 && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Shadow
            distance={resolvedAndroidShadowDistance}
            startColor={startColor}
            endColor="rgba(0,0,0,0)"
            offset={[0, resolvedAndroidShadowOffsetY]}
            style={{
              width: measured.w,
              height: measured.h,
              borderRadius,
            }}
          >
            {/* single measurable child */}
            <View
              style={{
                width: measured.w,
                height: measured.h,
                borderRadius,
                backgroundColor: 'rgba(0,0,0,0.01)',
              }}
            />
          </Shadow>
        </View>
      )}

      {/* Background Layer */}
      <View
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
      >
        {Platform.OS === 'ios' && allowIOSBlur ? (
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          // ✅ Android: no blur (performance). Solid base only.
          !isTransparentSurface && (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: fallbackBase },
              ]}
            />
          )
        )}

        {!isTransparentSurface && (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: activeBackgroundColor,
                opacity: overlayOpacity,
              },
            ]}
          />
        )}

        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderWidth: isTransparentSurface ? 0 : 1,
              borderColor: isAndroid ? activeBorderColor : glass.border,
              borderRadius,
            },
          ]}
        />
      </View>

      {/* Content */}
      <View
        style={[
          {
            borderRadius: borderRadiusInside,
            overflow: 'hidden',
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};
