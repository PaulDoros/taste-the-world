import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { GlassButton } from '@/components/ui/GlassButton';
import { IS_ANDROID } from '@/constants/platform';

interface OAuthButtonProps {
  provider: 'google';
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  delay?: number;
}

const PROVIDER_CONFIG = {
  name: 'Google',
  bgColor: '#FFFFFF',
  textColor: '#3C4043',
  borderColor: '#DADCE0',
};

const PROVIDER_ICON_ASSET = {
  google: require('../../assets/icons/google.png'),
};

const styles = StyleSheet.create({
  androidButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DADCE0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  androidText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C4043',
  },
  androidContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 18,
  },
  androidIcon: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
});

/**
 * OAuth Provider Button Component
 * Modern, app-store quality OAuth button with proper styling
 */
export const OAuthButton = React.memo<OAuthButtonProps>(
  ({ provider, onPress, loading = false, disabled = false, delay = 0 }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const isAndroid = IS_ANDROID;
    const config = PROVIDER_CONFIG;
    const { t } = useLanguage();

    const androidBaseColor = isDark ? 'rgba(255,255,255,0.96)' : '#FFFFFF';
    const androidBorderColor = isDark
      ? 'rgba(15,23,42,0.14)'
      : 'rgba(15,23,42,0.08)';

    const buttonBackgroundColor = isAndroid
      ? androidBaseColor
      : isDark
        ? config.bgColor + '15'
        : config.bgColor;

    const buttonTextColor = isAndroid
      ? '#1F2937'
      : isDark
        ? colors.text
        : config.textColor;

    const label = loading
      ? t('oauth_connecting')
      : t('oauth_continue_with', { provider: config.name });

    const handlePress = () => {
      if (disabled || loading) return;
      onPress();
    };

    if (isAndroid) {
      return (
        <View>
          <Pressable
            onPress={handlePress}
            disabled={loading || disabled}
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
            style={[
              styles.androidButton,
              {
                opacity: loading ? 0.6 : 1,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Sign in with ${config.name}`}
          >
            <View style={styles.androidContent}>
              <Image
                source={PROVIDER_ICON_ASSET[provider]}
                style={styles.androidIcon}
                resizeMode="contain"
              />
              <Text style={styles.androidText}>{label}</Text>
            </View>
          </Pressable>
        </View>
      );
    }

    return (
      <Animated.View entering={FadeInDown.delay(delay)}>
        <GlassButton
          onPress={handlePress}
          disabled={loading || disabled}
          shadowRadius={3}
          size="medium"
          label={label}
          iconComponent={
            <Image
              source={PROVIDER_ICON_ASSET[provider]}
              style={styles.icon}
              resizeMode="contain"
            />
          }
          backgroundColor={buttonBackgroundColor}
          backgroundOpacity={1}
          textColor={buttonTextColor}
          androidFallbackBase={androidBaseColor}
          androidBorderColor={androidBorderColor}
          androidOverlayOpacity={1}
          androidShadowDistance={2}
          androidShadowOffsetY={2}
          androidShadowOpacity={isDark ? 0.16 : 0.12}
          style={{
            minHeight: 52,
            width: '100%',
            padding: isAndroid ? 2 : 4,
            opacity: loading ? 0.6 : 1,
          }}
        />
      </Animated.View>
    );
  }
);

OAuthButton.displayName = 'OAuthButton';
