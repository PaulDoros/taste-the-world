import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Text, useTheme } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { GlassCard } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { FadeInImage } from '@/components/ui/FadeInImage';

import { Recipe } from '@/types';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard = ({ recipe, onPress }: RecipeCardProps) => {
  const theme = useTheme();
  const [imageError, setImageError] = React.useState(false);

  // ... (animations remain same)
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animated style for press effect
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Handle press in
  const handlePressIn = () => {
    scale.value = withSpring(0.96, {
      damping: 12,
      stiffness: 250,
    });
    opacity.value = withTiming(0.85, { duration: 100 });
  };

  // Handle press out
  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 12,
      stiffness: 250,
    });
    opacity.value = withTiming(1, { duration: 100 });
  };

  return (
    <Animated.View style={[{ flex: 1, paddingBottom: 6 }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <GlassCard borderRadius={24} shadowOpacity={0.3} shadowRadius={2}>
          {/* Recipe Image */}
          <View style={{ height: 180, position: 'relative' }}>
            <FadeInImage
              source={
                !imageError && recipe.strMealThumb
                  ? { uri: recipe.strMealThumb }
                  : require('@/assets/images/recipe_placeholder.jpg')
              }
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />

            {/* Gradient Overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.85)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 30,
              }}
            />

            {/* Category Badge - Top Right */}
            {recipe.strCategory && (
              <View
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 12,
                }}
              >
                <GlassButton
                  label={recipe.strCategory}
                  icon="tag"
                  size="small"
                  backgroundColor="rgba(0,0,0,0.6)"
                  backgroundOpacity={0.8}
                  textColor={theme.yellow10?.get()}
                  onPress={() => {}} // Non-interactive
                  disabled
                />
              </View>
            )}

            {/* Recipe Name - Bottom */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 12,
              }}
            >
              <Text
                numberOfLines={2}
                style={{
                  color: 'white',
                  fontSize: 16,
                  fontWeight: '700',
                  letterSpacing: 0.2,
                  textShadowColor: 'rgba(0, 0, 0, 0.9)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }}
              >
                {recipe.strMeal}
              </Text>
            </View>
          </View>

          {/* Bottom Info */}
          <View
            style={{
              padding: 12,
              // Background is handled by GlassCard
            }}
          >
            {/* Area Tag */}
            {recipe.strArea && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <GlassButton
                  label={recipe.strArea}
                  icon="globe"
                  size="small"
                  backgroundColor={theme.background?.get()}
                  backgroundOpacity={0.5}
                  textColor={theme.tint.get()}
                  onPress={() => {}}
                  disabled
                  shadowRadius={4}
                />

                {/* Arrow Icon */}
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: '$background025',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FontAwesome5
                    name="arrow-right"
                    size={12}
                    color={theme.tint.get()}
                  />
                </View>
              </View>
            )}
          </View>
        </GlassCard>
      </Pressable>
    </Animated.View>
  );
};
