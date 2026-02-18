import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { XStack, Text } from 'tamagui';
import { GlassButton } from '@/components/ui/GlassButton';

interface RecipeBookHeaderProps {
  onBack: () => void;
  onAdd: () => void;
  colors: any;
  title: string;
}

export const RecipeBookHeader = ({
  onBack,
  onAdd,
  colors,
  title,
}: RecipeBookHeaderProps) => {
  const { t } = useLanguage();
  return (
    <XStack
      justifyContent="space-between"
      alignItems="center"
      marginBottom="$4"
    >
      <XStack gap="$3" alignItems="center">
        <GlassButton
          shadowRadius={2}
          size="small"
          backgroundColor="transparent"
          icon="arrow-left"
          textColor={colors.text}
          onPress={onBack}
        />
        <Text fontSize="$6" fontWeight="bold" color={colors.text}>
          {title}
        </Text>
      </XStack>
      <GlassButton
        shadowRadius={2}
        size="small"
        backgroundColor={colors.tint}
        textColor="white"
        icon="plus"
        label={t('common_add')}
        onPress={onAdd}
      />
    </XStack>
  );
};
