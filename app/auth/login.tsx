import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { YStack, XStack, Text, Paragraph, Button, Card, Separator } from 'tamagui';
import * as Google from 'expo-auth-session/providers/google';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Input } from '@/components/forms/Input';

import { OAuthButton } from '@/components/auth/OAuthButton';
import { useAuth } from '@/hooks/useAuth';
import { haptics } from '@/utils/haptics';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn, signInWithOAuth, isLoading, error, clearError } = useAuth();

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    haptics.medium();
    clearError();

    if (!validateForm()) {
      haptics.error();
      return;
    }

    try {
      await signIn(email.trim().toLowerCase(), password);
      haptics.success();
      router.replace('/(tabs)');
    } catch {
      haptics.error();
      // Error handled by useAuth
    }
  };

  const handleGoBack = () => {
    haptics.light();
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  // Handle Google OAuth response
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.idToken) {
        fetch(
          `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${authentication.accessToken}`
        )
          .then((res) => res.json())
          .then(async (data) => {
            try {
              await signInWithOAuth(
                'google',
                data.id,
                data.email,
                data.name,
                data.picture
              );
              haptics.success();
              router.replace('/(tabs)');
            } catch {
              haptics.error();
            }
          })
          .catch((err) => {
            console.error('Error fetching Google user info:', err);
            haptics.error();
          });
      }
    }
  }, [response]);

  const handleGoogleSignIn = async () => {
    try {
      if (!request) return;
      await promptAsync();
    } catch (err) {
      console.error('Google sign in error:', err);
      haptics.error();
    }
  };

  const handleAppleSignIn = async () => {
    haptics.light();
    alert('Apple Sign In coming soon!');
  };

  const handleFacebookSignIn = async () => {
    haptics.light();
    alert('Facebook Sign In coming soon!');
  };


  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top']}
    >
      {/* iOS-style background */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* iOS-style Back Button */}
          <Animated.View
            entering={FadeInLeft.delay(50)}
            style={{ paddingTop: insets.top + 8, paddingHorizontal: 20 }}
          >
            <Button
              onPress={handleGoBack}
              size="$3"
              circular
              chromeless
              pressStyle={{ scale: 0.95, opacity: 0.7 }}
              backgroundColor="transparent"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <FontAwesome5
                name="angle-left"
                size={22}
                color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                solid
              />
            </Button>
          </Animated.View>

          {/* Header + Card */}
          <YStack flex={1} px="$5" mt="$2">
            {/* iOS-style Header */}
            <Animated.View entering={FadeInUp.delay(90)} style={{ marginBottom: 32 }}>
              <YStack ai="center" mb="$4">
                {/* App Icon */}
                <Animated.View
                  entering={FadeInDown.delay(120)}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.tint,
                    shadowColor: colors.tint,
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.3,
                    shadowRadius: 16,
                    elevation: 8,
                    marginBottom: 24,
                  }}
                >
                  <FontAwesome5 name="utensils" size={36} color="#FFFFFF" />
                </Animated.View>
              </YStack>
              <Text
                fontSize="$10"
                fontWeight="700"
                mb="$2"
                color="$color"
                textAlign="center"
              >
                Welcome Back
              </Text>
              <Paragraph
                size="$4"
                lineHeight="$2"
                color="$color11"
                textAlign="center"
                maxWidth={280}
              >
                Sign in to continue exploring
              </Paragraph>
            </Animated.View>

            {/* iOS-style login card */}
            <Card
              elevate
              bordered
              entering={FadeInDown.delay(140)}
              borderRadius="$5"
              padding="$5"
              backgroundColor={
                colorScheme === 'dark'
                  ? 'rgba(28,28,30,0.95)'
                  : 'rgba(255,255,255,1)'
              }
              borderColor={
                colorScheme === 'dark'
                  ? 'rgba(255,255,255,0.1)'
                  : 'rgba(0,0,0,0.06)'
              }
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.08}
              shadowRadius={20}
              elevation={6}
            >

              {/* Form fields */}
              <YStack space="$4" mb="$4">
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="envelope"
                  error={errors.email}
                />

                <Input
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }
                  }}
                  secureTextEntry={!showPassword}
                  leftIcon="lock"
                  rightIcon={showPassword ? 'eye-slash' : 'eye'}
                  onRightIconPress={() => {
                    setShowPassword((prev) => !prev);
                    haptics.selection();
                  }}
                  error={errors.password}
                />
              </YStack>

              {/* Error Message */}
              {error && (
                <Animated.View
                  entering={FadeIn}
                  className="p-3 rounded-2xl mb-4 flex-row items-center"
                  style={{
                    backgroundColor: colors.error + '10',
                    borderWidth: 1,
                    borderColor: colors.error + '40',
                  }}
                >
                  <FontAwesome5
                    name="exclamation-circle"
                    size={18}
                    color={colors.error}
                    style={{ marginRight: 10 }}
                  />
                  <Text
                    flex={1}
                    fontSize="$3"
                    color={colors.error}
                  >
                    {error}
                  </Text>
                </Animated.View>
              )}

              {/* Forgot Password - iOS style */}
              <Button
                onPress={() => {
                  haptics.light();
                  // TODO: Implement forgot password flow
                }}
                size="$3"
                alignSelf="flex-end"
                mb="$4"
                chromeless
                pressStyle={{ opacity: 0.6 }}
              >
                <Text
                  fontSize="$3"
                  fontWeight="600"
                  color={colors.tint}
                >
                  Forgot Password?
                </Text>
              </Button>

              {/* Primary button - iOS style */}
              <Button
                onPress={handleLogin}
                disabled={isLoading}
                size="$4"
                backgroundColor={colors.tint}
                color="white"
                fontWeight="700"
                width="100%"
                mb="$3"
                borderRadius="$4"
                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                opacity={isLoading ? 0.6 : 1}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Divider - iOS style */}
              <XStack ai="center" my="$4" space="$2">
                <Separator flex={1} borderColor="$color5" />
                <Text
                  fontSize="$2"
                  px="$3"
                  color="$color10"
                  fontWeight="500"
                >
                  or
                </Text>
                <Separator flex={1} borderColor="$color5" />
              </XStack>

              {/* OAuth buttons */}
              <YStack space="$3">
                <OAuthButton
                  provider="google"
                  onPress={handleGoogleSignIn}
                  loading={!!isLoading}
                  disabled={!request}
                  delay={220}
                />
                {Platform.OS === 'ios' && (
                  <OAuthButton
                    provider="apple"
                    onPress={handleAppleSignIn}
                    loading={!!isLoading}
                    delay={260}
                  />
                )}
                <OAuthButton
                  provider="facebook"
                  onPress={handleFacebookSignIn}
                  loading={!!isLoading}
                  delay={Platform.OS === 'ios' ? 300 : 260}
                />
              </YStack>
            </Card>

            {/* Sign up footer - iOS style */}
            <Animated.View
              entering={FadeInUp.delay(260)}
              style={{ alignItems: 'center', marginTop: 32 }}
            >
              <XStack ai="center" space="$2">
                <Text
                  fontSize="$3"
                  color="$color11"
                >
                  Don&apos;t have an account?
                </Text>
                <Button
                  onPress={() => {
                    haptics.light();
                    router.push('/auth/signup');
                  }}
                  size="$3"
                  chromeless
                  pressStyle={{ opacity: 0.6 }}
                >
                  <Text
                    fontSize="$3"
                    fontWeight="600"
                    color={colors.tint}
                  >
                    Sign Up
                  </Text>
                </Button>
              </XStack>
            </Animated.View>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
