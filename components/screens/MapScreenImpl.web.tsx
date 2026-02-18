import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'tamagui';
import { useLanguage } from '@/context/LanguageContext';

export default function MapScreen() {
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.bg?.val || '#ffffff',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        },
      ]}
    >
      <Text
        style={{
          color: theme.color?.val || '#000000',
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 10,
          textAlign: 'center',
        }}
      >
        Map View
      </Text>
      <Text
        style={{
          color: theme.color?.val || '#000000',
          fontSize: 16,
          textAlign: 'center',
          opacity: 0.7,
        }}
      >
        The interactive map is currently optimized for mobile devices
        (iOS/Android).
      </Text>
      <Text
        style={{
          marginTop: 20,
          color: '#888',
          fontSize: 14,
        }}
      >
        (react-native-maps is not supported on web in this configuration)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
