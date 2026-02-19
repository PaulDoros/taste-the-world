import { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, RefreshControl, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { FontAwesome5 } from '@expo/vector-icons';
import { ScreenLayout } from '@/components/ScreenLayout';
import { AmbientBackground } from '@/components/ui/AmbientBackground';

import { CountryCard } from '@/components/CountryCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { StaggeredListItem } from '@/components/StaggeredList';
import { SkeletonGrid } from '@/components/SkeletonLoader';
import LottieView from 'lottie-react-native';
import { Country } from '@/types';
import { Colors } from '@/constants/Colors';
import { isFreeCountry } from '@/constants/Config';
import { useCountries } from '@/hooks/useCountries';
import { useUserStore } from '@/store/useUserStore';
import { canAccessCountry } from '@/utils/userTiers';
import { haptics } from '@/utils/haptics';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { shouldUseGlassBlur } from '@/constants/Performance';

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const useBlur = shouldUseGlassBlur;
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

  // Access lookup avoids repeated O(n) scans in each rendered card.
  const countryAccessMap = useMemo(() => {
    const map = new Map<string, boolean>();
    countries.forEach((country, index) => {
      map.set(country.cca2, canAccessCountry(tier, index));
    });
    return map;
  }, [countries, tier]);

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
        const isCountryPremium = !isFreeCountry(country.name.common);
        if (selectedPremium === 'Free' && isCountryPremium) return false;
        if (selectedPremium === 'Premium' && !isCountryPremium) return false;
      }

      return true;
    });
  }, [countries, searchQuery, selectedRegion, selectedPremium]);

  const renderItem = useCallback(
    ({ item, index }: { item: Country; index: number }) => {
      const isLocked = !(countryAccessMap.get(item.cca2) ?? false);

      return (
        <StaggeredListItem index={index} staggerDelay={50}>
          <CountryCard
            country={item}
            isPremium={!isFreeCountry(item.name.common)}
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
    [countryAccessMap, router, t]
  );

  const headerContainerStyle = useMemo(
    () => ({
      overflow: 'hidden' as const,
      borderBottomWidth: 1,
      marginBottom: 20,
      borderBottomColor:
        colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      backgroundColor: !useBlur
        ? colorScheme === 'dark'
          ? 'rgba(15, 23, 42, 0.92)'
          : 'rgba(255, 255, 255, 0.94)'
        : 'transparent',
    }),
    [colorScheme, useBlur]
  );

  // Sticky header (memoized so FlatList doesn't remount it repeatedly)
  const stickyHeader = useMemo(
    () => (
      useBlur ? (
        <BlurView
          intensity={85}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          experimentalBlurMethod={
            Platform.OS === 'android' ? 'dimezisBlurView' : undefined
          }
          style={headerContainerStyle}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: insets.top + 16,
              paddingBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
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
            </View>
            {Platform.OS === 'ios' ? (
              <View
                style={{
                  width: 80,
                  height: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome5 name="compass" size={30} color={colors.tint} solid />
              </View>
            ) : (
              <LottieView
                source={require('@/assets/animations/travel.json')}
                autoPlay
                loop
                style={{ width: 80, height: 80 }}
              />
            )}
          </View>

          <View>
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
          </View>
        </BlurView>
      ) : (
        <View style={headerContainerStyle}>
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: insets.top + 16,
              paddingBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View>
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
            </View>
            <View
              style={{
                width: 80,
                height: 80,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FontAwesome5 name="compass" size={30} color={colors.tint} solid />
            </View>
          </View>

          <View>
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
          </View>
        </View>
      )
    ),
    [
      useBlur,
      headerContainerStyle,
      colorScheme,
      colors.text,
      colors.tint,
      insets.top,
      searchQuery,
      selectedRegion,
      selectedPremium,
      filteredCountries.length,
      t,
    ]
  );

  // Error state
  if (error && countries.length === 0) {
    return (
      <ScreenLayout edges={['top', 'left', 'right']}>
        <ErrorState
          title={t('explore_error_title')}
          message={error || t('explore_error_message')}
          onRetry={refetch}
          retryText={t('explore_retry')}
        />
      </ScreenLayout>
    );
  }

  // Loading state
  if (loading && countries.length === 0) {
    return (
      <ScreenLayout edges={['left', 'right']}>
        {/* Keep loading UI simple to avoid header remount flicker on tab entry */}
        <SkeletonGrid count={6} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout edges={['left', 'right']} disableBackground>
      <AmbientBackground />
      {/* Countries Grid with Sticky Header */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.cca2}
          numColumns={2}
          ListHeaderComponent={stickyHeader}
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
          removeClippedSubviews={Platform.OS === 'android'}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          updateCellsBatchingPeriod={50}
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
      </View>
    </ScreenLayout>
  );
}
