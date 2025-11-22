import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { usePremium } from "@/hooks/usePremium";
import {
  SUBSCRIPTION_PRICES,
  PREMIUM_BENEFITS,
  FEATURED_PREMIUM_COUNTRIES,
} from "@/constants/Config";
import { haptics } from "@/utils/haptics";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  rightElement?: React.ReactNode;
  colors: typeof Colors.light;
  delay?: number;
  premium?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  subtitle,
  onPress,
  rightElement,
  colors,
  delay = 0,
  premium = false,
}: SettingsItemProps) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    opacity.value = withSpring(0.7, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    opacity.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animatedStyle,
          {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: premium ? colors.premium : colors.tint,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            opacity: premium ? 0.2 : 0.15,
          }}
        >
          <FontAwesome5
            name={icon}
            size={18}
            color={premium ? colors.premium : colors.tint}
            solid
          />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "600",
                flex: 1,
              }}
            >
              {title}
            </Text>
            {premium && (
              <View
                style={{
                  backgroundColor: colors.premium,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 10,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  Premium
                </Text>
              </View>
            )}
          </View>
          {subtitle && (
            <Text
              style={{
                color: colors.text,
                fontSize: 13,
                opacity: 0.6,
                marginTop: 2,
              }}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement || (
          <FontAwesome5
            name="chevron-right"
            size={14}
            color={colors.text}
            style={{ opacity: 0.4 }}
          />
        )}
      </AnimatedPressable>
    </Animated.View>
  );
};

interface SubscriptionCardProps {
  type: "monthly" | "yearly";
  price: number;
  savings?: string;
  isSelected: boolean;
  onSelect: () => void;
  colors: typeof Colors.light;
  delay?: number;
}

const SubscriptionCard = ({
  type,
  price,
  savings,
  isSelected,
  onSelect,
  colors,
  delay = 0,
}: SubscriptionCardProps) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <AnimatedPressable
        onPress={onSelect}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          animatedStyle,
          {
            flex: 1,
            backgroundColor: isSelected ? colors.premium : colors.card,
            padding: 20,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: isSelected ? colors.premium : colors.border,
            alignItems: "center",
          },
        ]}
      >
        {savings && (
          <View
            style={{
              position: "absolute",
              top: -10,
              backgroundColor: colors.success,
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {savings}
            </Text>
          </View>
        )}
        <Text
          style={{
            color: isSelected ? "white" : colors.text,
            fontSize: 14,
            fontWeight: "600",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          {type === "monthly" ? "Monthly" : "Yearly"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text
            style={{
              color: isSelected ? "white" : colors.text,
              fontSize: 32,
              fontWeight: "700",
            }}
          >
            ${price}
          </Text>
          <Text
            style={{
              color: isSelected ? "white" : colors.text,
              fontSize: 16,
              opacity: 0.7,
              marginLeft: 4,
            }}
          >
            /{type === "monthly" ? "mo" : "yr"}
          </Text>
        </View>
        {isSelected && (
          <View
            style={{
              marginTop: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FontAwesome5 name="check-circle" size={16} color="white" solid />
            <Text
              style={{
                color: "white",
                fontSize: 12,
                fontWeight: "600",
              }}
            >
              Selected
            </Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { subscriptionType, isPremium, setSubscription, cancelSubscription } =
    usePremium();
  const { user, isAuthenticated, signOut } = useAuth();

  const [selectedSubscription, setSelectedSubscription] = useState<
    "monthly" | "yearly"
  >(subscriptionType === "yearly" ? "yearly" : "monthly");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleUpgrade = () => {
    haptics.light();
    setSubscription(selectedSubscription);
    Alert.alert(
      "🎉 Welcome to Premium!",
      `You've successfully upgraded to ${selectedSubscription === "monthly" ? "Monthly" : "Yearly"} Premium. Enjoy unlimited access to all features!`,
      [{ text: "Awesome!", onPress: () => haptics.success() }]
    );
  };

  const handleCancelSubscription = () => {
    haptics.light();
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your premium subscription? You'll lose access to premium features at the end of your billing period.",
      [
        { text: "Keep Premium", style: "cancel" },
        {
          text: "Cancel",
          style: "destructive",
          onPress: () => {
            cancelSubscription();
            haptics.success();
          },
        },
      ]
    );
  };

  const handleManageAccount = () => {
    haptics.light();
    if (!isAuthenticated) {
      router.push("/auth/login");
    } else {
      Alert.alert("Account Management", "Account management features coming soon!");
    }
  };

  const handleLogin = () => {
    haptics.light();
    router.push("/auth/login");
  };

  const handleSignOut = () => {
    haptics.light();
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await signOut();
            haptics.success();
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    haptics.light();
    Alert.alert(
      "Taste the World",
      "Version 1.0.0\n\nExplore cuisines from around the globe and discover amazing recipes from 195+ countries!\n\nMade with ❤️ for food lovers worldwide."
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 90 + insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.springify()}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: colors.tint,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 16,
                opacity: 0.15,
              }}
            >
              <FontAwesome5
                name="user-circle"
                size={28}
                color={colors.tint}
                solid
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 24,
                  fontWeight: "700",
                  marginBottom: 4,
                }}
              >
                Settings
              </Text>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  opacity: 0.6,
                }}
              >
                {isAuthenticated
                  ? user?.name || user?.email || "Signed In"
                  : "Not Signed In"}
              </Text>
            </View>
            {isPremium && (
              <View
                style={{
                  backgroundColor: colors.premium,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 12,
                    fontWeight: "700",
                    textTransform: "uppercase",
                  }}
                >
                  Premium
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* Authentication Section */}
        {!isAuthenticated ? (
          <Animated.View entering={FadeInUp.delay(50).springify()}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: colors.tint,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FontAwesome5
                  name="user-circle"
                  size={24}
                  color={colors.tint}
                  solid
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "700",
                    flex: 1,
                  }}
                >
                  Sign In to Sync Your Data
                </Text>
              </View>
              <Text
                style={{
                  color: colors.tabIconDefault,
                  fontSize: 14,
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                Sign in to save your favorite recipes, shopping lists, and
                access your data across all devices.
              </Text>
              <Pressable
                onPress={handleLogin}
                style={({ pressed }) => ({
                  backgroundColor: colors.tint,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 16,
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInUp.delay(50).springify()}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: colors.tint + "20",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <FontAwesome5
                    name="user"
                    size={20}
                    color={colors.tint}
                    solid
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}
                  >
                    {user?.name || "User"}
                  </Text>
                  <Text
                    style={{
                      color: colors.tabIconDefault,
                      fontSize: 14,
                    }}
                  >
                    {user?.email}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => ({
                  backgroundColor: colors.error + "15",
                  paddingVertical: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                  marginTop: 8,
                })}
              >
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Premium Upgrade Section */}
        {!isPremium && (
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <View
              style={{
                backgroundColor: colors.premium,
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative background elements */}
              <View
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  backgroundColor: "white",
                  opacity: 0.1,
                }}
              />
              <View
                style={{
                  position: "absolute",
                  bottom: -30,
                  left: -30,
                  width: 150,
                  height: 150,
                  borderRadius: 75,
                  backgroundColor: "white",
                  opacity: 0.1,
                }}
              />

              <View style={{ position: "relative", zIndex: 1 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <FontAwesome5
                    name="crown"
                    size={24}
                    color="white"
                    solid
                    style={{ marginRight: 12 }}
                  />
                  <Text
                    style={{
                      color: "white",
                      fontSize: 22,
                      fontWeight: "700",
                      flex: 1,
                    }}
                  >
                    Upgrade to Premium
                  </Text>
                </View>

                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    opacity: 0.9,
                    marginBottom: 20,
                    lineHeight: 20,
                  }}
                >
                  Unlock all 195+ countries, unlimited recipes, advanced
                  filters, and much more!
                </Text>

                {/* Subscription Options */}
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <SubscriptionCard
                    type="monthly"
                    price={SUBSCRIPTION_PRICES.monthly}
                    isSelected={selectedSubscription === "monthly"}
                    onSelect={() => {
                      haptics.light();
                      setSelectedSubscription("monthly");
                    }}
                    colors={colors}
                    delay={200}
                  />
                  <SubscriptionCard
                    type="yearly"
                    price={SUBSCRIPTION_PRICES.yearly}
                    savings={SUBSCRIPTION_PRICES.yearlySavings}
                    isSelected={selectedSubscription === "yearly"}
                    onSelect={() => {
                      haptics.light();
                      setSelectedSubscription("yearly");
                    }}
                    colors={colors}
                    delay={300}
                  />
                </View>

                {/* Premium Benefits */}
                <View style={{ marginBottom: 20 }}>
                  <Text
                    style={{
                      color: "white",
                      fontSize: 14,
                      fontWeight: "600",
                      marginBottom: 12,
                    }}
                  >
                    What you'll get:
                  </Text>
                  {PREMIUM_BENEFITS.slice(0, 5).map((benefit, index) => (
                    <View
                      key={index}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <FontAwesome5
                        name="check-circle"
                        size={14}
                        color="white"
                        solid
                        style={{ marginRight: 10, opacity: 0.9 }}
                      />
                      <Text
                        style={{
                          color: "white",
                          fontSize: 13,
                          opacity: 0.9,
                          flex: 1,
                        }}
                      >
                        {benefit}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Upgrade Button */}
                <Pressable
                  onPress={handleUpgrade}
                  style={({ pressed }) => ({
                    backgroundColor: "white",
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: colors.premium,
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    Upgrade Now
                  </Text>
                </Pressable>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Premium Status (if subscribed) */}
        {isPremium && (
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: colors.premium,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <FontAwesome5
                  name="crown"
                  size={20}
                  color={colors.premium}
                  solid
                  style={{ marginRight: 12 }}
                />
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "700",
                    flex: 1,
                  }}
                >
                  Premium Active
                </Text>
              </View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 14,
                  opacity: 0.7,
                  marginBottom: 16,
                }}
              >
                {subscriptionType === "monthly"
                  ? "Monthly subscription"
                  : "Yearly subscription"}
              </Text>
              <Pressable
                onPress={handleCancelSubscription}
                style={({ pressed }) => ({
                  backgroundColor: colors.error,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Cancel Subscription
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {/* Account Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 12,
              marginTop: 8,
            }}
          >
            Account
          </Text>
          {isAuthenticated ? (
            <SettingsItem
              icon="user"
              title="Manage Account"
              subtitle={user?.email || "Profile, preferences, and settings"}
              onPress={handleManageAccount}
              colors={colors}
              delay={250}
            />
          ) : (
            <SettingsItem
              icon="sign-in-alt"
              title="Sign In"
              subtitle="Sign in to sync your data"
              onPress={handleLogin}
              colors={colors}
              delay={250}
            />
          )}
          <SettingsItem
            icon="bell"
            title="Notifications"
            subtitle="Recipe reminders and updates"
            onPress={() => {
              haptics.light();
              setNotificationsEnabled(!notificationsEnabled);
            }}
            colors={colors}
            delay={300}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{
                  false: colors.border,
                  true: colors.tint,
                }}
                thumbColor="white"
              />
            }
          />
        </Animated.View>

        {/* Premium Features Section */}
        {isPremium && (
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text
              style={{
                color: colors.text,
                fontSize: 18,
                fontWeight: "700",
                marginBottom: 12,
                marginTop: 8,
              }}
            >
              Premium Features
            </Text>
            <SettingsItem
              icon="globe"
              title="All Countries"
              subtitle={`Access to ${FEATURED_PREMIUM_COUNTRIES.length}+ premium countries`}
              onPress={() => {
                haptics.light();
                Alert.alert(
                  "Premium Countries",
                  `You have access to all countries including:\n\n${FEATURED_PREMIUM_COUNTRIES.slice(0, 5).join(", ")}... and more!`
                );
              }}
              colors={colors}
              delay={450}
              premium
            />
            <SettingsItem
              icon="filter"
              title="Advanced Filters"
              subtitle="Vegetarian, vegan, difficulty, and more"
              onPress={() => {
                haptics.light();
                Alert.alert(
                  "Advanced Filters",
                  "Use advanced filters to find recipes that match your dietary preferences and skill level!"
                );
              }}
              colors={colors}
              delay={500}
              premium
            />
            <SettingsItem
              icon="download"
              title="Offline Mode"
              subtitle="Download recipes for offline access"
              onPress={() => {
                haptics.light();
                Alert.alert(
                  "Offline Mode",
                  "Download your favorite recipes to access them even without an internet connection!"
                );
              }}
              colors={colors}
              delay={550}
              premium
            />
          </Animated.View>
        )}

        {/* App Section */}
        <Animated.View entering={FadeInDown.delay(600).springify()}>
          <Text
            style={{
              color: colors.text,
              fontSize: 18,
              fontWeight: "700",
              marginBottom: 12,
              marginTop: 8,
            }}
          >
            App
          </Text>
          <SettingsItem
            icon="info-circle"
            title="About"
            subtitle="Version, credits, and more"
            onPress={handleAbout}
            colors={colors}
            delay={650}
          />
          <SettingsItem
            icon="star"
            title="Rate App"
            subtitle="Love the app? Leave a review!"
            onPress={() => {
              haptics.light();
              Alert.alert(
                "Rate App",
                "Thank you for your interest! Rating feature coming soon."
              );
            }}
            colors={colors}
            delay={700}
          />
          <SettingsItem
            icon="share-alt"
            title="Share App"
            subtitle="Tell your friends about Taste the World"
            onPress={() => {
              haptics.light();
              Alert.alert(
                "Share App",
                "Sharing feature coming soon! Spread the word about Taste the World!"
              );
            }}
            colors={colors}
            delay={750}
          />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
