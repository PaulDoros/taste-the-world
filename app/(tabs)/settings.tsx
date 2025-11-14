import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

/**
 * Settings Screen
 * Placeholder for future implementation
 */
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="flex-1 items-center justify-center px-6">
        <FontAwesome5
          name="user-circle"
          size={64}
          color={colors.tint}
          style={{ opacity: 0.3, marginBottom: 24 }}
          solid
        />
        <Text
          style={{
            color: colors.text,
            fontSize: 24,
            fontWeight: '700',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          Settings & Profile
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 16,
            opacity: 0.6,
            textAlign: 'center',
          }}
        >
          Coming Soon! ⚙️
        </Text>
        <Text
          style={{
            color: colors.text,
            fontSize: 14,
            opacity: 0.5,
            textAlign: 'center',
            marginTop: 12,
          }}
        >
          Manage your profile, preferences, and upgrade to Premium
        </Text>
      </View>
    </SafeAreaView>
  );
}
