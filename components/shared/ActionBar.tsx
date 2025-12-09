import { XStack, Button, Text } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export interface ActionButton {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

export interface ActionBarProps {
  actions: ActionButton[];
  columns?: number;
}

/**
 * Reusable ActionBar component for displaying action buttons
 * Used in shopping-list, history, and other screens with bulk actions
 */
export function ActionBar({ actions, columns }: ActionBarProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getButtonColor = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return colors.error;
      case 'secondary':
        return '$bg2';
      case 'primary':
      default:
        return colors.tint;
    }
  };

  const getTextColor = (variant?: string) => {
    return variant === 'secondary' ? '$color' : 'white';
  };

  return (
    <XStack
      gap="$3"
      flexWrap="wrap"
      paddingHorizontal="$4"
      paddingVertical="$3"
    >
      {actions.map((action, index) => (
        <Animated.View
          key={index}
          entering={FadeInRight.delay(index * 50).springify()}
          style={
            columns
              ? { flexBasis: `${100 / columns - 2}%`, flexGrow: 1 }
              : { flex: actions.length === 1 ? 1 : undefined }
          }
        >
          <Button
            size="$3"
            backgroundColor={getButtonColor(action.variant)}
            disabled={action.disabled}
            onPress={() => {
              haptics.light();
              action.onPress();
            }}
            icon={
              action.icon ? (
                <FontAwesome5
                  name={action.icon}
                  size={14}
                  color={getTextColor(action.variant)}
                />
              ) : undefined
            }
            pressStyle={{ scale: 0.97, opacity: 0.9 }}
            opacity={action.disabled ? 0.5 : 1}
            borderRadius="$3"
          >
            <Text
              color={getTextColor(action.variant)}
              fontWeight="600"
              fontSize="$3"
            >
              {action.label}
            </Text>
          </Button>
        </Animated.View>
      ))}
    </XStack>
  );
}
