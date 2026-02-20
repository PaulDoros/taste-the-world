import { create } from 'zustand';

export interface RecipeHistoryItem {
  id: string; // Recipe ID
  name: string; // Recipe name
  image: string; // Recipe thumbnail
  area: string; // Cuisine area
  category: string; // Recipe category
  timestamp: number; // When it was viewed/used
}

interface RecipeHistoryState {
  history: RecipeHistoryItem[];
  addToHistory: (recipe: RecipeHistoryItem) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
}

export const useRecipeHistoryStore = create<RecipeHistoryState>((set) => ({
  history: [],

  addToHistory: (recipe) =>
    set((state) => {
      // Remove existing entry if it exists (to update timestamp)
      const filtered = state.history.filter((item) => item.id !== recipe.id);

      // Add to beginning with current timestamp
      const newHistory = [
        { ...recipe, timestamp: Date.now() },
        ...filtered,
      ].slice(0, 10); // Keep only last 10 recipes

      return { history: newHistory };
    }),

  clearHistory: () => set({ history: [] }),

  removeFromHistory: (id) =>
    set((state) => ({
      history: state.history.filter((item) => item.id !== id),
    })),
}));
