import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  addMultipleItems: (
    items: Omit<ShoppingListItem, 'id' | 'checked' | 'addedAt'>[]
  ) => void;
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
export const useShoppingListStore = create<ShoppingListStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Add a single item
      addItem: (item) => {
        const newItem: ShoppingListItem = {
          ...item,
          id: crypto.randomUUID(), // Unique ID using UUID
          checked: false,
          addedAt: Date.now(),
        };

        set((state) => ({
          items: [...state.items, newItem],
        }));
      },

      // Add multiple items (from a recipe)
      addMultipleItems: (items) => {
        const baseTimestamp = Date.now();
        const newItems: ShoppingListItem[] = items.map((item, index) => ({
          ...item,
          id: crypto.randomUUID(), // Unique ID using UUID for each item
          checked: false,
          addedAt: baseTimestamp,
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
    }),
    {
      name: 'shopping-list-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Migrate and deduplicate items when loading from storage
      onRehydrateStorage: () => (state) => {
        if (state?.items) {
          // Track seen IDs to detect duplicates
          const seenIds = new Set<string>();
          const deduplicatedItems: ShoppingListItem[] = [];

          state.items.forEach((item) => {
            // UUID format is 36 characters with specific pattern
            // Old format was: recipeId-name-timestamp (variable length, usually longer)
            const isUUID =
              item.id.length === 36 && item.id.split('-').length === 5;

            // If ID is duplicate or in old format, generate a new UUID
            if (seenIds.has(item.id) || !isUUID) {
              // Reassign with new UUID
              deduplicatedItems.push({
                ...item,
                id: crypto.randomUUID(),
              });
            } else {
              seenIds.add(item.id);
              deduplicatedItems.push(item);
            }
          });

          // Update state with deduplicated items
          state.items = deduplicatedItems;

          console.log(
            `Migration: Processed ${state.items.length} items, created ${deduplicatedItems.length} unique items`
          );
        }
      },
    }
  )
);
