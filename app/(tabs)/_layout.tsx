import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { PersistentTabBar } from '@/components/PersistentTabBar';
import { FontAwesome5 } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { IS_ANDROID, IS_IOS } from '@/constants/platform';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome5>['name'];
  color: string;
}) {
  return <FontAwesome5 size={20} style={{ marginBottom: -3 }} {...props} />;
}

/**
 * Tab Layout Configuration
 * Uses PersistentTabBar for navigation (defined in app/_layout.tsx)
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const renderTabBar = useCallback(
    (props: BottomTabBarProps) => <PersistentTabBar {...props} />,
    []
  );

  return (
    <Tabs
      tabBar={renderTabBar}
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        // Using default navigation animations to prevent cross-fade ghosting of frozen screens
        // Keep Android lazy to avoid mounting all tabs at once.
        lazy: true,
        // Freeze inactive Android tabs to cut background JS/UI work.
        freezeOnBlur: IS_ANDROID ? true : undefined,
        sceneStyle: {
          backgroundColor: colors.background,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          lazy: IS_IOS ? false : undefined,
        }}
      />

      {/* Map Tab */}
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="map-marked-alt" color={color} />
          ),
        }}
      />

      {/* Chef Tab */}
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Planner',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="calendar-alt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chef"
        options={{
          title: 'AI Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="robot" color={color} />,
        }}
      />

      {/* Shopping List Tab */}
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'List',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="shopping-basket" color={color} />
          ),
        }}
      />

      {/* Pantry Tab */}
      <Tabs.Screen
        name="pantry"
        options={{
          title: 'Pantry',
        }}
      />

      {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
        }}
      />

      {/* More Tab - Hub for secondary features */}
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
        }}
      />

      {/* Settings / Profile Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
