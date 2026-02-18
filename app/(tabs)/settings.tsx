import { useState } from 'react';
import {
  Switch,
  Modal,
  Pressable,
  Platform,
  Alert,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { ScreenLayout } from '@/components/ScreenLayout';
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
  Button,
  ScrollView,
  Avatar,
  Switch as TamaguiSwitch,
} from 'tamagui';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import LottieView from 'lottie-react-native';
import { api } from '@/convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';

import { usePremium } from '@/hooks/usePremium';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
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
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { AvatarSelector } from '@/components/settings/AvatarSelector';
import { AVATARS } from '@/constants/Avatars';
import { BADGES } from '@/constants/Badges';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

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
        <View style={{ marginBottom: 12 }}>
          <GlassCard borderRadius={16}>
            <Pressable
              onPress={() => {
                haptics.selection();
                onPress();
              }}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={({ pressed }) => ({
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                opacity: pressed ? 0.9 : 1,
              })}
            >
              <XStack alignItems="center" gap="$3" flex={1}>
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
                        : `${colors.tint}15`
                  }
                  alignItems="center"
                  justifyContent="center"
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
                          : colors.tint
                    }
                    style={{ zIndex: 1, opacity: 0.9 }}
                  />
                </YStack>

                <YStack flex={1}>
                  <Text fontSize="$4" fontWeight="600" color={colors.text}>
                    {title}
                  </Text>
                  {subtitle && (
                    <Text fontSize="$2" color={colors.text} opacity={0.6}>
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
            </Pressable>
          </GlassCard>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

import { useTheme } from '@/context/ThemeContext';
import { useSettingsStore } from '@/store/settingsStore';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { showConfirm, showError, showSuccess } = useAlertDialog();
  const { themePreference, setThemePreference } = useTheme();

  const {
    subscriptionType,
    isPremium,
    cancelSubscription,
    purchasePackage,
    restorePurchases,
    isReady,
  } = usePremium();
  const [loadingPurchase, setLoadingPurchase] = useState(false);
  const { user, isAuthenticated, signOut, token } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const {
    isSoundEnabled,
    setSoundEnabled,
    isAmbientBackgroundEnabled,
    setAmbientBackgroundEnabled,
  } = useSettingsStore();
  const [avatarSelectorVisible, setAvatarSelectorVisible] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | undefined>();

  // Query gamification stats to get badges and level
  const gamificationStats = useQuery(api.gamification.getStats, {
    token: token || undefined,
  });

  const updateProfileImage = useMutation(api.users.updateProfileImage);
  const setCurrentAvatar = useMutation(api.users.setCurrentAvatar);

  const handleUpdateAvatar = () => {
    haptics.selection();
    console.log('[Settings] Gamification Stats:', gamificationStats);
    console.log('[Settings] Badges:', gamificationStats?.badges);
    setAvatarSelectorVisible(true);
  };

  const handleUploadPhoto = async () => {
    setAvatarSelectorVisible(false);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
        if (user && token) {
          await updateProfileImage({ token, image: imageUri });
          showSuccess(t('common_success'));
        }
      }
    } catch (e) {
      showError('Failed to update avatar');
    }
  };

  const handleSelectAvatar = async (avatarId: string) => {
    console.log('[Settings] Selecting avatar:', avatarId);
    setAvatarSelectorVisible(false);
    if (user && token) {
      try {
        // Set local state immediately for instant UI feedback
        setSelectedAvatar(avatarId);

        const result = await setCurrentAvatar({ token, avatarId });
        console.log('[Settings] Avatar update result:', result);
        showSuccess('Avatar Updated!');
      } catch (error) {
        console.error('[Settings] Failed to update avatar:', error);
        // Revert local state on error
        setSelectedAvatar(undefined);
        showError('Failed to update avatar. Please try again.');
      }
    } else {
      console.error('[Settings] No user or token available');
      showError('Please sign in to update your avatar');
    }
  };

  // Check if current avatar is an avatar or a badge
  // Use selectedAvatar if set (optimistic), otherwise fall back to user.currentAvatar
  const currentAvatarId = selectedAvatar || (user as any)?.currentAvatar;
  const currentAvatarDef = currentAvatarId
    ? AVATARS.find((a) => a.id === currentAvatarId) ||
      BADGES.find((b) => b.id === currentAvatarId)
    : null;

  // Debug logging
  console.log('[Settings] Selected Avatar (local):', selectedAvatar);
  console.log('[Settings] User Avatar (server):', (user as any)?.currentAvatar);
  console.log('[Settings] Current Avatar ID (effective):', currentAvatarId);
  console.log('[Settings] Current Avatar Def:', currentAvatarDef);
  console.log(
    '[Settings] Has Lottie?:',
    (currentAvatarDef as any)?.lottie || (currentAvatarDef as any)?.lottieSource
  );

  // Determine if the user is a "Guest" (even if technically authenticated with a guest token)
  const isGuest = !isAuthenticated || user?.email?.includes('@guest.local');
  const showProfile = isAuthenticated && !isGuest;

  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const [selectedSubscription, setSelectedSubscription] = useState<
    'monthly' | 'yearly'
  >(subscriptionType === 'yearly' ? 'yearly' : 'monthly');
  const [selectedTier, setSelectedTier] = useState<'personal' | 'pro'>(
    'personal'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleUpgrade = async (pack?: any) => {
    if (!pack) return;
    setLoadingPurchase(true);
    haptics.selection();
    try {
      const success = await purchasePackage(pack);
      if (success) {
        showSuccess(t('premium_upgraded_success'));
      }
    } finally {
      setLoadingPurchase(false);
    }
  };

  const handleRestore = async () => {
    setLoadingPurchase(true);
    haptics.selection();
    try {
      await restorePurchases();
    } finally {
      setLoadingPurchase(false);
    }
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

  // handleManageAccount removed

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

  const handleThemeChange = () => {
    haptics.selection();
    // Use Alert with custom buttons for theme selection
    if (Platform.OS === 'ios') {
      // iOS ActionSheet style via Alert
      Alert.alert('Choose Theme', 'Select your preferred appearance', [
        {
          text: 'Light',
          onPress: () => setThemePreference('light'),
          style: themePreference === 'light' ? 'default' : 'default',
        },
        {
          text: 'Dark',
          onPress: () => setThemePreference('dark'),
          style: themePreference === 'dark' ? 'default' : 'default',
        },
        {
          text: 'System Default',
          onPress: () => setThemePreference('system'),
          style: themePreference === 'system' ? 'default' : 'default',
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
    } else {
      // Create a simpler confirm dialog cycle for Android or a 3-button alert if supported well,
      // but Android alerts with >3 buttons are tricky.
      // Let's just cycle: System -> Light -> Dark -> System
      const nextTheme =
        themePreference === 'system'
          ? 'light'
          : themePreference === 'light'
            ? 'dark'
            : 'system';
      setThemePreference(nextTheme);
    }
  };

  const getThemeLabel = () => {
    switch (themePreference) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      default:
        return 'System Default';
    }
  };

  return (
    <ScreenLayout edges={['top']} disableBackground>
      <ScrollView
        flex={1}
        contentContainerStyle={{
          paddingBottom: 90 + insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <AmbientBackground scrollable height={4000} />
        <View style={{ padding: 16 }}>
          {/* Header - Removed redundant profile view */}

          {/* Authenticated Profile Card */}
          {/* Authentication / Profile Section */}
          {isGuest || !isAuthenticated ? (
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={{ marginBottom: 24 }}
            >
              <GlassCard borderRadius={20}>
                <View style={{ padding: 20 }}>
                  <XStack alignItems="center" gap="$3" marginBottom="$3">
                    <YStack
                      width={44}
                      height={44}
                      borderRadius={22}
                      backgroundColor={`${colors.tint}15`}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <FontAwesome5
                        name="user-circle"
                        size={20}
                        color={colors.tint}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="700" color={colors.text}>
                        {t('settings_signin_title')}
                      </Text>
                      <Text fontSize="$3" opacity={0.6} color={colors.text}>
                        {t('settings_signin_subtitle')}
                      </Text>
                    </YStack>
                  </XStack>

                  <GlassButton
                    label={t('settings_signin_button')}
                    onPress={() => router.push('/auth/login')}
                    size="medium"
                    icon="sign-in-alt"
                    backgroundColor={colors.tint}
                    textColor="white"
                    backgroundOpacity={1}
                  />
                </View>
              </GlassCard>
            </Animated.View>
          ) : (
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={{ marginBottom: 24 }}
            >
              <GlassCard borderRadius={20}>
                <View style={{ padding: 20 }}>
                  <XStack alignItems="center" gap="$3" marginBottom="$4">
                    <Pressable onPress={handleUpdateAvatar}>
                      <View style={{ position: 'relative' }}>
                        <Avatar
                          circular
                          size="$6"
                          borderWidth={2}
                          borderColor={colors.border}
                        >
                          {currentAvatarDef ? (
                            <View
                              style={{
                                flex: 1,
                                backgroundColor:
                                  colorScheme === 'dark'
                                    ? '#1F2937'
                                    : '#F3F4F6',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <LottieView
                                source={
                                  (currentAvatarDef as any).lottie ||
                                  (currentAvatarDef as any).lottieSource
                                }
                                autoPlay
                                loop
                                style={{ width: 80, height: 80 }}
                              />
                            </View>
                          ) : (
                            <>
                              <Avatar.Image src={user?.image} />
                              <Avatar.Fallback
                                backgroundColor={
                                  colorScheme === 'dark' ? '$gray8' : '$gray5'
                                }
                                alignItems="center"
                                justifyContent="center"
                              >
                                <FontAwesome5
                                  name="user"
                                  size={24}
                                  color={colors.text}
                                />
                              </Avatar.Fallback>
                            </>
                          )}
                        </Avatar>

                        {/* Frame Overlay */}
                        {gamificationStats?.level &&
                          gamificationStats.level >= 5 && (
                            <View
                              style={{
                                position: 'absolute',
                                top: -14,
                                left: -14,
                                right: -14,
                                bottom: -14,
                                pointerEvents: 'none',
                                zIndex: 2,
                              }}
                            >
                              <LottieView
                                source={
                                  gamificationStats.level >= 20
                                    ? require('@/assets/animations/Avatar-frame-three-stars.json')
                                    : gamificationStats.level >= 10
                                      ? require('@/assets/animations/Avatar-frame-two-stars.json')
                                      : require('@/assets/animations/Avatar-frame-one-star.json')
                                }
                                autoPlay
                                loop
                                style={{ width: '100%', height: '100%' }}
                              />
                            </View>
                          )}

                        {/* Edit Badge */}
                        <View
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: colors.tint,
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 2,
                            borderColor: colors.background,
                            zIndex: 3,
                          }}
                        >
                          <FontAwesome5
                            name="pencil-alt"
                            size={10}
                            color="white"
                          />
                        </View>
                      </View>
                    </Pressable>

                    <YStack flex={1}>
                      <Text fontSize="$5" fontWeight="700" color={colors.text}>
                        {user?.name || t('settings_user_fallback')}
                      </Text>
                      <Text fontSize="$3" opacity={0.6} color={colors.text}>
                        {user?.email}
                      </Text>
                    </YStack>
                  </XStack>

                  {/* Premium Status Banner */}
                  <GlassCard
                    intensity={20}
                    borderRadius={16}
                    backgroundColor={
                      colorScheme === 'dark' ? '#fbbf24' : '#F59E0B'
                    }
                    backgroundOpacity={0.1}
                    style={{
                      marginBottom: 20,
                      padding: 12,
                      borderWidth: 1,
                      borderColor:
                        colorScheme === 'dark'
                          ? 'rgba(251, 191, 36, 0.3)'
                          : 'rgba(245, 158, 11, 0.2)',
                    }}
                  >
                    <XStack alignItems="center" gap="$3">
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 20,
                          backgroundColor:
                            colorScheme === 'dark'
                              ? 'rgba(251, 191, 36, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FontAwesome5
                          name="crown"
                          size={20}
                          color={colorScheme === 'dark' ? '#fbbf24' : '#d97706'}
                        />
                      </View>
                      <YStack flex={1}>
                        <Text
                          fontSize="$4"
                          fontWeight="700"
                          color={colors.text}
                        >
                          {t('settings_premium_active')}
                        </Text>
                        <Text fontSize="$3" opacity={0.7} color={colors.text}>
                          {t('settings_plan_desc', {
                            plan:
                              subscriptionType === 'monthly'
                                ? t('common_monthly')
                                : t('common_yearly'),
                          })}
                        </Text>
                      </YStack>
                    </XStack>
                  </GlassCard>

                  <GlassButton
                    shadowRadius={2}
                    label={t('settings_signout_button')}
                    onPress={handleSignOut}
                    size="medium"
                    icon="sign-out-alt"
                    backgroundColor={undefined} // Transparent
                    textColor="#DC2626"
                    backgroundOpacity={0}
                    iconComponent={
                      <FontAwesome5
                        name="sign-out-alt"
                        size={16}
                        color="#DC2626"
                      />
                    }
                  />
                </View>
              </GlassCard>
            </Animated.View>
          )}

          {/* Premium Upgrade Section */}
          {!isPremium && (
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <PricingSection
                selectedSubscription={selectedSubscription}
                selectedTier={selectedTier}
                onSelectSubscription={setSelectedSubscription}
                onSelectTier={setSelectedTier}
                onUpgrade={handleUpgrade}
              />
              <BenefitsGrid
                layout="grid"
                benefits={getBenefits(t)}
                accentColor={colors.tint}
              />
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
              color={colors.text}
            >
              Appearance & Account
            </Text>

            {/* Theme Selector */}
            <SettingsItem
              icon={
                themePreference === 'light'
                  ? 'sun'
                  : themePreference === 'dark'
                    ? 'moon'
                    : 'adjust'
              }
              title="App Theme"
              subtitle={getThemeLabel()}
              onPress={handleThemeChange}
              delay={210}
              rightElement={
                <XStack alignItems="center" space="$2">
                  <Text
                    color={colors.text}
                    opacity={0.6}
                    fontSize="$3"
                    fontWeight="600"
                  >
                    {themePreference === 'system'
                      ? 'Auto'
                      : themePreference === 'dark'
                        ? 'Dark'
                        : 'Light'}
                  </Text>
                  <FontAwesome5
                    name="chevron-right"
                    size={14}
                    color={colors.text}
                    style={{ opacity: 0.5 }}
                  />
                </XStack>
              }
            />

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
                <Text
                  color={colors.text}
                  opacity={0.6}
                  fontSize="$3"
                  fontWeight="600"
                >
                  {language.toUpperCase()}
                </Text>
              }
            />
            {/* Manage Account removed until implemented */}
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
            <SettingsItem
              icon="volume-up"
              title="Sound Effects"
              subtitle="Enable in-app sounds"
              onPress={() => {}}
              delay={310}
              rightElement={
                <Switch
                  value={isSoundEnabled}
                  onValueChange={(value) => {
                    console.log('[Settings] Toggling Sound:', value);
                    haptics.light();
                    setSoundEnabled(value);
                  }}
                  trackColor={{
                    false: colors.border,
                    true: colors.tint,
                  }}
                  thumbColor="white"
                />
              }
            />

            <SettingsItem
              icon="layer-group"
              title="Background Animation"
              subtitle="Show colorful blobs"
              onPress={() => {}}
              delay={312}
              rightElement={
                <Switch
                  value={isAmbientBackgroundEnabled}
                  onValueChange={(value) => {
                    haptics.light();
                    setAmbientBackgroundEnabled(value);
                  }}
                  trackColor={{
                    false: colors.border,
                    true: colors.tint,
                  }}
                  thumbColor="white"
                />
              }
            />

            <SettingsItem
              icon="bell-slash"
              title="Reset Notifications"
              subtitle="Clear all scheduled reminders"
              isDestructive
              onPress={() => {
                showConfirm(
                  {
                    title: 'Reset Notifications?',
                    message:
                      'This will remove all scheduled reminders from your device. This cannot be undone.',
                    confirmText: 'Reset',
                  },
                  async () => {
                    const { cancelAllNotifications } =
                      await import('@/utils/notifications');
                    await cancelAllNotifications();
                    showSuccess('All notifications cleared');
                  }
                );
              }}
              delay={315}
            />
            <SettingsItem
              icon="sync"
              title={t('settings_restore_purchases')}
              subtitle="Restore previous purchases"
              onPress={handleRestore}
              delay={320}
              rightElement={
                loadingPurchase ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : null
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
              color={colors.text}
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
        </View>
      </ScrollView>

      <LanguageSelectorModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
      />

      <AvatarSelector
        visible={avatarSelectorVisible}
        onClose={() => setAvatarSelectorVisible(false)}
        onUpload={handleUploadPhoto}
        onSelect={handleSelectAvatar}
        currentAvatar={(user as any)?.currentAvatar}
        userLevel={gamificationStats?.level || 1}
        unlockedBadgeIds={gamificationStats?.badges || []}
      />
    </ScreenLayout>
  );
}
