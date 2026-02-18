import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { APP_CONFIG } from '../constants/Config'; // You might need to move APP_CONFIG constants to a shared file if backend can't import from constants

// Hardcoding limits here if import fails, or safer to replicate config on backend for security
const TIER_LIMITS = {
  free: {
    aiPromptsPerDay: 3,
    travelPromptsPerDay: 0,
  },
  personal: {
    aiPromptsPerDay: 20,
    travelPromptsPerDay: 5,
  },
  pro: {
    aiPromptsPerDay: 9999,
    travelPromptsPerDay: 9999,
  },
  guest: {
    aiPromptsPerDay: 0,
    travelPromptsPerDay: 0,
  },
};

export const unlockCountry = mutation({
  args: { countryCode: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) throw new Error('User not found');

    // Add country to unlocked list if not already there
    const currentUnlocked = user.unlockedCountries || [];
    if (!currentUnlocked.includes(args.countryCode)) {
      await ctx.db.patch(user._id, {
        unlockedCountries: [...currentUnlocked, args.countryCode],
      });
    }

    return { success: true };
  },
});

export const incrementUsage = mutation({
  args: { type: v.union(v.literal('ai'), v.literal('travel')) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) throw new Error('User not found');

    const now = Date.now();
    const lastReset = user.lastAiReset || 0;
    const isNewDay = now - lastReset > 24 * 60 * 60 * 1000; // Simple 24h check

    if (isNewDay) {
      // Reset count and increment to 1
      await ctx.db.patch(user._id, {
        dailyAiCount: args.type === 'ai' ? 1 : 0,
        dailyTravelCount: args.type === 'travel' ? 1 : 0,
        lastAiReset: now,
      });
    } else {
      // Increment existing count
      if (args.type === 'ai') {
        await ctx.db.patch(user._id, {
          dailyAiCount: (user.dailyAiCount || 0) + 1,
        });
      } else {
        await ctx.db.patch(user._id, {
          dailyTravelCount: (user.dailyTravelCount || 0) + 1,
        });
      }
    }

    return { success: true };
  },
});

export const getUsageStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .first();

    if (!user) return null;

    const tier = (user.tier as 'free' | 'personal' | 'pro' | 'guest') || 'free';
    const limits = TIER_LIMITS[tier];

    // Check if reset needed (for display accuracy)
    const now = Date.now();
    const lastReset = user.lastAiReset || 0;
    const isNewDay = now - lastReset > 24 * 60 * 60 * 1000;

    const currentAiCount = isNewDay ? 0 : user.dailyAiCount || 0;

    return {
      tier,
      dailyAiCount: currentAiCount,
      aiLimit: limits.aiPromptsPerDay,
      remainingAi: Math.max(0, limits.aiPromptsPerDay - currentAiCount),
      canUseAi: currentAiCount < limits.aiPromptsPerDay,
      unlockedCountries: user.unlockedCountries || [],
    };
  },
});
