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

const TAB_CONFIG = [
  {
    name: 'index',
    title: 'Home',
    icon: 'home',
    color: '#2563eb', // blue
    backgroundColor: 'rgba(37, 99, 235, 0.15)',
  },
  {
    name: 'explore',
    title: 'Explore',
    icon: 'globe-americas',
    color: '#16a34a', // green
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
  },
  {
    name: 'chef',
    title: 'AI Chat',
    icon: 'robot',
    color: '#f97316', // orange
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  {
    name: 'more',
    title: 'More',
    icon: 'th-large',
    color: '#db2777', // pink
    backgroundColor: 'rgba(219, 39, 119, 0.15)',
  },
  {
    name: 'settings',
    title: 'Settings',
    icon: 'user-circle',
    color: '#7c3aed', // violet
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
  },
];

const PersistentTabBarComponent = ({
  state,
  navigation,
}: BottomTabBarProps) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[colorScheme ?? 'light'];
  const [barWidth, setBarWidth] = useState(0);

  const inactiveTabColor = colors.tabIconDefault;
  const inactiveTabOpacity = 0.6;
  const bubbleElevation = 0;

  const tabWidth = barWidth > 0 ? barWidth / TAB_CONFIG.length : 0;
  const activeRouteName = state.routes[state.index]?.name;
  const activeTabIndex = useMemo(
    () => TAB_CONFIG.findIndex((tab) => tab.name === activeRouteName),
    [activeRouteName]
  );

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
  const androidHaloRestOpacity = 0.27;
  const haloOpacity = useSharedValue(androidHaloRestOpacity);

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
    androidTabSwitchLockRef.current = false;
    if (androidTabSwitchTimerRef.current) {
      clearTimeout(androidTabSwitchTimerRef.current);
      androidTabSwitchTimerRef.current = null;
    }
  }, [activeTabIndex]);

  useEffect(() => {
    return () => {
      if (androidTabSwitchTimerRef.current) {
        clearTimeout(androidTabSwitchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (tabWidth <= 0) {
      return;
    }

    const targetX = displayTabIndex * tabWidth;

    bubbleX.value = withTiming(targetX, {
      duration: 190,
      easing: Easing.out(Easing.cubic),
    });

    if (activeTabIndex >= 0) {
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
  }, [displayTabIndex, activeTabIndex, tabWidth, androidHaloRestOpacity]);

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

  const handleTabPress = (tab: (typeof TAB_CONFIG)[0], tabIndex: number) => {
    const alreadyActive = activeTabIndex === tabIndex;
    if (alreadyActive) {
      return;
    }

    if (androidTabSwitchLockRef.current) {
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

    androidTabSwitchLockRef.current = true;
    if (androidTabSwitchTimerRef.current) {
      clearTimeout(androidTabSwitchTimerRef.current);
    }
    androidTabSwitchTimerRef.current = setTimeout(() => {
      androidTabSwitchLockRef.current = false;
      androidTabSwitchTimerRef.current = null;
    }, 260);

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
        height: 120, // Taller on Android typically for gesture nav clearance
        elevation: 8,
      }}
    >
      {/* Background Layers */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark
              ? 'rgba(15, 23, 42, 0.98)'
              : 'rgba(255, 255, 255, 0.98)',
            borderTopWidth: 1,
            borderTopColor: isDark
              ? 'rgba(148, 163, 184, 0.22)'
              : 'rgba(15, 23, 42, 0.08)',
          },
        ]}
      />

      {/* Content Container */}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          paddingBottom: 22,
          paddingTop: 6,
          zIndex: 1000,
        }}
      >
        {/* Sliding Bubble Background */}
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
                height: 59,
                borderRadius: 20,
                backgroundColor: bubbleTopSheenColor,
                opacity: 0.42,
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

                paddingTop: 6,
                minHeight: 48,
                zIndex: 10,
              }}
            >
              <View style={{ alignItems: 'center', gap: 6, zIndex: 10 }}>
                {/* Icon */}
                <FontAwesome5
                  name={tab.icon}
                  size={22}
                  color={isActive ? tab.color : inactiveTabColor}
                  solid={isActive}
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
