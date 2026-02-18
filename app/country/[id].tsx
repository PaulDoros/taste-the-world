import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Dimensions,
  Alert,
} from 'react-native';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth'; // [NEW] Import useAuth
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInUp,
} from 'react-native-reanimated';

import { Country, Recipe } from '@/types';
import { getAllCountries } from '@/services/countriesApi';
import { getRecipesByArea } from '@/services/recipesApi';
import { useUserStore } from '@/store/useUserStore';
import { Colors } from '@/constants/Colors';
import { COUNTRY_TO_AREA_MAP } from '@/constants/Config';
import { useColorScheme } from '@/components/useColorScheme';
import { RecipeCard } from '@/components/RecipeCard';
import { haptics } from '@/utils/haptics';
import { playSound } from '@/utils/sounds';
import { DetailSkeleton } from '@/components/SkeletonLoader';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useLanguage } from '@/context/LanguageContext';
import { TripPlannerModal } from '@/components/TripPlannerModal';
import { GlassButton } from '@/components/ui/GlassButton';
import { GlassCard } from '@/components/ui/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;

const CountryDetailsScreen = () => {
  // Get country code from URL
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { token } = useAuth(); // [NEW] Get token
  const logActivity = useMutation(api.gamification.logActivity);

  // State
  const [country, setCountry] = useState<Country | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Weather state
  const [weather, setWeather] = useState<{
    temp: number;
    condition: string;
    icon: string;
    description: string;
    humidity: number;
    windSpeed: number;
  } | null>(null);
  const [showTripModal, setShowTripModal] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  // Store hooks (Must be at top level, before early returns)
  const bucketList = useUserStore((state) => state.bucketList);
  const visitedCountries = useUserStore((state) => state.visitedCountries);
  const toggleBucketList = useUserStore((state) => state.toggleBucketList);
  const toggleVisited = useUserStore((state) => state.toggleVisited);

  // Fetch country data when screen loads
  useEffect(() => {
    fetchCountryDetails();
  }, [id]);

  // Fetch weather when country loads
  useEffect(() => {
    if (country?.capital?.[0]) {
      fetchWeather(country.capital[0]);
    }
  }, [country]);

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
        throw new Error('Country not found');
      }

      setCountry(foundCountry);

      // Fetch recipes for this country
      await fetchRecipes(foundCountry.name.common);
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError(t('country_error_failed'));
    } finally {
      // Cleanup or other final logic
      setLoading(false);
    }
  };

  // Track if we've logged this country view to prevent duplicates
  // We use a ref so it doesn't cause re-renders, but we need to reset it when ID changes.
  const loggedCountryRef = useRef<string | null>(null);

  // Reset log ref when ID changes
  useEffect(() => {
    loggedCountryRef.current = null;
  }, [id]);

  useEffect(() => {
    // Only log if:
    // 1. We have the country data
    // 2. We have the user token (Auth is ready)
    // 3. We haven't logged this country yet
    if (country && token && loggedCountryRef.current !== country.name.common) {
      console.log(
        '[COUNTRY] Logging view_country (Authorized) for:',
        country.name.common
      );

      logActivity({
        actionType: 'view_country',
        recipeArea: country.name.common,
        token: token,
      })
        .then(() => {
          loggedCountryRef.current = country.name.common;
        })
        .catch((err) => console.error('Failed to log country view:', err));
    }
  }, [country, token]);

  const fetchRecipes = async (countryName: string) => {
    try {
      setLoadingRecipes(true);

      // Map country name to MealDB area, or use country name as fallback (for API-Ninjas)
      const area = COUNTRY_TO_AREA_MAP[countryName] || countryName;

      console.log(`Fetching recipes for area: ${area}`);
      const fetchedRecipes = await getRecipesByArea(area);
      setRecipes(fetchedRecipes);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setRecipes([]);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const fetchWeather = async (city: string) => {
    try {
      // Import dynamically to avoid circular dependencies if any
      const { getWeatherByCity } = require('@/services/weatherApi');
      const data = await getWeatherByCity(city);
      if (data) {
        setWeather(data);
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
    }
  };

  const handleBack = () => {
    haptics.light();
    router.back();
  };

  // Loading state
  if (loading) {
    return <DetailSkeleton />;
  }

  // Error state
  if (error || !country) {
    return (
      <ErrorState
        title={t('country_error_title')}
        message={error || t('country_error_not_found')}
        onRetry={handleBack}
        retryText={t('country_retry')}
      />
    );
  }

  // Helper functions
  const formatPopulation = (pop: number) => {
    if (pop >= 1_000_000_000) {
      return t('common_pop_b', { count: (pop / 1_000_000_000).toFixed(1) });
    } else if (pop >= 1_000_000) {
      return t('common_pop_m', { count: (pop / 1_000_000).toFixed(1) });
    } else if (pop >= 1_000) {
      return t('common_pop_k', { count: (pop / 1_000).toFixed(1) });
    }
    return t('common_pop_unit', { count: pop });
  };

  const getCurrencyInfo = () => {
    if (!country.currencies) return 'N/A';
    const currencyCode = Object.keys(country.currencies)[0];
    const currency = country.currencies[currencyCode];
    return `${currency.name} (${currency.symbol})`;
  };

  const getLanguages = () => {
    if (!country.languages) return 'N/A';
    return Object.values(country.languages).join(', ');
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
        <View style={{ position: 'relative' }}>
          {/* Flag Image */}
          <Animated.Image
            source={{ uri: country.flags.png }}
            style={{ width: SCREEN_WIDTH, height: 300 }}
            resizeMode="cover"
            entering={FadeIn.duration(400)}
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', colors.background]}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />

          {/* Back Button - Glass */}
          <View style={{ position: 'absolute', top: 70, left: 20 }}>
            <GlassButton
              icon="arrow-left"
              onPress={handleBack}
              size="medium"
              backgroundColor="white"
              backgroundOpacity={0.9}
              textColor={colors.text}
            />
          </View>

          {/* Travel Status Buttons */}
          <Animated.View
            entering={FadeIn.delay(300)}
            style={{
              position: 'absolute',
              top: 70,
              right: 20,
              flexDirection: 'row',
              gap: 12,
            }}
          >
            {/* Bucket List Button */}
            <GlassButton
              icon="heart"
              onPress={() => {
                haptics.selection();
                const isAdding = !bucketList.includes(country.cca2);
                toggleBucketList(country.cca2);
                if (isAdding) {
                  setShowTripModal(true);
                }
              }}
              size="medium"
              backgroundColor="white"
              backgroundOpacity={0.9}
              textColor={
                bucketList.includes(country.cca2) ? '#ef4444' : '#9ca3af'
              }
              solid={bucketList.includes(country.cca2)}
              label=""
            />

            {/* Visited Button */}
            <GlassButton
              icon="check-circle"
              onPress={() => {
                haptics.success();
                playSound('achievement');
                toggleVisited(country.cca2);
              }}
              size="medium"
              backgroundColor="white"
              backgroundOpacity={0.9}
              textColor={
                visitedCountries.includes(country.cca2) ? '#10b981' : '#9ca3af'
              }
              label=""
            />
          </Animated.View>
        </View>

        {/* Country Info */}
        <View style={{ paddingHorizontal: 20 }}>
          {/* Country Name Card */}
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <GlassCard
              borderRadiusInside={0}
              borderRadius={24}
              style={{
                padding: 24,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  padding: 4,
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <FontAwesome5
                  name="globe"
                  size={32}
                  color={colors.tint}
                  style={{ marginRight: 16 }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 28,
                      fontWeight: '700',
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
            </GlassCard>
          </Animated.View>

          {/* Info Cards Grid */}
          <View style={{ gap: 12 }}>
            {/* ... Info Cards are already refactored via AnimatedInfoCard ... */}
            {/* Capital */}
            {country.capital && (
              <AnimatedInfoCard
                icon="map-marker-alt"
                label={t('country_capital')}
                value={country.capital[0]}
                colors={colors}
                delay={150}
                color={colors.tint}
              />
            )}

            {/* Region */}
            <AnimatedInfoCard
              icon="globe-americas"
              label={t('country_region')}
              value={`${country.region}${country.subregion ? ` • ${country.subregion}` : ''}`}
              colors={colors}
              delay={200}
              color="#10b981"
            />

            {/* Population */}
            <AnimatedInfoCard
              icon="users"
              label={t('country_population')}
              value={`${formatPopulation(country.population)}`}
              colors={colors}
              delay={250}
              color="#f59e0b"
            />

            {/* Currency */}
            <AnimatedInfoCard
              icon="money-bill-wave"
              label={t('country_currency')}
              value={getCurrencyInfo()}
              colors={colors}
              delay={300}
              color="#8b5cf6"
            />

            {/* Languages */}
            <AnimatedInfoCard
              icon="language"
              label={t('country_languages')}
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${colors.tint}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>🍳</Text>
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: colors.text,
                      }}
                    >
                      {t('country_section_recipes')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text,
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {t('country_section_recipes_subtitle', {
                        count: recipes.length,
                      })}
                    </Text>
                  </View>
                </View>

                {/* View All Button */}
                <GlassButton
                  size="small"
                  label={t('country_view_all_recipes')}
                  icon="arrow-right"
                  onPress={() => {
                    haptics.light();
                    if (!country) return;
                    const area =
                      COUNTRY_TO_AREA_MAP[country.name.common] ||
                      country.name.common;
                    const params = `countryName=${encodeURIComponent(country.name.common)}&area=${encodeURIComponent(area)}&countryCode=${encodeURIComponent(country.cca2)}`;
                    router.push(`/country-recipes?${params}` as any);
                  }}
                  backgroundColor={colors.tint}
                  backgroundOpacity={0.15}
                  textColor={colors.tint}
                  shadowRadius={4}
                />
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
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <GlassCard
                borderRadius={14}
                style={{
                  marginTop: 24,
                  padding: 20,
                  alignItems: 'center',
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
                  {t('country_loading_recipes')}
                </Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* No Recipes Available */}
          {!loadingRecipes && recipes.length === 0 && (
            <Animated.View
              entering={FadeInUp.delay(400).springify()}
              style={{ marginTop: 24 }}
            >
              <EmptyState
                icon="utensils"
                title={t('country_no_recipes_title')}
                description={t('country_no_recipes_desc', {
                  country: country.name.common,
                })}
              />
            </Animated.View>
          )}

          {/* Weather Section */}
          {weather ? (
            <Animated.View entering={FadeInUp.delay(600).springify()}>
              <GlassCard
                borderRadiusInside={0}
                borderRadius={20}
                style={{
                  marginTop: 24,
                  padding: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: '#3b82f620',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://openweathermap.org/img/wn/${weather.icon}@2x.png`,
                      }}
                      style={{ width: 40, height: 40 }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: colors.text,
                      }}
                    >
                      {t('country_weather_title')}
                    </Text>
                    <Text
                      style={{ color: colors.text, opacity: 0.6, fontSize: 13 }}
                    >
                      {t('country_weather_in', {
                        city: country.capital?.[0] || '',
                      })}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: '700',
                      color: colors.text,
                    }}
                  >
                    {weather.temp}°
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 16,
                      textTransform: 'capitalize',
                    }}
                  >
                    {weather.description}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <FontAwesome5
                        name="tint"
                        size={14}
                        color="#3b82f6"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ color: colors.text, opacity: 0.8 }}>
                        {weather.humidity}%
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <FontAwesome5
                        name="wind"
                        size={14}
                        color="#9ca3af"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={{ color: colors.text, opacity: 0.8 }}>
                        {weather.windSpeed}m/s
                      </Text>
                    </View>
                  </View>
                </View>
              </GlassCard>
            </Animated.View>
          ) : (
            /* Weather Coming Soon / Loading */
            /* Weather Coming Soon / Loading */
            <Animated.View entering={FadeInUp.delay(600).springify()}>
              <GlassCard
                borderRadius={20}
                backgroundColor={`${colors.tint}15`}
                style={{
                  marginTop: 24,
                  padding: 24,
                  borderWidth: 2,
                  borderColor: `${colors.tint}30`,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: `${colors.tint}25`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>🌤️</Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: colors.text,
                      flex: 1,
                    }}
                  >
                    {t('country_weather_live')}
                  </Text>
                </View>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    lineHeight: 22,
                    opacity: 0.8,
                  }}
                >
                  {API_KEY
                    ? t('country_weather_loading')
                    : t('country_weather_api_key')}
                </Text>
              </GlassCard>
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Trip Planner Modal */}
      {country && (
        <TripPlannerModal
          visible={showTripModal}
          onClose={() => setShowTripModal(false)}
          countryName={country.name.common}
          countryLat={country.latlng?.[0]}
          countryLng={country.latlng?.[1]}
        />
      )}
    </View>
  );
};

/**
 * Animated Info Card Component
 * Reusable component for country details
 */
interface AnimatedInfoCardProps {
  icon: string;
  label: string;
  value: string;
  colors: typeof Colors.light | typeof Colors.dark;
  delay: number;
  color: string;
}

const AnimatedInfoCard = ({
  icon,
  label,
  value,
  colors,
  delay,
  color,
}: AnimatedInfoCardProps) => {
  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()}>
      <GlassCard
        borderRadiusInside={0}
        borderRadius={16}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: `${color}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
          }}
        >
          <FontAwesome5 name={icon} size={18} color={color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, color: colors.text, opacity: 0.6 }}>
            {label}
          </Text>
          <Text
            style={{ fontSize: 16, fontWeight: '600', color: colors.text }}
            numberOfLines={1}
          >
            {value}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

export default CountryDetailsScreen;
