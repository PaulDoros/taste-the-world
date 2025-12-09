import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { api } from './_generated/api';
import { callGemini } from './ai';

// --- Mutations ---

export const createProfile = mutation({
  args: {
    name: v.string(),
    birthDate: v.number(),
    allergies: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Unauthorized');

    // Check if user already has a user record
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', userId.email!))
      .first();

    if (!user) throw new Error('User not found');

    const profileId = await ctx.db.insert('babyProfiles', {
      userId: user._id,
      name: args.name,
      birthDate: args.birthDate,
      allergies: args.allergies,
      createdAt: Date.now(),
    });

    return profileId;
  },
});

export const logTriedFood = mutation({
  args: {
    babyId: v.id('babyProfiles'),
    foodName: v.string(),
    reaction: v.union(
      v.literal('liked'),
      v.literal('neutral'),
      v.literal('disliked'),
      v.literal('allergic')
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Unauthorized');

    // Ensure user owns the baby profile
    const profile = await ctx.db.get(args.babyId);
    if (!profile) throw new Error('Profile not found');

    // Verify ownership
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', userId.email!))
      .unique();

    if (!user || profile.userId !== user._id)
      throw new Error('Unauthorized access to profile');

    await ctx.db.insert('babyTriedFoods', {
      babyId: args.babyId,
      foodName: args.foodName.toLowerCase(),
      dateTried: Date.now(),
      reaction: args.reaction,
      notes: args.notes,
    });
  },
});

// --- Queries ---

export const getProfile = query({
  handler: async (ctx) => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) return null;

    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', userId.email!))
      .first();

    if (!user) return null;

    return await ctx.db
      .query('babyProfiles')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .first();
  },
});

export const getTriedFoods = query({
  args: { babyId: v.id('babyProfiles') },
  handler: async (ctx, args) => {
    const foods = await ctx.db
      .query('babyTriedFoods')
      .withIndex('by_baby', (q) => q.eq('babyId', args.babyId))
      .collect();

    return foods;
  },
});

// --- Actions (AI) ---

export const generateDiversificationPlan = action({
  args: {
    babyId: v.id('babyProfiles'),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch Profile & Tried Foods
    const profile = await ctx.runQuery(api.babyFood.getProfile);
    if (!profile || profile._id !== args.babyId)
      throw new Error('Profile not found');

    const triedFoods = await ctx.runQuery(api.babyFood.getTriedFoods, {
      babyId: args.babyId,
    });

    const triedFoodNames = triedFoods
      .map((f) => `${f.foodName} (${f.reaction})`)
      .join(', ');
    const allergies = profile.allergies.join(', ');

    const languageInstruction = args.language
      ? `Output MUST be in ${args.language} language.`
      : '';

    // 2. Construct Prompt
    const prompt = `
      Baby Name: ${profile.name}
      Age: ${Math.floor((Date.now() - profile.birthDate) / (1000 * 60 * 60 * 24 * 30.44))} months
      Allergies: ${allergies || 'None'}
      Tried Foods History: ${triedFoodNames || 'None yet'}
      ${languageInstruction}

      Task: Generate a 7-day meal plan (3 meals/day).
      
      CRITICAL RULES:
      1. Introduce only 1-2 NEW ingredients this week.
      2. If a new ingredient is introduced, serve it for 3 consecutive days to check for allergies.
      3. Use ONLY previously 'liked' or 'neutral' foods as the base.
      4. AVOID foods marked as 'disliked' or 'allergic'.
      5. Ensure texture is appropriate for the age.
      
      Return JSON format:
      {
        "newIngredients": ["food1", "food2"],
        "plan": [
          {
            "day": 1,
            "meals": { "breakfast": "...", "lunch": "...", "dinner": "..." }
          },
          ...
        ]
      }
    `;

    const instructions = `You are a Pediatric Nutritionist specialized in weaning and diversification. 
    Your goal is to safely introduce solids to babies. 
    Strictly follow the 3-day wait rule for new foods.
    ${languageInstruction}`;

    // 3. Call AI
    const result = await callGemini(
      process.env.GOOGLE_GENERATIVE_AI_KEY!,
      [{ role: 'user', parts: [{ text: prompt }] }],
      instructions,
      'application/json'
    );

    // result is already the text string content from callGemini
    const jsonText = result;
    if (!jsonText) throw new Error('Failed to generate plan');

    try {
      const parsed = JSON.parse(jsonText);
      return parsed;
    } catch (e) {
      throw new Error('Invalid JSON from AI');
    }
  },
});
