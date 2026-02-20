import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get recipe history for a user
 */
export const getRecipeHistory = query({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('recipeHistory')
      .withIndex('by_user_and_viewed', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();
  },
});

/**
 * Add recipe to history
 */
export const addToHistory = mutation({
  args: {
    userId: v.id('users'),
    recipeId: v.string(),
    recipeName: v.string(),
    recipeImage: v.optional(v.string()),
    recipeArea: v.optional(v.string()),
    recipeCategory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already in history
    const existing = await ctx.db
      .query('recipeHistory')
      .withIndex('by_user_and_recipe', (q) =>
        q.eq('userId', args.userId).eq('recipeId', args.recipeId)
      )
      .first();

    if (existing) {
      // Update viewed timestamp
      await ctx.db.patch(existing._id, {
        viewedAt: Date.now(),
      });
      return existing._id;
    }

    // Create new history entry
    return await ctx.db.insert('recipeHistory', {
      userId: args.userId,
      recipeId: args.recipeId,
      recipeName: args.recipeName,
      recipeImage: args.recipeImage,
      recipeArea: args.recipeArea,
      recipeCategory: args.recipeCategory,
      viewedAt: Date.now(),
    });
  },
});

/**
 * Remove recipe from history
 */
export const removeFromHistory = mutation({
  args: {
    userId: v.id('users'),
    recipeId: v.string(),
  },
  handler: async (ctx, args) => {
    const historyItem = await ctx.db
      .query('recipeHistory')
      .withIndex('by_user_and_recipe', (q) =>
        q.eq('userId', args.userId).eq('recipeId', args.recipeId)
      )
      .first();

    if (historyItem) {
      await ctx.db.delete(historyItem._id);
    }
  },
});

/**
 * Clear all recipe history
 */
export const clearHistory = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query('recipeHistory')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    await Promise.all(history.map((item) => ctx.db.delete(item._id)));
  },
});
