import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Country } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useCountries } from '@/hooks/useCountries';
import { useAuth } from '@/hooks/useAuth';
import { useFeaturedContent } from '@/hooks/useFeaturedContent';
import { haptics } from '@/utils/haptics';
import { HomeHero } from '@/components/home/HomeHero';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { RegionGrid } from '@/components/home/RegionGrid';
import { AuthCTA } from '@/components/home/AuthCTA';

/**
 * Home Screen
 * Main landing page with featured content, quick actions, and personalized experience
 *
 * Architecture:
 * - Separates data fetching logic into custom hooks (useFeaturedContent)
 * - UI components are pure and memoized (HomeHero, FeaturedSection, etc.)
 * - Business logic extracted to hooks and utilities
 * - Performance optimized with memoization and efficient algorithms
 */
export default function HomeScreen() {
  const { countries, loading, error, refetch } = useCountries();
  const { isAuthenticated, user } = useAuth();
  const {
    featuredCountries,
    featuredRecipes,
    loadingRecipes,
    recipesError,
    getRegionCount,
    refetchRecipes,
  } = useFeaturedContent(countries);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Memoized handlers to prevent unnecessary re-renders
  const handleCountryPress = useCallback(
    (country: Country) => {
      haptics.light();
      router.push(`/country/${country.cca2}` as any);
    },
    [router]
  );

  const handleRecipePress = useCallback(
    (recipeId: string) => {
      haptics.light();
      router.push(`/recipe/${recipeId}` as any);
    },
    [router]
  );

  const handleBrowseAll = useCallback(() => {
    haptics.medium();
    router.push('/(tabs)/explore' as any);
  }, [router]);

  const onRefresh = useCallback(async () => {
    haptics.light();
    await Promise.all([refetch(), refetchRecipes()]);
    haptics.success();
  }, [refetch, refetchRecipes]);

  // Enhanced loading state with skeleton-style placeholders
  if (loading && countries.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        edges={['top']}
      >
        <View className="flex-1 px-5 pt-6 pb-10 justify-between">
          {/* Skeleton content */}
          <View className="gap-6">
            {/* Hero skeleton */}
            <View className="h-40 rounded-3xl bg-slate-200 dark:bg-slate-700 mb-2" />

            {/* Featured skeleton row */}
            <View className="gap-3">
              <View className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-700" />
              <View className="flex-row gap-3">
                <View className="flex-1 h-32 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <View className="flex-1 h-32 rounded-2xl bg-slate-200 dark:bg-slate-700" />
              </View>
            </View>

            {/* Region skeleton */}
            <View className="gap-3">
              <View className="h-4 w-40 rounded-full bg-slate-200 dark:bg-slate-700" />
              <View className="flex-row flex-wrap gap-3">
                <View className="w-[30%] h-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <View className="w-[30%] h-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
                <View className="w-[30%] h-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />
              </View>
            </View>
          </View>

          {/* Loader + label */}
          <View className="items-center">
            <ActivityIndicator color={colors.tint} />
            <Text
              className="mt-3 text-sm"
              style={{ color: colors.text }}
              accessibilityLabel="Loading content"
            >
              Getting things ready for you...
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Enhanced error state with card-style message
  if (error && countries.length === 0) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        edges={['top']}
      >
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full rounded-3xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/50 px-5 py-6">
            <Text
              className="text-lg font-bold mb-1"
              style={{ color: colors.error }}
              accessibilityRole="alert"
            >
              Oops, something went wrong
            </Text>
            <Text className="text-xs mb-3" style={{ color: colors.text }}>
              We couldn&apos;t load your content. Check your connection and try
              again.
            </Text>

            {!!error && (
              <Text
                className="text-xs mb-4"
                style={{ color: colors.text }}
                numberOfLines={2}
              >
                {String(error)}
              </Text>
            )}

            <Pressable
              onPress={onRefresh}
              className="self-start px-6 py-3 rounded-xl mt-1 shadow-sm"
              style={{ backgroundColor: colors.tint }}
              accessibilityRole="button"
              accessibilityLabel="Retry loading"
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>
                Try again
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top']}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading || loadingRecipes}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
        contentContainerStyle={{
          paddingBottom: 100 + insets.bottom + 32,
        }}
        accessibilityLabel="Home screen content"
      >
        {/* Hero Section - No extra wrapper needed */}
        <HomeHero
          isAuthenticated={isAuthenticated}
          userName={user?.name}
          countriesCount={countries.length}
          onBrowseAll={handleBrowseAll}
        />

        {/* Featured Countries */}
        {featuredCountries.length > 0 && (
          <FeaturedSection
            title="Featured Countries"
            subtitle="Popular destinations to explore"
            countries={featuredCountries}
            onSeeAll={handleBrowseAll}
            onCountryPress={handleCountryPress}
            onRecipePress={handleRecipePress}
            delay={200}
          />
        )}

        {/* Featured Recipes */}
        {featuredRecipes.length > 0 && (
          <FeaturedSection
            title="Popular Recipes"
            subtitle="Trending dishes from around the world"
            recipes={featuredRecipes}
            onCountryPress={handleCountryPress}
            onRecipePress={handleRecipePress}
            delay={400}
          />
        )}

        {/* Explore by Region */}
        <RegionGrid getRegionCount={getRegionCount} delay={600} />

        {/* Authentication CTA */}
        {!isAuthenticated && <AuthCTA delay={800} />}
      </ScrollView>
    </SafeAreaView>
  );
}
