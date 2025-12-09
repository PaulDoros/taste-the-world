import { useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'tamagui';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  useRecipeHistoryStore,
  RecipeHistoryItem,
} from '@/store/recipeHistoryStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { haptics } from '@/utils/haptics';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { HistoryItemCard } from '@/components/HistoryItemCard';
import { useLanguage } from '@/context/LanguageContext';

export default function HistoryScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { confirmDelete, confirmClear } = useAlertDialog();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');

  const history = useRecipeHistoryStore((state) => state.history);
  const clearHistory = useRecipeHistoryStore((state) => state.clearHistory);
  const removeFromHistory = useRecipeHistoryStore(
    (state) => state.removeFromHistory
  );

  const favorites = useFavoritesStore((state) => state.favorites);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const displayItems = activeTab === 'recent' ? history : favorites;

  const handleClearAll = () => {
    const title =
      activeTab === 'recent'
        ? t('history_confirm_clear_recent')
        : t('history_confirm_clear_favorites');
    const count = displayItems.length;

    confirmClear(title, count, () => {
      if (activeTab === 'recent') {
        clearHistory();
      } else {
        clearFavorites();
      }
    });
  };

  const handleRemoveItem = (item: RecipeHistoryItem) => {
    confirmDelete(item.name, () => {
      if (activeTab === 'recent') {
        removeFromHistory(item.id);
      } else {
        removeFavorite(item.id);
      }
    });
  };

  const handleNavigateToRecipe = (recipeId: string) => {
    haptics.light();
    router.push(`/recipe/${recipeId}`);
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return t('history_time_just_now');
    if (seconds < 3600)
      return t('history_time_m_ago', { count: Math.floor(seconds / 60) });
    if (seconds < 86400)
      return t('history_time_h_ago', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800)
      return t('history_time_d_ago', { count: Math.floor(seconds / 86400) });
    return t('history_time_w_ago', { count: Math.floor(seconds / 604800) });
  };

  const bottomPadding = insets.bottom + 100;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['top', 'left', 'right']}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 0 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.text,
                fontSize: 32,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              {t('history_title')}
            </Text>
            <Text style={{ color: colors.text, fontSize: 15, opacity: 0.6 }}>
              {displayItems.length === 1
                ? t('history_item_count', { count: displayItems.length })
                : t('history_item_count_plural', {
                    count: displayItems.length,
                  })}
            </Text>
          </View>

          {/* Clear All Button */}
          {displayItems.length > 0 && (
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
                {t('history_clear_all')}
              </Text>
            </Pressable>
          )}
        </View>

        {/* Tab Switcher */}
        <View
          style={{
            flexDirection: 'row',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab('recent');
            }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor:
                activeTab === 'recent' ? colors.tint : `${colors.text}10`,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5
              name="history"
              size={14}
              color={activeTab === 'recent' ? 'white' : colors.text}
            />
            <Text
              style={{
                color: activeTab === 'recent' ? 'white' : colors.text,
                fontSize: 15,
                fontWeight: '600',
              }}
            >
              {t('history_tab_recent')}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              haptics.light();
              setActiveTab('favorites');
            }}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor:
                activeTab === 'favorites' ? '#ec4899' : `${colors.text}10`,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              gap: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <FontAwesome5
              name="heart"
              size={14}
              color={activeTab === 'favorites' ? 'white' : colors.text}
              solid={activeTab === 'favorites'}
            />
            <Text
              style={{
                color: activeTab === 'favorites' ? 'white' : colors.text,
                fontSize: 15,
                fontWeight: '600',
              }}
            >
              {t('history_tab_favorites')}
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
            />
          )}
        />
      ) : (
        <EmptyState
          icon={activeTab === 'recent' ? 'history' : 'heart'}
          title={
            activeTab === 'recent'
              ? t('history_empty_recent_title')
              : t('history_empty_favorites_title')
          }
          description={
            activeTab === 'recent'
              ? t('history_empty_recent_desc')
              : t('history_empty_favorites_desc')
          }
        />
      )}
    </SafeAreaView>
  );
}
