import { AuthCTA } from '@/components/home/AuthCTA';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { HomeHero } from '@/components/home/HomeHero';
import { RecipeOfTheWeek } from '@/components/home/RecipeOfTheWeek';
import { RegionGrid } from '@/components/home/RegionGrid';
import { useCountries } from '@/hooks/useCountries';
import { useFeaturedContent } from '@/hooks/useFeaturedContent';
import { useAuth } from '@/store/authStore';
import { ScrollView, RefreshControl } from 'react-native';
import { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { YStack, Spinner, Heading, Paragraph, Button, Card } from 'tamagui';
import Animated, { FadeIn } from 'react-native-reanimated';
import { FontAwesome5 } from '@expo/vector-icons';
import { Country } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { haptics } from '@/utils/haptics';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

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

  // Modern loading state with Tamagui
  if (loading && countries.length === 0) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
      >
        <YStack flex={1} padding="$5" paddingTop="$6" justifyContent="space-between">
          {/* Skeleton content */}
          <YStack space="$6">
            {/* Hero skeleton */}
            <Card
              height={160}
              borderRadius="$6"
              backgroundColor={colorScheme === 'dark' ? '$gray7' : '$gray3'}
              animation="quick"
              opacity={0.6}
            />

            {/* Featured skeleton */}
            <YStack space="$3">
              <Card
                height={16}
                width={128}
                borderRadius="$10"
                backgroundColor={colorScheme === 'dark' ? '$gray7' : '$gray3'}
                opacity={0.6}
              />
              <YStack flexDirection="row" space="$3">
                <Card
                  flex={1}
                  height={128}
                  borderRadius="$5"
                  backgroundColor={colorScheme === 'dark' ? '$gray7' : '$gray3'}
                  opacity={0.6}
                />
                <Card
                  flex={1}
                  height={128}
                  borderRadius="$5"
                  backgroundColor={colorScheme === 'dark' ? '$gray7' : '$gray3'}
                  opacity={0.6}
                />
              </YStack>
            </YStack>

            {/* Region skeleton */}
            <YStack space="$3">
              <Card
                height={16}
                width={160}
                borderRadius="$10"
                backgroundColor={colorScheme === 'dark' ? '$gray7' : '$gray3'}
                opacity={0.6}
              />
              <YStack flexDirection="row" flexWrap="wrap" space="$3">
                {[1, 2, 3].map((i) => (
                  <Card
                    key={i}
                    width="30%"
                    height={64}
                    borderRadius="$5"
                    backgroundColor={colorScheme === 'dark' ? '$gray7' : '$gray3'}
                    opacity={0.6}
                  />
                ))}
              </YStack>
            </YStack>
          </YStack>

          {/* Loader */}
          <YStack alignItems="center" space="$3">
            <Spinner size="large" color={colors.tint} />
            <Paragraph size="$3" color="$color" opacity={0.7}>
              Getting things ready for you...
            </Paragraph>
          </YStack>
        </YStack>
      </YStack>
    );
  }

  // Modern error state with Tamagui
  if (error && countries.length === 0) {
    return (
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingTop={insets.top}
        paddingBottom={insets.bottom}
        alignItems="center"
        justifyContent="center"
        padding="$6"
      >
        <AnimatedYStack entering={FadeIn} width="100%" maxWidth={400}>
          <Card
            elevate
            bordered
            padding="$5"
            borderRadius="$6"
            backgroundColor={colorScheme === 'dark' ? '$red9' : '$red2'}
            borderColor={colorScheme === 'dark' ? '$red7' : '$red6'}
          >
            <YStack space="$2" marginBottom="$4">
              <YStack flexDirection="row" alignItems="center" space="$2">
                <FontAwesome5 name="exclamation-triangle" size={20} color={colors.error} />
                <Heading size="$6" color={colors.error}>
                  Oops, something went wrong
                </Heading>
              </YStack>
              <Paragraph size="$3" color="$color" opacity={0.8}>
                We couldn't load your content. Check your connection and try again.
              </Paragraph>
              {!!error && (
                <Paragraph size="$2" color="$color" opacity={0.6} numberOfLines={2}>
                  {String(error)}
                </Paragraph>
              )}
            </YStack>

            <Button
              onPress={onRefresh}
              size="$4"
              backgroundColor={colors.tint}
              color="white"
              fontWeight="700"
              borderRadius="$4"
              pressStyle={{ scale: 0.97, opacity: 0.9 }}
              icon={<FontAwesome5 name="redo" size={14} color="white" />}
            >
              Try Again
            </Button>
          </Card>
        </AnimatedYStack>
      </YStack>
    );
  }

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top}
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
          paddingTop: 16,
        }}
      >
        {/* Hero Section */}
        <HomeHero
          isAuthenticated={isAuthenticated}
          userName={user?.name}
          countriesCount={countries.length}
          onBrowseAll={handleBrowseAll}
        />

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
            title="Featured Countries"
            subtitle="Popular destinations to explore"
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
    </YStack>
  );
}
