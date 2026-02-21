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
 * Get recipe by exact name (for caching)
 */
export const getRecipeByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const recipe = await ctx.db
      .query('recipes')
      .withIndex('by_name', (q) => q.eq('strMeal', args.name))
      .first();

    return recipe;
  },
});

/**
 * Internal helper to retrieve recipe by object ID
 */
export const getRecipeByIdInternal = query({
  args: { _id: v.id('recipes') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args._id);
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
        embedding: v.optional(v.array(v.float64())),
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

// Query to count recipes
export const countRecipes = query({
  args: {},
  handler: async (ctx) => {
    const recipes = await ctx.db.query('recipes').collect();
    return recipes.length;
  },
});

// Query to get all distinct areas/countries available in the database
export const getAllRecipeAreas = query({
  args: {},
  handler: async (ctx) => {
    // Note: This matches the logic of "fetching all and uniquing in memory"
    // For large datasets, this should be optimized with a separate 'areas' table
    const recipes = await ctx.db.query('recipes').collect();
    const areas = new Set(recipes.map((r) => r.strArea));
    return Array.from(areas).sort();
  },
});
