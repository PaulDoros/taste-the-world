import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/useAuth";
import { useShoppingListStore, ShoppingListItem } from "@/store/shoppingListStore";
import { Id } from "@/convex/_generated/dataModel";

export interface UnifiedShoppingListItem {
  _id: string;
  id?: string; // For local items
  name: string;
  measure: string;
  recipeId: string;
  recipeName: string;
  checked: boolean;
  addedAt: number;
}

export function useShoppingList() {
  const { isAuthenticated, user } = useAuth();
  
  // Convex hooks
  const convexItems = useQuery(api.shoppingList.getShoppingListItems, isAuthenticated && user ? { userId: user._id as Id<"users"> } : "skip");
  const addMutation = useMutation(api.shoppingList.addShoppingListItem);
  const addMultipleMutation = useMutation(api.shoppingList.addMultipleShoppingListItems);
  const removeMutation = useMutation(api.shoppingList.removeShoppingListItem);
  const toggleMutation = useMutation(api.shoppingList.toggleShoppingListItemChecked);
  const clearCheckedMutation = useMutation(api.shoppingList.clearCheckedItems);
  const clearAllMutation = useMutation(api.shoppingList.clearShoppingList);

  // Local store
  const localItems = useShoppingListStore((state) => state.items);
  const localAddItem = useShoppingListStore((state) => state.addItem);
  const localAddMultipleItems = useShoppingListStore((state) => state.addMultipleItems);
  const localRemoveItem = useShoppingListStore((state) => state.removeItem);
  const localToggleItem = useShoppingListStore((state) => state.toggleItemChecked);
  const localClearChecked = useShoppingListStore((state) => state.clearCheckedItems);
  const localClearAll = useShoppingListStore((state) => state.clearAllItems);

  // Unified data
  const items: UnifiedShoppingListItem[] = isAuthenticated 
    ? (convexItems || []).map(item => ({ ...item, _id: item._id }))
    : localItems.map(item => ({ ...item, _id: item.id }));

  // Unified actions
  const addItem = async (item: { name: string; measure: string; recipeId: string; recipeName: string }) => {
    if (isAuthenticated && user) {
      await addMutation({
        userId: user._id as Id<"users">,
        ...item
      });
    } else {
      localAddItem(item);
    }
  };

  const addMultipleItems = async (items: { name: string; measure: string; recipeId: string; recipeName: string }[]) => {
    if (isAuthenticated && user) {
      await addMultipleMutation({
        userId: user._id as Id<"users">,
        items
      });
    } else {
      localAddMultipleItems(items);
    }
  };

  const removeItem = async (id: string) => {
    if (isAuthenticated) {
      await removeMutation({ itemId: id as Id<"shoppingList"> });
    } else {
      localRemoveItem(id);
    }
  };

  const toggleItemChecked = async (id: string) => {
    if (isAuthenticated) {
      await toggleMutation({ itemId: id as Id<"shoppingList"> });
    } else {
      localToggleItem(id);
    }
  };

  const clearCheckedItems = async () => {
    if (isAuthenticated && user) {
      await clearCheckedMutation({ userId: user._id as Id<"users"> });
    } else {
      localClearChecked();
    }
  };

  const clearAllItems = async () => {
    if (isAuthenticated && user) {
      await clearAllMutation({ userId: user._id as Id<"users"> });
    } else {
      localClearAll();
    }
  };

  const isLoading = isAuthenticated && convexItems === undefined;

  return {
    items: isLoading ? undefined : items, // Return undefined while loading to trigger skeleton
    addItem,
    addMultipleItems,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    clearAllItems,
    isAuthenticated,
    isLoading
  };
}
