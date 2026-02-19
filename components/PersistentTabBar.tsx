import React, { useEffect, useState } from 'react';
import {
  View,
  Pressable,
  Text,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter, usePathname, useSegments } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';
import { playSound } from '@/utils/sounds';
import { BlurView } from 'expo-blur';
import { glassTokens } from '@/theme/colors';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Tab Configuration - 5 Primary Tabs
 */
const TAB_CONFIG = [
  {
    name: 'index',
    path: '/(tabs)/',
    title: 'Home',
    icon: 'home',
    color: '#0ea5e9',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  {
    name: 'explore',
    path: '/(tabs)/explore',
    title: 'Explore',
    icon: 'globe-americas',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    name: 'AI Chat',
    path: '/(tabs)/chef',
    title: 'AI Chat',
    icon: 'robot',
    color: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  {
    name: 'more',
    path: '/(tabs)/more',
    title: 'More',
    icon: 'th-large',
    color: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  {
    name: 'settings',
    path: '/(tabs)/settings',
    title: 'Settings',
    icon: 'user-circle',
    color: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
  },
];

/**
 * Persistent Tab Bar Component
 * Shows on all screens for easy navigation
 */
export const PersistentTabBar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const glass = glassTokens[isDark ? 'dark' : 'light'];
  const { width: SCREEN_WIDTH } = useWindowDimensions(); // Dynamic width that updates on resize/rotation
  const insets = useSafeAreaInsets();

  const tabWidth = SCREEN_WIDTH / TAB_CONFIG.length;

  // Find active tab based on current path
  const getActiveTabIndex = () => {
    // Check if we're on a tab screen
    if (pathname?.startsWith('/(tabs)/')) {
      // Handle index route - could be "/(tabs)/" or "/(tabs)/index"
      const pathParts = pathname.split('/').filter(Boolean);
      const tabName = pathParts[pathParts.length - 1] || 'index';

      // Special case: if pathname is exactly "/(tabs)" or "/(tabs)/", it's the index tab
      if (tabName === '' || tabName === '(tabs)' || tabName === 'index') {
        return 0; // index tab
      }

      const index = TAB_CONFIG.findIndex((tab) => tab.name === tabName);
      return index >= 0 ? index : 0;
    }
    // If on country/recipe details, return -1 (no active tab, but show bar)
    return -1;
  };

  // Show on all screens now (replaces CustomTabBar)
  const activeTabIndex = getActiveTabIndex();

  // Track last visited tab (for showing bubble on detail screens)
  const [lastActiveTabIndex, setLastActiveTabIndex] = useState(0);

  // Determine which tab index to use (active tab or last visited)
  const displayTabIndex =
    activeTabIndex >= 0 ? activeTabIndex : lastActiveTabIndex;

  // Animated values for sliding bubble
  const bubbleX = useSharedValue(displayTabIndex * tabWidth);
  const bubbleScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  // Get current tab color
  const [activeColor, setActiveColor] = useState(TAB_CONFIG[0].color);
  const [activeBgColor, setActiveBgColor] = useState(
    TAB_CONFIG[0].backgroundColor
  );

  // Initialize pulse animations once on mount
  useEffect(() => {
    // 💫 Continuous pulse while active (only initialize once)
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      true
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );

    // Set initial bubble position on mount
    const initialActiveTabIndex = getActiveTabIndex();
    const initialDisplayIndex =
      initialActiveTabIndex >= 0 ? initialActiveTabIndex : 0;
    bubbleX.value = initialDisplayIndex * tabWidth;
  }, []); // Empty dependency array - only run once

  // Handle tab changes and bubble movement
  useEffect(() => {
    // Recalculate activeTabIndex inside useEffect to ensure it's fresh
    const currentActiveTabIndex = getActiveTabIndex();

    // Update last visited tab when on a tab screen
    if (currentActiveTabIndex >= 0) {
      setLastActiveTabIndex(currentActiveTabIndex);
    }

    // Recalculate display index (active tab or last visited)
    const currentDisplayIndex =
      currentActiveTabIndex >= 0 ? currentActiveTabIndex : lastActiveTabIndex;
    const tabConfig = TAB_CONFIG[currentDisplayIndex];
    setActiveColor(tabConfig.color);
    setActiveBgColor(tabConfig.backgroundColor);

    // 🎯 SLIDE bubble to tab position with bounce!
    bubbleX.value = withSpring(currentDisplayIndex * tabWidth, {
      damping: 15,
      stiffness: 200,
      mass: 0.5,
    });

    // 💥 Bounce effect on tap (only on tab screens)
    if (currentActiveTabIndex >= 0) {
      bubbleScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [pathname, lastActiveTabIndex, tabWidth]); // Use pathname instead of activeTabIndex

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value + (tabWidth - 72) / 2 },
      { scale: bubbleScale.value },
    ],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value + (tabWidth - 80) / 2 },
      { scale: pulseScale.value },
    ],
    opacity: pulseOpacity.value,
  }));

  const handleTabPress = (tab: (typeof TAB_CONFIG)[0]) => {
    haptics.light();

    // Find the tab index
    const tabIndex = TAB_CONFIG.findIndex((t) => t.name === tab.name);
    if (tabIndex >= 0) {
      // 🎯 PREDICTIVE animation - move bubble immediately before navigation!
      bubbleX.value = withSpring(tabIndex * tabWidth, {
        damping: 8,
        stiffness: 200,
        mass: 0.5,
      });

      // Update colors immediately
      setActiveColor(tab.color);
      setActiveBgColor(tab.backgroundColor);

      // Bounce effect
      bubbleScale.value = withSequence(
        withSpring(1.2, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Update last visited tab
      setLastActiveTabIndex(tabIndex);
    }

    // Navigate
    router.push(tab.path as any);
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
        bottom: 0,
        left: 0,
        right: 0,
        height: 80 + insets.bottom, // Dynamic height: base height + safe area
        paddingBottom: insets.bottom, // Push content up
      }}
    >
      {/* Glass Background Layers */}
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={100}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: isDark ? '#0f172a' : '#ffffff', // Solid background for Android nav
              borderTopWidth: 1,
              borderTopColor: glass.border,
            },
          ]}
        />
      )}

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingBottom: 28,
          paddingTop: 8,
          zIndex: 1000,
        }}
      >
        {/* 💫 Pulsing Outer Ring */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 8,
              left: 0,
              width: 80,
              height: 54,
              borderRadius: 27,
              backgroundColor: activeBgColor,
              zIndex: 0,
            },
            pulseStyle,
          ]}
        />

        {/* 🫧 Sliding Bubble Background */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 11,
              left: 0,
              width: 72,
              height: 48,
              borderRadius: 24,
              backgroundColor: activeBgColor,
              shadowColor: activeColor,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.5,
              shadowRadius: 12,
              elevation: Platform.select({ android: 4, default: 10 }), // Reduced elevation for Android to avoid harsh black shadow
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
              onPress={() => handleTabPress(tab)}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                paddingTop: 4,
                zIndex: 10,
              }}
            >
              <View style={{ alignItems: 'center', gap: 6, zIndex: 10 }}>
                {/* Icon */}
                <FontAwesome5
                  name={tab.icon}
                  size={isActive ? 26 : 22}
                  color={isActive ? tab.color : colors.tabIconDefault}
                  solid={isActive}
                  style={{
                    transform: [{ translateY: isActive ? -2 : 0 }],
                  }}
                />

                {/* Label */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: isActive ? '700' : '600',
                    color: isActive ? tab.color : colors.tabIconDefault,
                    opacity: isActive ? 1 : 0.6,
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
