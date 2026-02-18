import { v } from 'convex/values';
import { internalQuery, internalMutation } from './_generated/server';

export const getUserActivities = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) return { error: 'User not found' };

    const activities = await ctx.db
      .query('activities')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .order('desc')
      .take(20);

    return {
      email: user.email,
      activityCount: activities.length,
      recentActivities: activities,
      gamificationStats: user.gamification,
    };
  },
});

export const logTestActivity = internalMutation({
  args: { email: v.string(), actionType: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) return { error: 'User not found' };

    // 1. Log to activities
    await ctx.db.insert('activities', {
      userId: user._id,
      actionType: args.actionType,
      data: { source: 'admin_test' },
      timestamp: Date.now(),
    });

    // 2. Fetch/Init Stats (Simplified for test)
    // Skipped patching user to avoid type errors in debug script

    return { success: true, message: 'Logged test activity' };
  },
});
