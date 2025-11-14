import { create } from "zustand";
import { RecipeHistoryItem } from "./recipeHistoryStore";

interface FavoritesState {
  favorites: RecipeHistoryItem[];
  addFavorite: (recipe: RecipeHistoryItem) => void;
  removeFavorite: (id: string) => void;
  clearFavorites: () => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (recipe: RecipeHistoryItem) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (recipe) =>
    set((state) => {
      // Check if already favorited
      if (state.favorites.some((fav) => fav.id === recipe.id)) {
        return state;
      }
      
      return {
        favorites: [...state.favorites, { ...recipe, timestamp: Date.now() }],
      };
    }),

  removeFavorite: (id) =>
    set((state) => ({
      favorites: state.favorites.filter((fav) => fav.id !== id),
    })),

  clearFavorites: () => set({ favorites: [] }),

  isFavorite: (id) => get().favorites.some((fav) => fav.id === id),

  toggleFavorite: (recipe) => {
    const isFav = get().isFavorite(recipe.id);
    if (isFav) {
      get().removeFavorite(recipe.id);
    } else {
      get().addFavorite(recipe);
    }
  },
}));

