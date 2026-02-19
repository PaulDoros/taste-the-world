import React, { useContext } from 'react';
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
import { BlurTargetContext } from './ScreenWithBlurTarget';

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
  // New props for Android tuning
  blurTarget?: React.RefObject<View>;
  overlayColor?: string;
  borderColor?: string;
  androidFallbackBase?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentContainerStyle,
  borderRadius = 28,
  intensity,
  shadowOpacity,
  shadowColor,
  shadowRadius,
  backgroundColor,
  backgroundOpacity,
  borderRadiusInside = 25,
  blurTarget,
  overlayColor,
  borderColor: customBorderColor,
  androidFallbackBase,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const glass = glassTokens[isDark ? 'dark' : 'light'];

  // Context fallback for blurTarget
  const contextBlurTarget = useContext(BlurTargetContext);
  const effectiveBlurTarget = blurTarget || contextBlurTarget;

  // Override intensity if provided, else use token
  const blurIntensity = intensity ?? glass.blurIntensity;

  // Check for Android 12+ (API 31+)
  const canUseAndroidBlur = Platform.OS === 'android' && Platform.Version >= 31;

  // Colors
  const activeOverlayColor = overlayColor || backgroundColor || glass.overlay;
  const activeBorderColor = customBorderColor || glass.border;

  // Fallback base for Android < 31 or when no blur target is available
  // Making it slightly more opaque/colored than the glass overlay to simulate the "material"
  const fallbackBase =
    androidFallbackBase ||
    (isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)');

  return (
    <View
      style={[
        {
          borderRadius,
          shadowColor: shadowColor ?? '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: shadowOpacity ?? glass.shadowOpacity,
          shadowRadius: shadowRadius ?? 12,
          // Android Shadow: Elevation is still the best bet for shadows on Android
          elevation: Platform.select({ android: 4, default: 0 }),
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
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={blurIntensity}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : canUseAndroidBlur ? (
          // Android 12+ (SDK 54 uses experimentalBlurMethod='dimezisBlurView')
          // The 'blurTarget' prop is not available in SDK 54 types, so we don't pass it to BlurView.
          // However, 'dimezisBlurView' implementation in SDK 54 might implicitly blur what's behind it
          // or requires the view hierarchy to be structured a specific way.
          // Given the error, we revert to the supported enum value.
          <BlurView
            experimentalBlurMethod="dimezisBlurView"
            intensity={blurIntensity}
            blurReductionFactor={4}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          // Android Fallback (Old Device or No Target)
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: fallbackBase,
              },
            ]}
          />
        )}

        {/* Overlay & Border (Common for all) */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: activeOverlayColor,
              borderWidth: 1,
              borderColor: activeBorderColor,
              borderRadius,
              opacity: backgroundOpacity,
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
