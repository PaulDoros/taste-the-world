import { internalMutation } from './_generated/server';
import { v } from 'convex/values';
import { Id } from './_generated/dataModel';

export const handleWebhookEvent = internalMutation({
  args: {
    body: v.any(),
  },
  handler: async (ctx, args) => {
    const { event } = args.body;

    if (!event) {
      console.error('No event in webhook body');
      return;
    }

    const { type, app_user_id, expiration_at_ms, entitlement_id, product_id } =
      event;

    // app_user_id should be the Convex user ID
    // But since we use .logIn(user._id), the app_user_id IS the convex ID.
    const userId = app_user_id as Id<'users'>;

    const user = await ctx.db.get(userId);

    if (!user) {
      console.error(`User not found for ID: ${userId}`);
      return;
    }

    // Store RC Customer ID if not present
    if (!user.revenueCatCustomerId && event.original_app_user_id) {
      await ctx.db.patch(user._id, {
        revenueCatCustomerId: event.original_app_user_id,
      });
    }

    let subscriptionType = user.subscriptionType;
    let tier = user.tier;

    if (
      type === 'INITIAL_PURCHASE' ||
      type === 'RENEWAL' ||
      type === 'UNCANCELLATION'
    ) {
      const productId = product_id as string;

      if (productId.includes('weekly')) subscriptionType = 'weekly';
      else if (productId.includes('monthly')) subscriptionType = 'monthly';
      else if (productId.includes('yearly')) subscriptionType = 'yearly';

      if (productId.includes('pro')) tier = 'pro';
      else if (productId.includes('personal'))
        tier = 'personal'; // Assuming personal is default premium
      else tier = 'personal'; // Default fallback

      // Calculate end date
      const endDate = expiration_at_ms || Date.now() + 30 * 24 * 60 * 60 * 1000; // Fallback 30 days

      await ctx.db.patch(user._id, {
        subscriptionType: subscriptionType as any,
        tier: tier as any,
        subscriptionEndDate: endDate,
        updatedAt: Date.now(),
      });
    } else if (type === 'CANCELLATION' || type === 'EXPIRATION') {
      // Only downgrade if expired
      if (
        type === 'EXPIRATION' ||
        (expiration_at_ms && Date.now() > expiration_at_ms)
      ) {
        await ctx.db.patch(user._id, {
          subscriptionType: 'free',
          tier: 'free',
          updatedAt: Date.now(),
        });
      }
      // If type is CANCELLATION, it just means auto-renew is off, not that access is lost immediately.
      // Usually we rely on EXPIRATION event for downgrading.
    }

    // Log the event
    await ctx.db.insert('activities', {
      userId: user._id,
      actionType: `revenuecat_webhook_${type.toLowerCase()}`,
      data: { eventId: event.id, productId: product_id },
      timestamp: Date.now(),
    });
  },
});
