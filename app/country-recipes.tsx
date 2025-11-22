import { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Pressable,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Recipe } from '@/types';
import { getRecipesByArea, getRecipeById } from '@/services/recipesApi';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { RecipeCard } from '@/components/RecipeCard';
import { haptics } from '@/utils/haptics';
import { SearchBar } from '@/components/SearchBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding

// Spicy keywords to detect spicy recipes
const SPICY_KEYWORDS = [
  'spicy',
  'hot',
  'chili',
  'chilli',
  'pepper',
  'curry',
  'cayenne',
  'jalapeño',
  'habanero',
  'sriracha',
  'wasabi',
  'szechuan',
  'sichuan',
];

// Difficulty estimation based on ingredient count
const getDifficulty = (ingredientCount: number): 'Easy' | 'Medium' | 'Hard' => {
  if (ingredientCount <= 5) return 'Easy';
  if (ingredientCount <= 10) return 'Medium';
  return 'Hard';
};

type FilterType = 'all' | 'spicy' | 'easy' | 'medium' | 'hard';
type CategoryFilter = string | 'all';

export default function CountryRecipesScreen() {
  const { countryName, area, countryCode } = useLocalSearchParams<{
    countryName: string;
    area: string;
    countryCode: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [recipesWithDetails, setRecipesWithDetails] = useState<
    Map<string, Recipe>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>('all');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (area) {
      fetchAllRecipes();
    }
  }, [area]);

  // Fetch full recipe details in background for filtering
  useEffect(() => {
    if (allRecipes.length > 0 && recipesWithDetails.size === 0) {
      fetchRecipeDetails();
    }
  }, [allRecipes]);

  // Extract categories from loaded recipe details
  useEffect(() => {
    if (recipesWithDetails.size > 0) {
      const categories = new Set<string>();
      recipesWithDetails.forEach((recipe) => {
        if (recipe.strCategory) {
          categories.add(recipe.strCategory);
        }
      });
      setAvailableCategories(Array.from(categories).sort());
    }
  }, [recipesWithDetails]);

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedRecipes = await getRecipesByArea(area!);
      setAllRecipes(fetchedRecipes);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch full details for recipes (for better filtering)
  const fetchRecipeDetails = async () => {
    setLoadingDetails(true);
    const detailsMap = new Map<string, Recipe>();

    // Fetch details for first 20 recipes (to avoid too many API calls)
    const recipesToFetch = allRecipes.slice(0, 20);

    try {
      await Promise.all(
        recipesToFetch.map(async (recipe) => {
          try {
            const fullRecipe = await getRecipeById(recipe.idMeal);
            if (fullRecipe) {
              detailsMap.set(recipe.idMeal, fullRecipe);
            }
          } catch (err) {
            console.error(`Error fetching details for ${recipe.idMeal}:`, err);
          }
        })
      );
      setRecipesWithDetails(detailsMap);
    } catch (err) {
      console.error('Error fetching recipe details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Filter recipes based on search and filters
  const filteredRecipes = useMemo(() => {
    let filtered = [...allRecipes];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((recipe) =>
        recipe.strMeal.toLowerCase().includes(query)
      );
    }

    // Spicy filter
    if (filterType === 'spicy') {
      filtered = filtered.filter((recipe) => {
        const name = recipe.strMeal.toLowerCase();
        return SPICY_KEYWORDS.some((keyword) => name.includes(keyword));
      });
    }

    // Difficulty filter (requires full details)
    if (
      filterType === 'easy' ||
      filterType === 'medium' ||
      filterType === 'hard'
    ) {
      filtered = filtered.filter((recipe) => {
        const fullRecipe = recipesWithDetails.get(recipe.idMeal);
        if (!fullRecipe) return false; // Skip if details not loaded

        // Count ingredients
        let ingredientCount = 0;
        for (let i = 1; i <= 20; i++) {
          const key = `strIngredient${i}` as keyof Recipe;
          if (fullRecipe[key] && fullRecipe[key]?.trim()) {
            ingredientCount++;
          }
        }

        const difficulty = getDifficulty(ingredientCount);
        return difficulty.toLowerCase() === filterType;
      });
    }

    // Category filter (requires full details)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((recipe) => {
        const fullRecipe = recipesWithDetails.get(recipe.idMeal);
        return fullRecipe?.strCategory === selectedCategory;
      });
    }

    return filtered;
  }, [
    allRecipes,
    searchQuery,
    filterType,
    selectedCategory,
    recipesWithDetails,
  ]);

  const handleBack = () => {
    haptics.light();
    router.back();
  };

  const handleRecipePress = (recipeId: string) => {
    haptics.light();
    router.push(`/recipe/${recipeId}`);
  };

  const clearFilters = () => {
    haptics.light();
    setSearchQuery('');
    setFilterType('all');
    setSelectedCategory('all');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    filterType !== 'all' ||
    selectedCategory !== 'all';

  // Loading state
  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={{ color: colors.text, marginTop: 16, fontSize: 16 }}>
            Loading recipes...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error || !allRecipes.length) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Pressable
            onPress={handleBack}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${colors.tint}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <FontAwesome5 name="arrow-left" size={18} color={colors.tint} />
          </Pressable>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text,
              flex: 1,
            }}
          >
            {countryName || 'Recipes'}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
          }}
        >
          <FontAwesome5
            name="utensils"
            size={64}
            color={colors.tabIconDefault}
            style={{ opacity: 0.3 }}
          />
          <Text
            style={{
              fontSize: 20,
              fontWeight: '600',
              color: colors.text,
              marginTop: 16,
              textAlign: 'center',
            }}
          >
            {error || 'No recipes found'}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.tabIconDefault,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            {error
              ? 'Please try again later'
              : 'No recipes available for this country'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: `${colors.tint}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <FontAwesome5 name="arrow-left" size={18} color={colors.tint} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: colors.text,
            }}
          >
            {countryName || 'Recipes'}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.tabIconDefault,
              marginTop: 2,
            }}
          >
            {filteredRecipes.length} of {allRecipes.length}{' '}
            {allRecipes.length === 1 ? 'recipe' : 'recipes'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={`Search ${countryName || 'recipes'}...`}
          colors={colors}
        />
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 12,
          gap: 8,
        }}
      >
        {/* Difficulty/Spicy Filters */}
        <Pressable
          onPress={() => {
            haptics.light();
            setFilterType(filterType === 'spicy' ? 'all' : 'spicy');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: filterType === 'spicy' ? '#ef4444' : colors.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            height: 32,
            borderColor: filterType === 'spicy' ? '#ef4444' : colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <FontAwesome5
            name="fire"
            size={12}
            color={filterType === 'spicy' ? 'white' : '#ef4444'}
          />
          <Text
            style={{
              color: filterType === 'spicy' ? 'white' : colors.text,
              fontSize: 13,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Spicy
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            haptics.light();
            setFilterType(filterType === 'easy' ? 'all' : 'easy');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            height: 32,
            backgroundColor: filterType === 'easy' ? '#10b981' : colors.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: filterType === 'easy' ? '#10b981' : colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <FontAwesome5
            name="check-circle"
            size={12}
            color={filterType === 'easy' ? 'white' : '#10b981'}
          />
          <Text
            style={{
              color: filterType === 'easy' ? 'white' : colors.text,
              fontSize: 13,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Easy
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            haptics.light();
            setFilterType(filterType === 'medium' ? 'all' : 'medium');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: filterType === 'medium' ? '#f59e0b' : colors.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            height: 32,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: filterType === 'medium' ? '#f59e0b' : colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <FontAwesome5
            name="clock"
            size={12}
            color={filterType === 'medium' ? 'white' : '#f59e0b'}
          />
          <Text
            style={{
              color: filterType === 'medium' ? 'white' : colors.text,
              fontSize: 13,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Medium
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            haptics.light();
            setFilterType(filterType === 'hard' ? 'all' : 'hard');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: filterType === 'hard' ? '#8b5cf6' : colors.card,
            paddingHorizontal: 16,
            paddingVertical: 8,
            height: 32,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: filterType === 'hard' ? '#8b5cf6' : colors.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <FontAwesome5
            name="star"
            size={12}
            color={filterType === 'hard' ? 'white' : '#8b5cf6'}
          />
          <Text
            style={{
              color: filterType === 'hard' ? 'white' : colors.text,
              fontSize: 13,
              fontWeight: '600',
              marginLeft: 6,
            }}
          >
            Hard
          </Text>
        </Pressable>

        {/* Category Filter */}
        {availableCategories.length > 0 && (
          <>
            <Pressable
              onPress={() => {
                haptics.light();
                setShowCategoryModal(true);
              }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor:
                  selectedCategory !== 'all' ? colors.tint : colors.card,
                paddingHorizontal: 16,
                height: 32,
                borderRadius: 20,
                borderWidth: 1,
                borderColor:
                  selectedCategory !== 'all' ? colors.tint : colors.border,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <FontAwesome5
                name="tag"
                size={12}
                color={selectedCategory !== 'all' ? 'white' : colors.tint}
              />
              <Text
                style={{
                  color: selectedCategory !== 'all' ? 'white' : colors.text,
                  fontSize: 13,
                  fontWeight: '600',
                  marginLeft: 6,
                }}
                numberOfLines={1}
              >
                {selectedCategory === 'all'
                  ? 'Category'
                  : selectedCategory.length > 10
                    ? `${selectedCategory.substring(0, 10)}...`
                    : selectedCategory}
              </Text>
              <FontAwesome5
                name="chevron-down"
                size={10}
                color={selectedCategory !== 'all' ? 'white' : colors.text}
                style={{ marginLeft: 6, opacity: 0.6 }}
              />
            </Pressable>

            {/* Category Selection Modal */}
            <Modal
              visible={showCategoryModal}
              transparent
              animationType="fade"
              onRequestClose={() => setShowCategoryModal(false)}
            >
              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => setShowCategoryModal(false)}
              >
                <Pressable
                  onPress={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: colors.card,
                    borderRadius: 20,
                    padding: 20,
                    width: '80%',
                    maxWidth: 300,
                    maxHeight: '70%',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 10,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 16,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '700',
                        color: colors.text,
                      }}
                    >
                      Select Category
                    </Text>
                    <Pressable
                      onPress={() => setShowCategoryModal(false)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: `${colors.text}10`,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FontAwesome5
                        name="times"
                        size={14}
                        color={colors.text}
                      />
                    </Pressable>
                  </View>

                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={{ maxHeight: 400 }}
                  >
                    {/* All Option */}
                    <Pressable
                      onPress={() => {
                        haptics.light();
                        setSelectedCategory('all');
                        setShowCategoryModal(false);
                      }}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderRadius: 12,
                        backgroundColor:
                          selectedCategory === 'all'
                            ? `${colors.tint}15`
                            : 'transparent',
                        marginBottom: 4,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <FontAwesome5
                        name={
                          selectedCategory === 'all' ? 'check-circle' : 'circle'
                        }
                        size={16}
                        color={
                          selectedCategory === 'all'
                            ? colors.tint
                            : colors.tabIconDefault
                        }
                        solid={selectedCategory === 'all'}
                      />
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight:
                            selectedCategory === 'all' ? '600' : '500',
                          color: colors.text,
                          marginLeft: 12,
                        }}
                      >
                        All Categories
                      </Text>
                      {selectedCategory === 'all' && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: colors.tabIconDefault,
                            marginLeft: 'auto',
                          }}
                        >
                          ({availableCategories.length})
                        </Text>
                      )}
                    </Pressable>

                    {/* Category Options */}
                    {availableCategories.map((category) => (
                      <Pressable
                        key={category}
                        onPress={() => {
                          haptics.light();
                          setSelectedCategory(category);
                          setShowCategoryModal(false);
                        }}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderRadius: 12,
                          backgroundColor:
                            selectedCategory === category
                              ? `${colors.tint}15`
                              : 'transparent',
                          marginBottom: 4,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <FontAwesome5
                          name={
                            selectedCategory === category
                              ? 'check-circle'
                              : 'circle'
                          }
                          size={16}
                          color={
                            selectedCategory === category
                              ? colors.tint
                              : colors.tabIconDefault
                          }
                          solid={selectedCategory === category}
                        />
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight:
                              selectedCategory === category ? '600' : '500',
                            color: colors.text,
                            marginLeft: 12,
                          }}
                        >
                          {category}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>
          </>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Pressable
            onPress={clearFilters}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.card,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              height: 32,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5 name="times" size={12} color={colors.text} />
            <Text
              style={{
                color: colors.text,
                fontSize: 13,
                fontWeight: '600',
                marginLeft: 6,
              }}
            >
              Clear
            </Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Recipes Grid */}
      <FlatList
        data={filteredRecipes}
        numColumns={2}
        keyExtractor={(item) => item.idMeal}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 90 + insets.bottom + 32, // Account for tab bar
        }}
        columnWrapperStyle={{
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 50).springify()}
            style={{
              width: CARD_WIDTH,
            }}
          >
            <RecipeCard
              recipe={item}
              onPress={() => handleRecipePress(item.idMeal)}
            />
          </Animated.View>
        )}
        ListEmptyComponent={() => (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 64,
            }}
          >
            <FontAwesome5
              name="search"
              size={48}
              color={colors.tabIconDefault}
              style={{ opacity: 0.3 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginTop: 16,
              }}
            >
              No recipes found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.tabIconDefault,
                marginTop: 8,
                textAlign: 'center',
                paddingHorizontal: 32,
              }}
            >
              Try adjusting your search or filters
            </Text>
            {hasActiveFilters && (
              <Pressable
                onPress={clearFilters}
                style={{
                  marginTop: 16,
                  backgroundColor: colors.tint,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: '600',
                    fontSize: 14,
                  }}
                >
                  Clear All Filters
                </Text>
              </Pressable>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
}
