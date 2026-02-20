import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const create = mutation({
  args: {
    userId: v.id('users'),
    title: v.string(),
    description: v.optional(v.string()),
    ingredients: v.array(
      v.object({
        name: v.string(),
        measure: v.string(),
      })
    ),
    instructions: v.array(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    originalImageStorageId: v.optional(v.id('_storage')),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check limits based on user tier
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error('User not found');

    const tier = user.tier || 'guest';

    // Limits: Guest (2), Free (4), Personal/Pro (Unlimited)
    if (tier === 'guest' || tier === 'free') {
      const existingCount = (
        await ctx.db
          .query('myRecipes')
          .withIndex('by_user', (q) => q.eq('userId', args.userId))
          .collect()
      ).length;

      const limit = tier === 'guest' ? 2 : 4;

      if (existingCount >= limit) {
        throw new Error(
          `Recipe limit reached for ${tier} tier (${limit} max). Upgrade to add more.`
        );
      }
    }

    const recipeId = await ctx.db.insert('myRecipes', {
      userId: args.userId,
      title: args.title,
      description: args.description,
      ingredients: args.ingredients,
      instructions: args.instructions,
      imageStorageId: args.imageStorageId,
      originalImageStorageId: args.originalImageStorageId,
      source: args.source || 'manual',
      createdAt: Date.now(),
    });
    return recipeId;
  },
});

export const update = mutation({
  args: {
    id: v.id('myRecipes'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    ingredients: v.optional(
      v.array(
        v.object({
          name: v.string(),
          measure: v.string(),
        })
      )
    ),
    instructions: v.optional(v.array(v.string())),
    imageStorageId: v.optional(v.id('_storage')),
    originalImageStorageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: {
    id: v.id('myRecipes'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const list = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const recipes = await ctx.db
      .query('myRecipes')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .order('desc')
      .collect();

    // Enhance with image URLs
    return Promise.all(
      recipes.map(async (recipe) => ({
        ...recipe,
        imageUrl: recipe.imageStorageId
          ? await ctx.storage.getUrl(recipe.imageStorageId)
          : null,
      }))
    );
  },
});

export const get = query({
  args: {
    id: v.id('myRecipes'),
  },
  handler: async (ctx, args) => {
    const recipe = await ctx.db.get(args.id);
    if (!recipe) return null;

    return {
      ...recipe,
      imageUrl: recipe.imageStorageId
        ? await ctx.storage.getUrl(recipe.imageStorageId)
        : null,
      originalImageUrl: recipe.originalImageStorageId
        ? await ctx.storage.getUrl(recipe.originalImageStorageId)
        : null,
    };
  },
});
