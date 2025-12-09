import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

/**
 * Hash password using SHA-256 (Web Crypto API)
 * In production, use bcrypt or Argon2 for better security
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a secure random session token using Web Crypto API
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Create a guest user with Convex authentication
 */
export const createGuestUser = mutation({
  handler: async (ctx) => {
    // Generate unique guest email
    const guestId = crypto.randomUUID();
    const guestEmail = `guest_${guestId}@guest.local`;

    // Create guest user
    const userId = await ctx.db.insert('users', {
      email: guestEmail,
      passwordHash: '', // No password for guests
      tier: 'guest',
      subscriptionType: 'free',
      aiMessagesUsed: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create session token (expires in 7 days)
    const token = generateToken();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days

    await ctx.db.insert('sessions', {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('Failed to create guest user');
    }

    return {
      userId,
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
        aiMessagesUsed: user.aiMessagesUsed,
      },
    };
  },
});

/**
 * Increment AI message usage counter
 */
export const incrementAiUsage = mutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, {
      aiMessagesUsed: (user.aiMessagesUsed || 0) + 1,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Sign up a new user
 */
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.optional(v.string()),
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
    // Validate email format (basic check)
    if (!args.email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Validate password length
    if (args.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const passwordHash = await hashPassword(args.password);
    const userId = await ctx.db.insert('users', {
      email: args.email.toLowerCase(),
      passwordHash,
      name: args.name,
      tier: 'free', // Default tier for new users
      subscriptionType: 'free',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create session token (expires in 30 days)
    const token = generateToken();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

    await ctx.db.insert('sessions', {
      userId,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    // Link guest purchases if provided
    if (args.guestPurchases && args.guestPurchases.length > 0) {
      const now = Date.now();
      const oneMonth = 1000 * 60 * 60 * 24 * 30;
      const oneYear = 1000 * 60 * 60 * 24 * 365;

      for (const purchase of args.guestPurchases) {
        // Create purchase record
        await ctx.db.insert('purchases', {
          userId,
          subscriptionType: purchase.subscriptionType,
          amount: purchase.amount,
          currency: 'USD',
          transactionId: purchase.transactionId,
          purchaseDate: purchase.purchaseDate,
          status: 'completed',
        });

        // Update subscription
        const subscriptionEndDate =
          purchase.subscriptionType === 'monthly'
            ? purchase.purchaseDate + oneMonth
            : purchase.purchaseDate + oneYear;

        await ctx.db.patch(userId, {
          subscriptionType: purchase.subscriptionType,
          subscriptionStartDate: purchase.purchaseDate,
          subscriptionEndDate,
          updatedAt: now,
        });
      }
    }

    // Link guest data if provided
    if (args.guestData) {
      // Link favorites
      if (args.guestData.favorites && args.guestData.favorites.length > 0) {
        for (const recipeId of args.guestData.favorites) {
          const existing = await ctx.db
            .query('favorites')
            .filter((q) =>
              q.and(
                q.eq(q.field('userId'), userId),
                q.eq(q.field('recipeId'), recipeId)
              )
            )
            .first();

          if (!existing) {
            await ctx.db.insert('favorites', {
              userId,
              recipeId,
              recipeName: recipeId, // Will be updated when recipe is fetched
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
            userId,
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
            userId,
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
            userId,
            recipeId:
              typeof recipeId === 'string' ? recipeId : String(recipeId),
            recipeName: String(recipeId), // Will be updated when recipe is fetched
            viewedAt: Date.now(),
          });
        }
      }
    }

    // Get the created user
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return {
      userId,
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

/**
 * Sign in an existing user
 */
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error(
        'No account found with this email address. Please check your email or sign up.'
      );
    }

    // Verify password
    const passwordHash = await hashPassword(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error(
        'Incorrect password. Please try again or reset your password.'
      );
    }

    // Update last login
    await ctx.db.patch(user._id, {
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create new session token
    const token = generateToken();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

    await ctx.db.insert('sessions', {
      userId: user._id,
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    // Return user without password hash
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

/**
 * Verify session token and get user
 */
export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    // Find session by token
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session) {
      return null;
    }

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      // Session expired - return null (cleanup can be done in a separate mutation)
      return null;
    }

    // Get user
    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    // Return user without password hash
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      tier: user.tier,
      subscriptionType: user.subscriptionType,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      createdAt: user.createdAt,
      aiMessagesUsed: user.aiMessagesUsed,
      unlockedCountries: user.unlockedCountries,
    };
  },
});

/**
 * Sign out (delete session)
 */
export const signOut = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

/**
 * Get current user (requires authentication)
 */
export const getCurrentUser = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      return null;
    }

    // Return user without password hash
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      image: user.image,
      tier: user.tier,
      subscriptionType: user.subscriptionType,
      subscriptionStartDate: user.subscriptionStartDate,
      subscriptionEndDate: user.subscriptionEndDate,
      createdAt: user.createdAt,
      aiMessagesUsed: user.aiMessagesUsed,
      unlockedCountries: user.unlockedCountries,
    };
  },
});

/**
 * Update user subscription (for premium purchases)
 */
export const updateSubscription = mutation({
  args: {
    token: v.string(),
    subscriptionType: v.union(
      v.literal('free'),
      v.literal('monthly'),
      v.literal('yearly')
    ),
    transactionId: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Not authenticated');
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const now = Date.now();
    const oneMonth = 1000 * 60 * 60 * 24 * 30;
    const oneYear = 1000 * 60 * 60 * 24 * 365;

    const subscriptionEndDate =
      args.subscriptionType === 'monthly'
        ? now + oneMonth
        : args.subscriptionType === 'yearly'
          ? now + oneYear
          : undefined;

    // Update user subscription
    await ctx.db.patch(user._id, {
      subscriptionType: args.subscriptionType,
      tier: args.subscriptionType !== 'free' ? 'premium' : 'free',
      subscriptionStartDate: args.subscriptionType !== 'free' ? now : undefined,
      subscriptionEndDate,
      updatedAt: now,
    });

    // Record purchase if it's a premium subscription
    if (args.subscriptionType !== 'free' && args.amount) {
      await ctx.db.insert('purchases', {
        userId: user._id,
        subscriptionType: args.subscriptionType,
        amount: args.amount,
        currency: 'USD',
        transactionId: args.transactionId,
        purchaseDate: now,
        status: 'completed',
      });
    }

    return await ctx.db.get(user._id);
  },
});

/**
 * Get user by email (for password reset, etc.)
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.toLowerCase()))
      .first();

    if (!user) {
      return null;
    }

    // Return user without password hash
    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      subscriptionType: user.subscriptionType,
      tier: user.tier,
      aiMessagesUsed: user.aiMessagesUsed,
    };
  },
});
