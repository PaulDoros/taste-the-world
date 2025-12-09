import { useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'tamagui';

import { PantryItem } from '@/store/pantryStore';
import { haptics } from '@/utils/haptics';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { PantryItemCard } from '@/components/PantryItemCard';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useLanguage } from '@/context/LanguageContext';

export default function PantryScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { confirmDelete, confirmClear, showError } = useAlertDialog();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  const { user, token } = useAuth();

  // Convex mutations
  const addPantryItem = useMutation(api.pantry.addPantryItem);
  const removePantryItem = useMutation(api.pantry.removePantryItem);
  const clearPantry = useMutation(api.pantry.clearPantry);

  // Fetch pantry items
  const convexItems =
    useQuery(api.pantry.getPantryItems, token ? { token } : 'skip') || [];

  // Map to format expected by UI (id instead of _id)
  const items = convexItems.map((item: any) => ({
    ...item,
    id: item._id,
  }));

  const [newItemName, setNewItemName] = useState('');
  const [newItemMeasure, setNewItemMeasure] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  // Calculate bottom padding: tab bar (90px) + safe area bottom + extra space (30px)
  const bottomPadding = 90 + insets.bottom + 30;

  // Sort items alphabetically
  const sortedItems = [...items].sort((a, b) =>
    a.displayName.localeCompare(b.displayName)
  );

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      haptics.warning();
      showError(t('pantry_add_error_name'));
      return;
    }

    if (user?._id) {
      addPantryItem({
        userId: user._id as Id<'users'>,
        name: newItemName.trim(),
        displayName: newItemName.trim(),
        measure: newItemMeasure.trim() || t('common_as_needed'),
      });
    }
    setNewItemName('');
    setNewItemMeasure('');
    setShowAddInput(false);
    haptics.success();
  };

  const handleDeleteItem = (item: PantryItem) => {
    confirmDelete(item.displayName, () => {
      removePantryItem({ itemId: item.id as Id<'pantry'> });
    });
  };

  const handleClearAll = () => {
    if (items.length === 0) {
      haptics.warning();
      showError(t('pantry_already_empty'));
      return;
    }

    confirmClear(t('pantry'), items.length, () => {
      if (user?._id) {
        clearPantry({ userId: user._id as Id<'users'> });
      }
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
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
              {t('pantry_title')}
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
              {t(
                items.length === 1
                  ? 'pantry_subtitle_single'
                  : 'pantry_subtitle',
                { count: items.length }
              )}
            </Text>
          </View>

          {/* Action Buttons */}
          {items.length > 0 && (
            <View style={{ gap: 8, flexDirection: 'row' }}>
              <Pressable
                onPress={() => {
                  haptics.medium();
                  // @ts-ignore - router.push works with string path
                  router.push('/scan');
                }}
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
                <FontAwesome5 name="camera" size={12} color={colors.tint} />
                <Text
                  style={{
                    color: colors.tint,
                    fontSize: 12,
                    fontWeight: '600',
                    marginLeft: 6,
                  }}
                >
                  {t('pantry_scan_button')}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => ({
                  backgroundColor: `${colors.error}15`,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <FontAwesome5 name="trash-alt" size={12} color={colors.error} />
                <Text
                  style={{
                    color: colors.error,
                    fontSize: 12,
                    fontWeight: '600',
                    marginLeft: 6,
                  }}
                >
                  {t('pantry_clear_all_button')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* Add Item Button/Input */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {items.length > 0 && !showAddInput && (
          <Pressable
            onPress={() => {
              haptics.medium();
              // @ts-ignore - router.push works with string path
              router.push('/generator');
            }}
            style={({ pressed }) => ({
              backgroundColor: colors.tint,
              marginBottom: 12,
              paddingVertical: 14,
              borderRadius: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.8 : 1,
              shadowColor: colors.tint,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            })}
          >
            <FontAwesome5 name="magic" size={16} color="white" />
            <Text
              style={{
                color: 'white',
                fontWeight: '700',
                fontSize: 16,
                marginLeft: 8,
              }}
            >
              {t('pantry_generate_recipe_button')}
            </Text>
          </Pressable>
        )}

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
              {t('pantry_add_item_button')}
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
              placeholder={t('pantry_placeholder_name')}
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
              placeholder={t('pantry_placeholder_amount')}
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
                  {t('pantry_cancel_button')}
                </Text>
              </Pressable>
              <Pressable
                onPress={handleAddItem}
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
                  {t('pantry_add_button')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
      <View style={{ flex: 1 }}>
        {/* Pantry List */}
        {items.length === 0 ? (
          // Empty State

          <EmptyState
            icon="box"
            title={t('pantry_empty_title')}
            description={t('pantry_empty_desc')}
          />
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
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
