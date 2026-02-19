import React from 'react';
import {
  Pressable,
  Platform,
  StyleSheet,
  ViewStyle,
  StyleProp,
  ActivityIndicator,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Text, XStack } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';
import { glassTokens } from '@/theme/colors';

interface GlassButtonProps {
  onPress: () => void;
  label?: string;
  icon?: React.ComponentProps<typeof FontAwesome5>['name'];
  size?: 'large' | 'medium' | 'small';
  backgroundColor?: string;
  textColor?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  backgroundOpacity?: number;
  blurIntensity?: number;
  shadowRadius?: number;
  shadowOpacity?: number; // Added
  iconComponent?: React.ReactNode; // Added for custom icons

  // Android specific (safe to ignore on iOS)
  blurTarget?: any; // Avoiding strict type for now
  androidFallbackBase?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  onPress,
  label,
  icon,
  iconComponent,
  size = 'medium',
  backgroundColor,
  textColor,
  disabled = false,
  loading = false,
  style,
  backgroundOpacity,
  blurIntensity = 20,
  shadowRadius = 8,
  shadowOpacity,
  blurTarget,
  androidFallbackBase,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Animation state
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Dimensions based on size
  const getDimensions = () => {
    switch (size) {
      case 'large':
        return {
          height: 56,
          paddingHorizontal: 24,
          fontSize: 18,
          iconSize: 20,
        };
      case 'small':
        return {
          height: 36,
          paddingHorizontal: 12,
          fontSize: 13,
          iconSize: 14,
        };
      case 'medium':
      default:
        return {
          height: 48,
          paddingHorizontal: 20,
          fontSize: 16,
          iconSize: 18,
        };
    }
  };

  const dims = getDimensions();

  // Styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96);
    opacity.value = withTiming(0.8);
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1);
    opacity.value = withTiming(1);
  };

  // Resolve colors
  const activeBackgroundColor =
    backgroundColor ||
    (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)');
  const activeTextColor = textColor || (isDark ? '#FFF' : '#000');
  const activeBorderColor = isDark
    ? 'rgba(255,255,255,0.1)'
    : 'rgba(0,0,0,0.05)';

  // Fallback base for Android
  const fallbackBase =
    androidFallbackBase ||
    (isDark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)');

  return (
    <Animated.View style={[animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.container,
          {
            height: dims.height,
            borderRadius: dims.height / 2, // Pill shape
            shadowOpacity: shadowOpacity ?? (disabled ? 0 : 0.1),
            shadowRadius: shadowRadius,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            elevation: Platform.OS === 'android' ? 4 : 0,
          },
        ]}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: dims.height / 2, overflow: 'hidden' },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={blurIntensity}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            // Android Fallback - No experimental blur for performance
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: fallbackBase },
              ]}
            />
          )}

          {/* Color Overlay */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: activeBackgroundColor,
                opacity: backgroundOpacity ?? 0.8,
              },
            ]}
          />

          {/* Border */}
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                borderWidth: 1,
                borderColor: activeBorderColor,
                borderRadius: dims.height / 2,
              },
            ]}
          />
        </View>

        {/* Content */}
        <XStack
          paddingHorizontal={dims.paddingHorizontal}
          alignItems="center"
          justifyContent="center"
          height="100%"
          space="$2"
        >
          {loading ? (
            <ActivityIndicator color={activeTextColor} size="small" />
          ) : (
            <>
              {iconComponent
                ? iconComponent
                : icon && (
                    <FontAwesome5
                      name={icon}
                      size={dims.iconSize}
                      color={activeTextColor}
                      style={{ opacity: disabled ? 0.6 : 1 }}
                    />
                  )}
              {label && (
                <Text
                  color={activeTextColor}
                  fontSize={dims.fontSize}
                  fontWeight="600"
                  opacity={disabled ? 0.6 : 1}
                >
                  {label}
                </Text>
              )}
            </>
          )}
        </XStack>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'visible', // Allow shadows
  },
});
