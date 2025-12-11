import { v } from 'convex/values';
import { mutation } from './_generated/server';

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const savePhoto = mutation({
  args: {
    storageId: v.string(),
    recipeId: v.string(),
    recipeName: v.string(),
    token: v.optional(v.string()), // Added token support
  },
  handler: async (ctx, args) => {
    let user;

    // 1. Try Standard Auth
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
      user = await ctx.db
        .query('users')
        .withIndex('by_email', (q) => q.eq('email', identity.email!))
        .unique();
    }

    // 2. Try Custom Session Token
    else if (args.token) {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_token', (q) => q.eq('token', args.token!))
        .first();
      if (session && Date.now() <= session.expiresAt) {
        user = await ctx.db.get(session.userId);
      }
    }

    if (!user) throw new Error('Unauthenticated');

    await ctx.db.insert('recipePhotos', {
      storageId: args.storageId,
      userId: user._id,
      recipeId: args.recipeId,
      recipeName: args.recipeName,
      timestamp: Date.now(),
    });
  },
});
