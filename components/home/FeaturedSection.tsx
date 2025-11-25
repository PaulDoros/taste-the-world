import React, { useCallback } from 'react';
import { Dimensions } from 'react-native';
import { YStack, XStack, Heading, Paragraph, ScrollView, Button } from 'tamagui';
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
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    const handleSeeAll = useCallback(() => {
      haptics.light();
      onSeeAll?.();
    }, [onSeeAll]);

    const hasContent = (countries?.length ?? 0) > 0 || (recipes?.length ?? 0) > 0;
    if (!hasContent) return null;

    return (
      <AnimatedYStack entering={FadeInUp.delay(delay)} marginTop="$8">
        {/* Section Header */}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          paddingHorizontal="$6"
          marginBottom="$6"
        >
          <YStack flex={1}>
            <XStack alignItems="center" space="$3" marginBottom="$2">
              {/* Accent bar */}
              <YStack
                width={4}
                height={24}
                borderRadius="$10"
                backgroundColor={colors.tint}
              />
              <Heading size="$8" fontWeight="900" color="$color">
                {title}
              </Heading>
            </XStack>
            {subtitle && (
              <Paragraph
                size="$3"
                marginLeft="$4"
                color="$color11"
                opacity={0.8}
              >
                {subtitle}
              </Paragraph>
            )}
          </YStack>

          {/* See All Button */}
          {onSeeAll && (
            <Button
              onPress={handleSeeAll}
              size="$3"
              circular
              chromeless
              width={48}
              height={48}
              backgroundColor={
                colorScheme === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : colors.tint + '15'
              }
              borderWidth={1}
              borderColor={colors.tint + '30'}
              pressStyle={{ scale: 0.95, opacity: 0.8 }}
              icon={<FontAwesome5 name="arrow-right" size={16} color={colors.tint} />}
            />
          )}
        </XStack>

        {/* Horizontal Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingVertical: 20, paddingHorizontal: 20, gap: 16, paddingRight: 80 }}
        >
          {countries?.map((country, index) => (
            <Animated.View
              key={country.cca2}
              entering={FadeInDown.delay(delay + 100 + index * 50)}
              style={{ width: SCREEN_WIDTH * CARD_DIMENSIONS.FEATURED_COUNTRY_WIDTH }}
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

