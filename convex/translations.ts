import { v } from 'convex/values';
import { action, internalMutation, internalQuery } from './_generated/server';
import { api, internal } from './_generated/api';
import { callGemini } from './ai';

/**
 * Get a cached translation from the database
 */
export const get = internalQuery({
  args: {
    relatedId: v.string(),
    language: v.string(),
    field: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('translations')
      .withIndex('by_relatedId_language_field', (q) =>
        q
          .eq('relatedId', args.relatedId)
          .eq('language', args.language)
          .eq('field', args.field)
      )
      .first();
  },
});

/**
 * Save a translation to the database
 */
export const save = internalMutation({
  args: {
    relatedId: v.string(),
    language: v.string(),
    field: v.string(),
    content: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if it already exists to avoid race conditions creating duplicates
    const existing = await ctx.db
      .query('translations')
      .withIndex('by_relatedId_language_field', (q) =>
        q
          .eq('relatedId', args.relatedId)
          .eq('language', args.language)
          .eq('field', args.field)
      )
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert('translations', {
      relatedId: args.relatedId,
      language: args.language,
      field: args.field,
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

/**
 * Get a translation, generating it if it doesn't exist
 */
export const getTranslation = action({
  args: {
    relatedId: v.string(),
    language: v.string(),
    field: v.string(), // e.g. 'instructions', 'title' or 'full_recipe_content'
    content: v.any(), // The original content to translate
  },
  handler: async (ctx, args): Promise<any> => {
    // 1. Check cache through internal query
    const cached = await ctx.runQuery(internal.translations.get, {
      relatedId: args.relatedId,
      language: args.language,
      field: args.field,
    });

    if (cached) {
      console.log(
        `✅ Translation Cache Hit: ${args.relatedId} (${args.language})`
      );
      return cached.content;
    }

    // 2. Generate with AI
    console.log(
      `🌍 Translating ${args.field} for ${args.relatedId} to ${args.language}...`
    );

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('Missing API Key for translation');
      return args.content; // Fallback to original
    }

    try {
      // Construct prompt based on content type
      let prompt = '';
      const isObject =
        typeof args.content === 'object' && args.content !== null;

      if (isObject) {
        prompt = `Translate the values of this JSON object into ${args.language}. 
        Keep the same keys. Do not translate technical IDs or URLs.
        Original: ${JSON.stringify(args.content)}`;
      } else {
        prompt = `Translate the following text into ${args.language}. 
        Maintain all markdown formatting if present. 
        Original: "${args.content}"`;
      }

      const responseText = await callGemini(
        apiKey,
        [{ role: 'user', parts: [{ text: prompt }] }],
        `You are a professional translator for a culinary app. Translate accurately into ${args.language}.`,
        isObject ? 'application/json' : 'text/plain'
      );

      let result = responseText;
      if (isObject) {
        // Clean up potentially wrapped JSON
        let jsonString = responseText;
        const markdownMatch =
          responseText.match(/```json\n([\s\S]*?)\n```/) ||
          responseText.match(/```\n([\s\S]*?)\n```/);
        if (markdownMatch) jsonString = markdownMatch[1];
        else
          jsonString = jsonString.replace(/```json/g, '').replace(/```/g, '');

        try {
          result = JSON.parse(jsonString);
          // Safety fallback: If AI didn't return keys properly, just use original
          if (!result || typeof result !== 'object') {
            console.error('Translation JSON parse yielded non-object', result);
            return args.content;
          }
        } catch (e) {
          console.error('Failed to parse translation JSON', e);
          return args.content; // Fallback
        }
      }

      // 3. Save to cache
      await ctx.runMutation(internal.translations.save, {
        relatedId: args.relatedId,
        language: args.language,
        field: args.field,
        content: result,
      });

      return result;
    } catch (error) {
      console.error('Translation Error:', error);
      return args.content; // Fallback to original on error
    }
  },
});
