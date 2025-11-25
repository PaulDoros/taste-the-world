import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

interface OAuthButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  onPress: () => void;
  loading?: boolean;
  delay?: number;
}

const PROVIDER_CONFIG = {
  google: {
    name: 'Google',
    icon: 'google' as const,
    color: '#4285F4',
    bgColor: '#4285F4',
    textColor: '#3C4043',
    borderColor: '#DADCE0',
  },
  apple: {
    name: 'Apple',
    icon: 'apple' as const,
    color: '#000000',
    bgColor: '#000000',
    textColor: '#FFFFFF',
    borderColor: '#000000',
  },
  facebook: {
    name: 'Facebook',
    icon: 'facebook' as const,
    color: '#1877F2',
    bgColor: '#1877F2',
    textColor: '#FFFFFF',
    borderColor: '#1877F2',
  },
};

/**
 * OAuth Provider Button Component
 * Modern, app-store quality OAuth button with proper styling
 */
export const OAuthButton = React.memo<OAuthButtonProps>(
  ({ provider, onPress, loading = false, delay = 0 }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const config = PROVIDER_CONFIG[provider];

    const handlePress = () => {
      haptics.medium();
      onPress();
    };

    // Hide Apple button on Android
    if (provider === 'apple' && Platform.OS === 'android') {
      return null;
    }

    return (
      <Animated.View entering={FadeInDown.delay(delay)}>
        <Pressable
          onPress={handlePress}
          disabled={loading}
          style={{
            borderRadius: 16,
            padding: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              colorScheme === 'dark' && provider !== 'google'
                ? config.bgColor + '15'
                : config.bgColor,
            borderWidth: 1,
            borderColor:
              colorScheme === 'dark' && provider !== 'google'
                ? config.borderColor + '30'
                : config.borderColor,
            minHeight: 52,
            opacity: loading ? 0.6 : 1,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Sign in with ${config.name}`}
        >
          <FontAwesome5
            name={config.icon}
            size={20}
            color={
              provider === 'google'
                ? config.color
                : provider === 'apple'
                ? config.textColor
                : '#FFFFFF'
            }
            style={{ marginRight: 12 }}
          />
          <Text
            style={{
              color:
                provider === 'google'
                  ? colorScheme === 'dark'
                    ? colors.text
                    : config.textColor
                  : config.textColor,
              fontSize: 15,
              fontWeight: '700',
            }}
          >
            {loading ? 'Connecting...' : `Continue with ${config.name}`}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }
);

OAuthButton.displayName = 'OAuthButton';

