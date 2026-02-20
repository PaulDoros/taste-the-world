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
import { GlassButton } from '@/components/ui/GlassButton';
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
  const togglePantryItemChecked = useMutation(
    api.pantry.togglePantryItemChecked
  );
  const logActivity = useMutation(api.gamification.logActivity);

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

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      haptics.warning();
      showError(t('pantry_add_error_name'));
      return;
    }

    if (user?._id) {
      // Must await this so logActivity sees the new item!
      await addPantryItem({
        userId: user._id as Id<'users'>,
        name: newItemName.trim(),
        displayName: newItemName.trim(),
        measure: newItemMeasure.trim() || t('common_as_needed'),
      });

      // Log Activity
      console.log('[PANTRY] Triggering logActivity for pantry_add');
      await logActivity({
        actionType: 'pantry_add',
        token: token || undefined,
      }).catch((e) => console.error('[PANTRY] logActivity failed:', e));
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

  const handleToggleItem = async (item: PantryItem) => {
    haptics.selection();
    await togglePantryItemChecked({ itemId: item.id as Id<'pantry'> });
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
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
        }}
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
              <GlassButton
                shadowRadius={2}
                size="small"
                icon="camera"
                label={t('pantry_scan_button')}
                onPress={() => {
                  haptics.medium();
                  router.push('/scan');
                }}
                backgroundColor={colors.tint}
                backgroundOpacity={0.15}
                textColor={colors.tint}
              />

              <GlassButton
                shadowRadius={2}
                size="small"
                icon="trash-alt"
                label={t('pantry_clear_all_button')}
                onPress={handleClearAll}
                backgroundColor={colors.error}
                backgroundOpacity={0.15}
                textColor={colors.error}
              />
            </View>
          )}
        </View>
      </View>

      {/* Add Item Button/Input */}
      <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
        {items.length > 0 && !showAddInput && (
          <View style={{ marginBottom: 12 }}>
            <GlassButton
              shadowRadius={2}
              size="large"
              icon="magic"
              label={t('pantry_generate_recipe_button')}
              onPress={() => {
                haptics.medium();
                router.push('/generator');
              }}
              backgroundColor={colors.tint}
              textColor="white"
            />
          </View>
        )}

        {!showAddInput ? (
          <GlassButton
            shadowRadius={2}
            size="medium"
            icon="plus"
            label={t('pantry_add_item_button')}
            onPress={() => {
              haptics.light();
              setShowAddInput(true);
            }}
            backgroundColor={colors.tint}
            textColor="white"
          />
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
              <View style={{ flex: 1 }}>
                <GlassButton
                  shadowRadius={2}
                  size="small"
                  label={t('pantry_cancel_button')}
                  onPress={() => {
                    haptics.light();
                    setShowAddInput(false);
                    setNewItemName('');
                    setNewItemMeasure('');
                  }}
                  backgroundColor={colors.text}
                  backgroundOpacity={0.1}
                  textColor={colors.text}
                />
              </View>
              <View style={{ flex: 1 }}>
                <GlassButton
                  shadowRadius={2}
                  size="small"
                  label={t('pantry_add_button')}
                  onPress={handleAddItem}
                  backgroundColor={colors.tint}
                  textColor="white"
                />
              </View>
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
            actionLabel={t('pantry_scan_button')}
            onAction={() => {
              haptics.medium();
              // @ts-ignore
              router.push('/scan');
            }}
          />
        ) : (
          <FlatList
            data={sortedItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: bottomPadding,
              marginTop: 12,
            }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <PantryItemCard
                item={item}
                index={index}
                onToggle={() => handleToggleItem(item)}
                onDelete={() => handleDeleteItem(item)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
