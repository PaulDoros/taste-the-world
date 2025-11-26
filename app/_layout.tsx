import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

// Configure Reanimated logger to disable strict mode warnings
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Disable strict mode warnings for production-like behavior
});

// Suppress React Native Web deprecation warning for pointerEvents
// This is a known issue in react-native-web that doesn't affect functionality
// The warning appears during SSR but doesn't impact app behavior
if (__DEV__) {
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('props.pointerEvents is deprecated')
    ) {
      // Suppress this specific warning from react-native-web
      return;
    }
    originalWarn.apply(console, args);
  };
}

import { useColorScheme } from '@/components/useColorScheme';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { useUserStore } from '@/store/useUserStore';
import { TamaguiProvider } from 'tamagui';
import config from '../tamagui.config';

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
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ConvexProvider client={convex}>
      <RootLayoutNav />
    </ConvexProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, isGuest } = useUserStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === 'auth';
    const isAuthed = user !== null || isGuest;

    if (!isAuthed && !inAuthGroup) {
      // Redirect to welcome screen if not logged in
      router.replace('/auth/welcome');
    } else if (user !== null && !isGuest && inAuthGroup) {
      // Redirect to home if already logged in as a real user
      // Guests are allowed to visit auth screens to upgrade/login
      router.replace('/(tabs)');
    }
  }, [user, isGuest, segments]);

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme ?? 'light'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
            }}
          />
        </Stack>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
