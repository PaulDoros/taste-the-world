import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Unlock a country for a user (e.g., after watching an ad)
 */
export const unlockCountry = mutation({
  args: {
    token: v.string(),
    countryCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthorized');
    }

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error('User not found');

    const currentUnlocked = user.unlockedCountries || [];

    // If already unlocked, do nothing
    if (currentUnlocked.includes(args.countryCode)) {
      return { success: true, message: 'Already unlocked' };
    }

    // Add to unlocked list
    await ctx.db.patch(user._id, {
      unlockedCountries: [...currentUnlocked, args.countryCode],
    });

    return { success: true, message: 'Country unlocked' };
  },
});

export const updateLanguage = mutation({
  // Force Update
  args: {
    language: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthorized');
    }

    const user = await ctx.db.get(session.userId);

    if (!user) {
      throw new Error('User not found');
    }

    // @ts-ignore - language is dynamically added schema field
    await ctx.db.patch(user._id, { language: args.language });

    return { success: true };
  },
});

export const updateProfileImage = mutation({
  args: {
    token: v.string(),
    image: v.string(), // Base64 or URL
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthorized');
    }

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error('User not found');

    await ctx.db.patch(user._id, {
      image: args.image,
      currentAvatar: undefined, // Clear Lottie avatar when uploading custom image
    });

    return { success: true };
  },
});

export const setCurrentAvatar = mutation({
  args: {
    token: v.string(),
    avatarId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthorized');
    }

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error('User not found');

    await ctx.db.patch(user._id, { currentAvatar: args.avatarId });

    return { success: true };
  },
});
