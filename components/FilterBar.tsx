import { View, Text, ScrollView, Pressable } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { haptics } from "@/utils/haptics";

/**
 * FilterBar Component
 * Modern horizontal filter chips with animations and unique colors
 * Inspired by Airbnb, Instagram, and Material Design
 */

type RegionFilter =
  | "All"
  | "Africa"
  | "Americas"
  | "Asia"
  | "Europe"
  | "Oceania";
type PremiumFilter = "All" | "Free" | "Premium";

interface FilterBarProps {
  selectedRegion: RegionFilter;
  selectedPremium: PremiumFilter;
  onRegionChange: (region: RegionFilter) => void;
  onPremiumChange: (premium: PremiumFilter) => void;
  onClearAll: () => void;
  colors: typeof Colors.light;
}

// Region color palette (vibrant, distinct colors)
const REGION_COLORS = {
  All: "#64748b", // Slate gray
  Africa: "#f97316", // Vibrant orange
  Americas: "#16a34a", // Emerald green
  Asia: "#dc2626", // Red
  Europe: "#2563eb", // Blue
  Oceania: "#0891b2", // Cyan/Teal
};

// Animated Filter Chip Component - SUPER SMOOTH ANIMATIONS! ⚡✨
const AnimatedFilterChip = ({
  label,
  icon,
  isActive,
  onPress,
  bgColor,
  textColor,
}: {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
  bgColor: string;
  textColor: string;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${rotate.value}deg` }],
  }));

  const handlePressIn = () => {
    "worklet";
    // 💥 PRESS DOWN - Instant response!
    scale.value = withSpring(0.92, {
      damping: 15,
      stiffness: 700,
    });
    opacity.value = withTiming(0.8, { duration: 50 });
    translateY.value = withSpring(2, {
      damping: 15,
      stiffness: 700,
    });
  };

  const handlePressOut = () => {
    "worklet";
    // 🚀 RELEASE - Bounce back!
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 600,
    });
    opacity.value = withTiming(1, { duration: 100 });
    translateY.value = withSpring(0, {
      damping: 12,
      stiffness: 600,
    });
  };

  const handlePress = () => {
    // 🎯 INSTANT FEEDBACK!
    haptics.light();

    // Call the actual handler IMMEDIATELY
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 16,
          backgroundColor: bgColor,
          borderWidth: isActive ? 0 : 1.5,
          borderColor: isActive ? "transparent" : `${bgColor}40`,
          shadowColor: isActive ? bgColor : "#000",
          shadowOffset: { width: 0, height: isActive ? 4 : 1 },
          shadowOpacity: isActive ? 0.35 : 0.05,
          shadowRadius: isActive ? 8 : 2,
          elevation: isActive ? 6 : 1,
          ...(isActive && {
            shadowColor: bgColor,
          }),
        }}
      >
        <Animated.View
          style={[
            {
              width: 16, // Much smaller
              height: 16,
              borderRadius: 8,
              backgroundColor: isActive
                ? "rgba(255, 255, 255, 0.25)"
                : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 5, // Reduced spacing
            },
            iconAnimatedStyle,
          ]}
        >
          <FontAwesome5
            name={icon}
            size={8} // Smaller icon
            color={textColor}
            solid={isActive}
          />
        </Animated.View>
        <Text
          style={{
            color: textColor,
            fontSize: 11, // Smaller text
            fontWeight: isActive ? "700" : "600",
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export const FilterBar = ({
  selectedRegion,
  selectedPremium,
  onRegionChange,
  onPremiumChange,
  onClearAll,
  colors,
}: FilterBarProps) => {
  const hasActiveFilters =
    selectedRegion !== "All" || selectedPremium !== "All";

  const regions: {
    label: string;
    value: RegionFilter;
    icon: string;
    color: string;
  }[] = [
    {
      label: "All Regions",
      value: "All",
      icon: "globe",
      color: REGION_COLORS.All,
    },
    {
      label: "Africa",
      value: "Africa",
      icon: "sun",
      color: REGION_COLORS.Africa,
    },
    {
      label: "Americas",
      value: "Americas",
      icon: "flag-usa",
      color: REGION_COLORS.Americas,
    },
    {
      label: "Asia",
      value: "Asia",
      icon: "yin-yang",
      color: REGION_COLORS.Asia,
    },
    {
      label: "Europe",
      value: "Europe",
      icon: "landmark",
      color: REGION_COLORS.Europe,
    },
    {
      label: "Oceania",
      value: "Oceania",
      icon: "water",
      color: REGION_COLORS.Oceania,
    },
  ];

  const premiumFilters: {
    label: string;
    value: PremiumFilter;
    icon: string;
    color: string;
  }[] = [
    { label: "All", value: "All", icon: "star", color: colors.tint },
    { label: "Free", value: "Free", icon: "gift", color: "#10b981" },
    { label: "Premium", value: "Premium", icon: "crown", color: "#9333ea" },
  ];

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Header with Clear All button */}
      {hasActiveFilters && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 13,
              fontWeight: "600",
              opacity: 0.7,
            }}
          >
            Active Filters
          </Text>
          <Pressable onPress={onClearAll}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: `${colors.tint}15`,
                borderRadius: 12,
              }}
            >
              <FontAwesome5 name="times-circle" size={12} color={colors.tint} />
              <Text
                style={{
                  color: colors.tint,
                  fontSize: 12,
                  fontWeight: "600",
                  marginLeft: 6,
                }}
              >
                Clear All
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {/* Region Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 24,
          paddingVertical: 8, // Prevent clipping of shadows and chips
          gap: 10,
        }}
      >
        {regions.map((region) => {
          const isActive = selectedRegion === region.value;
          return (
            <AnimatedFilterChip
              key={region.value}
              label={region.label}
              icon={region.icon}
              isActive={isActive}
              onPress={() => onRegionChange(region.value)}
              bgColor={isActive ? region.color : `${region.color}15`}
              textColor={isActive ? "white" : region.color}
            />
          );
        })}
      </ScrollView>

      {/* Premium Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 24,
          paddingVertical: 8, // Prevent clipping of shadows and chips
          gap: 10,
        }}
      >
        {premiumFilters.map((filter) => {
          const isActive = selectedPremium === filter.value;
          return (
            <AnimatedFilterChip
              key={filter.value}
              label={filter.label}
              icon={filter.icon}
              isActive={isActive}
              onPress={() => onPremiumChange(filter.value)}
              bgColor={isActive ? filter.color : `${filter.color}15`}
              textColor={isActive ? "white" : filter.color}
            />
          );
        })}
      </ScrollView>
    </View>
  );
};
