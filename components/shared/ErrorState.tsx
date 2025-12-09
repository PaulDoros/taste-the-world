import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from 'tamagui';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

import { useLanguage } from '@/context/LanguageContext';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  icon?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  onRetry,
  retryText,
  icon = 'exclamation-circle',
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const theme = useTheme();
  const { t } = useLanguage();

  const finalTitle = title || t('shared_error_title');
  const finalRetryText = retryText || t('shared_retry');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FontAwesome5
        name={icon}
        size={48}
        color={colors.error}
        style={styles.icon}
      />
      <Text style={[styles.title, { color: colors.error }]}>{finalTitle}</Text>
      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            {
              backgroundColor: colors.tint,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.buttonText}>{finalRetryText}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
