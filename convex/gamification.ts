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
    recipeArea: v.optional(v.string()),
    count: v.optional(v.number()), // For bulk actions like shopping
  },
  handler: async (ctx, args) => {
    console.log('[GAMIFICATION] logActivity called:', args);
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

    // [NEW] Log to Activities Table (Source of Truth)
    await ctx.db.insert('activities', {
      userId: user._id,
      actionType: args.actionType,
      data: {
        recipeCategory: args.recipeCategory,
        recipeArea: args.recipeArea,
        count: args.count,
      },
      timestamp: Date.now(),
    });

    const now = new Date();
    const currentStats = user.gamification || {
      xp: 0,
      level: 1,
      currentStreak: 0,
      lastActivityDate: 0, // epoch
      badges: [],
      photosUploaded: 0,
      recipesCooked: 0,
      uniqueRegions: [],
      aiMessagesSent: 0,
      visitedCountries: [],
      aiRecipesSaved: 0,
      shoppingItemsAdded: 0,
      pantryItemCount: 0,
    };

    // Initialize new stats if missing (fallback for old users)
    let photosUploaded = currentStats.photosUploaded || 0;
    let recipesCooked = currentStats.recipesCooked || 0;
    let uniqueRegions: string[] = currentStats.uniqueRegions || [];
    let visitedCountries: string[] = currentStats.visitedCountries || [];
    let aiRecipesSaved = currentStats.aiRecipesSaved || 0;
    let shoppingItemsAdded = currentStats.shoppingItemsAdded || 0;
    let pantryItemCount = currentStats.pantryItemCount || 0;
    let categoryCounts: Record<string, number> =
      currentStats.categoryCounts || {};
    let aiMessagesSent = currentStats.aiMessagesSent || 0;
    const badges = [...currentStats.badges];

    // --- Stats Update Logic ---
    if (args.actionType === 'photo') {
      photosUploaded += 1;
    } else if (args.actionType === 'cook') {
      recipesCooked += 1;

      // Track Categories
      if (args.recipeCategory) {
        categoryCounts[args.recipeCategory] =
          (categoryCounts[args.recipeCategory] || 0) + 1;
      }

      // Track Regions
      if (args.recipeArea && !uniqueRegions.includes(args.recipeArea)) {
        uniqueRegions.push(args.recipeArea);
      }
    } else if (args.actionType === 'view_country') {
      if (args.recipeArea && !visitedCountries.includes(args.recipeArea)) {
        visitedCountries.push(args.recipeArea);
      }
    } else if (args.actionType === 'save_ai_recipe') {
      aiRecipesSaved += 1;
    } else if (args.actionType === 'shopping_add') {
      shoppingItemsAdded += args.count || 1;
    } else if (args.actionType === 'pantry_add') {
      // Just triggers the periodic check below
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
    if (newLevel >= 10 && !badges.includes('level_10')) badges.push('level_10');

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

    // Global Taster (3 Unique Regions - cooked)
    if (uniqueRegions.length >= 3 && !badges.includes('global_taster')) {
      badges.push('global_taster');
    }

    // Explorer (5 Unique Countries - visited)
    if (visitedCountries.length >= 5 && !badges.includes('explorer')) {
      badges.push('explorer');
    }

    // Shopping Spree (50 Items Added)
    if (shoppingItemsAdded >= 50 && !badges.includes('shopping_spree')) {
      badges.push('shopping_spree');
    }

    // AI Chef Bestie (5 Saved AI Recipes)
    if (aiRecipesSaved >= 5 && !badges.includes('ai_chef_bestie')) {
      badges.push('ai_chef_bestie');
    }

    // Map Explorer (Use Map Feature)
    if (
      args.actionType === 'map_interaction' &&
      !badges.includes('map_explorer')
    ) {
      badges.push('map_explorer'); // Requires adding map_explorer to Badges.ts
    }

    if (args.actionType === 'cook') {
      // Night Owl (Cook > 9 PM)
      if (now.getHours() >= 21 && !badges.includes('night_owl')) {
        badges.push('night_owl');
      }

      // Weekend Warrior (Sat/Sun)
      const day = now.getDay();
      if ((day === 0 || day === 6) && !badges.includes('weekend_warrior')) {
        badges.push('weekend_warrior');
      }
    }

    // Variety King (5 Categories)
    if (
      Object.keys(categoryCounts).length >= 5 &&
      !badges.includes('variety_king')
    ) {
      badges.push('variety_king');
    }

    // Pantry Master (20 Items in Pantry)
    // Run query if triggered by pantry_add or cook or periodically
    const pantryItemsQuery = await ctx.db
      .query('pantry')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    // Update count stats
    pantryItemCount = pantryItemsQuery.length;

    if (pantryItemCount >= 20 && !badges.includes('pantry_master')) {
      badges.push('pantry_master');
    }

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
          visitedCountries,
          aiRecipesSaved,
          shoppingItemsAdded,
          pantryItemCount,
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
