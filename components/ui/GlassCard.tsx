import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';
import { shouldUseGlassBlur } from '@/constants/Performance';
import { IS_ANDROID, IS_IOS } from '@/constants/platform';

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
  shadowRadius = 2,
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
  const isAndroid = IS_ANDROID;
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

  const allowIOSBlur = IS_IOS && shouldUseGlassBlur;

  const resolvedAndroidShadowDistance =
    androidShadowDistance ?? (isThin ? 2 : 3);

  const containerBgColorAndroid = !isTransparentSurface
    ? fallbackBase
    : 'transparent';

  return (
    <View
      style={[
        {
          borderRadius,
          backgroundColor: isAndroid ? containerBgColorAndroid : 'transparent',
          ...(IS_IOS
            ? {
                shadowColor: shadowColor ?? (isDark ? '#000' : '#0f172a'),
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: shadowOpacity ?? glass.shadowOpacity,
                shadowRadius,
              }
            : !isTransparentSurface
              ? { elevation: resolvedAndroidShadowDistance }
              : null),
        },
        style,
      ]}
      {...props}
    >
      {/* Background Layer */}
      <View
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
      >
        {IS_IOS && allowIOSBlur && (
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
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
