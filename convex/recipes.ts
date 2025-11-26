import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get recipes by area/country
 */
export const getRecipesByArea = query({
  args: { area: v.string() },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query('recipes')
      .withIndex('by_area', (q) => q.eq('strArea', args.area))
      .collect();

    return recipes;
  },
});

/**
 * Get recipe by ID
 */
export const getRecipeById = query({
  args: { idMeal: v.string() },
  handler: async (ctx, args) => {
    const recipe = await ctx.db
      .query('recipes')
      .withIndex('by_idMeal', (q) => q.eq('idMeal', args.idMeal))
      .first();

    return recipe;
  },
});

/**
 * Save recipes to database (upsert logic)
 */
export const saveRecipes = mutation({
  args: {
    recipes: v.array(
      v.object({
        idMeal: v.string(),
        strMeal: v.string(),
        strCategory: v.string(),
        strArea: v.string(),
        strInstructions: v.string(),
        strMealThumb: v.string(),
        strTags: v.optional(v.string()),
        strYoutube: v.optional(v.string()),
        strSource: v.optional(v.string()),
        ingredients: v.array(
          v.object({
            name: v.string(),
            measure: v.string(),
          })
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    const saved = [];

    for (const recipe of args.recipes) {
      // Check if recipe already exists
      const existing = await ctx.db
        .query('recipes')
        .withIndex('by_idMeal', (q) => q.eq('idMeal', recipe.idMeal))
        .first();

      if (!existing) {
        // Insert new recipe
        const id = await ctx.db.insert('recipes', {
          ...recipe,
          createdAt: Date.now(),
        });
        saved.push(id);
      }
    }

    return { saved: saved.length, total: args.recipes.length };
  },
});
