import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all favorites for a user
 */
export const getFavorites = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Check if recipe is favorited
 */
export const isFavorite = query({
  args: {
    userId: v.id("users"),
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_recipe", (q) =>
        q.eq("userId", args.userId).eq("recipeId", args.recipeId)
      )
      .first();
    return !!favorite;
  },
});

/**
 * Add recipe to favorites
 */
export const addFavorite = mutation({
  args: {
    userId: v.id("users"),
    recipeId: v.string(),
    recipeName: v.string(),
    recipeImage: v.optional(v.string()),
    recipeArea: v.optional(v.string()),
    recipeCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_recipe", (q) =>
        q.eq("userId", args.userId).eq("recipeId", args.recipeId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("favorites", {
      userId: args.userId,
      recipeId: args.recipeId,
      recipeName: args.recipeName,
      recipeImage: args.recipeImage,
      recipeArea: args.recipeArea,
      recipeCategory: args.recipeCategory,
      addedAt: Date.now(),
    });
  },
});

/**
 * Remove recipe from favorites
 */
export const removeFavorite = mutation({
  args: {
    userId: v.id("users"),
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_and_recipe", (q) =>
        q.eq("userId", args.userId).eq("recipeId", args.recipeId)
      )
      .first();

    if (favorite) {
      await ctx.db.delete(favorite._id);
    }
  },
});

/**
 * Clear all favorites
 */
export const clearFavorites = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    await Promise.all(favorites.map((favorite) => ctx.db.delete(favorite._id)));
  },
});

