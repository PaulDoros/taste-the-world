import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Get all purchases for a user
 */
export const getUserPurchases = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Not authenticated');
    }

    // Get all purchases for this user
    return await ctx.db
      .query('purchases')
      .withIndex('by_user', (q) => q.eq('userId', session.userId))
      .order('desc')
      .collect();
  },
});

/**
 * Get purchase by transaction ID
 */
export const getPurchaseByTransactionId = query({
  args: { transactionId: v.string() },
  handler: async (ctx, args) => {
    // This could be used to verify purchases from payment processors
    const purchases = await ctx.db
      .query('purchases')
      .filter((q) => q.eq(q.field('transactionId'), args.transactionId))
      .collect();

    return purchases[0] || null;
  },
});

/**
 * Update purchase status (for payment webhooks)
 */
export const updatePurchaseStatus = mutation({
  args: {
    transactionId: v.string(),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('refunded')
    ),
  },
  handler: async (ctx, args) => {
    const purchase = await ctx.db
      .query('purchases')
      .filter((q) => q.eq(q.field('transactionId'), args.transactionId))
      .first();

    if (!purchase) {
      throw new Error('Purchase not found');
    }

    await ctx.db.patch(purchase._id, {
      status: args.status,
    });

    // If purchase is completed, update user subscription
    if (args.status === 'completed') {
      const user = await ctx.db.get(purchase.userId);
      if (user) {
        const now = Date.now();
        const oneMonth = 1000 * 60 * 60 * 24 * 30;
        const oneYear = 1000 * 60 * 60 * 24 * 365;

        const subscriptionEndDate =
          purchase.subscriptionType === 'monthly'
            ? now + oneMonth
            : now + oneYear;

        await ctx.db.patch(user._id, {
          subscriptionType: purchase.subscriptionType,
          subscriptionStartDate: now,
          subscriptionEndDate,
          updatedAt: now,
        });
      }
    }

    return await ctx.db.get(purchase._id);
  },
});
