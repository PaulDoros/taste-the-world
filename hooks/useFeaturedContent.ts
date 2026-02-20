import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Country, Recipe } from '@/types';
import { getRecipesByArea, getRandomRecipe } from '@/services/recipesApi';

/**
 * Configuration for featured content
 */
const FEATURED_COUNTRY_NAMES = [
  'United States',
  'Italy',
  'Japan',
  'France',
  'Mexico',
  'India',
] as const;

const FEATURED_RECIPE_AREAS = [
  'Italian',
  'Japanese',
  'Mexican',
  'Indian',
  'French',
] as const;

const MAX_FEATURED_COUNTRIES = 6;
const MAX_FEATURED_RECIPES = 4;
const RECIPE_OF_THE_WEEK_KEY = 'recipe_of_the_week_data';

/**
 * Custom hook for managing featured content on home screen
 * Separates data fetching logic from UI components
 */
export function useFeaturedContent(countries: Country[]) {
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [recipeOfTheWeek, setRecipeOfTheWeek] = useState<Recipe | null>(null);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [recipesError, setRecipesError] = useState<string | null>(null);

  /**
   * Compute featured countries with optimized algorithm
   * O(n) complexity instead of O(n²)
   */
  const featuredCountries = useMemo(() => {
    if (countries.length === 0) return [];

    // Create a map for O(1) lookups
    const countryMap = new Map<string, Country>();
    countries.forEach((country) => {
      countryMap.set(country.name.common, country);
    });

    const featured: Country[] = [];
    const usedRegions = new Set<string>();

    // Add popular countries first
    for (const name of FEATURED_COUNTRY_NAMES) {
      const country = countryMap.get(name);
      if (country) {
        featured.push(country);
        usedRegions.add(country.region);
        if (featured.length >= MAX_FEATURED_COUNTRIES) break;
      }
    }

    // Fill remaining slots with diverse regions (single pass)
    if (featured.length < MAX_FEATURED_COUNTRIES) {
      for (const country of countries) {
        if (featured.length >= MAX_FEATURED_COUNTRIES) break;

        // Check if already added
        const alreadyAdded = featured.some((c) => c.cca2 === country.cca2);
        if (alreadyAdded) continue;

        // Add if region not represented
        if (!usedRegions.has(country.region)) {
          featured.push(country);
          usedRegions.add(country.region);
        }
      }
    }

    return featured.slice(0, MAX_FEATURED_COUNTRIES);
  }, [countries]);

  /**
   * Get the current week number (1-52)
   */
  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff =
      now.getTime() -
      start.getTime() +
      (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil(day / 7);
  };

  /**
   * Fetch or retrieve Recipe of the Week
   */
  const fetchRecipeOfTheWeek = useCallback(async () => {
    try {
      const currentWeek = getWeekNumber();
      const currentYear = new Date().getFullYear();
      const storageKey = `${currentYear}-${currentWeek}`;

      // Check local storage
      const storedData = await AsyncStorage.getItem(RECIPE_OF_THE_WEEK_KEY);

      if (storedData) {
        const parsed = JSON.parse(storedData);
        if (parsed.weekKey === storageKey && parsed.recipe) {
          setRecipeOfTheWeek(parsed.recipe);
          return;
        }
      }

      // If no valid stored recipe, fetch a new random one
      const newRecipe = await getRandomRecipe();

      // Store it
      await AsyncStorage.setItem(
        RECIPE_OF_THE_WEEK_KEY,
        JSON.stringify({
          weekKey: storageKey,
          recipe: newRecipe,
        })
      );

      setRecipeOfTheWeek(newRecipe);
    } catch (err) {
      console.warn('Failed to fetch recipe of the week:', err);
      // Fallback: try to fetch random without storing if storage fails
      try {
        const fallback = await getRandomRecipe();
        setRecipeOfTheWeek(fallback);
      } catch (e) {
        console.error('Critical failure fetching recipe of the week');
      }
    }
  }, []);

  /**
   * Fetch featured recipes with error handling and retry logic
   */
  const fetchFeaturedRecipes = useCallback(async () => {
    // Prevent duplicate fetches
    if (featuredRecipes.length > 0 || loadingRecipes) return;

    setLoadingRecipes(true);
    setRecipesError(null);

    try {
      const recipes: Recipe[] = [];
      const areasToFetch = FEATURED_RECIPE_AREAS.slice(0, MAX_FEATURED_RECIPES);

      // Fetch in parallel for better performance
      const recipePromises = areasToFetch.map(async (area) => {
        try {
          const areaRecipes = await getRecipesByArea(area);
          return areaRecipes.length > 0 ? areaRecipes[0] : null;
        } catch (err) {
          // Log but don't fail entire operation
          console.warn(`Failed to fetch ${area} recipes:`, err);
          return null;
        }
      });

      const results = await Promise.all(recipePromises);
      const validRecipes = results.filter(
        (recipe): recipe is Recipe => recipe !== null
      );

      setFeaturedRecipes(validRecipes);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load featured recipes';
      setRecipesError(errorMessage);
      console.error('Error fetching featured recipes:', err);
    } finally {
      setLoadingRecipes(false);
    }
  }, [featuredRecipes.length, loadingRecipes]);

  /**
   * Compute region statistics (memoized to avoid recalculation)
   */
  const regionStats = useMemo(() => {
    const stats = new Map<string, number>();
    countries.forEach((country) => {
      const count = stats.get(country.region) || 0;
      stats.set(country.region, count + 1);
    });
    return stats;
  }, [countries]);

  /**
   * Get count for a specific region
   */
  const getRegionCount = useCallback(
    (regionName: string): number => {
      return regionStats.get(regionName) || 0;
    },
    [regionStats]
  );

  // Fetch recipes on mount
  useEffect(() => {
    fetchFeaturedRecipes();
    fetchRecipeOfTheWeek();
  }, [fetchFeaturedRecipes, fetchRecipeOfTheWeek]);

  return {
    featuredCountries,
    featuredRecipes,
    recipeOfTheWeek,
    loadingRecipes,
    recipesError,
    getRegionCount,
    refetchRecipes: async () => {
      await Promise.all([fetchFeaturedRecipes(), fetchRecipeOfTheWeek()]);
    },
  };
}
