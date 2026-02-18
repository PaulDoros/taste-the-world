import { AuthCTA } from '@/components/home/AuthCTA';
import { ScreenLayout } from '@/components/ScreenLayout';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { HomeHero } from '@/components/home/HomeHero';
import { RecipeOfTheWeek } from '@/components/home/RecipeOfTheWeek';
import { RegionGrid } from '@/components/home/RegionGrid';
import { useCountries } from '@/hooks/useCountries';
import { useFeaturedContent } from '@/hooks/useFeaturedContent';
import { useAuth } from '@/store/authStore';
import {
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  View,
} from 'react-native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { YStack } from 'tamagui';
import { AmbientBackground } from '@/components/ui/AmbientBackground';
import { Country } from '@/types';
import { useTheme } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { haptics } from '@/utils/haptics';
import { useColorScheme } from '@/components/useColorScheme';
import { ErrorState } from '@/components/shared/ErrorState';
import { Loading } from '@/components/shared/Loading';
import { useLanguage } from '@/context/LanguageContext';
import { AppBannerAd } from '@/components/ads/BannerAd';

/**
 * Home Screen
 * Modern Tamagui-powered landing page with featured content
 */
export default function HomeScreen() {
  const { countries, loading, error, refetch } = useCountries();
  const { isAuthenticated, user } = useAuth();
  const {
    featuredCountries,
    featuredRecipes,
    recipeOfTheWeek,
    loadingRecipes,
    recipesError,
    getRegionCount,
    refetchRecipes,
  } = useFeaturedContent(countries);

  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const handleCountryPress = useCallback(
    (country: Country) => {
      haptics.light();
      router.push(`/country/${country.cca2}`);
    },
    [router]
  );

  const handleRecipePress = useCallback(
    (recipeId: string) => {
      haptics.light();
      router.push(`/recipe/${recipeId}`);
    },
    [router]
  );

  const handleBrowseAll = useCallback(() => {
    haptics.medium();
    router.push('/(tabs)/explore');
  }, [router]);

  const onRefresh = useCallback(async () => {
    haptics.light();
    await Promise.all([refetch(), refetchRecipes()]);
    haptics.success();
  }, [refetch, refetchRecipes]);

  // Standardized loading state
  if (loading && countries.length === 0) {
    return <Loading />;
  }

  // Standardized error state
  if (error && countries.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <ErrorState
          title={t('home_error_title')}
          message={t('home_error_message')}
          onRetry={onRefresh}
          retryText={t('home_retry')}
        />
      </View>
    );
  }

  return (
    <ScreenLayout edges={['top']} disableBackground>
      <YStack flex={1}>
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
            paddingTop: 16,
          }}
        >
          <AmbientBackground scrollable height={4000} />

          {/* Hero Section */}
          <YStack marginBottom="$6" paddingHorizontal="$4">
            <HomeHero
              isAuthenticated={isAuthenticated}
              userName={user?.name}
              countriesCount={countries.length}
              onBrowseAll={handleBrowseAll}
            />
          </YStack>

          {/* Recipe of the Week */}
          {recipeOfTheWeek && (
            <RecipeOfTheWeek
              recipe={recipeOfTheWeek}
              onPress={handleRecipePress}
              delay={200}
            />
          )}

          {/* Featured Countries */}
          {featuredCountries.length > 0 && (
            <FeaturedSection
              title={t('home_featured_countries')}
              subtitle={t('home_featured_countries_subtitle')}
              countries={featuredCountries}
              onSeeAll={handleBrowseAll}
              onCountryPress={handleCountryPress}
              onRecipePress={handleRecipePress}
              delay={300}
            />
          )}

          {/* Featured Recipes */}
          {featuredRecipes.length > 0 && (
            <FeaturedSection
              title={t('home_featured_recipes')}
              subtitle={t('home_featured_recipes_subtitle')}
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
        <AppBannerAd />
      </YStack>
    </ScreenLayout>
  );
}
