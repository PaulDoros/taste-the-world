import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import Constants from 'expo-constants';
import '../global.css';

// Configure Reanimated logger to disable strict mode warnings
import Animated, {
  configureReanimatedLogger,
  ReanimatedLogLevel,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable strict mode warnings for production-like behavior
});

// Suppress React Native Web deprecation warning for pointerEvents
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('props.pointerEvents is deprecated')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };
}

import {
  configureNotifications,
  useNotificationObserver,
} from '@/utils/notifications';
import { LanguageProvider } from '@/context/LanguageContext';
import { useColorScheme } from '@/components/useColorScheme';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { SplashOffer } from '@/components/premium/SplashOffer';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';
import { AchievementToast } from '@/components/gamification/AchievementToast';
import LottieView from 'lottie-react-native';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

import Purchases from 'react-native-purchases';

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });
  const [isReady, setIsReady] = useState(false);
  const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
  const splashOpacity = useSharedValue(1);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (fontsLoaded) {
      // Hide native splash immediately so we see our custom Lottie view
      SplashScreen.hideAsync().catch(() => {
        // Ignore error if splash screen is already hidden
      });

      configureNotifications(); // Setup notifications

      // Initialize RevenueCat
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const setupRevenueCat = async () => {
          const appleKey = process.env.EXPO_PUBLIC_RC_APPLE_KEY;
          const googleKey = process.env.EXPO_PUBLIC_RC_GOOGLE_KEY;
          const testKey = process.env.EXPO_PUBLIC_RC_TEST_API_KEY;
          const customKey = process.env.EXPO_PUBLIC_REVENUECAT_Test;
          const isExpoGo =
            Constants.executionEnvironment === 'storeClient' ||
            Constants.appOwnership === 'expo';

          let apiKey: string | undefined;

          if (isExpoGo) {
            // Expo Go cannot access native stores, so only the RC Test Store key is valid.
            apiKey = testKey || customKey;
          } else if (Platform.OS === 'ios') {
            apiKey = appleKey;
          } else {
            apiKey = googleKey;
          }

          // Fallback to test key when native key is missing in dev builds.
          if (!apiKey || apiKey.includes('placeholder')) {
            apiKey = testKey || customKey;
          }

          if (!apiKey || apiKey.includes('placeholder')) {
            console.warn(
              isExpoGo
                ? 'RevenueCat skipped: Expo Go requires a Test Store API key.'
                : 'RevenueCat skipped: API key not found or placeholder.'
            );
            return;
          }

          try {
            const configured = await Purchases.isConfigured();
            if (!configured) {
              Purchases.configure({ apiKey });
            }
          } catch (e) {
            console.warn('Error configuring Purchases:', e);
          }
        };

        void setupRevenueCat();
      }
      setIsReady(true);
    }
  }, [fontsLoaded]);

  const animatedSplashStyle = useAnimatedStyle(() => {
    return { opacity: splashOpacity.value };
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <AppThemeProvider>
        {/* Main App */}
        {isReady && <RootLayoutNav />}

        {/* Custom Lottie Splash Overlay */}
        {!splashAnimationFinished && (
          <Animated.View style={[styles.splashContainer, animatedSplashStyle]}>
            <LottieView
              source={require('../assets/animations/loading.json')}
              autoPlay
              loop={false}
              resizeMode="contain"
              style={styles.lottie}
              onAnimationFinish={() => {
                splashOpacity.value = withTiming(0, { duration: 500 }, () => {
                  runOnJS(setSplashAnimationFinished)(true);
                });
              }}
            />
          </Animated.View>
        )}
      </AppThemeProvider>
    </ConvexProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, user, isLoading: authLoading, token } = useAuth();
  const { isPremium } = usePremium();
  useNotificationObserver(); // Handle notification taps
  const segments = useSegments();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showSplashOffer, setShowSplashOffer] = useState(false);

  // Sync Auth with Convex
  useEffect(() => {
    if (token) {
      convex.setAuth(async () => token);
    } else {
      convex.clearAuth();
    }
  }, [token]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || authLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    // If user is authenticated (has token + user data loaded)
    if (isAuthenticated && user) {
      // If they are a GUEST, they are allowed to be on auth screens (to sign up/login)
      const isGuest =
        user.tier === 'guest' || user.email?.includes('@guest.local');
      const isRealUser = !isGuest;

      if (isRealUser && inAuthGroup) {
        // Redirect real users to home
        router.replace('/(tabs)');
      } else if (
        !isRealUser &&
        segments[0] === 'auth' &&
        segments[1] === 'welcome'
      ) {
        // If guest is on welcome screen, redirect to tabs (they are already "logged in" as guest)
        router.replace('/(tabs)');
      }
    } else if (!isAuthenticated && !inAuthGroup) {
      // If not authenticated and not in auth group, redirect to welcome
      router.replace('/auth/welcome');
    }
  }, [isAuthenticated, user, authLoading, segments, isMounted]);

  // Handle Splash Offer logic
  useEffect(() => {
    if (!isMounted || authLoading) return;

    // Check Global Session Flag
    // @ts-ignore
    if (global.hasShownSplashSession) return;

    const inTabs = segments[0] === '(tabs)';

    // Double check premium status wasn't just delayed
    if (inTabs && !isPremium && !showSplashOffer) {
      const timer = setTimeout(() => {
        // Final check before showing
        if (!isPremium) {
          setShowSplashOffer(true);
          // @ts-ignore
          global.hasShownSplashSession = true;
        }
      }, 1500); // 1.5s delay after mount/auth
      return () => clearTimeout(timer);
    }
  }, [isMounted, authLoading, isPremium, segments]);

  return (
    <LanguageProvider>
      <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'light'}>
        <NavigationThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              gestureDirection: 'horizontal',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="country/[id]"
              options={{
                animation: 'slide_from_right',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="recipe/[id]"
              options={{
                animation: 'slide_from_right',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="country-recipes"
              options={{
                animation: 'slide_from_right',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/welcome"
              options={{
                animation: 'fade',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/login"
              options={{
                presentation: 'modal',
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="auth/signup"
              options={{
                presentation: 'modal',
                headerShown: false,
                gestureEnabled: true,
              }}
            />
          </Stack>
          <SplashOffer
            visible={showSplashOffer}
            onClose={() => setShowSplashOffer(false)}
          />
          <AchievementToast />
        </NavigationThemeProvider>
      </TamaguiProvider>
    </LanguageProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999, // Ensure it is on top of everything
  },
  lottie: {
    width: 200,
    height: 200,
  },
});
