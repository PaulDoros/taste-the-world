import { YStack } from 'tamagui';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export interface IconBadgeProps {
  icon: string;
  size?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  padding?: number;
  solid?: boolean;
}

/**
 * Reusable IconBadge component for displaying icons with background containers
 * Used for app icons, feature icons, status indicators, etc.
 */
export function IconBadge({
  icon,
  size = 20,
  color = 'white',
  backgroundColor,
  borderRadius = 20,
  padding = 10,
  solid = false,
}: IconBadgeProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const finalBackgroundColor = backgroundColor || colors.tint;

  return (
    <YStack
      width={size + padding * 2}
      height={size + padding * 2}
      borderRadius={borderRadius}
      backgroundColor={finalBackgroundColor}
      alignItems="center"
      justifyContent="center"
      shadowColor={finalBackgroundColor}
      shadowOffset={{ width: 0, height: 4 }}
      shadowOpacity={0.3}
      shadowRadius={8}
      elevation={5}
    >
      <FontAwesome5 name={icon} size={size} color={color} solid={solid} />
    </YStack>
  );
}
