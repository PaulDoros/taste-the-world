import { mutation } from './_generated/server';
import { v } from 'convex/values';

/**
 * Sign up with OAuth provider (Google, Apple, etc.)
 * This is a placeholder - you'll need to integrate with actual OAuth providers
 */
export const signUpWithOAuth = mutation({
  args: {
    provider: v.union(
      v.literal('google'),
      v.literal('apple'),
      v.literal('facebook')
    ),
    oauthId: v.string(), // Provider's user ID
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    guestPurchases: v.optional(
      v.array(
        v.object({
          subscriptionType: v.union(v.literal('monthly'), v.literal('yearly')),
          transactionId: v.string(),
          amount: v.number(),
          purchaseDate: v.number(),
        })
      )
    ),
    guestData: v.optional(
      v.object({
        favorites: v.optional(v.array(v.string())),
        shoppingList: v.optional(v.array(v.any())),
        pantry: v.optional(v.array(v.any())),
        recipeHistory: v.optional(v.array(v.any())),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by email
    let user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first();

    if (!user) {
      // Create new user
      const userId = await ctx.db.insert('users', {
        email: args.email.toLowerCase(),
        passwordHash: '', // OAuth users don't have passwords
        name: args.name,
        image: args.image,
        tier: 'free', // Default tier for new OAuth users
        subscriptionType: 'free',
        oauthProvider: args.provider,
        oauthId: args.oauthId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      user = await ctx.db.get(userId);
      if (!user) {
        throw new Error('Failed to create user');
      }

      // Link guest purchases if provided
      if (args.guestPurchases && args.guestPurchases.length > 0) {
        const now = Date.now();
        const oneMonth = 1000 * 60 * 60 * 24 * 30;
        const oneYear = 1000 * 60 * 60 * 24 * 365;

        for (const purchase of args.guestPurchases) {
          await ctx.db.insert('purchases', {
            userId: user._id,
            subscriptionType: purchase.subscriptionType,
            amount: purchase.amount,
            currency: 'USD',
            transactionId: purchase.transactionId,
            purchaseDate: purchase.purchaseDate,
            status: 'completed',
          });

          const subscriptionEndDate =
            purchase.subscriptionType === 'monthly'
              ? purchase.purchaseDate + oneMonth
              : purchase.purchaseDate + oneYear;

          await ctx.db.patch(user._id, {
            subscriptionType: purchase.subscriptionType,
            subscriptionStartDate: purchase.purchaseDate,
            subscriptionEndDate,
            updatedAt: now,
          });
        }
      }

      // Link guest data
      if (args.guestData && user) {
        // Link favorites
        if (args.guestData.favorites && args.guestData.favorites.length > 0) {
          for (const recipeId of args.guestData.favorites) {
            const existing = await ctx.db
              .query('favorites')
              .filter((q) =>
                q.and(
                  q.eq(q.field('userId'), user!._id),
                  q.eq(q.field('recipeId'), recipeId)
                )
              )
              .first();

            if (!existing) {
              await ctx.db.insert('favorites', {
                userId: user._id,
                recipeId,
                recipeName: recipeId,
                addedAt: Date.now(),
              });
            }
          }
        }

        // Link shopping list
        if (
          args.guestData.shoppingList &&
          args.guestData.shoppingList.length > 0
        ) {
          for (const item of args.guestData.shoppingList) {
            await ctx.db.insert('shoppingList', {
              userId: user._id,
              name: item.name || item.ingredient || 'Item',
              measure: item.unit || item.measure || '',
              checked: item.checked || false,
              recipeId: item.recipeId || '',
              recipeName: item.recipeName || '',
              addedAt: Date.now(),
            });
          }
        }

        // Link pantry
        if (args.guestData.pantry && args.guestData.pantry.length > 0) {
          for (const item of args.guestData.pantry) {
            await ctx.db.insert('pantry', {
              userId: user._id,
              name: item.name || item.ingredient || 'Item',
              displayName:
                item.displayName || item.name || item.ingredient || 'Item',
              measure: item.unit || item.measure || '',
              addedAt: Date.now(),
            });
          }
        }

        // Link recipe history
        if (
          args.guestData.recipeHistory &&
          args.guestData.recipeHistory.length > 0
        ) {
          for (const recipeId of args.guestData.recipeHistory) {
            await ctx.db.insert('recipeHistory', {
              userId: user._id,
              recipeId:
                typeof recipeId === 'string' ? recipeId : String(recipeId),
              recipeName: String(recipeId),
              viewedAt: Date.now(),
            });
          }
        }
      }
    } else {
      // User exists - update last login
      await ctx.db.patch(user._id, {
        lastLoginAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

    await ctx.db.insert('sessions', {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      userId: user._id,
      token,
      expiresAt,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        image: user.image,
        tier: user.tier,
        subscriptionType: user.subscriptionType,
        subscriptionStartDate: user.subscriptionStartDate,
        subscriptionEndDate: user.subscriptionEndDate,
        createdAt: user.createdAt,
      },
    };
  },
});

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}
