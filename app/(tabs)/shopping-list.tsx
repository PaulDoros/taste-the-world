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
import { useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from "react-native-reanimated";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import {
  useShoppingListStore,
  ShoppingListItem,
} from "@/store/shoppingListStore";
import { usePantryStore } from "@/store/pantryStore";
import { haptics } from "@/utils/haptics";
import { canConvert, getConvertedDisplay } from "@/utils/measurementConverter";

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Shopping list store
  const items = useShoppingListStore((state) => state.items);
  const addItem = useShoppingListStore((state) => state.addItem);
  const removeItem = useShoppingListStore((state) => state.removeItem);
  const updateItemQuantity = useShoppingListStore(
    (state) => state.updateItemQuantity,
  );
  const toggleItemChecked = useShoppingListStore(
    (state) => state.toggleItemChecked,
  );
  const clearCheckedItems = useShoppingListStore(
    (state) => state.clearCheckedItems,
  );
  const clearAllItems = useShoppingListStore((state) => state.clearAllItems);
  const getCheckedItemCount = useShoppingListStore(
    (state) => state.getCheckedItemCount,
  );

  // Pantry store
  const addToPantry = usePantryStore((state) => state.addItem);

  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [showConversions, setShowConversions] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemMeasure, setNewItemMeasure] = useState("");

  // Calculate bottom padding: tab bar (90px) + safe area bottom + extra space (30px)
  const bottomPadding = 90 + insets.bottom + 30;

  // Filter items based on selected filter
  const filteredItems = items.filter((item) => {
    if (filter === "active") return !item.checked;
    if (filter === "completed") return item.checked;
    return true;
  });

  const handleClearCompleted = () => {
    const checkedCount = getCheckedItemCount();
    if (checkedCount === 0) {
      haptics.warning();
      Alert.alert("No Items", "There are no completed items to clear.");
      return;
    }

    haptics.light();
    Alert.alert(
      "Clear Completed",
      `Remove ${checkedCount} completed ${checkedCount === 1 ? "item" : "items"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCheckedItems();
            haptics.success();
          },
        },
      ],
    );
  };

  const handleClearAll = () => {
    if (items.length === 0) {
      haptics.warning();
      Alert.alert("Empty List", "Your shopping list is already empty.");
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

  const handleDeleteItem = (item: ShoppingListItem) => {
    haptics.light();
    Alert.alert("Remove Item", `Remove "${item.name}" from shopping list?`, [
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

  const handleMoveToPantry = (item: ShoppingListItem) => {
    haptics.light();
    Alert.alert(
      "Move to Pantry",
      `Move "${item.name}" (${item.measure}) to your pantry?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Move",
          onPress: () => {
            addToPantry(item.name, item.measure);
            removeItem(item.id);
            haptics.success();
          },
        },
      ],
    );
  };

  const handleEditQuantity = (item: ShoppingListItem) => {
    haptics.light();
    Alert.prompt(
      "Edit Quantity",
      `Update quantity for "${item.name}"`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Update",
          onPress: (newQuantity?: string) => {
            if (newQuantity && newQuantity.trim()) {
              updateItemQuantity(item.id, newQuantity.trim());
              haptics.success();
            }
          },
        },
      ],
      "plain-text",
      item.measure,
    );
  };

  const handleAddCustomItem = () => {
    if (!newItemName.trim()) {
      haptics.warning();
      Alert.alert("Empty Name", "Please enter an item name.");
      return;
    }

    addItem({
      name: newItemName.trim(),
      measure: newItemMeasure.trim() || "as needed",
      recipeId: "custom",
      recipeName: "Custom Item",
    });

    setNewItemName("");
    setNewItemMeasure("");
    setShowAddInput(false);
    haptics.success();
  };

  const handleMoveAllCompletedToPantry = () => {
    const completedItems = items.filter((item) => item.checked);

    if (completedItems.length === 0) {
      haptics.warning();
      Alert.alert("No Items", "There are no completed items to move.");
      return;
    }

    haptics.light();
    Alert.alert(
      "Move to Pantry",
      `Move ${completedItems.length} completed ${completedItems.length === 1 ? "item" : "items"} to pantry?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Move All",
          onPress: () => {
            // Add all completed items to pantry with their quantities
            completedItems.forEach((item) => {
              addToPantry(item.name, item.measure);
              removeItem(item.id);
            });
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
              Shopping List
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
              {items.length} {items.length === 1 ? "item" : "items"} •{" "}
              {getCheckedItemCount()} completed
            </Text>
          </View>

          {/* Conversion Toggle & Clear Buttons */}
          {items.length > 0 && (
            <View style={{ gap: 8 }}>
              {/* Conversion Toggle */}
              <Pressable
                onPress={() => {
                  haptics.light();
                  setShowConversions(!showConversions);
                }}
                style={({ pressed }) => ({
                  backgroundColor: showConversions
                    ? colors.tint
                    : `${colors.tint}15`,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5
                  name="exchange-alt"
                  size={12}
                  color={showConversions ? "white" : colors.tint}
                />
                <Text
                  style={{
                    color: showConversions ? "white" : colors.tint,
                    fontSize: 12,
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  Convert
                </Text>
              </Pressable>

              <Pressable
                onPress={handleMoveAllCompletedToPantry}
                style={({ pressed }) => ({
                  backgroundColor: "#f59e0b15",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5 name="box" size={12} color="#f59e0b" />
                <Text
                  style={{
                    color: "#f59e0b",
                    fontSize: 12,
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  To Pantry
                </Text>
              </Pressable>

              <Pressable
                onPress={handleClearCompleted}
                style={({ pressed }) => ({
                  backgroundColor: `${colors.tint}15`,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5
                  name="check-circle"
                  size={12}
                  color={colors.tint}
                />
                <Text
                  style={{
                    color: colors.tint,
                    fontSize: 12,
                    fontWeight: "600",
                    marginLeft: 6,
                  }}
                >
                  Clear Done
                </Text>
              </Pressable>

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

                    zIndex: 1000,
                  }}
                >
                  Clear All
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Add Custom Item Section */}
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
              Add Custom Item
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
              placeholder="Item name (e.g., Milk, Eggs)..."
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
              placeholder="Amount (optional, e.g., 2 liters)..."
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
              onSubmitEditing={handleAddCustomItem}
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
                onPress={handleAddCustomItem}
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

      {/* Filter Tabs */}
      {items.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            marginBottom: 12,
            gap: 8,
          }}
        >
          {["all", "active", "completed"].map((filterType) => (
            <Pressable
              key={filterType}
              onPress={() => {
                haptics.light();
                setFilter(filterType as typeof filter);
              }}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor:
                  filter === filterType ? colors.tint : `${colors.tint}15`,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: filter === filterType ? "white" : colors.tint,
                  fontSize: 14,
                  fontWeight: "600",
                  textTransform: "capitalize",
                }}
              >
                {filterType}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Shopping List */}
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
              backgroundColor: `${colors.tint}15`,
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
            <FontAwesome5
              name="shopping-basket"
              size={40}
              color={colors.tint}
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
            Your Shopping List is Empty
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
            Browse recipes and add ingredients to your shopping list. They'll
            appear here!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <ShoppingListItemCard
              item={item}
              index={index}
              showConversion={showConversions}
              onToggle={() => {
                haptics.light();
                toggleItemChecked(item.id);
              }}
              onDelete={() => handleDeleteItem(item)}
              onEditQuantity={() => handleEditQuantity(item)}
              onMoveToPantry={() => handleMoveToPantry(item)}
              onNavigateToRecipe={() => {
                if (item.recipeId && item.recipeId !== "custom") {
                  haptics.light();
                  router.push(`/recipe/${item.recipeId}` as any);
                }
              }}
              colors={colors}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: "center", paddingTop: 40 }}>
              <FontAwesome5
                name="filter"
                size={48}
                color={colors.text}
                style={{ opacity: 0.2 }}
              />
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16,
                  marginTop: 16,
                  opacity: 0.6,
                }}
              >
                No {filter} items
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

/**
 * Shopping List Item Card Component
 */
const ShoppingListItemCard = ({
  item,
  index,
  showConversion,
  onToggle,
  onDelete,
  onEditQuantity,
  onMoveToPantry,
  onNavigateToRecipe,
  colors,
}: {
  item: ShoppingListItem;
  index: number;
  showConversion: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEditQuantity: () => void;
  onMoveToPantry: () => void;
  onNavigateToRecipe: () => void;
  colors: typeof Colors.light;
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
          opacity: item.checked ? 0.6 : 1,
        }}
      >
        {/* Checkbox */}
        <Pressable
          onPress={onToggle}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: item.checked ? colors.tint : colors.border,
            backgroundColor: item.checked ? colors.tint : "transparent",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          {item.checked && (
            <FontAwesome5 name="check" size={14} color="white" solid />
          )}
        </Pressable>

        {/* Item Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text,
              fontSize: 16,
              fontWeight: "600",
              textDecorationLine: item.checked ? "line-through" : "none",
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontSize: 13,
                opacity: 0.6,
                fontWeight: "500",
              }}
            >
              {item.measure}
              {showConversion && canConvert(item.measure) && (
                <Text style={{ color: colors.tint, fontWeight: "600" }}>
                  {" "}
                  {getConvertedDisplay(item.measure)}
                </Text>
              )}
            </Text>
            <Text style={{ color: colors.text, opacity: 0.3 }}>•</Text>
            <Pressable
              onPress={onNavigateToRecipe}
              disabled={item.recipeId === "custom"}
              style={({ pressed }) => ({
                opacity: item.recipeId === "custom" ? 0.5 : pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Text
                  style={{
                    color: colors.tint,
                    fontSize: 12,
                    fontWeight: "600",
                    textDecorationLine:
                      item.recipeId === "custom" ? "none" : "underline",
                  }}
                >
                  {item.recipeName}
                </Text>
                {item.recipeId !== "custom" && (
                  <FontAwesome5
                    name="external-link-alt"
                    size={9}
                    color={colors.tint}
                  />
                )}
              </View>
            </Pressable>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          {/* Edit Quantity Button */}
          <Pressable
            onPress={onEditQuantity}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: `${colors.tint}15`,
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5 name="edit" size={14} color={colors.tint} />
          </Pressable>

          {/* Pantry Button */}
          <Pressable
            onPress={onMoveToPantry}
            style={({ pressed }) => ({
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#f59e0b15",
              alignItems: "center",
              justifyContent: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5 name="box" size={14} color="#f59e0b" />
          </Pressable>

          {/* Delete Button */}
          <Pressable
            onPress={onDelete}
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
      </View>
    </Animated.View>
  );
};
