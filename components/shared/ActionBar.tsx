import { XStack } from 'tamagui';
import { GlassButton } from '@/components/ui/GlassButton';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { haptics } from '@/utils/haptics';
import { useTheme } from 'tamagui';

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
  const theme = useTheme();

  const getButtonProps = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return {
          backgroundColor: theme.red10?.get(),
          textColor: 'white',
          backgroundOpacity: 0.8,
        };
      case 'secondary':
        return {
          backgroundColor: theme.tint?.get(),
          textColor: theme.tint?.get(),
          backgroundOpacity: 0.1,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.tint?.get(),
          textColor: 'white',
          backgroundOpacity: 1,
        };
    }
  };

  return (
    <XStack
      gap="$3"
      flexWrap="wrap"
      paddingHorizontal="$4"
      paddingVertical="$3"
    >
      {actions.map((action, index) => {
        const props = getButtonProps(action.variant);
        return (
          <Animated.View
            key={index}
            entering={FadeInRight.delay(index * 50).springify()}
            style={
              columns
                ? { flexBasis: `${100 / columns - 2}%`, flexGrow: 1 }
                : { flex: actions.length === 1 ? 1 : undefined }
            }
          >
            <GlassButton
              shadowRadius={5}
              size="small"
              label={action.label}
              icon={action.icon}
              onPress={() => {
                haptics.light();
                action.onPress();
              }}
              disabled={action.disabled}
              backgroundColor={props.backgroundColor}
              backgroundOpacity={props.backgroundOpacity}
              textColor={props.textColor}
            />
          </Animated.View>
        );
      })}
    </XStack>
  );
}
