import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

/**
 * Get all trips for the current user
 * Sorted by startDate ascending (upcoming first)
 */
export const getTrips = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .unique();

    if (!user) throw new Error('User not found');

    if (user.tier !== 'pro') {
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
    destination: v.string(),
    startDate: v.number(),
    flightNumber: v.optional(v.string()),
    ticketStorageId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .unique();

    if (!user) throw new Error('User not found');

    if (user.tier !== 'pro') {
      throw new Error('Upgrade Required');
    }

    await ctx.db.insert('trips', {
      userId: user._id,
      destination: args.destination,
      startDate: args.startDate,
      flightNumber: args.flightNumber,
      ticketStorageId: args.ticketStorageId,
      notes: args.notes,
      createdAt: Date.now(),
    });
  },
});

/**
 * Delete a trip and its associated image
 */
export const deleteTrip = mutation({
  args: { id: v.id('trips') },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthenticated');

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', identity.email!))
      .unique();

    if (!user || user.tier !== 'pro') {
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
export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthenticated');

  const user = await ctx.db
    .query('users')
    .withIndex('by_email', (q) => q.eq('email', identity.email!))
    .unique();

  if (!user || user.tier !== 'pro') {
    throw new Error('Upgrade Required');
  }

  return await ctx.storage.generateUploadUrl();
});
