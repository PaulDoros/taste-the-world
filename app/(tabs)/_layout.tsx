import { Tabs } from 'expo-router';
import { PersistentTabBar } from '@/components/PersistentTabBar';
import { FontAwesome5 } from '@expo/vector-icons';

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
  return (
    <Tabs
      tabBar={() => <PersistentTabBar />}
      screenOptions={{
        headerShown: false,
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

      {/* Shopping List Tab */}
      <Tabs.Screen
        name="shopping-list"
        options={{
          title: 'Pantry',
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
