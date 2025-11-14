import { create } from "zustand";

/**
 * Pantry Item
 * Represents an ingredient the user has at home
 */
export interface PantryItem {
  id: string; // Unique ID
  name: string; // Ingredient name (normalized to lowercase for matching)
  displayName: string; // Original display name
  measure: string; // Quantity (e.g., "500g", "2 cups", "1 lb")
  addedAt: number; // Timestamp when added
}

/**
 * Pantry Store State
 */
interface PantryStore {
  items: PantryItem[];

  // Actions
  addItem: (name: string, measure?: string) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, newMeasure: string) => void;
  clearAllItems: () => void;
  hasIngredient: (ingredientName: string) => boolean;
  getItemByName: (ingredientName: string) => PantryItem | undefined;

  // Getters
  getItemCount: () => number;
}

/**
 * Pantry Store
 * Manages pantry items (ingredients user has at home)
 */
export const usePantryStore = create<PantryStore>((set, get) => ({
  items: [],

  // Add an item to pantry
  addItem: (name, measure = "as needed") => {
    const normalizedName = name.toLowerCase().trim();

    // Check if item already exists
    const existingItem = get().items.find(
      (item) => item.name === normalizedName,
    );

    if (existingItem) {
      // Item already in pantry, don't add duplicate
      // You could optionally update the quantity here instead
      return;
    }

    const newItem: PantryItem = {
      id: `${normalizedName}-${Date.now()}`,
      name: normalizedName,
      displayName: name.trim(),
      measure: measure || "as needed",
      addedAt: Date.now(),
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
  },

  // Remove an item from pantry
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  // Clear all items
  clearAllItems: () => {
    set({ items: [] });
  },

  // Update item quantity
  updateItemQuantity: (id, newMeasure) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, measure: newMeasure } : item,
      ),
    }));
  },

  // Check if user has an ingredient
  hasIngredient: (ingredientName) => {
    const normalizedName = ingredientName.toLowerCase().trim();
    return get().items.some((item) => item.name === normalizedName);
  },

  // Get item by name
  getItemByName: (ingredientName) => {
    const normalizedName = ingredientName.toLowerCase().trim();
    return get().items.find((item) => item.name === normalizedName);
  },

  // Get total item count
  getItemCount: () => {
    return get().items.length;
  },
}));
