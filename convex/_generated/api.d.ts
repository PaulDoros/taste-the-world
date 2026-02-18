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
import type * as debug from "../debug.js";
import type * as debug_activities from "../debug_activities.js";
import type * as favorites from "../favorites.js";
import type * as gamification from "../gamification.js";
import type * as guest from "../guest.js";
import type * as http from "../http.js";
import type * as mealPlan from "../mealPlan.js";
import type * as migrations from "../migrations.js";
import type * as migrations_backfill_language from "../migrations/backfill_language.js";
import type * as monetization from "../monetization.js";
import type * as myRecipes from "../myRecipes.js";
import type * as oauth from "../oauth.js";
import type * as pantry from "../pantry.js";
import type * as photos from "../photos.js";
import type * as purchases from "../purchases.js";
import type * as recipeHistory from "../recipeHistory.js";
import type * as recipes from "../recipes.js";
import type * as revenuecat from "../revenuecat.js";
import type * as shared from "../shared.js";
import type * as shoppingList from "../shoppingList.js";
import type * as translations from "../translations.js";
import type * as trips from "../trips.js";
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
  debug: typeof debug;
  debug_activities: typeof debug_activities;
  favorites: typeof favorites;
  gamification: typeof gamification;
  guest: typeof guest;
  http: typeof http;
  mealPlan: typeof mealPlan;
  migrations: typeof migrations;
  "migrations/backfill_language": typeof migrations_backfill_language;
  monetization: typeof monetization;
  myRecipes: typeof myRecipes;
  oauth: typeof oauth;
  pantry: typeof pantry;
  photos: typeof photos;
  purchases: typeof purchases;
  recipeHistory: typeof recipeHistory;
  recipes: typeof recipes;
  revenuecat: typeof revenuecat;
  shared: typeof shared;
  shoppingList: typeof shoppingList;
  translations: typeof translations;
  trips: typeof trips;
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
