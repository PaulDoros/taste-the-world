/**
 * TheMealDB API Service
 * Fetches recipe data from themealdb.com
 * Documentation: https://www.themealdb.com/api.php
 */

import { API_URLS } from '@/constants/Config';
import { Recipe, Ingredient } from '@/types';

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
 */
export const getRecipesByArea = async (area: string): Promise<Recipe[]> => {
  try {
    const response = await fetch(
      `${API_URLS.mealDB}/filter.php?a=${encodeURIComponent(area)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching recipes for area ${area}:`, error);
    return [];
  }
};

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
