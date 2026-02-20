import React, { useState, useEffect } from 'react';
import {
  Text,
  ScrollView,
  Image,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  withSequence,
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
import { NutritionalInfo } from '@/components/NutritionalInfo';
import { playSound } from '@/utils/sounds';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { View } from 'tamagui';
import { AppBannerAd } from '@/components/ads/BannerAd';

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
  const [isCooked, setIsCooked] = useState(false); // New state for visual feedback
  const favScale = useSharedValue(1); // Animation value for favorite icon
  const favoriteIconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favScale.value }],
  }));

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

      const maxRetries = 3;
      let attempt = 0;
      let success = false;

      setTranslating(true);

      while (attempt < maxRetries && !success) {
        try {
          attempt++;
          const contentToTranslate = {
            strMeal: recipe.strMeal,
            strInstructions: recipe.strInstructions,
            ingredients: ingredients.map((i) => ({
              name: i.name,
              measure: i.measure,
            })),
          };

          // Add a small delay for retries to allow connection to recover
          if (attempt > 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
          }

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
            success = true;
          }
        } catch (e) {
          console.warn(
            `Translation attempt ${attempt} failed:`,
            e instanceof Error ? e.message : e
          );
          // If it's the last attempt, log as error but don't crash
          if (attempt === maxRetries) {
            console.error('All translation attempts failed.');
          }
        }
      }
      setTranslating(false);
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

  const logActivity = useMutation(api.gamification.logActivity);
  const generateUploadUrl = useMutation(api.photos.generateUploadUrl);
  const savePhoto = useMutation(api.photos.savePhoto);

  const handleUploadPhoto = async (uri: string) => {
    try {
      console.log('[RecipeDetails] Starting upload for:', uri);

      // 1. Get upload URL
      const postUrl = await generateUploadUrl();
      console.log('[RecipeDetails] Got upload URL');

      // 2. Upload file
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('[RecipeDetails] Created blob size:', blob.size);

      const result = await fetch(postUrl, {
        method: 'POST',
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        },
        body: blob,
      });

      if (!result.ok) {
        console.error('[RecipeDetails] Upload failed status:', result.status);
        throw new Error('Upload failed');
      }

      const { storageId } = await result.json();
      console.log('[RecipeDetails] Upload success, ID:', storageId);

      // 3. Save metadata
      if (recipe) {
        await savePhoto({
          storageId,
          recipeId: recipe.idMeal,
          recipeName: recipe.strMeal,
          token: token || undefined, // Pass token if valid
        });
        console.log('[RecipeDetails] Saved photo metadata');
      }

      // 4. Log Action (Photo Bonus)
      const stats = await logActivity({
        actionType: 'photo',
        token: token || undefined, // Pass token if valid
        recipeCategory: recipe?.strCategory,
        recipeArea: recipe?.strArea,
      });
      console.log('[RecipeDetails] Activity logged, stats:', stats);

      if (stats) {
        showSuccess(
          `Awesome photo! You earned 20 XP! 🔥 Streak: ${stats.currentStreak}`
        );
      }
    } catch (e) {
      console.error('[RecipeDetails] Upload error', e);
      showError('Failed to upload photo. Check logs.');
    }
  };

  const handleTakePhoto = async () => {
    if (!isAuthenticated) {
      showError('Please sign in to earn XP with photos!');
      return;
    }

    try {
      console.log('[RecipeDetails] Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      console.log(
        '[RecipeDetails] Camera result:',
        result.canceled ? 'Canceled' : 'Captured'
      );

      if (!result.canceled) {
        haptics.success();
        await handleUploadPhoto(result.assets[0].uri);
        setIsCooked(true); // Update state here too if photo is uploaded successfully
      }
    } catch (e) {
      console.error('[RecipeDetails] Camera error', e);
      showError('Could not launch camera');
    }
  };

  const handleCookedThis = () => {
    haptics.light();
    Alert.alert(t('recipe_cooked_title'), t('recipe_cooked_msg'), [
      {
        text: t('common_cancel'),
        style: 'cancel',
      },
      {
        text: t('recipe_cooked_just_log'),
        onPress: async () => {
          console.log('[RecipeDetails] Just Log pressed');
          if (!isAuthenticated) {
            showError(t('gamification_signin_view')); // Reusing signin message or generic
            return;
          }
          try {
            // Play basic cook sound
            playSound('chef-recipe');

            const result = await logActivity({
              actionType: 'cook',
              token: token || undefined,
              recipeCategory: recipe?.strCategory,
              recipeArea: recipe?.strArea,
            });
            console.log('[RecipeDetails] Log Activity Result:', result);

            if (result) {
              // Play achievement sound if XP gained
              if (result.xp && result.xp > 0) {
                // Small delay to let correct sound play or mix them
                setTimeout(() => playSound('achievement'), 500);
              }

              setIsCooked(true); // Update state to disable button
              showSuccess(
                t('recipe_cooked_success_log', { streak: result.currentStreak })
              );
            } else {
              // Result null usually means user not found or auth issue despite isAuthenticated=true
              console.error('[RecipeDetails] logActivity returned null');
              showError(t('common_error'));
            }
          } catch (e) {
            console.error('[RecipeDetails] Log Activity Failed:', e);
            showError(t('common_error'));
          }
        },
      },
      {
        text: t('recipe_cooked_photo'),
        onPress: () => {
          // Play sound when starting photo flow too
          playSound('chef-recipe');
          handleTakePhoto();
        },
      },
    ]);
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
                  : require('@/assets/images/recipe_placeholder.jpg')
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
            <Animated.View
              entering={FadeIn.delay(200)}
              style={{
                position: 'absolute',
                top: insets.top + 10,
                left: 20,
                zIndex: 10,
              }}
            >
              <GlassButton
                icon="arrow-left"
                onPress={handleBack}
                size="small"
                backgroundColor={colors.background}
                backgroundOpacity={0.6}
                label=""
                intensity={40}
                iconComponent={
                  <FontAwesome5
                    name="arrow-left"
                    size={16}
                    color={colors.text}
                  />
                }
              />
            </Animated.View>

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
        <View
          style={{
            gap: 10,
            paddingHorizontal: 20,
            marginTop: -20,
            marginBottom: 60,
          }}
        >
          {/* Recipe Name Card */}
          <Animated.View
            entering={FadeInUp.delay(100).springify()}
            style={{ marginBottom: 20 }}
          >
            <GlassCard borderRadius={24}>
              <View style={{ padding: 24 }}>
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
                  {/* Primary Actions Row */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <GlassButton
                        onPress={handleAddToShoppingList}
                        label={t('recipe_add_to_list')}
                        icon="shopping-basket"
                        backgroundColor={colors.tint}
                        textColor="#FFFFFF"
                        backgroundOpacity={1}
                        size="medium"
                      />
                    </View>

                    <View>
                      <GlassButton
                        onPress={() => {
                          if (recipe) {
                            haptics.selection(); // Changed to selection for crisp feedback
                            const isFav = isFavorite(recipe.idMeal);

                            // Animate
                            favScale.value = withSequence(
                              withSpring(1.5, { damping: 10, stiffness: 400 }), // Pop up
                              withSpring(1, { damping: 10, stiffness: 400 }) // Settle
                            );

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
                        label=""
                        icon="heart" // Fallback, overridden by iconComponent
                        iconComponent={
                          <Animated.View style={favoriteIconAnimatedStyle}>
                            <FontAwesome5
                              name="heart"
                              size={18} // Slightly larger
                              color={
                                isFavorite(recipe.idMeal)
                                  ? '#dc2626'
                                  : colors.text
                              } // Red when active
                              solid={isFavorite(recipe.idMeal)}
                            />
                          </Animated.View>
                        }
                        backgroundColor={
                          isFavorite(recipe.idMeal)
                            ? 'rgba(220, 38, 38, 0.1)'
                            : undefined
                        }
                        backgroundOpacity={isFavorite(recipe.idMeal) ? 1 : 0.1}
                        size="medium"
                      />
                    </View>

                    {recipe.strYoutube && (
                      <View>
                        <GlassButton
                          onPress={handleWatchVideo}
                          label={t('recipe_watch_video')}
                          icon="youtube"
                          backgroundColor="#ff0000"
                          textColor="#FFFFFF"
                          backgroundOpacity={1}
                          size="medium"
                          iconComponent={null}
                        />
                      </View>
                    )}
                  </View>

                  {/* Pantry Button */}
                  {ingredients.some((ing) => hasIngredient(ing.name)) && (
                    <GlassButton
                      onPress={handleUseFromPantry}
                      label={t('recipe_use_pantry', {
                        count: ingredients.filter((ing) =>
                          hasIngredient(ing.name)
                        ).length,
                      })}
                      icon="box"
                      backgroundColor="#f59e0b"
                      textColor="#FFFFFF"
                      backgroundOpacity={1}
                      size="medium"
                    />
                  )}

                  {/* Cook Button - Prominent & Re-styled */}
                  <GlassButton
                    onPress={handleCookedThis}
                    label={
                      isCooked
                        ? t('recipe_cooked_done_button')
                        : t('recipe_cooked_this')
                    }
                    icon={isCooked ? 'check' : 'fire-alt'}
                    backgroundColor={isCooked ? colors.text : '#8b5cf6'} // Gray/Text color when done, Violet when active
                    textColor="#FFFFFF"
                    backgroundOpacity={isCooked ? 0.5 : 1}
                    size="large" // Made larger
                    disabled={isCooked}
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Ingredients Section */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <GlassCard borderRadius={20}>
              <View style={{ padding: 20 }}>
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
                  <GlassButton
                    onPress={() => {
                      haptics.light();
                      setShowConversions(!showConversions);
                    }}
                    label={t('recipe_convert')}
                    icon="exchange-alt"
                    size="small"
                    backgroundColor={showConversions ? colors.tint : undefined}
                    backgroundOpacity={showConversions ? 1 : 0.15}
                    textColor={showConversions ? '#FFFFFF' : colors.tint}
                    iconComponent={
                      <FontAwesome5
                        name="exchange-alt"
                        size={12}
                        color={showConversions ? 'white' : colors.tint}
                      />
                    }
                  />
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
                            <FontAwesome5
                              name="check"
                              size={12}
                              color="white"
                            />
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
                          {showConversions &&
                            canConvert(ingredient.measure) && (
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
            </GlassCard>
          </Animated.View>

          {/* Nutritional Info (Gated) */}
          <NutritionalInfo ingredients={ingredients} />

          {/* Instructions Section */}
          {recipe.strInstructions && (
            <Animated.View entering={FadeInUp.delay(300).springify()}>
              <GlassCard borderRadius={20}>
                <View style={{ padding: 20 }}>
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
                      <FontAwesome5
                        name="book-open"
                        size={16}
                        color="#10b981"
                      />
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
              </GlassCard>
            </Animated.View>
          )}

          {/* Source Link (if available) */}
          {recipe.strSource && (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <View style={{ marginBottom: 20 }}>
                <GlassButton
                  onPress={() => {
                    haptics.light();
                    Linking.openURL(recipe.strSource!);
                  }}
                  label={t('recipe_source_link')}
                  icon="link"
                  size="medium"
                  backgroundColor={colors.tint}
                  textColor={colors.tint} // Text is tinted, background is faded
                  backgroundOpacity={0.15}
                  iconComponent={
                    <FontAwesome5 name="link" size={14} color={colors.tint} />
                  }
                />
              </View>
            </Animated.View>
          )}

          {/* YouTube Link (Secondary) */}
          {recipe.strYoutube && !recipe.strSource && (
            <Animated.View entering={FadeInUp.delay(350).springify()}>
              <View style={{ marginBottom: 20 }}>
                <GlassButton
                  onPress={() => {
                    haptics.light();
                    Linking.openURL(recipe.strYoutube!);
                  }}
                  label={t('recipe_video_link')}
                  icon="youtube"
                  size="medium"
                  backgroundColor="#ff0000"
                  textColor="#ff0000"
                  backgroundOpacity={0.15}
                  iconComponent={
                    <FontAwesome5 name="youtube" size={14} color="#ff0000" />
                  }
                />
              </View>
            </Animated.View>
          )}
        </View>
        <AppBannerAd />
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
