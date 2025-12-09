import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { YStack, XStack, Heading, Paragraph, Button } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';

interface AuthCTAProps {
  delay?: number;
}

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

/**
 * Auth CTA Component
 * Encourages users to sign up/login
 */
export const AuthCTA = React.memo<AuthCTAProps>(({ delay = 800 }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  const handleSignIn = useCallback(() => {
    haptics.medium();
    router.push('/auth/login');
  }, [router]);

  return (
    <AnimatedYStack
      entering={FadeInUp.delay(delay).springify()}
      marginHorizontal="$4"
      marginBottom="$8"
      marginTop="$4"
    >
      <LinearGradient
        colors={[colors.tint, '#F59E0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 24,
          elevation: 8,
          shadowColor: colors.tint,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
        }}
      >
        <XStack alignItems="flex-start" space="$5" marginBottom="$5">
          {/* Icon */}
          <YStack
            width={64}
            height={64}
            borderRadius="$5"
            alignItems="center"
            justifyContent="center"
            backgroundColor="rgba(255,255,255,0.25)"
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.2}
            shadowRadius={8}
            elevation={4}
          >
            <FontAwesome5 name="user-plus" size={26} color="#FFFFFF" />
          </YStack>

          {/* Content */}
          <YStack flex={1} paddingTop="$1">
            <Heading size="$7" fontWeight="900" marginBottom="$2" color="white">
              {t('home_join_journey')}
            </Heading>
            <Paragraph size="$3" lineHeight="$2" color="white" opacity={0.95}>
              {t('home_join_subtitle')}
            </Paragraph>
          </YStack>
        </XStack>

        {/* CTA Button */}
        <Button
          onPress={handleSignIn}
          size="$4"
          backgroundColor="white"
          color={colors.tint}
          fontWeight="900"
          borderRadius="$5"
          pressStyle={{ scale: 0.97, opacity: 0.9 }}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.25}
          shadowRadius={12}
          elevation={6}
        >
          {t('home_signin_continue')}
        </Button>
      </LinearGradient>
    </AnimatedYStack>
  );
});

AuthCTA.displayName = 'AuthCTA';
