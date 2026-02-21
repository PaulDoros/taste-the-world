import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useColorScheme } from '@/components/useColorScheme';
import { Colors } from '@/constants/Colors';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  borderRadius?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  variant?: 'default' | 'thin';
  shadowOpacity?: number;
  shadowColor?: string;
  shadowRadius?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderRadiusInside?: number;

  androidFallbackBase?: string;
  androidShadowDistance?: number;
  androidShadowOffsetY?: number;
  androidShadowOpacity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  contentContainerStyle,
  borderRadius = 16,
  variant = 'default',
  backgroundColor,
  borderRadiusInside = 15,
  androidFallbackBase,
  androidShadowDistance,
  shadowRadius, // Received from props
  ...props
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Apply explicit overrides
  const isTransparentSurface = backgroundColor === 'transparent';
  const hasTranslucency =
    isTransparentSurface ||
    (backgroundColor &&
      (backgroundColor.includes('rgba') ||
        backgroundColor.includes('0.') ||
        (backgroundColor.startsWith('#') && backgroundColor.length === 9)));

  const finalBackgroundColor = backgroundColor || colors.card;
  const finalElevation =
    androidShadowDistance !== undefined
      ? androidShadowDistance
      : shadowRadius === 0
        ? 0
        : variant === 'thin' || hasTranslucency
          ? 0
          : 2;

  return (
    <View
      style={[
        {
          borderRadius,
          backgroundColor: finalBackgroundColor,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: finalElevation,
        },
        style,
      ]}
      {...props}
    >
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
