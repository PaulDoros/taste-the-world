import { v } from 'convex/values';
import { internalQuery } from './_generated/server';

export const getUserStats = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique();

    if (!user) return { error: 'User not found' };

    const pantryItems = await ctx.db
      .query('pantry')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect();

    return {
      _id: user._id,
      email: user.email,
      gamification: user.gamification,
      pantryCountDB: pantryItems.length,
      pantryItems: pantryItems.map((i) => i.displayName),
      badges: user.gamification?.badges || [],
    };
  },
});
