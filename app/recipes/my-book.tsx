import React, { useState } from 'react';
import { FlatList, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { YStack, Spinner } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { Id } from '@/convex/_generated/dataModel';
import { SafeAreaView } from 'react-native-safe-area-context';

// New Components
import { RecipeBookHeader } from '@/components/recipe-book/RecipeBookHeader';
import { RecipeBookSearch } from '@/components/recipe-book/RecipeBookSearch';
import { RecipeBookCard } from '@/components/recipe-book/RecipeBookCard';
import { RecipeBookEmptyState } from '@/components/recipe-book/RecipeBookEmptyState';

export default function MyRecipeBookScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();
  const router = useRouter();

  const recipes = useQuery(
    api.myRecipes.list,
    user ? { userId: user._id as Id<'users'> } : 'skip'
  );
  const deleteRecipe = useMutation(api.myRecipes.remove);

  const handleDelete = (id: Id<'myRecipes'>) => {
    Alert.alert(
      t('common_delete'),
      t('wallet_delete_msg'), // Reuse generic delete msg
      [
        { text: t('common_cancel'), style: 'cancel' },
        {
          text: t('common_delete'),
          style: 'destructive',
          onPress: () => deleteRecipe({ id }),
        },
      ]
    );
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecipes = !recipes
    ? []
    : recipes.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (r.description &&
            r.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const totalRecipesCount = Array.isArray(recipes) ? recipes.length : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <YStack flex={1} padding="$4">
        <RecipeBookHeader
          title={t('recipe_book_title')}
          onBack={() => router.back()}
          onAdd={() => router.push('/recipes/create')}
          colors={colors}
        />

        <RecipeBookSearch
          value={searchQuery}
          onChangeText={setSearchQuery}
          colors={colors}
        />

        {!recipes ? (
          <Spinner size="large" color={colors.tint} />
        ) : filteredRecipes.length === 0 ? (
          <RecipeBookEmptyState
            hasRecipes={totalRecipesCount > 0}
            loading={false}
            onCreate={() => router.push('/recipes/create')}
            colors={colors}
          />
        ) : (
          <FlatList
            data={filteredRecipes}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <RecipeBookCard
                item={item}
                colors={colors}
                onPress={() =>
                  router.push({
                    pathname: '/recipes/[id]',
                    params: { id: item._id },
                  })
                }
                onDelete={handleDelete}
              />
            )}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
