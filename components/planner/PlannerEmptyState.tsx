import React from 'react';
import { View } from 'react-native';
import { YStack, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';

interface PlannerEmptyStateProps {
  colors: any;
  t: (key: any) => string;
}

export const PlannerEmptyState = ({ colors, t }: PlannerEmptyStateProps) => {
  return (
    <YStack
      padding="$8"
      alignItems="center"
      opacity={0.6}
      gap="$4"
      marginTop="$6"
    >
      <View
        style={{
          marginBottom: 10,
          padding: 20,
          backgroundColor: `${colors.tint}10`,
          borderRadius: 100,
        }}
      >
        <FontAwesome5 name="calendar-plus" size={40} color={colors.tint} />
      </View>
      <Text fontSize="$5" fontWeight="600" textAlign="center">
        {t('planner_empty_title')}
      </Text>
      <Text
        fontSize="$3"
        textAlign="center"
        opacity={0.7}
        paddingHorizontal="$4"
      >
        {t('planner_empty_text')}
      </Text>
    </YStack>
  );
};
