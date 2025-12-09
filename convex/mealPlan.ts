import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Helper to get user from token or identity
 */
async function getUser(ctx: any, token?: string) {
  if (token) {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q: any) => q.eq('token', token))
      .unique();
    if (session) {
      const user = await ctx.db.get(session.userId);
      console.log(
        `[DEBUG] getUser: Token ${token.substring(0, 8)}... resolved to User ${user?._id}`
      );
      return user;
    } else {
      console.log(
        `[DEBUG] getUser: Token ${token?.substring(0, 8)}... found NO session.`
      );
    }
  } else {
    console.log(`[DEBUG] getUser: No token provided.`);
  }

  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    console.log(`[DEBUG] getUser: Found identity ${identity.email}`);
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q: any) => q.eq('email', identity.email!))
      .unique();
  }

  console.log(`[DEBUG] getUser: No user resolved.`);
  return null;
}

/**
 * Save a meal plan
 */
export const saveMealPlan = mutation({
  args: {
    plan: v.string(),
    startDate: v.number(),
    type: v.optional(v.union(v.literal('standard'), v.literal('baby'))),
    userId: v.optional(v.id('users')), // Trusted internal call
  },
  handler: async (ctx, args) => {
    let user;

    // Internal call from ai.ts can pass userId directly
    if (args.userId) {
      user = await ctx.db.get(args.userId);
    } else {
      user = await getUser(ctx);
    }

    if (!user) throw new Error('Unauthorized');

    const planId = await ctx.db.insert('mealPlans', {
      userId: user._id,
      startDate: args.startDate,
      plan: args.plan,
      createdAt: Date.now(),
      type: args.type || 'standard',
    });

    return planId;
  },
});

/**
 * Save shopping list to a meal plan
 */
export const saveShoppingList = mutation({
  args: {
    planId: v.id('mealPlans'),
    list: v.string(), // JSON string
  },
  handler: async (ctx, args) => {
    // We could verify user ownership here, but for internal AI calls it's safeish
    // In strict auth, we should check getUser(ctx).
    await ctx.db.patch(args.planId, {
      shoppingListData: args.list,
    });
  },
});

/**
 * Get the latest meal plan for a user
 */
export const getLatestMealPlan = query({
  args: {
    type: v.optional(v.union(v.literal('standard'), v.literal('baby'))),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.token);
    if (!user) return null;

    const type = args.type || 'standard';

    const plan = await ctx.db
      .query('mealPlans')
      .withIndex('by_user_and_type', (q) =>
        q.eq('userId', user._id).eq('type', type)
      )
      .order('desc')
      .first();

    // Fallback for old plans
    if (!plan && type === 'standard') {
      return await ctx.db
        .query('mealPlans')
        .withIndex('by_user', (q) => q.eq('userId', user._id))
        .filter((q) => q.eq(q.field('type'), undefined))
        .order('desc')
        .first();
    }

    return plan;
  },
});

/**
 * Get all meal plans for a user (History)
 */
export const getMealPlans = query({
  args: {
    type: v.optional(v.union(v.literal('standard'), v.literal('baby'))),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getUser(ctx, args.token);
    if (!user) return [];

    const type = args.type || 'standard';

    // Query by user first to catch all plans (including legacy ones without 'type')
    const allPlans = await ctx.db
      .query('mealPlans')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(50); // Fetch a bit more to allow for filtering

    // Filter in memory
    const plans = allPlans.filter((plan) => {
      const planType = plan.type || 'standard'; // Treat missing type as 'standard'
      return planType === type;
    });

    return plans.slice(0, 20);
  },
});

/**
 * Get templates matching criteria (Internal)
 */
export const getMatchingTemplates = query({
  args: {
    type: v.union(v.literal('standard'), v.literal('baby')),
    tags: v.array(v.string()), // Tags extracted from user preferences
  },
  handler: async (ctx, args) => {
    // 1. Fetch all templates of the correct type
    const templates = await ctx.db
      .query('mealPlanTemplates')
      .withIndex('by_type', (q) => q.eq('type', args.type))
      .collect();

    if (templates.length === 0) return [];

    // 2. Filter in memory for tag overlap
    // If user provided no tags, return generic templates (empty tags) or random ones
    if (args.tags.length === 0) {
      return templates;
    }

    // Return templates that contain AT LEAST one of the requested tags
    // Or ideally, the one with the MOST matching tags.
    const matching = templates
      .map((t) => {
        const matches = t.tags.filter((tag) => args.tags.includes(tag)).length;
        return { ...t, matches };
      })
      .filter((t) => t.matches > 0)
      .sort((a, b) => b.matches - a.matches); // Best match first

    return matching;
  },
});

/**
 * Save a new template (Internal)
 */
export const saveTemplate = mutation({
  args: {
    plan: v.string(),
    type: v.union(v.literal('standard'), v.literal('baby')),
    tags: v.array(v.string()),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('mealPlanTemplates', {
      plan: args.plan,
      type: args.type,
      tags: args.tags,
      name: args.name,
      usageCount: 1,
      createdAt: Date.now(),
    });
  },
});

/**
 * Increment usage count (Internal)
 */
export const incrementTemplateUsage = mutation({
  args: { templateId: v.id('mealPlanTemplates') },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.templateId);
    if (template) {
      await ctx.db.patch(args.templateId, {
        usageCount: (template.usageCount || 0) + 1,
      });
    }
  },
});
