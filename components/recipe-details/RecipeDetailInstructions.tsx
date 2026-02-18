import React from 'react';
import { View } from 'react-native';
import { YStack, XStack, Text, H4, Paragraph } from 'tamagui';
import { GlassCard } from '@/components/ui/GlassCard';

interface RecipeDetailInstructionsProps {
  instructions: string[];
  colors: any;
  t: (key: any, params?: any) => string;
}

export const RecipeDetailInstructions = ({
  instructions,
  colors,
  t,
}: RecipeDetailInstructionsProps) => {
  return (
    <YStack gap="$3">
      <H4 color={colors.text} fontWeight="bold" paddingHorizontal="$2">
        {t('recipe_instructions_title')}
      </H4>
      <GlassCard
        style={{
          padding: 0,
          borderWidth: 1,
          borderColor: `${colors.tint}20`,
        }}
        intensity={15}
        borderRadius={16}
      >
        <YStack padding="$4" gap="$4">
          {instructions.map((step, i) => (
            <XStack
              key={i}
              gap="$3"
              paddingBottom={i < instructions.length - 1 ? '$4' : 0}
              borderBottomWidth={i < instructions.length - 1 ? 1 : 0}
              borderColor="$borderColor"
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: colors.tint,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 2,
                }}
              >
                <Text color="white" fontSize="$3" fontWeight="bold">
                  {i + 1}
                </Text>
              </View>
              <Paragraph
                flex={1}
                color={colors.text}
                fontSize="$3"
                lineHeight={22}
                opacity={0.9}
              >
                {step}
              </Paragraph>
            </XStack>
          ))}
        </YStack>
      </GlassCard>
    </YStack>
  );
};
