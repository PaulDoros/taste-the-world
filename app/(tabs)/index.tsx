import { useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { CountryCard } from "@/components/CountryCard";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { StaggeredListItem } from "@/components/StaggeredList";
import { SkeletonGrid } from "@/components/SkeletonLoader";
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

export default function CountryExplorerScreen() {
  const { countries, loading, error, refetch } = useCountries();
  const [userIsPremium] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>("All");
  const [selectedPremium, setSelectedPremium] = useState<PremiumFilter>("All");

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets(); // Get actual safe area insets
  const tabBarHeight = useBottomTabBarHeight();
  // Calculate bottom padding: tab bar (90px) + safe area bottom + extra space (30px)
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
        <SkeletonGrid count={6} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: colors.background }}
      >
        <Text
          className="text-lg font-bold mb-2"
          style={{ color: colors.error }}
        >
          Oops!
        </Text>
        <Text className="text-center" style={{ color: colors.text }}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]} // Don't apply to bottom - let FlatList handle it
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
          paddingBottom: 350, // Dynamic: tab bar + safe area + extra space
        }}
        columnWrapperStyle={{
          gap: 12,
        }}
        renderItem={({ item, index }) => (
          <StaggeredListItem index={index}>
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
