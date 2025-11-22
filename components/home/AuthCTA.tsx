import React, { useCallback } from 'react';
import { View, Text, Pressable } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

interface AuthCTAProps {
  delay?: number;
}

/**
 * Authentication Call-to-Action Component
 * Prompts guests to sign in for enhanced features
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
    <Animated.View entering={FadeIn.delay(delay)} className="mt-12 mx-6 mb-6">
      <LinearGradient
        colors={[colors.tint, colors.tint + 'E6', colors.tint + 'CC']}
        style={{
          borderRadius: 24,
          padding: 28,
          marginHorizontal: 24,
          shadowColor: colors.tint,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 12,
        }}
        accessibilityRole="banner"
      >
        <View className="flex-row items-start gap-5 mb-5">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
            accessibilityHidden
          >
            <FontAwesome5 name="user-plus" size={26} color="#FFFFFF" />
          </View>
          <View className="flex-1 pt-1">
            <Text
              className="text-2xl font-extrabold mb-2"
              style={{ color: '#FFFFFF' }}
              accessibilityRole="header"
            >
              Join the Journey
            </Text>
            <Text
              className="text-sm leading-5"
              style={{ color: '#FFFFFF', opacity: 0.95 }}
            >
              Sign in to save favorites, sync across devices, and unlock premium
              features
            </Text>
          </View>
        </View>
        <Pressable
          onPress={handleSignIn}
          className="bg-white rounded-2xl py-4 px-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign in to continue"
          accessibilityHint="Opens the sign in screen"
        >
          <Text
            className="text-center font-extrabold text-base"
            style={{ color: colors.tint }}
          >
            Sign In to Continue
          </Text>
        </Pressable>
      </LinearGradient>
    </Animated.View>
  );
});

AuthCTA.displayName = 'AuthCTA';

