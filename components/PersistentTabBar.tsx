import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Pressable,
  Text,
  useWindowDimensions,
  Platform,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { BlurView } from 'expo-blur';
import { glassTokens } from '@/theme/colors';
import { isAndroidLowPerf, shouldUseGlassBlur } from '@/constants/Performance';

/**
 * Tab Configuration - 5 Primary Tabs
 */
const TAB_CONFIG = [
  {
    name: 'index',
    href: '/(tabs)',
    path: '/',
    title: 'Home',
    icon: 'home',
    color: '#0ea5e9',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  {
    name: 'explore',
    href: '/(tabs)/explore',
    path: '/explore',
    title: 'Explore',
    icon: 'globe-americas',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    name: 'chef',
    href: '/(tabs)/chef',
    path: '/chef',
    title: 'AI Chat',
    icon: 'robot',
    color: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  {
    name: 'more',
    href: '/(tabs)/more',
    path: '/more',
    title: 'More',
    icon: 'th-large',
    color: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  {
    name: 'settings',
    href: '/(tabs)/settings',
    path: '/settings',
    title: 'Settings',
    icon: 'user-circle',
    color: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
];

const normalizePath = (value?: string) => {
  if (!value) return '';
  let normalized =
    value.length > 1 && value.endsWith('/') ? value.slice(0, -1) : value;

  if (
    normalized === '/index' ||
    normalized === '/(tabs)' ||
    normalized === '/(tabs)/index'
  ) {
    return '/';
  }

  if (normalized.startsWith('/(tabs)')) {
    normalized = normalized.replace('/(tabs)', '') || '/';
  }

  return normalized === '/index' ? '/' : normalized;
};

const isTabPathMatch = (currentPath: string, tabPath: string) => {
  if (tabPath === '/') {
    return currentPath === '/';
  }
  return currentPath === tabPath || currentPath.startsWith(`${tabPath}/`);
};

/**
 * Persistent Tab Bar Component
 * Shows on all screens for easy navigation
 */
export const PersistentTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';
  const insets = useSafeAreaInsets();
  const useBlur = shouldUseGlassBlur;
  const colors = Colors[colorScheme ?? 'light'];
  const glass = glassTokens[isDark ? 'dark' : 'light'];
  const { width: SCREEN_WIDTH } = useWindowDimensions(); // Dynamic width that updates on resize/rotation
  const tabBarBottomOffset = isAndroid ? Math.max(10, insets.bottom) : 0;
  const supportsAndroidBoxShadow =
    isAndroid && typeof Platform.Version === 'number' && Platform.Version >= 28;
  const inactiveTabColor = !isAndroid
    ? isDark
      ? 'rgba(226, 232, 240, 0.92)'
      : '#1e293b'
    : colors.tabIconDefault;
  const inactiveTabOpacity = !isAndroid ? 0.82 : 0.6;

  const tabWidth = SCREEN_WIDTH / TAB_CONFIG.length;

  const normalizedPath = useMemo(() => normalizePath(pathname), [pathname]);

  // Find matching tab, including nested routes like /settings/profile.
  const activeTabIndex = useMemo(
    () =>
      TAB_CONFIG.findIndex((tab) => isTabPathMatch(normalizedPath, tab.path)),
    [normalizedPath]
  );

  // Track last visited tab (for detail screens where no tab matches).
  const lastActiveTabRef = useRef(0);
  if (activeTabIndex >= 0) {
    lastActiveTabRef.current = activeTabIndex;
  }

  const displayTabIndex =
    activeTabIndex >= 0 ? activeTabIndex : lastActiveTabRef.current;

  const bubbleX = useSharedValue(displayTabIndex * tabWidth);
  const bubbleScale = useSharedValue(1);
  const activeTabConfig = TAB_CONFIG[Math.max(0, displayTabIndex)];
  const activeColor = activeTabConfig.color;
  const activeBgColor = activeTabConfig.backgroundColor;

  // Keep tab motion lightweight and deterministic.
  useEffect(() => {
    const targetX = displayTabIndex * tabWidth;

    if (isAndroidLowPerf) {
      bubbleX.value = targetX;
      bubbleScale.value = 1;
      return;
    }

    bubbleX.value = withTiming(targetX, {
      duration: isAndroid ? 130 : 190,
      easing: Easing.out(Easing.cubic),
    });

    if (!isAndroid && activeTabIndex >= 0) {
      bubbleScale.value = withSequence(
        withTiming(1.04, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 130, easing: Easing.out(Easing.quad) })
      );
    }
  }, [displayTabIndex, activeTabIndex, tabWidth, isAndroid]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value + (tabWidth - 72) / 2 },
      { scale: bubbleScale.value },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value + (tabWidth - 80) / 2 }],
  }));

  const handleTabPress = (tab: (typeof TAB_CONFIG)[0], tabIndex: number) => {
    if (!isAndroidLowPerf) {
      haptics.light();
    }

    const alreadyActive =
      activeTabIndex === tabIndex && isTabPathMatch(normalizedPath, tab.path);
    if (alreadyActive) {
      return;
    }

    if (isAndroidLowPerf) {
      bubbleX.value = tabIndex * tabWidth;
    }

    lastActiveTabRef.current = tabIndex;
    router.navigate(tab.href as any);
  };

  // Hide on auth screens (check after all hooks are called)
  const isAuthScreen = pathname?.startsWith('/auth/');
  if (isAuthScreen) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        bottom: tabBarBottomOffset,
        left: 0,
        right: 0,
        height: 90,
      }}
    >
      {/* Glass Background Layers */}
      {!useBlur ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isAndroidLowPerf
                ? isDark
                  ? 'rgba(15, 23, 42, 0.78)'
                  : 'rgba(255, 255, 255, 0.8)'
                : isDark
                  ? 'rgba(15, 23, 42, 0.95)'
                  : 'rgba(255, 255, 255, 0.95)',
            },
          ]}
        />
      ) : (
        <BlurView
          intensity={100}
          tint={isDark ? 'dark' : 'light'}
          experimentalBlurMethod={isAndroid ? 'dimezisBlurView' : undefined}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isAndroidLowPerf
              ? isDark
                ? 'rgba(17, 24, 39, 0.72)'
                : 'rgba(255, 255, 255, 0.76)'
              : glass.overlay,
            borderTopWidth: 1,
            borderTopColor: isAndroidLowPerf
              ? isDark
                ? 'rgba(148, 163, 184, 0.22)'
                : 'rgba(15, 23, 42, 0.08)'
              : glass.border,
          },
        ]}
      />

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingBottom: isAndroid ? 22 : 28,
          paddingTop: isAndroid ? 6 : 8,
          zIndex: 1000,
        }}
      >
        {!isAndroidLowPerf && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 8,
                left: 0,
                width: 80,
                height: 54,
                borderRadius: 27,
                backgroundColor: activeBgColor,
                opacity: 0.32,
                zIndex: 0,
              },
              haloStyle,
            ]}
          />
        )}

        {/* 🫧 Sliding Bubble Background */}
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 11,
              left: 0,
              width: 72,
              height: 48,
              borderRadius: 24,
              backgroundColor: activeBgColor,
              boxShadow:
                supportsAndroidBoxShadow && !isAndroidLowPerf
                  ? `0px 4px 10px 0px ${isDark ? 'rgba(0, 0, 0, 0.16)' : 'rgba(15, 23, 42, 0.11)'}`
                  : undefined,
              shadowColor: activeColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isAndroid
                ? supportsAndroidBoxShadow
                  ? 0
                  : isAndroidLowPerf
                    ? 0.12
                    : 0.09
                : 0.6,
              shadowRadius: isAndroid
                ? supportsAndroidBoxShadow
                  ? 0
                  : isAndroidLowPerf
                    ? 6
                    : 5
                : 12,
              elevation: Platform.select({
                android: supportsAndroidBoxShadow
                  ? 0
                  : isAndroidLowPerf
                    ? 4
                    : 3,
                default: 10,
              }),
              borderWidth: isAndroidLowPerf ? 1 : 0,
              borderColor: isAndroidLowPerf
                ? isDark
                  ? 'rgba(148, 163, 184, 0.25)'
                  : 'rgba(15, 23, 42, 0.08)'
                : 'transparent',
              zIndex: 0,
            },
            bubbleStyle,
          ]}
        />

        {/* Tab Icons */}
        {TAB_CONFIG.map((tab, index) => {
          const isActive = activeTabIndex === index;

          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab, index)}
              android_ripple={
                isAndroid
                  ? { color: 'rgba(255,255,255,0.08)', borderless: false }
                  : undefined
              }
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: isAndroid ? 0 : 4,
                minHeight: 48,
                zIndex: 10,
              }}
            >
              <View style={{ alignItems: 'center', gap: 6, zIndex: 10 }}>
                {/* Icon */}
                <FontAwesome5
                  name={tab.icon}
                  size={isAndroid ? 22 : isActive ? 25 : 23}
                  color={isActive ? tab.color : inactiveTabColor}
                  solid={isActive}
                  style={{
                    transform: [
                      {
                        translateY:
                          !isAndroid && !isAndroidLowPerf && isActive ? -1 : 0,
                      },
                    ],
                  }}
                />

                {/* Label */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: isActive ? tab.color : inactiveTabColor,
                    opacity: isActive ? 1 : inactiveTabOpacity,
                  }}
                >
                  {tab.title}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};
