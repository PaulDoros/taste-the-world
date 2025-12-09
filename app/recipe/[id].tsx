import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { Recipe, Ingredient } from '@/types';
import { getRecipeById, extractIngredients } from '@/services/recipesApi';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useMutation, useQuery, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingList } from '@/hooks/useShoppingList';
// import { usePantryStore } from '@/store/pantryStore';
import { useRecipeHistoryStore } from '@/store/recipeHistoryStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { haptics } from '@/utils/haptics';
import { canConvert, getConvertedDisplay } from '@/utils/measurementConverter';
import { DetailSkeleton } from '@/components/SkeletonLoader';
import { ErrorState } from '@/components/shared/ErrorState';
import { Id } from '@/convex/_generated/dataModel';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useLanguage } from '@/context/LanguageContext';

const RecipeDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, language } = useLanguage();
  const getTranslation = useAction(api.translations.getTranslation);

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConversions, setShowConversions] = useState(false);

  // Modal states
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Convex hooks
  const { user, isAuthenticated, token } = useAuth(); // Destructure token here properly

  const { addMultipleItems } = useShoppingList();
  const { showConfirm, showSuccess, showError } = useAlertDialog();

  // Pantry integration
  const convexItems =
    useQuery(api.pantry.getPantryItems, token ? { token } : 'skip') || [];
  const pantryItems = convexItems.map((item: any) => ({
    ...item,
    id: item._id,
  }));
  const removePantryItem = useMutation(api.pantry.removePantryItem);

  const hasIngredient = (ingredientName: string) => {
    const normalizedName = ingredientName.toLowerCase().trim();
    return pantryItems.some((item: any) => item.name === normalizedName);
  };

  // Recipe history store
  const addToHistory = useRecipeHistoryStore((state) => state.addToHistory);

  // Favorites store
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

  // Translate Effect
  useEffect(() => {
    const translateContent = async () => {
      if (!recipe || language === 'en' || translating) return;

      // Check if we already have this translation in local state?
      // The action handles caching, so just calling it is fine.
      try {
        setTranslating(true);
        const contentToTranslate = {
          strMeal: recipe.strMeal,
          strInstructions: recipe.strInstructions,
          ingredients: ingredients.map((i) => ({
            name: i.name,
            measure: i.measure,
          })),
        };

        const result = await getTranslation({
          relatedId: recipe.idMeal,
          language,
          field: 'full_recipe_content',
          content: contentToTranslate,
        });

        if (result && typeof result === 'object') {
          console.log('[RecipeDetails] Translation applied:', result);
          setRecipe((prev) =>
            prev
              ? {
                  ...prev,
                  strMeal: result.strMeal || prev.strMeal,
                  strInstructions:
                    result.strInstructions || prev.strInstructions,
                }
              : null
          );

          if (result.ingredients && Array.isArray(result.ingredients)) {
            setIngredients(result.ingredients);
          }
        }
      } catch (e) {
        console.error('Translation failed', e);
      } finally {
        setTranslating(false);
      }
    };

    translateContent();
  }, [recipe?.idMeal, language]); // Effect dependency simplified to avoid infinite loops if recipe object reference changes but content doesn't.

  // Track recipe view in history
  useEffect(() => {
    if (recipe) {
      addToHistory({
        id: recipe.idMeal,
        name: recipe.strMeal,
        image: recipe.strMealThumb,
        area: recipe.strArea,
        category: recipe.strCategory,
        timestamp: Date.now(),
      });
    }
  }, [recipe?.idMeal]); // Changed to idMeal to avoid re-triggering on translation updates causing history spam

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedRecipe = await getRecipeById(id as string);
      setRecipe(fetchedRecipe);

      // Extract ingredients
      const extractedIngredients = extractIngredients(fetchedRecipe);
      setIngredients(extractedIngredients);
    } catch (err) {
      console.error('Error fetching recipe details:', err);
      setError(t('recipe_error_failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    haptics.light();
    router.back();
  };

  const handleAddToShoppingList = () => {
    if (!recipe || ingredients.length === 0) {
      haptics.warning();
      showError(t('recipe_no_ingredients_error'));
      return;
    }

    haptics.light();
    // Directly add all items for now as per simplified logic, or show modal if implemented
    // For now assuming direct add or pre-confirmation logic
    handleConfirmAddToShopping(ingredients);
  };

  const handleConfirmAddToShopping = async (
    selectedIngredients: Ingredient[]
  ) => {
    if (!recipe || selectedIngredients.length === 0) {
      return;
    }

    const itemsToAdd = selectedIngredients.map((ingredient) => ({
      name: ingredient.name,
      measure: ingredient.measure,
      recipeId: recipe.idMeal,
      recipeName: recipe.strMeal,
    }));

    try {
      await addMultipleItems(itemsToAdd);
      haptics.success();

      showSuccess(t('recipe_shopping_success', { count: itemsToAdd.length }));
    } catch (error) {
      console.error('Error adding items:', error);
      showError(t('recipe_shopping_error'));
    }
  };

  const handleWatchVideo = () => {
    if (recipe?.strYoutube) {
      haptics.light();
      Linking.openURL(recipe.strYoutube);
    }
  };

  const handleUseFromPantry = () => {
    if (!recipe || ingredients.length === 0) {
      haptics.warning();
      showError(t('recipe_no_ingredients_recipe_error'));
      return;
    }

    // Find ingredients that are in pantry
    const ingredientsInPantry = ingredients.filter((ingredient) =>
      hasIngredient(ingredient.name)
    );

    if (ingredientsInPantry.length === 0) {
      haptics.warning();
      showError(t('recipe_pantry_missing_error'));
      return;
    }

    haptics.light();
    // Assuming we want to consume them directly or show a modal.
    // Implementing direct consumption for now to match logic flow or show a confirmation.
    // For safety, let's ask for confirmation via alert since we removed the modal logic
    showConfirm(
      {
        title: t('recipe_use_pantry', { count: ingredientsInPantry.length }),
        message: t('recipe_pantry_success', {
          count: ingredientsInPantry.length,
        }).replace('removed', 'will be removed'),
        confirmText: 'Use Items',
      },
      () => handleConfirmUseFromPantry(ingredientsInPantry)
    );
  };

  const handleConfirmUseFromPantry = (selectedIngredients: Ingredient[]) => {
    if (selectedIngredients.length === 0) {
      return;
    }

    // Remove each selected ingredient from pantry
    selectedIngredients.forEach((ingredient) => {
      // Find the pantry item by name
      const pantryItem = pantryItems.find(
        (item) => item.name === ingredient.name.toLowerCase().trim()
      );
      if (pantryItem) {
        removePantryItem({ itemId: pantryItem.id as Id<'pantry'> });
      }
    });

    haptics.success();
    showSuccess(
      t('recipe_pantry_success', { count: selectedIngredients.length })
    );
  };

  // Loading state
  if (loading) {
    return <DetailSkeleton />;
  }

  // Error state
  if (error || !recipe) {
    return (
      <ErrorState
        title={t('recipes_error_title')}
        message={error || t('recipe_error_not_found')}
        onRetry={handleBack}
        retryText={t('country_retry')}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recipe Image Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={{ height: 300, position: 'relative' }}>
            <Image
              source={
                !imageError && recipe.strMealThumb
                  ? { uri: recipe.strMealThumb }
                  : require('@/assets/images/recipe_placeholder.png')
              }
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />

            {/* Gradient Overlays */}
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'transparent']}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 120,
              }}
            />
            <LinearGradient
              colors={['transparent', colors.background]}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
              }}
            />

            {/* Back Button */}
            <AnimatedBackButton onPress={handleBack} colors={colors} />

            {/* Category & Area Badges */}
            <View
              style={{
                position: 'absolute',
                top: insets.top + 60,
                right: 20,
                gap: 8,
              }}
            >
              {recipe.strCategory && (
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <View
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome5 name="tag" size={10} color="#fbbf24" />
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}
                    >
                      {recipe.strCategory}
                    </Text>
                  </View>
                </Animated.View>
              )}

              {recipe.strArea && (
                <Animated.View entering={FadeInDown.delay(150).springify()}>
                  <View
                    style={{
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <FontAwesome5 name="globe" size={10} color="#10b981" />
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 12,
                        fontWeight: '600',
                        marginLeft: 6,
                      }}
                    >
                      {recipe.strArea}
                    </Text>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>
        {/* Recipe Content */}
        <View style={{ paddingHorizontal: 20, marginTop: -20 }}>
          {/* Recipe Name Card */}
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            style={{
              backgroundColor: colors.card,
              borderRadius: 24,
              padding: 24,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: colors.text,
                letterSpacing: -0.5,
                marginBottom: 8,
              }}
            >
              {recipe.strMeal}
            </Text>

            {/* Action Buttons Row */}
            <View style={{ marginTop: 16, gap: 12 }}>
              {/* First Row - Primary Actions */}
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Add to Shopping List Button */}
                <Pressable
                  onPress={handleAddToShoppingList}
                  style={({ pressed }) => ({
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.tint,
                    paddingVertical: 14,
                    borderRadius: 16,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <FontAwesome5
                    name="shopping-basket"
                    size={16}
                    color="white"
                  />
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 15,
                      marginLeft: 8,
                    }}
                  >
                    {t('recipe_add_to_list')}
                  </Text>
                </Pressable>

                {/* Favorite Button */}
                <Pressable
                  onPress={() => {
                    if (recipe) {
                      haptics.light();
                      toggleFavorite({
                        id: recipe.idMeal,
                        name: recipe.strMeal,
                        image: recipe.strMealThumb,
                        area: recipe.strArea,
                        category: recipe.strCategory,
                        timestamp: Date.now(),
                      });
                    }
                  }}
                  style={({ pressed }) => ({
                    width: 50,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isFavorite(recipe.idMeal)
                      ? '#ec4899'
                      : `${colors.text}15`,
                    paddingVertical: 14,
                    borderRadius: 16,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <FontAwesome5
                    name="heart"
                    size={16}
                    color={isFavorite(recipe.idMeal) ? 'white' : colors.text}
                    solid={isFavorite(recipe.idMeal)}
                  />
                </Pressable>

                {/* Watch Video Button */}
                {recipe.strYoutube && (
                  <Pressable
                    onPress={handleWatchVideo}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ff0000',
                      paddingHorizontal: 20,
                      paddingVertical: 14,
                      borderRadius: 16,
                      opacity: pressed ? 0.8 : 1,
                      transform: [{ scale: pressed ? 0.98 : 1 }],
                    })}
                  >
                    <FontAwesome5 name="youtube" size={16} color="white" />
                    <Text
                      style={{
                        color: 'white',
                        fontWeight: '700',
                        fontSize: 15,
                        marginLeft: 8,
                      }}
                    >
                      {t('recipe_watch_video')}
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Second Row - Use from Pantry */}
              {ingredients.some((ing) => hasIngredient(ing.name)) && (
                <Pressable
                  onPress={handleUseFromPantry}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f59e0b',
                    paddingVertical: 14,
                    borderRadius: 16,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <FontAwesome5 name="box" size={16} color="white" />
                  <Text
                    style={{
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 15,
                      marginLeft: 8,
                    }}
                  >
                    {t('recipe_use_pantry', {
                      count: ingredients.filter((ing) =>
                        hasIngredient(ing.name)
                      ).length,
                    })}
                  </Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Ingredients Section */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 20,
                marginBottom: 20,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Section Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${colors.tint}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome5 name="list" size={16} color={colors.tint} />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        color: colors.text,
                      }}
                    >
                      {t('recipe_ingredients_title')}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text,
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {t('recipe_ingredients_count', {
                        count: ingredients.length,
                      })}
                    </Text>
                  </View>
                </View>

                {/* Conversion Toggle Button */}
                <Pressable
                  onPress={() => {
                    haptics.light();
                    setShowConversions(!showConversions);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: showConversions
                      ? colors.tint
                      : `${colors.tint}15`,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 12,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <FontAwesome5
                    name="exchange-alt"
                    size={12}
                    color={showConversions ? 'white' : colors.tint}
                  />
                  <Text
                    style={{
                      color: showConversions ? 'white' : colors.tint,
                      fontSize: 11,
                      fontWeight: '600',
                      marginLeft: 6,
                    }}
                  >
                    {t('recipe_convert')}
                  </Text>
                </Pressable>
              </View>

              {/* Ingredients List */}
              <View style={{ gap: 12 }}>
                {ingredients.map((ingredient, index) => (
                  <Animated.View
                    key={index}
                    entering={FadeInUp.delay(250 + index * 30).springify()}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: hasIngredient(ingredient.name)
                          ? '#f59e0b10'
                          : colors.background,
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: hasIngredient(ingredient.name) ? 1 : 0,
                        borderColor: hasIngredient(ingredient.name)
                          ? '#f59e0b30'
                          : 'transparent',
                      }}
                    >
                      {/* Availability Indicator */}
                      {hasIngredient(ingredient.name) ? (
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: '#f59e0b',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 12,
                          }}
                        >
                          <FontAwesome5 name="check" size={12} color="white" />
                        </View>
                      ) : (
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: colors.tint,
                            marginRight: 12,
                          }}
                        />
                      )}

                      <Text
                        style={{
                          flex: 1,
                          color: colors.text,
                          fontSize: 15,
                          fontWeight: '500',
                        }}
                      >
                        {ingredient.name}
                        {hasIngredient(ingredient.name) ? (
                          <Text
                            style={{
                              color: '#f59e0b',
                              fontSize: 12,
                              fontWeight: '600',
                              marginLeft: 6,
                            }}
                          >
                            {t('recipe_in_pantry')}
                          </Text>
                        ) : null}
                      </Text>

                      <View style={{ alignItems: 'flex-end' }}>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 14,
                            fontWeight: '600',
                            opacity: 0.7,
                          }}
                        >
                          {ingredient.measure}
                        </Text>
                        {showConversions && canConvert(ingredient.measure) && (
                          <Text
                            style={{
                              color: colors.tint,
                              fontSize: 12,
                              fontWeight: '600',
                              marginTop: 2,
                            }}
                          >
                            {getConvertedDisplay(ingredient.measure)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Instructions Section */}
          {recipe.strInstructions && (
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <View
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Section Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `#10b98120`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome5 name="book-open" size={16} color="#10b981" />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: colors.text,
                    }}
                  >
                    {t('recipe_instructions_title')}
                  </Text>
                </View>

                {/* Instructions Text */}
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15,
                    lineHeight: 24,
                    opacity: 0.9,
                  }}
                >
                  {recipe.strInstructions}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Source Link (if available) */}
          {recipe.strSource && (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  Linking.openURL(recipe.strSource!);
                }}
                style={({ pressed }) => ({
                  backgroundColor: `${colors.tint}15`,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5 name="link" size={14} color={colors.tint} />
                <Text
                  style={{
                    color: colors.tint,
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  {t('recipe_source_link')}
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* YouTube Link (Secondary) */}
          {recipe.strYoutube && !recipe.strSource && (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  Linking.openURL(recipe.strYoutube!);
                }}
                style={({ pressed }) => ({
                  backgroundColor: `#ff000015`,
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5 name="youtube" size={14} color="#ff0000" />
                <Text
                  style={{
                    color: '#ff0000',
                    fontWeight: '600',
                    marginLeft: 8,
                  }}
                >
                  {t('recipe_video_link')}
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

/**
 * Animated Back Button Component
 */
const AnimatedBackButton = ({
  onPress,
  colors,
}: {
  onPress: () => void;
  colors: typeof Colors.light;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {};

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 600,
    });
  };

  return (
    <Animated.View
      entering={FadeIn.delay(200)}
      style={[
        {
          position: 'absolute',
          top: 48,
          left: 20,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 16,
          width: 48,
          height: 48,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <FontAwesome5 name="arrow-left" size={20} color={colors.text} />
      </Pressable>
    </Animated.View>
  );
};

export default RecipeDetailsScreen;
