import React, { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { YStack, ScrollView } from 'tamagui';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Country, Recipe } from '@/types';
import { CountryCard } from '@/components/CountryCard';
import { RecipeCard } from '@/components/RecipeCard'; // Assuming RecipeCard hasn't been refactored yet, need to check its props or keep usage
import { SectionHeader } from '@/components/shared/SectionHeader';
import { isFreeCountry } from '@/constants/Config';
import { CARD_DIMENSIONS } from '@/constants/HomeConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AnimatedYStack = Animated.createAnimatedComponent(YStack);

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
 * Featured Section Component
 * Modern Tamagui-powered horizontal scroll section
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
    // No local state or colors needed now!

    const hasContent =
      (countries?.length ?? 0) > 0 || (recipes?.length ?? 0) > 0;
    if (!hasContent) return null;

    return (
      <AnimatedYStack
        entering={FadeInUp.delay(delay)}
        marginTop="$6"
        marginBottom="$2"
      >
        <SectionHeader title={title} subtitle={subtitle} onSeeAll={onSeeAll} />

        {/* Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToInterval={
            SCREEN_WIDTH * CARD_DIMENSIONS.FEATURED_COUNTRY_WIDTH + 16
          }
          contentContainerStyle={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            gap: 16,
            paddingRight: 40,
          }}
        >
          {countries?.map((country, index) => (
            <Animated.View
              key={country.cca2}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              style={{
                width: SCREEN_WIDTH * CARD_DIMENSIONS.FEATURED_COUNTRY_WIDTH,
              }}
            >
              <CountryCard
                country={country}
                isPremium={!isFreeCountry(country.name.common)}
                onPress={() => onCountryPress(country)}
              />
            </Animated.View>
          ))}

          {recipes?.map((recipe, index) => (
            <Animated.View
              key={recipe.idMeal}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              style={{
                width: SCREEN_WIDTH * CARD_DIMENSIONS.FEATURED_RECIPE_WIDTH,
              }}
            >
              <RecipeCard
                recipe={recipe}
                onPress={() => onRecipePress(recipe.idMeal)}
              />
            </Animated.View>
          ))}
        </ScrollView>
      </AnimatedYStack>
    );
  }
);

FeaturedSection.displayName = 'FeaturedSection';
