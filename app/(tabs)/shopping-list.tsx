import { useRef, useState, useMemo } from 'react';
import { FlatList, Pressable, TextInput } from 'react-native';
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
// import { usePantryStore } from '@/store/pantryStore'; // Removed local store
import { haptics } from '@/utils/haptics';
import { useAuth } from '@/hooks/useAuth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import {
  useShoppingList,
  UnifiedShoppingListItem,
} from '@/hooks/useShoppingList';
import { ShoppingListItem } from '@/components/ShoppingListItem';
import { EmptyState } from '@/components/shared/EmptyState';
import { ActionBar } from '@/components/shared/ActionBar';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { useLanguage } from '@/context/LanguageContext';

import { StaggeredListItem } from '@/components/StaggeredList';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);

export default function ShoppingListScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { confirmDelete, confirmClear, showConfirm, showSuccess, showError } =
    useAlertDialog();
  const { t } = useLanguage();
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

  // Pantry mutation
  const addPantryItem = useMutation(api.pantry.addPantryItem);

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
      showError(t('shopping_list_clear_empty_error'));
      return;
    }

    confirmClear(t('common_completed_items'), checkedCount, async () => {
      await clearCheckedItems();
    });
  };

  const handleClearAll = () => {
    if ((items || []).length === 0) {
      showError(t('shopping_list_already_empty'));
      return;
    }

    confirmClear(t('common_items'), (items || []).length, async () => {
      await clearAllItems();
      showSuccess(t('shopping_list_cleared_success'));
    });
  };

  const handleDeleteItem = (item: UnifiedShoppingListItem) => {
    confirmDelete(item.name, async () => {
      await removeItem(item._id);
    });
  };

  const onToggleItem = async (id: string) => {
    haptics.selection();
    await toggleItemChecked(id);
  };

  const handleMoveToPantry = (item: UnifiedShoppingListItem) => {
    showConfirm(
      {
        title: t('shopping_list_move_confirm_title'),
        message: t('shopping_list_move_confirm_msg', {
          name: item.name,
          measure: item.measure,
        }),
        confirmText: t('shopping_list_move_button'),
      },
      async () => {
        if (user?._id) {
          await addPantryItem({
            userId: user._id as Id<'users'>,
            name: item.name,
            displayName: item.name,
            measure: item.measure,
          });
        }
        await removeItem(item._id);
      }
    );
  };

  const handleMoveAllCompletedToPantry = () => {
    const completedItems = (items || []).filter((item) => item.checked);

    if (completedItems.length === 0) {
      showError(t('shopping_list_move_empty_error'));
      return;
    }

    showConfirm(
      {
        title: t('shopping_list_move_confirm_title'),
        message: t('shopping_list_move_all_confirm_msg', {
          count: completedItems.length,
        }),
        confirmText: t('shopping_list_move_all_button'),
      },
      async () => {
        // Add all completed items to pantry with their quantities
        for (const item of completedItems) {
          if (user?._id) {
            await addPantryItem({
              userId: user._id as Id<'users'>,
              name: item.name,
              displayName: item.name,
              measure: item.measure,
            });
          }
          await removeItem(item._id);
        }
      }
    );
  };
  const handleAddCustomItem = async () => {
    if (!newItemName.trim()) {
      showError(t('shopping_list_add_error_name'));
      return;
    }

    await addItem({
      name: newItemName.trim(),
      measure: newItemMeasure.trim() || 'as needed',
      recipeId: 'custom',
      recipeName: t('shopping_list_custom_item'),
    });

    setNewItemName('');
    setNewItemMeasure('');
    setShowAddInput(false);
    showSuccess(t('shopping_list_add_success'));
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
              {t('shopping_list_signin_sync')}
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
          <YStack gap="$4" alignItems="center">
            <YStack alignItems="center">
              <Heading
                size="$9"
                fontWeight="800"
                color="$color"
                letterSpacing={-1}
                textAlign="center"
              >
                {t('shopping_list')}
              </Heading>
              <Paragraph
                size="$3"
                color="$color"
                opacity={0.6}
                textAlign="center"
              >
                {t(
                  items?.length === 1
                    ? 'shopping_list_items_count_single'
                    : 'shopping_list_items_count',
                  { count: items?.length || 0, completed: checkedCount }
                )}
              </Paragraph>
            </YStack>

            {/* Actions */}
            {(items?.length || 0) > 0 && (
              <YStack width="100%">
                <ActionBar
                  columns={2}
                  actions={[
                    {
                      label: t('shopping_list_convert'),
                      icon: 'exchange-alt',
                      onPress: () => setShowConversions(!showConversions),
                      variant: showConversions ? 'primary' : 'secondary',
                    },
                    {
                      label: t('shopping_list_move_all'),
                      icon: 'box',
                      onPress: handleMoveAllCompletedToPantry,
                      variant: 'secondary',
                    },
                    {
                      label: t('shopping_list_clear_done'),
                      icon: 'check-circle',
                      onPress: handleClearCompleted,
                      variant: 'secondary',
                    },
                    {
                      label: t('shopping_list_clear_all'),
                      icon: 'trash-alt',
                      onPress: handleClearAll,
                      variant: 'danger',
                    },
                  ]}
                />
              </YStack>
            )}
          </YStack>
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
                {t('shopping_list_custom_item')}
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
                placeholder={t('pantry_placeholder_name')}
                autoFocus
                size="$4"
                marginBottom="$3"
                backgroundColor="$background"
              />
              <Input
                value={newItemMeasure}
                onChangeText={setNewItemMeasure}
                placeholder={t('pantry_placeholder_amount')}
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
                  <Paragraph>{t('shopping_list_cancel')}</Paragraph>
                </Button>
                <Button
                  flex={1}
                  size="$4"
                  backgroundColor={colors.tint}
                  onPress={handleAddCustomItem}
                >
                  <Paragraph color="white" fontWeight="700">
                    {t('shopping_list_add')}
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
                      ? t('shopping_list_filter_active')
                      : filterType === 'checked'
                        ? t('shopping_list_filter_completed')
                        : t('shopping_list_filter_all')}
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
              {t('shopping_list_loading')}
            </Paragraph>
          </YStack>
        ) : (items || []).length === 0 ? (
          // Empty State
          <EmptyState
            icon="shopping-basket"
            title={t('shopping_list_empty_title')}
            description={t('shopping_list_empty_desc')}
          />
        ) : (
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingHorizontal: 10,
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
                      router.push(`/recipe/${item.recipeId}`);
                    }
                  }}
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
                  {t('shopping_list_no_filter_items', { filter })}
                </Paragraph>
              </YStack>
            }
          />
        )}
      </YStack>
    </SafeAreaView>
  );
}
