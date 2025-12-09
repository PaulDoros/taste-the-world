import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Save user message (Mutation)
 * Creates a new chat if needed
 */
export const saveUserMessage = mutation({
  args: {
    chatId: v.optional(v.id('chats')),
    content: v.string(),
    token: v.string(), // Session token for authentication
    mode: v.optional(v.union(v.literal('chef'), v.literal('travel'))),
  },
  handler: async (ctx, args) => {
    // Verify session token
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthorized');
    }

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error('User not found');

    let chatId = args.chatId;

    if (!chatId) {
      // Create new chat
      chatId = await ctx.db.insert('chats', {
        userId: user._id,
        title:
          args.content.slice(0, 30) + (args.content.length > 30 ? '...' : ''),
        lastMessageAt: Date.now(),
        mode: args.mode || 'chef',
      });
    } else {
      // Update existing chat
      await ctx.db.patch(chatId, {
        lastMessageAt: Date.now(),
      });
    }

    const messageId = await ctx.db.insert('messages', {
      chatId,
      userId: user._id,
      role: 'user',
      content: args.content,
      createdAt: Date.now(),
    });

    return { chatId, messageId };
  },
});

/**
 * Save AI response (Mutation)
 */
export const saveAiResponse = mutation({
  args: {
    chatId: v.id('chats'),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const chat = await ctx.db.get(args.chatId);
    if (!chat) throw new Error('Chat not found');

    await ctx.db.insert('messages', {
      chatId: args.chatId,
      userId: chat.userId,
      role: 'assistant',
      content: args.content,
      createdAt: Date.now(),
    });

    // Update chat timestamp
    await ctx.db.patch(args.chatId, {
      lastMessageAt: Date.now(),
    });
  },
});

/**
 * Get messages for a chat
 */
export const getMessages = query({
  args: {
    chatId: v.id('chats'),
    token: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to get user from token if provided
    let userId;
    if (args.token) {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_token', (q) => q.eq('token', args.token!))
        .first();
      if (session && Date.now() <= session.expiresAt) {
        userId = session.userId;
      }
    }

    // Fallback to standard auth (for backward compatibility or real users)
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query('users')
          .withIndex('by_email', (q) => q.eq('email', identity.email!))
          .unique();
        userId = user?._id;
      }
    }

    if (!userId) return [];

    // Verify chat belongs to user
    const chat = await ctx.db.get(args.chatId);
    if (!chat || chat.userId !== userId) return [];

    const messages = await ctx.db
      .query('messages')
      .withIndex('by_chat_and_created', (q) => q.eq('chatId', args.chatId))
      .order('asc')
      .collect();

    return messages;
  },
});

/**
 * Get all chats for a user, optionally filtered by mode
 */
export const getChats = query({
  args: {
    token: v.optional(v.string()),
    mode: v.optional(v.union(v.literal('chef'), v.literal('travel'))),
  },
  handler: async (ctx, args) => {
    // Try to get user from token if provided
    let userId;
    if (args.token) {
      const session = await ctx.db
        .query('sessions')
        .withIndex('by_token', (q) => q.eq('token', args.token!))
        .first();
      if (session && Date.now() <= session.expiresAt) {
        userId = session.userId;
      }
    }

    // Fallback to standard auth
    if (!userId) {
      const identity = await ctx.auth.getUserIdentity();
      if (identity) {
        const user = await ctx.db
          .query('users')
          .withIndex('by_email', (q) => q.eq('email', identity.email!))
          .unique();
        userId = user?._id;
      }
    }

    if (!userId) return [];

    let chats;
    if (args.mode) {
      chats = await ctx.db
        .query('chats')
        .withIndex('by_user_and_mode', (q) =>
          q.eq('userId', userId).eq('mode', args.mode!)
        )
        .order('desc')
        .collect();
    } else {
      chats = await ctx.db
        .query('chats')
        .withIndex('by_user_and_last_message', (q) => q.eq('userId', userId))
        .order('desc')
        .collect();
    }

    return chats;
  },
});
