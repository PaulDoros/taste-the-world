import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this helper function to your shopping list screen or create a utility
export const clearShoppingListStorage = async () => {
  try {
    await AsyncStorage.removeItem('shopping-list-storage');
    console.log('Shopping list storage cleared');
  } catch (error) {
    console.error('Error clearing shopping list storage:', error);
  }
};

// You can call this once to clear old data:
// clearShoppingListStorage();
