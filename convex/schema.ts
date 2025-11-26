import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

/**
 * Convex Database Schema
 * Defines all tables for Taste the World app
 */
export default defineSchema({
  /**
   * Users table
   * Stores user authentication and profile data
   */
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(), // Hashed password (OAuth users have empty string)
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    tier: v.union(v.literal('guest'), v.literal('free'), v.literal('premium')), // User access tier
    subscriptionType: v.union(
      v.literal('free'),
      v.literal('monthly'),
      v.literal('yearly')
    ),
    subscriptionStartDate: v.optional(v.number()),
    subscriptionEndDate: v.optional(v.number()),
    oauthProvider: v.optional(
      v.union(v.literal('google'), v.literal('apple'), v.literal('facebook'))
    ),
    oauthId: v.optional(v.string()), // Provider's user ID
    createdAt: v.number(),
    updatedAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  })
    .index('by_email', ['email'])
    .index('by_tier', ['tier'])
    .index('by_subscription', ['subscriptionType'])
    .index('by_oauth', ['oauthProvider', 'oauthId']),

  /**
   * Sessions table
   * Stores user session tokens for authentication
   */
  sessions: defineTable({
    userId: v.id('users'),
    token: v.string(), // Session token
    expiresAt: v.number(), // Expiration timestamp
    createdAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_user', ['userId']),

  /**
   * Purchases table
   * Tracks premium subscription purchases
   */
  purchases: defineTable({
    userId: v.id('users'),
    subscriptionType: v.union(v.literal('monthly'), v.literal('yearly')),
    amount: v.number(), // Purchase amount in cents
    currency: v.string(), // e.g., "USD"
    transactionId: v.optional(v.string()), // Payment processor transaction ID
    purchaseDate: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('completed'),
      v.literal('failed'),
      v.literal('refunded')
    ),
  })
    .index('by_user', ['userId'])
    .index('by_status', ['status']),

  /**
   * Pantry items table
   * Stores user's pantry items with quantities
   */
  pantry: defineTable({
    userId: v.id('users'),
    name: v.string(), // Normalized lowercase name
    displayName: v.string(), // Original display name
    measure: v.string(), // Quantity (e.g., "500g", "2 cups")
    addedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_name', ['userId', 'name']),

  /**
   * Shopping list items table
   * Stores shopping list items with recipe associations
   */
  shoppingList: defineTable({
    userId: v.id('users'),
    name: v.string(),
    measure: v.string(),
    recipeId: v.string(), // TheMealDB recipe ID
    recipeName: v.string(),
    checked: v.boolean(),
    addedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_checked', ['userId', 'checked'])
    .index('by_user_and_recipe', ['userId', 'recipeId']),

  /**
   * Favorites table
   * Stores user's favorite recipes
   */
  favorites: defineTable({
    userId: v.id('users'),
    recipeId: v.string(), // TheMealDB recipe ID
    recipeName: v.string(),
    recipeImage: v.optional(v.string()),
    recipeArea: v.optional(v.string()),
    recipeCategory: v.optional(v.string()),
    addedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_recipe', ['userId', 'recipeId']),

  /**
   * Recipe history table
   * Stores user's recipe viewing history
   */
  recipeHistory: defineTable({
    userId: v.id('users'),
    recipeId: v.string(), // TheMealDB recipe ID
    recipeName: v.string(),
    recipeImage: v.optional(v.string()),
    recipeArea: v.optional(v.string()),
    recipeCategory: v.optional(v.string()),
    viewedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_recipe', ['userId', 'recipeId'])
    .index('by_user_and_viewed', ['userId', 'viewedAt']),

  /**
   * Recipes table (Global)
   * Stores cached recipes from external APIs
   */
  recipes: defineTable({
    idMeal: v.string(), // External ID (or ninja_...)
    strMeal: v.string(),
    strCategory: v.string(),
    strArea: v.string(),
    strInstructions: v.string(),
    strMealThumb: v.string(),
    strTags: v.optional(v.string()),
    strYoutube: v.optional(v.string()),
    strSource: v.optional(v.string()),
    // Ingredients (simplified storage for querying)
    ingredients: v.array(
      v.object({
        name: v.string(),
        measure: v.string(),
      })
    ),
    // Raw fields for full compatibility if needed
    raw: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index('by_idMeal', ['idMeal'])
    .index('by_area', ['strArea']),
});
