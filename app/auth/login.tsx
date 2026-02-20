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
import {
  googleAuthRequestConfig,
  googleOAuthMissingConfigMessage,
  isGoogleOAuthConfigured,
} from '@/constants/googleAuth';

import { haptics } from '@/utils/haptics';
import { useLanguage } from '@/context/LanguageContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { signIn, signInWithOAuth, isLoading, error, clearError } = useAuth();
  const { t } = useLanguage();

  // Google OAuth
  const [request, response, promptAsync] = Google.useAuthRequest(
    googleAuthRequestConfig
  );

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
      if (!isGoogleOAuthConfigured) {
        console.error('[Auth] Google OAuth not configured', {
          platform: Platform.OS,
        });
        alert(googleOAuthMissingConfigMessage);
        return;
      }
      if (!request) return;
      await promptAsync();
    } catch (err) {
      console.error('Google sign in error:', err);
      haptics.error();
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{
        backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF',
      }}
      edges={['top']}
    >
      {/* iOS-style background */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        minHeight="100%"
        backgroundColor={colorScheme === 'dark' ? '#000000' : '#FFFFFF'}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: 20,
            minHeight: Dimensions.get('window').height,
            paddingBottom: insets.bottom + 20,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
                    width: 50,
                    height: 50,
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.tint,
                    shadowColor: colors.tint,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.7,
                    shadowRadius: 5,
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
            <GlassCard
              borderRadiusInside={0}
              borderRadius={24}
              shadowRadius={4}
              style={{
                padding: 24,
                marginBottom: 20,
              }}
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
                  variant="inset"
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
              <GlassButton
                onPress={() => {
                  haptics.light();
                  // TODO: Implement forgot password flow
                  alert(t('auth_forgot_password_soon'));
                }}
                size="small"
                label={t('auth_forgot_password')}
                textColor={colors.tint}
                backgroundColor={colors.tint}
                backgroundOpacity={0.1}
                style={{ alignSelf: 'flex-end', marginBottom: 12, padding: 3 }}
              />

              {/* Primary button - iOS style */}
              <GlassButton
                onPress={handleLogin}
                disabled={!!isLoading}
                size="large"
                label={
                  isLoading ? t('auth_logging_in') : t('auth_login_button')
                }
                backgroundColor={colors.tint}
                textColor="#FFFFFF"
                backgroundOpacity={1}
                style={{ width: '100%', marginBottom: 12, padding: 3 }}
              />

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
                  disabled={!isGoogleOAuthConfigured || !request}
                  delay={220}
                />
              </YStack>
            </GlassCard>

            {/* Sign up footer - iOS style */}
            <Animated.View
              entering={FadeInUp.delay(260)}
              style={{ alignItems: 'center', marginTop: 32 }}
            >
              <XStack ai="center" space="$2">
                <Text fontSize="$3" color="$color11">
                  {t('auth_no_account')}
                </Text>
                <GlassButton
                  onPress={() => {
                    haptics.light();
                    router.push('/auth/signup');
                  }}
                  size="small"
                  label={t('auth_signup_link')}
                  textColor={colors.tint}
                  backgroundColor={colors.tint}
                  backgroundOpacity={0.1}
                  style={{ marginBottom: 5 }}
                />
              </XStack>
            </Animated.View>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
