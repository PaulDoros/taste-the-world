import { Text, Image, Pressable, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Recipe } from "@/types";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

export const RecipeCard = ({ recipe, onPress }: RecipeCardProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

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
    <Animated.View style={[{ flex: 1 }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: colors.card,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Recipe Image */}
        <View style={{ height: 180, position: "relative" }}>
          <Image
            source={{ uri: recipe.strMealThumb }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />

          {/* Gradient Overlay */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.85)"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
            }}
          />

          {/* Category Badge - Top Right */}
          {recipe.strCategory && (
            <View
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                backgroundColor: "rgba(0,0,0,0.7)",
                borderRadius: 16,
                paddingHorizontal: 10,
                paddingVertical: 6,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <FontAwesome5 name="tag" size={10} color="#fbbf24" />
              <Text
                style={{
                  color: "white",
                  fontSize: 11,
                  fontWeight: "600",
                  marginLeft: 4,
                  letterSpacing: 0.3,
                }}
              >
                {recipe.strCategory}
              </Text>
            </View>
          )}

          {/* Recipe Name - Bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 12,
            }}
          >
            <Text
              numberOfLines={2}
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: 0.2,
                textShadowColor: "rgba(0, 0, 0, 0.9)",
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
            padding: 0,
            backgroundColor: colors.card,
          }}
        >
          {/* Area Tag */}
          {recipe.strArea && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: `${colors.tint}15`,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flex: 1,
                }}
              >
                <FontAwesome5 name="globe" size={10} color={colors.tint} />
                <Text
                  style={{
                    color: colors.tint,
                    fontSize: 11,
                    fontWeight: "600",
                    marginLeft: 5,
                    letterSpacing: 0.3,
                  }}
                >
                  {recipe.strArea}
                </Text>
              </View>

              {/* Arrow Icon */}
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: `${colors.tint}15`,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 8,
                }}
              >
                <FontAwesome5
                  name="arrow-right"
                  size={12}
                  color={colors.tint}
                />
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};
