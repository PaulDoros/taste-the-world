import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

// Constants
// Constants
const GEMINI_MODEL = 'gemini-2.5-flash';
const SYSTEM_PROMPT = `You are a world-class chef assistant for the "Taste the World" app. 
Your goal is to help users with cooking, recipes, and culinary advice.
- Be friendly, encouraging, and concise.
- If asked about a specific country's cuisine, provide authentic insights.
- If asked for a recipe, provide the step by step instructions.
- When listing **vegetables or plant-based ingredients**, ALWAYS format them as **bold** text (e.g., "**2 carrots**").
- When listing **meat (beef, pork, chicken)**, ALWAYS format them as *italic* text (e.g., "*500g beef*").
- When listing **fish or seafood**, ALWAYS format them as a link with 'fish' as URL (e.g., "[Salmon](fish)").
- When listing **dairy or eggs**, ALWAYS format them as a link with 'dairy' as URL (e.g., "[2 eggs](dairy)").
- When listing **condiments, spices, or seasonings**, ALWAYS format them as ~~strikethrough~~ text (e.g., "~~1 tsp salt~~").
- When mentioning **cooking temperatures**, ALWAYS format them as \`inline code\` (e.g., \`180°C\`).
- When mentioning **cooking times**, ALWAYS format them as a link with 'time' as URL (e.g., "[20 mins](time)").
- When listing ingredients, ALWAYS provide measurements in both Metric (g, ml) and Imperial (oz, cups, lb) units (e.g., "**500g (1.1 lb) flour**").
- When providing a recipe, ALWAYS include a JSON block at the end with the ingredients for the shopping list. Format:
\`\`\`json
{
  "recipeName": "Name",
  "items": [{"name": "Ingredient", "measure": "Quantity"}]
}
\`\`\`
- Do not answer questions unrelated to food or cooking.`;

const TRAVEL_AGENT_PROMPT = `You are an expert Travel Guide for the "Taste the World" app.
Your goal is to help users plan trips, discover new places, and explore local cultures.
- Act as a knowledgeable local guide who loves sharing hidden gems.
- When suggesting places, ALWAYS provide specific city names and locations.
- When mentioning specific locations or dishes, format them as **bold** text.
- When mentioning practical details like prices, opening hours, or travel times, format them as \`inline code\`.
- For top attractions, include a Google Maps link in markdown format: [Location Name](https://www.google.com/maps/search/?api=1&query=Location+Name).
- Be enthusiastic and inspiring about travel.
- If asked about food, focus on the cultural context and best places to eat it.`;

const MEAL_PLANNER_PROMPT = `You are an expert Nutritionist and Meal Planner for the "Taste the World" app.
Your goal is to create balanced, diverse, and delicious weekly meal plans.
- Create a complete 7-day meal plan (Monday to Sunday).
- Provide 3 distinct meals (Breakfast, Lunch, Dinner) for EACH day.
- Ensure variety in ingredients and cuisines to keep it interesting.
- Balance nutrition (protein, carbs, healthy fats, veggies).
- Return ONLY a JSON object with the exact structure requested.
- Do not include any markdown formatting or conversational text.`;

const BABY_FOOD_PROMPT = `You are an expert Pediatric Nutritionist for the "Taste the World" app.
Your goal is to create safe, nutritious, and developmentally appropriate meal plans for babies (6-12 months).
- Create a 7-day plan with 3 meals (Breakfast, Lunch, Dinner) per day.
- Focus on **weaning and diversification**.
- **Textures**: Progress from smooth purees to lumpy/mashed to soft finger foods.
- **Iron-Rich**: Ensure at least one iron-rich food daily (fortified cereal, meat, beans).
- **Allergens**: Introduce common allergens (peanut, egg, dairy) one at a time.
- **Safety**: Avoid honey, whole nuts, added salt, and sugar.
- Return ONLY a JSON object with the exact structure requested.
- Do not include any markdown formatting or conversational text.`;

/**
 * Helper to call Gemini API
 */
/**
 * Helper to call Gemini API
 */
export async function callGemini(
  apiKey: string,
  contents: any[],
  systemInstruction?: string,
  responseMimeType?: string,
  maxTokens: number = 8192
) {
  // Fallback to 1.5 flash if 2.5 is failing or invalid
  const model = GEMINI_MODEL; // Keep as is for now, but consider 'gemini-1.5-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const body: any = {
    contents,
    generationConfig: {
      maxOutputTokens: maxTokens,
    },
  };

  // Dacă vrei să folosești sistem prompt nativ (opțional):
  if (systemInstruction) {
    body.systemInstruction = {
      role: 'system',
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseMimeType === 'application/json') {
    // atenție: aici e JSON raw, nu SDK, deci snake_case
    body.generationConfig.response_mime_type = 'application/json';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // LOG de debugging util (poți comenta dacă te deranjează):
  // console.log('Gemini raw response:', JSON.stringify(data, null, 2));

  const candidates = Array.isArray(data.candidates) ? data.candidates : [];

  if (!candidates.length) {
    throw new Error(
      `No candidates returned from Gemini: ${JSON.stringify(data)}`
    );
  }

  const firstCandidate = candidates[0];

  if (!firstCandidate.content || !Array.isArray(firstCandidate.content.parts)) {
    throw new Error(
      `No content parts in first candidate: ${JSON.stringify(firstCandidate)}`
    );
  }

  const textPart = firstCandidate.content.parts.find(
    (p: any) => typeof p.text === 'string'
  );

  if (!textPart) {
    throw new Error(
      `No text part in candidate parts: ${JSON.stringify(firstCandidate.content.parts)}`
    );
  }

  return textPart.text as string;
}

/**
 * Send a message to the AI Chef
 */
export const sendMessage = action({
  args: {
    chatId: v.optional(v.id('chats')),
    content: v.string(),
    token: v.string(), // Session token for authentication
    mode: v.optional(v.union(v.literal('chef'), v.literal('travel'))),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ content: string; chatId: any }> => {
    // Save user message via mutation (passing token)
    const { chatId } = await ctx.runMutation(api.chat.saveUserMessage, {
      chatId: args.chatId,
      content: args.content,
      token: args.token,
      mode: args.mode,
    });

    // Get user for quota checking
    const user = await ctx.runQuery(api.auth.getCurrentUser, {
      token: args.token,
    });

    if (!user) throw new Error('Unauthorized');

    // Check AI quota
    const aiMessagesUsed = user.aiMessagesUsed || 0;
    const tier = user.tier || 'guest';
    const subscriptionType = user.subscriptionType || 'free';

    // Define quotas based on tier
    let maxQuota: number;
    if (tier === 'pro') {
      maxQuota = Infinity; // Pro users have unlimited prompts
    } else if (tier === 'personal') {
      maxQuota = 20; // Personal users get 20 prompts
    } else if (tier === 'guest') {
      maxQuota = 1; // Guests get 1 prompt
    } else {
      maxQuota = 3; // Free users get 3 prompts
    }

    if (aiMessagesUsed >= maxQuota) {
      const errorMessage =
        tier === 'guest'
          ? 'You have used your free AI prompt. Please sign up for more prompts!'
          : subscriptionType === 'free'
            ? 'You have used all 3 free AI prompts. Upgrade to premium for unlimited access!'
            : 'AI quota exceeded';

      await ctx.runMutation(api.chat.saveAiResponse, {
        chatId,
        content: errorMessage,
      });

      throw new Error('AI_QUOTA_EXCEEDED');
    }

    // Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY; // Fallback for transition
    if (!apiKey) {
      await ctx.runMutation(api.chat.saveAiResponse, {
        chatId,
        content:
          "I'm currently in offline mode (API Key missing). Please set GEMINI_API_KEY in Convex.",
      });
      return { content: 'Mock Response', chatId };
    }

    try {
      // Fetch recent history for context
      const messages = await ctx.runQuery(api.chat.getMessages, { chatId });

      // Format messages for Gemini (Gemini expects "user" and "model" roles)
      let contents = messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      // Ensure we have at least the user's message
      if (contents.length === 0) {
        contents = [
          {
            role: 'user',
            parts: [{ text: args.content }],
          },
        ];
      }

      // HIDDEN CONTEXT: Reinforce JSON requirement for Chef mode
      // We append this to the prompt sent to AI, but the user sees the clean version in DB
      if (!args.mode || args.mode === 'chef') {
        const lastPart = contents[contents.length - 1].parts[0];
        lastPart.text +=
          '\n\nIMPORTANT: You MUST end your response with the JSON block for the shopping list as specified in your system instructions.';
      }

      // Add language instruction if provided
      const languageInstruction = args.language
        ? `\n\nIMPORTANT: The user speaks ${args.language}. You MUST reply in ${args.language}.`
        : '';

      // Select system prompt based on mode
      const selectedSystemPrompt =
        args.mode === 'travel' ? TRAVEL_AGENT_PROMPT : SYSTEM_PROMPT;

      // Prepend system prompt as first user message (v1 API doesn't support systemInstruction)
      contents.unshift({
        role: 'user',
        parts: [{ text: selectedSystemPrompt + languageInstruction }],
      });

      const responseText = await callGemini(apiKey, contents);

      // Save AI response
      await ctx.runMutation(api.chat.saveAiResponse, {
        chatId,
        content: responseText,
      });

      // Increment AI usage counter (only after successful response)
      await ctx.runMutation(api.auth.incrementAiUsage, {
        userId: user._id,
      });

      return { content: responseText, chatId };
    } catch (error) {
      console.error('AI Error:', error);
      await ctx.runMutation(api.chat.saveAiResponse, {
        chatId,
        content:
          "I'm having trouble connecting to the kitchen right now. Please try again later.",
      });
      return { content: 'Error', chatId };
    }
  },
});

/**
 * Generate a recipe based on ingredients
 */
export const generateRecipe = action({
  args: {
    ingredients: v.array(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    // Allow both authenticated and guest users

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return JSON.stringify({
        name: 'Mock Recipe (No API Key)',
        description: 'Please configure GEMINI_API_KEY.',
        ingredients: args.ingredients,
        instructions: ['Step 1: Get Key', 'Step 2: Cook'],
        time: '5 mins',
      });
    }

    const languageInstruction = args.language
      ? `You MUST reply in ${args.language} language.`
      : '';

    const prompt = `Create a recipe using some or all of these ingredients: ${args.ingredients.join(', ')}. 
    You can add common pantry staples.
    ${languageInstruction}
    Return ONLY a JSON object with this structure:
    {
      "name": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["List of ingredients with quantities"],
      "instructions": ["Step 1", "Step 2"],
      "time": "Cooking time"
    }`;

    try {
      const responseText = await callGemini(
        apiKey,
        [{ role: 'user', parts: [{ text: prompt }] }],
        `You are a helpful chef. ${languageInstruction}`,
        'application/json'
      );
      return responseText;
    } catch (error) {
      console.error('Recipe Generation Error:', error);
      throw new Error('Failed to generate recipe');
    }
  },
});

/**
 * Generate a weekly meal plan
 */
export const generateMealPlan = action({
  args: {
    preferences: v.string(),
    type: v.optional(v.union(v.literal('standard'), v.literal('baby'))),
    cuisine: v.optional(v.string()), // New optional parameter
    token: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Resolve user from token if provided
    let userId;
    if (args.token) {
      const user = await ctx.runQuery(api.auth.getCurrentUser, {
        token: args.token,
      });
      if (user) userId = user._id;
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const mockPlan = {
        days: [
          {
            day: 'Day 1',
            meals: { breakfast: 'Mock', lunch: 'Mock', dinner: 'Mock' },
          },
        ],
      };
      if (userId) {
        await ctx.runMutation(api.mealPlan.saveMealPlan, {
          plan: JSON.stringify(mockPlan),
          startDate: Date.now(),
          type: args.type === 'baby' ? 'baby' : 'standard',
          userId: userId,
        });
      }
      return JSON.stringify(mockPlan);
    }

    const isBaby = args.type === 'baby';

    const languageInstruction = args.language
      ? `You MUST reply in ${args.language} language.`
      : '';

    // Construct Prompt with Cuisine
    let basePrompt = '';

    if (isBaby) {
      basePrompt = `Create a 7-day BABY food diversification plan (6-12 months). Preferences: "${args.preferences}".${args.cuisine ? `\nFocus exclusively on **${args.cuisine}** cuisine/ingredients where appropriate for a baby.` : ''}`;
    } else {
      basePrompt = `Create a complete 7-day meal plan based on these preferences: "${args.preferences}".${args.cuisine ? `\nFocus exclusively on **${args.cuisine}** cuisine/recipes.` : ''}`;
    }

    const prompt = isBaby
      ? `${basePrompt}
      ${languageInstruction}
      You MUST provide 3 meals (breakfast, lunch, dinner) for EACH of the 7 days.
      Return ONLY a JSON object with this exact structure:
      {
        "days": [
          {
            "day": "Monday",
            "meals": {
              "breakfast": "Name of breakfast",
              "lunch": "Name of lunch",
              "dinner": "Name of dinner"
            }
          },
          ... (repeat for all 7 days)
        ]
      }`
      : `${basePrompt}
      ${languageInstruction}
      You MUST provide 3 meals (breakfast, lunch, dinner) for EACH of the 7 days.
      Return ONLY a JSON object with this exact structure:
      {
        "days": [
          {
            "day": "Monday",
            "meals": {
              "breakfast": "Name of breakfast",
              "lunch": "Name of lunch",
              "dinner": "Name of dinner"
            }
          },
          ... (repeat for all 7 days)
        ]
      }`;

    // 1. Tag Analysis (Simple Regex for now, can be AI later)
    const tags: string[] = [];
    const lowerPref = args.preferences.toLowerCase();

    const commonTags = [
      'vegetarian',
      'vegan',
      'keto',
      'paleo',
      'gluten-free',
      'dairy-free',
      'high-protein',
      'low-carb',
      'mediterranean',
    ];
    commonTags.forEach((tag) => {
      if (lowerPref.includes(tag)) tags.push(tag);
    });

    if (isBaby) {
      if (lowerPref.includes('6 months')) tags.push('6-months');
      if (lowerPref.includes('7 months')) tags.push('7-months');
      if (lowerPref.includes('8 months')) tags.push('8-months');
      if (lowerPref.includes('9 months')) tags.push('9-months');
      if (lowerPref.includes('10 months')) tags.push('10-months');
      if (lowerPref.includes('11 months')) tags.push('11-months');
      if (lowerPref.includes('12 months')) tags.push('12-months');
    }

    // 2. Check for Templates
    const templates = await ctx.runQuery(api.mealPlan.getMatchingTemplates, {
      type: args.type || 'standard',
      tags: tags,
    });

    // If we have strict tag matches, use one (random text rotation would happen here ideally)
    if (templates.length > 0) {
      // Pick random one from top matches (simplified: just pick first for now)
      const cached = templates[0];
      console.log(`✅ Cache Hit for Meal Plan Template: ${cached.name}`);

      // Update usage count asynchronously
      await ctx.runMutation(api.mealPlan.incrementTemplateUsage, {
        templateId: cached._id,
      });

      // Save this instance for the user as their plan
      // (We duplicate the plan data to the user's record so they can edit it independently)
      // Save this instance for the user as their plan
      // (We duplicate the plan data to the user's record so they can edit it independently)
      if (userId) {
        await ctx.runMutation(api.mealPlan.saveMealPlan, {
          plan: cached.plan,
          startDate: Date.now(),
          type: isBaby ? 'baby' : 'standard',
          userId: userId,
        });
      }
      return cached.plan;
    }

    // 3. AI Generation (Cache Miss)
    try {
      const responseText = await callGemini(
        apiKey,
        [{ role: 'user', parts: [{ text: prompt }] }],
        isBaby ? BABY_FOOD_PROMPT : MEAL_PLANNER_PROMPT,
        'application/json'
      );

      let jsonString = responseText;
      // Clean up markdown code blocks if present
      const markdownMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1];
      } else {
        // Fallback cleanup
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
      }

      // Save to User's History
      // Save to User's History
      if (userId) {
        await ctx.runMutation(api.mealPlan.saveMealPlan, {
          plan: jsonString,
          startDate: Date.now(),
          type: isBaby ? 'baby' : 'standard',
          userId: userId,
        });
      }

      // 4. Save as New Template (Auto-Banking)
      // Only generic enough plans should be saved, but for now we save all valid JSONs to populate the bank.
      const templateName = `${isBaby ? 'Baby' : 'Standard'} Plan - ${tags.length > 0 ? tags.join(', ') : 'General'} - ${new Date().toISOString().split('T')[0]}`;

      await ctx.runMutation(api.mealPlan.saveTemplate, {
        plan: jsonString,
        type: isBaby ? 'baby' : 'standard',
        tags: tags,
        name: templateName,
      });

      console.log(`💾 Saved new Meal Plan Template: ${templateName}`);

      return jsonString;
    } catch (error) {
      console.error('Meal Plan Generation Error:', error);
      throw new Error('Failed to generate meal plan');
    }
  },
});

/**
 * Identify food from an image
 */
export const identifyFood = action({
  args: {
    image: v.string(), // Base64 string
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    // Allow both authenticated and guest users

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return JSON.stringify({
        items: ['Apple (Mock)', 'Banana (Mock)'],
        dish: 'Fruit Salad (Mock)',
        confidence: 0.99,
      });
    }

    const languageInstruction = args.language
      ? `Output MUST be in ${args.language} language.`
      : '';

    try {
      // Gemini expects base64 without the data URL prefix if sending inline_data
      // But usually we just send the raw base64 data.
      // The input might be "data:image/jpeg;base64,..." or just "..."
      // Let's strip the prefix if it exists.
      const base64Data = args.image.replace(/^data:image\/\w+;base64,/, '');

      const contents = [
        {
          role: 'user',
          parts: [
            {
              text: `Identify the food items in this image. If it's a prepared dish, name the dish. ${languageInstruction} Return ONLY a JSON object with keys: 'items' (array of strings), 'dish' (string or null), and 'confidence' (number 0-1).`,
            },
            {
              inline_data: {
                mime_type: 'image/jpeg', // Assuming jpeg for simplicity, or we could detect
                data: base64Data,
              },
            },
          ],
        },
      ];

      const responseText = await callGemini(
        apiKey,
        contents,
        undefined,
        'application/json'
      );
      return responseText;
    } catch (error) {
      console.error('Vision Analysis Error:', error);
      throw new Error('Failed to analyze image');
    }
  },
});

/**
 * Generate a full recipe by name (for Planner)
 */
export const generateRecipeByName = action({
  args: {
    mealName: v.string(),
    type: v.optional(v.union(v.literal('standard'), v.literal('baby'))),
    language: v.optional(v.string()), // New optional parameter
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    // Allow both authenticated and guest users

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    // 1. Check Cache First (Optimization)
    const existingRecipe = await ctx.runQuery(api.recipes.getRecipeByName, {
      name: args.mealName,
    });

    if (existingRecipe) {
      console.log(`✅ Cache Hit for recipe: ${args.mealName}`);
      return existingRecipe.idMeal;
    }

    // 2. Fallback to AI Generation
    if (!apiKey) {
      return 'mock_id';
    }

    const isBaby = args.type === 'baby';
    const languageInstruction = args.language
      ? `Output MUST be in ${args.language} language.`
      : '';

    const prompt = `Create a detailed recipe for "${args.mealName}"${isBaby ? ' suitable for a baby (6-12 months)' : ''}.
    ${languageInstruction}
    Return ONLY a JSON object with this exact structure:
    {
      "strMeal": "${args.mealName}",
      "strCategory": "${isBaby ? 'Baby Food' : 'Main Course'}",
      "strArea": "International",
      "strInstructions": "Step-by-step cooking instructions...",
      "strMealThumb": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      "ingredients": [
        {"name": "Ingredient 1", "measure": "Quantity 1"},
        {"name": "Ingredient 2", "measure": "Quantity 2"}
      ]
    }`;

    try {
      const responseText = await callGemini(
        apiKey,
        [{ role: 'user', parts: [{ text: prompt }] }],
        'You are a professional chef.',
        'application/json'
      );

      let jsonString = responseText;
      const markdownMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1];
      } else {
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
      }

      const recipeData = JSON.parse(jsonString);
      const recipeId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Save to recipes table
      await ctx.runMutation(api.recipes.saveRecipes, {
        recipes: [
          {
            idMeal: recipeId,
            strMeal: recipeData.strMeal,
            strCategory: recipeData.strCategory || 'Unknown',
            strArea: recipeData.strArea || 'Unknown',
            strInstructions: recipeData.strInstructions,
            strMealThumb:
              recipeData.strMealThumb || 'https://via.placeholder.com/300',
            ingredients: recipeData.ingredients || [],
            strTags: isBaby ? 'baby,homemade' : 'ai-generated',
          },
        ],
      });

      return recipeId;
    } catch (error) {
      console.error('Recipe Generation Error:', error);
      throw new Error('Failed to generate recipe');
    }
  },
});

/**
 * Generate a consolidated shopping list from a meal plan
 */
export const generateShoppingListFromPlan = action({
  args: {
    planData: v.string(), // JSON string of the plan
    planId: v.optional(v.id('mealPlans')),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    // Allow guest use

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      // Mock response if no key
      return JSON.stringify([
        { name: 'Mock Item 1', measure: '1 unit' },
        { name: 'Mock Item 2', measure: '2 kg' },
      ]);
    }

    const languageInstruction = args.language
      ? `Output MUST be in ${args.language} language.`
      : '';

    const prompt = `You are a helpful kitchen assistant.
    I have a weekly meal plan: ${args.planData}.
    Please generate a CONSOLIDATED shopping list for all these meals.
    ${languageInstruction}
    - Combine quantities where possible (e.g., if multiple meals need eggs, sum them up).
    - List essential ingredients (proteins, produce, pantry staples).
    - Ignore very basic things like "water" or "salt" unless specific.
    - Return ONLY a JSON array of objects with this structure:
    [
      { "name": "Item Name", "measure": "Total Quantity" }
    ]`;

    try {
      const responseText = await callGemini(
        apiKey,
        [{ role: 'user', parts: [{ text: prompt }] }],
        'You are a professional chef assistant.',
        'application/json',
        16384 // Increased limit for weekly lists
      );

      let jsonString = responseText;
      const markdownMatch =
        responseText.match(/```json\n([\s\S]*?)\n```/) ||
        responseText.match(/```\n([\s\S]*?)\n```/);
      if (markdownMatch) {
        jsonString = markdownMatch[1];
      } else {
        jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');
      }

      if (args.planId) {
        await ctx.runMutation(api.mealPlan.saveShoppingList, {
          planId: args.planId,
          list: jsonString,
        });
      }

      return jsonString;
    } catch (error) {
      console.error('Shopping List Generation Error:', error);
      throw new Error('Failed to generate shopping list');
    }
  },
});

/**
 * Generate a trip itinerary
 */
export const generateTripItinerary = action({
  args: {
    destination: v.string(),
    startDate: v.optional(v.string()), // String for clearer prompting (e.g. "2024-05-20")
    duration: v.optional(v.number()),
    preferences: v.optional(v.string()),
    language: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    const identity = await ctx.auth.getUserIdentity();
    // Allow both authenticated and guest users, though frontend restricts to Pro

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return `## Mock Itinerary to ${args.destination}
      
**Day 1: Arrival**
- Explore downtown
- Dinner at local spot

**Day 2: Culture**
- Visit museum
- Walk in the park

**Day 3: Departure**
- Souvenir shopping
- Flight home`;
    }

    const duration = args.duration || 3;
    const languageInstruction = args.language
      ? `Output MUST be in ${args.language} language.`
      : '';

    const prompt = `Create a ${duration}-day trip itinerary for ${args.destination}.
    ${args.startDate ? `The trip starts on ${args.startDate}.` : ''}
    ${args.preferences ? `Preferences: ${args.preferences}` : ''}
    
    ${languageInstruction}
    
    Format the response as clear Markdown with headers for each day.
    Include specific recommendations for food and sights.
    Keep it practical and realistic.`;

    try {
      const responseText = await callGemini(
        apiKey,
        [{ role: 'user', parts: [{ text: prompt }] }],
        TRAVEL_AGENT_PROMPT,
        'text/plain'
      );

      return responseText;
    } catch (error) {
      console.error('Itinerary Generation Error:', error);
      throw new Error('Failed to generate itinerary');
    }
  },
});
