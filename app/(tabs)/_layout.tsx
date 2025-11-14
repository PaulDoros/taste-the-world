import { Tabs } from "expo-router";

/**
 * Tab Layout Configuration
 * Uses PersistentTabBar for navigation (shows on all screens)
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          display: "none", // Hide default tab bar - we use PersistentTabBar instead
        },
      }}
    >
      {/* Home / Explore Countries Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
        }}
      />

      {/* Shopping List Tab */}
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: "Shopping",
        }}
      />

      {/* Pantry Tab */}
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
        }}
      />

      {/* History Tab */}
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
        }}
      />

      {/* Settings / Profile Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Tabs>
  );
}
