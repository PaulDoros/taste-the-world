import { YStack, XStack, Text, Card } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export interface Benefit {
  icon: string;
  title: string;
  description: string;
}

interface BenefitsGridProps {
  title?: string;
  benefits: Benefit[];
  accentColor?: string;
  layout?: 'grid' | 'list';
}

export const BenefitsGrid = ({
  title = "What's Included",
  benefits,
  accentColor,
  layout = 'grid',
}: BenefitsGridProps) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const finalAccentColor = accentColor || colors.tint;
  const isGrid = layout === 'grid';

  return (
    <YStack gap="$3">
      {title && (
        <Text
          fontSize="$4"
          fontWeight="700"
          marginLeft="$2"
          opacity={0.7}
          textTransform="uppercase"
          letterSpacing={1}
        >
          {title}
        </Text>
      )}

      {isGrid ? (
        // Grid Layout - 2 columns
        <XStack flexWrap="wrap" gap="$2">
          {benefits.map((benefit, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(100 + index * 50).springify()}
              style={{ width: '48%' }}
            >
              <Card
                bordered
                padding="$3"
                backgroundColor="$card"
                pressStyle={{ scale: 0.98 }}
              >
                <YStack gap="$2" alignItems="center">
                  <FontAwesome5
                    name={benefit.icon}
                    size={20}
                    color={finalAccentColor}
                  />
                  <YStack alignItems="center">
                    <Text fontSize="$3" fontWeight="700" textAlign="center">
                      {benefit.title}
                    </Text>
                    <Text
                      fontSize="$2"
                      opacity={0.6}
                      textAlign="center"
                      numberOfLines={1}
                    >
                      {benefit.description}
                    </Text>
                  </YStack>
                </YStack>
              </Card>
            </Animated.View>
          ))}
        </XStack>
      ) : (
        // List Layout - Full width rows
        <YStack gap="$2">
          {benefits.map((benefit, index) => (
            <Animated.View
              key={index}
              entering={FadeInDown.delay(100 + index * 50).springify()}
            >
              <Card
                bordered
                padding="$3.5"
                backgroundColor="$card"
                pressStyle={{ scale: 0.98 }}
              >
                <XStack gap="$3.5" alignItems="center">
                  <YStack
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor="$background"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FontAwesome5
                      name={benefit.icon}
                      size={18}
                      color={finalAccentColor}
                    />
                  </YStack>
                  <YStack flex={1}>
                    <Text fontSize="$4" fontWeight="700">
                      {benefit.title}
                    </Text>
                    <Text fontSize="$3" opacity={0.7} lineHeight={18}>
                      {benefit.description}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            </Animated.View>
          ))}
        </YStack>
      )}
    </YStack>
  );
};
