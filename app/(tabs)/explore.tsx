import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { CountryCard } from '@/components/CountryCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { StaggeredListItem } from '@/components/StaggeredList';
import { SkeletonGrid } from '@/components/SkeletonLoader';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Country } from '@/types';
import { Colors } from '@/constants/Colors';
import { useTheme } from 'tamagui';
import { isPremiumCountry } from '@/constants/Config';
import { useCountries } from '@/hooks/useCountries';
import { useUserStore } from '@/store/useUserStore';
import { canAccessCountry, TIER_LIMITS } from '@/utils/userTiers';
import { haptics } from '@/utils/haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';

// Define filter types
type RegionFilter =
  | 'All'
  | 'Africa'
  | 'Americas'
  | 'Asia'
  | 'Europe'
  | 'Oceania';
type PremiumFilter = 'All' | 'Free' | 'Premium';

export default function ExploreScreen() {
  const { countries, loading, error, refetch } = useCountries();
  const { region: initialRegion } = useLocalSearchParams<{ region?: string }>();
  const tier = useUserStore((state) => state.tier);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useLanguage();

  // Filter states
  const [selectedRegion, setSelectedRegion] = useState<RegionFilter>(
    (initialRegion as RegionFilter) || 'All'
  );
  const [selectedPremium, setSelectedPremium] = useState<PremiumFilter>('All');

  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { showError } = useAlertDialog();
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
    setSelectedRegion('All');
    setSelectedPremium('All');
    setSearchQuery('');
    haptics.light();
  };

  // Calculate tier limits
  const tierLimit = TIER_LIMITS[tier].countries;

  // Filter countries based on search, region, and tier
  const filteredCountries = useMemo(() => {
    return countries.filter((country) => {
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
      if (selectedRegion !== 'All') {
        if (country.region !== selectedRegion) return false;
      }

      // Premium filter
      if (selectedPremium !== 'All') {
        const isCountryPremium = isPremiumCountry(country.name.common);
        if (selectedPremium === 'Free' && isCountryPremium) return false;
        if (selectedPremium === 'Premium' && !isCountryPremium) return false;
      }

      return true;
    });
  }, [countries, tier, searchQuery, selectedRegion, selectedPremium]);

  const renderItem = useCallback(
    ({ item, index }: { item: Country; index: number }) => {
      const originalIndex = countries.findIndex((c) => c.cca2 === item.cca2);
      const isLocked = !canAccessCountry(tier, originalIndex);

      return (
        <StaggeredListItem index={index} staggerDelay={50}>
          <CountryCard
            country={item}
            isPremium={isPremiumCountry(item.name.common)}
            isLocked={isLocked}
            onPress={() => {
              if (isLocked) {
                haptics.warning();
                router.push({
                  pathname: '/modal',
                  params: { feature: t('explore_all_countries') },
                });
              } else {
                haptics.selection();
                router.push(`/country/${item.cca2}`);
              }
            }}
          />
        </StaggeredListItem>
      );
    },
    [countries, tier, router, t]
  );

  // Error state
  if (error && countries.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        edges={['top', 'left', 'right']}
      >
        <ErrorState
          title={t('explore_error_title')}
          message={error || t('explore_error_message')}
          onRetry={refetch}
          retryText={t('explore_retry')}
        />
      </SafeAreaView>
    );
  }

  // Loading state with header/search always visible
  if (loading && countries.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        edges={['top', 'left', 'right']}
      >
        {/* Header - Always visible */}
        <Animated.View
          entering={FadeInDown.delay(50).springify()}
          style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
        >
          <Text
            style={{
              color: colors.text,
              fontSize: 32,
              fontWeight: '700',
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            {t('explore_title')}
          </Text>
          <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
            {t('explore_subtitle')}
          </Text>
        </Animated.View>

        {/* Search Bar - Always visible */}
        <Animated.View entering={FadeInDown.delay(150).springify()}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('explore_search_placeholder')}
          />

          <FilterBar
            selectedRegion={selectedRegion}
            selectedPremium={selectedPremium}
            onRegionChange={setSelectedRegion}
            onPremiumChange={setSelectedPremium}
            onClearAll={handleClearAllFilters}
          />
        </Animated.View>

        {/* Skeleton Loader - Only cards */}
        <SkeletonGrid count={6} />
      </SafeAreaView>
    );
  }

  // Render sticky header content
  const renderStickyHeader = () => (
    <View style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(50).springify()}
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 32,
            fontWeight: '700',
            letterSpacing: -0.5,
            marginBottom: 4,
          }}
        >
          {t('explore_title')}
        </Text>
        <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
          {t('explore_subtitle')}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).springify()}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t('explore_search_placeholder')}
        />

        <FilterBar
          selectedRegion={selectedRegion}
          selectedPremium={selectedPremium}
          onRegionChange={setSelectedRegion}
          onPremiumChange={setSelectedPremium}
          onClearAll={handleClearAllFilters}
        />

        {(searchQuery ||
          selectedRegion !== 'All' ||
          selectedPremium !== 'All') && (
          <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
            <Text style={{ color: colors.text, fontSize: 14, opacity: 0.6 }}>
              {filteredCountries.length === 1
                ? t('explore_results_count', {
                    count: filteredCountries.length,
                  })
                : t('explore_results_count_plural', {
                    count: filteredCountries.length,
                  })}
            </Text>
          </View>
        )}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      {/* Countries Grid with Sticky Header */}
      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.cca2}
        numColumns={2}
        ListHeaderComponent={renderStickyHeader}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{
          paddingBottom: bottomPadding,
        }}
        columnWrapperStyle={{
          gap: 12,
          paddingHorizontal: 16,
        }}
        renderItem={renderItem}
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
          <EmptyState
            icon="search"
            title={t('explore_no_results_title')}
            description={t('explore_no_results_desc')}
          />
        }
      />
    </SafeAreaView>
  );
}
