import React from 'react';
import { Modal, Platform, Pressable } from 'react-native';
import { YStack, XStack, Button, Heading, ScrollView, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { GlassCard } from '@/components/ui/GlassCard';

interface PlannerHistoryModalProps {
  visible: boolean;
  onClose: () => void;
  mealPlanHistory: any[];
  onLoadPlan: (plan: any) => void;
  colors: any;
  t: (key: any) => string;
}

export const PlannerHistoryModal = ({
  visible,
  onClose,
  mealPlanHistory,
  onLoadPlan,
  colors,
  t,
}: PlannerHistoryModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <YStack flex={1} backgroundColor="$background">
        <YStack height={Platform.OS === 'ios' ? 44 : 0} />
        {/* Header */}
        <XStack
          padding="$4"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Heading fontSize="$5" fontWeight="700">
            {t('planner_history')}
          </Heading>
          <Button
            size="$3"
            chromeless
            onPress={onClose}
            icon={<FontAwesome5 name="times" size={16} color={colors.text} />}
          />
        </XStack>

        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {mealPlanHistory?.map((plan: any) => (
            <Pressable
              key={plan._id}
              onPress={() => onLoadPlan(plan)}
              style={({ pressed }) => ({
                marginBottom: 12,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
            >
              <GlassCard contentContainerStyle={{ padding: 16 }}>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack>
                    <Text fontWeight="600" fontSize="$4">
                      {new Date(plan._creationTime).toLocaleDateString()}
                    </Text>
                    <Text fontSize="$3" opacity={0.6}>
                      {plan.type === 'baby'
                        ? t('planner_baby_plan')
                        : t('planner_standard_plan')}
                    </Text>
                  </YStack>
                  <FontAwesome5
                    name="chevron-right"
                    size={14}
                    color={colors.text}
                  />
                </XStack>
              </GlassCard>
            </Pressable>
          ))}
          {(!mealPlanHistory || mealPlanHistory.length === 0) && (
            <Text textAlign="center" opacity={0.5} marginTop="$10">
              {t('planner_history_empty')}
            </Text>
          )}
        </ScrollView>
      </YStack>
    </Modal>
  );
};
