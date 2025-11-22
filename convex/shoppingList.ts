import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all shopping list items for a user
 */
export const getShoppingListItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shoppingList")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

/**
 * Add item to shopping list
 */
export const addShoppingListItem = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    measure: v.string(),
    recipeId: v.string(),
    recipeName: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("shoppingList", {
      userId: args.userId,
      name: args.name,
      measure: args.measure,
      recipeId: args.recipeId,
      recipeName: args.recipeName,
      checked: false,
      addedAt: Date.now(),
    });
  },
});

/**
 * Add multiple items to shopping list
 */
export const addMultipleShoppingListItems = mutation({
  args: {
    userId: v.id("users"),
    items: v.array(
      v.object({
        name: v.string(),
        measure: v.string(),
        recipeId: v.string(),
        recipeName: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const itemIds = await Promise.all(
      args.items.map((item) =>
        ctx.db.insert("shoppingList", {
          userId: args.userId,
          name: item.name,
          measure: item.measure,
          recipeId: item.recipeId,
          recipeName: item.recipeName,
          checked: false,
          addedAt: now,
        })
      )
    );
    return itemIds;
  },
});

/**
 * Toggle item checked status
 */
export const toggleShoppingListItemChecked = mutation({
  args: { itemId: v.id("shoppingList") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.itemId);
    if (!item) throw new Error("Item not found");
    await ctx.db.patch(args.itemId, {
      checked: !item.checked,
    });
  },
});

/**
 * Remove item from shopping list
 */
export const removeShoppingListItem = mutation({
  args: { itemId: v.id("shoppingList") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.itemId);
  },
});

/**
 * Clear all checked items
 */
export const clearCheckedItems = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const checkedItems = await ctx.db
      .query("shoppingList")
      .withIndex("by_user_and_checked", (q) =>
        q.eq("userId", args.userId).eq("checked", true)
      )
      .collect();

    await Promise.all(checkedItems.map((item) => ctx.db.delete(item._id)));
  },
});

/**
 * Clear all shopping list items
 */
export const clearShoppingList = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("shoppingList")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    await Promise.all(items.map((item) => ctx.db.delete(item._id)));
  },
});

