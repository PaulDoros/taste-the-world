import React, { useCallback } from 'react';
import { YStack, XStack, Heading, Paragraph, Button } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

interface AuthCTAProps {
  delay?: number;
}

/**
 * Authentication Call-to-Action Component
 * Modern Tamagui-powered authentication prompt
 */
export const AuthCTA = React.memo<AuthCTAProps>(({ delay = 800 }) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSignIn = useCallback(() => {
    haptics.medium();
    router.push('/auth/login');
  }, [router]);

  return (
    <AnimatedYStack entering={FadeIn.delay(delay)} marginTop="$12" marginHorizontal="$6" marginBottom="$6">
      <LinearGradient
        colors={[colors.tint, colors.tint + 'E6', colors.tint + 'CC']}
        style={{
          borderRadius: 24,
          padding: 28,
          shadowColor: colors.tint,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 12,
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
              Join the Journey
            </Heading>
            <Paragraph size="$3" lineHeight="$2" color="white" opacity={0.95}>
              Sign in to save favorites, sync across devices, and unlock premium
              features
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
          Sign In to Continue
        </Button>
      </LinearGradient>
    </AnimatedYStack>
  );
});

AuthCTA.displayName = 'AuthCTA';

