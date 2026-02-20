import React from 'react';
import { Image } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { GlassButton } from '@/components/ui/GlassButton';

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

/**
 * OAuth Provider Button Component
 * Modern, app-store quality OAuth button with proper styling
 */
export const OAuthButton = React.memo<OAuthButtonProps>(
  ({ provider, onPress, loading = false, disabled = false, delay = 0 }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const config = PROVIDER_CONFIG;
    const { t } = useLanguage();

    const handlePress = () => {
      if (disabled || loading) return;
      onPress();
    };

    return (
      <Animated.View entering={FadeInDown.delay(delay)}>
        <GlassButton
          onPress={handlePress}
          disabled={loading || disabled}
          shadowRadius={3}
          size="medium"
          label={
            loading
              ? t('oauth_connecting')
              : t('oauth_continue_with', { provider: config.name })
          }
          iconComponent={
            <Image
              source={PROVIDER_ICON_ASSET[provider]}
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
          }
          backgroundColor={
            colorScheme === 'dark' ? config.bgColor + '15' : config.bgColor
          }
          backgroundOpacity={1}
          textColor={colorScheme === 'dark' ? colors.text : config.textColor}
          style={{
            minHeight: 52,
            padding: 4,
            opacity: loading ? 0.6 : 1,
          }}
        />
      </Animated.View>
    );
  }
);

OAuthButton.displayName = 'OAuthButton';
