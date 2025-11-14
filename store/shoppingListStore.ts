import { create } from 'zustand';
import { Ingredient } from '@/types';

/**
 * Shopping List Item
 * Extends Ingredient with additional metadata
 */
export interface ShoppingListItem extends Ingredient {
  id: string; // Unique ID for the item
  recipeId: string; // ID of the recipe this ingredient is from
  recipeName: string; // Name of the recipe
  checked: boolean; // Whether the item is checked off
  addedAt: number; // Timestamp when added
}

/**
 * Shopping List Store State
 */
interface ShoppingListStore {
  items: ShoppingListItem[];
  
  // Actions
  addItem: (item: Omit<ShoppingListItem, 'id' | 'checked' | 'addedAt'>) => void;
  addMultipleItems: (items: Omit<ShoppingListItem, 'id' | 'checked' | 'addedAt'>[]) => void;
  removeItem: (id: string) => void;
  toggleItemChecked: (id: string) => void;
  clearCheckedItems: () => void;
  clearAllItems: () => void;
  
  // Getters
  getItemCount: () => number;
  getCheckedItemCount: () => number;
  getUncheckedItemCount: () => number;
}

/**
 * Shopping List Store
 * Manages shopping list items with Zustand
 */
export const useShoppingListStore = create<ShoppingListStore>((set, get) => ({
  items: [],

  // Add a single item
  addItem: (item) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: `${item.recipeId}-${item.name}-${Date.now()}`, // Unique ID
      checked: false,
      addedAt: Date.now(),
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
  },

  // Add multiple items (from a recipe)
  addMultipleItems: (items) => {
    const newItems: ShoppingListItem[] = items.map((item) => ({
      ...item,
      id: `${item.recipeId}-${item.name}-${Date.now()}`,
      checked: false,
      addedAt: Date.now(),
    }));

    set((state) => ({
      items: [...state.items, ...newItems],
    }));
  },

  // Remove an item
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  // Toggle item checked status
  toggleItemChecked: (id) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  },

  // Clear all checked items
  clearCheckedItems: () => {
    set((state) => ({
      items: state.items.filter((item) => !item.checked),
    }));
  },

  // Clear all items
  clearAllItems: () => {
    set({ items: [] });
  },

  // Get total item count
  getItemCount: () => {
    return get().items.length;
  },

  // Get checked item count
  getCheckedItemCount: () => {
    return get().items.filter((item) => item.checked).length;
  },

  // Get unchecked item count
  getUncheckedItemCount: () => {
    return get().items.filter((item) => !item.checked).length;
  },
}));

