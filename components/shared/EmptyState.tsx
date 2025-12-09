import { YStack, Text, Button } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/Colors';

export interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  accentColor?: string;
}

/**
 * Reusable EmptyState component for displaying when lists/data are empty
 * Used across multiple screens (favorites, history, shopping-list, etc.)
 */
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  accentColor = Colors.light.tint,
}: EmptyStateProps) {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}
    >
      <YStack alignItems="center" gap="$4" maxWidth={300}>
        <FontAwesome5
          name={icon}
          size={64}
          color={accentColor}
          style={{ opacity: 0.3 }}
          solid
        />

        <YStack alignItems="center" gap="$2">
          <Text
            fontSize="$7"
            fontWeight="700"
            textAlign="center"
            color="$color"
          >
            {title}
          </Text>

          <Text
            fontSize="$4"
            opacity={0.6}
            textAlign="center"
            color="$color"
            lineHeight={22}
          >
            {description}
          </Text>
        </YStack>

        {actionLabel && onAction && (
          <Button
            size="$4"
            backgroundColor={accentColor}
            color="white"
            onPress={onAction}
            marginTop="$2"
            pressStyle={{ scale: 0.97, opacity: 0.9 }}
            borderRadius="$4"
          >
            <Text color="white" fontWeight="600">
              {actionLabel}
            </Text>
          </Button>
        )}
      </YStack>
    </Animated.View>
  );
}
