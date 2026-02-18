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
  args: {
    type: v.union(v.literal('ai'), v.literal('travel')),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let user = null;

    if (args.token) {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_token', (q) => q.eq('token', args.token!))
        .first();

      if (session && Date.now() < session.expiresAt) {
        user = await ctx.db.get(session.userId);
      }
    }

    if (!user) throw new Error('Unauthenticated');

    const now = Date.now();
    const lastReset = user.lastAiReset || 0;
    const isNewDay = now - lastReset > 24 * 60 * 60 * 1000;

    if (isNewDay) {
      await ctx.db.patch(user._id, {
        dailyAiCount: args.type === 'ai' ? 1 : 0,
        dailyTravelCount: args.type === 'travel' ? 1 : 0,
        lastAiReset: now,
      });
    } else {
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
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let user = null;

    if (args.token) {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_token', (q) => q.eq('token', args.token!))
        .first();

      if (session && Date.now() < session.expiresAt) {
        user = await ctx.db.get(session.userId);
      }
    }

    if (!user) return null;

    const tier = (user.tier as 'free' | 'personal' | 'pro' | 'guest') || 'free';
    const limits = TIER_LIMITS[tier];

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
