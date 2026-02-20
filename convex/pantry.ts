import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get all pantry items for a user
 */
export const getPantryItems = query({
  args: {
    userId: v.optional(v.id('users')),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let userId = args.userId;

    if (!userId && args.token) {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_token', (q) => q.eq('token', args.token!))
        .first();
      if (session && Date.now() <= session.expiresAt) {
        userId = session.userId;
      }
    }

    if (!userId) return [];

    return await ctx.db
      .query('pantry')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});

/**
 * Add item to pantry
 */
export const addPantryItem = mutation({
  args: {
    userId: v.id('users'),
    name: v.string(),
    displayName: v.string(),
    measure: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if item already exists
    const existing = await ctx.db
      .query('pantry')
      .withIndex('by_user_and_name', (q) =>
        q.eq('userId', args.userId).eq('name', args.name.toLowerCase())
      )
      .first();

    if (existing) {
      // Update quantity if exists
      await ctx.db.patch(existing._id, {
        measure: args.measure,
      });
      return existing._id;
    }

    // Create new item
    return await ctx.db.insert('pantry', {
      userId: args.userId,
      name: args.name.toLowerCase(),
      displayName: args.displayName,
      measure: args.measure,
      isChecked: false,
      addedAt: Date.now(),
    });
  },
});

/**
 * Remove item from pantry
 */
export const removePantryItem = mutation({
  args: { itemId: v.id('pantry') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

/**
 * Update pantry item quantity
 */
export const updatePantryItemQuantity = mutation({
  args: {
    itemId: v.id('pantry'),
    measure: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.itemId, {
      measure: args.measure,
    });
  },
});

/**
 * Toggle pantry item checked state
 */
export const togglePantryItemChecked = mutation({
  args: {
    itemId: v.id('pantry'),
  },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) return;

    await ctx.db.patch(args.itemId, {
      isChecked: !Boolean(item.isChecked),
    });
  },
});

/**
 * Clear all pantry items for a user
 */
export const clearPantry = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query('pantry')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
  },
});

/**
 * Consume (remove) multiple pantry items by name
 * Used when cooking a recipe
 */
export const consumePantryItems = mutation({
  args: {
    userId: v.id('users'),
    itemNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, itemNames } = args;
    const normalizedNames = itemNames.map((n) => n.toLowerCase().trim());

    // Find items to remove
    const items = await ctx.db
      .query('pantry')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    const itemsToRemove = items.filter((item) =>
      normalizedNames.includes(item.name)
    );

    await Promise.all(itemsToRemove.map((item) => ctx.db.delete(item._id)));

    return itemsToRemove.length;
  },
});
