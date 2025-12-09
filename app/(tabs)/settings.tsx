import { useState } from 'react';
import { Switch, Modal, Pressable } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  YStack,
  XStack,
  Text,
  ScrollView,
  Card,
  Button,
  Avatar,
  Switch as TamaguiSwitch,
} from 'tamagui';
import { useRouter } from 'expo-router';

import { usePremium } from '@/hooks/usePremium';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { PricingSection } from '@/components/settings/PricingSection';
import { shareApp } from '@/utils/shareApp';
import { requestRating } from '@/utils/rateApp';
import { BenefitsGrid } from '@/components/BenefitsGrid';
import { getBenefits } from '@/constants/Benefits';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useLanguage } from '@/context/LanguageContext';
import { Translations, Language } from '@/constants/Translations';
import { LanguageSelectorModal } from '@/components/settings/LanguageSelectorModal';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  delay?: number;
  premium?: boolean;
  isDestructive?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  delay = 0,
  premium = false,
  isDestructive = false,
}: SettingsItemProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Animated.View style={animatedStyle}>
        <Card
          bordered
          animation="quick"
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          backgroundColor="$bg2"
          padding="$3.5"
          pressStyle={{ opacity: 0.9 }}
          marginBottom="$3"
        >
          <XStack alignItems="center" gap="$3">
            {/* Icon Container */}
            <YStack
              width={44}
              height={44}
              borderRadius={22}
              backgroundColor={
                premium
                  ? isDark
                    ? '$purple4'
                    : '$purple3'
                  : isDestructive
                    ? isDark
                      ? '$red4'
                      : '$red3'
                    : '$bg3'
              }
              alignItems="center"
              justifyContent="center"
              shadowOffset={{ width: 0, height: isDark ? 0 : 2 }}
              shadowOpacity={isDark ? 0.6 : premium ? 0.4 : 0.2}
              shadowRadius={isDark ? 12 : premium ? 10 : 6}
              elevation={premium ? 10 : 8}
              borderWidth={isDark ? 0 : premium ? 1.5 : 0}
              borderColor={
                premium
                  ? isDark
                    ? '$purple9'
                    : '$purple7'
                  : isDestructive
                    ? isDark
                      ? '$red9'
                      : '$red7'
                    : isDark
                      ? '$borderColor'
                      : '$red10'
              }
              shadowColor={isDark ? '$purple10' : '$red10'}
            >
              {/* Premium crown badge */}
              {premium && (
                <YStack
                  position="absolute"
                  top={-6}
                  right={-6}
                  width={20}
                  height={20}
                  borderRadius={10}
                  backgroundColor="$purple9"
                  alignItems="center"
                  justifyContent="center"
                  shadowColor={
                    isDark ? 'rgba(255, 255, 255, 0.4)' : '$purple10'
                  }
                  shadowOffset={{ width: 0, height: isDark ? 0 : 2 }}
                  shadowOpacity={isDark ? 0.9 : 0.4}
                  shadowRadius={isDark ? 10 : 4}
                  elevation={4}
                  borderWidth={isDark ? 1 : 0}
                  borderColor={isDark ? '$purple7' : 'transparent'}
                >
                  <FontAwesome5 name="crown" size={10} color="white" />
                </YStack>
              )}

              {/* Main icon */}
              <FontAwesome5
                name={icon}
                size={18}
                color={
                  premium
                    ? isDark
                      ? '#A78BFA' // purple.400
                      : '#7C3AED' // purple.600
                    : isDestructive
                      ? isDark
                        ? '#F87171' // red.400
                        : '#DC2626' // red.600
                      : colors.text
                }
                style={{ zIndex: 1, opacity: 0.8 }}
              />
            </YStack>

            <YStack flex={1}>
              <Text fontSize="$4" fontWeight="600" color="$color">
                {title}
              </Text>
              {subtitle && (
                <Text fontSize="$2" color="$color11" opacity={0.7}>
                  {subtitle}
                </Text>
              )}
            </YStack>

            {rightElement || (
              <FontAwesome5
                name="chevron-right"
                size={14}
                color={colors.text}
                style={{ opacity: 0.5 }}
              />
            )}
          </XStack>
        </Card>
      </Animated.View>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showConfirm, showError, showSuccess } = useAlertDialog();

  const { subscriptionType, isPremium, setSubscription, cancelSubscription } =
    usePremium();
  const { user, isAuthenticated, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState<
    'monthly' | 'yearly'
  >(subscriptionType === 'yearly' ? 'yearly' : 'monthly');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleUpgrade = () => {
    haptics.light();
    setSubscription(selectedSubscription);
    showSuccess(
      t('settings_upgrade_success', {
        plan:
          selectedSubscription === 'monthly'
            ? t('common_monthly')
            : t('common_yearly'),
      })
    );
  };

  const handleCancelSubscription = () => {
    showConfirm(
      {
        title: t('settings_cancel_sub_confirm_title'),
        message: t('settings_cancel_sub_confirm_msg'),
        confirmText: t('settings_cancel_sub_confirm_confirm'),
        cancelText: t('settings_cancel_sub_confirm_cancel'),
      },
      () => {
        cancelSubscription();
        showSuccess(t('settings_sub_canceled'));
      }
    );
  };

  const handleManageAccount = () => {
    haptics.light();
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      showError(t('settings_manage_account_soon'));
    }
  };

  const handleLogin = () => {
    haptics.light();
    router.push('/auth/login');
  };

  const handleSignOut = () => {
    showConfirm(
      {
        title: t('settings_signout_confirm_title'),
        message: t('settings_signout_confirm_msg'),
        confirmText: t('settings_signout_confirm_button'),
      },
      async () => {
        await signOut();
        showSuccess(t('settings_signout_success'));
      }
    );
  };

  const handleAbout = () => {
    haptics.light();
    showSuccess(t('settings_about_toast'));
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        flex={1}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 90 + insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={{ marginBottom: 20 }}
        >
          <XStack alignItems="center" gap="$4">
            <Avatar circular size="$6">
              <Avatar.Image src={user?.image} />
              <Avatar.Fallback
                backgroundColor="$gray5"
                alignItems="center"
                justifyContent="center"
              >
                <FontAwesome5 name="user" size={24} color={colors.text} />
              </Avatar.Fallback>
            </Avatar>

            <YStack flex={1}>
              <Text fontSize="$8" fontWeight="800" color="$color">
                {t('settings_title')}
              </Text>
              <Text fontSize="$4" color="$color" opacity={0.6}>
                {isAuthenticated
                  ? user?.name || user?.email || t('settings_signed_in')
                  : t('settings_signed_out')}
              </Text>
            </YStack>

            {isPremium && (
              <YStack
                backgroundColor="#8B5CF6"
                paddingHorizontal="$3"
                paddingVertical="$1.5"
                borderRadius="$4"
              >
                <Text
                  color="white"
                  fontSize={12}
                  fontWeight="800"
                  textTransform="uppercase"
                >
                  {t('settings_premium_badge')}
                </Text>
              </YStack>
            )}
          </XStack>
        </Animated.View>

        {/* Authentication Section */}
        {!isAuthenticated ? (
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{ marginBottom: 24 }}
          >
            <Card bordered padding="$4" backgroundColor="$card">
              <XStack alignItems="center" gap="$3" marginBottom="$3">
                <FontAwesome5
                  name="user-circle"
                  size={24}
                  color={colors.text}
                />
                <Text fontSize="$5" fontWeight="700">
                  {t('settings_signin_title')}
                </Text>
              </XStack>
              <Text fontSize="$3" opacity={0.7} marginBottom="$4">
                {t('settings_signin_subtitle')}
              </Text>
              <Button
                themeInverse
                onPress={handleLogin}
                icon={<FontAwesome5 name="sign-in-alt" />}
              >
                {t('settings_signin_button')}
              </Button>
            </Card>
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{ marginBottom: 24 }}
          >
            <Card bordered padding="$4" backgroundColor="$card">
              <XStack alignItems="center" gap="$3" marginBottom="$3">
                <Avatar circular size="$4">
                  <Avatar.Image src={user?.image} />
                  <Avatar.Fallback backgroundColor="$gray5" />
                </Avatar>
                <YStack>
                  <Text fontSize="$4" fontWeight="700">
                    {user?.name || t('settings_user_fallback')}
                  </Text>
                  <Text fontSize="$3" opacity={0.6}>
                    {user?.email}
                  </Text>
                </YStack>
              </XStack>
              <Button
                theme="red"
                variant="outlined"
                onPress={handleSignOut}
                icon={<FontAwesome5 name="sign-out-alt" />}
                size="$3"
              >
                {t('settings_signout_button')}
              </Button>
            </Card>
          </Animated.View>
        )}

        {/* Premium Upgrade Section */}
        {!isPremium && (
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <PricingSection
              selectedSubscription={selectedSubscription}
              onSelectSubscription={setSelectedSubscription}
              onUpgrade={handleUpgrade}
            />
            <BenefitsGrid
              layout="grid"
              benefits={getBenefits(t)}
              accentColor={colors.tint}
            />
          </Animated.View>
        )}

        {/* Premium Status (if subscribed) */}
        {isPremium && isAuthenticated && (
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={{ marginBottom: 24 }}
          >
            <Card
              bordered
              padding="$4"
              borderColor="#0EA5E9"
              backgroundColor="#F5F3FF"
            >
              <XStack alignItems="center" gap="$3" marginBottom="$3">
                <FontAwesome5 name="crown" size={20} color="#0F172A" />
                <Text fontSize="$5" fontWeight="700" color="#1E293B">
                  {t('settings_premium_active')}
                </Text>
              </XStack>
              <Text
                fontSize="$3"
                opacity={0.7}
                marginBottom="$4"
                color="#6D28D9"
              >
                {t('settings_plan_desc', {
                  plan:
                    subscriptionType === 'monthly'
                      ? t('common_monthly')
                      : t('common_yearly'),
                })}
              </Text>
              <Button
                theme="red"
                variant="outlined"
                onPress={handleCancelSubscription}
                size="$3"
              >
                {t('settings_cancel_sub_button')}
              </Button>
            </Card>
          </Animated.View>
        )}

        {/* Account Section */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={{ marginTop: 24 }}
        >
          <Text
            fontSize="$5"
            fontWeight="700"
            marginBottom="$3"
            marginLeft="$2"
          >
            {t('settings_account_section')}
          </Text>
          <SettingsItem
            icon="globe"
            title={t('language')}
            subtitle={
              Translations[language].languageName || language.toUpperCase()
            }
            onPress={() => {
              haptics.selection();
              setLanguageModalVisible(true);
            }}
            delay={220}
            rightElement={
              <Text color="$color11" fontSize="$3" fontWeight="600">
                {language.toUpperCase()}
              </Text>
            }
          />
          {isAuthenticated ? (
            <SettingsItem
              icon="user-cog"
              title={t('settings_manage_account')}
              subtitle={t('settings_manage_account_subtitle')}
              onPress={handleManageAccount}
              delay={250}
            />
          ) : null}
          <SettingsItem
            icon="bell"
            title={t('settings_notifications')}
            subtitle={t('settings_notifications_subtitle')}
            onPress={() => {}} // Empty handler - Switch handles the toggle
            delay={300}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  haptics.light();
                  setNotificationsEnabled(value);
                }}
                trackColor={{
                  false: colors.border,
                  true: colors.tint,
                }}
                thumbColor="white"
              />
            }
          />
        </Animated.View>

        {/* App Section */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Text
            fontSize="$5"
            fontWeight="700"
            marginBottom="$3"
            marginLeft="$2"
            marginTop="$4"
          >
            {t('settings_app_section')}
          </Text>
          <SettingsItem
            icon="info-circle"
            title={t('settings_about')}
            subtitle={t('settings_version')}
            onPress={handleAbout}
            delay={650}
          />
          <SettingsItem
            icon="star"
            title={t('settings_rate_app')}
            subtitle={t('settings_rate_app_subtitle')}
            onPress={async () => {
              haptics.light();
              await requestRating();
            }}
            delay={700}
          />
          <SettingsItem
            icon="share-alt"
            title={t('settings_share_app')}
            subtitle={t('settings_share_app_subtitle')}
            onPress={async () => {
              const shared = await shareApp();
              if (shared) {
                showSuccess(t('settings_share_success'));
              }
            }}
            delay={750}
          />
        </Animated.View>
      </ScrollView>

      <LanguageSelectorModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />
    </SafeAreaView>
  );
}
