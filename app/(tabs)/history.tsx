import { useState } from "react";
import { View, Text, FlatList, Pressable, Image, Alert } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useRecipeHistoryStore, RecipeHistoryItem } from "@/store/recipeHistoryStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { haptics } from "@/utils/haptics";

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent");

  const history = useRecipeHistoryStore((state) => state.history);
  const clearHistory = useRecipeHistoryStore((state) => state.clearHistory);
  const removeFromHistory = useRecipeHistoryStore((state) => state.removeFromHistory);

  const favorites = useFavoritesStore((state) => state.favorites);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const displayItems = activeTab === "recent" ? history : favorites;

  const handleClearAll = () => {
    haptics.light();
    const title = activeTab === "recent" ? "Clear History" : "Clear Favorites";
    const message =
      activeTab === "recent"
        ? "Are you sure you want to clear all recipe history?"
        : "Are you sure you want to clear all favorites?";

    Alert.alert(title, message, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          if (activeTab === "recent") {
            clearHistory();
          } else {
            clearFavorites();
          }
          haptics.success();
        },
      },
    ]);
  };

  const handleRemoveItem = (item: RecipeHistoryItem) => {
    haptics.light();
    const title =
      activeTab === "recent" ? "Remove from History" : "Remove from Favorites";
    
    Alert.alert(title, `Remove "${item.name}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          if (activeTab === "recent") {
            removeFromHistory(item.id);
          } else {
            removeFavorite(item.id);
          }
          haptics.success();
        },
      },
    ]);
  };

  const handleNavigateToRecipe = (recipeId: string) => {
    haptics.light();
    router.push(`/recipe/${recipeId}` as any);
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return `${Math.floor(seconds / 604800)}w ago`;
  };

  const bottomPadding = insets.bottom + 100;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              Recipes
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
              {displayItems.length} {displayItems.length === 1 ? "item" : "items"}
            </Text>
          </View>

          {/* Clear All Button */}
          {displayItems.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              style={({ pressed }) => ({
                backgroundColor: "#ef444415",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <FontAwesome5 name="trash-alt" size={12} color="#ef4444" />
              <Text
                style={{
                  color: "#ef4444",
                  fontSize: 12,
                  fontWeight: "600",
                  marginLeft: 6,
                }}
              >
                Clear All
              </Text>
            </Pressable>
          )}
        </View>

        {/* Tab Switcher */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab("recent");
            }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor:
                activeTab === "recent" ? "#ec4899" : `${colors.text}10`,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5
              name="history"
              size={14}
              color={activeTab === "recent" ? "white" : colors.text}
            />
            <Text
              style={{
                color: activeTab === "recent" ? "white" : colors.text,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Recent
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab("favorites");
            }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor:
                activeTab === "favorites" ? "#ec4899" : `${colors.text}10`,
              alignItems: "center",
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5
              name="heart"
              size={14}
              color={activeTab === "favorites" ? "white" : colors.text}
              solid={activeTab === "favorites"}
            />
            <Text
              style={{
                color: activeTab === "favorites" ? "white" : colors.text,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Favorites
            </Text>
          </Pressable>
        </View>
      </View>

      {/* List */}
      {displayItems.length > 0 ? (
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <HistoryItemCard
              item={item}
              index={index}
              onPress={() => handleNavigateToRecipe(item.id)}
              onRemove={() => handleRemoveItem(item)}
              isFavorited={isFavorite(item.id)}
              onToggleFavorite={() => toggleFavorite(item)}
              getTimeAgo={getTimeAgo}
              colors={colors}
            />
          )}
        />
      ) : (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: `#ec489915`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <FontAwesome5
              name={activeTab === "recent" ? "history" : "heart"}
              size={40}
              color="#ec4899"
              solid
            />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "700",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {activeTab === "recent" ? "No Recipe History" : "No Favorites Yet"}
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              opacity: 0.6,
              textAlign: "center",
            }}
          >
            {activeTab === "recent"
              ? "Recipes you view will appear here"
              : "Tap the heart on any recipe to save it here"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

/**
 * History Item Card Component
 */
const HistoryItemCard = ({
  item,
  index,
  onPress,
  onRemove,
  isFavorited,
  onToggleFavorite,
  getTimeAgo,
  colors,
}: {
  item: RecipeHistoryItem;
  index: number;
  onPress: () => void;
  onRemove: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
  getTimeAgo: (timestamp: number) => string;
  colors: typeof Colors.light;
}) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={{ marginBottom: 12 }}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        {/* Recipe Image */}
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 12,
            overflow: "hidden",
            backgroundColor: colors.background,
            marginRight: 14,
          }}
        >
          <Image
            source={{ uri: item.image }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </View>

        {/* Recipe Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 6,
            }}
            numberOfLines={2}
          >
            {item.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <FontAwesome5 name="globe" size={11} color={colors.tint} />
              <Text
                style={{
                  color: colors.tint,
                  fontSize: 12,
                  fontWeight: "600",
                }}
              >
                {item.area}
              </Text>
            </View>
            <Text style={{ color: colors.text, opacity: 0.3 }}>•</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <FontAwesome5 name="tag" size={11} color="#fbbf24" />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 12,
                  opacity: 0.6,
                  fontWeight: "500",
                }}
              >
                {item.category}
              </Text>
            </View>
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 12,
              opacity: 0.5,
              fontWeight: "500",
            }}
          >
            {getTimeAgo(item.timestamp)}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 8, marginLeft: 12 }}>
          {/* Favorite Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              haptics.light();
              onToggleFavorite();
            }}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: isFavorited ? "#ec489915" : `${colors.text}10`,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5
              name="heart"
              size={14}
              color={isFavorited ? "#ec4899" : colors.text}
              solid={isFavorited}
            />
          </Pressable>

          {/* Delete Button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#ef444415",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5 name="trash-alt" size={14} color="#ef4444" />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
};

