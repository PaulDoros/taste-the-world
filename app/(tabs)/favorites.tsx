import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'tamagui';
import { EmptyState } from '@/components/shared/EmptyState';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useLanguage } from '@/context/LanguageContext';

/**
 * Favorites Screen
 * Placeholder for future implementation
 */
export default function FavoritesScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1">
        <EmptyState
          icon="heart"
          title={t('favorites_title')}
          description={t('favorites_empty')}
        />
      </View>
    </SafeAreaView>
  );
}
