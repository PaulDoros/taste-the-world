import { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { Country, Recipe } from "@/types";
import { getAllCountries } from "@/services/countriesApi";
import { getRecipesByArea } from "@/services/recipesApi";
import { Colors } from "@/constants/Colors";
import { COUNTRY_TO_AREA_MAP } from "@/constants/Config";
import { useColorScheme } from "@/components/useColorScheme";
import { RecipeCard } from "@/components/RecipeCard";
import { haptics } from "@/utils/haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CountryDetailsScreen = () => {
  // Get country code from URL
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // State
  const [country, setCountry] = useState<Country | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  // Fetch country data when screen loads
  useEffect(() => {
    fetchCountryDetails();
  }, [id]);

  const fetchCountryDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all countries and find by code
      const allCountries = await getAllCountries();
      const foundCountry = allCountries.find(
        (c) => c.cca2.toLowerCase() === (id as string).toLowerCase()
      );

      if (!foundCountry) {
        throw new Error("Country not found");
      }

      setCountry(foundCountry);

      // Fetch recipes for this country
      await fetchRecipes(foundCountry.name.common);
    } catch (err) {
      console.error("Error fetching country details:", err);
      setError("Failed to load country details");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecipes = async (countryName: string) => {
    try {
      setLoadingRecipes(true);

      // Map country name to MealDB area
      const area = COUNTRY_TO_AREA_MAP[countryName];

      if (!area) {
        console.log(`No recipes available for ${countryName}`);
        setRecipes([]);
        return;
      }

      console.log(`Fetching recipes for area: ${area}`);
      const fetchedRecipes = await getRecipesByArea(area);
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleBack = () => {
    haptics.light();
    router.back();
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>
          Loading country...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !country) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          backgroundColor: colors.background,
        }}
      >
        <FontAwesome5 name="exclamation-circle" size={64} color={colors.error} />
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            marginTop: 16,
            color: colors.error,
          }}
        >
          Oops!
        </Text>
        <Text
          style={{
            textAlign: "center",
            marginTop: 8,
            marginBottom: 24,
            color: colors.text,
            fontSize: 16,
          }}
        >
          {error || "Country not found"}
        </Text>
        <Pressable
          onPress={handleBack}
          style={{
            backgroundColor: colors.tint,
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  // Helper functions
  const formatPopulation = (pop: number) => {
    if (pop >= 1_000_000_000) {
      return `${(pop / 1_000_000_000).toFixed(1)}B`;
    } else if (pop >= 1_000_000) {
      return `${(pop / 1_000_000).toFixed(1)}M`;
    } else if (pop >= 1_000) {
      return `${(pop / 1_000).toFixed(1)}K`;
    }
    return pop.toString();
  };

  const getCurrencyInfo = () => {
    if (!country.currencies) return "N/A";
    const currencyCode = Object.keys(country.currencies)[0];
    const currency = country.currencies[currencyCode];
    return `${currency.name} (${currency.symbol})`;
  };

  const getLanguages = () => {
    if (!country.languages) return "N/A";
    return Object.values(country.languages).join(", ");
  };

  // Main UI
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 90 + insets.bottom + 32, // Tab bar (90px) + safe area + extra space
        }}
      >
        {/* Hero Section - Flag with Gradient */}
        <View style={{ position: "relative" }}>
          {/* Flag Image */}
          <Animated.Image
            source={{ uri: country.flags.png }}
            style={{ width: SCREEN_WIDTH, height: 300 }}
            resizeMode="cover"
            entering={FadeIn.duration(400)}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", colors.background]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />

          {/* Back Button - Animated */}
          <AnimatedBackButton onPress={handleBack} colors={colors} />
        </View>

        {/* Country Info */}
        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          {/* Country Name Card */}
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <FontAwesome5 name="globe" size={32} color={colors.tint} style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    color: colors.text,
                    letterSpacing: -0.5,
                  }}
                  numberOfLines={2}
                >
                  {country.name.common}
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: colors.text, opacity: 0.6 }}>
              {country.name.official}
            </Text>
          </Animated.View>

          {/* Info Cards Grid */}
          <View style={{ gap: 12 }}>
            {/* Capital */}
            {country.capital && (
              <AnimatedInfoCard
                icon="map-marker-alt"
                label="Capital City"
                value={country.capital[0]}
                colors={colors}
                delay={150}
                color={colors.tint}
              />
            )}

            {/* Region */}
            <AnimatedInfoCard
              icon="globe-americas"
              label="Region"
              value={`${country.region}${country.subregion ? ` • ${country.subregion}` : ""}`}
              colors={colors}
              delay={200}
              color="#10b981"
            />

            {/* Population */}
            <AnimatedInfoCard
              icon="users"
              label="Population"
              value={`${formatPopulation(country.population)} people`}
              colors={colors}
              delay={250}
              color="#f59e0b"
            />

            {/* Currency */}
            <AnimatedInfoCard
              icon="money-bill-wave"
              label="Currency"
              value={getCurrencyInfo()}
              colors={colors}
              delay={300}
              color="#8b5cf6"
            />

            {/* Languages */}
            <AnimatedInfoCard
              icon="language"
              label="Languages"
              value={getLanguages()}
              colors={colors}
              delay={350}
              color="#ef4444"
            />
          </View>

          {/* Recipes Section */}
          {recipes.length > 0 && (
            <View style={{ marginTop: 24 }}>
              {/* Section Header */}
              <Animated.View
                entering={FadeInUp.delay(400).springify()}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${colors.tint}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🍳</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colors.text,
                      }}
                    >
                      Popular Recipes
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text,
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {recipes.length} authentic dishes
                    </Text>
                  </View>
                </View>

                {/* View All Button */}
                <Pressable
                  onPress={() => {
                    haptics.light();
                    // TODO: Navigate to all recipes
                  }}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: `${colors.tint}15`,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: colors.tint,
                      fontSize: 13,
                      fontWeight: "600",
                      marginRight: 6,
                    }}
                  >
                    View All
                  </Text>
                  <FontAwesome5 name="arrow-right" size={12} color={colors.tint} />
                </Pressable>
              </Animated.View>

              {/* Recipe Cards - Horizontal Scroll */}
              <Animated.View entering={FadeInUp.delay(450).springify()}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    gap: 16,
                    paddingRight: 24,
                  }}
                >
                  {recipes.map((recipe, index) => (
                    <Animated.View
                      key={recipe.idMeal}
                      entering={FadeInUp.delay(500 + index * 50).springify()}
                      style={{ width: 250 }}
                    >
                      <RecipeCard
                        recipe={recipe}
                        onPress={() => {
                          haptics.light();
                          router.push(`/recipe/${recipe.idMeal}` as any);
                        }}
                      />
                    </Animated.View>
                  ))}
                </ScrollView>
              </Animated.View>
            </View>
          )}

          {/* Loading Recipes */}
          {loadingRecipes && (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={{
                marginTop: 24,
                padding: 20,
                borderRadius: 20,
                backgroundColor: colors.card,
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color={colors.tint} />
              <Text
                style={{
                  color: colors.text,
                  marginTop: 12,
                  fontSize: 14,
                  opacity: 0.7,
                }}
              >
                Loading recipes...
              </Text>
            </Animated.View>
          )}

          {/* No Recipes Available */}
          {!loadingRecipes && recipes.length === 0 && (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={{
                marginTop: 24,
                padding: 24,
                borderRadius: 20,
                backgroundColor: `${colors.tint}15`,
                borderWidth: 2,
                borderColor: `${colors.tint}30`,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${colors.tint}25`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 16,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>🍳</Text>
                </View>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: colors.text,
                    flex: 1,
                  }}
                >
                  No Recipes Yet
                </Text>
              </View>
              <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22, opacity: 0.8 }}>
                We're still gathering authentic recipes for {country.name.common}. Check back
                soon! 🎉
              </Text>
            </Animated.View>
          )}

          {/* Weather Coming Soon Section */}
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={{
              marginTop: 24,
              padding: 24,
              borderRadius: 20,
              backgroundColor: `${colors.tint}15`,
              borderWidth: 2,
              borderColor: `${colors.tint}30`,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${colors.tint}25`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 24 }}>🌤️</Text>
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "700",
                  color: colors.text,
                  flex: 1,
                }}
              >
                Live Weather Coming Soon!
              </Text>
            </View>
            <Text style={{ color: colors.text, fontSize: 15, lineHeight: 22, opacity: 0.8 }}>
              Real-time weather updates for {country.name.common}. Stay tuned! 🎉
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Animated Back Button Component
 */
const AnimatedBackButton = ({
  onPress,
  colors,
}: {
  onPress: () => void;
  colors: typeof Colors.light;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 600,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 600,
    });
  };

  return (
    <Animated.View
      entering={FadeIn.delay(200)}
      style={[
        {
          position: "absolute",
          top: 48,
          left: 20,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 16,
          width: 48,
          height: 48,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <FontAwesome5 name="arrow-left" size={20} color="#000" solid />
      </Pressable>
    </Animated.View>
  );
};

/**
 * Animated Info Card Component
 */
const AnimatedInfoCard = ({
  icon,
  label,
  value,
  colors,
  delay,
  color,
}: {
  icon: string;
  label: string;
  value: string;
  colors: typeof Colors.light;
  delay: number;
  color: string;
}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderRadius: 20,
        backgroundColor: colors.card,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${color}20`,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 16,
        }}
      >
        <FontAwesome5 name={icon} size={20} color={color} solid />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 13,
            color: colors.text,
            opacity: 0.6,
            fontWeight: "600",
            marginBottom: 4,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
          }}
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>

      {/* Arrow */}
      <FontAwesome5 name="chevron-right" size={16} color={colors.text} style={{ opacity: 0.3 }} />
    </Animated.View>
  );
};

export default CountryDetailsScreen;
