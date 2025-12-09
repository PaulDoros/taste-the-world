import { internalMutation } from '../_generated/server';

export const backfillLanguage = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query('users').collect();
    let updatedCount = 0;

    for (const user of users) {
      if (!user.language) {
        await ctx.db.patch(user._id, { language: 'en' });
        updatedCount++;
      }
    }

    return `Updated ${updatedCount} users with default language 'en'.`;
  },
});
