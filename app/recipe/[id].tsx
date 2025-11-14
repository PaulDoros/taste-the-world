import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { Recipe, Ingredient } from "@/types";
import { getRecipeById, extractIngredients } from "@/services/recipesApi";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useShoppingListStore } from "@/store/shoppingListStore";
import { usePantryStore } from "@/store/pantryStore";
import { useRecipeHistoryStore } from "@/store/recipeHistoryStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { haptics } from "@/utils/haptics";
import { canConvert, getConvertedDisplay } from "@/utils/measurementConverter";
import { IngredientSelectorModal } from "@/components/IngredientSelectorModal";

const RecipeDetailsScreen = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConversions, setShowConversions] = useState(false);

  // Modal states
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showPantryModal, setShowPantryModal] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Shopping list store
  const addMultipleItems = useShoppingListStore(
    (state) => state.addMultipleItems,
  );

  // Pantry store
  const hasIngredient = usePantryStore((state) => state.hasIngredient);
  const pantryItems = usePantryStore((state) => state.items);
  const removeFromPantry = usePantryStore((state) => state.removeItem);

  // Recipe history store
  const addToHistory = useRecipeHistoryStore((state) => state.addToHistory);

  // Favorites store
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  useEffect(() => {
    fetchRecipeDetails();
  }, [id]);

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
  }, [recipe]);

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
      console.error("Error fetching recipe details:", err);
      setError("Failed to load recipe details");
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
      alert("No ingredients to add!");
      return;
    }

    haptics.light();
    setShowShoppingModal(true);
  };

  const handleConfirmAddToShopping = (selectedIngredients: Ingredient[]) => {
    if (!recipe || selectedIngredients.length === 0) {
      return;
    }

    const itemsToAdd = selectedIngredients.map((ingredient) => ({
      name: ingredient.name,
      measure: ingredient.measure,
      recipeId: recipe.idMeal,
      recipeName: recipe.strMeal,
    }));

    addMultipleItems(itemsToAdd);
    haptics.success();

    Alert.alert(
      "Added to Shopping List! 🛒",
      `${itemsToAdd.length} ${itemsToAdd.length === 1 ? "ingredient" : "ingredients"} added to your shopping list.`,
    );
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
      Alert.alert("No Ingredients", "This recipe has no ingredients.");
      return;
    }

    // Find ingredients that are in pantry
    const ingredientsInPantry = ingredients.filter((ingredient) =>
      hasIngredient(ingredient.name),
    );

    if (ingredientsInPantry.length === 0) {
      haptics.warning();
      Alert.alert(
        "No Items in Pantry",
        "None of the ingredients for this recipe are in your pantry.",
      );
      return;
    }

    haptics.light();
    setShowPantryModal(true);
  };

  const handleConfirmUseFromPantry = (selectedIngredients: Ingredient[]) => {
    if (selectedIngredients.length === 0) {
      return;
    }

    // Remove each selected ingredient from pantry
    selectedIngredients.forEach((ingredient) => {
      // Find the pantry item by name
      const pantryItem = pantryItems.find(
        (item) => item.name === ingredient.name.toLowerCase().trim(),
      );
      if (pantryItem) {
        removeFromPantry(pantryItem.id);
      }
    });

    haptics.success();
    Alert.alert(
      "Used from Pantry! 🎉",
      `${selectedIngredients.length} ${selectedIngredients.length === 1 ? "ingredient" : "ingredients"} removed from your pantry. Enjoy your meal!`,
    );
  };

  // Loading state
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.tint} />
        <Text style={{ color: colors.text, marginTop: 12 }}>
          Loading recipe...
        </Text>
      </View>
    );
  }

  // Error state
  if (error || !recipe) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
          paddingHorizontal: 24,
        }}
      >
        <FontAwesome5
          name="exclamation-circle"
          size={48}
          color={colors.error}
        />
        <Text
          style={{
            color: colors.error,
            fontSize: 18,
            fontWeight: "700",
            marginTop: 16,
          }}
        >
          Oops!
        </Text>
        <Text
          style={{
            color: colors.text,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          {error || "Recipe not found"}
        </Text>
        <Pressable
          onPress={handleBack}
          style={{
            marginTop: 24,
            backgroundColor: colors.tint,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Recipe Image Header */}
        <Animated.View entering={FadeIn.duration(400)}>
          <View style={{ height: 300, position: "relative" }}>
            <Image
              source={{ uri: recipe.strMealThumb }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />

            {/* Gradient Overlays */}
            <LinearGradient
              colors={["rgba(0,0,0,0.6)", "transparent"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 120,
              }}
            />
            <LinearGradient
              colors={["transparent", colors.background]}
              style={{
                position: "absolute",
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
                position: "absolute",
                top: insets.top + 60,
                right: 20,
                gap: 8,
              }}
            >
              {recipe.strCategory && (
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                  <View
                    style={{
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <FontAwesome5 name="tag" size={10} color="#fbbf24" />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "600",
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
                      backgroundColor: "rgba(0,0,0,0.7)",
                      borderRadius: 16,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <FontAwesome5 name="globe" size={10} color="#10b981" />
                    <Text
                      style={{
                        color: "white",
                        fontSize: 12,
                        fontWeight: "600",
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
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
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
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* Add to Shopping List Button */}
                <Pressable
                  onPress={handleAddToShoppingList}
                  style={({ pressed }) => ({
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
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
                      color: "white",
                      fontWeight: "700",
                      fontSize: 15,
                      marginLeft: 8,
                    }}
                  >
                    Add to List
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
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isFavorite(recipe.idMeal)
                      ? "#ec4899"
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
                    color={isFavorite(recipe.idMeal) ? "white" : colors.text}
                    solid={isFavorite(recipe.idMeal)}
                  />
                </Pressable>

                {/* Watch Video Button */}
                {recipe.strYoutube && (
                  <Pressable
                    onPress={handleWatchVideo}
                    style={({ pressed }) => ({
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#ff0000",
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
                        color: "white",
                        fontWeight: "700",
                        fontSize: 15,
                        marginLeft: 8,
                      }}
                    >
                      Watch
                    </Text>
                  </Pressable>
                )}
              </View>

              {/* Second Row - Use from Pantry */}
              {ingredients.some((ing) => hasIngredient(ing.name)) && (
                <Pressable
                  onPress={handleUseFromPantry}
                  style={({ pressed }) => ({
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f59e0b",
                    paddingVertical: 14,
                    borderRadius: 16,
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  <FontAwesome5 name="box" size={16} color="white" />
                  <Text
                    style={{
                      color: "white",
                      fontWeight: "700",
                      fontSize: 15,
                      marginLeft: 8,
                    }}
                  >
                    Use from Pantry (
                    {
                      ingredients.filter((ing) => hasIngredient(ing.name))
                        .length
                    }
                    )
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
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {/* Section Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `${colors.tint}20`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome5 name="list" size={16} color={colors.tint} />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colors.text,
                      }}
                    >
                      Ingredients
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.text,
                        opacity: 0.6,
                        marginTop: 2,
                      }}
                    >
                      {ingredients.length} items
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
                    flexDirection: "row",
                    alignItems: "center",
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
                    color={showConversions ? "white" : colors.tint}
                  />
                  <Text
                    style={{
                      color: showConversions ? "white" : colors.tint,
                      fontSize: 11,
                      fontWeight: "600",
                      marginLeft: 6,
                    }}
                  >
                    Convert
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
                        flexDirection: "row",
                        alignItems: "center",
                        backgroundColor: hasIngredient(ingredient.name)
                          ? "#f59e0b10"
                          : colors.background,
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: hasIngredient(ingredient.name) ? 1 : 0,
                        borderColor: hasIngredient(ingredient.name)
                          ? "#f59e0b30"
                          : "transparent",
                      }}
                    >
                      {/* Availability Indicator */}
                      {hasIngredient(ingredient.name) ? (
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "#f59e0b",
                            alignItems: "center",
                            justifyContent: "center",
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
                          fontWeight: "500",
                        }}
                      >
                        {ingredient.name}
                        {hasIngredient(ingredient.name) && (
                          <Text
                            style={{
                              color: "#f59e0b",
                              fontSize: 12,
                              fontWeight: "600",
                              marginLeft: 6,
                            }}
                          >
                            {" "}
                            • In Pantry
                          </Text>
                        )}
                      </Text>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={{
                            color: colors.text,
                            fontSize: 14,
                            fontWeight: "600",
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
                              fontWeight: "600",
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
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.08,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                {/* Section Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      backgroundColor: `#10b98120`,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    <FontAwesome5 name="book-open" size={16} color="#10b981" />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "700",
                      color: colors.text,
                    }}
                  >
                    Instructions
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
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5
                  name="external-link-alt"
                  size={14}
                  color={colors.tint}
                />
                <Text
                  style={{
                    color: colors.tint,
                    fontSize: 14,
                    fontWeight: "600",
                    marginLeft: 10,
                    flex: 1,
                  }}
                >
                  View Original Recipe Source
                </Text>
                <FontAwesome5
                  name="chevron-right"
                  size={14}
                  color={colors.tint}
                />
              </Pressable>
            </Animated.View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 90 + insets.bottom + 30 }} /> {/* Tab bar (90px) + safe area + extra space */}
      </ScrollView>

      {/* Shopping List Modal */}
      <IngredientSelectorModal
        visible={showShoppingModal}
        onClose={() => setShowShoppingModal(false)}
        onConfirm={handleConfirmAddToShopping}
        ingredients={ingredients}
        title="Add to Shopping List"
        description="Select ingredients to add to your shopping list"
        confirmText="Add to List"
        confirmColor={colors.tint}
        icon="shopping-basket"
        iconColor={colors.tint}
        showPantryIndicator={true}
        pantryIngredients={
          new Set(
            ingredients
              .filter((ing) => hasIngredient(ing.name))
              .map((ing) => ing.name),
          )
        }
        showConversions={showConversions}
      />

      {/* Use from Pantry Modal */}
      <IngredientSelectorModal
        visible={showPantryModal}
        onClose={() => setShowPantryModal(false)}
        onConfirm={handleConfirmUseFromPantry}
        ingredients={ingredients.filter((ing) => hasIngredient(ing.name))}
        title="Use from Pantry"
        description="Select ingredients to remove from your pantry"
        confirmText="Use"
        confirmColor="#f59e0b"
        icon="box"
        iconColor="#f59e0b"
        showConversions={showConversions}
      />
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

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 600,
    });
  };

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
          position: "absolute",
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
          backgroundColor: "rgba(0,0,0,0.7)",
          borderRadius: 24,
          padding: 12,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <FontAwesome5 name="arrow-left" size={16} color="white" />
        <Text
          style={{
            color: "white",
            marginLeft: 8,
            fontWeight: "600",
            fontSize: 15,
          }}
        >
          Back
        </Text>
      </Pressable>
    </Animated.View>
  );
};

export default RecipeDetailsScreen;
