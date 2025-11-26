import { useRef, useState, useMemo } from 'react';
import { FlatList, Pressable, Alert, TextInput } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  YStack,
  XStack,
  Heading,
  Paragraph,
  Card,
  Button,
  Input,
} from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { usePantryStore } from '@/store/pantryStore';
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import {
  useShoppingList,
  UnifiedShoppingListItem,
} from '@/hooks/useShoppingList';
import { ShoppingListItem } from '@/components/ShoppingListItem';

import { StaggeredListItem } from '@/components/StaggeredList';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  // Use unified hook
  const {
    items,
    addItem,
    removeItem,
    toggleItemChecked,
    clearCheckedItems,
    clearAllItems,
    isAuthenticated,
    isLoading,
  } = useShoppingList();

  // Pantry store
  const addToPantry = usePantryStore((state) => state.addItem);

  const [filter, setFilter] = useState<'all' | 'checked' | 'unchecked'>('all');
  const [showConversions, setShowConversions] = useState(false);
  const [showAddInput, setShowAddInput] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemMeasure, setNewItemMeasure] = useState('');

  // Calculate bottom padding: tab bar (90px) + safe area bottom + extra space (30px)
  const bottomPadding = 90 + insets.bottom + 30;

  // Filter items based on selected filter
  const filteredItems = (items || []).filter((item) => {
    if (filter === 'unchecked') return !item.checked;
    if (filter === 'checked') return item.checked;
    return true;
  });

  const checkedCount = (items || []).filter((i) => i.checked).length;

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
        { text: 'Cancel', style: 'cancel' },
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
    if ((items || []).length === 0) {
      haptics.warning();
      Alert.alert('Empty List', 'Your shopping list is already empty.');
      return;
    }

    haptics.light();
    Alert.alert(
      'Clear All',
      `Remove all ${(items || []).length} ${(items || []).length === 1 ? 'item' : 'items'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearAllItems();
            // Also clear AsyncStorage to remove old corrupt data
            try {
              const AsyncStorage =
                require('@react-native-async-storage/async-storage').default;
              await AsyncStorage.removeItem('shopping-list-storage');
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
      { text: 'Cancel', style: 'cancel' },
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
        { text: 'Cancel', style: 'cancel' },
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
    const completedItems = (items || []).filter((item) => item.checked);

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
        { text: 'Cancel', style: 'cancel' },
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
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      <YStack flex={1}>
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
            <FontAwesome5
              name="info-circle"
              size={14}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Paragraph color="white" fontWeight="600" size="$3">
              Sign in to sync your list across devices
            </Paragraph>
            <FontAwesome5
              name="chevron-right"
              size={12}
              color="white"
              style={{ marginLeft: 8, opacity: 0.8 }}
            />
          </Pressable>
        )}

        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}
        >
          <XStack alignItems="center" justifyContent="space-between">
            <YStack flex={1}>
              <Heading
                size="$9"
                fontWeight="800"
                color="$color"
                letterSpacing={-1}
              >
                Shopping List
              </Heading>
              <Paragraph size="$3" color="$color" opacity={0.6}>
                {items?.length || 0}{' '}
                {(items?.length || 0) === 1 ? 'item' : 'items'} • {checkedCount}{' '}
                completed
              </Paragraph>
            </YStack>

            {/* Actions */}
            {(items?.length || 0) > 0 && (
              <XStack gap="$2">
                <Button
                  size="$3"
                  circular
                  icon={
                    <FontAwesome5
                      name="exchange-alt"
                      size={12}
                      color={showConversions ? 'white' : colors.tint}
                    />
                  }
                  backgroundColor={
                    showConversions ? colors.tint : `${colors.tint}15`
                  }
                  onPress={() => {
                    haptics.light();
                    setShowConversions(!showConversions);
                  }}
                />
                <Button
                  size="$3"
                  circular
                  icon={<FontAwesome5 name="box" size={12} color="#f59e0b" />}
                  backgroundColor="#f59e0b15"
                  onPress={handleMoveAllCompletedToPantry}
                />
                <Button
                  size="$3"
                  circular
                  icon={
                    <FontAwesome5
                      name="check-circle"
                      size={14}
                      color={colors.tint}
                    />
                  }
                  backgroundColor={`${colors.tint}15`}
                  onPress={handleClearCompleted}
                />
                <Button
                  size="$3"
                  circular
                  icon={
                    <FontAwesome5 name="trash-alt" size={12} color="#ef4444" />
                  }
                  backgroundColor="#ef444415"
                  onPress={handleClearAll}
                />
              </XStack>
            )}
          </XStack>
        </Animated.View>

        {/* Add Custom Item Section */}
        <YStack paddingHorizontal="$4" marginBottom="$4">
          {!showAddInput ? (
            <Button
              size="$5"
              backgroundColor={colors.tint}
              borderRadius="$6"
              icon={<FontAwesome5 name="plus" size={16} color="white" />}
              onPress={() => {
                haptics.light();
                setShowAddInput(true);
              }}
              pressStyle={{ opacity: 0.9, scale: 0.98 }}
            >
              <Paragraph color="white" fontWeight="700" size="$4">
                Add Custom Item
              </Paragraph>
            </Button>
          ) : (
            <AnimatedYStack
              entering={FadeIn}
              borderRadius="$6"
              padding="$4"
              backgroundColor="$card"
              elevation={2}
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Input
                value={newItemName}
                onChangeText={setNewItemName}
                placeholder="Item name (e.g., Milk, Eggs)..."
                autoFocus
                size="$4"
                marginBottom="$3"
                backgroundColor="$background"
              />
              <Input
                value={newItemMeasure}
                onChangeText={setNewItemMeasure}
                placeholder="Amount (optional, e.g., 2 liters)..."
                size="$4"
                marginBottom="$3"
                backgroundColor="$background"
                onSubmitEditing={handleAddCustomItem}
              />
              <XStack gap="$3">
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                  onPress={() => {
                    haptics.light();
                    setShowAddInput(false);
                    setNewItemName('');
                    setNewItemMeasure('');
                  }}
                >
                  <Paragraph>Cancel</Paragraph>
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor={colors.tint}
                  onPress={handleAddCustomItem}
                >
                  <Paragraph color="white" fontWeight="700">
                    Add
                  </Paragraph>
                </Button>
              </XStack>
            </AnimatedYStack>
          )}
        </YStack>

        {/* Filter Tabs */}
        {(items?.length || 0) > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <XStack paddingHorizontal="$4" marginBottom="$3" gap="$2">
              {['all', 'unchecked', 'checked'].map((filterType) => (
                <Button
                  key={filterType}
                  flex={1}
                  size="$3"
                  backgroundColor={
                    filter === filterType ? colors.tint : `${colors.tint}15`
                  }
                  onPress={() => {
                    haptics.light();
                    setFilter(filterType as typeof filter);
                  }}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Paragraph
                    color={filter === filterType ? 'white' : colors.tint}
                    fontWeight="600"
                    textTransform="capitalize"
                    size="$3"
                  >
                    {filterType === 'unchecked'
                      ? 'Active'
                      : filterType === 'checked'
                        ? 'Completed'
                        : 'All'}
                  </Paragraph>
                </Button>
              ))}
            </XStack>
          </Animated.View>
        )}

        {/* Shopping List */}
        {isLoading ? (
          <YStack
            flex={1}
            alignItems="center"
            justifyContent="center"
            padding="$8"
          >
            <Paragraph size="$5" color="$color11">
              Loading...
            </Paragraph>
          </YStack>
        ) : (items || []).length === 0 ? (
          // Empty State
          <YStack
            flex={1}
            ai="center"
            jc="center"
            paddingHorizontal="$8"
            paddingBottom="$10"
          >
            <YStack
              width={120}
              height={120}
              borderRadius="$10"
              backgroundColor={`${colors.tint}10`}
              ai="center"
              jc="center"
              marginBottom="$5"
            >
              <FontAwesome5
                name="shopping-basket"
                size={48}
                color={colors.tint}
              />
            </YStack>
            <Heading
              size="$6"
              fontWeight="800"
              marginBottom="$2"
              textAlign="center"
            >
              Your Shopping List is Empty
            </Heading>
            <Paragraph
              size="$3"
              color="$color"
              opacity={0.6}
              textAlign="center"
              lineHeight={22}
            >
              Browse recipes and add ingredients to your shopping list. They'll
              appear here!
            </Paragraph>
          </YStack>
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
              <StaggeredListItem index={index} staggerDelay={50}>
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
              </StaggeredListItem>
            )}
            ListEmptyComponent={
              <YStack ai="center" paddingTop="$10">
                <FontAwesome5
                  name="filter"
                  size={48}
                  color={colors.text}
                  style={{ opacity: 0.2 }}
                />
                <Paragraph size="$4" marginTop="$4" opacity={0.6}>
                  No {filter} items
                </Paragraph>
              </YStack>
            }
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
