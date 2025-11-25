import { useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

import { CountryCard } from "@/components/CountryCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { StaggeredListItem } from "@/components/StaggeredList";
import { SkeletonGrid, ExploreHeaderSkeleton } from "@/components/SkeletonLoader";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Country } from "@/types";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { isPremiumCountry } from "@/constants/Config";
import { useCountries } from "@/hooks/useCountries";
import { haptics } from "@/utils/haptics";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// Define filter types
type RegionFilter =
  | "All"
  | "Africa"
  | "Americas"
  | "Asia"
  | "Europe"
  | "Oceania";
type PremiumFilter = "All" | "Free" | "Premium";

export default function ExploreScreen() {
  const { countries, loading, error, refetch } = useCountries();
  const { region: initialRegion } = useLocalSearchParams<{ region?: string }>();
  const [userIsPremium] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(
    (initialRegion as RegionFilter) || "All"
  );
  const [selectedPremium, setSelectedPremium] = useState<PremiumFilter>("All");

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const bottomPadding = tabBarHeight + insets.bottom + 16;

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    await refetch();
    haptics.success();
    setRefreshing(false);
  }, [refetch]);

  // Clear all filters
  const handleClearAllFilters = () => {
    setSelectedRegion("All");
    setSelectedPremium("All");
    setSearchQuery("");
    haptics.light();
  };

  // Filter countries based on search, region, and premium status
  const filteredCountries = countries.filter((country) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        country.name.common.toLowerCase().includes(query) ||
        country.name.official.toLowerCase().includes(query) ||
        country.region.toLowerCase().includes(query) ||
        country.capital?.[0]?.toLowerCase().includes(query);

      if (!matchesSearch) return false;
    }

    // Region filter
    if (selectedRegion !== "All") {
      if (country.region !== selectedRegion) return false;
    }

    // Premium filter
    if (selectedPremium !== "All") {
      const isCountryPremium = isPremiumCountry(country.name.common);
      if (selectedPremium === "Free" && isCountryPremium) return false;
      if (selectedPremium === "Premium" && !isCountryPremium) return false;
    }

    return true;
  });

  const handleCountryPress = (country: Country) => {
    const needsPremium = isPremiumCountry(country.name.common);

    if (needsPremium && !userIsPremium) {
      haptics.warning();
      alert("🔒 Upgrade to Premium to access " + country.name.common);
    } else {
      haptics.light();
      router.push(`/country/${country.cca2}` as any);
    }
  };

  if (loading && countries.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        edges={["top", "left", "right"]}
      >
        {/* Header */}
        <View
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 32,
              fontWeight: "700",
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            Explore Countries
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
            Discover authentic cuisines from around the world
          </Text>
        </View>

        {/* Skeleton Loader */}
        {/* <ExploreHeaderSkeleton /> */}
        <SkeletonGrid count={6} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 32,
            fontWeight: "700",
            letterSpacing: -0.5,
            marginBottom: 4,
          }}
        >
          Explore Countries
        </Text>
        <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
          Discover authentic cuisines from around the world
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify()}>
        {/* Modern Search Bar Component */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search countries, capitals, regions..."
          colors={colors}
        />

        {/* Modern Filter Bar Component */}
        <FilterBar
          selectedRegion={selectedRegion}
          selectedPremium={selectedPremium}
          onRegionChange={setSelectedRegion}
          onPremiumChange={setSelectedPremium}
          onClearAll={handleClearAllFilters}
          colors={colors}
        />
      </Animated.View>

      {/* Results Count */}
      {(searchQuery.length > 0 ||
        selectedRegion !== "All" ||
        selectedPremium !== "All") && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6 }}>
            {filteredCountries.length}{" "}
            {filteredCountries.length === 1 ? "country" : "countries"} found
          </Text>
        </View>
      )}

      {/* Countries Grid */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.cca2}
        numColumns={2}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: bottomPadding,
        }}
        columnWrapperStyle={{
          gap: 12,
        }}
        renderItem={({ item, index }) => (
          <StaggeredListItem index={index} staggerDelay={50}>
            <CountryCard
              country={item}
              isPremium={isPremiumCountry(item.name.common)}
              onPress={() => handleCountryPress(item)}
            />
          </StaggeredListItem>
        )}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <FontAwesome5
              name="search"
              size={48}
              color={colors.text}
              style={{ opacity: 0.2 }}
            />
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                marginTop: 16,
                opacity: 0.6,
              }}
            >
              No countries found
            </Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 14,
                marginTop: 4,
                opacity: 0.4,
              }}
            >
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

