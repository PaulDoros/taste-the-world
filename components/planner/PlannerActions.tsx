import React from 'react';
import { ActivityIndicator } from 'react-native';
import { XStack, Button, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';

interface PlannerActionsProps {
  onAddToCalendar: () => void;
  onAddWeekToList: () => void;
  isGeneratingList: boolean;
  colors: any;
  t: (key: any) => string;
}

export const PlannerActions = ({
  onAddToCalendar,
  onAddWeekToList,
  isGeneratingList,
  colors,
  t,
}: PlannerActionsProps) => {
  return (
    <XStack gap="$3" marginTop="$6" marginBottom="$4">
      <Button
        flex={1}
        size="$4"
        backgroundColor="$background"
        borderColor="$borderColor"
        borderWidth={1}
        onPress={onAddToCalendar}
        icon={
          <FontAwesome5 name="calendar-check" size={16} color={colors.text} />
        }
      >
        <Text fontWeight="600">{t('planner_sync_calendar')}</Text>
      </Button>
      <Button
        flex={1}
        size="$4"
        backgroundColor={colors.tint}
        onPress={onAddWeekToList}
        disabled={isGeneratingList}
        icon={
          isGeneratingList ? (
            <ActivityIndicator color="white" />
          ) : (
            <FontAwesome5 name="shopping-basket" size={16} color="white" />
          )
        }
      >
        <Text color="white" fontWeight="600">
          {t('planner_shop_ingredients')}
        </Text>
      </Button>
    </XStack>
  );
};
