import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { XP_PER_ACTION, XP_PER_LEVEL, XP_PER_PHOTO } from './shared';

/**
 * Get user's gamification stats
 */
export const getStats = query({
  args: {
    token: v.optional(v.string()), // Added token support for hybrid auth
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

    if (!user) return null;

    return (
      user.gamification || {
        xp: 0,
        level: 1,
        currentStreak: 0,
        lastActivityDate: 0,
        badges: [],
      }
    );
  },
});

/**
 * Log a user activity (e.g., Cooking, Chatting)
 * Updates Streak and XP
 */
export const logActivity = mutation({
  args: {
    actionType: v.string(), // 'cook', 'chat', 'quiz', etc.
    token: v.optional(v.string()), // Added token support
    recipeCategory: v.optional(v.string()),
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

    if (!user) return null;

    const now = new Date();
    const currentStats = user.gamification || {
      xp: 0,
      level: 1,
      currentStreak: 0,
      lastActivityDate: 0, // epoch
      badges: [],
    };

    // Initialize new stats if missing
    let photosUploaded = currentStats.photosUploaded || 0;
    let recipesCooked = currentStats.recipesCooked || 0;
    let uniqueRegions = currentStats.uniqueRegions || [];
    let categoryCounts: Record<string, number> =
      currentStats.categoryCounts || {};
    let aiMessagesSent = currentStats.aiMessagesSent || 0;
    const badges = [...currentStats.badges];

    // --- Stats Update Logic ---
    if (args.actionType === 'photo') {
      photosUploaded += 1;
    } else if (args.actionType === 'cook') {
      recipesCooked += 1;

      // Track regions (passed as optional arg or looked up, but for now we rely on explicit pass or just increment)
      // TO DO: Ideally pass region in args, but for now we just increment count.
      // If we want 'Global Taster', we need to know the region.
      // Let's add optional region to args.
    }

    // --- Streak Logic ---
    const lastDate = new Date(currentStats.lastActivityDate);
    const isSameDay =
      now.getFullYear() === lastDate.getFullYear() &&
      now.getMonth() === lastDate.getMonth() &&
      now.getDate() === lastDate.getDate();

    // Check if it was yesterday (using midnight comparisons)
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      yesterday.getFullYear() === lastDate.getFullYear() &&
      yesterday.getMonth() === lastDate.getMonth() &&
      yesterday.getDate() === lastDate.getDate();

    let newStreak = currentStats.currentStreak;

    if (isSameDay) {
      // Already active today, no streak change
    } else if (isYesterday) {
      // Continued streak
      newStreak += 1;
    } else {
      // Broken streak (unless it's the very first time)
      newStreak = currentStats.lastActivityDate === 0 ? 1 : 1;
    }

    // --- XP Logic ---
    const xpAmount = args.actionType === 'photo' ? XP_PER_PHOTO : XP_PER_ACTION;

    // Simple cooldown check (except for photos which are manual)
    const isActivityRecent =
      now.getTime() - currentStats.lastActivityDate < 60000;

    let newXP = currentStats.xp;
    if (!isActivityRecent || args.actionType === 'photo') {
      newXP += xpAmount;
    }
    // Calculate Level: 0-99 = Lvl 1, 100-199 = Lvl 2, etc. (Linear for simplicity)
    const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;

    // --- NEW Badge Checks ---
    if (newStreak >= 3 && !badges.includes('streak_3')) badges.push('streak_3');
    if (newStreak >= 7 && !badges.includes('streak_7')) badges.push('streak_7'); // Added streak 7
    if (newLevel >= 5 && !badges.includes('level_5')) badges.push('level_5');
    if (newLevel >= 10 && !badges.includes('master_chef'))
      badges.push('master_chef');

    // Gordon R. (5 Photos)
    if (photosUploaded >= 5 && !badges.includes('gordon_r'))
      badges.push('gordon_r');

    // First Cook
    if (recipesCooked >= 1 && !badges.includes('first_cook'))
      badges.push('first_cook');

    // Early Bird (Before 9 AM)
    if (
      args.actionType === 'cook' &&
      now.getHours() < 9 &&
      !badges.includes('early_bird')
    ) {
      badges.push('early_bird');
    }

    // Chatterbox (10 Messages)
    if (aiMessagesSent >= 10 && !badges.includes('chatterbox'))
      badges.push('chatterbox');

    // Category Badges
    if (
      (categoryCounts['Dessert'] || 0) >= 5 &&
      !badges.includes('sweet_tooth')
    )
      badges.push('sweet_tooth');

    // Green Thumb (Vegetarian OR Vegan)
    const veggieCount =
      (categoryCounts['Vegetarian'] || 0) + (categoryCounts['Vegan'] || 0);
    if (veggieCount >= 5 && !badges.includes('green_thumb'))
      badges.push('green_thumb');

    // Carnivore (Beef OR Pork OR Lamb)
    const meatCount =
      (categoryCounts['Beef'] || 0) +
      (categoryCounts['Pork'] || 0) +
      (categoryCounts['Lamb'] || 0);
    if (meatCount >= 5 && !badges.includes('carnivore'))
      badges.push('carnivore');

    // Ocean Lover (Seafood)
    if (
      (categoryCounts['Seafood'] || 0) >= 3 &&
      !badges.includes('ocean_lover')
    )
      badges.push('ocean_lover');

    // Update User
    if (user) {
      await ctx.db.patch(user._id, {
        gamification: {
          xp: newXP,
          level: newLevel,
          currentStreak: newStreak,
          lastActivityDate: now.getTime(),
          badges: badges,
          photosUploaded,
          recipesCooked,
          uniqueRegions,
          categoryCounts,
          aiMessagesSent,
        },
      });
    }

    return {
      xp: newXP,
      level: newLevel,
      currentStreak: newStreak,
      leveledUp: newLevel > currentStats.level,
      newBadges: badges.length > currentStats.badges.length,
    };
  },
});
