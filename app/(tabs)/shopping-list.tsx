import { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInUp,
} from 'react-native-reanimated';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { usePantryStore } from '@/store/pantryStore';
import { haptics } from '@/utils/haptics';
import { canConvert, getConvertedDisplay } from '@/utils/measurementConverter';
import { useAuth } from '@/hooks/useAuth';
import { useShoppingList, UnifiedShoppingListItem } from '@/hooks/useShoppingList';
import { ShoppingListItem } from '@/components/ShoppingListItem';

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth(); // Keep user from useAuth if needed for other logic

  // Use unified hook
  const {
    items,
    addItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    clearAllItems,
    isAuthenticated
  } = useShoppingList();

  // Pantry store (still local for now, or could be moved to Convex too later)
  const addToPantry = usePantryStore((state) => state.addItem);

  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [showConversions, setShowConversions] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemMeasure, setNewItemMeasure] = useState('');

  // Calculate bottom padding: tab bar (90px) + safe area bottom + extra space (30px)
  const bottomPadding = 90 + insets.bottom + 30;

  // Filter items based on selected filter
  const filteredItems = items.filter((item) => {
    if (filter === 'unchecked') return !item.checked;
    if (filter === 'checked') return item.checked;
    return true;
  });

  const checkedCount = (items || []).filter(i => i.checked).length;

  const handleClearCompleted = () => {
    if (checkedCount === 0) {
      haptics.warning();
      Alert.alert('No Items', 'There are no completed items to clear.');
      return;
    }

    haptics.light();
    Alert.alert(
      'Clear Completed',
      `Remove ${checkedCount} completed ${checkedCount === 1 ? 'item' : 'items'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearCheckedItems();
            haptics.success();
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (items.length === 0) {
      haptics.warning();
      Alert.alert('Empty List', 'Your shopping list is already empty.');
      return;
    }

    haptics.light();
    Alert.alert(
      'Clear All',
      `Remove all ${items.length} ${items.length === 1 ? 'item' : 'items'}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllItems();
            // Also clear AsyncStorage to remove old corrupt data
            try {
              const AsyncStorage = require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.removeItem('shopping-list-storage');
              console.log('Cleared AsyncStorage');
            } catch (e) {
              console.error('Error clearing storage:', e);
            }
            haptics.success();
          },
        },
      ]
    );
  };

  const handleDeleteItem = (item: UnifiedShoppingListItem) => {
    haptics.light();
    Alert.alert('Remove Item', `Remove "${item.name}" from shopping list?`, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await removeItem(item._id);
          haptics.success();
        },
      },
    ]);
  };

  const onToggleItem = async (id: string) => {
    haptics.selection();
    await toggleItemChecked(id);
  };
  const handleMoveToPantry = (item: UnifiedShoppingListItem) => {
    haptics.light();
    Alert.alert(
      'Move to Pantry',
      `Move "${item.name}" (${item.measure}) to your pantry?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Move',
          onPress: async () => {
            addToPantry(item.name, item.measure);
            await removeItem(item._id);
            haptics.success();
          },
        },
      ]
    );
  };

  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) {
      haptics.warning();
      Alert.alert('Empty Name', 'Please enter an item name.');
      return;
    }

    await addItem({
      name: newItemName.trim(),
      measure: newItemMeasure.trim() || 'as needed',
      recipeId: 'custom',
      recipeName: 'Custom Item',
    });

    setNewItemName('');
    setNewItemMeasure('');
    setShowAddInput(false);
    haptics.success();
  };

  const handleMoveAllCompletedToPantry = () => {
    const completedItems = items.filter((item) => item.checked);

    if (completedItems.length === 0) {
      haptics.warning();
      Alert.alert('No Items', 'There are no completed items to move.');
      return;
    }

    haptics.light();
    Alert.alert(
      'Move to Pantry',
      `Move ${completedItems.length} completed ${completedItems.length === 1 ? 'item' : 'items'} to pantry?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Move All',
          onPress: async () => {
            // Add all completed items to pantry with their quantities
            // Note: This is a bit inefficient as it does sequential deletes, 
            // but fine for small lists. Ideally we'd have a batch delete mutation.
            for (const item of completedItems) {
               addToPantry(item.name, item.measure);
               await removeItem(item._id);
            }
            haptics.success();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      {!isAuthenticated && (
        <Pressable
          onPress={() => router.push('/auth/login')}
          style={{
            backgroundColor: colors.tint,
            paddingVertical: 8,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome5 name="info-circle" size={14} color="white" style={{ marginRight: 8 }} />
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
            Sign in to sync your list across devices
          </Text>
          <FontAwesome5 name="chevron-right" size={12} color="white" style={{ marginLeft: 8, opacity: 0.8 }} />
        </Pressable>
      )}
      {/* Header */}
      <View
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: '700',
                letterSpacing: -0.5,
                marginBottom: 4,
              }}
            >
              Shopping List
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
              {items?.length || 0} {(items?.length || 0) === 1 ? 'item' : 'items'} •{' '}
              {checkedCount} completed
            </Text>
          </View>

          {/* Conversion Toggle & Clear Buttons */}
          {(items?.length || 0) > 0 && (
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5
                  name="exchange-alt"
                  size={12}
                  color={showConversions ? 'white' : colors.tint}
                />
                <Text
                  style={{
                    color: showConversions ? 'white' : colors.tint,
                    fontSize: 12,
                    fontWeight: '600',
                    marginLeft: 6,
                  }}
                >
                  Convert
                </Text>
              </Pressable>

              <Pressable
                onPress={handleMoveAllCompletedToPantry}
                style={({ pressed }) => ({
                  backgroundColor: '#f59e0b15',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5 name="box" size={12} color="#f59e0b" />
                <Text
                  style={{
                    color: '#f59e0b',
                    fontSize: 12,
                    fontWeight: '600',
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
                  flexDirection: 'row',
                  alignItems: 'center',
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
                    fontWeight: '600',
                    marginLeft: 6,
                  }}
                >
                  Clear Done
                </Text>
              </Pressable>

              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => ({
                  backgroundColor: '#ef444415',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5 name="trash-alt" size={12} color="#ef4444" />
                <Text
                  style={{
                    color: '#ef4444',
                    fontSize: 12,
                    fontWeight: '600',
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
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <FontAwesome5 name="plus" size={16} color="white" />
            <Text
              style={{
                color: 'white',
                fontWeight: '700',
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
              shadowColor: '#000',
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
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => {
                  haptics.light();
                  setShowAddInput(false);
                  setNewItemName('');
                  setNewItemMeasure('');
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: `${colors.text}10`,
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: '600',
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
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontWeight: '600',
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
      {(items?.length || 0) > 0 && (
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            marginBottom: 12,
            gap: 8,
          }}
        >
          {['all', 'unchecked', 'checked'].map((filterType) => (
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
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: filter === filterType ? 'white' : colors.tint,
                  fontSize: 14,
                  fontWeight: '600',
                  textTransform: 'capitalize',
                }}
              >
                {filterType === 'unchecked' ? 'Active' : filterType === 'checked' ? 'Completed' : 'All'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Shopping List */}
      {!items ? (
         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.text }}>Loading...</Text>
         </View>
      ) : items.length === 0 ? (
        // Empty State
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: `${colors.tint}15`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              position: 'absolute',
              top: '10%',
              left: '50%',
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
              fontWeight: '700',
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            Your Shopping List is Empty
          </Text>
          <Text
            style={{
              color: colors.text,
              fontSize: 15,
              opacity: 0.6,
              textAlign: 'center',
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
          keyExtractor={(item) => item._id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: bottomPadding,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <ShoppingListItem
              item={item}
              index={index}
              showConversion={showConversions}
              onToggle={async () => {
                haptics.light();
                await onToggleItem(item._id);
              }}
              onDelete={() => handleDeleteItem(item)}
              onMoveToPantry={() => handleMoveToPantry(item)}
              onNavigateToRecipe={() => {
                if (item.recipeId && item.recipeId !== 'custom') {
                  haptics.light();
                  router.push(`/recipe/${item.recipeId}` as any);
                }
              }}
              colors={colors}
            />
          )}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
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
