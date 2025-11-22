import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Link guest purchases to user account
 * Called when guest creates an account
 */
export const linkGuestPurchases = mutation({
  args: {
    userId: v.id('users'),
    guestPurchases: v.array(
      v.object({
        subscriptionType: v.union(v.literal('monthly'), v.literal('yearly')),
        transactionId: v.string(),
        amount: v.number(),
        purchaseDate: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = Date.now();
    const oneMonth = 1000 * 60 * 60 * 24 * 30;
    const oneYear = 1000 * 60 * 60 * 24 * 365;

    // Process each guest purchase
    for (const purchase of args.guestPurchases) {
      // Check if purchase already exists
      const existingPurchase = await ctx.db
        .query('purchases')
        .filter((q) => q.eq(q.field('transactionId'), purchase.transactionId))
        .first();

      if (!existingPurchase) {
        // Create purchase record
        await ctx.db.insert('purchases', {
          userId: args.userId,
          subscriptionType: purchase.subscriptionType,
          amount: purchase.amount,
          currency: 'USD',
          transactionId: purchase.transactionId,
          purchaseDate: purchase.purchaseDate,
          status: 'completed',
        });

        // Update user subscription if this is the most recent purchase
        const subscriptionEndDate =
          purchase.subscriptionType === 'monthly'
            ? purchase.purchaseDate + oneMonth
            : purchase.purchaseDate + oneYear;

        // Only update if this purchase extends the subscription
        if (
          !user.subscriptionEndDate ||
          subscriptionEndDate > (user.subscriptionEndDate || 0)
        ) {
          await ctx.db.patch(args.userId, {
            subscriptionType: purchase.subscriptionType,
            subscriptionStartDate: purchase.purchaseDate,
            subscriptionEndDate,
            updatedAt: now,
          });
        }
      }
    }

    return await ctx.db.get(args.userId);
  },
});

/**
 * Link guest data (favorites, shopping list, etc.) to user account
 */
export const linkGuestData = mutation({
  args: {
    userId: v.id('users'),
    guestData: v.object({
      favorites: v.optional(v.array(v.string())),
      shoppingList: v.optional(v.array(v.any())),
      pantry: v.optional(v.array(v.any())),
      recipeHistory: v.optional(v.array(v.any())),
    }),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Link favorites
    if (args.guestData.favorites && args.guestData.favorites.length > 0) {
      for (const recipeId of args.guestData.favorites) {
        // Check if already favorited
        const existing = await ctx.db
          .query('favorites')
          .filter((q) =>
            q.and(
              q.eq(q.field('userId'), args.userId),
              q.eq(q.field('recipeId'), recipeId)
            )
          )
          .first();

        if (!existing) {
          await ctx.db.insert('favorites', {
            userId: args.userId,
            recipeId,
            recipeName: recipeId, // Will be updated when recipe is fetched
            addedAt: Date.now(),
          });
        }
      }
    }

    // Link shopping list items
    if (args.guestData.shoppingList && args.guestData.shoppingList.length > 0) {
      for (const item of args.guestData.shoppingList) {
        await ctx.db.insert('shoppingList', {
          userId: args.userId,
          name: item.name || item.ingredient || 'Item',
          measure: item.unit || item.measure || '',
          checked: item.checked || false,
          recipeId: item.recipeId || '',
          recipeName: item.recipeName || '',
          addedAt: Date.now(),
        });
      }
    }

    // Link pantry items
    if (args.guestData.pantry && args.guestData.pantry.length > 0) {
      for (const item of args.guestData.pantry) {
        await ctx.db.insert('pantry', {
          userId: args.userId,
          name: item.name || item.ingredient || 'Item',
          displayName: item.displayName || item.name || item.ingredient || 'Item',
          measure: item.unit || item.measure || '',
          addedAt: Date.now(),
        });
      }
    }

    // Link recipe history
    if (args.guestData.recipeHistory && args.guestData.recipeHistory.length > 0) {
      for (const recipeId of args.guestData.recipeHistory) {
        await ctx.db.insert('recipeHistory', {
          userId: args.userId,
          recipeId: typeof recipeId === 'string' ? recipeId : String(recipeId),
          recipeName: String(recipeId), // Will be updated when recipe is fetched
          viewedAt: Date.now(),
        });
      }
    }

    return { success: true };
  },
});

