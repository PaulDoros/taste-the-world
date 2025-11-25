import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Card, YStack, XStack, Heading, Text, Button, View } from 'tamagui';
import { BlurView } from 'expo-blur';
import { Recipe } from '@/types';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface RecipeOfTheWeekProps {
  recipe: Recipe;
  onPress: (recipeId: string) => void;
  delay?: number;
}

export const RecipeOfTheWeek = React.memo<RecipeOfTheWeekProps>(
  ({ recipe, onPress, delay = 300 }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme ?? 'light'];

    return (
      <Animated.View
        entering={FadeInUp.delay(delay)}
        style={{ width: '100%', paddingHorizontal: 20, marginBottom: 32 }}
      >
        {/* Section Header */}
        <XStack alignItems="center" space="$3" marginBottom="$4">
          <YStack
            width={4}
            height={24}
            borderRadius="$10"
            backgroundColor={colors.tint}
          />
          <Heading size="$8" fontWeight="900" color="$color" letterSpacing={-0.5}>
            Recipe of the Week
          </Heading>
        </XStack>

        <Card
          elevate
          bordered
          onPress={() => onPress(recipe.idMeal)}
          borderRadius="$6"
          overflow="hidden"
          backgroundColor={colors.card}
          shadowColor={colors.tint}
          shadowOffset={{ width: 0, height: 8 }}
          shadowOpacity={0.15}
          shadowRadius={24}
          elevation={10}
          animation="quick"
          pressStyle={{ scale: 0.98 }}
          height={320}
        >
          {/* Background Image */}
          <Image
            source={{ uri: recipe.strMealThumb }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
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
              Weekly Pick
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
              {recipe.strCategory && (
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
                    {recipe.strCategory}
                  </Text>
                </View>
              )}
              {recipe.strArea && (
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
                    {recipe.strArea}
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
              {recipe.strMeal}
            </Heading>

            {/* Glassmorphic Action Bar */}
            <YStack
              borderRadius="$4"
              overflow="hidden"
              marginTop="$2"
            >
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
                    View Recipe
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
                  <FontAwesome5 name="arrow-right" size={14} color={colors.tint} />
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
