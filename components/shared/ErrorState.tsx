import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { YStack, Heading, Paragraph, useTheme, Button } from 'tamagui';
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
  const theme = useTheme();
  const { t } = useLanguage();

  const finalTitle = title || t('shared_error_title');
  const finalRetryText = retryText || t('shared_retry');

  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      paddingHorizontal="$6"
      backgroundColor="$background"
      space="$4"
    >
      <FontAwesome5
        name={icon}
        size={48}
        color={theme.red10?.val || '#ef4444'}
      />

      <YStack space="$2" alignItems="center">
        <Heading size="$6" color="$red10" textAlign="center">
          {finalTitle}
        </Heading>
        <Paragraph size="$4" color="$color" opacity={0.8} textAlign="center">
          {message}
        </Paragraph>
      </YStack>

      {onRetry && (
        <Button
          onPress={onRetry}
          backgroundColor="$tint"
          color="white"
          size="$4"
          borderRadius="$4"
          pressStyle={{ opacity: 0.8 }}
        >
          {finalRetryText}
        </Button>
      )}
    </YStack>
  );
};
