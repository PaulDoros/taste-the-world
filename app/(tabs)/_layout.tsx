import { Tabs } from 'expo-router';

/**
 * Tab Layout Configuration
 * Uses PersistentTabBar for navigation (defined in app/_layout.tsx)
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar, using PersistentTabBar instead
        // Tab transition animations
        animation: 'shift',
        transitionSpec: {
          animation: 'timing',
          config: {
            duration: 200,
          },
        },
      }}
    >
      {/* Home / Explore Countries Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
        }}
      />

      {/* Shopping List Tab */}
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Shopping',
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
