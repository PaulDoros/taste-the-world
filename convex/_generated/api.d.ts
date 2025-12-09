/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as ai from "../ai.js";
import type * as auth from "../auth.js";
import type * as babyFood from "../babyFood.js";
import type * as chat from "../chat.js";
import type * as favorites from "../favorites.js";
import type * as guest from "../guest.js";
import type * as mealPlan from "../mealPlan.js";
import type * as migrations_backfill_language from "../migrations/backfill_language.js";
import type * as oauth from "../oauth.js";
import type * as pantry from "../pantry.js";
import type * as purchases from "../purchases.js";
import type * as recipeHistory from "../recipeHistory.js";
import type * as recipes from "../recipes.js";
import type * as shoppingList from "../shoppingList.js";
import type * as translations from "../translations.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  auth: typeof auth;
  babyFood: typeof babyFood;
  chat: typeof chat;
  favorites: typeof favorites;
  guest: typeof guest;
  mealPlan: typeof mealPlan;
  "migrations/backfill_language": typeof migrations_backfill_language;
  oauth: typeof oauth;
  pantry: typeof pantry;
  purchases: typeof purchases;
  recipeHistory: typeof recipeHistory;
  recipes: typeof recipes;
  shoppingList: typeof shoppingList;
  translations: typeof translations;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
