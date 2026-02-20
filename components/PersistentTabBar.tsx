import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Pressable,
  Text,
  Platform,
  StyleSheet,
  LayoutChangeEvent,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
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
    title: 'Home',
    icon: 'home',
    color: '#0ea5e9',
    backgroundColor: 'rgba(14, 165, 233, 0.15)',
  },
  {
    name: 'explore',
    title: 'Explore',
    icon: 'globe-americas',
    color: '#10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  {
    name: 'chef',
    title: 'AI Chat',
    icon: 'robot',
    color: '#14b8a6',
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
  },
  {
    name: 'more',
    title: 'More',
    icon: 'th-large',
    color: '#a855f7',
    backgroundColor: 'rgba(168, 85, 247, 0.15)',
  },
  {
    name: 'settings',
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
const PersistentTabBarComponent = ({
  state,
  navigation,
}: BottomTabBarProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isAndroid = Platform.OS === 'android';
  const useBlur = Platform.OS === 'ios' && shouldUseGlassBlur;
  const colors = Colors[colorScheme ?? 'light'];
  const glass = glassTokens[isDark ? 'dark' : 'light'];
  const [barWidth, setBarWidth] = useState(0);
  const inactiveTabColor = !isAndroid
    ? isDark
      ? 'rgba(226, 232, 240, 0.92)'
      : '#1e293b'
    : colors.tabIconDefault;
  const inactiveTabOpacity = !isAndroid ? 0.82 : 0.6;
  const bubbleElevation = Platform.OS === 'android' ? 0 : 20;

  const tabWidth = barWidth > 0 ? barWidth / TAB_CONFIG.length : 0;
  const activeRouteName = state.routes[state.index]?.name;
  const activeTabIndex = useMemo(
    () => TAB_CONFIG.findIndex((tab) => tab.name === activeRouteName),
    [activeRouteName]
  );

  // Track last visited tab (for detail screens where no tab matches).
  const lastActiveTabRef = useRef(0);
  const androidTabSwitchLockRef = useRef(false);
  const androidTabSwitchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  if (activeTabIndex >= 0) {
    lastActiveTabRef.current = activeTabIndex;
  }

  const displayTabIndex =
    activeTabIndex >= 0 ? activeTabIndex : lastActiveTabRef.current;

  const bubbleX = useSharedValue(0);
  const bubbleScale = useSharedValue(1);
  const activeTabConfig = TAB_CONFIG[Math.max(0, displayTabIndex)];
  const activeColor = activeTabConfig.color;
  const activeBgColor = activeTabConfig.backgroundColor;
  const androidHaloRestOpacity = isAndroidLowPerf ? 0.2 : 0.27;
  const haloOpacity = useSharedValue(isAndroid ? androidHaloRestOpacity : 0.3);
  const bubbleBorderColor = isDark
    ? 'rgba(148, 163, 184, 0.24)'
    : 'rgba(15, 23, 42, 0.09)';
  const bubbleTopSheenColor = isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(255, 255, 255, 0.34)';
  const bubbleInnerLayerColor = isDark
    ? 'rgba(15, 23, 42, 0.08)'
    : 'rgba(255, 255, 255, 0.18)';

  const handleBarLayout = useCallback((event: LayoutChangeEvent) => {
    const nextWidth = Math.round(event.nativeEvent.layout.width);
    if (nextWidth <= 0) return;
    setBarWidth((prev) => {
      if (prev === 0 || Math.abs(prev - nextWidth) > 24) {
        return nextWidth;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    if (!isAndroid) {
      return;
    }
    androidTabSwitchLockRef.current = false;
    if (androidTabSwitchTimerRef.current) {
      clearTimeout(androidTabSwitchTimerRef.current);
      androidTabSwitchTimerRef.current = null;
    }
  }, [activeTabIndex, isAndroid]);

  useEffect(() => {
    return () => {
      if (androidTabSwitchTimerRef.current) {
        clearTimeout(androidTabSwitchTimerRef.current);
      }
    };
  }, []);

  // Keep tab motion lightweight and deterministic.
  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }

    const targetX = displayTabIndex * tabWidth;

    if (isAndroid) {
      bubbleX.value = targetX;
      bubbleScale.value = 1;
      haloOpacity.value = androidHaloRestOpacity;
      return;
    }

    bubbleX.value = withTiming(targetX, {
      duration: 190,
      easing: Easing.out(Easing.cubic),
    });

    if (activeTabIndex >= 0 && !isAndroid) {
      bubbleScale.value = withSequence(
        withTiming(1.04, { duration: 90, easing: Easing.out(Easing.quad) }),
        withTiming(1, {
          duration: 130,
          easing: Easing.out(Easing.quad),
        })
      );
    }

    haloOpacity.value = withSequence(
      withTiming(0.36, {
        duration: 140,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(0.3, {
        duration: 230,
        easing: Easing.out(Easing.quad),
      })
    );
  }, [
    displayTabIndex,
    activeTabIndex,
    tabWidth,
    isAndroid,
    androidHaloRestOpacity,
  ]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: bubbleX.value + (tabWidth - 72) / 2 },
      { scale: bubbleScale.value },
    ],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value + (tabWidth - 80) / 2 }],
    opacity: haloOpacity.value,
  }));
  const shouldRenderHalo = !isAndroid && !isAndroidLowPerf && tabWidth > 0;

  const handleTabPress = (tab: (typeof TAB_CONFIG)[0], tabIndex: number) => {
    if (!isAndroidLowPerf && !isAndroid) {
      haptics.light();
    }

    const alreadyActive = activeTabIndex === tabIndex;
    if (alreadyActive) {
      return;
    }

    if (isAndroid && androidTabSwitchLockRef.current) {
      return;
    }

    const targetRoute = state.routes.find((route) => route.name === tab.name);
    const tabPressEvent = navigation.emit({
      type: 'tabPress',
      target: targetRoute?.key,
      canPreventDefault: true,
    });
    if (tabPressEvent.defaultPrevented) {
      return;
    }

    if (isAndroid) {
      androidTabSwitchLockRef.current = true;
      if (androidTabSwitchTimerRef.current) {
        clearTimeout(androidTabSwitchTimerRef.current);
      }
      // Fallback unlock in case route events are delayed.
      androidTabSwitchTimerRef.current = setTimeout(() => {
        androidTabSwitchLockRef.current = false;
        androidTabSwitchTimerRef.current = null;
      }, 260);
    }

    lastActiveTabRef.current = tabIndex;
    navigation.navigate(tab.name);
  };

  return (
    <View
      onLayout={handleBarLayout}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: isAndroid ? 120 : 90,
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
        {shouldRenderHalo && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 5,
                left: 0,
                width: 80,
                height: 64,
                borderRadius: 29,
                backgroundColor: activeBgColor,
                zIndex: 0,
              },
              haloStyle,
            ]}
          />
        )}

        {/* 🫧 Sliding Bubble Background */}
        {tabWidth > 0 && (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: 4,
                left: 0,
                width: 72,
                height: 64,
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: activeBgColor,
                shadowColor: activeColor,
                shadowOffset: { width: 0, height: 6 },
                elevation: bubbleElevation,
                shadowOpacity: Platform.OS === 'ios' ? 0.6 : 0,
                shadowRadius: Platform.OS === 'ios' ? 12 : 0,
                borderWidth: 1,
                borderColor: bubbleBorderColor,
                zIndex: 0,
              },
              bubbleStyle,
            ]}
          >
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 1,
                left: 1,
                right: 1,
                height: 28,
                borderRadius: 58,
                backgroundColor: bubbleTopSheenColor,
                opacity: isAndroid ? 0.42 : 0.34,
              }}
            />
            <View
              pointerEvents="none"
              style={{
                ...StyleSheet.absoluteFillObject,
                borderRadius: 24,
                backgroundColor: bubbleInnerLayerColor,
                opacity: 0.22,
              }}
            />
          </Animated.View>
        )}

        {/* Tab Icons */}
        {TAB_CONFIG.map((tab, index) => {
          const isActive = activeTabIndex === index;

          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab, index)}
              android_ripple={undefined}
              style={{
                flex: 1,
                alignItems: 'center',

                paddingTop: isAndroid ? 6 : 4,
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

export const PersistentTabBar = React.memo(PersistentTabBarComponent);
PersistentTabBar.displayName = 'PersistentTabBar';
