/**
 * TheMealDB API Service
 * Fetches recipe data from themealdb.com
 * Documentation: https://www.themealdb.com/api.php
 */

import { API_URLS } from '@/constants/Config';
import { Recipe, Ingredient } from '@/types';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

// Initialize Convex client
const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL || '';
let convexClient: ConvexHttpClient | null = null;

if (CONVEX_URL) {
  convexClient = new ConvexHttpClient(CONVEX_URL);
}

/**
 * Helper function to extract ingredients from recipe
 * TheMealDB stores ingredients as strIngredient1, strIngredient2, etc.
 * We need to convert them to a clean array
 */
export const extractIngredients = (recipe: Recipe): Ingredient[] => {
  const ingredients: Ingredient[] = [];

  // Loop through 20 possible ingredients
  for (let i = 1; i <= 20; i++) {
    const ingredientKey = `strIngredient${i}` as keyof Recipe;
    const measureKey = `strMeasure${i}` as keyof Recipe;

    const ingredient = recipe[ingredientKey];
    const measure = recipe[measureKey];

    // Only add if ingredient exists and is not empty
    if (ingredient && ingredient.trim() !== '') {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || '',
      });
    }
  }

  return ingredients;
};

/**
 * Get recipes by country/area (e.g., "Italian", "Japanese")
 * Uses Convex cache first, then falls back to external APIs
 */
export const getRecipesByArea = async (area: string): Promise<Recipe[]> => {
  // 1. Try Convex cache first
  if (convexClient) {
    try {
      const cachedRecipes = await convexClient.query(
        api.recipes.getRecipesByArea,
        { area }
      );
      if (cachedRecipes && cachedRecipes.length >= 5) {
        console.log(
          `✅ Found ${cachedRecipes.length} recipes in Convex for ${area}`
        );
        return cachedRecipes;
      }
    } catch (error) {
      console.warn(
        '⚠️ Convex query failed, falling back to external APIs:',
        error
      );
    }
  }

  // 2. Fallback to external APIs
  console.log(`🔄 Fetching from external APIs for ${area}`);
  const externalRecipes = await fetchFromExternalAPIs(area);

  // 3. Save to Convex for future use
  if (convexClient && externalRecipes.length > 0) {
    try {
      // Sanitize recipes before saving to match Convex schema
      const sanitizedRecipes = externalRecipes.map((recipe) => ({
        idMeal: recipe.idMeal,
        strMeal: recipe.strMeal,
        strCategory: recipe.strCategory,
        strArea: recipe.strArea,
        strInstructions: recipe.strInstructions,
        strMealThumb: recipe.strMealThumb,
        strTags: recipe.strTags || undefined,
        strYoutube: recipe.strYoutube || undefined,
        strSource: recipe.strSource || undefined,
        // @ts-ignore - ingredients is added during fetchFromExternalAPIs
        ingredients: recipe.ingredients || [],
      }));

      await convexClient.mutation(api.recipes.saveRecipes, {
        recipes: sanitizedRecipes,
      });
      console.log(
        `💾 Saved ${externalRecipes.length} recipes to Convex for ${area}`
      );
    } catch (error) {
      console.error('❌ Failed to save recipes to Convex:', error);
    }
  }

  return externalRecipes;
};

/**
 * Fetch from external APIs (TheMealDB + API-Ninjas fallback)
 */
async function fetchFromExternalAPIs(area: string): Promise<Recipe[]> {
  try {
    const response = await fetch(
      `${API_URLS.mealDB}/filter.php?a=${encodeURIComponent(area)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const meals = data.meals || [];

    // Transform TheMealDB recipes to include ingredients array
    const recipesWithIngredients = await Promise.all(
      meals.map(async (meal: Recipe) => {
        try {
          // Fetch full details to get ingredients
          const fullRecipe = await getRecipeById(meal.idMeal);
          return {
            ...fullRecipe,
            ingredients: extractIngredients(fullRecipe),
          };
        } catch (error) {
          console.error(`Failed to fetch details for ${meal.idMeal}:`, error);
          return null;
        }
      })
    );

    return recipesWithIngredients.filter((r): r is Recipe => r !== null);
  } catch (error) {
    console.error(`Error fetching recipes for area ${area}:`, error);
    return [];
  }
}

/**
 * Get full recipe details by ID
 */
export const getRecipeById = async (recipeId: string): Promise<Recipe> => {
  try {
    const response = await fetch(
      `${API_URLS.mealDB}/lookup.php?i=${encodeURIComponent(recipeId)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      throw new Error(`Recipe with ID ${recipeId} not found`);
    }

    return data.meals[0];
  } catch (error) {
    console.error(`Error fetching recipe ${recipeId}:`, error);
    throw error;
  }
};

/**
 * Search recipes by name
 */
export const searchRecipes = async (query: string): Promise<Recipe[]> => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await fetch(
      `${API_URLS.mealDB}/search.php?s=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error searching recipes with query "${query}":`, error);
    return [];
  }
};

/**
 * Get a random recipe
 */
export const getRandomRecipe = async (): Promise<Recipe> => {
  try {
    const response = await fetch(`${API_URLS.mealDB}/random.php`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.meals || data.meals.length === 0) {
      throw new Error('No random recipe found');
    }

    return data.meals[0];
  } catch (error) {
    console.error('Error fetching random recipe:', error);
    throw error;
  }
};

/**
 * Get all available recipe categories
 */
export const getCategories = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URLS.mealDB}/list.php?c=list`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.meals?.map((cat: any) => cat.strCategory) || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

/**
 * Get all available areas/cuisines
 */
export const getAreas = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${API_URLS.mealDB}/list.php?a=list`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.meals?.map((area: any) => area.strArea) || [];
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
};

/**
 * Get recipes by category (e.g., "Dessert", "Seafood")
 */
export const getRecipesByCategory = async (
  category: string
): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_URLS.mealDB}/filter.php?c=${encodeURIComponent(category)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching recipes for category ${category}:`, error);
    return [];
  }
};
