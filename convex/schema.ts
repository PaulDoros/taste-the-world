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
    tier: v.union(
      v.literal('guest'),
      v.literal('free'),
      v.literal('personal'),
      v.literal('pro')
    ), // User access tier
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
    // Monetization & Limits
    unlockedCountries: v.optional(v.array(v.string())), // Array of unlocked cca2 codes for Free tier
    dailyAiCount: v.optional(v.number()), // Daily AI prompt usage
    dailyTravelCount: v.optional(v.number()), // Daily Travel prompt usage
    lastAiReset: v.optional(v.number()), // Timestamp of last usage reset
    aiMessagesUsed: v.optional(v.number()), // Total lifetime usage (legacy/analytics)
    language: v.optional(v.string()), // User's preferred language (en, ro, fr, etc.)
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
    tier: v.optional(v.string()), // 'personal' | 'pro'
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
    .index('by_area', ['strArea'])
    .index('by_name', ['strMeal']),

  /**
   * Chats table
   * Stores conversation sessions with the AI Chef
   */
  chats: defineTable({
    userId: v.id('users'),
    title: v.string(), // Auto-generated title based on first message
    lastMessageAt: v.number(),
    mode: v.optional(v.union(v.literal('chef'), v.literal('travel'))),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_last_message', ['userId', 'lastMessageAt'])
    .index('by_user_and_mode', ['userId', 'mode']),

  /**
   * Messages table
   * Stores individual messages within a chat
   */
  messages: defineTable({
    chatId: v.id('chats'),
    userId: v.id('users'),
    role: v.union(v.literal('user'), v.literal('assistant')),
    content: v.string(),
    createdAt: v.number(),
  })
    .index('by_chat', ['chatId'])
    .index('by_chat_and_created', ['chatId', 'createdAt']),

  mealPlans: defineTable({
    userId: v.id('users'),
    startDate: v.number(), // Timestamp
    plan: v.string(), // JSON string of the plan
    createdAt: v.number(),
    type: v.optional(v.union(v.literal('standard'), v.literal('baby'))),
    shoppingListData: v.optional(v.string()), // Cache for generated shopping list
  })
    .index('by_user', ['userId'])
    .index('by_user_and_date', ['userId', 'startDate'])
    .index('by_user_and_type', ['userId', 'type']),

  /**
   * Meal Plan Templates (Public/Shared)
   * Optimization: Reusable plans to reduce AI costs
   */
  mealPlanTemplates: defineTable({
    name: v.string(), // e.g. "High Protein Standard", "Baby Weaning Week 1"
    plan: v.string(), // JSON string
    type: v.union(v.literal('standard'), v.literal('baby')),
    tags: v.array(v.string()), // ['vegetarian', 'keto', '6-months']
    usageCount: v.number(),
    createdAt: v.number(),
  }).index('by_type', ['type']),

  /**
   * Baby Profiles table
   * Tracks individual baby profiles for multiple children
   */
  babyProfiles: defineTable({
    userId: v.id('users'),
    name: v.string(),
    birthDate: v.number(), // Timestamp
    allergies: v.array(v.string()), // e.g. ['peanuts', 'eggs']
    createdAt: v.number(),
  }).index('by_user', ['userId']),

  /**
   * Baby Tried Foods table
   * History of introduced foods and reactions
   */
  babyTriedFoods: defineTable({
    babyId: v.id('babyProfiles'),
    foodName: v.string(), // Lowercase, normalized
    dateTried: v.number(),
    reaction: v.union(
      v.literal('liked'),
      v.literal('neutral'),
      v.literal('disliked'),
      v.literal('allergic')
    ),
    notes: v.optional(v.string()),
  })
    .index('by_baby', ['babyId'])
    .index('by_baby_and_food', ['babyId', 'foodName']),

  /**
   * Translations table
   * Stores cached translations for dynamic content (e.g. recipes)
   */
  translations: defineTable({
    relatedId: v.string(), // ID of the object being translated (e.g. recipeId)
    language: v.string(), // Target language code (e.g. 'es', 'fr')
    field: v.string(), // Field being translated (e.g. 'instructions', 'overview' or 'full')
    content: v.any(), // The translated content (string or object)
    createdAt: v.number(),
  })
    .index('by_relatedId_language', ['relatedId', 'language'])
    .index('by_relatedId_language_field', ['relatedId', 'language', 'field']),

  /**
   * Trips table
   * Stores user travel plans and ticket images
   */
  trips: defineTable({
    userId: v.id('users'),
    destination: v.string(), // e.g. "Paris, France"
    startDate: v.number(), // Timestamp
    flightNumber: v.optional(v.string()), // e.g. "RO341"
    ticketStorageId: v.optional(v.string()), // Convex Storage ID for image
    notes: v.optional(v.string()), // "Gate closes at 10:00"
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_user_and_date', ['userId', 'startDate']),
});
