import React, { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Country, Recipe } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { CountryCard } from '@/components/CountryCard';
import { RecipeCard } from '@/components/RecipeCard';
import { isPremiumCountry } from '@/constants/Config';
import { CARD_DIMENSIONS } from '@/constants/HomeConfig';
import { haptics } from '@/utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeaturedSectionProps {
  title: string;
  subtitle?: string;
  countries?: Country[];
  recipes?: Recipe[];
  onSeeAll?: () => void;
  onCountryPress: (country: Country) => void;
  onRecipePress: (recipeId: string) => void;
  delay?: number;
}

/**
 * Reusable Featured Section Component
 * Handles both countries and recipes with consistent styling
 */
export const FeaturedSection = React.memo<FeaturedSectionProps>(
  ({
    title,
    subtitle,
    countries,
    recipes,
    onSeeAll,
    onCountryPress,
    onRecipePress,
    delay = 200,
  }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const handleSeeAll = useCallback(() => {
      haptics.light();
      onSeeAll?.();
    }, [onSeeAll]);

    const hasContent = (countries?.length ?? 0) > 0 || (recipes?.length ?? 0) > 0;
    if (!hasContent) return null;

    return (
      <Animated.View entering={FadeInUp.delay(delay)} className="mt-8">
        <View className="flex-row items-center justify-between px-6 mb-6">
          <View className="flex-1">
            <View className="flex-row items-center gap-3 mb-2">
              <View
                className="w-1 h-6 rounded-full"
                style={{ backgroundColor: colors.tint }}
                accessibilityHidden
              />
              <Text
                className="text-3xl font-extrabold"
                style={{ color: colors.text }}
                accessibilityRole="header"
              >
                {title}
              </Text>
            </View>
            {subtitle && (
              <Text
                className="text-sm ml-4"
                style={{ color: colors.tabIconDefault }}
              >
                {subtitle}
              </Text>
            )}
          </View>
          {onSeeAll && (
            <Pressable
              onPress={handleSeeAll}
              className="w-12 h-12 rounded-2xl items-center justify-center"
              style={{
                backgroundColor:
                  colorScheme === 'dark'
                    ? 'rgba(255, 255, 255, 0.1)'
                    : colors.tint + '15',
                borderWidth: 1,
                borderColor: colors.tint + '30',
              }}
              accessibilityRole="button"
              accessibilityLabel={`View all ${title.toLowerCase()}`}
            >
              <FontAwesome5 name="arrow-right" size={16} color={colors.tint} />
            </Pressable>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 16, paddingRight: 24 }}
          accessibilityRole="list"
        >
          {countries?.map((country, index) => (
            <Animated.View
              key={country.cca2}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              style={{ width: SCREEN_WIDTH * CARD_DIMENSIONS.FEATURED_COUNTRY_WIDTH }}
              accessibilityRole="listitem"
            >
              <CountryCard
                country={country}
                isPremium={isPremiumCountry(country.name.common)}
                onPress={() => onCountryPress(country)}
              />
            </Animated.View>
          ))}

          {recipes?.map((recipe, index) => (
            <Animated.View
              key={recipe.idMeal}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              style={{ width: SCREEN_WIDTH * CARD_DIMENSIONS.FEATURED_RECIPE_WIDTH }}
              accessibilityRole="listitem"
            >
              <RecipeCard
                recipe={recipe}
                onPress={() => onRecipePress(recipe.idMeal)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>
    );
  }
);

FeaturedSection.displayName = 'FeaturedSection';

