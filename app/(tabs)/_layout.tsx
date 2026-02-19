import React, { useCallback } from 'react';
import { Tabs } from 'expo-router';
import { PersistentTabBar } from '@/components/PersistentTabBar';
import { FontAwesome5 } from '@expo/vector-icons';
import { Platform } from 'react-native';

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
  const renderTabBar = useCallback(() => <PersistentTabBar />, []);

  return (
    <Tabs
      tabBar={renderTabBar}
      detachInactiveScreens={true}
      screenOptions={{
        headerShown: false,
        // Tabs are usually smoothest on Android without screen animation.
        animation: Platform.OS === 'android' ? 'none' : 'fade',
        lazy: true,
        // Freeze inactive Android tabs to cut background re-renders.
        freezeOnBlur: Platform.OS === 'android',
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
          lazy: Platform.OS === 'ios' ? false : true,
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
