import React, { useEffect, useState } from "react";
import { View, Pressable, Text, Dimensions } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  runOnJS,
} from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { haptics } from "@/utils/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

/**
 * Tab Configuration
 */
const TAB_CONFIG = [
  {
    name: "index",
    title: "Explore",
    icon: "globe-americas",
    color: "#0ea5e9",
    backgroundColor: "rgba(14, 165, 233, 0.15)",
  },
  {
    name: "shopping-list",
    title: "Shopping",
    icon: "shopping-basket",
    color: "#10b981",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    name: "favorites",
    title: "Favorites",
    icon: "heart",
    color: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  {
    name: "settings",
    title: "Settings",
    icon: "user-circle",
    color: "#8b5cf6",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
  },
];

/**
 * Custom Animated Tab Bar with SLIDING BUBBLE! 🫧
 * The bubble moves from tab to tab instead of appearing/disappearing
 */
const CustomTabBar = ({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Calculate tab width (excluding hidden "two" tab)
  const visibleTabs = state.routes.filter((route) => route.name !== "two");
  const tabWidth = SCREEN_WIDTH / visibleTabs.length;

  // Animated values for sliding bubble
  const bubbleX = useSharedValue(state.index * tabWidth);
  const bubbleScale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);

  // Predictive animation - tracks where user is pressing
  const [predictedIndex, setPredictedIndex] = useState(state.index);

  // Get current tab color
  const [activeColor, setActiveColor] = useState(TAB_CONFIG[0].color);
  const [activeBgColor, setActiveBgColor] = useState(
    TAB_CONFIG[0].backgroundColor,
  );

  useEffect(() => {
    // Only update if prediction was wrong (navigation completed to different tab)
    if (predictedIndex !== state.index) {
      const activeRoute = state.routes[state.index];
      const tabIndex = TAB_CONFIG.findIndex(
        (tab) => tab.name === activeRoute.name,
      );

      if (tabIndex !== -1) {
        setActiveColor(TAB_CONFIG[tabIndex].color);
        setActiveBgColor(TAB_CONFIG[tabIndex].backgroundColor);
      }

      // Move bubble to correct position (if prediction was off)
      bubbleX.value = withSpring(state.index * tabWidth, {
        damping: 15,
        stiffness: 200,
        mass: 0.5,
      });
    }

    // Update predicted index to match reality
    setPredictedIndex(state.index);

    // 💫 Continuous pulse while active (always running)
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      ),
      -1,
      true,
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 }),
      ),
      -1,
      true,
    );
  }, [state.index, tabWidth]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value }, { scale: bubbleScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value }, { scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  // 🎯 Predictive tab press handler - Makes it feel INSTANT!
  const handlePredictivePress = (index: number, routeName: string) => {
    // 1. Haptic feedback IMMEDIATELY
    haptics.light();

    // 2. Update predicted index
    setPredictedIndex(index);

    // 3. Find tab config for color prediction
    const tabConfig = TAB_CONFIG.find((tab) => tab.name === routeName);
    if (tabConfig) {
      setActiveColor(tabConfig.color);
      setActiveBgColor(tabConfig.backgroundColor);
    }

    // 4. INSTANTLY move bubble to predicted position (no waiting!)
    bubbleX.value = withSpring(index * tabWidth, {
      damping: 15,
      stiffness: 200,
      mass: 0.5, // Lower mass = snappier
    });

    // 5. Bounce effect
    bubbleScale.value = withSequence(
      withSpring(1.15, { damping: 10, stiffness: 500 }),
      withSpring(1, { damping: 12, stiffness: 250 }),
    );
  };

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        height: 90,
        paddingBottom: 28,
        paddingTop: 8,
      }}
    >
      {/* 💫 Pulsing Outer Ring - Continuously animates */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 6,
            left: (tabWidth - 80) / 2,
            width: 80,
            height: 65,
            borderRadius: 28, // Rounded corners, not full circle
            backgroundColor: activeBgColor,
          },
          pulseStyle,
        ]}
      />

      {/* 🫧 Sliding Bubble Background - Moves between tabs! */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 10,
            left: (tabWidth - 72) / 2,
            width: 72,
            height: 55,
            borderRadius: 24, // Rounded corners, not full circle
            backgroundColor: activeBgColor,
            shadowColor: activeColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.5,
            shadowRadius: 12,
            elevation: 10,
          },
          bubbleStyle,
        ]}
      />

      {/* Tab Icons */}
      {state.routes.map((route, index) => {
        if (route.name === "two") return null;

        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const tabConfig = TAB_CONFIG.find((tab) => tab.name === route.name);
        if (!tabConfig) return null;

        const onPress = () => {
          // 🎯 PREDICT and animate BEFORE navigation!
          handlePredictivePress(index, route.name);

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 4,
              opacity: pressed ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            })}
          >
            <View style={{ alignItems: "center", gap: 6 }}>
              {/* Icon with bounce animation */}
              <View
                style={{
                  transform: [
                    { scale: isFocused ? 1.1 : 1 },
                    { translateY: isFocused ? -2 : 0 },
                  ],
                }}
              >
                <FontAwesome5
                  name={tabConfig.icon}
                  size={isFocused ? 26 : 22}
                  color={isFocused ? tabConfig.color : colors.tabIconDefault}
                  solid={isFocused}
                />
              </View>

              {/* Label */}
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isFocused ? "700" : "600",
                  color: isFocused ? tabConfig.color : colors.tabIconDefault,
                  opacity: isFocused ? 1 : 0.6,
                }}
              >
                {tabConfig.title}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

/**
 * Tab Layout Configuration
 * Uses custom sliding bubble tab bar
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Tab transition animations
        animation: "shift",
        transitionSpec: {
          animation: "timing",
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

      {/* Favorites Tab */}
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
        }}
      />

      {/* Settings / Profile Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />

      {/* Hide the old "two" screen */}
      <Tabs.Screen
        name="two"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
