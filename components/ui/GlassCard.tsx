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
  shadowRadius,
  backgroundColor,
  backgroundOpacity,
  borderRadiusInside = 25,
  ...props
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const glass = glassTokens[isDark ? 'dark' : 'light'];

  // Override intensity if provided, else use token
  const blurIntensity = intensity ?? glass.blurIntensity;

  return (
    <View
      style={[
        {
          borderRadius,
          shadowColor: shadowColor ?? '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: shadowOpacity ?? glass.shadowOpacity,
          shadowRadius: shadowRadius ?? 12,
          elevation: Platform.select({ android: 4, default: 8 }),
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
        <BlurView
          intensity={blurIntensity}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Overlay & Border */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: backgroundColor || glass.overlay,
              borderWidth: 1,
              borderColor: glass.border,
              borderRadius,
              opacity: backgroundOpacity,
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
