import React from 'react';
import {
  View,
  StyleSheet,
  Platform,
  ViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';
import { isAndroidLowPerf, shouldUseGlassBlur } from '@/constants/Performance';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  borderRadius?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'thin'; // default has shadow, thin might not
  shadowOpacity?: number;
  shadowColor?: string;
  shadowRadius?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderRadiusInside?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentContainerStyle,
  borderRadius = 28,
  intensity,
  shadowOpacity,
  shadowColor,
  shadowRadius = 4,
  variant = 'default',
  backgroundColor,
  backgroundOpacity,
  borderRadiusInside = 25,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';
  const useBlur = shouldUseGlassBlur;
  const glass = glassTokens[isDark ? 'dark' : 'light'];

  // Override intensity if provided, else use token
  const blurIntensity = intensity ?? glass.blurIntensity;
  const androidSurface = isDark
    ? 'rgba(15, 23, 42, 0.78)'
    : 'rgba(255, 255, 255, 0.8)';
  const androidBorder = isDark
    ? 'rgba(148, 163, 184, 0.24)'
    : 'rgba(15, 23, 42, 0.12)';
  const isTransparentSurface = backgroundColor === 'transparent';
  const isThin = variant === 'thin';
  const overlayColor =
    backgroundColor || (isAndroidLowPerf ? androidSurface : glass.overlay);
  const overlayOpacity =
    backgroundOpacity ??
    (isTransparentSurface ? 0 : isAndroidLowPerf ? 0.82 : undefined);

  const supportsAndroidBoxShadow =
    isAndroid && typeof Platform.Version === 'number' && Platform.Version >= 28;
  const defaultAndroidShadowStrength = isThin ? 0.1 : 0.16;
  const androidShadowStrength = Math.max(
    0,
    Math.min(1, shadowOpacity ?? defaultAndroidShadowStrength)
  );
  const androidShadowColor = isDark
    ? `rgba(0, 0, 0, ${(0.48 * androidShadowStrength).toFixed(3)})`
    : `rgba(15, 23, 42, ${(0.2 * androidShadowStrength).toFixed(3)})`;
  const androidShadowRadius = isThin
    ? 4
    : isAndroidLowPerf
      ? 8
      : 9;
  const androidShadowYOffset = isThin ? 1 : 3;
  const androidElevation = isThin ? 2 : isAndroidLowPerf ? 4 : 3;
  const androidBoxShadow = `0px ${androidShadowYOffset}px ${androidShadowRadius}px 0px ${androidShadowColor}`;
  const androidDefaultBorder = isDark
    ? 'rgba(148, 163, 184, 0.22)'
    : 'rgba(15, 23, 42, 0.1)';

  return (
    <View
      style={[
        {
          borderRadius,
          boxShadow: supportsAndroidBoxShadow ? androidBoxShadow : undefined,
          shadowColor: shadowColor ?? (isDark ? '#000000' : '#0f172a'),
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isAndroid
            ? supportsAndroidBoxShadow
              ? 0
              : Math.min(0.2, androidShadowStrength * (isDark ? 0.26 : 0.18))
            : (shadowOpacity ?? glass.shadowOpacity),
          shadowRadius: isAndroid
            ? supportsAndroidBoxShadow
              ? 0
              : androidShadowRadius
            : (shadowRadius ?? 12),
          elevation: Platform.select({
            android: supportsAndroidBoxShadow ? 0 : androidElevation,
            default: 8,
          }),
          backgroundColor: 'transparent',
        },
        style,
      ]}
      {...props}
    >
      {/* Glass Background Layer (Absolute) */}
      <View
        style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}
      >
        {useBlur && (
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            experimentalBlurMethod={isAndroid ? 'dimezisBlurView' : undefined}
            style={StyleSheet.absoluteFill}
          />
        )}
        {/* Overlay & Border */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: overlayColor,
              borderWidth: 1,
              borderColor: isTransparentSurface
                ? 'transparent'
                : isAndroid
                  ? androidDefaultBorder
                  : isAndroidLowPerf
                    ? androidBorder
                    : glass.border,
              borderRadius,
              opacity: overlayOpacity,
            },
          ]}
        />
      </View>

      {/* Content (Natural Sizing) */}
      <View
        style={[
          {
            borderRadius: borderRadiusInside,
            overflow: 'hidden', // Ensure content (like Images) doesn't bleed out of rounded corners
          },
          contentContainerStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};
