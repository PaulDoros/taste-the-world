import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card, YStack, XStack, Heading, Text, View } from 'tamagui';
import { BlurView } from 'expo-blur';
import { Recipe } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';

interface RecipeOfTheWeekProps {
  recipe: Recipe;
  onPress: (id: string) => void;
  delay?: number;
}

/**
 * Recipe of the Week Component
 * Featured hero card for the weekly special
 */
export const RecipeOfTheWeek = React.memo<RecipeOfTheWeekProps>(
  ({ recipe, onPress, delay = 200 }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];
    const { t, language } = useLanguage();

    const [displayRecipe, setDisplayRecipe] = React.useState<Recipe>(recipe);
    const [translating, setTranslating] = React.useState(false);
    const getTranslation = useAction(api.translations.getTranslation);

    React.useEffect(() => {
      // Update local state if prop changes (e.g. initial load or different recipe)
      setDisplayRecipe(recipe);
    }, [recipe]);

    React.useEffect(() => {
      const translateContent = async () => {
        if (!recipe || language === 'en' || translating) return;

        try {
          setTranslating(true);
          const contentToTranslate = {
            strMeal: recipe.strMeal,
            strCategory: recipe.strCategory,
            strArea: recipe.strArea,
          };

          const result = await getTranslation({
            relatedId: recipe.idMeal,
            language,
            field: 'recipe_card_summary',
            content: contentToTranslate,
          });

          if (result && typeof result === 'object') {
            setDisplayRecipe((prev) => ({
              ...prev,
              strMeal: result.strMeal || prev.strMeal,
              strCategory: result.strCategory || prev.strCategory,
              strArea: result.strArea || prev.strArea,
            }));
          }
        } catch (e) {
          console.error('Translation failed for recipe card', e);
        } finally {
          setTranslating(false);
        }
      };

      if (language !== 'en') {
        translateContent();
      }
    }, [recipe.idMeal, language]);

    return (
      <Animated.View entering={FadeInUp.delay(delay).springify()}>
        <Card
          padded={false}
          elevate
          bordered
          onPress={() => onPress(recipe.idMeal)}
          height={320} // Taller for hero effect
          borderRadius="$6"
          overflow="hidden"
          marginBottom="$6"
          marginHorizontal="$4"
          backgroundColor={colors.card}
          borderColor={
            colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)'
          }
          pressStyle={{ scale: 0.98, opacity: 0.95 }}
          animation="medium"
          shadowColor={colors.tint}
          shadowOffset={{ width: 0, height: 8 }}
          shadowOpacity={0.2}
          shadowRadius={16}
          elevation={8}
        >
          <Image
            source={{ uri: recipe.strMealThumb }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={[
              'transparent',
              'rgba(0,0,0,0.2)',
              'rgba(0,0,0,0.6)',
              'rgba(0,0,0,0.9)',
            ]} // More stops for smoother gradient on Android
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '60%',
            }}
          />

          {/* Badge */}
          <XStack
            position="absolute"
            top={16}
            right={16}
            backgroundColor={colors.tint}
            paddingHorizontal="$3"
            paddingVertical="$2"
            borderRadius="$4"
            alignItems="center"
            space="$2"
            elevation={5}
            shadowColor="#000"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.25}
            shadowRadius={4}
          >
            <FontAwesome5 name="star" size={12} color="white" solid />
            <Text
              color="white"
              fontSize={12}
              fontWeight="700"
              letterSpacing={0.5}
              textTransform="uppercase"
            >
              {translating ? 'Translating...' : t('home_weekly_pick')}
            </Text>
          </XStack>

          {/* Content Overlay */}
          <YStack
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            padding="$5"
          >
            {/* Category & Area */}
            <XStack space="$2" marginBottom="$2">
              {displayRecipe.strCategory && (
                <View
                  backgroundColor="rgba(255,255,255,0.2)"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.3)"
                >
                  <Text
                    color="white"
                    fontSize={11}
                    fontWeight="600"
                    letterSpacing={0.5}
                  >
                    {displayRecipe.strCategory}
                  </Text>
                </View>
              )}
              {displayRecipe.strArea && (
                <View
                  backgroundColor="rgba(255,255,255,0.2)"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.3)"
                >
                  <Text
                    color="white"
                    fontSize={11}
                    fontWeight="600"
                    letterSpacing={0.5}
                  >
                    {displayRecipe.strArea}
                  </Text>
                </View>
              )}
            </XStack>

            {/* Title */}
            <Heading
              size="$9"
              fontWeight="900"
              color="white"
              letterSpacing={-0.5}
              marginBottom="$3"
              textShadowColor="rgba(0,0,0,0.5)"
              textShadowOffset={{ width: 0, height: 2 }}
              textShadowRadius={4}
            >
              {displayRecipe.strMeal}
            </Heading>

            {/* Glassmorphic Action Bar */}
            <YStack borderRadius="$4" overflow="hidden" marginTop="$2">
              <BlurView
                intensity={30}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
              <XStack
                padding="$3"
                backgroundColor="rgba(255,255,255,0.1)"
                alignItems="center"
                justifyContent="space-between"
              >
                <XStack alignItems="center" space="$2">
                  <FontAwesome5 name="clock" size={14} color="white" />
                  <Text color="white" fontSize={13} fontWeight="600">
                    {t('home_view_recipe')}
                  </Text>
                </XStack>

                <YStack
                  width={32}
                  height={32}
                  borderRadius="$10"
                  backgroundColor="white"
                  alignItems="center"
                  justifyContent="center"
                >
                  <FontAwesome5
                    name="arrow-right"
                    size={14}
                    color={colors.tint}
                  />
                </YStack>
              </XStack>
            </YStack>
          </YStack>
        </Card>
      </Animated.View>
    );
  }
);

RecipeOfTheWeek.displayName = 'RecipeOfTheWeek';
