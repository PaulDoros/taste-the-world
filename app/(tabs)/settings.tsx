import { useState } from 'react';
import { Alert, Switch } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
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
  Separator,
  useTheme,
  Avatar,
  Switch as TamaguiSwitch,
} from 'tamagui';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { usePremium } from '@/hooks/usePremium';
import { FEATURED_PREMIUM_COUNTRIES } from '@/constants/Config';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { PricingSection } from '@/components/settings/PricingSection';
import { shareApp } from '@/utils/shareApp';
import { requestRating } from '@/utils/rateApp';
import { BenefitsGrid } from '@/components/BenefitsGrid';
import { benefits } from '@/constants/Benefits';
import { brandColors } from '@/theme/colors';

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
  const theme = useTheme();
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
          backgroundColor="$card"
          padding="$3.5"
          pressStyle={{ opacity: 0.9 }}
          marginBottom="$3"
        >
          <XStack alignItems="center" gap="$3">
            <YStack
              width={40}
              height={40}
              borderRadius={20}
              backgroundColor={
                premium ? '#EDE9FE' : isDestructive ? '$red4' : '$background'
              }
              alignItems="center"
              justifyContent="center"
              opacity={premium ? 1 : 0.8}
            >
              {premium && (
                <FontAwesome5
                  name="crown"
                  size={16}
                  color="#8B5CF6"
                  style={{ position: 'absolute', top: -5, right: -5 }}
                />
              )}
              <FontAwesome5
                name={icon}
                size={16}
                color={
                  premium
                    ? '#8B5CF6'
                    : isDestructive
                      ? theme.red10?.val
                      : theme.color11?.val
                }
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
                color={theme.color9?.val}
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
  const theme = useTheme();

  const { subscriptionType, isPremium, setSubscription, cancelSubscription } =
    usePremium();
  const { user, isAuthenticated, signOut } = useAuth();

  const [selectedSubscription, setSelectedSubscription] = useState<
    'monthly' | 'yearly'
  >(subscriptionType === 'yearly' ? 'yearly' : 'monthly');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleUpgrade = () => {
    haptics.light();
    setSubscription(selectedSubscription);
    Alert.alert(
      '🎉 Welcome to Premium!',
      `You've successfully upgraded to ${selectedSubscription === 'monthly' ? 'Monthly' : 'Yearly'} Premium. Enjoy unlimited access to all features!`,
      [{ text: 'Awesome!', onPress: () => haptics.success() }]
    );
  };

  const handleCancelSubscription = () => {
    haptics.light();
    Alert.alert(
      'Cancel Subscription',
      "Are you sure you want to cancel your premium subscription? You'll lose access to premium features at the end of your billing period.",
      [
        { text: 'Keep Premium', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            cancelSubscription();
            haptics.success();
          },
        },
      ]
    );
  };

  const handleManageAccount = () => {
    haptics.light();
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else {
      Alert.alert(
        'Account Management',
        'Account management features coming soon!'
      );
    }
  };

  const handleLogin = () => {
    haptics.light();
    router.push('/auth/login');
  };

  const handleSignOut = () => {
    haptics.light();
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          haptics.success();
        },
      },
    ]);
  };

  const handleAbout = () => {
    haptics.light();
    Alert.alert(
      'Taste the World',
      'Version 1.0.0\n\nExplore cuisines from around the globe and discover amazing recipes from 195+ countries!\n\nMade with ❤️ for food lovers worldwide.'
    );
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
                <FontAwesome5 name="user" size={24} color={theme.color.val} />
              </Avatar.Fallback>
            </Avatar>

            <YStack flex={1}>
              <Text fontSize="$8" fontWeight="800" color="$color">
                Settings
              </Text>
              <Text fontSize="$4" color="$color" opacity={0.6}>
                {isAuthenticated
                  ? user?.name || user?.email || 'Signed In'
                  : 'Not Signed In'}
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
                  PREMIUM
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
                  color={theme.color.val}
                />
                <Text fontSize="$5" fontWeight="700">
                  Sign In to Sync
                </Text>
              </XStack>
              <Text fontSize="$3" opacity={0.7} marginBottom="$4">
                Sign in to save your favorite recipes, shopping lists, and
                access your data across all devices.
              </Text>
              <Button
                themeInverse
                onPress={handleLogin}
                icon={<FontAwesome5 name="sign-in-alt" />}
              >
                Sign In
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
                    {user?.name || 'User'}
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
                Sign Out
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
              benefits={benefits}
              accentColor={brandColors.primary}
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
                  Premium Active
                </Text>
              </XStack>
              <Text
                fontSize="$3"
                opacity={0.7}
                marginBottom="$4"
                color="#6D28D9"
              >
                You are currently on the{' '}
                {subscriptionType === 'monthly' ? 'Monthly' : 'Yearly'} plan.
              </Text>
              <Button
                theme="red"
                variant="outlined"
                onPress={handleCancelSubscription}
                size="$3"
              >
                Cancel Subscription
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
            Account
          </Text>
          {isAuthenticated ? (
            <SettingsItem
              icon="user-cog"
              title="Manage Account"
              subtitle="Profile, preferences, and settings"
              onPress={handleManageAccount}
              delay={250}
            />
          ) : null}
          <SettingsItem
            icon="bell"
            title="Notifications"
            subtitle="Recipe reminders and updates"
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

        {/* Premium Features Section */}
        {/* <Animated.View entering={FadeInDown.delay(400).springify()}>
          <Text
            fontSize="$5"
            fontWeight="700"
            marginBottom="$3"
            marginLeft="$2"
            marginTop="$4"
          >
            Premium Features
          </Text>
          <SettingsItem
            icon="globe-americas"
            title="All Countries"
            subtitle={`${FEATURED_PREMIUM_COUNTRIES.length}+ premium countries`}
            onPress={() => {
              haptics.light();
              if (!isPremium) {
                Alert.alert(
                  'Premium Feature',
                  'Upgrade to Premium to access all 195+ countries!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Upgrade',
                      onPress: () => setSelectedSubscription('yearly'),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Premium Countries',
                  `You have access to all countries including:\n\n${FEATURED_PREMIUM_COUNTRIES.slice(0, 5).join(', ')}... and more!`
                );
              }
            }}
            delay={450}
            premium
            rightElement={
              !isPremium ? (
                <FontAwesome5
                  name="lock"
                  size={14}
                  color={theme.color11?.val}
                />
              ) : undefined
            }
          />
          <SettingsItem
            icon="filter"
            title="Advanced Filters"
            subtitle="Dietary, difficulty, and more"
            onPress={() => {
              haptics.light();
              if (!isPremium) {
                Alert.alert(
                  'Premium Feature',
                  'Upgrade to Premium to use advanced filters!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Upgrade',
                      onPress: () => setSelectedSubscription('yearly'),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Advanced Filters',
                  'Use advanced filters to find recipes that match your dietary preferences and skill level!'
                );
              }
            }}
            delay={500}
            premium
            rightElement={
              !isPremium ? (
                <FontAwesome5
                  name="lock"
                  size={14}
                  color={theme.color11?.val}
                />
              ) : undefined
            }
          />
          <SettingsItem
            icon="download"
            title="Offline Mode"
            subtitle="Access recipes without internet"
            onPress={() => {
              haptics.light();
              if (!isPremium) {
                Alert.alert(
                  'Premium Feature',
                  'Upgrade to Premium to download recipes for offline use!',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Upgrade',
                      onPress: () => setSelectedSubscription('yearly'),
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'Offline Mode',
                  'Download your favorite recipes to access them even without an internet connection!'
                );
              }
            }}
            delay={550}
            premium
            rightElement={
              !isPremium ? (
                <FontAwesome5
                  name="lock"
                  size={14}
                  color={theme.color11?.val}
                />
              ) : undefined
            }
          />
        </Animated.View> */}

        {/* App Section */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Text
            fontSize="$5"
            fontWeight="700"
            marginBottom="$3"
            marginLeft="$2"
            marginTop="$4"
          >
            App
          </Text>
          <SettingsItem
            icon="info-circle"
            title="About"
            subtitle="Version 1.0.0"
            onPress={handleAbout}
            delay={650}
          />
          <SettingsItem
            icon="star"
            title="Rate App"
            subtitle="Love the app? Leave a review!"
            onPress={async () => {
              haptics.light();
              await requestRating();
            }}
            delay={700}
          />
          <SettingsItem
            icon="share-alt"
            title="Share App"
            subtitle="Tell your friends about us"
            onPress={async () => {
              const shared = await shareApp();
              if (shared) {
                Alert.alert(
                  '🎉 Thank You!',
                  'Thanks for spreading the word about Taste the World!',
                  [{ text: 'OK', onPress: () => haptics.light() }]
                );
              }
            }}
            delay={750}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
