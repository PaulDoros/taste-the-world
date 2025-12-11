import { mutation } from './_generated/server';

export const backfillGamification = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    let count = 0;

    for (const user of users) {
      if (!user.gamification) {
        await ctx.db.patch(user._id, {
          gamification: {
            xp: 0,
            level: 1,
            currentStreak: 0,
            lastActivityDate: 0,
            badges: [],
          },
        });
        count++;
      }
    }

    return `Backfilled ${count} users.`;
  },
});
