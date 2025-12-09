import React, { useState, useEffect } from 'react';
import {
  View,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
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
import {
  YStack,
  XStack,
  Text,
  Paragraph,
  Button,
  Card,
  Separator,
} from 'tamagui';
import * as Google from 'expo-auth-session/providers/google';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { Input } from '@/components/forms/Input';

import { OAuthButton } from '@/components/auth/OAuthButton';
import { useAuth } from '@/hooks/useAuth';

import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { signIn, signInWithOAuth, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
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
      newErrors.email = t('auth_email_required');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth_email_invalid');
    }

    if (!password) {
      newErrors.password = t('auth_password_required');
    } else if (password.length < 6) {
      newErrors.password = t('auth_password_short');
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
    alert(t('auth_apple_coming_soon'));
  };

  const handleFacebookSignIn = async () => {
    haptics.light();
    alert(t('auth_facebook_coming_soon'));
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
        minHeight="100%"
        backgroundColor={colors.background}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            minHeight: Dimensions.get('window').height,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Modern Back Button */}
          <Animated.View
            entering={FadeInLeft.delay(50)}
            style={{ paddingHorizontal: 16, marginBottom: 12 }}
          >
            <Pressable
              onPress={handleGoBack}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 12,
                backgroundColor: pressed
                  ? colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.15)'
                    : 'rgba(0,0,0,0.08)'
                  : colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.04)',
                borderWidth: 1,
                borderColor:
                  colorScheme === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.06)',
                alignSelf: 'flex-start',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              })}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <FontAwesome5
                name="chevron-left"
                size={16}
                color={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
                }}
              >
                {t('auth_back')}
              </Text>
            </Pressable>
          </Animated.View>

          {/* Header + Card */}
          <YStack flex={1} px="$4" mt="$1">
            {/* Header with Icon */}
            <Animated.View
              entering={FadeInUp.delay(90)}
              style={{ marginBottom: 24, alignItems: 'center' }}
            >
              <YStack ai="center" mb="$3">
                {/* App Icon */}
                <Animated.View
                  entering={FadeInDown.delay(120)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.tint,
                    shadowColor: colors.tint,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                >
                  <FontAwesome5 name="utensils" size={18} color="#FFFFFF" />
                </Animated.View>
              </YStack>
              <Text
                fontSize="$9"
                fontWeight="700"
                color="$color"
                textAlign="center"
              >
                {t('auth_login_title')}
              </Text>
              <Paragraph
                size="$3"
                lineHeight="$2"
                color="$color11"
                textAlign="center"
                maxWidth={280}
                mt="$2"
              >
                {t('auth_login_subtitle')}
              </Paragraph>
            </Animated.View>

            {/* iOS-style login card */}
            <Card
              elevate
              bordered
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
                  label={t('auth_email_label')}
                  placeholder={t('auth_email_placeholder')}
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
                  label={t('auth_password_label')}
                  placeholder={t('auth_password_placeholder')}
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
                  <Text flex={1} fontSize="$3" color={colors.error}>
                    {error}
                  </Text>
                </Animated.View>
              )}

              {/* Forgot Password - iOS style */}
              <Button
                onPress={() => {
                  haptics.light();
                  // TODO: Implement forgot password flow
                  alert(t('auth_forgot_password_soon'));
                }}
                size="$3"
                alignSelf="flex-end"
                mb="$4"
                chromeless
                pressStyle={{ opacity: 0.6 }}
              >
                <Text fontSize="$3" fontWeight="600" color={colors.tint}>
                  {t('auth_forgot_password')}
                </Text>
              </Button>

              {/* Primary button - iOS style */}
              <Button
                onPress={handleLogin}
                disabled={!!isLoading}
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
                {isLoading ? t('auth_logging_in') : t('auth_login_button')}
              </Button>

              {/* Divider - iOS style */}
              <XStack ai="center" my="$4" space="$2">
                <Separator flex={1} borderColor="$color5" />
                <Text fontSize="$2" px="$3" color="$color10" fontWeight="500">
                  {t('auth_or')}
                </Text>
                <Separator flex={1} borderColor="$color5" />
              </XStack>

              {/* OAuth buttons */}
              <YStack space="$3">
                <OAuthButton
                  provider="google"
                  onPress={handleGoogleSignIn}
                  loading={!!isLoading}
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
                <Text fontSize="$3" color="$color11">
                  {t('auth_no_account')}
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
                  <Text fontSize="$3" fontWeight="600" color={colors.tint}>
                    {t('auth_signup_link')}
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
