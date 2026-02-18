import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { YStack, Separator, Spinner, Paragraph } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { Id } from '@/convex/_generated/dataModel';
import { useFavoritesStore } from '@/store/favoritesStore';
import { playSound } from '@/utils/sounds';
import { haptics } from '@/utils/haptics';

// New Components
import { RecipeDetailHeader } from '@/components/recipe-details/RecipeDetailHeader';
import { RecipeDetailIngredients } from '@/components/recipe-details/RecipeDetailIngredients';
import { RecipeDetailInstructions } from '@/components/recipe-details/RecipeDetailInstructions';
import { RecipeDetailActions } from '@/components/recipe-details/RecipeDetailActions';

export default function RecipeDetailScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const router = useRouter();
  const params = useLocalSearchParams();
  const recipeId = params.id as Id<'myRecipes'>;

  const recipe = useQuery(
    api.myRecipes.get,
    recipeId ? { id: recipeId } : 'skip'
  );
  // Use correct mutations found in convex/pantry.ts and convex/shoppingList.ts
  const addPantryItem = useMutation(api.pantry.addPantryItem);
  const addShoppingItem = useMutation(api.shoppingList.addShoppingListItem);
  const logActivity = useMutation(api.gamification.logActivity);

  // Favorites Store
  const toggleFavoriteStore = useFavoritesStore(
    (state) => state.toggleFavorite
  );
  const isFavorite = useFavoritesStore((state) => state.isFavorite(recipeId));

  const [isLoadingAction, setIsLoadingAction] = useState(false);

  if (!recipe) {
    return (
      <YStack
        flex={1}
        justifyContent="center"
        alignItems="center"
        backgroundColor={colors.background}
      >
        <Spinner size="large" color={colors.tint} />
      </YStack>
    );
  }

  const handleAddToShoppingList = async () => {
    if (!user) return;
    setIsLoadingAction(true);
    try {
      // Add all ingredients
      const promises = recipe.ingredients.map((ing) =>
        addShoppingItem({
          userId: user._id as Id<'users'>,
          name: ing.name,
          measure: ing.measure,
          recipeId: recipe._id,
          recipeName: recipe.title,
        })
      );
      await Promise.all(promises);

      // Log Activity
      logActivity({
        actionType: 'shopping_add',
        count: recipe.ingredients.length,
      }).catch((e) => console.error(e));

      Alert.alert(
        t('common_success'),
        t('recipe_shopping_success', { count: recipe.ingredients.length })
      );
    } catch (e) {
      Alert.alert(t('common_error'), t('recipe_shopping_error'));
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleAddToPantry = async () => {
    if (!user) return;
    setIsLoadingAction(true);
    try {
      // Add all ingredients
      const promises = recipe.ingredients.map((ing) =>
        addPantryItem({
          userId: user._id as Id<'users'>,
          name: ing.name,
          displayName: ing.name, // Use same name for display
          measure: ing.measure,
        })
      );
      await Promise.all(promises);

      // Log Activity to trigger 'Pantry Master' check
      logActivity({
        actionType: 'pantry_add',
      }).catch((e) => console.error(e));

      Alert.alert(t('common_success'), t('scan_success_message'));
    } catch (e) {
      Alert.alert(t('common_error'), t('chef_error_pantry'));
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleCook = async () => {
    if (!user) {
      Alert.alert(t('common_error'), 'Please sign in to track cooking stats.');
      return;
    }
    haptics.success();
    playSound('chef-recipe');

    try {
      const result = await logActivity({
        actionType: 'cook',
        recipeCategory: 'User Recipe', // Default for custom recipes
        recipeArea: 'Home',
      });

      if (result) {
        setTimeout(() => playSound('achievement'), 500);
        Alert.alert(
          'Bon Appétit!',
          `You earned XP! Streak: ${result.currentStreak} 🔥`
        );
      }
    } catch (e) {
      console.error('Failed to log cook:', e);
    }
  };

  const handleToggleFavorite = () => {
    haptics.selection();
    toggleFavoriteStore({
      id: recipeId,
      name: recipe.title,
      image: recipe.imageUrl || '',
      area: 'Home',
      category: 'User Recipe',
      timestamp: Date.now(),
      // Add other fields if necessary for history/favorites store
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        bounces={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <RecipeDetailHeader
          recipe={recipe}
          colors={colors}
          t={t}
          onBack={() => router.back()}
          onEdit={() =>
            router.push({
              pathname: '/recipes/create',
              params: { recipeId: recipe._id },
            })
          }
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
        />

        <YStack padding="$4" gap="$4">
          {/* Description */}
          {recipe.description && (
            <Paragraph
              color={colors.text}
              fontSize="$3"
              opacity={0.8}
              fontStyle="italic"
            >
              {recipe.description}
            </Paragraph>
          )}

          {/* Actions */}
          <RecipeDetailActions
            onAddToShoppingList={handleAddToShoppingList}
            onAddToPantry={handleAddToPantry}
            onCook={handleCook}
            isLoading={isLoadingAction}
            colors={colors}
            t={t}
          />

          <Separator borderColor="$borderColor" />

          {/* Ingredients */}
          <RecipeDetailIngredients
            ingredients={recipe.ingredients}
            colors={colors}
            t={t}
          />

          {/* Instructions */}
          <RecipeDetailInstructions
            instructions={recipe.instructions}
            colors={colors}
            t={t}
          />
        </YStack>
      </ScrollView>
    </View>
  );
}
