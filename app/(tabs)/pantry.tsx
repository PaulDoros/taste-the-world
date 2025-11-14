import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { usePantryStore, PantryItem } from "@/store/pantryStore";
import { haptics } from "@/utils/haptics";

export default function PantryScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  // Pantry store
  const items = usePantryStore((state) => state.items);
  const addItem = usePantryStore((state) => state.addItem);
  const removeItem = usePantryStore((state) => state.removeItem);
  const clearAllItems = usePantryStore((state) => state.clearAllItems);

  const [newItemName, setNewItemName] = useState("");
  const [newItemMeasure, setNewItemMeasure] = useState("");
  const [showAddInput, setShowAddInput] = useState(false);

  // Calculate bottom padding: tab bar (90px) + safe area bottom + extra space (30px)
  const bottomPadding = 90 + insets.bottom + 30;

  // Sort items alphabetically
  const sortedItems = [...items].sort((a, b) =>
    a.displayName.localeCompare(b.displayName),
  );

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      haptics.warning();
      Alert.alert("Empty Name", "Please enter an ingredient name.");
      return;
    }

    addItem(newItemName, newItemMeasure.trim() || "as needed");
    setNewItemName("");
    setNewItemMeasure("");
    setShowAddInput(false);
    haptics.success();
  };

  const handleDeleteItem = (item: PantryItem) => {
    haptics.light();
    Alert.alert("Remove Item", `Remove "${item.displayName}" from pantry?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          removeItem(item.id);
          haptics.success();
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (items.length === 0) {
      haptics.warning();
      Alert.alert("Empty Pantry", "Your pantry is already empty.");
      return;
    }

    haptics.light();
    Alert.alert(
      "Clear All",
      `Remove all ${items.length} ${items.length === 1 ? "item" : "items"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            clearAllItems();
            haptics.success();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={["top", "left", "right"]}
    >
      {/* Header */}
      <View
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: "700",
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              My Pantry
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
              {items.length} {items.length === 1 ? "ingredient" : "ingredients"}{" "}
              on hand
            </Text>
          </View>

          {/* Action Buttons */}
          {items.length > 0 && (
            <View style={{ gap: 8 }}>
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
            </View>
          )}
        </View>
      </View>

      {/* Add Item Button/Input */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {!showAddInput ? (
          <Pressable
            onPress={() => {
              haptics.light();
              setShowAddInput(true);
            }}
            style={({ pressed }) => ({
              backgroundColor: colors.tint,
              paddingVertical: 14,
              borderRadius: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <FontAwesome5 name="plus" size={16} color="white" />
            <Text
              style={{
                color: "white",
                fontWeight: "700",
                fontSize: 15,
                marginLeft: 8,
              }}
            >
              Add Ingredient
            </Text>
          </Pressable>
        ) : (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Ingredient name (e.g., Sugar, Flour)..."
              placeholderTextColor={`${colors.text}60`}
              autoFocus
              style={{
                color: colors.text,
                fontSize: 16,
                marginBottom: 12,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                backgroundColor: colors.background,
              }}
            />
            <TextInput
              value={newItemMeasure}
              onChangeText={setNewItemMeasure}
              placeholder="Quantity (optional, e.g., 500g, 2 cups)..."
              placeholderTextColor={`${colors.text}60`}
              style={{
                color: colors.text,
                fontSize: 16,
                marginBottom: 12,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                backgroundColor: colors.background,
              }}
              onSubmitEditing={handleAddItem}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setShowAddInput(false);
                  setNewItemName("");
                  setNewItemMeasure("");
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: `${colors.text}10`,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </Pressable>
              <Pressable
                onPress={handleAddItem}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: colors.tint,
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    fontWeight: "600",
                  }}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Pantry List */}
      {items.length === 0 ? (
        // Empty State
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
              backgroundColor: `#f59e0b15`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              position: "absolute",
              top: "10%",
              left: "50%",
              transform: [
                // half the icon's width
                { translateY: 200 }, // half the icon's height
              ],
            }}
          >
            <FontAwesome5 name="box" size={40} color="#f59e0b" solid />
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
            Your Pantry is Empty
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              opacity: 0.6,
              textAlign: "center",
              lineHeight: 22,
            }}
          >
            Add ingredients you have at home. We'll show you which ones you need
            when viewing recipes!
          </Text>
        </View>
      ) : (
        <FlatList
          data={sortedItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <PantryItemCard
              item={item}
              index={index}
              onDelete={() => handleDeleteItem(item)}
              colors={colors}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

/**
 * Pantry Item Card Component
 */
const PantryItemCard = ({
  item,
  index,
  onDelete,
  colors,
}: {
  item: PantryItem;
  index: number;
  onDelete: () => void;
  colors: typeof Colors.light;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 300,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 30).springify()}
      style={[
        {
          marginBottom: 12,
        },
        animatedStyle,
      ]}
    >
      <View
        style={{
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
        }}
      >
        {/* Icon */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "#f59e0b15",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <FontAwesome5 name="check-circle" size={18} color="#f59e0b" solid />
        </View>

        {/* Item Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            {item.displayName}
          </Text>
          <Text
            style={{
              color: "#f59e0b",
              fontSize: 13,
              fontWeight: "600",
              marginTop: 2,
            }}
          >
            {item.measure}
          </Text>
        </View>

        {/* Delete Button */}
        <Pressable
          onPress={onDelete}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
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
    </Animated.View>
  );
};
