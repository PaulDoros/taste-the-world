import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get all trips for the current user
 * Sorted by startDate ascending (upcoming first)
 */
export const getTrips = query({
  args: { token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) throw new Error('Unauthenticated');

    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token!))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthenticated');
    }

    const user = await ctx.db.get(session.userId);

    if (!user) throw new Error('User not found');

    if (user.tier !== 'pro' && user.tier !== 'personal') {
      throw new Error('Upgrade Required');
    }

    const trips = await ctx.db
      .query('trips')
      .withIndex('by_user_and_date', (q) => q.eq('userId', user._id))
      .order('asc')
      .collect();

    // Generate URLs for images
    return Promise.all(
      trips.map(async (trip) => ({
        ...trip,
        ticketUrl: trip.ticketStorageId
          ? await ctx.storage.getUrl(trip.ticketStorageId)
          : null,
      }))
    );
  },
});

/**
 * Create a new trip
 */
export const createTrip = mutation({
  args: {
    token: v.string(),
    destination: v.string(),
    startDate: v.number(),
    flightNumber: v.optional(v.string()),
    ticketStorageId: v.optional(v.string()),
    notes: v.optional(v.string()),
    checklist: v.optional(
      v.array(
        v.object({
          text: v.string(),
          checked: v.boolean(),
          notificationId: v.optional(v.string()),
        })
      )
    ),
    idDocuments: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthenticated');
    }

    const user = await ctx.db.get(session.userId);

    if (!user) throw new Error('User not found');

    if (user.tier !== 'pro' && user.tier !== 'personal') {
      throw new Error('Upgrade Required');
    }

    await ctx.db.insert('trips', {
      userId: user._id,
      destination: args.destination,
      startDate: args.startDate,
      flightNumber: args.flightNumber,
      ticketStorageId: args.ticketStorageId,
      notes: args.notes,
      checklist: args.checklist,
      idDocuments: args.idDocuments,
      createdAt: Date.now(),
    });
  },
});

/**
 * Delete a trip and its associated image
 */
export const deleteTrip = mutation({
  args: { id: v.id('trips'), token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthenticated');
    }

    const user = await ctx.db.get(session.userId);

    if (!user || (user.tier !== 'pro' && user.tier !== 'personal')) {
      throw new Error('Upgrade Required');
    }

    const trip = await ctx.db.get(args.id);
    if (!trip) return; // Already deleted?

    // Clean up storage if exists
    if (trip.ticketStorageId) {
      await ctx.storage.delete(trip.ticketStorageId);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Generate a secure upload URL for the ticket image
 */
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt) {
      throw new Error('Unauthenticated');
    }

    const user = await ctx.db.get(session.userId);

    if (!user || (user.tier !== 'pro' && user.tier !== 'personal')) {
      throw new Error('Upgrade Required');
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const getTrip = query({
  args: { id: v.id('trips'), token: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.token) return null;
    const trip = await ctx.db.get(args.id);
    if (!trip) return null;

    // Resolve URLs
    const ticketUrl = trip.ticketStorageId
      ? await ctx.storage.getUrl(trip.ticketStorageId)
      : null;
    const idDocumentUrls = trip.idDocuments
      ? await Promise.all(trip.idDocuments.map((id) => ctx.storage.getUrl(id)))
      : [];

    return { ...trip, ticketUrl, idDocumentUrls };
  },
});

export const updateTrip = mutation({
  args: {
    id: v.id('trips'),
    token: v.string(),
    checklist: v.optional(
      v.array(
        v.object({
          text: v.string(),
          checked: v.boolean(),
          notificationId: v.optional(v.string()),
        })
      )
    ),
    idDocuments: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    flightNumber: v.optional(v.string()),
    startDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('sessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .first();

    if (!session || Date.now() > session.expiresAt)
      throw new Error('Unauthenticated');

    await ctx.db.patch(args.id, {
      ...(args.checklist !== undefined && { checklist: args.checklist }),
      ...(args.idDocuments !== undefined && { idDocuments: args.idDocuments }),
      ...(args.notes !== undefined && { notes: args.notes }),
      ...(args.flightNumber !== undefined && {
        flightNumber: args.flightNumber,
      }),
      ...(args.startDate !== undefined && { startDate: args.startDate }),
    });
  },
});
